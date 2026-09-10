import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push,
  query,
  orderByChild,
  equalTo,
  limitToLast,
  Unsubscribe,
} from 'firebase/database';
import { rtdb } from './firebase';
import { CallSession, CallHistoryItem, CallType, CallStatus, User } from '../types';

// Paths in Firebase Realtime Database
const CALLS_PATH = 'calls';
const CANDIDATES_PATH = 'callCandidates';
const CALL_HISTORY_PATH = 'callHistory';

// WebRTC Configuration
export function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
  ];

  // Optional TURN Server from secure environment variables
  const env = (import.meta as any).env || {};
  const turnUrl = env.VITE_TURN_URL;
  const turnUsername = env.VITE_TURN_USERNAME;
  const turnCredential = env.VITE_TURN_CREDENTIAL;

  if (turnUrl) {
    const turnConfig: RTCIceServer = {
      urls: turnUrl,
    };
    if (turnUsername) turnConfig.username = turnUsername;
    if (turnCredential) turnConfig.credential = turnCredential;
    servers.push(turnConfig);
  }

  return servers;
}

// Built-in Web Audio API Ringtone & Call Chimes (No external audio file needed)
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isRinging: boolean = false;
  private ringTimer: any = null;

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Play outgoing ringing tone (gentle European/US style ring)
  startOutgoingRingtone() {
    this.stopRingtone();
    this.isRinging = true;

    const playTone = () => {
      if (!this.isRinging) return;
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.35);
        osc2.stop(now + 1.35);
      } catch (err) {
        console.warn('Audio ringtone tone error:', err);
      }
    };

    playTone();
    this.ringTimer = setInterval(playTone, 3200);
  }

  // Play incoming melodic chime
  startIncomingRingtone() {
    this.stopRingtone();
    this.isRinging = true;

    const playChime = () => {
      if (!this.isRinging) return;
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const startTime = ctx.currentTime + idx * 0.16;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.4);
        });
      } catch (err) {
        console.warn('Incoming chime error:', err);
      }
    };

    playChime();
    this.ringTimer = setInterval(playChime, 2400);
  }

  // Play call end chime
  playEndChime() {
    this.stopRingtone();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignored if browser blocks audio
    }
  }

  stopRingtone() {
    this.isRinging = false;
    if (this.ringTimer) {
      clearInterval(this.ringTimer);
      this.ringTimer = null;
    }
  }
}

export const soundFx = new SoundSynthesizer();

// Clean Helper for RTDB Objects
function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitizePayload(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean as T;
}

export const webrtcService = {
  // Get User Media Stream with clear error mapping
  async getUserMedia(type: CallType): Promise<{ stream: MediaStream | null; error: string | null }> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          stream: null,
          error: 'Your browser or environment does not support camera/microphone media capture.',
        };
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          type === 'video'
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user',
              }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return { stream, error: null };
    } catch (err: any) {
      let message = 'Unable to access media devices.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message =
          type === 'video'
            ? 'Camera or Microphone permission was denied. Please allow access in browser settings.'
            : 'Microphone permission was denied. Please allow microphone access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message =
          type === 'video'
            ? 'No camera or microphone detected on this device.'
            : 'No microphone detected on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera or microphone is already in use by another tab or program.';
      } else if (err.message) {
        message = err.message;
      }
      return { stream: null, error: message };
    }
  },

  // Create a new Call session in Firebase RTDB
  async createCall(
    caller: User,
    receiver: User,
    callType: CallType
  ): Promise<string> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const session: CallSession = {
      callId,
      callerUid: caller.id,
      receiverUid: receiver.id,
      callerName: caller.fullName || caller.name || 'Caller',
      callerAvatar:
        caller.avatar ||
        caller.profileImage ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      receiverName: receiver.fullName || receiver.name || 'User',
      receiverAvatar:
        receiver.avatar ||
        receiver.profileImage ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      callType,
      status: 'ringing',
      createdAt: now,
    };

    const callRef = ref(rtdb, `${CALLS_PATH}/${callId}`);
    await set(callRef, sanitizePayload(session));

    // Also record an initial entry in caller and receiver callHistory
    const historyItem: CallHistoryItem = {
      callId,
      callerUid: caller.id,
      callerName: session.callerName,
      callerAvatar: session.callerAvatar,
      receiverUid: receiver.id,
      receiverName: session.receiverName,
      receiverAvatar: session.receiverAvatar,
      callType,
      status: 'ringing',
      duration: 0,
      createdAt: now,
    };

    await set(ref(rtdb, `${CALL_HISTORY_PATH}/${caller.id}/${callId}`), sanitizePayload(historyItem)).catch(() => {});
    await set(ref(rtdb, `${CALL_HISTORY_PATH}/${receiver.id}/${callId}`), sanitizePayload(historyItem)).catch(() => {});

    return callId;
  },

  // Update Call Offer SDP
  async setCallOffer(callId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const callRef = ref(rtdb, `${CALLS_PATH}/${callId}`);
    await update(callRef, {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });
  },

  // Update Call Answer SDP
  async setCallAnswer(callId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const callRef = ref(rtdb, `${CALLS_PATH}/${callId}`);
    await update(callRef, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    });
  },

  // Update Call Status
  async updateCallStatus(
    callId: string,
    status: CallStatus,
    duration: number = 0
  ): Promise<void> {
    try {
      const callRef = ref(rtdb, `${CALLS_PATH}/${callId}`);
      const snapshot = await get(callRef);
      if (!snapshot.exists()) return;

      const current = snapshot.val() as CallSession;
      const now = new Date().toISOString();

      const updates: Record<string, any> = {
        status,
        duration,
        endedAt: now,
      };

      await update(callRef, updates);

      // Update call history for both parties
      const historyUpdate = {
        status,
        duration,
        endedAt: now,
      };

      if (current.callerUid) {
        await update(ref(rtdb, `${CALL_HISTORY_PATH}/${current.callerUid}/${callId}`), historyUpdate).catch(() => {});
      }
      if (current.receiverUid) {
        await update(ref(rtdb, `${CALL_HISTORY_PATH}/${current.receiverUid}/${callId}`), historyUpdate).catch(() => {});
      }
    } catch (err) {
      console.warn('updateCallStatus error:', err);
    }
  },

  // Push ICE Candidate
  async addIceCandidate(
    callId: string,
    role: 'caller' | 'receiver',
    candidate: RTCIceCandidate
  ): Promise<void> {
    try {
      const candidatesRef = ref(rtdb, `${CANDIDATES_PATH}/${callId}/${role}`);
      const newCandRef = push(candidatesRef);
      await set(newCandRef, candidate.toJSON());
    } catch (err) {
      console.warn('addIceCandidate error:', err);
    }
  },

  // Listen to Call Document in RTDB
  subscribeCall(callId: string, callback: (session: CallSession | null) => void): Unsubscribe {
    const callRef = ref(rtdb, `${CALLS_PATH}/${callId}`);
    return onValue(
      callRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() as CallSession);
        } else {
          callback(null);
        }
      },
      (err) => {
        console.warn('subscribeCall error:', err);
      }
    );
  },

  // Listen for Incoming Calls directed to the current authenticated user
  subscribeIncomingCalls(
    currentUid: string,
    callback: (session: CallSession | null) => void
  ): Unsubscribe {
    const callsRef = ref(rtdb, CALLS_PATH);
    return onValue(
      callsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Find any active ringing call targeting currentUid
          const callsList: CallSession[] = Object.keys(data).map((k) => data[k]);
          const incoming = callsList
            .filter(
              (c) =>
                c.receiverUid === currentUid &&
                c.status === 'ringing' &&
                // Ignore calls older than 60 seconds to prevent stale ringing
                Date.now() - new Date(c.createdAt).getTime() < 65000
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          if (incoming.length > 0) {
            callback(incoming[0]);
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      },
      (err) => {
        console.warn('subscribeIncomingCalls error:', err);
      }
    );
  },

  // Listen for ICE Candidates from Peer
  subscribeIceCandidates(
    callId: string,
    role: 'caller' | 'receiver',
    callback: (candidate: RTCIceCandidateInit) => void
  ): Unsubscribe {
    const candidatesRef = ref(rtdb, `${CANDIDATES_PATH}/${callId}/${role}`);
    return onValue(
      candidatesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            const cand = data[key];
            if (cand && (cand.candidate || cand.sdpMid !== undefined)) {
              callback(cand);
            }
          });
        }
      },
      (err) => {
        console.warn('subscribeIceCandidates error:', err);
      }
    );
  },

  // Listen to Call History for a specific user
  subscribeCallHistory(
    uid: string,
    callback: (history: CallHistoryItem[]) => void
  ): Unsubscribe {
    const histRef = query(ref(rtdb, `${CALL_HISTORY_PATH}/${uid}`), limitToLast(50));
    return onValue(
      histRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: CallHistoryItem[] = Object.keys(data).map((k) => ({
            ...data[k],
            id: k,
          }));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('subscribeCallHistory error:', err);
      }
    );
  },

  // Clean up candidates when call ends
  async cleanupCallCandidates(callId: string): Promise<void> {
    try {
      const cRef = ref(rtdb, `${CANDIDATES_PATH}/${callId}`);
      await remove(cRef);
    } catch {
      // Non-blocking cleanup
    }
  },
};

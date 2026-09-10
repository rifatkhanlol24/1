import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  AlertCircle,
  Clock,
  History,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { User, CallSession, CallType, CallStatus, CallHistoryItem } from '../types';
import { webrtcService, soundFx, getIceServers } from '../lib/webrtcService';

interface CallModalProps {
  activeCall: {
    callId: string;
    type: CallType;
    role: 'caller' | 'receiver';
    otherUser: User;
    session: CallSession;
  } | null;
  incomingCall: CallSession | null;
  onAcceptIncoming: () => void;
  onRejectIncoming: () => void;
  onEndCall: () => void;
  lang: 'bn' | 'en';
  callHistory?: CallHistoryItem[];
}

export const CallModal: React.FC<CallModalProps> = ({
  activeCall,
  incomingCall,
  onAcceptIncoming,
  onRejectIncoming,
  onEndCall,
  lang,
  callHistory = [],
}) => {
  // If neither an active call nor an incoming call exists, don't render
  if (!activeCall && !incomingCall) return null;

  // Local media & WebRTC states
  const [connectionStatus, setConnectionStatus] = useState<
    'initiating' | 'ringing' | 'connecting' | 'connected' | 'reconnecting' | 'ended' | 'rejected' | 'missed'
  >(incomingCall ? 'ringing' : 'initiating');
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(
    (activeCall?.type || incomingCall?.callType) === 'video'
  );
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Video element references
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // WebRTC internal refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<any>(null);
  const hasAnsweredRef = useRef<boolean>(false);
  const isCleanedUpRef = useRef<boolean>(false);

  // Current session details
  const isIncomingScreen = !activeCall && !!incomingCall;
  const currentType: CallType = activeCall?.type || incomingCall?.callType || 'audio';
  const otherUser: User | { fullName: string; username?: string; avatar: string; id: string } =
    activeCall?.otherUser || {
      id: incomingCall?.callerUid || '',
      fullName: incomingCall?.callerName || 'Caller',
      username: '',
      avatar:
        incomingCall?.callerAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    };

  // Helper to format call duration mm:ss or hh:mm:ss
  const formatDuration = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // 1. Duration counter when connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [connectionStatus]);

  // 2. Teardown helper
  const cleanUpMediaAndConnection = () => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;

    soundFx.stopRingtone();

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  // 3. WebRTC lifecycle for Active Call
  useEffect(() => {
    if (!activeCall) return;

    isCleanedUpRef.current = false;
    hasAnsweredRef.current = false;
    setConnectionStatus(activeCall.role === 'caller' ? 'ringing' : 'connecting');

    let unsubCall: (() => void) | null = null;
    let unsubCandidates: (() => void) | null = null;

    const setupWebRTC = async () => {
      try {
        // Step A: Request local audio/video media
        const { stream, error } = await webrtcService.getUserMedia(activeCall.type);
        if (error || !stream) {
          setMediaError(error || 'Microphone or camera permission denied.');
        } else {
          localStreamRef.current = stream;
          if (localVideoRef.current && activeCall.type === 'video') {
            localVideoRef.current.srcObject = stream;
          }
        }

        // Step B: Create RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: getIceServers(),
          iceCandidatePoolSize: 5,
        });
        peerConnectionRef.current = pc;

        // Step C: Add local stream tracks to Peer Connection
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current!);
          });
        }

        // Step D: Handle remote tracks
        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;

        pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
          if (remoteVideoRef.current && activeCall.type === 'video') {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(() => {});
          }
          setConnectionStatus('connected');
          soundFx.stopRingtone();
        };

        // Step E: Push local ICE Candidates to RTDB
        pc.onicecandidate = (event) => {
          if (event.candidate && activeCall) {
            webrtcService.addIceCandidate(activeCall.callId, activeCall.role, event.candidate);
          }
        };

        // Step F: Monitor Connection States
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setConnectionStatus('connected');
            soundFx.stopRingtone();
          } else if (pc.iceConnectionState === 'disconnected') {
            setConnectionStatus('reconnecting');
          } else if (pc.iceConnectionState === 'failed') {
            setConnectionStatus('reconnecting');
            pc.restartIce?.();
          }
        };

        // Step G: Listen for remote ICE candidates from peer
        const remoteRole = activeCall.role === 'caller' ? 'receiver' : 'caller';
        unsubCandidates = webrtcService.subscribeIceCandidates(
          activeCall.callId,
          remoteRole,
          async (candInit) => {
            try {
              if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candInit));
              }
            } catch (err) {
              console.warn('ICE candidate add error:', err);
            }
          }
        );

        // Step H: Caller vs Receiver signaling logic
        if (activeCall.role === 'caller') {
          soundFx.startOutgoingRingtone();

          // Create offer
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: activeCall.type === 'video',
          });
          await pc.setLocalDescription(offer);
          await webrtcService.setCallOffer(activeCall.callId, offer);

          // Subscribe to Call session changes (wait for answer or status update)
          unsubCall = webrtcService.subscribeCall(activeCall.callId, async (session) => {
            if (!session) return;

            if (session.status === 'rejected') {
              setConnectionStatus('rejected');
              soundFx.playEndChime();
              setTimeout(handleCloseCall, 1800);
            } else if (session.status === 'ended') {
              setConnectionStatus('ended');
              soundFx.playEndChime();
              setTimeout(handleCloseCall, 1200);
            } else if (session.status === 'accepted' && session.answer && !hasAnsweredRef.current) {
              hasAnsweredRef.current = true;
              soundFx.stopRingtone();
              setConnectionStatus('connected');
              if (peerConnectionRef.current && !peerConnectionRef.current.currentRemoteDescription) {
                await peerConnectionRef.current.setRemoteDescription(
                  new RTCSessionDescription(session.answer)
                );
              }
            }
          });
        } else {
          // Receiver logic: we already accepted the call
          soundFx.stopRingtone();
          setConnectionStatus('connecting');

          unsubCall = webrtcService.subscribeCall(activeCall.callId, async (session) => {
            if (!session) return;

            if (session.status === 'ended' || session.status === 'rejected') {
              setConnectionStatus('ended');
              soundFx.playEndChime();
              setTimeout(handleCloseCall, 1200);
              return;
            }

            // When Caller's offer is available, set remote description and create answer
            if (session.offer && !hasAnsweredRef.current && peerConnectionRef.current) {
              hasAnsweredRef.current = true;
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(session.offer)
              );
              const answer = await peerConnectionRef.current.createAnswer();
              await peerConnectionRef.current.setLocalDescription(answer);
              await webrtcService.setCallAnswer(activeCall.callId, answer);
              setConnectionStatus('connected');
            }
          });
        }
      } catch (err: any) {
        console.error('WebRTC initialization failed:', err);
        setMediaError(err.message || 'Call connection error occurred.');
      }
    };

    setupWebRTC();

    return () => {
      if (unsubCall) unsubCall();
      if (unsubCandidates) unsubCandidates();
      cleanUpMediaAndConnection();
    };
  }, [activeCall?.callId]);

  // Handle Close / End Call
  const handleCloseCall = () => {
    const finalDuration = duration;
    cleanUpMediaAndConnection();
    if (activeCall) {
      webrtcService.updateCallStatus(activeCall.callId, 'ended', finalDuration);
      webrtcService.cleanupCallCandidates(activeCall.callId);
    }
    onEndCall();
  };

  // Toggle Microphone
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle Speaker / Output Volume
  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerOn;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerOn;
    }
    setIsSpeakerOn(!isSpeakerOn);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="webrtc-call-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Hidden Audio Element for Remote Audio Stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div
        ref={containerRef}
        id="webrtc-call-container"
        className="w-full max-w-xl bg-neutral-900 text-white border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative aspect-[9/16] sm:aspect-[4/5] max-h-[92vh]"
      >
        {/* TOP STATUS BAR */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-5 bg-gradient-to-b from-neutral-950/90 via-neutral-950/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : connectionStatus === 'ringing'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-indigo-500 animate-pulse'
              }`}
            />
            <span className="text-xs font-semibold tracking-wide text-neutral-200 uppercase flex items-center gap-1.5">
              {currentType === 'video' ? (
                <>
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'এইচডি ভিডিও কল' : 'HD Video Call'}</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'এইচডি অডিও কল' : 'HD Audio Call'}</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Call Duration / Status Badge */}
            <div className="px-3 py-1 rounded-full bg-neutral-800/80 backdrop-blur-md border border-neutral-700/60 text-xs font-mono font-bold tracking-wider">
              {connectionStatus === 'ringing'
                ? lang === 'bn'
                  ? 'রিং হচ্ছে...'
                  : 'Ringing...'
                : connectionStatus === 'connecting' || connectionStatus === 'initiating'
                ? lang === 'bn'
                  ? 'সংযোগ স্থাপন হচ্ছে...'
                  : 'Connecting...'
                : connectionStatus === 'connected'
                ? formatDuration(duration)
                : connectionStatus === 'rejected'
                ? lang === 'bn'
                  ? 'কল বাতিল হয়েছে'
                  : 'Call Declined'
                : lang === 'bn'
                ? 'কল শেষ'
                : 'Call Ended'}
            </div>

            {/* History Toggle Button */}
            <button
              id="call-history-toggle-btn"
              onClick={() => setShowHistory(!showHistory)}
              title={lang === 'bn' ? 'কল হিস্ট্রি' : 'Call History'}
              className="p-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MEDIA ERROR BANNER */}
        {mediaError && (
          <div className="absolute top-16 inset-x-4 z-40 p-3 bg-red-900/90 border border-red-700/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-100 shadow-xl">
            <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{lang === 'bn' ? 'মিডিয়া ডিভাইস সতর্কবার্তা' : 'Media Device Warning'}</p>
              <p className="text-red-200 mt-0.5">{mediaError}</p>
            </div>
            <button
              onClick={() => setMediaError(null)}
              className="text-red-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* CALL HISTORY OVERLAY DRAWER */}
        {showHistory && (
          <div className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-md p-5 flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-neutral-100">
                  {lang === 'bn' ? 'সাম্প্রতিক কলসমূহ' : 'Recent Calls'}
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {callHistory.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  {lang === 'bn' ? 'কোনো পূর্ববর্তী কল হিস্ট্রি নেই' : 'No call history yet'}
                </div>
              ) : (
                callHistory.map((item) => (
                  <div
                    key={item.callId || item.id}
                    className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.receiverAvatar || item.callerAvatar}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                      />
                      <div>
                        <div className="font-semibold text-neutral-200">
                          {item.receiverName || item.callerName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                          {item.status === 'missed' ? (
                            <PhoneMissed className="w-3 h-3 text-red-400" />
                          ) : (
                            <PhoneIncoming className="w-3 h-3 text-emerald-400" />
                          )}
                          <span className="capitalize">{item.callType} call</span>
                          <span>•</span>
                          <span>{item.duration > 0 ? formatDuration(item.duration) : '00:00'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MAIN CALL CONTENT VIEW */}
        <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-neutral-950">
          {/* VIDEO CALL CANVAS */}
          {currentType === 'video' && connectionStatus === 'connected' ? (
            <div className="w-full h-full relative">
              {/* Remote Video (Main / Fullscreen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Picture-in-Picture Local Video (Bottom Right) */}
              <div
                id="pip-local-video"
                className="absolute bottom-24 right-4 z-30 w-28 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-neutral-900"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover -scale-x-100 ${
                    isVideoEnabled ? 'block' : 'hidden'
                  }`}
                />
                {!isVideoEnabled && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-neutral-800 text-neutral-400">
                    <VideoOff className="w-6 h-6 mb-1 text-neutral-500" />
                    <span className="text-[9px]">Camera Off</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* AUDIO CALL OR RINGING/CONNECTING CANVAS */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
              {/* Pulsing Avatar Halo */}
              <div className="relative mb-6">
                <div
                  className={`absolute -inset-4 rounded-full blur-xl opacity-60 ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : connectionStatus === 'ringing'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-indigo-500 animate-pulse'
                  }`}
                />
                <img
                  src={
                    (otherUser as User).avatar ||
                    (otherUser as any).profileImage ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={otherUser.fullName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-neutral-800 relative z-10 shadow-2xl"
                />

                {/* Status Mini Badge on Avatar */}
                <div className="absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center text-emerald-400 shadow-md">
                  {currentType === 'video' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Participant Name & Username */}
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
                {otherUser.fullName}
              </h2>
              {otherUser.username && (
                <p className="text-xs text-neutral-400 mt-1 font-mono">@{otherUser.username}</p>
              )}

              {/* Call Status Description */}
              <p className="mt-3 text-xs text-neutral-400 max-w-xs font-medium">
                {isIncomingScreen ? (
                  lang === 'bn'
                    ? `ইনকামিং ${currentType === 'video' ? 'ভিডিও' : 'অডিও'} কল আসছে...`
                    : `Incoming ${currentType} call...`
                ) : connectionStatus === 'ringing' ? (
                  lang === 'bn'
                    ? 'কল করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...'
                    : 'Calling... Waiting for answer'
                ) : connectionStatus === 'connecting' ? (
                  lang === 'bn'
                    ? 'নিরাপদ পিয়ার-টু-পিয়ার সংযোগ স্থাপন হচ্ছে...'
                    : 'Establishing secure peer-to-peer WebRTC connection...'
                ) : connectionStatus === 'connected' ? (
                  lang === 'bn'
                    ? 'নিরাপদ এইচডি অডিও কল চালু রয়েছে'
                    : 'Connected • High Quality End-to-End Encrypted'
                ) : (
                  lang === 'bn'
                    ? 'কল শেষ হয়েছে'
                    : 'Call has ended'
                )}
              </p>

              {/* Speaking waveform visualizer for connected audio call */}
              {connectionStatus === 'connected' && currentType === 'audio' && (
                <div className="flex items-center gap-1 mt-6 h-8">
                  {[40, 70, 90, 60, 100, 50, 80, 45, 85, 30].map((h, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${idx * 120}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR CONTROLS */}
        <div className="p-5 sm:p-6 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent z-30">
          {/* INCOMING CALL ACTIONS (Accept or Reject) */}
          {isIncomingScreen ? (
            <div className="flex items-center justify-around max-w-sm mx-auto">
              {/* Decline Button */}
              <button
                id="reject-call-btn"
                onClick={onRejectIncoming}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95 group-hover:scale-105">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold text-neutral-300">
                  {lang === 'bn' ? 'বাতিল করুন' : 'Decline'}
                </span>
              </button>

              {/* Accept Button */}
              <button
                id="accept-call-btn"
                onClick={onAcceptIncoming}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 group-hover:scale-105 animate-bounce">
                  {currentType === 'video' ? (
                    <Video className="w-7 h-7" />
                  ) : (
                    <Phone className="w-7 h-7" />
                  )}
                </div>
                <span className="text-xs font-semibold text-neutral-300">
                  {lang === 'bn' ? 'রিসিভ করুন' : 'Accept'}
                </span>
              </button>
            </div>
          ) : (
            /* ACTIVE / CALLING SESSION CONTROLS */
            <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
              {/* Mic Mute / Unmute */}
              <button
                id="toggle-mic-btn"
                onClick={toggleMute}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                className={`p-3.5 sm:p-4 rounded-full transition-all active:scale-95 ${
                  isMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Camera On / Off (for Video Call) */}
              {currentType === 'video' && (
                <button
                  id="toggle-camera-btn"
                  onClick={toggleCamera}
                  title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                  className={`p-3.5 sm:p-4 rounded-full transition-all active:scale-95 ${
                    !isVideoEnabled
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
                  }`}
                >
                  {!isVideoEnabled ? (
                    <VideoOff className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* End Call Button (Big Red Button) */}
              <button
                id="end-call-btn"
                onClick={handleCloseCall}
                title="End Call"
                className="p-3.5 sm:p-4 px-6 sm:px-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 font-bold text-sm shadow-xl shadow-red-600/40 transition-all active:scale-95"
              >
                <PhoneOff className="w-5 h-5" />
                <span>{lang === 'bn' ? 'কল কাটুন' : 'End Call'}</span>
              </button>

              {/* Speaker On / Off */}
              <button
                id="toggle-speaker-btn"
                onClick={toggleSpeaker}
                title={isSpeakerOn ? 'Mute Speaker' : 'Unmute Speaker'}
                className={`p-3.5 sm:p-4 rounded-full transition-all active:scale-95 ${
                  !isSpeakerOn
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
                }`}
              >
                {!isSpeakerOn ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {/* Fullscreen Toggle (for video) */}
              {currentType === 'video' && (
                <button
                  id="toggle-fullscreen-btn"
                  onClick={toggleFullscreen}
                  title="Toggle Fullscreen"
                  className="p-3.5 sm:p-4 rounded-full bg-neutral-800/90 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 transition-all active:scale-95"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

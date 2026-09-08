import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { User } from '../types';

interface CallModalProps {
  type: 'audio' | 'video';
  user: User;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const CallModal: React.FC<CallModalProps> = ({
  type,
  user,
  onClose,
  lang,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Call connection simulation
  useEffect(() => {
    const ringTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2800);

    return () => clearTimeout(ringTimer);
  }, []);

  // Duration counter when connected
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Request actual camera stream if video call
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (type === 'video' && !isVideoOff) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          setMediaStream(s);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Fallback gracefully to simulated video if camera not permitted in iframe
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [type, isVideoOff]);

  const handleEndCall = () => {
    setCallStatus('ended');
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      id="call-modal-overlay"
      className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative aspect-[9/16] sm:aspect-[4/5] max-h-[85vh]">
        {/* Top bar info */}
        <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
              {type === 'video'
                ? (lang === 'bn' ? 'এইচডি ভিডিও কল' : 'HD Video Call')
                : (lang === 'bn' ? 'এইচডি অডিও কল' : 'HD Audio Call')}
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-bold">
            {callStatus === 'ringing'
              ? (lang === 'bn' ? 'কল হচ্ছে...' : 'Ringing...')
              : callStatus === 'connected'
              ? formatTime(duration)
              : (lang === 'bn' ? 'কল শেষ' : 'Call Ended')}
          </div>
        </div>

        {/* Video / Visualizer Display */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-gradient-to-b from-indigo-950/40 via-neutral-900 to-neutral-950">
          {type === 'video' && !isVideoOff && mediaStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          ) : (
            <>
              {/* Pulsing ring animation around avatar */}
              <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur-lg animate-pulse" />
                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl relative ${callStatus === 'ringing' ? 'animate-bounce' : ''}`}>
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full rounded-full object-cover border-4 border-neutral-900"
                  />
                </div>
              </div>

              {/* Sound waves animation if connected */}
              {callStatus === 'connected' && (
                <div className="flex items-center justify-center gap-1.5 h-8 mb-4">
                  {[40, 70, 90, 60, 100, 75, 45, 80, 60, 90, 50].map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-indigo-500 to-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${height}%`,
                        animationDuration: `${0.6 + (i % 5) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* User Name & Status */}
          <div className="relative z-10 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {user.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-300 font-medium">
              @{user.username}
            </p>
            <p className="text-xs text-neutral-400">
              {callStatus === 'ringing'
                ? (lang === 'bn' ? 'সংযোগ স্থাপন করা হচ্ছে...' : 'Connecting live line...')
                : callStatus === 'connected'
                ? (lang === 'bn' ? 'নিরাপদ এন্ড-টু-এন্ড কল চালু আছে' : 'Encrypted real-time audio session')
                : (lang === 'bn' ? 'কল সমাপ্ত হয়েছে' : 'Call ended')}
            </p>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-5 sm:p-6 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-center gap-4 sm:gap-6 relative z-20">
          {/* Mute Mic Button */}
          <button
            id="call-mute-btn"
            onClick={() => setIsMuted((prev) => !prev)}
            className={`p-3.5 rounded-full transition-all ${
              isMuted
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle (if Video Call) */}
          {type === 'video' && (
            <button
              id="call-video-toggle-btn"
              onClick={() => setIsVideoOff((prev) => !prev)}
              className={`p-3.5 rounded-full transition-all ${
                isVideoOff
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Speaker Button */}
          <button
            id="call-speaker-btn"
            onClick={() => setIsSpeakerOn((prev) => !prev)}
            className={`p-3.5 rounded-full transition-all ${
              isSpeakerOn
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                : 'bg-neutral-800 text-neutral-500'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Red End Call Button */}
          <button
            id="call-end-btn"
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/40 active:scale-95 transition-all"
            title={lang === 'bn' ? 'কল শেষ করুন' : 'End Call'}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

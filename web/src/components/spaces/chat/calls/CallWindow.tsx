// Revolutionary Call Window - Immersive, Beautiful, Sophisticated
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhoneSlash,
  faExpand,
  faCompress,
  faUser,
  faWaveSquare,
  faMaximize,
  faMinimize,
  faArrowsAlt,
  faGripLines
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';
import { AudioVisualizer } from './AudioVisualizer';
import { ParticipantGrid } from './ParticipantGrid';

interface CallWindowProps {
  isInCall: boolean;
  isVideo: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: CallParticipant[];
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  roomName?: string;
}

export function CallWindow({
  isInCall,
  isVideo,
  localStream,
  remoteStreams,
  participants,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  roomName
}: CallWindowProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Call duration timer
  useEffect(() => {
    if (!isInCall) {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isInCall]);

  // Auto-hide controls
  useEffect(() => {
    if (!isFullscreen) return;

    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetTimeout();
    const handleMouseMove = () => resetTimeout();

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isInCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed inset-0 z-50 ${isFullscreen ? '' : 'p-4'}`}
      >
        {/* Glassmorphic Background with Blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-zinc-900/95 to-black/95 backdrop-blur-3xl" />

        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl"
          />
        </div>

        {/* Main Content */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-shrink-0 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Pulsing Call Indicator */}
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-green-500 rounded-full blur-xl"
                      />
                      <div className="relative w-3 h-3 bg-green-500 rounded-full" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {roomName || 'Call in Progress'}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{formatDuration(callDuration)}</span>
                        <span>•</span>
                        <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fullscreen Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreen}
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Grid / Audio Visualizer */}
          <div className="flex-1 min-h-0 px-6 pb-6">
            {isVideo ? (
              <ParticipantGrid
                localStream={localStream}
                remoteStreams={remoteStreams}
                participants={participants}
                isVideoOff={isVideoOff}
                currentUserId={participants.find(p => p.isMuted === isMuted)?.userId}
              />
            ) : (
              <AudioVisualizer
                participants={participants}
                localStream={localStream}
              />
            )}
          </div>

          {/* Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-shrink-0 p-6"
              >
                {/* Glassmorphic Control Bar */}
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />

                    {/* Control Bar */}
                    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
                      <div className="flex items-center justify-center gap-4">
                        {/* Mute Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={onToggleMute}
                          className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                            isMuted
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-white/20 hover:bg-white/30'
                          }`}
                        >
                          <div className={`absolute inset-0 rounded-2xl ${isMuted ? 'bg-red-500/50' : 'bg-white/20'} blur-xl`} />
                          <FontAwesomeIcon
                            icon={isMuted ? faMicrophoneSlash : faMicrophone}
                            className="relative text-white text-xl"
                          />
                        </motion.button>

                        {/* Video Toggle (only for video calls) */}
                        {isVideo && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleVideo}
                            className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                              isVideoOff
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-white/20 hover:bg-white/30'
                            }`}
                          >
                            <div className={`absolute inset-0 rounded-2xl ${isVideoOff ? 'bg-red-500/50' : 'bg-white/20'} blur-xl`} />
                            <FontAwesomeIcon
                              icon={isVideoOff ? faVideoSlash : faVideo}
                              className="relative text-white text-xl"
                            />
                          </motion.button>
                        )}

                        {/* End Call Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={onEndCall}
                          className="relative w-20 h-16 rounded-2xl bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
                        >
                          <div className="absolute inset-0 rounded-2xl bg-red-500/50 blur-xl" />
                          <FontAwesomeIcon icon={faPhoneSlash} className="relative text-white text-xl" />
                        </motion.button>

                        {/* Spacer */}
                        <div className="w-4" />

                        {/* PiP Button (video only) */}
                        {isVideo && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                          >
                            <FontAwesomeIcon icon={faArrowsAlt} className="text-white" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drag Handle for PiP mode */}
        {isPip && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 cursor-move">
            <FontAwesomeIcon icon={faGripLines} className="text-white/50" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

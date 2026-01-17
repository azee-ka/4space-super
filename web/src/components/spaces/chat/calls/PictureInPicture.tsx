// Picture-in-Picture Floating Window - Draggable, Resizable, Beautiful
import { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhoneSlash,
  faExpand,
  faGripVertical,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';

interface PictureInPictureProps {
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
  onExpand: () => void;
  callDuration: number;
}

export function PictureInPicture({
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
  onExpand,
  callDuration,
}: PictureInPictureProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);
  const constraintsRef = useRef(null);
  const dragControls = useDragControls();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream && isVideo && !isVideoOff) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideo, isVideoOff]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInCall) return null;

  // Show primary remote participant or local stream
  const primaryParticipant = participants.find(p => p.userId !== participants[0]?.userId) || participants[0];
  const primaryStream = primaryParticipant
    ? remoteStreams.get(primaryParticipant.userId) || localStream
    : localStream;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        right: window.innerWidth - 320,
        top: 0,
        bottom: window.innerHeight - (isMinimized ? 80 : 400),
      }}
      initial={{ opacity: 0, scale: 0.8, x: position.x, y: position.y }}
      animate={{
        opacity: 1,
        scale: 1,
        height: isMinimized ? 'auto' : '400px',
      }}
      className="fixed z-[100] w-80"
      style={{ x: position.x, y: position.y }}
    >
      {/* Glassmorphic Container */}
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-cyan-500/30 rounded-2xl blur-xl" />

        {/* Main Container */}
        <div className="relative backdrop-blur-xl bg-black/90 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 cursor-move"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
          </div>

          {!isMinimized && (
            <>
              {/* Video/Avatar Display */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
                {isVideo && !isVideoOff && primaryStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Animated Background */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-2xl"
                    />

                    {/* Avatar */}
                    {primaryParticipant?.avatar ? (
                      <img
                        src={primaryParticipant.avatar}
                        alt={primaryParticipant.displayName}
                        className="relative w-24 h-24 rounded-full object-cover border-4 border-white/20"
                      />
                    ) : (
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-white text-3xl" />
                      </div>
                    )}
                  </div>
                )}

                {/* Top Bar with Info */}
                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Pulsing Indicator */}
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                      <span className="text-white text-xs font-semibold">
                        {formatDuration(callDuration)}
                      </span>
                    </div>

                    {/* Expand Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onExpand}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={faExpand} className="text-xs" />
                    </motion.button>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-sm font-semibold truncate">
                    {primaryParticipant?.displayName || 'Call in Progress'}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="p-3 bg-black/40 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  {/* Mute Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleMute}
                    className={`flex-1 h-10 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      isMuted
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isMuted ? faMicrophoneSlash : faMicrophone}
                      className="text-sm"
                    />
                  </motion.button>

                  {/* Video Button */}
                  {isVideo && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onToggleVideo}
                      className={`flex-1 h-10 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        isVideoOff
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isVideoOff ? faVideoSlash : faVideo}
                        className="text-sm"
                      />
                    </motion.button>
                  )}

                  {/* End Call Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEndCall}
                    className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 text-white transition-all"
                  >
                    <FontAwesomeIcon icon={faPhoneSlash} className="text-sm" />
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <div>
                  <p className="text-white text-sm font-semibold">Call in Progress</p>
                  <p className="text-gray-400 text-xs">{formatDuration(callDuration)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faExpand} className="text-xs" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onEndCall}
                  className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faPhoneSlash} className="text-xs" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Minimize/Maximize Toggle */}
          {!isMinimized && (
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              <div className="w-3 h-0.5 bg-white rounded" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

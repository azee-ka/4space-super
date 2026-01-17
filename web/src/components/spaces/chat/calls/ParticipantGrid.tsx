// Advanced Participant Grid - Smart Layout with Smooth Animations
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faMicrophoneSlash,
  faVideoSlash,
  faThumbtack,
  faExpand,
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';

interface ParticipantGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: CallParticipant[];
  isVideoOff: boolean;
  currentUserId?: string;
}

export function ParticipantGrid({
  localStream,
  remoteStreams,
  participants,
  isVideoOff,
  currentUserId,
}: ParticipantGridProps) {
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);

  // Calculate optimal grid layout
  const getGridLayout = (count: number) => {
    if (count === 1) return { cols: 1, rows: 1 };
    if (count === 2) return { cols: 2, rows: 1 };
    if (count <= 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 3, rows: 2 };
    if (count <= 9) return { cols: 3, rows: 3 };
    return { cols: 4, rows: Math.ceil(count / 4) };
  };

  const totalParticipants = participants.length;
  const layout = getGridLayout(totalParticipants);

  // If someone is pinned, show them large with others in sidebar
  if (pinnedParticipant) {
    const pinned = participants.find(p => p.userId === pinnedParticipant);
    const others = participants.filter(p => p.userId !== pinnedParticipant);

    return (
      <div className="h-full flex gap-4">
        {/* Main Pinned Participant */}
        <div className="flex-1">
          {pinned && (
            <ParticipantVideo
              participant={pinned}
              stream={pinned.userId === currentUserId ? localStream : remoteStreams.get(pinned.userId)}
              isLocal={pinned.userId === currentUserId}
              isVideoOff={pinned.userId === currentUserId ? isVideoOff : pinned.isVideoOff}
              isPinned={true}
              onTogglePin={() => setPinnedParticipant(null)}
              onHover={setHoveredParticipant}
              isHovered={hoveredParticipant === pinned.userId}
              size="large"
            />
          )}
        </div>

        {/* Sidebar with Other Participants */}
        {others.length > 0 && (
          <div className="w-64 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            {others.map(participant => (
              <ParticipantVideo
                key={participant.userId}
                participant={participant}
                stream={participant.userId === currentUserId ? localStream : remoteStreams.get(participant.userId)}
                isLocal={participant.userId === currentUserId}
                isVideoOff={participant.userId === currentUserId ? isVideoOff : participant.isVideoOff}
                isPinned={false}
                onTogglePin={() => setPinnedParticipant(participant.userId)}
                onHover={setHoveredParticipant}
                isHovered={hoveredParticipant === participant.userId}
                size="small"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular grid layout
  return (
    <div
      className="h-full grid gap-4 p-4"
      style={{
        gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
        gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
      }}
    >
      <AnimatePresence mode="popLayout">
        {participants.map((participant) => (
          <ParticipantVideo
            key={participant.userId}
            participant={participant}
            stream={participant.userId === currentUserId ? localStream : remoteStreams.get(participant.userId)}
            isLocal={participant.userId === currentUserId}
            isVideoOff={participant.userId === currentUserId ? isVideoOff : participant.isVideoOff}
            isPinned={false}
            onTogglePin={() => setPinnedParticipant(participant.userId)}
            onHover={setHoveredParticipant}
            isHovered={hoveredParticipant === participant.userId}
            size="medium"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual Participant Video Component
interface ParticipantVideoProps {
  participant: CallParticipant;
  stream: MediaStream | null | undefined;
  isLocal: boolean;
  isVideoOff: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  onHover: (id: string | null) => void;
  isHovered: boolean;
  size: 'small' | 'medium' | 'large';
}

function ParticipantVideo({
  participant,
  stream,
  isLocal,
  isVideoOff,
  isPinned,
  onTogglePin,
  onHover,
  isHovered,
  size,
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && !isVideoOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  const sizeClasses = {
    small: 'h-36',
    medium: '',
    large: 'h-full',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseEnter={() => onHover(participant.userId)}
      onMouseLeave={() => onHover(null)}
      className={`relative rounded-2xl overflow-hidden group ${sizeClasses[size]}`}
    >
      {/* Video or Avatar Background */}
      {!isVideoOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
          {/* Gradient Orb Background */}
          <div className="absolute inset-0">
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
              className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-full blur-3xl"
            />
          </div>

          {/* Avatar */}
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.displayName}
              className={`relative rounded-full object-cover ${
                size === 'large' ? 'w-48 h-48' : size === 'medium' ? 'w-32 h-32' : 'w-20 h-20'
              }`}
            />
          ) : (
            <div
              className={`relative rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center ${
                size === 'large' ? 'w-48 h-48' : size === 'medium' ? 'w-32 h-32' : 'w-20 h-20'
              }`}
            >
              <FontAwesomeIcon
                icon={faUser}
                className={`text-white ${
                  size === 'large' ? 'text-7xl' : size === 'medium' ? 'text-5xl' : 'text-3xl'
                }`}
              />
            </div>
          )}
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Video Off Indicator */}
      {isVideoOff && (
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center">
          <FontAwesomeIcon icon={faVideoSlash} className="text-white text-sm" />
        </div>
      )}

      {/* Hover Controls */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-4 flex gap-2"
          >
            {/* Pin Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onTogglePin}
              className={`w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all ${
                isPinned
                  ? 'bg-cyan-500 text-white'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <FontAwesomeIcon icon={faThumbtack} className="text-sm" />
            </motion.button>

            {/* Fullscreen Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl flex items-center justify-center text-white transition-all"
            >
              <FontAwesomeIcon icon={faExpand} className="text-sm" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Name */}
            <span className="text-white font-semibold text-sm drop-shadow-lg">
              {participant.displayName}
              {isLocal && ' (You)'}
            </span>

            {/* Muted Indicator */}
            {participant.isMuted && (
              <div className="w-6 h-6 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center">
                <FontAwesomeIcon icon={faMicrophoneSlash} className="text-white text-xs" />
              </div>
            )}
          </div>

          {/* Connection Quality Indicator */}
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-${2 + i * 2} rounded-full ${
                  i < 2 ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Speaking Indicator Border */}
      <AnimatePresence>
        {!participant.isMuted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(6, 182, 212, 0)',
                  '0 0 0 4px rgba(6, 182, 212, 0.5)',
                  '0 0 0 0px rgba(6, 182, 212, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Advanced Video Grid - Multiple Layout Modes
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faMicrophoneSlash,
  faVideoSlash,
  faThumbtack,
  faExpand,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';

type ViewLayout = 'grid' | 'spotlight' | 'sidebar' | 'speaker';

interface VideoGridProps {
  layout: ViewLayout;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: CallParticipant[];
  isVideoOff: boolean;
  pinnedParticipant: string | null;
  onPinParticipant: (userId: string | null) => void;
}

export function VideoGrid({
  layout,
  localStream,
  remoteStreams,
  participants,
  isVideoOff,
  pinnedParticipant,
  onPinParticipant,
}: VideoGridProps) {
  // Get current user from participants
  const currentUser = participants[0];

  if (layout === 'grid') {
    return (
      <GridLayout
        localStream={localStream}
        remoteStreams={remoteStreams}
        participants={participants}
        isVideoOff={isVideoOff}
        onPinParticipant={onPinParticipant}
      />
    );
  }

  if (layout === 'spotlight' || layout === 'speaker') {
    const spotlightUser = pinnedParticipant
      ? participants.find(p => p.userId === pinnedParticipant)
      : participants.find(p => !p.isMuted) || participants[0];

    return (
      <SpotlightLayout
        spotlightUser={spotlightUser}
        localStream={localStream}
        remoteStreams={remoteStreams}
        participants={participants}
        isVideoOff={isVideoOff}
        onPinParticipant={onPinParticipant}
      />
    );
  }

  if (layout === 'sidebar') {
    return (
      <SidebarLayout
        localStream={localStream}
        remoteStreams={remoteStreams}
        participants={participants}
        isVideoOff={isVideoOff}
        pinnedParticipant={pinnedParticipant}
        onPinParticipant={onPinParticipant}
      />
    );
  }

  return null;
}

// Grid Layout - Equal sized tiles
function GridLayout({
  localStream,
  remoteStreams,
  participants,
  isVideoOff,
  onPinParticipant,
}: any) {
  const getGridCols = (count: number) => {
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const cols = getGridCols(participants.length);

  return (
    <div
      className="w-full h-full p-4 grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoRows: '1fr',
      }}
    >
      {participants.map((participant, index) => {
        const stream = index === 0 ? localStream : remoteStreams.get(participant.userId);
        return (
          <VideoTile
            key={participant.userId}
            participant={participant}
            stream={stream}
            isLocal={index === 0}
            isVideoOff={index === 0 ? isVideoOff : participant.isVideoOff}
            onPin={() => onPinParticipant(participant.userId)}
          />
        );
      })}
    </div>
  );
}

// Spotlight Layout - One large, others small
function SpotlightLayout({
  spotlightUser,
  localStream,
  remoteStreams,
  participants,
  isVideoOff,
  onPinParticipant,
}: any) {
  const others = participants.filter((p: any) => p.userId !== spotlightUser?.userId);
  const spotlightStream = spotlightUser?.userId === participants[0]?.userId
    ? localStream
    : remoteStreams.get(spotlightUser?.userId);

  return (
    <div className="w-full h-full flex flex-col p-4 gap-3">
      {/* Main spotlight */}
      <div className="flex-1">
        {spotlightUser && (
          <VideoTile
            participant={spotlightUser}
            stream={spotlightStream}
            isLocal={spotlightUser.userId === participants[0]?.userId}
            isVideoOff={spotlightUser.userId === participants[0]?.userId ? isVideoOff : spotlightUser.isVideoOff}
            onPin={() => onPinParticipant(null)}
            isSpotlight
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {others.length > 0 && (
        <div className="flex gap-2 h-32 overflow-x-auto">
          {others.map((participant: any, index: number) => {
            const stream = index === 0 && participant.userId === participants[0]?.userId
              ? localStream
              : remoteStreams.get(participant.userId);
            return (
              <div key={participant.userId} className="w-40 flex-shrink-0">
                <VideoTile
                  participant={participant}
                  stream={stream}
                  isLocal={participant.userId === participants[0]?.userId}
                  isVideoOff={participant.userId === participants[0]?.userId ? isVideoOff : participant.isVideoOff}
                  onPin={() => onPinParticipant(participant.userId)}
                  isThumbnail
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Sidebar Layout - Main content with vertical sidebar
function SidebarLayout({
  localStream,
  remoteStreams,
  participants,
  isVideoOff,
  pinnedParticipant,
  onPinParticipant,
}: any) {
  const mainUser = pinnedParticipant
    ? participants.find((p: any) => p.userId === pinnedParticipant)
    : participants[0];
  const others = participants.filter((p: any) => p.userId !== mainUser?.userId);
  const mainStream = mainUser?.userId === participants[0]?.userId
    ? localStream
    : remoteStreams.get(mainUser?.userId);

  return (
    <div className="w-full h-full flex p-4 gap-3">
      {/* Main video */}
      <div className="flex-1">
        {mainUser && (
          <VideoTile
            participant={mainUser}
            stream={mainStream}
            isLocal={mainUser.userId === participants[0]?.userId}
            isVideoOff={mainUser.userId === participants[0]?.userId ? isVideoOff : mainUser.isVideoOff}
            onPin={() => onPinParticipant(null)}
            isSpotlight
          />
        )}
      </div>

      {/* Sidebar */}
      {others.length > 0 && (
        <div className="w-64 flex flex-col gap-2 overflow-y-auto">
          {others.map((participant: any) => {
            const stream = participant.userId === participants[0]?.userId
              ? localStream
              : remoteStreams.get(participant.userId);
            return (
              <div key={participant.userId} className="h-40">
                <VideoTile
                  participant={participant}
                  stream={stream}
                  isLocal={participant.userId === participants[0]?.userId}
                  isVideoOff={participant.userId === participants[0]?.userId ? isVideoOff : participant.isVideoOff}
                  onPin={() => onPinParticipant(participant.userId)}
                  isThumbnail
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Individual Video Tile Component
interface VideoTileProps {
  participant: CallParticipant;
  stream: MediaStream | null | undefined;
  isLocal: boolean;
  isVideoOff: boolean;
  onPin: () => void;
  isSpotlight?: boolean;
  isThumbnail?: boolean;
}

function VideoTile({
  participant,
  stream,
  isLocal,
  isVideoOff,
  onPin,
  isSpotlight,
  isThumbnail,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream && !isVideoOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-full rounded-lg overflow-hidden bg-zinc-800 group"
    >
      {/* Video or Avatar */}
      {!isVideoOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.displayName}
              className={`rounded-full object-cover ${
                isSpotlight ? 'w-32 h-32' : isThumbnail ? 'w-16 h-16' : 'w-24 h-24'
              }`}
            />
          ) : (
            <div
              className={`rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center ${
                isSpotlight ? 'w-32 h-32' : isThumbnail ? 'w-16 h-16' : 'w-24 h-24'
              }`}
            >
              <FontAwesomeIcon
                icon={faUser}
                className={`text-white ${
                  isSpotlight ? 'text-5xl' : isThumbnail ? 'text-2xl' : 'text-4xl'
                }`}
              />
            </div>
          )}
        </div>
      )}

      {/* Overlay Controls */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={onPin}
            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center text-white transition"
          >
            <FontAwesomeIcon icon={faThumbtack} className="text-xs" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center text-white transition">
            <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
          </button>
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-white font-medium drop-shadow ${isThumbnail ? 'text-xs' : 'text-sm'}`}>
              {participant.displayName}
              {isLocal && ' (You)'}
            </span>
            {participant.isMuted && (
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faMicrophoneSlash} className="text-white text-[10px]" />
              </div>
            )}
            {isVideoOff && (
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faVideoSlash} className="text-white text-[10px]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speaking Indicator */}
      {!participant.isMuted && (
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0px rgba(34, 211, 238, 0)',
              '0 0 0 4px rgba(34, 211, 238, 0.4)',
              '0 0 0 0px rgba(34, 211, 238, 0)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-lg pointer-events-none"
        />
      )}
    </motion.div>
  );
}

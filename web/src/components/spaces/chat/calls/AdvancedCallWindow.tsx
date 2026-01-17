// Advanced Professional Call Window - Resizable, Movable, Feature-Rich
import { useState, useRef, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhoneSlash,
  faDesktop,
  faExpand,
  faCompress,
  faUpRightAndDownLeftFromCenter,
  faGripVertical,
  faXmark,
  faMinus,
  faUser,
  faUsers,
  faTh,
  faGrip,
  faBars,
  faEllipsisV,
  faComment,
  faHandPaper,
  faSmile,
  faCog,
  faRecordVinyl,
  faClosedCaptioning,
  faUserPlus,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';
import { VideoGrid } from './VideoGrid';
import { CallControls } from './CallControls';
import { CallSidebar } from './CallSidebar';

type ViewLayout = 'grid' | 'spotlight' | 'sidebar' | 'speaker';
type WindowMode = 'docked' | 'floating' | 'minimized' | 'fullscreen';

interface AdvancedCallWindowProps {
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
  onPopOut?: () => void;
}

export function AdvancedCallWindow({
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
  roomName,
  onPopOut,
}: AdvancedCallWindowProps) {
  const [windowMode, setWindowMode] = useState<WindowMode>('floating');
  const [layout, setLayout] = useState<ViewLayout>('grid');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);

  // Window positioning and sizing
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const windowRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeDirection = useRef<string>('');
  const dragStart = useRef({ x: 0, y: 0 });

  // Call duration timer
  useEffect(() => {
    if (!isInCall) return;
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle screen share
  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true,
        });
        setIsScreenSharing(true);
        // TODO: Replace video track with screen track
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  };

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowMode === 'fullscreen' || windowMode === 'minimized') return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && windowMode === 'floating') {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [windowMode]);

  if (!isInCall) return null;

  // Minimized state
  if (windowMode === 'minimized') {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 w-80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{roomName || 'Call'}</p>
                <p className="text-gray-400 text-xs">{formatDuration(callDuration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWindowMode('floating')}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <FontAwesomeIcon icon={faExpand} className="text-xs" />
              </button>
              <button
                onClick={onEndCall}
                className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition"
              >
                <FontAwesomeIcon icon={faPhoneSlash} className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Fullscreen or Floating mode
  const isFullscreen = windowMode === 'fullscreen';
  const containerStyle = isFullscreen
    ? { inset: 0 }
    : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      };

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${isFullscreen ? 'fixed' : 'fixed'} z-50 flex flex-col`}
      style={containerStyle}
    >
      {/* Main Container */}
      <div className="flex flex-col h-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className={`flex-shrink-0 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between ${
            windowMode === 'floating' ? 'cursor-move' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faGripVertical} className="text-gray-600 text-sm" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-semibold text-sm">{roomName || 'Call'}</span>
              <span className="text-gray-400 text-xs">• {formatDuration(callDuration)}</span>
              <span className="text-gray-400 text-xs">• {participants.length} participants</span>
            </div>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-2">
            {/* Layout Selector */}
            <div className="flex items-center gap-1 bg-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setLayout('grid')}
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  layout === 'grid' ? 'bg-zinc-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <FontAwesomeIcon icon={faTh} className="text-xs" />
              </button>
              <button
                onClick={() => setLayout('spotlight')}
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  layout === 'spotlight' ? 'bg-zinc-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Spotlight View"
              >
                <FontAwesomeIcon icon={faUser} className="text-xs" />
              </button>
              <button
                onClick={() => setLayout('sidebar')}
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  layout === 'sidebar' ? 'bg-zinc-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Sidebar View"
              >
                <FontAwesomeIcon icon={faBars} className="text-xs" />
              </button>
            </div>

            <div className="w-px h-6 bg-zinc-700" />

            {/* Sidebar Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                showSidebar ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Toggle Sidebar"
            >
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
            </button>

            <div className="w-px h-6 bg-zinc-700" />

            {/* Pop Out */}
            {onPopOut && (
              <button
                onClick={onPopOut}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition"
                title="Pop Out"
              >
                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className="text-xs" />
              </button>
            )}

            {/* Minimize */}
            <button
              onClick={() => setWindowMode('minimized')}
              className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition"
              title="Minimize"
            >
              <FontAwesomeIcon icon={faMinus} className="text-xs" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setWindowMode(isFullscreen ? 'floating' : 'fullscreen')}
              className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-xs" />
            </button>

            {/* Close */}
            <button
              onClick={onEndCall}
              className="w-8 h-8 rounded-lg text-white bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
              title="End Call"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 bg-black relative">
            <VideoGrid
              layout={layout}
              localStream={localStream}
              remoteStreams={remoteStreams}
              participants={participants}
              isVideoOff={isVideoOff}
              pinnedParticipant={pinnedParticipant}
              onPinParticipant={setPinnedParticipant}
            />
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <CallSidebar
              participants={participants}
              showChat={showChat}
              onToggleChat={setShowChat}
            />
          )}
        </div>

        {/* Bottom Controls */}
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onScreenShare={handleScreenShare}
          onEndCall={onEndCall}
          isVideo={isVideo}
        />
      </div>

      {/* Resize Handles (only in floating mode) */}
      {windowMode === 'floating' && (
        <>
          {/* Corner handles */}
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-zinc-600 rounded cursor-nwse-resize" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-zinc-600 rounded cursor-nesw-resize" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-zinc-600 rounded cursor-nesw-resize" />
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-zinc-600 rounded cursor-nwse-resize" />
        </>
      )}
    </motion.div>
  );
}

// Modern Call Window - Clean, Dark, Professional
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDesktop,
  faPhoneSlash, faGripVertical, faXmark, faMinus, faExpand, faCompress,
  faUser, faTh, faUsers, faComment, faCog, faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';

interface ModernCallWindowProps {
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

type WindowState = 'floating' | 'docked-left' | 'docked-right' | 'docked-bottom' | 'fullscreen' | 'minimized';
type LayoutMode = 'grid' | 'spotlight';

export function ModernCallWindow(props: ModernCallWindowProps) {
  const [windowState, setWindowState] = useState<WindowState>('floating');
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Window positioning
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 800, height: 500 });
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = useRef({ isResizing: false, direction: '', startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  // Dragging
  const handleDragStart = (e: React.MouseEvent) => {
    if (windowState !== 'floating') return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.startPosX + dx,
      y: dragRef.current.startPosY + dy,
    });
  };

  const handleDragEnd = () => {
    dragRef.current.isDragging = false;
  };

  // Resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (windowState !== 'floating') return;
    e.stopPropagation();
    resizeRef.current = {
      isResizing: true,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeRef.current.isResizing) return;

    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    const { direction, startWidth, startHeight } = resizeRef.current;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = position.x;
    let newY = position.y;

    if (direction.includes('e')) newWidth = Math.max(400, startWidth + dx);
    if (direction.includes('w')) {
      newWidth = Math.max(400, startWidth - dx);
      newX = position.x + (startWidth - newWidth);
    }
    if (direction.includes('s')) newHeight = Math.max(300, startHeight + dy);
    if (direction.includes('n')) {
      newHeight = Math.max(300, startHeight - dy);
      newY = position.y + (startHeight - newHeight);
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  };

  const handleResizeEnd = () => {
    resizeRef.current.isResizing = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [position, size]);

  if (!props.isInCall) return null;

  // Minimized state
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 w-64">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{props.roomName || 'Call'}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWindowState('floating')}
              className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faExpand} className="text-xs" />
            </button>
            <button
              onClick={props.onEndCall}
              className="w-7 h-7 rounded hover:bg-red-600 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faPhoneSlash} className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate container style
  let containerStyle: React.CSSProperties = {};
  let containerClass = 'fixed z-50';

  if (windowState === 'fullscreen') {
    containerStyle = { inset: 0 };
  } else if (windowState === 'floating') {
    containerStyle = { left: position.x, top: position.y, width: size.width, height: size.height };
  } else if (windowState === 'docked-left') {
    containerStyle = { left: 0, top: 0, bottom: 0, width: 400 };
  } else if (windowState === 'docked-right') {
    containerStyle = { right: 0, top: 0, bottom: 0, width: 400 };
  } else if (windowState === 'docked-bottom') {
    containerStyle = { left: 0, right: 0, bottom: 0, height: 300 };
  }

  return (
    <div ref={windowRef} className={containerClass} style={containerStyle}>
      <div className="w-full h-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Title Bar */}
        <div
          onMouseDown={handleDragStart}
          className="flex-shrink-0 bg-zinc-800 border-b border-zinc-700 px-3 py-2 flex items-center justify-between cursor-move select-none"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGripVertical} className="text-gray-600 text-xs" />
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{props.roomName || 'Call'}</span>
            <span className="text-gray-500 text-xs">• {props.participants.length}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Layout Toggle */}
            <button
              onClick={() => setLayout(layout === 'grid' ? 'spotlight' : 'grid')}
              className="w-7 h-7 rounded hover:bg-zinc-700 flex items-center justify-center text-gray-400 hover:text-white transition"
              title={layout === 'grid' ? 'Spotlight View' : 'Grid View'}
            >
              <FontAwesomeIcon icon={faTh} className="text-xs" />
            </button>

            {/* Participants Toggle */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`w-7 h-7 rounded flex items-center justify-center transition ${
                showParticipants ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
            </button>

            <div className="w-px h-4 bg-zinc-700 mx-1" />

            {/* Window Controls */}
            <button
              onClick={() => setWindowState('minimized')}
              className="w-7 h-7 rounded hover:bg-zinc-700 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faMinus} className="text-xs" />
            </button>

            <button
              onClick={() => setWindowState(windowState === 'fullscreen' ? 'floating' : 'fullscreen')}
              className="w-7 h-7 rounded hover:bg-zinc-700 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={windowState === 'fullscreen' ? faCompress : faExpand} className="text-xs" />
            </button>

            <button
              onClick={props.onEndCall}
              className="w-7 h-7 rounded hover:bg-red-600 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Video Area */}
          <div className="flex-1 bg-black relative">
            <VideoContent {...props} layout={layout} />
          </div>

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-64 bg-zinc-800 border-l border-zinc-700 overflow-y-auto">
              <ParticipantsList participants={props.participants} />
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex-shrink-0 bg-zinc-800 border-t border-zinc-700 px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={props.onToggleMute}
              className={`h-9 px-3 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
                props.isMuted
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-white'
              }`}
            >
              <FontAwesomeIcon icon={props.isMuted ? faMicrophoneSlash : faMicrophone} />
              <span className="hidden sm:inline">{props.isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {props.isVideo && (
              <button
                onClick={props.onToggleVideo}
                className={`h-9 px-3 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
                  props.isVideoOff
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
                <FontAwesomeIcon icon={props.isVideoOff ? faVideoSlash : faVideo} />
                <span className="hidden sm:inline">{props.isVideoOff ? 'Start Video' : 'Stop Video'}</span>
              </button>
            )}

            {props.isVideo && (
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`h-9 px-3 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
                  isScreenSharing
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
                <FontAwesomeIcon icon={faDesktop} />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={props.onEndCall}
              className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm flex items-center gap-2 transition"
            >
              <FontAwesomeIcon icon={faPhoneSlash} />
              End
            </button>
          </div>
        </div>
      </div>

      {/* Resize Handles */}
      {windowState === 'floating' && (
        <>
          <div onMouseDown={(e) => handleResizeStart(e, 'e')} className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize" />
          <div onMouseDown={(e) => handleResizeStart(e, 'w')} className="absolute top-0 left-0 bottom-0 w-1 cursor-ew-resize" />
          <div onMouseDown={(e) => handleResizeStart(e, 's')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize" />
          <div onMouseDown={(e) => handleResizeStart(e, 'n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize" />
          <div onMouseDown={(e) => handleResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize" />
          <div onMouseDown={(e) => handleResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize" />
          <div onMouseDown={(e) => handleResizeStart(e, 'ne')} className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize" />
          <div onMouseDown={(e) => handleResizeStart(e, 'nw')} className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize" />
        </>
      )}
    </div>
  );
}

// Video Content Component
function VideoContent(props: ModernCallWindowProps & { layout: LayoutMode }) {
  const { localStream, remoteStreams, participants, isVideoOff, layout } = props;

  if (layout === 'grid') {
    const cols = participants.length <= 1 ? 1 : participants.length <= 4 ? 2 : 3;
    return (
      <div className="w-full h-full p-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {participants.map((p, i) => {
          const stream = i === 0 ? localStream : remoteStreams.get(p.userId);
          return <VideoTile key={p.userId} participant={p} stream={stream} isLocal={i === 0} isVideoOff={i === 0 ? isVideoOff : p.isVideoOff} />;
        })}
      </div>
    );
  }

  // Spotlight
  const main = participants[0];
  const mainStream = localStream;
  const others = participants.slice(1);

  return (
    <div className="w-full h-full flex flex-col p-2 gap-2">
      <div className="flex-1">
        <VideoTile participant={main} stream={mainStream} isLocal={true} isVideoOff={isVideoOff} />
      </div>
      {others.length > 0 && (
        <div className="flex gap-2 h-24 overflow-x-auto">
          {others.map((p) => (
            <div key={p.userId} className="w-32 flex-shrink-0">
              <VideoTile participant={p} stream={remoteStreams.get(p.userId)} isLocal={false} isVideoOff={p.isVideoOff} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Video Tile
function VideoTile({ participant, stream, isLocal, isVideoOff }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && !isVideoOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-zinc-800">
      {!isVideoOff && stream ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-gray-500 text-2xl" />
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
        <span className="text-white text-xs font-medium">{participant.displayName}{isLocal && ' (You)'}</span>
      </div>
      {participant.isMuted && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
          <FontAwesomeIcon icon={faMicrophoneSlash} className="text-white text-xs" />
        </div>
      )}
    </div>
  );
}

// Participants List
function ParticipantsList({ participants }: { participants: CallParticipant[] }) {
  return (
    <div className="p-3">
      <h3 className="text-white text-sm font-semibold mb-3">Participants ({participants.length})</h3>
      <div className="space-y-1">
        {participants.map((p) => (
          <div key={p.userId} className="flex items-center gap-2 p-2 rounded hover:bg-zinc-700 transition">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faUser} className="text-gray-400 text-xs" />
            </div>
            <span className="text-white text-sm flex-1 truncate">{p.displayName}</span>
            {p.isMuted && <FontAwesomeIcon icon={faMicrophoneSlash} className="text-red-400 text-xs" />}
          </div>
        ))}
      </div>
    </div>
  );
}

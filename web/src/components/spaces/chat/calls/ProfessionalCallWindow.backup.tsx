// Professional Call Window - Complete Feature Set, Dark UI
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDesktop,
  faPhoneSlash, faGripVertical, faXmark, faMinus, faExpand, faCompress,
  faUser, faTh, faUsers, faComment, faCog, faEllipsisV, faHandPaper,
  faSmile, faRecordVinyl, faClosedCaptioning, faUserPlus, faChevronUp,
  faArrowsAlt, faDoorOpen, faShareNodes, faWaveSquare, faFilter, faAdjust,
  faBars, faTableCells, faSquare,
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';

interface ProfessionalCallWindowProps {
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
type LayoutMode = 'grid' | 'spotlight' | 'sidebar' | 'speaker';

export function ProfessionalCallWindow(props: ProfessionalCallWindowProps) {
  const [windowState, setWindowState] = useState<WindowState>('floating');
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);

  // Window positioning with proper refs
  const [position, setPosition] = useState({ x: 150, y: 100 });
  const [size, setSize] = useState({ width: 1000, height: 650 });
  const windowRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, dir: '', posX: 0, posY: 0 });

  // Dragging handlers
  const startDrag = (e: React.MouseEvent) => {
    if (windowState !== 'floating') return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
  };

  const drag = (e: MouseEvent) => {
    if (!isDragging.current) return;
    requestAnimationFrame(() => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({ x: dragStart.current.posX + dx, y: dragStart.current.posY + dy });
    });
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  // Resizing handlers
  const startResize = (e: React.MouseEvent, dir: string) => {
    if (windowState !== 'floating') return;
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = {
      x: e.clientX, y: e.clientY, w: size.width, h: size.height,
      dir, posX: position.x, posY: position.y
    };
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    requestAnimationFrame(() => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      const { dir, w, h, posX, posY } = resizeStart.current;

      let newW = w, newH = h, newX = posX, newY = posY;

      if (dir.includes('e')) newW = Math.max(600, w + dx);
      if (dir.includes('w')) { newW = Math.max(600, w - dx); newX = posX + (w - newW); }
      if (dir.includes('s')) newH = Math.max(400, h + dy);
      if (dir.includes('n')) { newH = Math.max(400, h - dy); newY = posY + (h - newH); }

      setSize({ width: newW, height: newH });
      setPosition({ x: newX, y: newY });
    });
  };

  const stopResize = () => {
    isResizing.current = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    return () => {
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, []);

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
      } else {
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  };

  if (!props.isInCall) return null;

  // Minimized state
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-black border border-zinc-800 rounded-lg shadow-2xl p-3 w-72">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{props.roomName || 'Call'}</span>
            <span className="text-gray-500 text-xs">• {props.participants.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWindowState('floating')} className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-white transition">
              <FontAwesomeIcon icon={faExpand} className="text-xs" />
            </button>
            <button onClick={props.onEndCall} className="w-7 h-7 rounded hover:bg-red-600 flex items-center justify-center text-gray-400 hover:text-white transition">
              <FontAwesomeIcon icon={faPhoneSlash} className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Container styles based on state
  const containerStyle: React.CSSProperties = windowState === 'fullscreen'
    ? { inset: 0 }
    : windowState === 'docked-left' ? { left: 0, top: 0, bottom: 0, width: 450 }
    : windowState === 'docked-right' ? { right: 0, top: 0, bottom: 0, width: 450 }
    : windowState === 'docked-bottom' ? { left: 0, right: 0, bottom: 0, height: 350 }
    : { left: position.x, top: position.y, width: size.width, height: size.height };

  return (
    <div ref={windowRef} className="fixed z-50" style={containerStyle}>
      <div className="w-full h-full bg-black border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Title Bar - Dark with bright icons */}
        <div onMouseDown={startDrag} className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex items-center justify-between cursor-move select-none">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGripVertical} className="text-zinc-700 text-xs" />
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">{props.roomName || 'Call'}</span>
            <span className="text-zinc-600 text-xs">• {props.participants.length} participants</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Layout modes */}
            <div className="flex items-center gap-0.5 bg-zinc-800 rounded p-0.5 mr-2">
              <button onClick={() => setLayout('grid')} className={`w-7 h-7 rounded flex items-center justify-center transition ${layout === 'grid' ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Grid">
                <FontAwesomeIcon icon={faTh} className="text-xs" />
              </button>
              <button onClick={() => setLayout('spotlight')} className={`w-7 h-7 rounded flex items-center justify-center transition ${layout === 'spotlight' ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Spotlight">
                <FontAwesomeIcon icon={faSquare} className="text-xs" />
              </button>
              <button onClick={() => setLayout('sidebar')} className={`w-7 h-7 rounded flex items-center justify-center transition ${layout === 'sidebar' ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Sidebar">
                <FontAwesomeIcon icon={faBars} className="text-xs" />
              </button>
              <button onClick={() => setLayout('speaker')} className={`w-7 h-7 rounded flex items-center justify-center transition ${layout === 'speaker' ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Speaker">
                <FontAwesomeIcon icon={faUser} className="text-xs" />
              </button>
            </div>

            {/* Docking options */}
            <div className="flex items-center gap-0.5 bg-zinc-800 rounded p-0.5 mr-2">
              <button onClick={() => setWindowState('docked-left')} className={`w-7 h-7 rounded flex items-center justify-center transition ${windowState === 'docked-left' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Dock Left">
                <div className="w-2 h-3 border-l-2 border-current" />
              </button>
              <button onClick={() => setWindowState('docked-right')} className={`w-7 h-7 rounded flex items-center justify-center transition ${windowState === 'docked-right' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Dock Right">
                <div className="w-2 h-3 border-r-2 border-current" />
              </button>
              <button onClick={() => setWindowState('docked-bottom')} className={`w-7 h-7 rounded flex items-center justify-center transition ${windowState === 'docked-bottom' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Dock Bottom">
                <div className="h-2 w-3 border-b-2 border-current" />
              </button>
              <button onClick={() => setWindowState('floating')} className={`w-7 h-7 rounded flex items-center justify-center transition ${windowState === 'floating' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`} title="Float">
                <FontAwesomeIcon icon={faArrowsAlt} className="text-xs" />
              </button>
            </div>

            <div className="w-px h-4 bg-zinc-800 mx-1" />

            {/* Panels */}
            <button onClick={() => setShowParticipants(!showParticipants)} className={`w-7 h-7 rounded flex items-center justify-center transition ${showParticipants ? 'bg-zinc-700 text-cyan-400' : 'text-zinc-500 hover:text-white'}`}>
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
            </button>
            <button onClick={() => setShowChat(!showChat)} className={`w-7 h-7 rounded flex items-center justify-center transition ${showChat ? 'bg-zinc-700 text-cyan-400' : 'text-zinc-500 hover:text-white'}`}>
              <FontAwesomeIcon icon={faComment} className="text-xs" />
            </button>

            <div className="w-px h-4 bg-zinc-800 mx-1" />

            {/* Window controls */}
            <button onClick={() => setWindowState('minimized')} className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition">
              <FontAwesomeIcon icon={faMinus} className="text-xs" />
            </button>
            <button onClick={() => setWindowState(windowState === 'fullscreen' ? 'floating' : 'fullscreen')} className="w-7 h-7 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition">
              <FontAwesomeIcon icon={windowState === 'fullscreen' ? faCompress : faExpand} className="text-xs" />
            </button>
            <button onClick={props.onEndCall} className="w-7 h-7 rounded hover:bg-red-600 flex items-center justify-center text-zinc-500 hover:text-white transition">
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Main Video Area */}
          <div className="flex-1 bg-zinc-950">
            <VideoArea {...props} layout={layout} pinnedParticipant={pinnedParticipant} onPin={setPinnedParticipant} />
          </div>

          {/* Right Sidebar - Participants/Chat */}
          {(showParticipants || showChat) && (
            <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col">
              {/* Tab Switcher */}
              <div className="flex border-b border-zinc-800">
                <button onClick={() => { setShowParticipants(true); setShowChat(false); }} className={`flex-1 px-4 py-2 text-sm font-medium transition ${showParticipants && !showChat ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-white'}`}>
                  <FontAwesomeIcon icon={faUsers} className="mr-2" /> Participants
                </button>
                <button onClick={() => { setShowChat(true); setShowParticipants(false); }} className={`flex-1 px-4 py-2 text-sm font-medium transition ${showChat ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-white'}`}>
                  <FontAwesomeIcon icon={faComment} className="mr-2" /> Chat
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {showParticipants && !showChat && <ParticipantsList participants={props.participants} />}
                {showChat && <ChatPanel />}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Controls Bar */}
        <div className="flex-shrink-0 bg-zinc-900 border-t border-zinc-800">
          {/* More Options Panel */}
          {showMoreOptions && (
            <div className="border-b border-zinc-800 p-3">
              <div className="grid grid-cols-4 gap-2">
                <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition">
                  <FontAwesomeIcon icon={faWaveSquare} />
                  <span className="text-xs">Noise Cancel</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition">
                  <FontAwesomeIcon icon={faFilter} />
                  <span className="text-xs">Blur BG</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition">
                  <FontAwesomeIcon icon={faAdjust} />
                  <span className="text-xs">Touch Up</span>
                </button>
                <button onClick={() => setIsRecording(!isRecording)} className={`flex flex-col items-center gap-1 p-2 rounded transition ${isRecording ? 'bg-red-600 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-red-400'}`}>
                  <FontAwesomeIcon icon={faRecordVinyl} className={isRecording ? 'animate-pulse' : ''} />
                  <span className="text-xs">Record</span>
                </button>
                <button onClick={() => setShowCaptions(!showCaptions)} className={`flex flex-col items-center gap-1 p-2 rounded transition ${showCaptions ? 'bg-cyan-600 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400'}`}>
                  <FontAwesomeIcon icon={faClosedCaptioning} />
                  <span className="text-xs">Captions</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition">
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span className="text-xs">Invite</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition">
                  <FontAwesomeIcon icon={faSmile} />
                  <span className="text-xs">Reactions</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition">
                  <FontAwesomeIcon icon={faShareNodes} />
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Controls */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              {/* Mute */}
              <div className="relative">
                <button onClick={props.onToggleMute} className={`h-10 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition ${props.isMuted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                  <FontAwesomeIcon icon={props.isMuted ? faMicrophoneSlash : faMicrophone} />
                  {props.isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>

              {/* Video */}
              {props.isVideo && (
                <button onClick={props.onToggleVideo} className={`h-10 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition ${props.isVideoOff ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                  <FontAwesomeIcon icon={props.isVideoOff ? faVideoSlash : faVideo} />
                  {props.isVideoOff ? 'Start Video' : 'Stop Video'}
                </button>
              )}

              {/* Screen Share */}
              {props.isVideo && (
                <button onClick={handleScreenShare} className={`h-10 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition ${isScreenSharing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                  <FontAwesomeIcon icon={faDesktop} />
                  {isScreenSharing ? 'Stop Sharing' : 'Share'}
                </button>
              )}

              {/* Raise Hand */}
              <button onClick={() => setHandRaised(!handRaised)} className={`h-10 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition ${handRaised ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                <FontAwesomeIcon icon={faHandPaper} />
                {handRaised ? 'Lower Hand' : 'Raise Hand'}
              </button>

              {/* More Options */}
              <button onClick={() => setShowMoreOptions(!showMoreOptions)} className={`h-10 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition ${showMoreOptions ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                <FontAwesomeIcon icon={faCog} />
                More
              </button>

              <div className="flex-1" />

              {/* End Call */}
              <button onClick={props.onEndCall} className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-2 transition">
                <FontAwesomeIcon icon={faPhoneSlash} />
                End Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resize Handles (floating only) */}
      {windowState === 'floating' && (
        <>
          <div onMouseDown={(e) => startResize(e, 'e')} className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize hover:bg-cyan-500/20" />
          <div onMouseDown={(e) => startResize(e, 'w')} className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize hover:bg-cyan-500/20" />
          <div onMouseDown={(e) => startResize(e, 's')} className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-cyan-500/20" />
          <div onMouseDown={(e) => startResize(e, 'n')} className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-cyan-500/20" />
          <div onMouseDown={(e) => startResize(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-cyan-500/30 rounded-tl" />
          <div onMouseDown={(e) => startResize(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize hover:bg-cyan-500/30 rounded-tr" />
          <div onMouseDown={(e) => startResize(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize hover:bg-cyan-500/30 rounded-bl" />
          <div onMouseDown={(e) => startResize(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize hover:bg-cyan-500/30 rounded-br" />
        </>
      )}
    </div>
  );
}

// Video Area with all layout modes
function VideoArea(props: ProfessionalCallWindowProps & { layout: LayoutMode; pinnedParticipant: string | null; onPin: (id: string | null) => void }) {
  const { participants, localStream, remoteStreams, isVideoOff, layout, pinnedParticipant, onPin } = props;

  if (layout === 'grid') {
    const cols = participants.length <= 1 ? 1 : participants.length <= 4 ? 2 : participants.length <= 9 ? 3 : 4;
    return (
      <div className="w-full h-full p-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr' }}>
        {participants.map((p, i) => (
          <VideoTile key={p.userId} participant={p} stream={i === 0 ? localStream : remoteStreams.get(p.userId)} isLocal={i === 0} isVideoOff={i === 0 ? isVideoOff : p.isVideoOff} onPin={() => onPin(p.userId)} />
        ))}
      </div>
    );
  }

  if (layout === 'spotlight' || layout === 'speaker') {
    const main = pinnedParticipant ? participants.find(p => p.userId === pinnedParticipant) || participants[0] : participants.find(p => !p.isMuted) || participants[0];
    const mainStream = main?.userId === participants[0]?.userId ? localStream : remoteStreams.get(main?.userId || '');
    const others = participants.filter(p => p.userId !== main?.userId);

    return (
      <div className="w-full h-full flex flex-col p-3 gap-2">
        <div className="flex-1">
          {main && <VideoTile participant={main} stream={mainStream} isLocal={main.userId === participants[0]?.userId} isVideoOff={main.userId === participants[0]?.userId ? isVideoOff : main.isVideoOff} onPin={() => onPin(null)} isLarge />}
        </div>
        {others.length > 0 && (
          <div className="flex gap-2 h-28 overflow-x-auto">
            {others.map((p) => (
              <div key={p.userId} className="w-40 flex-shrink-0">
                <VideoTile participant={p} stream={p.userId === participants[0]?.userId ? localStream : remoteStreams.get(p.userId)} isLocal={p.userId === participants[0]?.userId} isVideoOff={p.userId === participants[0]?.userId ? isVideoOff : p.isVideoOff} onPin={() => onPin(p.userId)} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'sidebar') {
    const main = pinnedParticipant ? participants.find(p => p.userId === pinnedParticipant) || participants[0] : participants[0];
    const mainStream = main?.userId === participants[0]?.userId ? localStream : remoteStreams.get(main?.userId || '');
    const others = participants.filter(p => p.userId !== main?.userId);

    return (
      <div className="w-full h-full flex p-3 gap-2">
        <div className="flex-1">
          {main && <VideoTile participant={main} stream={mainStream} isLocal={main.userId === participants[0]?.userId} isVideoOff={main.userId === participants[0]?.userId ? isVideoOff : main.isVideoOff} onPin={() => onPin(null)} isLarge />}
        </div>
        {others.length > 0 && (
          <div className="w-64 flex flex-col gap-2 overflow-y-auto">
            {others.map((p) => (
              <div key={p.userId} className="h-48">
                <VideoTile participant={p} stream={p.userId === participants[0]?.userId ? localStream : remoteStreams.get(p.userId)} isLocal={p.userId === participants[0]?.userId} isVideoOff={p.userId === participants[0]?.userId ? isVideoOff : p.isVideoOff} onPin={() => onPin(p.userId)} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Video Tile
function VideoTile({ participant, stream, isLocal, isVideoOff, onPin, isLarge }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream && !isVideoOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  return (
    <div onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)} className="relative w-full h-full rounded-lg overflow-hidden bg-zinc-900 group">
      {!isVideoOff && stream ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
          <div className={`rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center ${isLarge ? 'w-32 h-32' : 'w-20 h-20'}`}>
            <FontAwesomeIcon icon={faUser} className={`text-white ${isLarge ? 'text-5xl' : 'text-3xl'}`} />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && onPin && (
        <div className="absolute top-2 right-2">
          <button onClick={onPin} className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center text-white transition">
            <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
          </button>
        </div>
      )}

      {/* Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-semibold drop-shadow">{participant.displayName}{isLocal && ' (You)'}</span>
          {participant.isMuted && (
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faMicrophoneSlash} className="text-white text-xs" />
            </div>
          )}
        </div>
      </div>

      {/* Speaking Indicator */}
      {!participant.isMuted && (
        <div className="absolute inset-0 border-2 border-cyan-400 rounded-lg animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

// Participants List
function ParticipantsList({ participants }: { participants: CallParticipant[] }) {
  return (
    <div className="p-4">
      <h3 className="text-white text-sm font-bold mb-3">In Call ({participants.length})</h3>
      <div className="space-y-1">
        {participants.map((p, i) => (
          <div key={p.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{p.displayName}{i === 0 && ' (You)'}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {p.isMuted ? <span className="text-red-400">Muted</span> : <span className="text-green-400">Speaking</span>}
              </div>
            </div>
            <button className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white transition">
              <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chat Panel
function ChatPanel() {
  const [messages, setMessages] = useState<Array<{ user: string; text: string; time: string }>>([]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: 'You', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <FontAwesomeIcon icon={faComment} className="text-zinc-700 text-3xl mb-2" />
              <p className="text-zinc-600 text-sm">No messages yet</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-xs font-semibold">{m.user}</span>
                <span className="text-zinc-600 text-xs">{m.time}</span>
              </div>
              <p className="text-zinc-300 text-sm bg-zinc-800 rounded-lg p-2">{m.text}</p>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." className="flex-1 bg-zinc-800 text-white placeholder-zinc-600 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <button onClick={send} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition">Send</button>
        </div>
      </div>
    </div>
  );
}

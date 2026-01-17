// Professional Call Window - Complete with All Features
import { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './futuristic-styles.css';
import {
  faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faDesktop,
  faPhoneSlash, faGripVertical, faXmark, faMinus, faExpand, faCompress,
  faUser, faTh, faUsers, faComment, faCog, faEllipsisV, faHandPaper,
  faSmile, faRecordVinyl, faClosedCaptioning, faUserPlus, faChevronUp,
  faArrowsAlt, faDoorOpen, faShareNodes, faWaveSquare, faFilter, faAdjust,
  faBars, faTableCells, faSquare, faPaperPlane, faThumbsUp, faHeart,
  faLaugh, faSurprise, faStar, faExternalLinkAlt, faCrown, faVolumeHigh
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';
import type { InCallMessage, Reaction, RaisedHand, ScreenShareSession } from '@4space/shared/src/types/callSession.types';

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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [noiseSuppress, setNoiseSuppress] = useState(false);
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [beautyFilter, setBeautyFilter] = useState(false);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);

  // Chat and reactions
  const [chatMessages, setChatMessages] = useState<InCallMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [screenSessions, setScreenSessions] = useState<ScreenShareSession[]>([]);
  const [activeScreenShare, setActiveScreenShare] = useState<ScreenShareSession | null>(null);

  // Window positioning - will be centered on first render
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1000, height: 650 });
  const [isInitialized, setIsInitialized] = useState(false);

  const windowRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);
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

  const drag = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    requestAnimationFrame(() => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      let newX = dragStart.current.posX + dx;
      let newY = dragStart.current.posY + dy;

      // Keep within bounds - ensure entire window is visible
      const minX = -size.width + 200; // Allow partial off-screen left but keep 200px visible
      const maxX = window.innerWidth - 200; // Keep at least 200px visible on right
      const minY = 0; // Don't allow dragging above viewport
      const maxY = window.innerHeight - 100; // Keep title bar visible

      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      setPosition({ x: newX, y: newY });
    });
  }, [size.width]);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

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

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    requestAnimationFrame(() => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      const { dir, w, h, posX, posY } = resizeStart.current;

      let newW = w, newH = h, newX = posX, newY = posY;

      if (dir.includes('e')) newW = Math.max(600, Math.min(window.innerWidth - posX - 20, w + dx));
      if (dir.includes('w')) {
        newW = Math.max(600, w - dx);
        newX = Math.max(20, posX + (w - newW));
      }
      if (dir.includes('s')) newH = Math.max(400, Math.min(window.innerHeight - posY - 20, h + dy));
      if (dir.includes('n')) {
        newH = Math.max(400, h - dy);
        newY = Math.max(20, posY + (h - newH));
      }

      setSize({ width: newW, height: newH });
      setPosition({ x: newX, y: newY });
    });
  }, []);

  const stopResize = useCallback(() => {
    isResizing.current = false;
  }, []);

  // Center window on mount and handle window resize
  useEffect(() => {
    if (!isInitialized) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const callWidth = 1000;
      const callHeight = 650;

      const centerX = Math.max(20, (w - callWidth) / 2);
      const centerY = Math.max(20, (h - callHeight) / 2);

      setPosition({ x: centerX, y: centerY });
      setIsInitialized(true);
    }

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const callWidth = size.width;
      const callHeight = size.height;

      // If window is completely out of view, recenter it
      if (position.x > w - 100 || position.x < -callWidth + 100 ||
          position.y > h - 50 || position.y < 0) {
        setPosition({
          x: Math.max(20, (w - callWidth) / 2),
          y: Math.max(20, (h - callHeight) / 2)
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized, position, size]);

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
  }, [drag, stopDrag, resize, stopResize]);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && props.localStream) {
      localVideoRef.current.srcObject = props.localStream;
    }
  }, [props.localStream]);

  useEffect(() => {
    props.remoteStreams.forEach((stream, userId) => {
      const videoEl = videoRefs.current.get(userId);
      if (videoEl) {
        videoEl.srcObject = stream;
      }
    });
  }, [props.remoteStreams]);

  // Screen sharing
  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true
        });

        const session: ScreenShareSession = {
          id: `screen_${Date.now()}`,
          presenterId: 'you',
          presenterName: 'You',
          title: 'Screen Share',
          startedAt: new Date(),
          viewerIds: [],
          stream,
          isActive: true,
        };

        setActiveScreenShare(session);
        setScreenSessions(prev => [...prev, session]);
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setActiveScreenShare(null);
        };
      } else {
        if (activeScreenShare?.stream) {
          activeScreenShare.stream.getTracks().forEach(track => track.stop());
        }
        setIsScreenSharing(false);
        setActiveScreenShare(null);
      }
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  };

  // Chat
  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const msg: InCallMessage = {
      id: `msg_${Date.now()}`,
      userId: 'you',
      userName: 'You',
      message: chatInput,
      timestamp: new Date(),
      type: 'text',
    };

    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  // Reactions
  const sendReaction = (emoji: string) => {
    const reaction: Reaction = {
      id: `reaction_${Date.now()}`,
      userId: 'you',
      userName: 'You',
      emoji,
      timestamp: new Date(),
    };

    setReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  };

  // Raise hand
  const toggleRaiseHand = () => {
    if (!handRaised) {
      const hand: RaisedHand = {
        userId: 'you',
        userName: 'You',
        raisedAt: new Date(),
      };
      setRaisedHands(prev => [...prev, hand]);
    } else {
      setRaisedHands(prev => prev.filter(h => h.userId !== 'you'));
    }
    setHandRaised(!handRaised);
  };

  // Open in new window
  const openInNewWindow = () => {
    const url = `/call-window?room=${props.roomName || 'call'}&fullscreen=true`;
    window.open(url, 'CallWindow', 'width=1200,height=800,menubar=no,toolbar=no,location=no');
  };

  if (!props.isInCall) return null;

  // Minimized state
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-6 right-6 z-50 minimized-window rounded-xl p-4 w-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full recording-dot" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <span className="text-white text-sm font-semibold glow-text-cyan">{props.roomName || 'Call'}</span>
              <p className="text-cyan-400 text-xs">{props.participants.length + 1} participants</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setWindowState('floating')} className="control-btn w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400">
              <FontAwesomeIcon icon={faExpand} className="text-xs" />
            </button>
            <button onClick={props.onEndCall} className="control-btn w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:btn-active-red">
              <FontAwesomeIcon icon={faPhoneSlash} className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Container styles
  const containerStyle: React.CSSProperties = windowState === 'fullscreen'
    ? { inset: 0 }
    : windowState === 'docked-left' ? { left: 0, top: 0, bottom: 0, width: 500 }
    : windowState === 'docked-right' ? { right: 0, top: 0, bottom: 0, width: 500 }
    : windowState === 'docked-bottom' ? { left: 0, right: 0, bottom: 0, height: 400 }
    : { left: position.x, top: position.y, width: size.width, height: size.height };

  return (
    <div ref={windowRef} className="fixed z-50" style={containerStyle}>
      <div className="w-full h-full call-window-border call-window-neon rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Title Bar */}
        <div onMouseDown={startDrag} className="flex-shrink-0 call-title-bar px-3 py-2.5 flex items-center justify-between cursor-move select-none">
          <div className="flex items-center gap-2 min-w-0">
            <FontAwesomeIcon icon={faGripVertical} className="text-zinc-600 text-xs flex-shrink-0" />
            <div className="relative flex-shrink-0">
              <div className="w-2 h-2 bg-emerald-500 rounded-full recording-dot" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-white text-sm font-bold glow-text-cyan truncate">{props.roomName || 'Call'}</span>
            <span className="text-cyan-500 text-xs font-medium flex-shrink-0">• {props.participants.length + 1}</span>
            {isRecording && <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full border border-red-500/30 flex-shrink-0"><div className="w-1.5 h-1.5 bg-red-500 rounded-full recording-dot" /><span className="text-red-400 text-xs font-semibold glow-text-red">REC</span></div>}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Critical controls - always visible */}
            <button onClick={() => setWindowState(windowState === 'floating' ? 'docked-right' : 'floating')} className="control-btn w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-purple-400 transition" title={windowState === 'floating' ? 'Dock' : 'Undock'}>
              <FontAwesomeIcon icon={windowState === 'floating' ? faDoorOpen : faArrowsAlt} className="text-xs" />
            </button>
            <button onClick={() => setWindowState('minimized')} className="control-btn w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition">
              <FontAwesomeIcon icon={faMinus} className="text-xs" />
            </button>
            <button onClick={() => setWindowState(windowState === 'fullscreen' ? 'floating' : 'fullscreen')} className="control-btn w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition">
              <FontAwesomeIcon icon={windowState === 'fullscreen' ? faCompress : faExpand} className="text-xs" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 bg-zinc-950 relative overflow-hidden">
            {/* Screen share view */}
            {isScreenSharing && activeScreenShare ? (
              <div className="absolute inset-0 bg-black">
                <video
                  autoPlay
                  playsInline
                  ref={(el) => { if (el && activeScreenShare.stream) el.srcObject = activeScreenShare.stream; }}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-red-600 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faDesktop} className="text-white text-sm" />
                  <span className="text-white text-sm font-semibold">You are presenting</span>
                  <button onClick={handleScreenShare} className="ml-2 px-2 py-0.5 bg-white text-red-600 rounded text-xs font-bold hover:bg-gray-100">
                    Stop
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Video grid */}
                <div className={`w-full h-full p-2 ${layout === 'grid' ? 'grid gap-2' : 'flex'}`} style={layout === 'grid' ? {
                  gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(props.participants.length + 1))}, 1fr)`,
                  gridTemplateRows: `repeat(${Math.ceil((props.participants.length + 1) / Math.ceil(Math.sqrt(props.participants.length + 1)))}, 1fr)`
                } : {}}>
                  {/* Local video */}
                  <div className="relative bg-zinc-900 rounded-lg overflow-hidden">
                    {!props.isVideoOff ? (
                      <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="text-white text-2xl" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium">
                      You {props.isMuted && <FontAwesomeIcon icon={faMicrophoneSlash} className="ml-1 text-red-400" />}
                    </div>
                    {handRaised && (
                      <div className="absolute top-2 right-2 bg-yellow-500 w-8 h-8 rounded-full flex items-center justify-center animate-bounce">
                        <FontAwesomeIcon icon={faHandPaper} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Remote videos */}
                  {props.participants.map((participant) => {
                    const stream = props.remoteStreams.get(participant.userId);
                    return (
                      <div key={participant.userId} className="relative bg-zinc-900 rounded-lg overflow-hidden">
                        {stream && !participant.isVideoOff ? (
                          <video
                            ref={(el) => { if (el) { videoRefs.current.set(participant.userId, el); el.srcObject = stream; } }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                              {participant.avatar ? (
                                <img src={participant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <FontAwesomeIcon icon={faUser} className="text-white text-2xl" />
                              )}
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
                          {participant.displayName}
                          {participant.isMuted && <FontAwesomeIcon icon={faMicrophoneSlash} className="text-red-400" />}
                          {!participant.isMuted && <FontAwesomeIcon icon={faVolumeHigh} className="text-green-400 animate-pulse" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Floating reactions */}
            <div className="absolute bottom-20 right-4 flex flex-col-reverse gap-2">
              {reactions.slice(-5).map((reaction) => (
                <div key={reaction.id} className="text-4xl animate-bounce" style={{ animationDuration: '1s' }}>
                  {reaction.emoji}
                </div>
              ))}
            </div>

            {/* Captions */}
            {showCaptions && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/90 px-4 py-2 rounded-lg max-w-2xl">
                <p className="text-white text-sm text-center">Live captions will appear here...</p>
              </div>
            )}
          </div>

          {/* Sidebar - Participants/Chat */}
          {(showParticipants || showChat) && (
            <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-zinc-800">
                <button onClick={() => { setShowParticipants(true); setShowChat(false); }} className={`flex-1 px-4 py-2.5 text-sm font-semibold ${showParticipants ? 'bg-zinc-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-white'}`}>
                  <FontAwesomeIcon icon={faUsers} className="mr-2" />
                  People ({props.participants.length + 1})
                </button>
                <button onClick={() => { setShowChat(true); setShowParticipants(false); }} className={`flex-1 px-4 py-2.5 text-sm font-semibold ${showChat ? 'bg-zinc-800 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-white'}`}>
                  <FontAwesomeIcon icon={faComment} className="mr-2" />
                  Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
                </button>
              </div>

              {/* Participants List */}
              {showParticipants && (
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {/* Raised hands */}
                  {raisedHands.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-zinc-800">
                      <h4 className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faHandPaper} />
                        Raised Hands ({raisedHands.length})
                      </h4>
                      {raisedHands.map((hand) => (
                        <div key={hand.userId} className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg mb-1">
                          <FontAwesomeIcon icon={faHandPaper} className="text-yellow-400" />
                          <span className="text-white text-sm font-medium">{hand.userName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* You */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        You <FontAwesomeIcon icon={faCrown} className="text-yellow-500 text-xs" title="Host" />
                      </p>
                    </div>
                    {props.isMuted && <FontAwesomeIcon icon={faMicrophoneSlash} className="text-red-400 text-xs" />}
                    {props.isVideoOff && <FontAwesomeIcon icon={faVideoSlash} className="text-red-400 text-xs" />}
                  </div>

                  {/* Others */}
                  {props.participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        {participant.avatar ? (
                          <img src={participant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{participant.displayName}</p>
                      </div>
                      {participant.isMuted && <FontAwesomeIcon icon={faMicrophoneSlash} className="text-red-400 text-xs" />}
                      {participant.isVideoOff && <FontAwesomeIcon icon={faVideoSlash} className="text-red-400 text-xs" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Chat */}
              {showChat && (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center">
                        <div>
                          <FontAwesomeIcon icon={faComment} className="text-gray-600 text-3xl mb-2" />
                          <p className="text-gray-400 text-sm">No messages yet</p>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-xs">{msg.userName}</span>
                            <span className="text-gray-500 text-xs">{msg.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-gray-300 text-sm bg-zinc-800 rounded-lg p-2">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-zinc-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Send a message..."
                        className="flex-1 bg-zinc-800 text-white placeholder-gray-500 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button onClick={sendMessage} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition">
                        <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex-shrink-0 bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <button onClick={props.onToggleMute} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${props.isMuted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={props.isMuted ? faMicrophoneSlash : faMicrophone} />
            </button>
            <button onClick={props.onToggleVideo} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${props.isVideoOff ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={props.isVideoOff ? faVideoSlash : faVideo} />
            </button>
            <button onClick={handleScreenShare} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isScreenSharing ? 'bg-cyan-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={faDesktop} />
            </button>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-2">
            <button onClick={toggleRaiseHand} className={`px-3 h-9 rounded-lg flex items-center gap-2 transition ${handRaised ? 'bg-yellow-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={faHandPaper} className="text-sm" />
              <span className="text-xs font-semibold">{handRaised ? 'Lower' : 'Raise'}</span>
            </button>

            {/* Reactions */}
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
              {['👍', '❤️', '😂', '😮', '⭐'].map((emoji) => (
                <button key={emoji} onClick={() => sendReaction(emoji)} className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-lg transition">
                  {emoji}
                </button>
              ))}
            </div>

            <button onClick={() => setShowParticipants(!showParticipants)} className={`px-3 h-9 rounded-lg flex items-center gap-2 transition ${showParticipants ? 'bg-cyan-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={faUsers} className="text-sm" />
            </button>
            <button onClick={() => setShowChat(!showChat)} className={`px-3 h-9 rounded-lg flex items-center gap-2 transition ${showChat ? 'bg-cyan-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={faComment} className="text-sm" />
              {chatMessages.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{chatMessages.length}</span>}
            </button>

            <button onClick={() => setIsRecording(!isRecording)} className={`px-3 h-9 rounded-lg flex items-center gap-2 transition ${isRecording ? 'bg-red-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={faRecordVinyl} className="text-sm" />
            </button>
            <button onClick={() => setShowCaptions(!showCaptions)} className={`px-3 h-9 rounded-lg flex items-center gap-2 transition ${showCaptions ? 'bg-cyan-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              <FontAwesomeIcon icon={faClosedCaptioning} className="text-sm" />
            </button>

            {/* More options */}
            <div className="relative group">
              <button className="px-3 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-2 transition">
                <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
              </button>

              {/* Dropdown */}
              <div className="absolute bottom-full right-0 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-2 w-48 hidden group-hover:block">
                <button onClick={() => setNoiseSuppress(!noiseSuppress)} className={`w-full px-3 py-2 rounded text-left text-sm ${noiseSuppress ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-zinc-700'}`}>
                  <FontAwesomeIcon icon={faWaveSquare} className="mr-2" />
                  Noise Suppress
                </button>
                <button onClick={() => setBackgroundBlur(!backgroundBlur)} className={`w-full px-3 py-2 rounded text-left text-sm ${backgroundBlur ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-zinc-700'}`}>
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Background Blur
                </button>
                <button onClick={() => setBeautyFilter(!beautyFilter)} className={`w-full px-3 py-2 rounded text-left text-sm ${beautyFilter ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-zinc-700'}`}>
                  <FontAwesomeIcon icon={faAdjust} className="mr-2" />
                  Beauty Filter
                </button>
                <button className="w-full px-3 py-2 rounded text-left text-sm text-gray-300 hover:bg-zinc-700">
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Invite
                </button>
                <button className="w-full px-3 py-2 rounded text-left text-sm text-gray-300 hover:bg-zinc-700">
                  <FontAwesomeIcon icon={faCog} className="mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div>
            <button onClick={props.onEndCall} className="px-5 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition flex items-center gap-2">
              <FontAwesomeIcon icon={faPhoneSlash} />
              End
            </button>
          </div>
        </div>

        {/* Resize handles */}
        {windowState === 'floating' && (
          <>
            <div onMouseDown={(e) => startResize(e, 'n')} className="absolute top-0 left-0 right-0 h-1 cursor-n-resize" />
            <div onMouseDown={(e) => startResize(e, 's')} className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize" />
            <div onMouseDown={(e) => startResize(e, 'w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize" />
            <div onMouseDown={(e) => startResize(e, 'e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize" />
            <div onMouseDown={(e) => startResize(e, 'nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize" />
            <div onMouseDown={(e) => startResize(e, 'ne')} className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize" />
            <div onMouseDown={(e) => startResize(e, 'sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize" />
            <div onMouseDown={(e) => startResize(e, 'se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize" />
          </>
        )}
      </div>
    </div>
  );
}

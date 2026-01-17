import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faClock, faBolt, faUser, faCog, faHistory, faDesktop, faCrown } from '@fortawesome/free-solid-svg-icons';
import { useWebRTC } from '../../../../hooks/useWebRTC';
import { useAuthStore } from '../../../../store/authStore';
import { supabase } from '../../../../lib/supabase';
import { CallSessionService } from '@4space/shared/src/services/callSession.service';
import { CallHistoryService } from '@4space/shared/src/services/callHistory.service';
import { ProfessionalCallWindow } from '../calls/ProfessionalCallWindow';
import { CreateSessionModal } from '../calls/CreateSessionModal';
import type { CallSession, CallHistoryEntry } from '@4space/shared/src/types/callSession.types';

interface RoomCallPanelProps {
  roomId?: string;
  roomName?: string;
  mode: 'voice' | 'video';
  onModeChange: (mode: 'voice' | 'video') => void;
}

export function RoomCallPanel({ roomId, roomName, mode, onModeChange }: RoomCallPanelProps) {
  const { user } = useAuthStore();
  const isVoice = mode === 'voice';

  // Services
  const callSessionServiceRef = useRef<CallSessionService | null>(null);
  const callHistoryServiceRef = useRef<CallHistoryService | null>(null);

  // Session and history state
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [activeSessions, setActiveSessions] = useState<CallSession[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const {
    isInCall,
    isConnecting,
    localStream,
    remoteStreams,
    participants,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoOff,
    error
  } = useWebRTC(roomId || '', user?.id || '', (user as any)?.user_metadata?.display_name || (user as any)?.user_metadata?.username || user?.email || 'You');

  const handleStartCall = async (sessionData?: any) => {
    if (!roomId || !user?.id) {
      alert('Please select a room first');
      return;
    }

    try {
      console.log('[RoomCallPanel] Starting call...');
      const startTime = new Date();
      setCallStartTime(startTime);

      // Initialize services if not already done
      if (!callSessionServiceRef.current) {
        callSessionServiceRef.current = new CallSessionService(
          supabase,
          roomId,
          user.id
        );

        // Set up listeners
        callSessionServiceRef.current.onSessionCreated = (session) => {
          console.log('[RoomCallPanel] Session created:', session);
          setActiveSessions(prev => {
            const exists = prev.some(s => s.id === session.id);
            if (exists) return prev;
            return [...prev, session];
          });
        };

        callSessionServiceRef.current.onSessionEnded = (sessionId) => {
          console.log('[RoomCallPanel] Session ended:', sessionId);
          setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
        };
      }

      // Create session using the service
      console.log('[RoomCallPanel] Creating session with data:', sessionData);
      const session = await callSessionServiceRef.current.createSession({
        roomName: roomName || 'Unknown Room',
        hostName: (user as any)?.user_metadata?.display_name || (user as any)?.user_metadata?.username || user?.email || 'Unknown',
        title: sessionData?.title || `${isVoice ? 'Voice' : 'Video'} Call`,
        description: sessionData?.description,
        purpose: sessionData?.purpose,
        guidelines: sessionData?.guidelines,
        type: sessionData?.type || (isVoice ? 'voice' : 'video'),
        maxParticipants: sessionData?.maxParticipants,
        requiresApproval: sessionData?.requiresApproval || false,
      });

      console.log('[RoomCallPanel] Session created:', session);

      // Store the session ID for later use
      setCurrentSessionId(session.id);

      // Add to local active sessions immediately for UI feedback
      setActiveSessions(prev => {
        const exists = prev.some(s => s.id === session.id);
        if (exists) return prev;
        return [...prev, session];
      });

      // Store in localStorage as fallback
      try {
        const sessionsKey = `active_sessions_${roomId}`;
        const existing = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
        const exists = existing.some((s: any) => s.id === session.id);
        if (!exists) {
          existing.push(session);
          localStorage.setItem(sessionsKey, JSON.stringify(existing));
          console.log('[RoomCallPanel] Stored session in localStorage');
        }
      } catch (err) {
        console.error('[RoomCallPanel] Failed to store session in localStorage:', err);
      }

      await startCall(!isVoice);
    } catch (err) {
      console.error('Failed to start call:', err);
      alert(`Call failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEndCall = async () => {
    console.log('[RoomCallPanel] Ending call...');

    // End session using service
    if (callSessionServiceRef.current) {
      try {
        await callSessionServiceRef.current.endSession();
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    }

    // Remove from localStorage
    try {
      const sessionsKey = `active_sessions_${roomId}`;
      const stored = localStorage.getItem(sessionsKey);
      if (stored) {
        const sessions = JSON.parse(stored);
        const updated = sessions.filter((s: any) => s.hostId !== user?.id);
        localStorage.setItem(sessionsKey, JSON.stringify(updated));
        console.log('[RoomCallPanel] Removed session from localStorage');
      }
    } catch (err) {
      console.error('[RoomCallPanel] Failed to remove session from localStorage:', err);
    }

    // Save to call history
    if (callStartTime && callHistoryServiceRef.current) {
      try {
        await callHistoryServiceRef.current.saveCallHistory({
          sessionId: currentSessionId || `session_${callStartTime.getTime()}`,
          roomId: roomId || '',
          roomName: roomName || 'Unknown Room',
          type: isVoice ? 'voice' : 'video',
          startedAt: callStartTime,
          endedAt: new Date(),
          duration: Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000),
          participants: participants.map(p => ({
            userId: p.userId,
            displayName: p.displayName,
            joinedAt: callStartTime,
            leftAt: new Date(),
          })),
          wasHost: true,
          quality: 'good', // Will be calculated by service
        });

        // Reload call history after saving
        const updatedHistory = await callHistoryServiceRef.current!.getRecentCalls(roomId || '');
        setCallHistory(updatedHistory.slice(0, 10));
        console.log('[RoomCallPanel] Reloaded call history after saving');
      } catch (err) {
        console.error('Failed to save call history:', err);
      }
    }

    setCallStartTime(null);
    setCurrentSessionId(null);
    endCall();
  };

  const handleCreateSession = (data: any) => {
    setShowCreateSession(false);
    handleStartCall(data);
  };

  const handleJoinSession = (sessionId: string) => {
    // Find and join the session
    const session = activeSessions.find(s => s.id === sessionId);
    if (session) {
      handleStartCall({
        title: session.title,
        description: session.description,
        purpose: session.purpose,
        guidelines: session.guidelines,
        type: session.type,
        maxParticipants: session.maxParticipants,
        requiresApproval: session.requiresApproval,
      });
    }
  };

  // Load active sessions and call history on mount
  useEffect(() => {
    if (!roomId || !user?.id) return;

    // Initialize services
    console.log('[RoomCallPanel] Initializing services for room:', roomId, 'user:', user.id);
    callSessionServiceRef.current = new CallSessionService(
      supabase,
      roomId,
      user.id
    );

    callHistoryServiceRef.current = new CallHistoryService(
      supabase,
      user.id
    );

    // Set up session listeners immediately
    callSessionServiceRef.current.onSessionCreated = (session) => {
      console.log('[RoomCallPanel] Session created:', session);
      setActiveSessions(prev => {
        const exists = prev.some(s => s.id === session.id);
        if (exists) return prev;
        return [...prev, session];
      });
    };

    callSessionServiceRef.current.onSessionEnded = (sessionId) => {
      console.log('[RoomCallPanel] Session ended:', sessionId);
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    };

    // Subscribe to the room's call session channel
    const setupRealtimeSubscription = async () => {
      try {
        // Create a dedicated channel for call sessions
        const channel = supabase.channel(`call-session-${roomId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: user?.id || 'anonymous' }
          },
        });

        channel
          .on('broadcast', { event: 'session-created' }, ({ payload }) => {
            console.log('[RoomCallPanel] Received session-created broadcast:', payload, 'for room:', roomId);
            setActiveSessions(prev => {
              const exists = prev.some(s => s.id === payload.id);
              if (exists) return prev;
              return [...prev, { ...payload, isActive: true }];
            });
          })
          .on('broadcast', { event: 'session-ended' }, ({ payload }) => {
            console.log('[RoomCallPanel] Received session-ended broadcast:', payload);
            setActiveSessions(prev => prev.filter(s => s.id !== payload.sessionId));
          })
          .on('broadcast', { event: 'session-updated' }, ({ payload }) => {
            console.log('[RoomCallPanel] Received session-updated broadcast:', payload);
            setActiveSessions(prev => prev.map(s => s.id === payload.id ? { ...s, ...payload } : s));
          });

        // Also listen for localStorage events as fallback
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === `active_sessions_${roomId}` && e.newValue) {
            try {
              const sessions = JSON.parse(e.newValue).map((s: any) => ({
                ...s,
                startedAt: new Date(s.startedAt),
              }));
              console.log('[RoomCallPanel] Received localStorage sessions:', sessions.length);
              setActiveSessions(sessions);
            } catch (err) {
              console.error('[RoomCallPanel] Failed to parse localStorage sessions:', err);
            }
          }
        };

        window.addEventListener('storage', handleStorageChange);

        const status = await channel.subscribe((status) => {
          console.log('[RoomCallPanel] Channel subscription status:', status);
        });

        console.log('[RoomCallPanel] Subscribed to call-session channel, status:', status);
      } catch (err) {
        console.error('[RoomCallPanel] Failed to setup realtime subscription:', err);
      }
    };

    setupRealtimeSubscription();

    // Load initial data
    const loadData = async () => {
      try {
        console.log('[RoomCallPanel] Loading initial data for room:', roomId);

        // Check room membership
        const { data: membership, error: membershipError } = await supabase
          .from('room_members')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', user.id)
          .single();

        console.log('[RoomCallPanel] Room membership check:', {
          roomId,
          userId: user.id,
          membership,
          membershipError,
          isMember: !!membership
        });

        // Load active sessions
        const sessions = await callSessionServiceRef.current!.getActiveSessions();
        console.log('[RoomCallPanel] Loaded active sessions:', sessions.length, sessions);
        setActiveSessions(sessions);

        // Load call history
        const history = await callHistoryServiceRef.current!.getRecentCalls(roomId);
        console.log('[RoomCallPanel] Loaded call history:', history.length);
        setCallHistory(history.slice(0, 10));
      } catch (err) {
        console.error('[RoomCallPanel] Failed to load call data:', err);
        // Fallback to localStorage for history
        try {
          const stored = localStorage.getItem('call_history');
          if (stored) {
            const parsed = JSON.parse(stored);
            const history = parsed.map((entry: any) => ({
              ...entry,
              startedAt: new Date(entry.startedAt),
              endedAt: new Date(entry.endedAt),
              participants: entry.participants.map((p: any) => ({
                ...p,
                joinedAt: new Date(p.joinedAt),
                leftAt: new Date(p.leftAt),
              })),
            }));
            setCallHistory(history.slice(0, 10));
            console.log('[RoomCallPanel] Loaded history from localStorage:', history.length);
          }
        } catch (fallbackErr) {
          console.error('[RoomCallPanel] Fallback history load failed:', fallbackErr);
        }
      }
    };

    loadData();

    // Poll for active sessions every 30 seconds as fallback
    const pollInterval = setInterval(async () => {
      if (callSessionServiceRef.current) {
        try {
          const sessions = await callSessionServiceRef.current.getActiveSessions();
          console.log('[RoomCallPanel] Polled active sessions:', sessions.length);
          setActiveSessions(prev => {
            // Merge with existing sessions, preferring newer data
            const existingIds = new Set(prev.map(s => s.id));
            const newSessions = sessions.filter(s => !existingIds.has(s.id));
            return [...prev, ...newSessions];
          });
        } catch (err) {
          console.error('[RoomCallPanel] Poll failed:', err);
        }
      }
    }, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval);
      if (callSessionServiceRef.current) {
        callSessionServiceRef.current.cleanup();
        callSessionServiceRef.current = null;
      }
      callHistoryServiceRef.current = null;
    };
  }, [roomId, user?.id]);

  // Debug logging
  useEffect(() => {
    console.log('[RoomCallPanel] State:', {
      isInCall,
      isConnecting,
      participantCount: participants.length,
      hasLocalStream: !!localStream,
      remoteStreamCount: remoteStreams.size,
    });
  }, [isInCall, isConnecting, participants.length, localStream, remoteStreams]);

  // Show professional call window when in call
  if (isInCall) {
    return (
      <>
        <ProfessionalCallWindow
          isInCall={isInCall}
          isVideo={!isVoice}
          localStream={localStream}
          remoteStreams={remoteStreams}
          participants={participants}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={handleEndCall}
          roomName={roomName}
        />

        {/* Sidebar Panel - Quick Info */}
        <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isVoice ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <FontAwesomeIcon icon={isVoice ? faPhone : faVideo} className={isVoice ? 'text-green-400 text-sm' : 'text-red-400 text-sm'} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">Active Call</h3>
              <p className="text-xs text-gray-500">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-800/60 p-4">
            <p className="text-xs text-gray-400 mb-2">
              The call window is now open. You can move and resize it, or minimize it to continue chatting.
            </p>
            <div className="flex gap-2 text-xs">
              <div className="flex-1 bg-zinc-900/50 rounded-lg p-2 text-center">
                <div className="text-cyan-400 font-semibold">{participants.length}</div>
                <div className="text-gray-500">Participants</div>
              </div>
              <div className="flex-1 bg-zinc-900/50 rounded-lg p-2 text-center">
                <div className="text-green-400 font-semibold">{isVoice ? 'Voice' : 'Video'}</div>
                <div className="text-gray-500">Mode</div>
              </div>
            </div>
          </div>

          {/* Participants Preview */}
          {participants.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">In Call</h4>
              <div className="space-y-1">
                {participants.slice(0, 5).map((participant) => (
                  <div key={participant.userId} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {participant.avatar ? (
                        <img src={participant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-[10px] text-white" />
                      )}
                    </div>
                    <span className="text-xs text-white truncate">{participant.displayName}</span>
                  </div>
                ))}
                {participants.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{participants.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>
      </>
    );
  }

  // Show setup UI when not in a call
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isVoice ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <FontAwesomeIcon icon={isVoice ? faPhone : faVideo} className={isVoice ? 'text-green-400 text-sm' : 'text-red-400 text-sm'} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Call Center</h3>
            <p className="text-xs text-gray-500">{roomName ? `Room #${roomName}` : 'Start a room call'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateSession(true)}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition"
        >
          <FontAwesomeIcon icon={faCog} className="mr-1.5" />
          Advanced
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onModeChange('voice')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            isVoice ? 'bg-green-500/20 text-green-300' : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-800'
          }`}
        >
          <FontAwesomeIcon icon={faPhone} className="mr-2" />
          Voice
        </button>
        <button
          onClick={() => onModeChange('video')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            !isVoice ? 'bg-red-500/20 text-red-300' : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-800'
          }`}
        >
          <FontAwesomeIcon icon={faVideo} className="mr-2" />
          Video
        </button>
      </div>

      <div className="rounded-xl bg-zinc-800/60 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBolt} className="text-green-400 text-xs" />
          <p className="text-xs font-semibold text-gray-300">Ready to call</p>
        </div>
        <p className="text-xs text-gray-500">
          Start a professional {isVoice ? 'voice' : 'video'} call with room members.
        </p>
        <button
          onClick={handleStartCall}
          disabled={isConnecting || !roomId}
          className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isVoice ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Connecting...
            </div>
          ) : (
            `Start ${isVoice ? 'Voice' : 'Video'} Call`
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <FontAwesomeIcon icon={faVideo} className="text-cyan-400 text-xs" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Sessions</h4>
                <p className="text-xs text-gray-500">{activeSessions.length} active now</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {activeSessions.map((session) => {
              const isHost = session.hostId === user?.id;
              return (
                <div key={session.id} className="rounded-lg bg-zinc-800/40 p-3 hover:bg-zinc-800/60 transition border border-zinc-700/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        session.type === 'video' ? 'bg-red-500/20' : session.type === 'voice' ? 'bg-green-500/20' : 'bg-cyan-500/20'
                      }`}>
                        <FontAwesomeIcon
                          icon={session.type === 'video' ? faVideo : session.type === 'voice' ? faPhone : faDesktop}
                          className={`text-xs ${
                            session.type === 'video' ? 'text-red-400' : session.type === 'voice' ? 'text-green-400' : 'text-cyan-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-white text-xs font-semibold truncate">{session.title}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <FontAwesomeIcon icon={faCrown} className="text-yellow-500" />
                            {session.hostName}
                          </span>
                          <span className="text-gray-600 text-xs">•</span>
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <FontAwesomeIcon icon={faUser} />
                            {session.participantCount}
                          </span>
                        </div>
                        {session.description && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-1">{session.description}</p>
                        )}
                      </div>
                    </div>
                    {!isHost && (
                      <button
                        onClick={() => handleJoinSession(session.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition flex-shrink-0"
                      >
                        Join
                      </button>
                    )}
                    {isHost && (
                      <div className="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-semibold flex-shrink-0 whitespace-nowrap">
                        Host
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Call History */}
      <div>
        <div className="flex items-center justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Call History</h4>
              <p className="text-xs text-gray-500">Recent calls</p>
            </div>
          </div>
          {callHistory.length > 0 && (
            <button className="text-xs text-cyan-400 hover:text-cyan-300">
              <FontAwesomeIcon icon={faHistory} className="mr-1" />
              View All
            </button>
          )}
        </div>

        {callHistory.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-xs text-gray-500">
            <FontAwesomeIcon icon={faPhone} className="text-gray-600 text-lg mb-2 block mx-auto" />
            No recent calls
          </div>
        ) : (
          <div className="space-y-2">
            {callHistory.slice(0, 5).map((entry) => {
              const duration = Math.floor(entry.duration / 60);
              const seconds = entry.duration % 60;
              return (
                <div key={entry.id} className="rounded-lg bg-zinc-800/40 p-3 hover:bg-zinc-800/60 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        entry.type === 'video' ? 'bg-red-500/20' : 'bg-green-500/20'
                      }`}>
                        <FontAwesomeIcon
                          icon={entry.type === 'video' ? faVideo : faPhone}
                          className={`text-xs ${entry.type === 'video' ? 'text-red-400' : 'text-green-400'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-white text-xs font-semibold truncate">{entry.roomName}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 text-xs">
                            {entry.startedAt.toLocaleDateString()} • {entry.startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-400 text-xs">
                            {duration}m {seconds}s
                          </span>
                          <span className="text-gray-600 text-xs">•</span>
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <FontAwesomeIcon icon={faUser} />
                            {entry.participants.length}
                          </span>
                          <span className="text-gray-600 text-xs">•</span>
                          <span className={`text-xs ${
                            entry.quality === 'excellent' ? 'text-green-400' :
                            entry.quality === 'good' ? 'text-cyan-400' :
                            entry.quality === 'fair' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {entry.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <CreateSessionModal
          onClose={() => setShowCreateSession(false)}
          onCreate={handleCreateSession}
          defaultType={isVoice ? 'voice' : 'video'}
        />
      )}
    </div>
  );
}

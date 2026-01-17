// Active Sessions List - Join ongoing sessions
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faPhone, faDesktop, faUsers, faCrown, faLock, faPlay } from '@fortawesome/free-solid-svg-icons';
import type { CallSession } from '@4space/shared/src/types/callSession.types';

interface SessionsListProps {
  sessions: CallSession[];
  onJoinSession: (sessionId: string) => void;
  currentUserId: string;
}

export function SessionsList({ sessions, onJoinSession, currentUserId }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <div className="p-6 text-center">
        <FontAwesomeIcon icon={faVideo} className="text-gray-600 text-3xl mb-2" />
        <p className="text-gray-400 text-sm">No active sessions</p>
        <p className="text-gray-500 text-xs mt-1">Start a call to create a session</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Active Sessions</h3>
      {sessions.map((session) => {
        const isHost = session.hostId === currentUserId;
        const isFull = session.maxParticipants ? session.participantCount >= session.maxParticipants : false;
        const icon = session.type === 'video' ? faVideo : session.type === 'voice' ? faPhone : faDesktop;

        return (
          <div key={session.id} className="bg-zinc-800/60 rounded-lg p-3 hover:bg-zinc-800 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  session.type === 'video' ? 'bg-red-500/20' : session.type === 'voice' ? 'bg-green-500/20' : 'bg-cyan-500/20'
                }`}>
                  <FontAwesomeIcon icon={icon} className={`text-sm ${
                    session.type === 'video' ? 'text-red-400' : session.type === 'voice' ? 'text-green-400' : 'text-cyan-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold truncate">{session.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <FontAwesomeIcon icon={faCrown} className="text-yellow-500" />
                      {session.hostName}
                    </span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <FontAwesomeIcon icon={faUsers} />
                      {session.participantCount}
                      {session.maxParticipants && `/${session.maxParticipants}`}
                    </span>
                    {session.requiresApproval && (
                      <>
                        <span className="text-gray-500 text-xs">•</span>
                        <FontAwesomeIcon icon={faLock} className="text-gray-500 text-xs" title="Requires approval" />
                      </>
                    )}
                  </div>

                  {session.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{session.description}</p>
                  )}

                  {session.purpose && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-zinc-900/50 px-2 py-0.5 rounded text-xs text-cyan-400">
                      {session.purpose}
                    </div>
                  )}

                  {session.guidelines && session.guidelines.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-400">Guidelines:</p>
                      <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5">
                        {session.guidelines.slice(0, 2).map((guideline, idx) => (
                          <li key={idx} className="truncate">{guideline}</li>
                        ))}
                        {session.guidelines.length > 2 && (
                          <li className="text-cyan-400">+{session.guidelines.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {!isHost && (
                <button
                  onClick={() => onJoinSession(session.id)}
                  disabled={isFull}
                  className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isFull
                      ? 'bg-zinc-700 text-gray-500 cursor-not-allowed'
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Join
                </button>
              )}
              {isHost && (
                <div className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                  Host
                </div>
              )}
            </div>

            {session.isRecording && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-semibold">Recording in progress</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

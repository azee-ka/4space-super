// Call Sidebar - Participants, Chat, and More
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faComment,
  faInfoCircle,
  faUser,
  faMicrophoneSlash,
  faVideoSlash,
  faHandPaper,
  faCrown,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';

interface CallSidebarProps {
  participants: CallParticipant[];
  showChat: boolean;
  onToggleChat: (show: boolean) => void;
}

type SidebarTab = 'participants' | 'chat' | 'info';

export function CallSidebar({ participants, showChat, onToggleChat }: CallSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('participants');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string; time: string }>>([]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages([
      ...chatMessages,
      { user: 'You', message: chatMessage, time: timeStr },
    ]);
    setChatMessage('');
  };

  return (
    <div className="w-80 bg-zinc-800 border-l border-zinc-700 flex flex-col">
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-zinc-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'participants'
                ? 'bg-zinc-700 text-white border-b-2 border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            Participants ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-zinc-700 text-white border-b-2 border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
            }`}
          >
            <FontAwesomeIcon icon={faComment} className="mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'info'
                ? 'bg-zinc-700 text-white border-b-2 border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
            }`}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            Info
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'participants' && (
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">In Call ({participants.length})</h3>
              <button className="text-gray-400 hover:text-white text-xs">
                Mute All
              </button>
            </div>

            {participants.map((participant, index) => (
              <div
                key={participant.userId}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-700/50 transition group"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                    )}
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm truncate">
                      {participant.displayName}
                      {index === 0 && ' (You)'}
                    </p>
                    {index === 0 && (
                      <FontAwesomeIcon icon={faCrown} className="text-yellow-500 text-xs" title="Host" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {participant.isMuted && (
                      <span className="text-red-400 text-xs flex items-center gap-1">
                        <FontAwesomeIcon icon={faMicrophoneSlash} />
                        Muted
                      </span>
                    )}
                    {participant.isVideoOff && (
                      <span className="text-red-400 text-xs flex items-center gap-1">
                        <FontAwesomeIcon icon={faVideoSlash} />
                        Video off
                      </span>
                    )}
                    {!participant.isMuted && (
                      <span className="text-green-400 text-xs">Speaking</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button className="opacity-0 group-hover:opacity-100 transition w-8 h-8 rounded-lg hover:bg-zinc-600 flex items-center justify-center text-gray-400 hover:text-white">
                  <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <FontAwesomeIcon icon={faComment} className="text-gray-600 text-3xl mb-2" />
                    <p className="text-gray-400 text-sm">No messages yet</p>
                    <p className="text-gray-500 text-xs mt-1">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-xs">{msg.user}</span>
                      <span className="text-gray-500 text-xs">{msg.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm bg-zinc-700/50 rounded-lg p-2">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Send a message..."
                  className="flex-1 bg-zinc-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Call Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Participants</span>
                  <span className="text-white">{participants.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quality</span>
                  <span className="text-green-400">HD</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-700 pt-4">
              <h4 className="text-white font-semibold text-sm mb-2">Settings</h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400 text-sm">Recording</span>
                  <input type="checkbox" className="toggle" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400 text-sm">Waiting Room</span>
                  <input type="checkbox" className="toggle" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400 text-sm">Lock Call</span>
                  <input type="checkbox" className="toggle" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

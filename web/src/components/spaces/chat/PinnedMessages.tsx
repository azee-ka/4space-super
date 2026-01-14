// Pinned Messages Component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faThumbtack, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import type { Message } from '@4space/shared/src/services/messages.service';

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  onClose: () => void;
  onUnpin: (messageId: string) => void;
  onScrollToMessage: (messageId: string) => void;
}

export function PinnedMessages({
  pinnedMessages,
  onClose,
  onUnpin,
  onScrollToMessage,
}: PinnedMessagesProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faThumbtack} className="text-yellow-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Pinned Messages</h2>
              <p className="text-xs text-gray-400">{pinnedMessages.length} pinned</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Pinned Messages List */}
      <div className="flex-1 overflow-y-auto p-4">
        {pinnedMessages.length > 0 ? (
          <div className="space-y-3">
            {pinnedMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 hover:border-yellow-500/30 transition-colors cursor-pointer group"
                onClick={() => onScrollToMessage(message.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {message.sender?.avatar_url ? (
                      <img
                        src={message.sender.avatar_url}
                        alt={message.sender.display_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {message.sender?.display_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} />
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin(message.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-xs transition-all"
                  >
                    Unpin
                  </button>
                </div>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {message.content}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FontAwesomeIcon icon={faThumbtack} className="text-6xl text-gray-700 mb-4" />
            <p className="text-gray-400">No pinned messages</p>
            <p className="text-xs text-gray-600 mt-2">Pin important messages to see them here</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

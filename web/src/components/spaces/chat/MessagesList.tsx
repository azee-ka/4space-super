// Beautiful Messages List Component - NO EXTERNAL DATE DEPENDENCIES
// web/src/components/spaces/chat/MessagesList.tsx

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReply, faEdit, faTrash, faThumbtack,
  faBookmark, faSmile, faCheck, faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@4space/shared/src/services/messages.service';
import { formatMessageTime } from '@4space/shared/src/utils/formatDate';

interface MessagesListProps {
  messages: Message[];
  currentUserId?: string;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingMore: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string, pinned: boolean) => void;
  onBookmark: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  typingUsers?: Map<string, any>;
}

export function MessagesList({
  messages,
  currentUserId,
  onLoadMore,
  hasMore,
  isLoading,
  isFetchingMore,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onBookmark,
  onReaction,
  typingUsers = new Map(),
}: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle scroll for loading more
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;
    
    if (scrollTop === 0 && hasMore && !isFetchingMore) {
      onLoadMore();
    }
  };

  const typingUsersList = Array.from(typingUsers.values());

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto custom-scrollbar px-6 py-4 space-y-3"
    >
      {/* Load More Indicator */}
      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Messages */}
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const isOwn = message.sender_id === currentUserId;
          const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onPin={onPin}
              onBookmark={onBookmark}
              onReaction={onReaction}
            />
          );
        })}
      </AnimatePresence>

      {/* Typing Indicator */}
      {typingUsersList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2 px-4 py-2"
        >
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-400">
            {typingUsersList[0].username} is typing...
          </span>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

// Individual Message Bubble Component
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string, pinned: boolean) => void;
  onBookmark: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onBookmark,
  onReaction,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {message.sender?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      )}
      {!showAvatar && !isOwn && <div className="w-9" />}

      <div className={`flex-1 max-w-2xl ${isOwn ? 'flex flex-col items-end' : ''}`}>
        {/* Message Content */}
        <div className="relative">
          {/* Actions Bar (appears on hover) */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className={`absolute -top-9 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 bg-zinc-900/95 backdrop-blur-xl rounded-xl p-1.5 shadow-xl border border-zinc-800/50 z-10`}
              >
                <button
                  onClick={() => onReaction(message.id, '👍')}
                  className="w-8 h-8 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 flex items-center justify-center transition-all group/btn"
                  title="Quick react"
                >
                  <FontAwesomeIcon icon={faSmile} className="text-yellow-400 text-sm group-hover/btn:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => onReply(message)}
                  className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-all group/btn"
                  title="Reply"
                >
                  <FontAwesomeIcon icon={faReply} className="text-blue-400 text-sm group-hover/btn:scale-110 transition-transform" />
                </button>
                {isOwn && (
                  <button
                    onClick={() => onEdit(message)}
                    className="w-8 h-8 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-all group/btn"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-purple-400 text-sm group-hover/btn:scale-110 transition-transform" />
                  </button>
                )}
                <button
                  onClick={() => onBookmark(message.id)}
                  className="w-8 h-8 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 flex items-center justify-center transition-all group/btn"
                  title="Bookmark"
                >
                  <FontAwesomeIcon icon={faBookmark} className="text-pink-400 text-sm group-hover/btn:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => onPin(message.id, !message.is_pinned)}
                  className="w-8 h-8 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center transition-all group/btn"
                  title="Pin"
                >
                  <FontAwesomeIcon icon={faThumbtack} className="text-orange-400 text-sm group-hover/btn:scale-110 transition-transform" />
                </button>
                {isOwn && (
                  <button
                    onClick={() => onDelete(message.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all group/btn"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-red-400 text-sm group-hover/btn:scale-110 transition-transform" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 ${
              isOwn
                ? 'bg-cyan-500/10 border border-cyan-500/30'
                : 'bg-zinc-800/70 border border-zinc-700/50'
            }`}
          >
            {/* Sender Name (if not own message) */}
            {!isOwn && showAvatar && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-cyan-400">
                  {message.sender?.username || 'Unknown'}
                </span>
              </div>
            )}

            {/* Reply To (if replying) */}
            {message.reply_to && typeof message.reply_to === 'object' && 'content' in message.reply_to && (
              <div className="mb-2 pl-3 border-l-2 border-purple-500/50">
                <p className="text-xs text-gray-500">
                  Replying to <span className="text-purple-400">{message.reply_to.sender?.username}</span>
                </p>
                <p className="text-xs text-gray-400 truncate">{message.reply_to.content}</p>
              </div>
            )}

            {/* Content */}
            <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction: any) => (
                  <button
                    key={reaction.id}
                    onClick={() => onReaction(message.id, reaction.emoji)}
                    className="px-2 py-1 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors flex items-center gap-1"
                  >
                    <span className="text-sm">{reaction.emoji}</span>
                    <span className="text-xs text-gray-400">{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timestamp & Status */}
          <div className={`flex items-center gap-2 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
            {isOwn && (
              <FontAwesomeIcon
                icon={message.read_by?.length > 0 ? faCheckDouble : faCheck}
                className={`text-xs ${message.read_by?.length > 0 ? 'text-cyan-500' : 'text-gray-500'}`}
              />
            )}
            {message.is_edited && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
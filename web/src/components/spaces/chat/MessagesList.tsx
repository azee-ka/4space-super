// Messages List with Grouping & Timeline Separators - COMPLETE
// web/src/components/spaces/chat/MessagesList.tsx

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@4space/shared/src/services/messages.service';
import { MessageItem } from './MessageItem';

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
  onRemoveReaction,
  typingUsers = new Map(),
}: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages (only if already at bottom)
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Handle scroll for loading more
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;
    
    if (scrollTop === 0 && hasMore && !isFetchingMore) {
      onLoadMore();
    }
  }, [hasMore, isFetchingMore, onLoadMore]);

  // Scroll to specific message
  const scrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight effect
      element.classList.add('ring-2', 'ring-cyan-500/50', 'rounded-xl');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-cyan-500/50', 'rounded-xl');
      }, 2000);
    }
  }, []);

  // Group messages and determine timeline breaks
  const getMessageGroups = () => {
    const groups: Array<{
      date: string;
      messages: Array<{
        message: Message;
        isFirstInGroup: boolean;
        isLastInGroup: boolean;
      }>;
    }> = [];

    let currentDate = '';
    let currentGroup: Array<{
      message: Message;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
    }> = [];
    let currentSender = '';
    let lastMessageTime = 0;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.created_at);
      const messageDateStr = messageDate.toLocaleDateString();
      const messageTime = messageDate.getTime();

      // Check if we need a new date separator
      if (messageDateStr !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
          currentGroup = [];
        }
        currentDate = messageDateStr;
      }

      // Determine if this starts a new message group (5 minutes gap or different sender)
      const isNewGroup = 
        message.sender_id !== currentSender || 
        messageTime - lastMessageTime > 300000; // 5 minutes

      if (isNewGroup && currentGroup.length > 0) {
        // Mark last message in previous group
        currentGroup[currentGroup.length - 1].isLastInGroup = true;
      }

      currentGroup.push({
        message,
        isFirstInGroup: isNewGroup,
        isLastInGroup: false, // Will be updated
      });

      currentSender = message.sender_id;
      lastMessageTime = messageTime;

      // If this is the last message, mark it
      if (index === messages.length - 1) {
        currentGroup[currentGroup.length - 1].isLastInGroup = true;
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const messageGroups = getMessageGroups();
  const typingUsersList = Array.from(typingUsers.values());

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto custom-scrollbar bg-black"
    >
      {/* Load More Indicator */}
      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Messages with Date Separators */}
      <div className="py-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={`${group.date}-${groupIndex}`}>
            {/* Date Separator */}
            <div className="flex justify-center my-6">
              <div className="px-4 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                <span className="text-xs font-medium text-gray-400">
                  {formatDateSeparator(group.date)}
                </span>
              </div>
            </div>

            {/* Messages in this date group */}
            <AnimatePresence initial={false}>
              {group.messages.map(({ message, isFirstInGroup, isLastInGroup }) => {
                const isOwn = message.sender_id === currentUserId;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageItem
                      message={message}
                      isOwn={isOwn}
                      showAvatar={!isOwn}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onPin={onPin}
                      onBookmark={onBookmark}
                      onReaction={onReaction}
                      onRemoveReaction={onRemoveReaction}
                      onScrollToMessage={scrollToMessage}
                      currentUserId={currentUserId}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {typingUsersList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2 px-6 py-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {typingUsersList[0].user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-zinc-800/90 shadow-lg">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
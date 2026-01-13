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
  optimisticMessages?: any[]; // Messages being sent
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
  optimisticMessages = [],
}: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasInitialScrolledRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const isLoadingRef = useRef(false);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = false) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
    isNearBottomRef.current = true;
  }, []);

  // Check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    if (!containerRef.current) return false;
    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Initial scroll to bottom
  useEffect(() => {
    if (isLoading || !containerRef.current || hasInitialScrolledRef.current) return;
    if (messages.length === 0) return;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom(false);
        hasInitialScrolledRef.current = true;
        lastMessageCountRef.current = messages.length;
      });
    });
  }, [isLoading, messages.length, scrollToBottom]);

  // Handle new messages - simplified for speed
  useEffect(() => {
    if (!hasInitialScrolledRef.current || isLoading) return;
    
    const totalCount = messages.length;
    const hasNew = totalCount > lastMessageCountRef.current;
    
    // Only auto-scroll if user is near bottom and new message arrived
    if (hasNew && isNearBottomRef.current && !isLoadingRef.current) {
      // Use immediate scroll (not smooth) for instant feedback
      scrollToBottom(false);
    }
    
    lastMessageCountRef.current = totalCount;
  }, [messages.length, isLoading, scrollToBottom]);

  // Restore scroll after loading older messages
  useEffect(() => {
    if (isFetchingMore) return;
    if (!isLoadingRef.current) return;
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const newHeight = container.scrollHeight;
    const heightDiff = newHeight - lastScrollHeightRef.current;
    
    if (heightDiff > 0) {
      // Restore position - user sees same messages in view
      container.scrollTop = lastScrollTopRef.current + heightDiff;
    }
    
    isLoadingRef.current = false;
    lastScrollHeightRef.current = 0;
    lastScrollTopRef.current = 0;
  }, [isFetchingMore, messages.length]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Track if near bottom
    isNearBottomRef.current = checkIfNearBottom();
    
    // Load more when near top
    if (scrollTop < 200 && hasMore && !isFetchingMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      lastScrollHeightRef.current = scrollHeight;
      lastScrollTopRef.current = scrollTop;
      onLoadMore();
    }
  }, [hasMore, isFetchingMore, onLoadMore, checkIfNearBottom]);

  // Scroll to specific message
  const scrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element && containerRef.current) {
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
    const allMessages = [...messages, ...optimisticMessages];
    
    const groups: Array<{
      date: string;
      messages: Array<{
        message: Message;
        isFirstInGroup: boolean;
        isLastInGroup: boolean;
        isOptimistic?: boolean;
      }>;
    }> = [];

    let currentDate = '';
    let currentGroup: Array<{
      message: Message;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
      isOptimistic?: boolean;
    }> = [];
    let currentSender = '';
    let lastMessageTime = 0;

    allMessages.forEach((message, index) => {
      const messageDate = new Date(message.created_at || Date.now());
      const messageDateStr = messageDate.toLocaleDateString();
      const messageTime = messageDate.getTime();
      const isOptimistic = !message.id || message.id.startsWith('optimistic-');

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
        isLastInGroup: false,
        isOptimistic,
      });

      currentSender = message.sender_id;
      lastMessageTime = messageTime;

      // If this is the last message, mark it
      if (index === allMessages.length - 1) {
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
  
  // Debug typing indicator
  if (typingUsersList.length > 0) {
    console.log('[MessagesList] Typing users:', typingUsersList);
  }

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (typingUsersList.length > 0 && isNearBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [typingUsersList.length, scrollToBottom]);

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
      data-messages-container
      className="h-full overflow-y-auto bg-black"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#3f3f46 #18181b',
      }}
    >
      <style>{`
        [data-messages-container]::-webkit-scrollbar {
          width: 8px;
        }
        [data-messages-container]::-webkit-scrollbar-track {
          background: #18181b;
        }
        [data-messages-container]::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 4px;
        }
        [data-messages-container]::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
      {/* Load More Indicator */}
      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <div className="px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/50 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <span className="text-xs text-gray-400">Loading messages...</span>
          </div>
        </div>
      )}

      {/* Messages with Date Separators */}
      <div className="py-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={`${group.date}-${groupIndex}`}>
            {/* Date Separator */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center my-6"
            >
              <div className="px-4 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
                <span className="text-xs font-medium text-gray-400">
                  {formatDateSeparator(group.date)}
                </span>
              </div>
            </motion.div>

            {/* Messages in this date group */}
            <AnimatePresence initial={false} mode="popLayout">
              {group.messages.map(({ message, isFirstInGroup, isLastInGroup, isOptimistic }) => {
                const isOwn = message.sender_id === currentUserId;

                return (
                  <motion.div
                    key={message.id || `optimistic-${message.created_at}`}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ 
                      opacity: isOptimistic ? 0.7 : 1, 
                      y: 0, 
                      scale: 1 
                    }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                      mass: 0.5
                    }}
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

      <div ref={messagesEndRef} />

      {/* Typing Indicator - Always at bottom */}
      {typingUsersList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2 px-6 py-2 pb-4"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(typingUsersList[0].username || typingUsersList[0].user?.username)?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-zinc-800/90 shadow-lg">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
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
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const wasFetchingRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = false) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
    isNearBottomRef.current = true;
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
    if (hasNew && isNearBottomRef.current) {
      // Use immediate scroll (not smooth) for instant feedback
      scrollToBottom(false);
    }
    
    lastMessageCountRef.current = totalCount;
  }, [messages.length, isLoading, scrollToBottom]);


  // Handle scroll - combined functionality
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show scroll-to-bottom button if user has scrolled up more than 200px from bottom
    setShowScrollButton(distanceFromBottom > 200);
    
    // Track if near bottom
    isNearBottomRef.current = distanceFromBottom < 100;
    
    // Load more when near top
    if (scrollTop < 200 && hasMore && !isFetchingMore) {
      // Save scroll position before loading
      prevScrollHeightRef.current = scrollHeight;
      prevScrollTopRef.current = scrollTop;
      wasFetchingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, isFetchingMore, onLoadMore]);

  // Restore scroll position after loading older messages
  // Use useLayoutEffect to adjust scroll synchronously before browser paint
  useLayoutEffect(() => {
    // Only run when fetching completes (was fetching, now not fetching)
    if (isFetchingMore || !wasFetchingRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const prevHeight = prevScrollHeightRef.current;
    const prevTop = prevScrollTopRef.current;
    
    const newHeight = container.scrollHeight;
    const heightDiff = newHeight - prevHeight;
    
    if (heightDiff > 0) {
      // Adjust scroll position to maintain visual position
      // The height difference is how much content was added above
      container.scrollTop = prevTop + heightDiff;
    }
    
    wasFetchingRef.current = false;
    prevScrollHeightRef.current = 0;
    prevScrollTopRef.current = 0;
  }, [isFetchingMore, messages.length]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
      time?: string; // Time separator within same day
      showTimeSeparator: boolean;
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
      
      // Time gap thresholds
      const TIME_GAP_SEPARATOR = 3600000; // 1 hour in ms - show time separator
      const BUBBLE_GAP_THRESHOLD = 300000; // 5 minutes in ms - just spacing

      // Check if we need a new date separator (different day)
      if (messageDateStr !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ 
            date: currentDate, 
            messages: currentGroup,
            showTimeSeparator: false 
          });
          currentGroup = [];
        }
        currentDate = messageDateStr;
        currentSender = ''; // Reset sender on date change
        lastMessageTime = 0;
      }

      // Check if we need a time separator (same day but large gap)
      const timeSinceLastMessage = messageTime - lastMessageTime;
      const needsTimeSeparator = lastMessageTime > 0 && timeSinceLastMessage >= TIME_GAP_SEPARATOR;

      if (needsTimeSeparator && currentGroup.length > 0) {
        // Push current group with time separator
        groups.push({ 
          date: currentDate, 
          time: messageDate.toLocaleTimeString(undefined, { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          messages: currentGroup,
          showTimeSeparator: true
        });
        currentGroup = [];
        currentSender = ''; // Reset to start new visual group
      }

      // Determine if this starts a new message bubble group
      const isNewGroup = 
        message.sender_id !== currentSender || 
        timeSinceLastMessage > BUBBLE_GAP_THRESHOLD;

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
      groups.push({ 
        date: currentDate, 
        messages: currentGroup,
        showTimeSeparator: false
      });
    }

    return groups;
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const now = new Date();
    const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (date.toDateString() === today.toDateString()) {
      // For today, just show "Today" or with time if recent
      if (hoursDiff < 6) {
        return 'Today';
      } else {
        return `Today at ${date.toLocaleTimeString(undefined, { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })}`;
      }
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      // For older dates, show full date with time
      return date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
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
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      data-messages-container
      className="h-full overflow-y-auto bg-transparent"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#6b7280 transparent',
      }}
    >
      <style>{`
        [data-messages-container]::-webkit-scrollbar {
          width: 8px;
        }
        [data-messages-container]::-webkit-scrollbar-track {
          background: transparent;
        }
        [data-messages-container]::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
        }
        [data-messages-container]::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
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

            {/* Time Separator (within same day, for large gaps) */}
            {group.showTimeSeparator && group.time && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-4"
              >
                <div className="px-3 py-1 rounded-full bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50">
                  <span className="text-[10px] font-medium text-gray-500">
                    {group.time}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Messages in this date group */}
            <AnimatePresence initial={false} mode="popLayout">
              {group.messages.map(({ message, isFirstInGroup, isLastInGroup }) => {
                const isOwn = message.sender_id === currentUserId;
                
                // Use message ID as key - each message (optimistic or real) has unique ID
                // Smooth animation handles the transition when optimistic is replaced by real
                const stableKey = message.id;

                return (
                  <motion.div
                    key={stableKey}
                    layout
                    initial={{ 
                      opacity: 0,
                      y: 6,
                      scale: 0.97,
                    }}
                    animate={{ 
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{ 
                      opacity: 0,
                      y: -4,
                      scale: 0.98,
                      transition: { duration: 0.15 } 
                    }}
                    transition={{ 
                      layout: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 40,
                        mass: 0.5
                      },
                      opacity: { 
                        duration: 0.2,
                        ease: [0.22, 1, 0.36, 1]
                      },
                      y: {
                        duration: 0.25,
                        ease: [0.22, 1, 0.36, 1]
                      },
                      scale: {
                        duration: 0.25,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }}
                    style={{
                      willChange: 'transform, opacity'
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

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-24 right-8 z-50 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-lg shadow-purple-900/50 flex items-center justify-center transition-colors group"
            title="Scroll to bottom"
          >
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className="text-white text-lg group-hover:animate-bounce" 
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
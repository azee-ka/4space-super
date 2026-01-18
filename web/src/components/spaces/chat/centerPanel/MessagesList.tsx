import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import type { Message } from '@4space/shared/src/services/messages.service';
import type { MessageRetention } from '@4space/shared/src/types/chatSettings';
import type { ChatTheme } from '../../../../store/chatSettingsStore';
import { getAccentColorHex } from '../../../../utils/themeUtils';
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
  onPin: (messageId: string, options: { pin: boolean; pinnedUntil?: string | null; keep?: boolean }) => void;
  onBookmark: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  typingUsers?: Map<string, any>;
  optimisticMessages?: any[]; // Messages being sent
  theme?: ChatTheme;
  fontSize?: number;
  messageDensity?: 'compact' | 'comfortable' | 'spacious';
  messageRetention?: MessageRetention;
  showAvatars?: boolean;
  showUsernames?: boolean;
  showTimestamps?: boolean;
  showReadReceipts?: boolean;
  showMessageStatus?: boolean;
  enableMessageReactions?: boolean;
  enableMessageReplies?: boolean;
  enableMessageForwarding?: boolean;
  allowMessageEditing?: boolean;
  allowMessageDeletion?: boolean;
  allowMessagePinning?: boolean;
  groupMessages?: boolean;
  autoScrollToBottom?: boolean;
  messageAnimations?: boolean;
  reduceAnimations?: boolean;
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
  theme,
  fontSize,
  messageDensity,
  messageRetention,
  showAvatars = true,
  showUsernames = true,
  showTimestamps = true,
  showReadReceipts = true,
  showMessageStatus = true,
  enableMessageReactions = true,
  enableMessageReplies = true,
  enableMessageForwarding = true,
  allowMessageEditing = true,
  allowMessageDeletion = true,
  allowMessagePinning = true,
  groupMessages = true,
  autoScrollToBottom = true,
  messageAnimations = true,
  reduceAnimations = false,
}: MessagesListProps) {
  const [scrollIndicator, setScrollIndicator] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasInitialScrolledRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const wasFetchingRef = useRef(false);

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

  // Handle new messages - optimized for smooth scrolling
  useEffect(() => {
    if (!hasInitialScrolledRef.current || isLoading) return;

    const totalCount = messages.length;
    const hasNew = totalCount > lastMessageCountRef.current;

    // Only auto-scroll if user is near bottom and new message arrived
    if (autoScrollToBottom && hasNew && isNearBottomRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        // Delay to allow layout to settle after reply/edit container animations (200ms)
        setTimeout(() => {
          scrollToBottom(true);
        }, 250);
      });
    }

    lastMessageCountRef.current = totalCount;
  }, [messages.length, isLoading, scrollToBottom, autoScrollToBottom]);


  // Handle scroll - combined functionality
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show date indicator during scrolling - clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (messages.length > 0) {
      // Find the message that's currently at the top of the viewport
      const containerRect = containerRef.current.getBoundingClientRect();
      const messageElements = containerRef.current.querySelectorAll('[data-message-id]');

      let visibleDate = null;
      for (const element of messageElements) {
        const rect = element.getBoundingClientRect();
        // Check if message is visible in the container
        if (rect.top >= containerRect.top && rect.top <= containerRect.bottom) {
          const messageId = element.getAttribute('data-message-id');
          const message = messages.find(m => m.id === messageId || m.id?.startsWith(`optimistic-${messageId}`));
          if (message) {
            const messageDate = new Date(message.created_at || Date.now());
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (messageDate.toDateString() === today.toDateString()) {
              visibleDate = 'Today';
            } else if (messageDate.toDateString() === yesterday.toDateString()) {
              visibleDate = 'Yesterday';
            } else {
              // Check if within a week
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              if (messageDate >= weekAgo) {
                visibleDate = messageDate.toLocaleDateString(undefined, { weekday: 'long' });
              } else {
                visibleDate = messageDate.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                });
              }
            }
            break;
          }
        }
      }

      if (visibleDate) {
        setScrollIndicator(visibleDate);
        // Hide indicator after user stops scrolling (1 second delay)
        scrollTimeoutRef.current = setTimeout(() => {
          setScrollIndicator(null);
          scrollTimeoutRef.current = null;
        }, 1000);
      }
    }

    // Track if near bottom
    isNearBottomRef.current = distanceFromBottom < 100;

    // Show/hide scroll to bottom button
    const shouldShowScrollButton = distanceFromBottom > 100 && distanceFromBottom > 0;
    setShowScrollToBottom(shouldShowScrollButton);

    // Load more when near top
    if (scrollTop < 200 && hasMore && !isFetchingMore) {
      // Save scroll position before loading
      prevScrollHeightRef.current = scrollHeight;
      prevScrollTopRef.current = scrollTop;
      wasFetchingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, isFetchingMore, onLoadMore, messages]);

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

    if (!groupMessages) {
      return allMessages.map((message) => ({
        messages: [
          {
            message,
            isFirstInGroup: true,
            isLastInGroup: true,
            isOptimistic: !message.id || message.id.startsWith('optimistic-'),
          },
        ],
      }));
    }

    const groups: Array<{
      separator?: {
        type: 'time' | 'date';
        text: string;
      };
      messages: Array<{
        message: Message;
        isFirstInGroup: boolean;
        isLastInGroup: boolean;
        isOptimistic?: boolean;
      }>;
    }> = [];

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
      const messageTime = messageDate.getTime();
      const isOptimistic = !message.id || message.id.startsWith('optimistic-');

      // Time gap threshold for separators
      const TIME_SEPARATOR_THRESHOLD = 3600000; // 1 hour in ms

      // Check if we need a separator
      const timeSinceLastMessage = messageTime - lastMessageTime;
      let separator: { type: 'time' | 'date'; text: string } | undefined;

      if (lastMessageTime > 0 && timeSinceLastMessage >= TIME_SEPARATOR_THRESHOLD) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Always show full date and time for separators
        if (messageDate.toDateString() === today.toDateString()) {
          // Today - show "Today at time"
          separator = {
            type: 'date',
            text: `Today at ${messageDate.toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}`
          };
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
          // Yesterday - show "Yesterday at time"
          separator = {
            type: 'date',
            text: `Yesterday at ${messageDate.toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}`
          };
        } else {
          // Older - show full date with time
          separator = {
            type: 'date',
            text: messageDate.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          };
        }

        if (currentGroup.length > 0) {
          // Push current group without separator
          groups.push({ messages: currentGroup });
          currentGroup = [];
        }

        // Start new group with separator
        currentGroup = [];
        currentSender = '';
      }

      // Push separator if needed
      if (separator) {
        groups.push({ separator, messages: [] });
      }

      // Determine if this starts a new message bubble group
      const isNewGroup =
        message.sender_id !== currentSender ||
        timeSinceLastMessage > 300000; // 5 minutes

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
      if (index === allMessages.length - 1 && currentGroup.length > 0) {
        currentGroup[currentGroup.length - 1].isLastInGroup = true;
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ messages: currentGroup });
    }

    return groups;
  };


  const messageGroups = getMessageGroups();
  const typingUsersList = Array.from(typingUsers.values());
  const shouldAnimate = messageAnimations && !reduceAnimations;

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (autoScrollToBottom && typingUsersList.length > 0 && isNearBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [typingUsersList.length, scrollToBottom, autoScrollToBottom]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 relative">
      {/* Scroll Date Indicator - Fixed position over scrollable area */}
      {scrollIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-4 left-[45%] -translate-x-1/2 transform z-[70] px-4 py-0 rounded-full bg-black/90 backdrop-blur-sm border-[1px] border-solid shadow-lg flex items-center justify-center"
          style={{
            borderColor: theme ? `${getAccentColorHex(theme.accentColor)}80` : '#06b6d480',
            boxShadow: theme ? `0 0 20px ${getAccentColorHex(theme.accentColor)}10` : '0 0 20px rgba(6, 182, 212, 0.1)'
          }}
        >
          <span className="text-[14px] font-semibold"
          style={{
            color: theme ? getAccentColorHex(theme.accentColor) : '#06b6d4'
          }}
          >
            {scrollIndicator}
          </span>
        </motion.div>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        data-messages-container
        className="h-full min-h-0 overflow-y-auto bg-transparent relative messages-scrollbar"
      >
        {/* Smooth gradient overlay for dynamic bubble colors - creates spectrum effect */}
        {/* <div
          className="absolute inset-y-0 left-0 pointer-events-none z-10"
          style={{ right: '14px' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to top,
                  rgba(0, 0, 0, 0) 0%,
                  rgba(0, 0, 0, 0.1) 20%,
                  rgba(0, 0, 0, 0.2) 40%,
                  rgba(0, 0, 0, 0.3) 60%,
                  rgba(0, 0, 0, 0.4) 80%,
                  rgba(0, 0, 0, 0.5) 100%
                )
              `,
            }}
          />
          <style>{`
        [data-messages-container]::-webkit-scrollbar {
          width: 8px;
        }
        [data-messages-container]::-webkit-scrollbar-track {
          background: #18181b;
          background: transparent;
        }
        [data-messages-container]::-webkit-scrollbar-thumb {
          background: #3f3f46;
          background: #6b7280;
          border-radius: 4px;
        }
        [data-messages-container]::-webkit-scrollbar-thumb:hover {
          background: #52525b;
          background: #4b5563;
        }
`}</style>
        </div> */}
        

      {/* Load More Indicator */}
      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <div className="px-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/50 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <span className="text-xs text-gray-400">Loading messages...</span>
          </div>
        </div>
      )}

      {/* Messages with Unified Separators */}
      <div className="py-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`}>

            {/* Unified Separator (time or date) */}
            {group.separator && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-4"
              >
                <div
                  className={`px-2 py-0 rounded-full flex items-center justify-center backdrop-blur-sm border-[1px] border-solid ${
                    group.separator.type === 'date'
                      ? 'bg-black/95 shadow-lg'
                      : 'bg-black/90'
                  }`}
                  style={{
                    borderColor: theme ? `${getAccentColorHex(theme.accentColor)}80` : '#06b6d480',
                    boxShadow: group.separator.type === 'date' && theme
                      ? `0 0 20px ${getAccentColorHex(theme.accentColor)}10`
                      : group.separator.type === 'date'
                      ? '0 0 20px rgba(6, 182, 212, 0.1)'
                      : undefined
                  }}
                >
                  <span
                    className={`font-semibold ${
                      group.separator.type === 'date'
                        ? 'text-[12px]'
                        : 'text-[12px]'
                    }`}
                    style={{
                      color: theme ? getAccentColorHex(theme.accentColor) : '#06b6d4'
                    }}
                  >
                    {group.separator.text}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Messages in this group */}
            <AnimatePresence initial={false} mode="popLayout">
              {group.messages.map(({ message, isFirstInGroup, isLastInGroup }) => {
                const isOwn = message.sender_id === currentUserId;
                
                // Use message ID as key - optimistic messages keep their ID even after server confirms
                // This prevents flickering since React key stays the same
                const stableKey = message.id;

                return (
                  <motion.div
                    key={stableKey}
                    layout={false} // Disable layout animations to prevent jitter on data updates
                    initial={shouldAnimate ? {
                      opacity: 0,
                      y: 8,
                      scale: 0.96,
                    } : false}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={shouldAnimate ? {
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    } : undefined}
                    transition={shouldAnimate ? {
                      opacity: { duration: 0.2, ease: 'easeOut' },
                      y: { type: 'spring', stiffness: 500, damping: 30 },
                      scale: { duration: 0.2, ease: 'easeOut' }
                    } : { duration: 0 }}
                    style={{
                      willChange: 'transform, opacity'
                    }}
                  >
                    <MessageItem
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatars && !isOwn}
                      showUsername={showUsernames}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      onReply={enableMessageReplies ? onReply : undefined}
                      onEdit={allowMessageEditing ? onEdit : undefined}
                      onDelete={allowMessageDeletion ? onDelete : undefined}
                      onPin={allowMessagePinning ? onPin : undefined}
                      onBookmark={onBookmark}
                      onReaction={enableMessageReactions ? onReaction : undefined}
                      onRemoveReaction={enableMessageReactions ? onRemoveReaction : undefined}
                      onScrollToMessage={scrollToMessage}
                      currentUserId={currentUserId}
                      theme={theme}
                      fontSize={fontSize}
                      messageDensity={messageDensity}
                      messageRetention={messageRetention}
                      showTimestamps={showTimestamps}
                      showReadReceipts={showReadReceipts}
                      showMessageStatus={showMessageStatus}
                      reactionsEnabled={enableMessageReactions}
                      forwardingEnabled={enableMessageForwarding}
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

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-6 right-6 z-[60] w-10 h-10 rounded-full bg-black/80 hover:bg-black active:bg-gray-800 shadow-lg shadow-cyan-500/20 flex items-center justify-center transition-all duration-200 group border border-cyan-500/30"
            title="Scroll to bottom"
          >
            <FontAwesomeIcon
              icon={faChevronDown}
              className="text-cyan-400 group-hover:text-cyan-300 text-base group-hover:animate-bounce transition-colors"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

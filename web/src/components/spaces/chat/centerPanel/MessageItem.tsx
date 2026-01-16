// WhatsApp-Style Message Bubble - FIXED HOVER & Z-INDEX
// web/src/components/spaces/chat/MessageItem.tsx

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import DropdownButton from '../../../ui/DropdownButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReply, faEdit, faTrash, faThumbtack, faBookmark, faEllipsisV,
  faCopy, faForward, faSmile, faTimes, faPlus,
} from '@fortawesome/free-solid-svg-icons';
import type { Message } from '@4space/shared/src/services/messages.service';
import DOMPurify from 'dompurify';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import type { ChatTheme } from '../../../../store/chatSettingsStore';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string, pinned: boolean) => void;
  onBookmark?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  currentUserId?: string;
  theme?: ChatTheme;
  fontSize?: number;
  messageDensity?: 'compact' | 'comfortable' | 'spacious';
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

// Custom WhatsApp-style tick components
const SingleTick = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 18 12" fill="none" className={className || "w-[18px] h-[12px]"} preserveAspectRatio="xMidYMid meet">
    <path d="M2 6L5 9L13 1" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
  </svg>
);

const DoubleTick = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 18 12" fill="none" className={className || "w-[18px] h-[12px]"} preserveAspectRatio="xMidYMid meet">
    <path d="M2 6L5 9L13 1" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
    <path d="M6 6L9 9L17 1" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
  </svg>
);

export function MessageItem({
  message,
  isOwn,
  showAvatar = true,
  isFirstInGroup = true,
  isLastInGroup = true,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onBookmark,
  onReaction,
  onRemoveReaction,
  onScrollToMessage,
  currentUserId,
  theme,
  fontSize = 14,
  messageDensity = 'comfortable',
}: MessageItemProps) {
  const resolvedTheme: ChatTheme = theme || {
    backgroundType: 'solid',
    backgroundColor: '#000000',
    sentBubbleColor: '#7c3aed',
    receivedBubbleColor: '#27272a',
    bubbleShapePreset: 'pill',
    bubbleBorderRadius: 12,
    accentColor: 'purple',
    sentTextColor: '#ffffff',
    receivedTextColor: '#ffffff',
  };
  const [showActions, setShowActions] = useState(false);
  const [optimisticReactions, setOptimisticReactions] = useState<typeof message.reactions | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const openDropdownsCountRef = useRef(0);
  const actionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reactionsContainerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Use timeout refs to manage hover delays
  const showActionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideActionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideReactionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimeouts = () => {
    if (showActionsTimeoutRef.current) clearTimeout(showActionsTimeoutRef.current);
    if (hideActionsTimeoutRef.current) clearTimeout(hideActionsTimeoutRef.current);
    if (hideReactionsTimeoutRef.current) clearTimeout(hideReactionsTimeoutRef.current);
    if (hideMenuTimeoutRef.current) clearTimeout(hideMenuTimeoutRef.current);
    showActionsTimeoutRef.current = null;
    hideActionsTimeoutRef.current = null;
    hideReactionsTimeoutRef.current = null;
    hideMenuTimeoutRef.current = null;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      const isInsideActions = actionsRef.current?.contains(target);
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideEmojiPicker = emojiPickerRef.current?.contains(target);
      
      if (isInsideEmojiPicker) return;
      
      if (!isInsideActions && !isInsideContainer && openDropdownsCountRef.current === 0) {
        setShowActions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearAllTimeouts();
    };
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleMouseEnter = () => {
    clearAllTimeouts();
    // Show immediately when hovering - no delay to prevent flicker
    setShowActions(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    clearAllTimeouts();
    // Check if mouse is moving to actions bar
    const relatedTarget = e.relatedTarget as Node;
    const isMovingToActions = actionsRef.current?.contains(relatedTarget);
    
    // Check if mouse is moving to another message container (rapid hover)
    const isMovingToAnotherMessage = relatedTarget && 
      !containerRef.current?.contains(relatedTarget) && 
      !actionsRef.current?.contains(relatedTarget) &&
      (relatedTarget as Element)?.closest('[id^="message-"]') !== null;
    
    // If moving to another message or no dropdowns open and not moving to actions, hide quickly
    if (isMovingToAnotherMessage) {
      // Hide immediately when moving to another message
      setShowActions(false);
    } else if (openDropdownsCountRef.current === 0 && !isMovingToActions) {
      // Small delay only when moving away normally
      hideActionsTimeoutRef.current = setTimeout(() => {
        setShowActions(false);
      }, 100);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatReactionTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
  };

  // Use optimistic reactions if available, otherwise use message reactions
  const reactionsToUse = optimisticReactions || message.reactions;

  // Group reactions if there is 1 or more reactions
  // Group reactions by emoji
  const groupedReactions = reactionsToUse?.reduce((acc, r) => {
    const emoji = (r as any).emoji || r.reaction;
    if (!acc[emoji]) acc[emoji] = [];
    acc[emoji].push(r);
    return acc;
  }, {} as Record<string, typeof reactionsToUse>) || null;

  // Get unique emojis and limit to 3 for preview
  const uniqueEmojis = groupedReactions ? Object.keys(groupedReactions) : [];
  const previewEmojis = uniqueEmojis.slice(0, 3);
  const remainingEmojis = uniqueEmojis.slice(3);
  const remainingCount = remainingEmojis.reduce((sum, emoji) => sum + ((groupedReactions && groupedReactions[emoji])?.length || 0), 0);

  const hasUserReacted = (emoji: string) => {
    return reactionsToUse?.some(r => {
      const reactionEmoji = (r as any).emoji || r.reaction;
      return reactionEmoji === emoji && r.user_id === currentUserId;
    });
  };

  // Handle optimistic reaction update - users can only have one reaction at a time
  const handleReaction = (emoji: string) => {
    if (!currentUserId) return;
    
    // Get current reactions from message (not optimistic) to ensure we have the base state
    const baseReactions = message.reactions || [];
    const currentOptimistic = optimisticReactions;
    
    // Use optimistic if available, otherwise use base
    const currentReactions = currentOptimistic || baseReactions;
    const userReaction = currentReactions.find((r: any) => r.user_id === currentUserId);
    const clickedEmoji = emoji;
    
    if (userReaction) {
      const userEmoji = (userReaction as any).emoji || userReaction.reaction;
      
      if (userEmoji === clickedEmoji) {
        // User clicked their own reaction - remove it
        const updated = currentReactions.filter((r: any) => r.user_id !== currentUserId);
        // Use empty array instead of null to track removal for sync logic
        setOptimisticReactions(updated);
        onRemoveReaction?.(message.id, clickedEmoji);
      } else {
        // User has a different reaction - replace it
        const updated = currentReactions
          .filter((r: any) => r.user_id !== currentUserId) // Remove old reaction
          .concat([{
            id: `optimistic-${Date.now()}`,
            message_id: message.id,
            user_id: currentUserId,
            reaction: clickedEmoji,
            emoji: clickedEmoji,
            created_at: new Date().toISOString(),
            user: { id: currentUserId, display_name: 'You', username: 'you' },
          } as any]);
        setOptimisticReactions(updated);
        // Remove old reaction and add new one
        onRemoveReaction?.(message.id, userEmoji);
        onReaction?.(message.id, clickedEmoji);
      }
    } else {
      // User has no reaction - add new one
      const newReaction = {
        id: `optimistic-${Date.now()}`,
        message_id: message.id,
        user_id: currentUserId,
        reaction: clickedEmoji,
        emoji: clickedEmoji,
        created_at: new Date().toISOString(),
        user: { id: currentUserId, display_name: 'You', username: 'you' },
      };
      setOptimisticReactions([...currentReactions, newReaction as any]);
      onReaction?.(message.id, clickedEmoji);
    }
  };

  // Sync optimistic reactions with actual reactions when message updates
  useEffect(() => {
    if (!currentUserId) return;
    
    // When message reactions update from server, check if they match our optimistic state
    if (optimisticReactions !== null && optimisticReactions !== undefined) {
      // Find the user's reaction in optimistic state
      const optimisticUserReaction = optimisticReactions.find((r: any) => r.user_id === currentUserId);
      
      if (!optimisticUserReaction) {  
        // We optimistically removed the reaction - check if server confirms
        const serverReactions = message.reactions || [];
        const serverUserReaction = serverReactions.find((r: any) => r.user_id === currentUserId);
        if (!serverUserReaction) {
          // Server confirms removal - clear optimistic state
          setOptimisticReactions(null);
        }
        // Otherwise keep optimistic state (server hasn't caught up yet)
      } else {
        // We optimistically added/changed a reaction - check if server confirms
        const optimisticEmoji = (optimisticUserReaction as any).emoji || optimisticUserReaction.reaction;
        const serverReactions = message.reactions || [];
        const serverUserReaction = serverReactions.find((r: any) => r.user_id === currentUserId);
        
        if (serverUserReaction) {
          const serverEmoji = (serverUserReaction as any).emoji || serverUserReaction.reaction;
          // Only clear if the server reaction matches our optimistic reaction
          if (serverEmoji === optimisticEmoji) {
            // Server confirms our optimistic state - clear it to use server data
            setOptimisticReactions(null);
          }
          // Otherwise keep optimistic state (server has different/old reaction)
        }
        // If no server reaction yet, keep optimistic state
      }
    }
  }, [message.reactions, optimisticReactions, currentUserId]);

  const getBorderRadius = () => {
    const radius = resolvedTheme.bubbleShapePreset === 'custom' 
      ? resolvedTheme.bubbleBorderRadius 
      : resolvedTheme.bubbleShapePreset === 'square' ? 0
      : resolvedTheme.bubbleShapePreset === 'rounded' ? 8
      : resolvedTheme.bubbleShapePreset === 'pill' ? 12
      : resolvedTheme.bubbleShapePreset === 'extra-rounded' ? 20
      : 12;
    
    // For square bubbles, no grouping effect needed
    if (radius === 0) {
      return { borderRadius: '0px' };
    }
    
    // Subtle reduction for connecting sides - only 2-3px less, much more subtle
    const connectionReduction = Math.max(2, Math.min(3, radius * 0.15)); // 2-3px or 15% of radius, whichever is more appropriate
    const connectionRadius = Math.max(radius - connectionReduction, radius * 0.7); // Never go below 70% of original
    
    if (isFirstInGroup && isLastInGroup) {
      // Single message - full rounded corners
      return { borderRadius: `${radius}px` };
    }
    if (isFirstInGroup) {
      // First in group - rounded on all sides except bottom (connection side)
      return isOwn 
        ? { borderRadius: `${radius}px ${radius}px ${connectionRadius}px ${radius}px` }
        : { borderRadius: `${radius}px ${radius}px ${radius}px ${connectionRadius}px` };
    }
    if (isLastInGroup) {
      // Last in group - rounded on all sides except top (connection side)
      return isOwn 
        ? { borderRadius: `${connectionRadius}px ${radius}px ${radius}px ${radius}px` }
        : { borderRadius: `${radius}px ${connectionRadius}px ${radius}px ${radius}px` };
    }
    // Middle in group - slightly less rounded on connection sides
    return isOwn 
      ? { borderRadius: `${connectionRadius}px ${radius}px ${connectionRadius}px ${radius}px` }
      : { borderRadius: `${radius}px ${connectionRadius}px ${connectionRadius}px ${radius}px` };
  };

  const getBubbleColor = () => {
    if (isOwn) {
      // Use gradient if available, otherwise solid color
      if (resolvedTheme.sentBubbleGradient) {
        return { background: resolvedTheme.sentBubbleGradient };
      }
      return { backgroundColor: resolvedTheme.sentBubbleColor };
    }
    // Received bubbles
    if (resolvedTheme.receivedBubbleGradient) {
      return { background: resolvedTheme.receivedBubbleGradient };
    }
    return { backgroundColor: resolvedTheme.receivedBubbleColor };
  };

  const getTextColor = () => {
    return isOwn 
      ? (resolvedTheme.sentTextColor || '#ffffff') 
      : (resolvedTheme.receivedTextColor || '#ffffff');
  };

  const getReadStatus = () => {
    if (!isOwn || message.deleted_at) return null;
    
    // Check if message is still sending (optimistic message)
    const isOptimistic = message.id.startsWith('optimistic-') || message.id.startsWith('temp-');
    
    if (isOptimistic) {
      return {
        component: SingleTick,
        color: 'text-gray-500',
        title: 'Sending...'
      };
    }
    
    // Message is sent - show double tick
    const hasBeenRead = message.read_receipts && message.read_receipts.length > 0;
    
    return {
      component: DoubleTick,
      color: hasBeenRead ? 'text-cyan-400' : 'text-gray-400',
      title: hasBeenRead ? 'Read' : 'Delivered'
    };
  };

  const readStatus = getReadStatus();
  const isOptimistic = message.id.startsWith('optimistic-') || message.id.startsWith('temp-');

  // Get all reactions in a flat list for the dropdown
  const allReactions = reactionsToUse || [];
  const totalReactionCount = allReactions.length;
  
  // Get density spacing
  const getDensitySpacing = () => {
    if (messageDensity === 'compact') {
      return isFirstInGroup ? 'mt-1' : 'mt-0.5';
    } else if (messageDensity === 'spacious') {
      return isFirstInGroup ? 'mt-4' : 'mt-2';
    }
    return isFirstInGroup ? 'mt-3' : 'mt-1.5'; // comfortable (default)
  };

  return (
    <div
      ref={containerRef}
      className={`group flex gap-2 px-3 ${isOwn ? 'flex-row-reverse' : ''} ${
        getDensitySpacing()
      } ${reactionsToUse && reactionsToUse.length > 0 ? 'mb-5' : ''} relative`}
      id={`message-${message.id}`}
      data-message-id={message.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={(e) => handleMouseLeave(e)}
    >
      {/* Avatar */}
      {showAvatar && isFirstInGroup && !isOwn && (
        <div className="flex-shrink-0 w-8 h-8">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.display_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              {(message.sender?.display_name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      {!isFirstInGroup && !isOwn && <div className="w-8" />}

      <div className={`flex-1 flex ${isOwn ? 'justify-end' : 'justify-start'} min-w-0`}>
        <div className="max-w-[65%] relative min-w-0">
          {showAvatar && isFirstInGroup && !isOwn && (
            <div className="text-xs font-medium text-cyan-400 mb-1 ml-3">
              {message.sender?.display_name || 'Unknown'}
            </div>
          )}

          {/* Message Bubble */}
          <div className="relative group/msg">
            <div
              className={`relative ${
                message.deleted_at ? 'opacity-50' : ''
              } shadow-lg transition-all duration-300 ease-out`}
              style={{
                ...getBorderRadius(),
                ...getBubbleColor(),
                padding: messageDensity === 'compact' ? '4px 10px' : messageDensity === 'spacious' ? '8px 16px' : '6px 12px',
                transitionProperty: 'background-color, background',
              }}
            >
              {/* Reply To - Inside bubble */}
              {message.reply_to && typeof message.reply_to === 'object' && 'content' in message.reply_to && (
                <button
                  onClick={() => onScrollToMessage?.(message.reply_to!.id)}
                  className={`w-full text-left px-2 py-1.5 mb-2 mt-1 rounded-lg border-l-2 ${
                    isOwn 
                      ? 'bg-purple-700/40 border-purple-300/50 hover:bg-purple-700/60' 
                      : 'bg-zinc-700/40 border-cyan-400/50 hover:bg-zinc-700/60'
                  } transition-colors`}
                >
                  <p className="text-xs font-medium text-cyan-300 mb-0.5 truncate">
                    {message.reply_to.sender?.display_name || message.reply_to.sender?.username || 'Unknown'}
                  </p>
                  <p className="text-xs text-white/70 truncate">
                    {typeof message.reply_to.content === 'string' 
                      ? message.reply_to.content.replace(/<[^>]*>/g, '').substring(0, 50)
                      : String(message.reply_to.content || '').substring(0, 50)}
                    {(typeof message.reply_to.content === 'string' ? message.reply_to.content.length : String(message.reply_to.content || '').length) > 50 ? '...' : ''}
                  </p>
                </button>
              )}
              {message.deleted_at ? (
                <p className="text-sm italic text-gray-400">This message was deleted</p>
              ) : (
                <>
                  <div 
                    className="whitespace-pre-wrap break-words pb-0 leading-[1.3]"
                    style={{ 
                      color: getTextColor(),
                      fontSize: `${fontSize}px`,
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(message.content || '', {
                        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'p', 'br'],
                        ALLOWED_ATTR: ['href', 'target'],
                        ALLOW_DATA_ATTR: false,
                      })
                    }}
                  />

                  <div className={`flex items-center gap-1 mt-0 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {message.edited_at && (
                      <span 
                        className="text-[9px] opacity-40 italic"
                        style={{ color: getTextColor() }}
                      >
                        edited
                      </span>
                    )}
                    <span 
                      className="text-[10px] opacity-70"
                      style={{ color: getTextColor() }}
                    >
                      {formatTime(message.created_at)}
                    </span>
                    {readStatus && (
                      <motion.div 
                        className="flex items-center" 
                        title={readStatus.title}
                        key={isOptimistic ? 'sending' : 'sent'}
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 35,
                          mass: 0.5
                        }}
                      >
                        <readStatus.component className={`${readStatus.color} w-3.5 h-2.5 transition-colors duration-300`} />
                      </motion.div>
                    )}
                  </div>
                </>
              )}

              {/* Reactions - Positioned to half-overlap bottom of bubble */}
              {reactionsToUse && reactionsToUse.length > 0 && (
                <div 
                  ref={reactionsContainerRef}
                  className={`absolute ${isOwn ? 'right-2' : 'left-2'} flex flex-wrap gap-1`}
                  style={{ 
                    zIndex: 100,
                    bottom: '-15px', // Half-overlap: half outside, half inside
                  }}
                >
                  {/* Render reactions - show up to 3 unique emojis in one pill, then "+X more" if needed */}
                  {groupedReactions && uniqueEmojis.length > 0 ? (
                    <>
                      {/* Show grouped reactions pill with up to 3 emojis */}
                      <DropdownButton
                        placement={isOwn ? 'bottom-end' : 'bottom-start'}
                        onToggle={(isOpen) => {
                          if (isOpen) {
                            openDropdownsCountRef.current++;
                            setShowActions(true);
                            clearAllTimeouts();
                          } else {
                            openDropdownsCountRef.current = Math.max(0, openDropdownsCountRef.current - 1);
                          }
                        }}
                        toggleContent={
                          <button
                            className={`px-2 py-0.5 rounded-full flex items-center gap-1 transition-all text-xs backdrop-blur-sm border ${
                              previewEmojis.some(emoji => hasUserReacted(emoji))
                                ? 'bg-purple-500/30 border-purple-400/50 shadow-md'
                                : 'bg-black/40 border-zinc-600/50 hover:bg-black/60 hover:border-zinc-500/70'
                            }`}
                          >
                            {/* Show up to 3 emojis */}
                            {previewEmojis.map((emoji) => {
                              const reactions = groupedReactions[emoji];
                              return (
                                <span key={emoji} className="flex items-center gap-0.5">
                                  <span>{emoji}</span>
                                  {reactions && reactions.length > 1 && (
                                    <span className={`text-[9px] font-medium ${
                                      hasUserReacted(emoji) ? 'text-purple-200' : 'text-gray-300'
                                    }`}>
                                      {reactions.length}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                            {/* Show "+X more" if there are more than 3 unique emojis */}
                            {remainingEmojis.length > 0 && (
                              <span className="text-[10px] font-medium text-gray-300 ml-0.5">
                                +{remainingCount}
                              </span>
                            )}
                          </button>
                        }
                      >
                            {({ closeDropdown }: { closeDropdown: () => void }) => (
                              <div className="rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar min-w-[240px]">
                                <div className="p-2">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1.5 border-b border-zinc-800/50">
                                    Reactions ({totalReactionCount})
                                  </div>
                                  <div className="space-y-0.5">
                                    {allReactions.map((reaction: any) => {
                                      const user = (reaction as any).user || message.sender;
                                      const reactionEmoji = (reaction as any).emoji || reaction.reaction;
                                      const isCurrentUser = reaction.user_id === currentUserId;
                                      
                                      return (
                                        <div 
                                          key={reaction.id}
                                          className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors group"
                                        >
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-sm flex-shrink-0">{reactionEmoji}</span>
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                                              {(user?.display_name || user?.username || 'U')[0].toUpperCase()}
                                            </div>
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <span className="text-xs text-white font-medium truncate">
                                                {isCurrentUser ? 'You' : (user?.display_name || user?.username || 'Unknown')}
                                              </span>
                                              <span className="text-[9px] text-gray-500 flex-shrink-0">
                                                {formatReactionTime(reaction.created_at)}
                                              </span>
                                            </div>
                                          </div>
                                          {isCurrentUser && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleReaction(reactionEmoji);
                                                closeDropdown();
                                              }}
                                              className="ml-1.5 w-5 h-5 rounded hover:bg-red-500/20 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                              title="Remove reaction"
                                            >
                                              <FontAwesomeIcon icon={faTimes} className="text-red-400 text-[10px]" />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DropdownButton>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Quick Actions - Centered vertically with proper hover behavior */}
            {!message.deleted_at && (
              <div 
                ref={actionsRef}
                className={`absolute top-0 bottom-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} ${
                  showActions || openDropdownsCountRef.current > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } flex items-center px-2`}
                style={{ zIndex: 10 }}
                onMouseEnter={() => {
                  clearAllTimeouts();
                  // Show immediately when hovering over actions bar (no delay)
                  setShowActions(true);
                }}
                onMouseLeave={(e) => {
                  clearAllTimeouts();
                  // Check if mouse is moving back to container
                  const relatedTarget = e.relatedTarget as Node;
                  const isMovingToContainer = containerRef.current?.contains(relatedTarget);
                  
                  // Check if moving to another message
                  const isMovingToAnotherMessage = relatedTarget && 
                    !containerRef.current?.contains(relatedTarget) && 
                    (relatedTarget as Element)?.closest('[id^="message-"]') !== null;
                  
                  // If moving to another message, hide immediately
                  if (isMovingToAnotherMessage) {
                    setShowActions(false);
                  } else if (openDropdownsCountRef.current === 0 && !isMovingToContainer) {
                    // Small delay only when moving away normally
                    hideActionsTimeoutRef.current = setTimeout(() => {
                      setShowActions(false);
                    }, 100);
                  }
                }}
              >
                <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-xl">
                  {/* Reactions Picker */}
                  <DropdownButton
                    placement={isOwn ? 'top-end' : 'top-start'}
                    onToggle={(isOpen) => {
                      if (isOpen) {
                        openDropdownsCountRef.current++;
                        setShowActions(true);
                      } else {
                        openDropdownsCountRef.current = Math.max(0, openDropdownsCountRef.current - 1);
                        // Hide actions if all dropdowns are closed and mouse is not over
                        if (openDropdownsCountRef.current === 0) {
                          clearAllTimeouts();
                          hideActionsTimeoutRef.current = setTimeout(() => {
                            setShowActions(false);
                          }, 150);
                        }
                      }
                    }}
                    toggleContent={
                      <button
                        className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                        title="Add reaction"
                      >
                        <FontAwesomeIcon icon={faSmile} className="text-yellow-400 text-xs" />
                      </button>
                    }
                  >
                    {({ closeDropdown }: { closeDropdown: () => void }) => (
                      <div className="p-2 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-xl relative">
                        <div className="flex gap-1">
                          {QUICK_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                handleReaction(emoji);
                                closeDropdown();
                              }}
                              className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-lg hover:scale-110"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEmojiPicker(!showEmojiPicker);
                            }}
                            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-sm hover:scale-110 border border-zinc-600/50"
                            title="More emojis"
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-gray-400" />
                          </button>
                        </div>
                        {showEmojiPicker && (
                          <div
                            ref={emojiPickerRef}
                            className="absolute bottom-full left-0 mb-2 z-50"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <Picker
                              data={data}
                              onEmojiSelect={(emoji: any) => {
                                handleReaction(emoji.native);
                                setShowEmojiPicker(false);
                                closeDropdown();
                              }}
                              theme="dark"
                              previewPosition="none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </DropdownButton>
                  
                  {onReply && (
                    <button
                      onClick={() => onReply(message)}
                      className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                      title="Reply"
                    >
                      <FontAwesomeIcon icon={faReply} className="text-cyan-400 text-xs" />
                    </button>
                  )}
                  
                  {isOwn && onEdit && (
                    <button
                      onClick={() => onEdit(message)}
                      className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-purple-400 text-xs" />
                    </button>
                  )}
                  
                  {/* Actions Menu */}
                  <DropdownButton
                    placement={isOwn ? 'top-end' : 'top-start'}
                    onToggle={(isOpen) => {
                      if (isOpen) {
                        openDropdownsCountRef.current++;
                        setShowActions(true);
                      } else {
                        openDropdownsCountRef.current = Math.max(0, openDropdownsCountRef.current - 1);
                        // Hide actions if all dropdowns are closed and mouse is not over
                        if (openDropdownsCountRef.current === 0) {
                          clearAllTimeouts();
                          hideActionsTimeoutRef.current = setTimeout(() => {
                            setShowActions(false);
                          }, 150);
                        }
                      }
                    }}
                    toggleContent={
                      <button
                        className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                        title="More"
                      >
                        <FontAwesomeIcon icon={faEllipsisV} className="text-gray-400 text-xs" />
                      </button>
                    }
                  >
                    {({ closeDropdown }: { closeDropdown: () => void }) => (
                      <div className="rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-xl overflow-hidden min-w-[180px]">
                        {[
                          { icon: faCopy, label: 'Copy Text', color: 'text-cyan-400', onClick: handleCopy, danger: false },
                          onBookmark && { icon: faBookmark, label: 'Bookmark', color: 'text-blue-400', onClick: () => { onBookmark(message.id); closeDropdown(); }, danger: false },
                          onPin && { icon: faThumbtack, label: message.is_pinned ? 'Unpin' : 'Pin', color: 'text-yellow-400', onClick: () => { onPin(message.id, !message.is_pinned); closeDropdown(); }, danger: false },
                          { icon: faForward, label: 'Forward', color: 'text-purple-400', onClick: () => closeDropdown(), danger: false },
                          isOwn && onDelete && { icon: faTrash, label: 'Delete', color: 'text-red-400', onClick: () => { onDelete(message.id); closeDropdown(); }, danger: true },
                        ].filter(Boolean).map((action: any) => (
                          <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                              action.danger ? 'hover:bg-red-500/10' : ''
                            }`}
                          >
                            <FontAwesomeIcon icon={action.icon} className={`${action.color} text-sm`} />
                            <span className={`text-sm font-medium ${action.danger ? 'text-red-400' : 'text-white'}`}>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </DropdownButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

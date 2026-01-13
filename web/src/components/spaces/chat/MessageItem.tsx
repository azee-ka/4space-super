// WhatsApp-Style Message Bubble - GROUPED REACTIONS & DROPDOWN
// web/src/components/spaces/chat/MessageItem.tsx

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReply, faEdit, faTrash, faThumbtack, faBookmark, faEllipsisV,
  faCopy, faForward, faSmile,
} from '@fortawesome/free-solid-svg-icons';
import type { Message } from '@4space/shared/src/services/messages.service';
import DOMPurify from 'dompurify';

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
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reactionDetailsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isOutside = 
        (!reactionsRef.current || !reactionsRef.current.contains(e.target as Node)) &&
        (!menuRef.current || !menuRef.current.contains(e.target as Node)) &&
        (!actionsRef.current || !actionsRef.current.contains(e.target as Node)) &&
        (!reactionDetailsRef.current || !reactionDetailsRef.current.contains(e.target as Node));
      
      if (isOutside) {
        setShowReactions(false);
        setShowMenu(false);
        setShowReactionDetails(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    setShowActions(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!relatedTarget) {
      setShowActions(false);
      return;
    }
    if (
      (actionsRef.current && actionsRef.current.contains(relatedTarget)) ||
      (reactionsRef.current && reactionsRef.current.contains(relatedTarget)) ||
      (menuRef.current && menuRef.current.contains(relatedTarget))
    ) {
      return;
    }
    setShowActions(false);
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
    setShowMenu(false);
  };

  const groupedReactions = message.reactions?.reduce((acc, r) => {
    const emoji = (r as any).emoji || r.reaction;
    if (!acc[emoji]) acc[emoji] = [];
    acc[emoji].push(r);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  const hasUserReacted = (emoji: string) => {
    return message.reactions?.some(r => {
      const reactionEmoji = (r as any).emoji || r.reaction;
      return reactionEmoji === emoji && r.user_id === currentUserId;
    });
  };

  const getBorderRadius = () => {
    if (isFirstInGroup && isLastInGroup) {
      return 'rounded-2xl';
    }
    if (isFirstInGroup) {
      return isOwn ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md';
    }
    if (isLastInGroup) {
      return isOwn ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-tl-md';
    }
    return isOwn ? 'rounded-2xl rounded-r-md' : 'rounded-2xl rounded-l-md';
  };

  const getBubbleColor = () => {
    if (isOwn) {
      return 'bg-gradient-to-br from-purple-600 to-purple-700';
    }
    return 'bg-zinc-800/90';
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

  // Check if we should show grouped reactions (more than 2 types)
  const reactionTypes = groupedReactions ? Object.keys(groupedReactions) : [];
  const shouldGroupReactions = reactionTypes.length > 2;
  const totalReactionCount = message.reactions?.length || 0;

  return (
    <div 
      ref={containerRef}
      className={`group flex gap-2 px-3 ${isOwn ? 'flex-row-reverse' : ''} ${
        isFirstInGroup ? 'mt-2' : 'mt-0.5'
      }`}
      id={`message-${message.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
              className={`relative ${getBorderRadius()} ${getBubbleColor()} px-3 py-1.5 ${
                message.deleted_at ? 'opacity-50' : ''
              } shadow-lg`}
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
                    className="text-[15px] text-white leading-relaxed whitespace-pre-wrap break-words pb-1"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(message.content || '', {
                        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'p', 'br'],
                        ALLOWED_ATTR: ['href', 'target'],
                        ALLOW_DATA_ATTR: false,
                      })
                    }}
                  />

                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {message.edited_at && (
                      <span className="text-[9px] text-gray-400 italic">edited</span>
                    )}
                    <span className={`text-[10px] ${isOwn ? 'text-purple-200/70' : 'text-gray-400'}`}>
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
            </div>

            {/* Quick Actions - Centered vertically */}
            {!message.deleted_at && (
              <div 
                ref={actionsRef}
                className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} ${
                  showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } transition-opacity px-2 z-20`}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={(e) => {
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (
                    !containerRef.current?.contains(relatedTarget) &&
                    !reactionsRef.current?.contains(relatedTarget) &&
                    !menuRef.current?.contains(relatedTarget)
                  ) {
                    setShowActions(false);
                  }
                }}
              >
                <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-xl">
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Add reaction"
                  >
                    <FontAwesomeIcon icon={faSmile} className="text-yellow-400 text-xs" />
                  </button>
                  
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
                  
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="More"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} className="text-gray-400 text-xs" />
                  </button>
                </div>

                {/* Reactions Picker */}
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      ref={reactionsRef}
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute top-full mt-2 left-0 z-[100]"
                      onMouseLeave={(e) => {
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (!actionsRef.current?.contains(relatedTarget)) {
                          setShowReactions(false);
                        }
                      }}
                    >
                      <div className="p-2 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-xl">
                        <div className="flex gap-1">
                          {QUICK_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                onReaction?.(message.id, emoji);
                                setShowReactions(false);
                              }}
                              className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-lg hover:scale-110"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions Menu */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute top-full mt-2 left-0 z-50 min-w-[180px]"
                      onMouseLeave={(e) => {
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (!actionsRef.current?.contains(relatedTarget)) {
                          setShowMenu(false);
                        }
                      }}
                    >
                      <div className="rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-xl overflow-hidden">
                        {[
                          { icon: faCopy, label: 'Copy Text', color: 'text-cyan-400', onClick: handleCopy, danger: false },
                          onBookmark && { icon: faBookmark, label: 'Bookmark', color: 'text-blue-400', onClick: () => { onBookmark(message.id); setShowMenu(false); }, danger: false },
                          onPin && { icon: faThumbtack, label: message.is_pinned ? 'Unpin' : 'Pin', color: 'text-yellow-400', onClick: () => { onPin(message.id, !message.is_pinned); setShowMenu(false); }, danger: false },
                          { icon: faForward, label: 'Forward', color: 'text-purple-400', onClick: () => setShowMenu(false), danger: false },
                          isOwn && onDelete && { icon: faTrash, label: 'Delete', color: 'text-red-400', onClick: () => { onDelete(message.id); setShowMenu(false); }, danger: true },
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Reactions - GROUPED OR INDIVIDUAL */}
          {groupedReactions && Object.keys(groupedReactions).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end mr-2' : 'ml-2'} relative`}>
              {shouldGroupReactions ? (
                // Grouped view for 3+ reaction types
                <button
                  onClick={() => setShowReactionDetails(!showReactionDetails)}
                  className="px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors text-xs bg-zinc-800/70 border border-zinc-700/50 hover:bg-zinc-700"
                >
                  <div className="flex -space-x-1">
                    {reactionTypes.slice(0, 3).map((emoji, i) => (
                      <span key={i} className="text-xs">{emoji}</span>
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">
                    {totalReactionCount}
                  </span>
                </button>
              ) : (
                // Individual pills for 1-2 reaction types
                <>
                  {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        if (hasUserReacted(emoji)) {
                          onRemoveReaction?.(message.id, emoji);
                        } else {
                          onReaction?.(message.id, emoji);
                        }
                      }}
                      className={`px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors text-xs ${
                        hasUserReacted(emoji)
                          ? 'bg-purple-500/20 border border-purple-500/40'
                          : 'bg-zinc-800/70 border border-zinc-700/50 hover:bg-zinc-700'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className={`text-[10px] font-medium ${
                        hasUserReacted(emoji) ? 'text-purple-400' : 'text-gray-400'
                      }`}>
                        {reactions?.length}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Reaction Details Dropdown */}
              <AnimatePresence>
                {showReactionDetails && shouldGroupReactions && (
                  <motion.div
                    ref={reactionDetailsRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-2 z-[100] min-w-[220px]`}
                  >
                    <div className="rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                      <div className="p-2">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
                          Reactions ({totalReactionCount})
                        </div>
                        {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                          <div key={emoji} className="mb-2 last:mb-0">
                            <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800/30 rounded-lg mb-1">
                              <span className="text-lg">{emoji}</span>
                              <span className="text-xs text-gray-400">{reactions?.length}</span>
                            </div>
                            {reactions?.map((reaction: any) => {
                              const user = (reaction as any).user || message.sender;
                              return (
                                <div 
                                  key={reaction.id}
                                  className="flex items-center justify-between px-3 py-1.5 hover:bg-white/5 rounded transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                                      {(user?.display_name || user?.username || 'U')[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs text-white font-medium">
                                      {user?.display_name || user?.username || 'Unknown'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-500">
                                    {formatReactionTime(reaction.created_at)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
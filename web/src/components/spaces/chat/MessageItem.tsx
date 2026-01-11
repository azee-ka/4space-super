// Borderless Shadow-Based Message Item - Matching Spaces/SpaceView Design
// web/src/components/spaces/chat/MessageItem.tsx

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReply, faEdit, faTrash, faThumbtack, faBookmark, faEllipsisV,
  faCopy, faForward, faSmile, faCheck, faCheckDouble,
  faQuoteLeft, faFile, faDownload, faPlayCircle
} from '@fortawesome/free-solid-svg-icons';
import type { Message } from '@4space/shared/src/services/messages.service';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string, pinned: boolean) => void;
  onBookmark?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export function MessageItem({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onBookmark,
  onReaction,
  onRemoveReaction,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setShowActions(false);
  };

  const groupedReactions = message.reactions?.reduce((acc, r) => {
    if (!acc[r.reaction]) acc[r.reaction] = [];
    acc[r.reaction].push(r);
    return acc;
  }, {} as Record<string, typeof message.reactions>);

  const hasUserReacted = (emoji: string) => {
    return message.reactions?.some(r => r.reaction === emoji && r.user_id === message.sender_id);
  };

  const getMessageGlow = () => {
    if (isOwn) return 'from-cyan-500/25 via-purple-500/20 to-cyan-500/25';
    if (message.is_pinned) return 'from-yellow-500/25 via-yellow-500/20 to-yellow-500/25';
    return 'from-gray-500/25 via-gray-500/20 to-gray-500/25';
  };

  const getMessageBorder = () => {
    if (isOwn) return 'border-cyan-500/30';
    if (message.is_pinned) return 'border-yellow-500/30';
    return 'border-gray-500/30';
  };

  return (
    <div className={`group flex gap-3 px-4 py-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.display_name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm">
              {(message.sender?.display_name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwn ? 'flex items-end flex-col' : ''}`}>
        {/* Header */}
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm font-medium text-white">
              {message.sender?.display_name || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
            {message.edited_at && (
              <span className="text-xs text-gray-500 italic">(edited)</span>
            )}
            {message.is_pinned && (
              <FontAwesomeIcon icon={faThumbtack} className="text-yellow-400 text-xs" />
            )}
          </div>
        )}

        {/* Reply To */}
        {message.reply_to && (
          <div className={`mb-2 ${isOwn ? 'ml-auto' : ''}`}>
            <div className="relative group/reply">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-purple-500/20 to-cyan-500/25 rounded-lg blur-sm" />
              <div className="absolute inset-0 rounded-lg border border-cyan-500/30" />
              <div className="relative px-3 py-2 rounded-lg bg-black/70 backdrop-blur-xl">
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                  <FontAwesomeIcon icon={faQuoteLeft} className="text-cyan-400" />
                  Replying to <span className="font-medium text-cyan-400">{message.reply_to.sender?.display_name}</span>
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {message.reply_to.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message Card */}
        <div className={`relative group/msg ${isOwn ? 'ml-auto' : ''}`}>
          <div className={`relative group/card`}>
            <div className={`absolute -inset-[1px] bg-gradient-to-r ${getMessageGlow()} rounded-xl blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity`} />
            <div className={`absolute inset-0 rounded-xl border ${getMessageBorder()} opacity-0 group-hover/card:opacity-100 transition-opacity`} />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover/card:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative px-4 py-3 rounded-xl max-w-2xl backdrop-blur-xl bg-black/70 hover:bg-black/80 transition-all ${
              message.deleted_at ? 'opacity-50' : ''
            } ${isOwn ? 'bg-cyan-500/10' : ''}`}>
              {message.deleted_at ? (
                <p className="text-sm italic text-gray-400">This message was deleted</p>
              ) : (
                <>
                  {/* Text Content */}
                  {message.message_type === 'text' && (
                    <p className="text-sm text-white whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}

                  {/* Code Block */}
                  {message.message_type === 'code' && (
                    <pre className="text-sm bg-black/50 p-3 rounded-lg overflow-x-auto border border-white/10">
                      <code className="text-cyan-400">{message.content}</code>
                    </pre>
                  )}

                  {/* Image */}
                  {message.message_type === 'image' && message.attachments?.[0] && (
                    <div className="space-y-2">
                      {message.content && <p className="text-sm text-white mb-2">{message.content}</p>}
                      <img
                        src={message.attachments[0].url}
                        alt={message.attachments[0].name}
                        className="max-w-md rounded-lg cursor-pointer border border-white/10"
                        onClick={() => window.open(message.attachments![0].url, '_blank')}
                      />
                    </div>
                  )}

                  {/* File */}
                  {message.message_type === 'file' && message.attachments?.[0] && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faFile} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{message.attachments[0].name}</p>
                        <p className="text-xs text-gray-400">
                          {(message.attachments[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <a
                        href={message.attachments[0].url}
                        download
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-sm text-gray-400" />
                      </a>
                    </div>
                  )}

                  {/* Voice Message */}
                  {message.message_type === 'voice' && message.attachments?.[0] && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors">
                        <FontAwesomeIcon icon={faPlayCircle} className="text-gray-400" />
                      </button>
                      <div className="flex-1 h-2 bg-white/10 rounded-full" />
                      <span className="text-xs text-gray-400">0:45</span>
                    </div>
                  )}
                </>
              )}

              {/* Read Status */}
              {isOwn && !message.deleted_at && (
                <div className="absolute -bottom-1 -right-1">
                  {message.read_receipts && message.read_receipts.length > 0 ? (
                    <FontAwesomeIcon icon={faCheckDouble} className="text-cyan-400 text-xs" />
                  ) : (
                    <FontAwesomeIcon icon={faCheck} className="text-gray-500 text-xs" />
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions (Hover) */}
            {!message.deleted_at && (
              <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover/msg:opacity-100 transition-opacity px-2 z-20`}>
                <div className="relative group/actions">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-gray-500/25 via-gray-500/20 to-gray-500/25 rounded-lg blur-sm" />
                  <div className="absolute inset-0 rounded-lg border border-gray-500/30" />
                  <div className="relative flex items-center gap-1 p-1 rounded-lg bg-black/90 backdrop-blur-xl">
                    <button
                      onClick={() => setShowReactions(!showReactions)}
                      className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
                      title="Add reaction"
                    >
                      <FontAwesomeIcon icon={faSmile} className="text-pink-400 text-xs" />
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
                        <FontAwesomeIcon icon={faEdit} className="text-yellow-400 text-xs" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowActions(!showActions)}
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
                        ref={actionsRef}
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute top-full mt-2 left-0 z-50"
                      >
                        <div className="relative group/picker">
                          <div className="absolute -inset-[1px] bg-gradient-to-r from-pink-500/25 via-purple-500/20 to-pink-500/25 rounded-lg blur-sm" />
                          <div className="absolute inset-0 rounded-lg border border-pink-500/30" />
                          <div className="relative p-2 rounded-lg bg-black/90 backdrop-blur-xl">
                            <div className="flex gap-1">
                              {QUICK_REACTIONS.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    onReaction?.(message.id, emoji);
                                    setShowReactions(false);
                                  }}
                                  className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions Menu */}
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        ref={actionsRef}
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute top-full mt-2 left-0 z-50 min-w-[180px]"
                      >
                        <div className="relative group/menu">
                          <div className="absolute -inset-[1px] bg-gradient-to-r from-gray-500/25 via-gray-500/20 to-gray-500/25 rounded-lg blur-sm" />
                          <div className="absolute inset-0 rounded-lg border border-gray-500/30" />
                          <div className="relative rounded-lg bg-black/90 backdrop-blur-xl overflow-hidden">
                            {(() => {
                            const actions: Array<{ icon: any; label: string; color: string; onClick: () => void; danger: boolean }> = [
                              { icon: faCopy, label: 'Copy Text', color: 'text-cyan-400', onClick: handleCopy, danger: false },
                            ];
                            if (onBookmark) {
                              actions.push({ icon: faBookmark, label: 'Bookmark', color: 'text-blue-400', onClick: () => { onBookmark(message.id); setShowActions(false); }, danger: false });
                            }
                            if (onPin) {
                              actions.push({ icon: faThumbtack, label: message.is_pinned ? 'Unpin' : 'Pin', color: 'text-yellow-400', onClick: () => { onPin(message.id, !message.is_pinned); setShowActions(false); }, danger: false });
                            }
                            actions.push({ icon: faForward, label: 'Forward', color: 'text-purple-400', onClick: () => setShowActions(false), danger: false });
                            if (isOwn && onDelete) {
                              actions.push({ icon: faTrash, label: 'Delete', color: 'text-red-400', onClick: () => { onDelete(message.id); setShowActions(false); }, danger: true });
                            }
                            return actions;
                          })().map(({ icon, label, color, onClick, danger }) => (
                            <button
                              key={label}
                              onClick={onClick}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-white/10 last:border-0 ${
                                danger ? 'hover:bg-red-500/10' : ''
                              }`}
                            >
                              <FontAwesomeIcon icon={icon} className={`${color} text-sm`} />
                              <span className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</span>
                            </button>
                          ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reactions */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
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
                className={`px-2 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  hasUserReacted(emoji)
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">{emoji}</span>
                <span className={`text-xs font-medium ${
                  hasUserReacted(emoji) ? 'text-cyan-400' : 'text-gray-400'
                }`}>
                  {reactions?.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Thread Preview */}
        {message.thread_messages_count && message.thread_messages_count > 0 && (
          <button className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs text-cyan-400">
            <FontAwesomeIcon icon={faReply} />
            <span>{message.thread_messages_count} replies</span>
          </button>
        )}
      </div>
    </div>
  );
}

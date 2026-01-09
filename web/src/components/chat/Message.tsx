// Advanced Message Component with Futuristic Design
// web/src/components/chat/AdvancedMessage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReply, faEdit, faTrash, faCopy, faForward, faEllipsisV,
  faCheck, faCheckDouble, faDownload, faShare,
  faEye, faHeart, faLaugh, faAngry, faSurprise, faSadTear,
  faClock, faShieldAlt, faFileAlt, faImage, faVideo, faMusic,
  faMapMarkerAlt, faPhone, faFile
} from '@fortawesome/free-solid-svg-icons';
import { type Message, type MessageReaction } from '../../services/realtime.service';
import { useAuthStore } from '../../store/authStore';

interface MessageProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (message: Message) => void;
  onReact?: (messageId: string, reaction: string) => void;
  onRemoveReaction?: (messageId: string, reaction: string) => void;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '🎉', '👏'];

const MESSAGE_TYPE_ICONS = {
  text: faFileAlt,
  image: faImage,
  video: faVideo,
  audio: faMusic,
  voice: faMusic,
  file: faFile,
  location: faMapMarkerAlt,
  contact: faPhone,
  poll: faFileAlt,
  sticker: faImage,
};

export function Message({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onReact,
  onRemoveReaction,
}: MessageProps) {
  const { user } = useAuthStore();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.encrypted_content);
    setShowActions(false);
  };

  const handleReaction = (reaction: string) => {
    const existingReaction = message.reactions?.find(
      r => r.user_id === user?.id && r.reaction === reaction
    );

    if (existingReaction) {
      onRemoveReaction?.(message.id, reaction);
    } else {
      onReact?.(message.id, reaction);
    }
    setShowReactions(false);
  };

  const getReactionCount = (reaction: string) => {
    return message.reactions?.filter(r => r.reaction === reaction).length || 0;
  };

  const hasUserReacted = (reaction: string) => {
    return message.reactions?.some(r => r.user_id === user?.id && r.reaction === reaction);
  };

  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = [];
    }
    acc[reaction.reaction].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="relative group">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              </div>
            )}
            <img
              src={message.metadata?.url}
              alt="Shared image"
              className="max-w-sm rounded-2xl transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all">
                <FontAwesomeIcon icon={faDownload} className="text-white" />
              </button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative max-w-sm rounded-2xl overflow-hidden group">
            <video
              src={message.metadata?.url}
              controls
              className="w-full rounded-2xl"
              poster={message.metadata?.thumbnail}
            />
          </div>
        );

      case 'audio':
      case 'voice':
        return (
          <div className="flex items-center gap-3 bg-gradient-to-r from-primary-500/10 to-cyan-500/10 rounded-2xl p-4 min-w-[280px]">
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-cyan-600 flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-primary-500/30">
              <FontAwesomeIcon icon={faMusic} className="text-white text-sm" />
            </button>
            <div className="flex-1">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {message.metadata?.duration ? `${Math.floor(message.metadata.duration / 60)}:${(message.metadata.duration % 60).toString().padStart(2, '0')}` : '0:00'}
              </p>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 min-w-[280px]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faFile} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{message.metadata?.fileName}</p>
              <p className="text-xs text-gray-400">{message.metadata?.fileSize}</p>
            </div>
            <button className="w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-all">
              <FontAwesomeIcon icon={faDownload} className="text-gray-400 text-xs" />
            </button>
          </div>
        );

      case 'location':
        return (
          <div className="relative w-[300px] h-[200px] rounded-2xl overflow-hidden bg-gray-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 text-4xl" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm font-medium">{message.metadata?.locationName}</p>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.encrypted_content}
          </p>
        );
    }
  };

  return (
    <div
      ref={messageRef}
      className={`flex items-end gap-2 mb-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-message-in`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => !showReactions && setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0 w-10 h-10">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.display_name}
              className="w-10 h-10 rounded-full ring-2 ring-primary-500/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {message.sender?.display_name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message Container */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name (for group chats) */}
        {!isOwn && showAvatar && (
          <p className="text-xs font-medium text-primary-400 mb-1 px-1">
            {message.sender?.display_name}
          </p>
        )}

        {/* Reply preview */}
        {message.reply_to_id && (
          <div className="mb-2 px-4 py-2 bg-gray-800/30 rounded-lg border-l-4 border-primary-500/50 max-w-full">
            <p className="text-xs text-primary-400 font-medium mb-1">Replying to...</p>
            <p className="text-xs text-gray-400 truncate">Original message content</p>
          </div>
        )}

        {/* Message Bubble */}
        <div className="relative">
          <div
            className={`
              relative px-4 py-3 rounded-2xl backdrop-blur-xl
              ${isOwn
                ? 'bg-gradient-to-br from-primary-500/90 to-cyan-600/90 text-white rounded-br-md'
                : 'glass text-gray-100 rounded-bl-md'
              }
              ${message.deleted_at ? 'opacity-50 italic' : ''}
              shadow-lg hover:shadow-2xl transition-all duration-300
            `}
          >
            {/* Encrypted indicator */}
            <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-4 h-4 rounded-full bg-green-500/80 backdrop-blur-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-white text-[8px]" />
              </div>
            </div>

            {/* Forward indicator */}
            {message.forward_from_id && (
              <div className="flex items-center gap-1 text-xs opacity-60 mb-2">
                <FontAwesomeIcon icon={faForward} />
                <span>Forwarded</span>
              </div>
            )}

            {/* Content */}
            <div>{renderMessageContent()}</div>

            {/* Edited indicator */}
            {message.edited_at && (
              <p className="text-xs opacity-60 mt-1">edited</p>
            )}

            {/* Timestamp and Status */}
            <div className="flex items-center gap-2 mt-2 justify-end">
              {showTimestamp && (
                <span className="text-xs opacity-60">
                  {formatTime(message.created_at)}
                </span>
              )}
              {isOwn && (
                <FontAwesomeIcon
                  icon={message.read_receipts?.length ? faCheckDouble : faCheck}
                  className={`text-xs ${message.read_receipts?.length ? 'text-cyan-300' : 'opacity-60'}`}
                />
              )}
              {message.ttl && (
                <FontAwesomeIcon icon={faClock} className="text-xs opacity-60" />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div
              ref={actionsRef}
              className={`absolute ${isOwn ? 'left-0' : 'right-0'} top-0 flex gap-1 transform -translate-y-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              {!showReactions ? (
                <>
                  <button
                    onClick={() => setShowReactions(true)}
                    className="w-8 h-8 rounded-lg glass hover:bg-gray-700/50 flex items-center justify-center transition-all"
                    title="React"
                  >
                    <FontAwesomeIcon icon={faHeart} className="text-xs" />
                  </button>
                  {onReply && (
                    <button
                      onClick={() => onReply(message)}
                      className="w-8 h-8 rounded-lg glass hover:bg-gray-700/50 flex items-center justify-center transition-all"
                      title="Reply"
                    >
                      <FontAwesomeIcon icon={faReply} className="text-xs" />
                    </button>
                  )}
                  {isOwn && onEdit && !message.deleted_at && (
                    <button
                      onClick={() => onEdit(message)}
                      className="w-8 h-8 rounded-lg glass hover:bg-gray-700/50 flex items-center justify-center transition-all"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                  )}
                  <button
                    onClick={handleCopyMessage}
                    className="w-8 h-8 rounded-lg glass hover:bg-gray-700/50 flex items-center justify-center transition-all"
                    title="Copy"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-xs" />
                  </button>
                  {onForward && (
                    <button
                      onClick={() => onForward(message)}
                      className="w-8 h-8 rounded-lg glass hover:bg-gray-700/50 flex items-center justify-center transition-all"
                      title="Forward"
                    >
                      <FontAwesomeIcon icon={faForward} className="text-xs" />
                    </button>
                  )}
                  {isOwn && onDelete && (
                    <button
                      onClick={() => onDelete(message.id)}
                      className="w-8 h-8 rounded-lg glass hover:bg-red-500/20 flex items-center justify-center transition-all"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-red-400 text-xs" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex gap-1 bg-gray-900/95 backdrop-blur-xl rounded-xl p-2 border border-gray-700/50 shadow-2xl animate-scale-in">
                  {QUICK_REACTIONS.map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => handleReaction(reaction)}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-125
                        ${hasUserReacted(reaction) ? 'bg-primary-500/30 ring-2 ring-primary-500/50' : 'hover:bg-gray-800/50'}
                      `}
                      title={reaction}
                    >
                      <span className="text-lg">{reaction}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reactions Summary */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(groupedReactions).map(([reaction, reactions]) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className={`
                  group flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-xl transition-all
                  ${hasUserReacted(reaction)
                    ? 'bg-primary-500/20 ring-2 ring-primary-500/50 hover:bg-primary-500/30'
                    : 'bg-gray-800/30 hover:bg-gray-700/40'
                  }
                `}
                title={reactions.map(r => r.user?.display_name).join(', ')}
              >
                <span className="text-sm group-hover:scale-125 transition-transform">{reaction}</span>
                <span className="text-xs font-medium">{reactions.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
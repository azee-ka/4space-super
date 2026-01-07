import React, { useState } from 'react';
import type { Message } from '@4space/shared';

interface MessageBubbleProps {
  message: Message & { decrypted_content?: string; sender?: any };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex items-end gap-2 max-w-[75%] sm:max-w-[60%] ${isOwn && 'flex-row-reverse'}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0 mb-1">
            {message.sender?.avatar_url ? (
              <img
                src={message.sender.avatar_url}
                alt={message.sender.display_name}
                className="w-8 h-8 rounded-full ring-2 ring-white/20 dark:ring-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20 dark:ring-white/10">
                {getInitials(message.sender?.display_name || 'U')}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Sender name (for others' messages) */}
          {!isOwn && (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 ml-2">
              {message.sender?.display_name || 'Unknown'}
            </p>
          )}

          {/* Message bubble */}
          <div className="relative">
            <div
              className={`
                px-4 py-2.5 rounded-2xl shadow-sm
                transition-all duration-200
                ${isOwn 
                  ? 'gradient-primary text-white rounded-br-md' 
                  : 'glass text-gray-900 dark:text-white rounded-bl-md'
                }
                ${showActions && !isOwn ? 'shadow-lg' : ''}
              `}
            >
              {/* Message content */}
              <p className="text-sm sm:text-base break-words whitespace-pre-wrap leading-relaxed">
                {message.decrypted_content || (
                  <span className="italic opacity-70">
                    🔒 Encrypted message
                  </span>
                )}
              </p>

              {/* Metadata */}
              {(message as any).metadata && Object.keys((message as any).metadata).length > 0 && (
                <div className="mt-2 pt-2 border-t border-current/10">
                  <p className="text-xs opacity-70">
                    {JSON.stringify((message as any).metadata)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions overlay */}
            {showActions && (
              <div
                className={`
                  absolute -top-8 flex items-center gap-1 glass rounded-lg p-1 shadow-lg
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  ${isOwn ? 'right-0' : 'left-0'}
                `}
              >
                <button
                  className="p-1.5 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                  title="React"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  className="p-1.5 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                  title="Reply"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  className="p-1.5 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                  title="More"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Timestamp and status */}
          <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
              {formatTime(message.created_at)}
            </p>
            
            {isOwn && (
              <div className="flex items-center">
                {/* Read receipt */}
                <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" transform="translate(3, 0)" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
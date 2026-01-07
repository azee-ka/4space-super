import React, { useState, useRef, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  loading?: boolean;
}

export function MessageInput({ onSend, loading = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !loading) {
      onSend(text.trim());
      setText('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="relative">
      {/* Typing indicator */}
      {loading && (
        <div className="absolute -top-8 left-0 flex items-center gap-2 glass rounded-lg px-3 py-1.5 shadow-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Sending...</span>
        </div>
      )}

      <div className="glass rounded-2xl p-3 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
        <div className="flex items-end gap-3">
          {/* Actions button */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowActions(!showActions)}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all
                ${showActions 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Actions menu */}
            {showActions && (
              <div className="absolute bottom-full left-0 mb-2 glass rounded-2xl p-2 shadow-2xl animate-slide-down min-w-[200px]">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Photos</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Share images</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Files</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Upload documents</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Audio</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Record voice note</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Text input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={loading}
              className="w-full resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none disabled:opacity-50 max-h-[150px]"
              style={{ minHeight: '24px' }}
            />
            
            {/* Character count */}
            {text.length > 900 && (
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${text.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                  {text.length}/1000
                </span>
              </div>
            )}
          </div>

          {/* Emoji button */}
          <button
            type="button"
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || loading}
            className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all transform
              ${text.trim() && !loading
                ? 'gradient-primary text-white shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60 hover:scale-105 active:scale-95'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Quick suggestions */}
      {!text && !showActions && (
        <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
          <button
            onClick={() => setText('👍')}
            className="flex-shrink-0 px-3 py-1.5 glass rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            👍
          </button>
          <button
            onClick={() => setText('Thanks!')}
            className="flex-shrink-0 px-3 py-1.5 glass rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Thanks!
          </button>
          <button
            onClick={() => setText('Got it')}
            className="flex-shrink-0 px-3 py-1.5 glass rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
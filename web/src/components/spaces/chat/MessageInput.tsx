// Beautiful Message Input Component
// web/src/components/spaces/chat/MessageInput.tsx

import { useState, useRef, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane, faImage, faFile, faSmile, faMicrophone,
  faTimes, faCode, faBold, faItalic
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@4space/shared/src/services/messages.service';

interface MessageInputProps {
  onSend: (content: string, type?: string, attachments?: any[]) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  replyTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set editing message content when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content ?? '');
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea - optimized
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }

    // Typing indicator with debounce
    if (value.length > 0) {
      onTyping();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 1000);
    } else {
      onStopTyping();
    }
  }, [onTyping, onStopTyping]);

  const handleSend = useCallback(async () => {
    if (!message.trim() || disabled || isSending) return;

    setIsSending(true);
    try {
      await onSend(message.trim());
      setMessage('');
      onStopTyping();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, disabled, isSending, onSend, onStopTyping]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleFileUpload = () => {
    alert('File upload coming soon!');
  };

  const handleImageUpload = () => {
    alert('Image upload coming soon!');
  };

  const handleVoiceRecord = () => {
    alert('Voice recording coming soon!');
  };

  return (
    <div className="border-t border-zinc-800/50 bg-black/20">
      {/* Reply/Edit Bar */}
      <AnimatePresence>
        {(replyTo || editingMessage) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 pt-3 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1 h-4 rounded-full ${editingMessage ? 'bg-yellow-500' : 'bg-purple-500'}`} />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {editingMessage ? 'Editing Message' : 'Replying to'}
                  </span>
                  {replyTo && (
                    <span className="text-xs text-cyan-400 font-medium">
                      {replyTo.sender?.username}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 truncate ml-3">
                  {editingMessage?.content || replyTo?.content}
                </p>
              </div>
              <button
                onClick={editingMessage ? onCancelEdit : onCancelReply}
                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors ml-3"
              >
                <FontAwesomeIcon icon={faTimes} className="text-red-400 text-sm" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4">
        <div
          className={`rounded-2xl bg-zinc-900/50 border transition-all ${
            isFocused
              ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10'
              : 'border-zinc-800/50'
          }`}
        >
          <div className="flex items-end gap-2.5 p-3">
            {/* Attachment Buttons */}
            <div className="flex gap-1 pb-0.5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleImageUpload}
                className="w-9 h-9 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 flex items-center justify-center transition-all group"
                title="Upload image"
              >
                <FontAwesomeIcon icon={faImage} className="text-pink-400 text-sm group-hover:scale-110 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFileUpload}
                className="w-9 h-9 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-all group"
                title="Upload file"
              >
                <FontAwesomeIcon icon={faFile} className="text-purple-400 text-sm group-hover:scale-110 transition-transform" />
              </motion.button>
            </div>

            {/* Text Input */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled || isSending}
                placeholder={placeholder}
                rows={1}
                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 resize-none text-white placeholder-gray-500 text-[15px] leading-relaxed max-h-[200px] custom-scrollbar"
                style={{ minHeight: '24px' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 pb-0.5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleVoiceRecord}
                className="w-9 h-9 rounded-xl bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-all group"
                title="Voice message"
              >
                <FontAwesomeIcon icon={faMicrophone} className="text-green-400 text-sm group-hover:scale-110 transition-transform" />
              </motion.button>
              
              {/* Send Button */}
              <motion.button
                onClick={handleSend}
                disabled={!message.trim() || disabled || isSending}
                whileHover={message.trim() && !disabled && !isSending ? { scale: 1.05 } : {}}
                whileTap={message.trim() && !disabled && !isSending ? { scale: 0.95 } : {}}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  message.trim() && !disabled && !isSending
                    ? 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'
                    : 'bg-zinc-800/50 cursor-not-allowed opacity-50'
                }`}
                title="Send message"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className={`text-sm transition-colors ${
                      message.trim() && !disabled ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                )}
              </motion.button>
            </div>
          </div>

          {/* Formatting Bar (when focused and typing) */}
          <AnimatePresence>
            {isFocused && message.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="border-t border-zinc-800/50 px-3 py-2 overflow-hidden"
              >
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-colors group">
                    <FontAwesomeIcon icon={faBold} className="text-blue-400 text-xs group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors group">
                    <FontAwesomeIcon icon={faItalic} className="text-purple-400 text-xs group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-colors group">
                    <FontAwesomeIcon icon={faCode} className="text-green-400 text-xs group-hover:scale-110 transition-transform" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 flex items-center justify-center transition-colors group">
                    <FontAwesomeIcon icon={faSmile} className="text-yellow-400 text-xs group-hover:scale-110 transition-transform" />
                  </button>
                  
                  <div className="flex-1" />
                  
                  <span className="text-xs text-gray-500">
                    {message.length} / 2000
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-xs text-gray-500">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/50 text-gray-400 font-mono text-xs">Enter</kbd> to send,{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/50 text-gray-400 font-mono text-xs">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
// MessageInput using native textarea - FIXED FOCUS ISSUE
// web/src/components/spaces/chat/MessageInput.tsx

import { useState, useRef, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane, faSmile, faTimes, faFileAlt,
  faImage, faVideo, faFile, faPlus, faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@4space/shared/src/services/messages.service';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import CustomTextarea from '../../ui/CustomTextarea';

interface MessageInputProps {
  onSend: (content: string, type?: string, attachments?: any[]) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'document';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Simple focus maintenance: refocus when message clears after send
  useEffect(() => {
    // If message was cleared (had content before, now empty), refocus
    if (message === '' && textareaRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (textareaRef.current && document.activeElement !== textareaRef.current) {
          textareaRef.current.focus();
          setIsFocused(true);
        }
      });
    }
  }, [message]);

  // Auto-focus when replyTo changes
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          setIsFocused(true);
        }
      });
    }
  }, [replyTo]);

  // Handle text changes and typing indicators
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessage(text);
    
    // Typing indicator
    if (text.trim().length > 0) {
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

  const handleSend = useCallback(() => {
    const textContent = message.trim();
    if (!textContent && attachedFiles.length === 0) return;
    
    // Capture values before clearing
    const messageContent = textContent;
    const filesArray = [...attachedFiles].map(f => f.file);
    
    // Clear state immediately - simple and direct
    setMessage('');
    setAttachedFiles([]);
    onStopTyping();
    
    // Send message (fire and forget - realtime will handle update)
    // No blocking, no flags, no delays - just send
    onSend(messageContent, 'text', filesArray);
  }, [message, attachedFiles, onSend, onStopTyping]);

  // Handle keyboard events (Enter to send, Shift+Enter for newline)
  // Simple like old project - just prevent default and send
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Set editing message content
  useEffect(() => {
    if (editingMessage && textareaRef.current) {
      // Strip HTML tags if content is HTML (for backward compatibility)
      const content = editingMessage.content ?? '';
      const textContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      setMessage(textContent);
      // Focus and move cursor to end after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textContent.length, textContent.length);
        }
      }, 0);
    }
  }, [editingMessage]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsidePicker = emojiPickerRef.current?.contains(target);
      const clickedOnEmojiButton = emojiButtonRef.current?.contains(target);
      
      if (!clickedInsidePicker && !clickedOnEmojiButton) {
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

  const handleEmojiSelect = (emoji: any) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = message;
    const emojiText = emoji.native || emoji.emoji || '';
    const newText = text.substring(0, start) + emojiText + text.substring(end);
    
    setMessage(newText);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // File handling
  const handleFileSelect = async (files: FileList | null, type?: 'image' | 'video' | 'document') => {
    if (!files) return;
    
    const newFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = type || (
        file.type.startsWith('image/') ? 'image' :
        file.type.startsWith('video/') ? 'video' :
        'document'
      );
      
      const attachedFile: AttachedFile = {
        id: Math.random().toString(36),
        file,
        type: fileType,
      };
      
      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachedFile.preview = e.target?.result as string;
          setAttachedFiles(prev => [...prev, attachedFile]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(attachedFile);
      }
    }
    
    if (newFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    
    setShowFileMenu(false);
  };

  // Drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === containerRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div 
      ref={containerRef}
      className="border-t border-zinc-800/50 bg-transparent"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-500 rounded-2xl z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faImage} className="text-3xl text-cyan-400" />
              </div>
              <p className="text-lg font-bold text-white">Drop files to upload</p>
              <p className="text-sm text-gray-400 mt-1">Images, videos, and documents</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply/Edit Bar */}
      <AnimatePresence>
        {(replyTo || editingMessage) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
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
                type="button"
                data-cancel-button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => {
                  if (editingMessage && onCancelEdit) {
                    setMessage('');
                    onCancelEdit();
                  } else if (onCancelReply) {
                    onCancelReply();
                  }
                }}
                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors ml-3"
              >
                <FontAwesomeIcon icon={faTimes} className="text-red-400 text-sm" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached Files Preview */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="px-6 pt-3 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                    {file.preview ? (
                      <img src={file.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FontAwesomeIcon 
                        icon={file.type === 'video' ? faVideo : faFileAlt} 
                        className="text-2xl text-gray-400" 
                      />
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-white text-xs" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm px-1 py-0.5">
                    <p className="text-[9px] text-white truncate">{file.file.name}</p>
                  </div>
                </motion.div>
              ))}
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
          <div className="flex items-end gap-2 p-3">
            {/* Emoji Button */}
            <div className="relative pb-0.5">
              <motion.button
                ref={emojiButtonRef}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  showEmojiPicker
                    ? 'bg-yellow-500/20 border-2 border-yellow-500/50'
                    : 'bg-yellow-500/10 hover:bg-yellow-500/20'
                }`}
                title="Emoji"
              >
                <FontAwesomeIcon icon={faSmile} className="text-yellow-400 text-lg" />
              </motion.button>

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    ref={emojiPickerRef}
                    data-emoji-picker
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 mb-2 z-50"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="dark"
                      previewPosition="none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Textarea */}
            <div className="flex-1 min-w-0 items-end flex">
              <CustomTextarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                maxHeight={200}
                minHeight={40}
                disabled={disabled}
                autoFocus
                className=" h-full w-full bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:ring-offset-0 resize-none py-3 px-1 text-sm"
              />
            </div>

            {/* File Upload Button with Dropdown */}
            <div className="relative pb-0.5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => setShowFileMenu(!showFileMenu)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  showFileMenu
                    ? 'bg-purple-500/20 border-2 border-purple-500/50'
                    : 'bg-purple-500/10 hover:bg-purple-500/20'
                }`}
                title="Attach file"
              >
                <FontAwesomeIcon 
                  icon={showFileMenu ? faChevronUp : faPlus} 
                  className="text-purple-400 text-sm" 
                />
              </motion.button>

              {/* File Menu Dropdown */}
              <AnimatePresence>
                {showFileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full right-0 mb-2 z-50"
                  >
                    <div className="rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 shadow-2xl overflow-hidden min-w-[200px]">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                          <FontAwesomeIcon icon={faImage} className="text-pink-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">Image</p>
                          <p className="text-xs text-gray-400">Upload photos</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-t border-zinc-800/30"
                      >
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <FontAwesomeIcon icon={faVideo} className="text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">Video</p>
                          <p className="text-xs text-gray-400">Upload videos</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-t border-zinc-800/30"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <FontAwesomeIcon icon={faFile} className="text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">Document</p>
                          <p className="text-xs text-gray-400">Upload any file</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden file inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'image')}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'video')}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'document')}
                className="hidden"
              />
            </div>
            
            {/* Send Button - Simple like old project */}
            <div className="pb-0.5">
              <motion.button
                type="button"
                onMouseDown={(e) => {
                  // Prevent textarea from losing focus when clicking send
                  e.preventDefault();
                }}
                onClick={handleSend}
                disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
                whileHover={message.trim() || attachedFiles.length > 0 ? { scale: 1.05 } : {}}
                whileTap={message.trim() || attachedFiles.length > 0 ? { scale: 0.95 } : {}}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  (message.trim() || attachedFiles.length > 0) && !disabled
                    ? 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30'
                    : 'bg-zinc-800/50 cursor-not-allowed opacity-50'
                }`}
                title="Send message"
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className={`text-sm transition-colors ${
                    (message.trim() || attachedFiles.length > 0) && !disabled ? 'text-white' : 'text-gray-600'
                  }`}
                />
              </motion.button>
            </div>
          </div>
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
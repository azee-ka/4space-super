// Advanced Message Input Component with Rich Features
// web/src/components/chat/AdvancedMessageInput.tsx

import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane, faMicrophone, faImage, faVideo, faFile, faPoll,
  faMapMarkerAlt, faSmile, faAt, faHashtag, faBold, faItalic,
  faUnderline, faCode, faLink, faTimes, faCheck, faStop,
  faPaperclip, faGift, faCalendar, faMusic
} from '@fortawesome/free-solid-svg-icons';

interface MessageInputProps {
  onSend: (content: string, type?: string, metadata?: any) => void;
  onTyping?: () => void;
  replyTo?: any;
  onCancelReply?: () => void;
  loading?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  loading = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!text.trim() && selectedFiles.length === 0) return;
    
    if (selectedFiles.length > 0) {
      // Handle file upload
      selectedFiles.forEach(file => {
        onSend('', getFileType(file.type), {
          file,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          mimeType: file.type,
        });
      });
      setSelectedFiles([]);
    } else {
      onSend(text.trim());
    }
    
    setText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Check for mentions
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1 && lastAtSymbol === cursorPosition - 1) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (lastAtSymbol !== -1) {
      const searchText = textBeforeCursor.substring(lastAtSymbol + 1);
      if (!searchText.includes(' ')) {
        setMentionSearch(searchText);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        // Stop typing indicator after 3 seconds of inactivity
      }, 3000);
    }
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // TODO: Implement actual recording logic with MediaRecorder
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    // TODO: Send recorded audio
    onSend('', 'voice', {
      duration: recordingDuration,
    });
    setRecordingDuration(0);
  };

  const insertFormatting = (format: 'bold' | 'italic' | 'underline' | 'code' | 'link') => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
    }

    const newText = text.substring(0, start) + formattedText + text.substring(end);
    setText(newText);
    
    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 pt-3 pb-2 border-t border-gray-800/50">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500/10 to-cyan-500/10 rounded-xl backdrop-blur-xl border border-primary-500/20">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-1 h-10 bg-gradient-to-b from-primary-500 to-cyan-600 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-400 font-semibold mb-1">
                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                  Replying to {replyTo.sender?.display_name}
                </p>
                <p className="text-sm text-gray-300 truncate">{replyTo.content}</p>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-800/50">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
              >
                <FontAwesomeIcon 
                  icon={file.type.startsWith('image/') ? faImage : file.type.startsWith('video/') ? faVideo : faFile}
                  className="text-purple-400"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate max-w-[120px]">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-red-400 text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute -top-16 left-0 right-0 px-4">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-500/90 to-pink-600/90 rounded-2xl shadow-2xl shadow-red-500/30 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-white font-bold">{formatRecordingTime(recordingDuration)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faStop} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="p-4 border-t border-gray-800/50 bg-black/20 backdrop-blur-xl">
        <div className="glass rounded-2xl focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
          <div className="flex items-end gap-3 p-3">
            {/* Attach Button */}
            <div className="relative flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${showAttachMenu
                    ? 'gradient-primary text-white shadow-lg shadow-primary-500/30'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400'
                  }
                `}
              >
                <FontAwesomeIcon icon={faPaperclip} className="text-sm" />
              </button>

              {/* Attach Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-56 glass rounded-2xl p-2 shadow-2xl border border-gray-700/50 animate-scale-in">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faImage} className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Photo or Video</p>
                      <p className="text-xs text-gray-400">Share media</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faFile} className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document</p>
                      <p className="text-xs text-gray-400">Share files</p>
                    </div>
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-green-500/10 hover:to-teal-500/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faPoll} className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Poll</p>
                      <p className="text-xs text-gray-400">Create a poll</p>
                    </div>
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-xs text-gray-400">Share location</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="flex-1 min-w-0">
              {/* Formatting Toolbar */}
              {showFormatting && (
                <div className="flex gap-1 mb-2 pb-2 border-b border-gray-800/30">
                  {[
                    { icon: faBold, format: 'bold' as const, title: 'Bold' },
                    { icon: faItalic, format: 'italic' as const, title: 'Italic' },
                    { icon: faUnderline, format: 'underline' as const, title: 'Underline' },
                    { icon: faCode, format: 'code' as const, title: 'Code' },
                    { icon: faLink, format: 'link' as const, title: 'Link' },
                  ].map(({ icon, format, title }) => (
                    <button
                      key={format}
                      onClick={() => insertFormatting(format)}
                      className="w-8 h-8 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 flex items-center justify-center transition-all"
                      title={title}
                    >
                      <FontAwesomeIcon icon={icon} className="text-xs text-gray-400" />
                    </button>
                  ))}
                </div>
              )}

              <textarea
                ref={inputRef}
                rows={1}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowFormatting(true)}
                placeholder={placeholder}
                disabled={loading || isRecording}
                className="w-full resize-none bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none disabled:opacity-50 max-h-[200px] text-sm"
                style={{ minHeight: '24px' }}
              />

              {/* Character Count */}
              {text.length > 900 && (
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${text.length > 1000 ? 'text-red-400' : 'text-gray-500'}`}>
                    {text.length}/1000
                  </span>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-10 h-10 rounded-xl bg-gray-800/30 hover:bg-gray-700/50 flex items-center justify-center transition-all"
              >
                <FontAwesomeIcon icon={faSmile} className="text-gray-400 text-sm" />
              </button>

              {/* Voice/Send Button */}
              {text.trim() || selectedFiles.length > 0 ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all transform
                    ${loading
                      ? 'bg-gray-700/50 cursor-not-allowed'
                      : 'gradient-primary text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all transform
                    ${isRecording
                      ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white'
                      : 'bg-gray-800/30 hover:bg-gray-700/50 text-gray-400'
                    }
                  `}
                >
                  <FontAwesomeIcon icon={faMicrophone} className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker (Simple version - can be replaced with full emoji picker library) */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 w-80 max-h-64 glass rounded-2xl p-4 shadow-2xl border border-gray-700/50 overflow-auto animate-scale-in">
          <div className="grid grid-cols-8 gap-2">
            {['😀', '😂', '😍', '😎', '😢', '😡', '👍', '👎', '❤️', '🔥', '🎉', '👏', '💯', '🚀', '✨', '⭐'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setText(prev => prev + emoji);
                  setShowEmojiPicker(false);
                  inputRef.current?.focus();
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center transition-all text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
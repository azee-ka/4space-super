// Advanced Chat View with Futuristic Design and All Features
// web/src/pages/AdvancedChatView.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faSearch, faEllipsisV, faPhone, faVideo,
  faCircle, faBell, faBellSlash, faUserPlus, faShieldAlt,
  faTimes, faDownload, faArchive, faTrash, faStar, faExpand,
  faCompress, faPalette, faLock, faUsers, faInfoCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useSpacesStore } from '../store/spacesStore';
import { realtimeService, type Message, type TypingIndicator, type OnlineStatus } from '../services/realtime.service';
import { Message as MessageComponent } from '../components/chat/Message';
import { MessageInput as MessageInputComponent } from '../components/chat/MessageInput';

interface SpaceDetails {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  icon?: string;
  color?: string;
  type: string;
  privacy: string;
  members_count: number;
  owner_id: string;
}

export function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [space, setSpace] = useState<SpaceDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineStatus>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id) {
      loadSpace();
      loadMessages();
      subscribeToRealtime();
    }

    return () => {
      if (id) {
        realtimeService.unsubscribeFromSpace(id);
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSpace = async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading space:', error);
      return;
    }

    setSpace(data);
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, username, display_name, avatar_url, status),
          reactions:message_reactions(*, user:profiles(username, display_name, avatar_url)),
          read_receipts:message_read_receipts(*, user:profiles(username, display_name))
        `)
        .eq('space_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRealtime = () => {
    if (!id || !user) return;

    // Subscribe to messages and updates
    realtimeService.subscribeToSpace(id, {
      onMessage: (message) => {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        
        // Mark as read if not own message
        if (message.sender_id !== user.id) {
          realtimeService.markAsRead(message.id, user.id);
        }
      },
      onMessageUpdate: (message) => {
        setMessages(prev => prev.map(m => m.id === message.id ? message : m));
      },
      onMessageDelete: (message) => {
        setMessages(prev => prev.filter(m => m.id !== message.id));
      },
      onTyping: (indicators) => {
        // Filter out current user
        setTypingUsers(indicators.filter(i => i.user_id !== user.id));
      },
      onReaction: (reaction) => {
        setMessages(prev => prev.map(m => {
          if (m.id === reaction.message_id) {
            return {
              ...m,
              reactions: [...(m.reactions || []), reaction],
            };
          }
          return m;
        }));
      },
      onReadReceipt: (receipt) => {
        setMessages(prev => prev.map(m => {
          if (m.id === receipt.message_id) {
            return {
              ...m,
              read_receipts: [...(m.read_receipts || []), receipt],
            };
          }
          return m;
        }));
      },
    });

    // Subscribe to presence
    realtimeService.subscribeToPresence(id, user.id, (status) => {
      setOnlineUsers(prev => new Map(prev).set(status.user_id, status));
    });

    // Update own status to online
    realtimeService.updateOnlineStatus(user.id, 'online');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, type = 'text', metadata?: any) => {
    if (!user || !id) return;

    setSending(true);
    try {
      // TODO: Implement actual encryption here
      const encryptedContent = content; // Placeholder for encrypted content

      const { data, error } = await supabase
        .from('messages')
        .insert({
          space_id: id,
          sender_id: user.id,
          encrypted_content: encryptedContent,
          message_type: type,
          reply_to_id: replyTo?.id,
          metadata,
        })
        .select(`
          *,
          sender:profiles(id, username, display_name, avatar_url, status)
        `)
        .single();

      if (error) throw error;

      setReplyTo(null);
      
      // Remove typing indicator
      if (id && user) {
        await realtimeService.removeTypingIndicator(id, user.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!id || !user) return;

    // Send typing indicator
    realtimeService.sendTypingIndicator(id, user.id);
  };

  const handleEditMessage = async (message: Message) => {
    setEditingMessage(message);
    // TODO: Implement edit UI
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    if (!user) return;

    try {
      await realtimeService.addReaction(messageId, user.id, reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleRemoveReaction = async (messageId: string, reaction: string) => {
    if (!user) return;

    try {
      await realtimeService.removeReaction(messageId, user.id, reaction);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-500/20 rounded-full" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-primary-500 text-xl animate-pulse" />
          </div>
        </div>
        <p className="absolute mt-32 text-gray-400 text-sm animate-pulse">
          Establishing secure connection...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800/50 backdrop-blur-xl bg-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 flex items-center justify-center transition-all border border-gray-800/50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-400" />
            </button>

            {/* Space Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {space?.avatar_url ? (
                <img
                  src={space.avatar_url}
                  alt={space.name}
                  className="w-12 h-12 rounded-xl ring-2 ring-primary-500/30"
                />
              ) : (
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${space?.color || 'from-primary-500 to-cyan-600'} flex items-center justify-center`}>
                  <span className="text-white font-bold">
                    {space?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg truncate">{space?.name}</h2>
                  {space?.privacy === 'secret' && (
                    <FontAwesomeIcon icon={faLock} className="text-primary-400 text-xs" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {typingUsers.length > 0 ? (
                    <div className="flex items-center gap-1 text-primary-400">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span>
                        {typingUsers.length === 1
                          ? `${typingUsers[0].user?.display_name} is typing...`
                          : `${typingUsers.length} people are typing...`
                        }
                      </span>
                    </div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{space?.members_count || 0} members</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCircle} className="text-green-400 text-[6px]" />
                        {Array.from(onlineUsers.values()).filter(s => s.status === 'online').length} online
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  showSearch
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-900/30 hover:bg-gray-800/50 text-gray-400'
                }`}
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>

              {/* Voice Call */}
              <button className="w-10 h-10 rounded-xl bg-gray-900/30 hover:bg-gray-800/50 flex items-center justify-center transition-all text-gray-400">
                <FontAwesomeIcon icon={faPhone} />
              </button>

              {/* Video Call */}
              <button className="w-10 h-10 rounded-xl bg-gray-900/30 hover:bg-gray-800/50 flex items-center justify-center transition-all text-gray-400">
                <FontAwesomeIcon icon={faVideo} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-xl bg-gray-900/30 hover:bg-gray-800/50 flex items-center justify-center transition-all text-gray-400"
              >
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>

              {/* Info */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  showInfo
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-900/30 hover:bg-gray-800/50 text-gray-400'
                }`}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full px-4 py-3 pl-11 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500 hover:text-gray-300" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/10 to-cyan-600/10 flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faShieldAlt} className="text-5xl text-primary-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">End-to-End Encrypted</h3>
            <p className="text-gray-400 max-w-md">
              Your messages are protected with military-grade encryption.
              Nobody, not even 4Space, can read them.
            </p>
            <p className="text-sm text-primary-400 mt-4">
              Send your first message to get started
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showAvatar =
                index === 0 ||
                messages[index - 1].sender_id !== message.sender_id ||
                new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000;

              return (
                <MessageComponent
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  showAvatar={showAvatar}
                  onReply={setReplyTo}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReact={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <MessageInputComponent
          onSend={handleSendMessage}
          onTyping={handleTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          loading={sending}
        />
      </div>

      {/* Info Sidebar */}
      {showInfo && (
        <div className="fixed right-0 top-0 bottom-0 w-96 glass border-l border-gray-800/50 p-6 overflow-y-auto animate-slide-in-right z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Space Info</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
            </button>
          </div>

          {/* Space Details */}
          <div className="mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              {space?.avatar_url ? (
                <img
                  src={space.avatar_url}
                  alt={space.name}
                  className="w-24 h-24 rounded-2xl ring-4 ring-primary-500/20 mb-4"
                />
              ) : (
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${space?.color || 'from-primary-500 to-cyan-600'} flex items-center justify-center mb-4`}>
                  <span className="text-white font-bold text-3xl">
                    {space?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{space?.name}</h3>
              {space?.description && (
                <p className="text-sm text-gray-400">{space.description}</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-800/50 transition-all">
                <FontAwesomeIcon icon={faBell} className="text-primary-400" />
                <span className="text-xs">Mute</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-800/50 transition-all">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                <span className="text-xs">Favorite</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-800/50 transition-all">
                <FontAwesomeIcon icon={faArchive} className="text-gray-400" />
                <span className="text-xs">Archive</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-900/30 hover:bg-red-500/10 transition-all">
                <FontAwesomeIcon icon={faTrash} className="text-red-400" />
                <span className="text-xs">Delete</span>
              </button>
            </div>

            {/* Security Info */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <FontAwesomeIcon icon={faShieldAlt} className="text-green-400" />
                <span className="font-semibold text-sm">End-to-End Encrypted</span>
              </div>
              <p className="text-xs text-gray-400">
                Messages are secured with military-grade encryption. Only you and recipients can read them.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
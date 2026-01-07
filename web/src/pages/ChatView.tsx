import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpacesStore } from '../store/spacesStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faSearch, faPaperPlane, faEllipsisV,
  faPhone, faVideo, faMicrophone, faImage, faFile,
  faPaperclip, faSmile, faBolt, faReply, faCopy,
  faTrash, faEdit, faCheck, faCheckDouble, faTimes,
  faCircle, faClock
} from '@fortawesome/free-solid-svg-icons';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  isPinned?: boolean;
}

interface Message {
  id: string;
  space_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  edited_at?: string;
  reply_to?: string;
  sender?: {
    email: string;
    display_name: string;
  };
}

export function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedSpace } = useSpacesStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock conversations - will be dynamic
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'General',
      lastMessage: 'Let\'s sync up tomorrow',
      lastMessageTime: '2m',
      unreadCount: 3,
      isOnline: true,
      isTyping: false,
      isPinned: true,
    },
    {
      id: '2',
      name: 'Design Team',
      lastMessage: 'Updated mockups v3',
      lastMessageTime: '45m',
      unreadCount: 0,
      isOnline: true,
      isTyping: true,
      isPinned: true,
    },
    {
      id: '3',
      name: 'Engineering',
      lastMessage: 'Pushed to staging',
      lastMessageTime: '2h',
      unreadCount: 12,
      isOnline: false,
      isTyping: false,
    },
    {
      id: '4',
      name: 'Random',
      lastMessage: 'Coffee break?',
      lastMessageTime: '5h',
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (id && selectedConversation) {
      fetchMessages();
      const channel = subscribeToMessages();
      return () => { channel.unsubscribe(); };
    }
  }, [id, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(email, display_name)')
        .eq('space_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel(`space-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `space_id=eq.${id}`,
      }, async (payload) => {
        const { data: sender } = await supabase
          .from('profiles')
          .select('email, display_name')
          .eq('id', payload.new.sender_id)
          .single();

        setMessages((prev) => [...prev, { ...payload.new as Message, sender }]);
      })
      .subscribe();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        space_id: id,
        sender_id: user.id,
        content: newMessage.trim(),
        reply_to: replyTo?.id,
      });

      if (error) throw error;
      setNewMessage('');
      setReplyTo(null);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setSelectedMessage(null);
  };

  const getConversationAvatar = (name: string) => {
    const colors = [
      'from-cyan-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600',
      'from-green-500 to-teal-600',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading && selectedConversation) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      {/* Left Sidebar - Conversations */}
      <div className="w-full md:w-96 border-r border-slate-800/50 flex flex-col bg-gradient-to-b from-slate-950 to-black backdrop-blur-xl">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/spaces/${id}`)}
              className="w-10 h-10 rounded-xl bg-slate-900/50 backdrop-blur-xl hover:bg-slate-800/50 flex items-center justify-center transition-all border border-slate-800/50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-cyan-400" />
            </button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Conversations
            </h2>
            <button className="w-10 h-10 rounded-xl bg-slate-900/50 backdrop-blur-xl hover:bg-slate-800/50 flex items-center justify-center transition-all border border-slate-800/50">
              <FontAwesomeIcon icon={faEllipsisV} className="text-slate-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative group">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-all" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900/30 border border-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-900/50 outline-none transition-all backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations
            .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((conv, index) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-slate-900/30 transition-all border-l-2 relative group ${
                selectedConversation === conv.id
                  ? 'bg-slate-900/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'border-transparent'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'slideInLeft 0.3s ease-out forwards'
              }}
            >
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Avatar */}
              <div className="relative flex-shrink-0 z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getConversationAvatar(conv.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {conv.name[0]}
                </div>
                {/* Online Status */}
                {conv.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-black shadow-lg shadow-green-500/50 animate-pulse" />
                )}
                {/* Unread Badge */}
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/50">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0 z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white truncate flex items-center gap-2">
                    {conv.name}
                    {conv.isPinned && (
                      <FontAwesomeIcon icon={faBolt} className="text-cyan-400 text-xs" />
                    )}
                  </h3>
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2 font-medium">
                    {conv.lastMessageTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${
                    conv.isTyping 
                      ? 'text-cyan-400 italic font-medium' 
                      : conv.unreadCount > 0 
                        ? 'text-white font-medium' 
                        : 'text-slate-400'
                  }`}>
                    {conv.isTyping ? (
                      <span className="flex items-center gap-1">
                        <span className="inline-flex gap-0.5">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span className="ml-1">typing</span>
                      </span>
                    ) : (
                      conv.lastMessage
                    )}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions Footer */}
        <div className="p-4 border-t border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button className="flex-1 p-3 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 transition-all border border-slate-800/50 flex items-center justify-center gap-2 group">
              <FontAwesomeIcon icon={faPhone} className="text-slate-400 group-hover:text-cyan-400 transition-all" />
              <span className="text-sm text-slate-400 group-hover:text-cyan-400 transition-all">Call</span>
            </button>
            <button className="flex-1 p-3 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 transition-all border border-slate-800/50 flex items-center justify-center gap-2 group">
              <FontAwesomeIcon icon={faVideo} className="text-slate-400 group-hover:text-cyan-400 transition-all" />
              <span className="text-sm text-slate-400 group-hover:text-cyan-400 transition-all">Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-black relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getConversationAvatar('Team Chat')} flex items-center justify-center text-white font-bold shadow-lg`}>
                    T
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950 shadow-lg shadow-green-500/50" />
                </div>
                <div>
                  <h2 className="font-bold text-white">General</h2>
                  <p className="text-xs text-cyan-400 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCircle} className="text-green-500 animate-pulse" style={{ fontSize: '6px' }} />
                    3 members online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 flex items-center justify-center transition-all border border-slate-800/50 group">
                  <FontAwesomeIcon icon={faPhone} className="text-slate-400 group-hover:text-cyan-400 transition-all" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 flex items-center justify-center transition-all border border-slate-800/50 group">
                  <FontAwesomeIcon icon={faVideo} className="text-slate-400 group-hover:text-cyan-400 transition-all" />
                </button>
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-10 h-10 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 flex items-center justify-center transition-all border border-slate-800/50 group"
                >
                  <FontAwesomeIcon icon={faSearch} className="text-slate-400 group-hover:text-cyan-400 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPaperPlane} className="text-cyan-400 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Start the conversation</h3>
                  <p className="text-slate-400">Send your first message to begin chatting</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.sender_id === user?.id;
                const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
                const showTimestamp = idx === 0 || 
                  new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 300000;

                return (
                  <div key={msg.id}>
                    {/* Timestamp Divider */}
                    {showTimestamp && (
                      <div className="flex items-center justify-center my-8">
                        <div className="px-4 py-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-full text-xs text-slate-400 font-medium shadow-lg">
                          <FontAwesomeIcon icon={faClock} className="mr-2 text-cyan-400" />
                          {new Date(msg.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    )}

                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`flex items-end gap-3 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        {!isOwn && showAvatar && (
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getConversationAvatar(msg.sender?.display_name || 'U')} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg`}>
                            {msg.sender?.display_name?.[0] || 'U'}
                          </div>
                        )}
                        {!isOwn && !showAvatar && <div className="w-9" />}

                        <div className="flex-1">
                          {/* Sender Name */}
                          {!isOwn && showAvatar && (
                            <p className="text-xs text-cyan-400 mb-1.5 ml-3 font-semibold">
                              {msg.sender?.display_name || 'Unknown'}
                            </p>
                          )}

                          {/* Message Bubble */}
                          <div
                            onMouseEnter={() => setSelectedMessage(msg.id)}
                            onMouseLeave={() => setSelectedMessage(null)}
                            className="relative"
                          >
                            <div
                              className={`px-5 py-3.5 rounded-2xl backdrop-blur-xl transition-all ${
                                isOwn
                                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md shadow-xl shadow-cyan-500/20 border border-cyan-500/20'
                                  : 'bg-slate-900/40 border border-slate-800/50 text-white rounded-bl-md shadow-lg'
                              }`}
                            >
                              {/* Reply Preview */}
                              {msg.reply_to && (
                                <div className="mb-3 pb-3 border-b border-white/10">
                                  <div className="flex items-center gap-2 text-xs opacity-70">
                                    <FontAwesomeIcon icon={faReply} />
                                    <span>Replying to message...</span>
                                  </div>
                                </div>
                              )}

                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>

                              {msg.edited_at && (
                                <span className="text-xs opacity-50 italic ml-2">(edited)</span>
                              )}
                            </div>

                            {/* Message Actions - Hover */}
                            {selectedMessage === msg.id && (
                              <div className={`absolute -top-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-xl p-1.5 shadow-2xl z-20 animate-fade-in ${
                                isOwn ? 'right-0' : 'left-0'
                              }`}>
                                <button
                                  onClick={() => setReplyTo(msg)}
                                  className="p-2 hover:bg-cyan-500/20 rounded-lg transition-all group"
                                  title="Reply"
                                >
                                  <FontAwesomeIcon icon={faReply} className="text-slate-400 group-hover:text-cyan-400 text-xs transition-all" />
                                </button>
                                <button
                                  onClick={() => handleCopyMessage(msg.content)}
                                  className="p-2 hover:bg-cyan-500/20 rounded-lg transition-all group"
                                  title="Copy"
                                >
                                  <FontAwesomeIcon icon={faCopy} className="text-slate-400 group-hover:text-cyan-400 text-xs transition-all" />
                                </button>
                                {isOwn && (
                                  <>
                                    <button
                                      onClick={() => setEditingMessage(msg.id)}
                                      className="p-2 hover:bg-cyan-500/20 rounded-lg transition-all group"
                                      title="Edit"
                                    >
                                      <FontAwesomeIcon icon={faEdit} className="text-slate-400 group-hover:text-cyan-400 text-xs transition-all" />
                                    </button>
                                    <button
                                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all group"
                                      title="Delete"
                                    >
                                      <FontAwesomeIcon icon={faTrash} className="text-slate-400 group-hover:text-red-400 text-xs transition-all" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Message Status */}
                          <div className={`flex items-center gap-2 mt-1.5 text-xs text-slate-500 ${isOwn ? 'justify-end' : ''}`}>
                            <span className="font-medium">
                              {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isOwn && (
                              <FontAwesomeIcon icon={faCheckDouble} className="text-cyan-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl p-4 relative z-10">
            {/* Reply Preview */}
            {replyTo && (
              <div className="mb-3 flex items-center justify-between px-4 py-3 bg-slate-900/40 backdrop-blur-xl rounded-xl border border-slate-800/50 shadow-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-1 h-10 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cyan-400 font-semibold mb-1">
                      Replying to {replyTo.sender?.display_name}
                    </p>
                    <p className="text-sm text-slate-300 truncate">{replyTo.content}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-800/50 flex items-center justify-center transition-all"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-slate-400" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-end gap-3">
              {/* Attachment */}
              <button
                type="button"
                className="w-11 h-11 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 flex items-center justify-center transition-all flex-shrink-0 border border-slate-800/50 group"
              >
                <FontAwesomeIcon icon={faPaperclip} className="text-slate-400 group-hover:text-cyan-400 transition-all" />
              </button>

              {/* Input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="w-full px-5 py-3.5 bg-slate-900/30 border border-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-900/50 outline-none transition-all pr-24 backdrop-blur-xl"
                />
                
                {/* Inline Actions */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2 hover:bg-slate-800/50 rounded-lg transition-all group"
                  >
                    <FontAwesomeIcon icon={faSmile} className="text-slate-400 group-hover:text-cyan-400 text-sm transition-all" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-slate-800/50 rounded-lg transition-all group"
                  >
                    <FontAwesomeIcon icon={faMicrophone} className="text-slate-400 group-hover:text-cyan-400 text-sm transition-all" />
                  </button>
                </div>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  newMessage.trim()
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105'
                    : 'bg-slate-900/30 border border-slate-800/50 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FontAwesomeIcon 
                    icon={faPaperPlane} 
                    className={newMessage.trim() ? 'text-white' : 'text-slate-600'} 
                  />
                )}
              </button>
            </form>

            {/* Quick Reactions */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar">
              {['👍', '❤️', '😂', '🔥', '✨', '👀'].map((emoji) => (
                <button
                  key={emoji}
                  className="px-3 py-2 bg-slate-900/30 hover:bg-slate-800/50 rounded-xl transition-all text-base flex-shrink-0 border border-slate-800/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-105"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-black relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          <div className="text-center z-10">
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 flex items-center justify-center shadow-2xl">
              <FontAwesomeIcon icon={faPaperPlane} className="text-cyan-400 text-5xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
              Select a conversation
            </h2>
            <p className="text-slate-400 text-lg">Choose a chat from the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
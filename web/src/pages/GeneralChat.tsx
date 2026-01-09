// web/src/pages/GeneralChat.tsx

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faPlus, faEllipsisV, faPhone, faVideo, faInfoCircle,
  faPaperclip, faMicrophone, faSmile, faPaperPlane, faImage,
  faFile, faMapMarkerAlt, faUserPlus, faArchive, faTrash, faBell,
  faBellSlash, faCheck, faCheckDouble, faReply, faEdit,
  faForward, faCopy, faUsers, faUser, faComment, faStar, faClock,
  faFilter, faSort, faDownload, faChevronLeft, faTimes, faCircle
} from '@fortawesome/free-solid-svg-icons';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/navbar/Navbar';
import { Message as MessageComponent } from '../components/chat/Message';
import { MessageInput as MessageInputComponent } from '../components/chat/MessageInput';

interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  participants?: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isOwn: boolean;
  type: 'text' | 'image' | 'file' | 'voice';
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export function GeneralChat() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      type: 'direct',
      name: 'Sarah Johnson',
      lastMessage: 'Hey! How are you doing?',
      lastMessageTime: '2m',
      unreadCount: 3,
      isOnline: true,
      isPinned: true
    },
    {
      id: '2',
      type: 'group',
      name: 'Project Team',
      lastMessage: 'Alice: Let\'s schedule a meeting',
      lastMessageTime: '15m',
      unreadCount: 12,
      participants: 8,
      isPinned: true
    },
    {
      id: '3',
      type: 'channel',
      name: 'Tech News',
      lastMessage: 'Breaking: New AI breakthrough announced',
      lastMessageTime: '1h',
      unreadCount: 0,
      participants: 1243
    },
    {
      id: '4',
      type: 'direct',
      name: 'Mike Chen',
      lastMessage: 'Thanks for the help!',
      lastMessageTime: '3h',
      unreadCount: 0,
      isOnline: false
    },
  ]);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups' | 'channels'>('all');
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadMessages = (chatId: string) => {
    // Mock messages - in real app, fetch from API
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hey there! How\'s the project going?',
        sender: { id: '2', name: 'Sarah', avatar: undefined },
        timestamp: '10:30 AM',
        isOwn: false,
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        content: 'Going great! Just finished the main features.',
        sender: { id: user?.id || '1', name: 'You', avatar: undefined },
        timestamp: '10:32 AM',
        isOwn: true,
        type: 'text',
        status: 'read'
      },
    ];
    setMessages(mockMessages);
  };

  const filteredChats = chats
    .filter(chat => {
      if (filterType === 'unread' && chat.unreadCount === 0) return false;
      if (filterType === 'groups' && chat.type !== 'group') return false;
      if (filterType === 'channels' && chat.type !== 'channel') return false;
      if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const handleSendMessage = (content: string, type?: string, metadata?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: { id: user?.id || '1', name: 'You' },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: (type as any) || 'text',
      status: 'sending'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const ChatListItem = ({ chat }: { chat: Chat }) => (
    <button
      onClick={() => setSelectedChat(chat)}
      className={`w-full p-4 rounded-xl text-left transition-all relative ${
        selectedChat?.id === chat.id
          ? isDark
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-4 border-cyan-500'
            : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-l-4 border-cyan-500'
          : isDark
            ? 'hover:bg-white/5'
            : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {chat.avatar ? (
            <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full" />
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
              chat.type === 'channel' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
              chat.type === 'group' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
              'bg-gradient-to-br from-green-500 to-teal-600'
            }`}>
              {chat.type === 'channel' ? <FontAwesomeIcon icon={faStar} /> :
               chat.type === 'group' ? <FontAwesomeIcon icon={faUsers} /> :
               chat.name[0]}
            </div>
          )}
          {chat.isOnline && chat.type === 'direct' && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
          )}
          {chat.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span>
            </div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {chat.name}
              </h3>
              {chat.isMuted && (
                <FontAwesomeIcon icon={faBellSlash} className="text-gray-500 text-xs" />
              )}
            </div>
            <span className={`text-xs ${chat.unreadCount > 0 ? 'text-cyan-400 font-semibold' : isDark ? 'text-gray-500' : 'text-slate-500'}`}>
              {chat.lastMessageTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              {chat.lastMessage}
            </p>
            {chat.type !== 'direct' && (
              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                {chat.participants} {chat.type === 'channel' ? 'subscribers' : 'members'}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <Navbar />
      
      <div className="pt-16 h-screen flex">
        {/* Chat List Sidebar */}
        <div className={`${isMobileView && selectedChat ? 'hidden' : 'flex'} flex-col w-full md:w-96 border-r ${
          isDark ? 'border-white/10 bg-black/50' : 'border-slate-200 bg-white'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Messages
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewChat(true)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isDark
                      ? 'glass hover:bg-white/10 border border-white/10'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faPlus} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all ${
                  isDark
                    ? 'glass border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50'
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500'
                }`}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {[
                { id: 'all' as const, label: 'All', icon: faComment },
                { id: 'unread' as const, label: 'Unread', icon: faCircle },
                { id: 'groups' as const, label: 'Groups', icon: faUsers },
                { id: 'channels' as const, label: 'Channels', icon: faStar }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filterType === filter.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : isDark
                        ? 'glass text-gray-400 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FontAwesomeIcon icon={filter.icon} className="text-xs" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredChats.length > 0 ? (
              filteredChats.map(chat => <ChatListItem key={chat.id} chat={chat} />)
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
                  isDark ? 'glass' : 'bg-slate-100'
                }`}>
                  <FontAwesomeIcon icon={faComment} className={`text-3xl ${
                    isDark ? 'text-gray-600' : 'text-slate-400'
                  }`} />
                </div>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  No chats found
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>
                  Start a new conversation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${isMobileView && !selectedChat ? 'hidden' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'border-white/10 glass' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center gap-3">
                  {isMobileView && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                      }`}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className={isDark ? 'text-white' : 'text-slate-900'} />
                    </button>
                  )}
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold ${
                      selectedChat.type === 'channel' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                      selectedChat.type === 'group' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                      'bg-gradient-to-br from-green-500 to-teal-600'
                    }`}>
                      {selectedChat.type === 'channel' ? <FontAwesomeIcon icon={faStar} /> :
                       selectedChat.type === 'group' ? <FontAwesomeIcon icon={faUsers} /> :
                       selectedChat.name[0]}
                    </div>
                    {selectedChat.isOnline && selectedChat.type === 'direct' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>
                  <div>
                    <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedChat.name}
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                      {selectedChat.type === 'direct' 
                        ? selectedChat.isOnline ? 'Online' : 'Offline'
                        : `${selectedChat.participants} ${selectedChat.type === 'channel' ? 'subscribers' : 'members'}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isDark ? 'glass hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                  }`}>
                    <FontAwesomeIcon icon={faPhone} className={isDark ? 'text-white' : 'text-slate-700'} />
                  </button>
                  <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isDark ? 'glass hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                  }`}>
                    <FontAwesomeIcon icon={faVideo} className={isDark ? 'text-white' : 'text-slate-700'} />
                  </button>
                  <button
                    onClick={() => setShowChatInfo(!showChatInfo)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isDark ? 'glass hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className={isDark ? 'text-white' : 'text-slate-700'} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${
                isDark ? 'bg-black/50' : 'bg-slate-50'
              }`}>
                {messages.map((message, index) => (
                  <MessageComponent
                    key={message.id}
                    message={message as any}
                    isOwn={message.isOwn}
                    showAvatar={index === 0 || messages[index - 1].sender.id !== message.sender.id}
                  />
                ))}
              </div>

              {/* Message Input */}
              <MessageInputComponent
                onSend={handleSendMessage}
                placeholder="Type a message..."
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                  isDark ? 'glass' : 'bg-slate-100'
                }`}>
                  <FontAwesomeIcon icon={faComment} className={`text-5xl ${
                    isDark ? 'text-gray-600' : 'text-slate-400'
                  }`} />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Select a chat
                </h2>
                <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Info Sidebar */}
        {showChatInfo && selectedChat && (
          <div className={`w-80 border-l overflow-y-auto custom-scrollbar ${
            isDark ? 'border-white/10 glass' : 'border-slate-200 bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Chat Info
                </h3>
                <button
                  onClick={() => setShowChatInfo(false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faTimes} className={isDark ? 'text-gray-400' : 'text-slate-600'} />
                </button>
              </div>

              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold ${
                  selectedChat.type === 'channel' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                  selectedChat.type === 'group' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                  'bg-gradient-to-br from-green-500 to-teal-600'
                }`}>
                  {selectedChat.type === 'channel' ? <FontAwesomeIcon icon={faStar} /> :
                   selectedChat.type === 'group' ? <FontAwesomeIcon icon={faUsers} /> :
                   selectedChat.name[0]}
                </div>
                <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedChat.name}
                </h4>
                {selectedChat.type !== 'direct' && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    {selectedChat.participants} {selectedChat.type === 'channel' ? 'subscribers' : 'members'}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {[
                  { icon: faBell, label: 'Mute notifications', color: 'from-orange-500 to-red-600' },
                  { icon: faUserPlus, label: 'Add members', color: 'from-blue-500 to-cyan-600' },
                  { icon: faArchive, label: 'Archive chat', color: 'from-purple-500 to-pink-600' },
                  { icon: faTrash, label: 'Delete chat', color: 'from-red-500 to-pink-600', danger: true }
                ].map((action, i) => (
                  <button
                    key={i}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    } ${action.danger ? 'text-red-400' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <FontAwesomeIcon icon={action.icon} className="text-white" />
                    </div>
                    <span className={`font-medium ${
                      action.danger ? 'text-red-400' : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
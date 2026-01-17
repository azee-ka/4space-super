// LeftSidebar Component - Extracted from GeneralChat.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments, faSearch, faHashtag, faUsers, faStar, faBellSlash,
  faChartLine, faBolt, faClock, faStickyNote, faPlus, faTasks,
  faCalendar, faFileLines, faChevronRight, faHistory, faCheck,
  faLightbulb, faTag, faThumbtack, faBrain, faReply, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { formatRelativeTime } from './utils/formatDate';
import { stripHtml } from './utils/validation';

type LeftSidebarTab = 'conversations' | 'metrics' | 'productivity' | 'reminders' | 'notes';
type FilterMode = 'all' | 'unread' | 'favorites' | 'muted';

interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  participants?: Array<{
    user_id: string;
    user?: {
      display_name?: string;
      username?: string;
    };
  }>;
  last_message?: {
    content: string;
  };
  last_message_at?: string;
  updated_at?: string;
  created_at?: string;
  unread_count?: number;
}

interface LeftSidebarProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  activeTab: LeftSidebarTab;
  onTabChange: (tab: LeftSidebarTab) => void;
  isLoading: boolean;
  onlineUsers: Map<string, any>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  favorites: Set<string>;
  muted: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleMute: (id: string) => void;
  user: any;
  typingUsers: Map<string, Set<string>>;
}

export function LeftSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  activeTab,
  onTabChange,
  isLoading,
  onlineUsers,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterChange,
  favorites,
  muted,
  onToggleFavorite,
  onToggleMute,
  user,
  typingUsers,
}: LeftSidebarProps) {
  const [openUtility, setOpenUtility] = useState<Exclude<LeftSidebarTab, 'conversations'> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const utilityTabs: Array<{ id: Exclude<LeftSidebarTab, 'conversations'>; icon: any; label: string; color: string }> = [
    { id: 'metrics', icon: faChartLine, label: 'Metrics', color: 'emerald' },
    { id: 'productivity', icon: faBolt, label: 'Actions', color: 'rose' },
    { id: 'reminders', icon: faClock, label: 'Reminders', color: 'amber' },
    { id: 'notes', icon: faStickyNote, label: 'Notes', color: 'cyan' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenUtility(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUtilityClick = (tabId: Exclude<LeftSidebarTab, 'conversations'>) => {
    setOpenUtility(openUtility === tabId ? null : tabId);
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      if (filterMode === 'unread' && !(conversation.unread_count && conversation.unread_count > 0)) {
        return false;
      }
      if (filterMode === 'favorites' && !favorites.has(conversation.id)) return false;
      if (filterMode === 'muted' && !muted.has(conversation.id)) return false;
      if (!searchQuery.trim()) return true;
      const title = conversation.is_group ? conversation.name : conversation.participants?.find(p => p.user_id !== user?.id)?.user?.display_name || conversation.participants?.find(p => p.user_id !== user?.id)?.user?.username || 'DM';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, filterMode, searchQuery, favorites, muted]);

  return (
    <div className="h-full flex flex-col w-[23vw]" ref={dropdownRef}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FontAwesomeIcon icon={faComments} className="text-cyan-400" />
            Direct Messages
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-3 bg-zinc-800/70 rounded-xl text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-zinc-700/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pb-3">
        <div className="flex gap-1">
          {(['all', 'unread', 'favorites'] as FilterMode[]).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterMode === filter
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'conversations' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {isLoading && (
              <div className="p-4 text-center text-sm text-gray-400">Loading conversations...</div>
            )}
            {!isLoading && filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faComments} className="text-gray-600 text-lg" />
                </div>
                <p className="text-sm text-gray-400">No conversations found</p>
              </div>
            )}
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === selectedConversationId;
              const title = conversation.is_group ? conversation.name : conversation.participants?.find(p => p.user_id !== user?.id)?.user?.display_name || conversation.participants?.find(p => p.user_id !== user?.id)?.user?.username || 'DM';
              const subtitle = conversation.last_message?.content ? stripHtml(conversation.last_message.content) : 'No messages yet';
              const lastTime = formatRelativeTime(conversation.last_message_at || conversation.updated_at || conversation.created_at);
              const unreadCount = conversation.unread_count || 0;
              const primaryParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
              const isOnline = primaryParticipant ? onlineUsers.has(primaryParticipant.user_id) : false;
              const isFavorite = favorites.has(conversation.id);
              const isMuted = muted.has(conversation.id);

              return (
                <motion.button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border-r-4 border-cyan-400 shadow-lg'
                      : 'hover:bg-gradient-to-r hover:from-zinc-800/80 hover:to-zinc-700/40'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {/* Main Avatar */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                      conversation.is_group
                        ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600'
                        : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600'
                    }`}>
                      {conversation.is_group ? (
                        <FontAwesomeIcon icon={faUsers} className="text-xl text-white" />
                      ) : (
                        <span className="text-xl font-black text-white">{(title[0] || 'U').toUpperCase()}</span>
                      )}
                    </div>

                    {/* Online Status */}
                    {isOnline && !conversation.is_group && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 border-3 border-zinc-900 shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      </div>
                    )}

                    {/* Typing Indicator */}
                    {typingUsers.get(conversation.id)?.size > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-zinc-900 shadow-lg flex items-center justify-center">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="absolute -top-1 -right-1 flex gap-1">
                      {isFavorite && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faStar} className="text-zinc-900 text-[8px]" />
                        </div>
                      )}
                      {isMuted && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-zinc-500 to-zinc-600 shadow-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faBellSlash} className="text-zinc-200 text-[8px]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-base font-bold truncate ${
                          isActive ? 'text-cyan-200' : 'text-white'
                        }`}>{title}</p>
                        {typingUsers.get(conversation.id)?.size > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-blue-400 font-medium">
                              {conversation.is_group ? `${Array.from(typingUsers.get(conversation.id) || []).slice(0, 2).join(', ')}${Array.from(typingUsers.get(conversation.id) || []).length > 2 ? '...' : ''} typing` : 'typing'}
                            </span>
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          isActive ? 'text-cyan-300' : 'text-zinc-400'
                        }`}>{lastTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        isActive ? 'text-zinc-300' : 'text-zinc-500'
                      } ${typingUsers.get(conversation.id)?.size > 0 ? 'text-blue-300 font-medium' : ''}`}>
                        {typingUsers.get(conversation.id)?.size > 0 ? 'typing...' : subtitle || ''}
                      </p>
                      <div className="flex items-center gap-2">
                        {false && <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-400 text-xs" />}
                        {unreadCount > 0 && (
                          <div className={`px-2 py-1 ${
                            isActive
                              ? 'bg-cyan-400 text-cyan-900'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          } text-xs font-black rounded-full min-w-[22px] text-center shadow-lg`}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full"></div>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : (
          /* Utility Tabs Content */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {activeTab === 'metrics' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-3">Message Analytics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-zinc-900/50 rounded-xl">
                    <FontAwesomeIcon icon={faHashtag} className="text-purple-400 text-lg mb-2" />
                    <p className="text-2xl font-bold text-white">{filteredConversations.length}</p>
                    <p className="text-xs text-gray-400">Conversations</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-xl">
                    <FontAwesomeIcon icon={faUsers} className="text-emerald-400 text-lg mb-2" />
                    <p className="text-2xl font-bold text-white">{onlineUsers.size}</p>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'productivity' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // TODO: Open new conversation modal
                      console.log('New conversation clicked');
                      setOpenUtility(null);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-yellow-500/20 hover:border-yellow-500/30 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                      <FontAwesomeIcon icon={faPlus} className="text-yellow-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">New Conversation</span>
                      <p className="text-xs text-yellow-300/70">Start a new DM or group</p>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="text-yellow-400/50 text-sm ml-auto group-hover:text-yellow-300 transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      // TODO: Open task creation modal
                      console.log('Create task clicked');
                      setOpenUtility(null);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-blue-500/20 hover:border-blue-500/30 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <FontAwesomeIcon icon={faTasks} className="text-blue-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">Create Task</span>
                      <p className="text-xs text-blue-300/70">Add to your todo list</p>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="text-blue-400/50 text-sm ml-auto group-hover:text-blue-300 transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      // TODO: Open schedule message modal
                      console.log('Schedule message clicked');
                      setOpenUtility(null);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-purple-500/20 hover:border-purple-500/30 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <FontAwesomeIcon icon={faCalendar} className="text-purple-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">Schedule Message</span>
                      <p className="text-xs text-purple-300/70">Send later</p>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="text-purple-400/50 text-sm ml-auto group-hover:text-purple-300 transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      // TODO: Open quick note modal
                      console.log('Quick note clicked');
                      setOpenUtility(null);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-emerald-500/20 hover:border-emerald-500/30 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                      <FontAwesomeIcon icon={faFileLines} className="text-emerald-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">Quick Note</span>
                      <p className="text-xs text-emerald-300/70">Save for later</p>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="text-emerald-400/50 text-sm ml-auto group-hover:text-emerald-300 transition-colors" />
                  </button>
                </div>

                {/* Recent Actions */}
                <div className="pt-4 border-t border-zinc-700/50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent</h4>
                  <div className="space-y-2">
                    <button className="w-full p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg text-left transition-colors flex items-center gap-3">
                      <FontAwesomeIcon icon={faHistory} className="text-gray-500 text-xs" />
                      <span className="text-sm text-gray-400">Scheduled message to John</span>
                      <span className="text-xs text-gray-600 ml-auto">2h ago</span>
                    </button>
                    <button className="w-full p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg text-left transition-colors flex items-center gap-3">
                      <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                      <span className="text-sm text-gray-400">Completed project review</span>
                      <span className="text-xs text-gray-600 ml-auto">1d ago</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Smart Reminders</h3>
                  <button
                    onClick={() => {
                      // TODO: Open add reminder modal
                      console.log('Add reminder clicked');
                      setOpenUtility(null);
                    }}
                    className="w-6 h-6 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-orange-400 text-xs" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 hover:border-orange-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-white font-medium">Follow up with John</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full">2h</span>
                        <FontAwesomeIcon icon={faBell} className="text-orange-400 text-xs" />
                      </div>
                    </div>
                    <p className="text-xs text-orange-200/70 mb-2">About the project proposal</p>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-orange-300 hover:text-orange-200">Snooze</button>
                      <button className="text-xs text-orange-300 hover:text-orange-200">Done</button>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 hover:border-orange-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-white font-medium">Team meeting</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full">Tomorrow</span>
                        <FontAwesomeIcon icon={faCalendar} className="text-orange-400 text-xs" />
                      </div>
                    </div>
                    <p className="text-xs text-orange-200/70 mb-2">Quarterly review discussion</p>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-orange-300 hover:text-orange-200">Reschedule</button>
                      <button className="text-xs text-orange-300 hover:text-orange-200">Join</button>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-white font-medium">Reply to Sarah</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">30m</span>
                        <FontAwesomeIcon icon={faReply} className="text-blue-400 text-xs" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-200/70 mb-2">About the design feedback</p>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-300 hover:text-blue-200">Quick reply</button>
                      <button className="text-xs text-blue-300 hover:text-blue-200">Later</button>
                    </div>
                  </div>
                </div>

                {/* Smart Suggestions */}
                <div className="pt-4 border-t border-zinc-700/50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Smart Suggestions</h4>
                  <div className="space-y-2">
                    <button className="w-full p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg text-left transition-colors flex items-center gap-3">
                      <FontAwesomeIcon icon={faLightbulb} className="text-yellow-400 text-xs" />
                      <span className="text-sm text-gray-400">Remind me about pending tasks</span>
                    </button>
                    <button className="w-full p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg text-left transition-colors flex items-center gap-3">
                      <FontAwesomeIcon icon={faClock} className="text-cyan-400 text-xs" />
                      <span className="text-sm text-gray-400">Set up daily standup reminder</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Smart Notes</h3>
                  <button
                    onClick={() => {
                      // TODO: Open add note modal
                      console.log('Add note clicked');
                      setOpenUtility(null);
                    }}
                    className="w-6 h-6 rounded-lg bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-green-400 text-xs" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 hover:border-green-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-white font-medium">API endpoints</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full">Today</span>
                        <FontAwesomeIcon icon={faTag} className="text-green-400 text-xs" />
                      </div>
                    </div>
                    <p className="text-xs text-green-200/70 mb-2">/api/users, /api/messages, /api/conversations</p>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-green-300 hover:text-green-200">Edit</button>
                      <button className="text-xs text-green-300 hover:text-green-200">Share</button>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 hover:border-green-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-white font-medium">Meeting notes</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full">Yesterday</span>
                        <FontAwesomeIcon icon={faThumbtack} className="text-green-400 text-xs" />
                      </div>
                    </div>
                    <p className="text-xs text-green-200/70 mb-2">Discuss UI improvements and performance</p>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-green-300 hover:text-green-200">Pin</button>
                      <button className="text-xs text-green-300 hover:text-green-200">Copy</button>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-white font-medium">Quick thought</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">2h ago</span>
                        <FontAwesomeIcon icon={faBrain} className="text-blue-400 text-xs" />
                      </div>
                    </div>
                    <p className="text-xs text-blue-200/70 mb-2">Remember to update the project timeline</p>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-300 hover:text-blue-200">Create task</button>
                      <button className="text-xs text-blue-300 hover:text-blue-200">Delete</button>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="pt-4 border-t border-zinc-700/50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-full text-xs text-gray-400 hover:text-white transition-colors">
                      Work
                    </button>
                    <button className="px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-full text-xs text-gray-400 hover:text-white transition-colors">
                      Personal
                    </button>
                    <button className="px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-full text-xs text-gray-400 hover:text-white transition-colors">
                      Ideas
                    </button>
                    <button className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-full text-xs text-emerald-300 hover:text-emerald-200 transition-colors">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Utility Tabs */}
      <div className="border-t border-zinc-800/50 p-2">
        <div className="grid grid-cols-2 gap-1">
          {utilityTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => handleUtilityClick(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                openUtility === tab.id
                  ? `bg-${tab.color}-500/10`
                  : 'hover:bg-zinc-800/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg bg-${tab.color}-500/10 flex items-center justify-center`}>
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`text-xs ${
                    openUtility === tab.id
                      ? `text-${tab.color}-400`
                      : 'text-gray-500'
                  }`}
                />
              </div>
              <span className={`text-[10px] font-medium ${
                openUtility === tab.id
                  ? `text-${tab.color}-400`
                  : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
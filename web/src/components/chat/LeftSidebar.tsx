// LeftSidebar Component - Extracted from GeneralChat.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments, faSearch, faHashtag, faUsers, faStar, faBellSlash,
  faChartLine, faBolt, faClock, faStickyNote, faPlus, faTasks,
  faCalendar, faFileLines, faChevronRight, faHistory, faCheck,
  faLightbulb, faTag, faThumbtack, faBrain, faReply, faUser
} from '@fortawesome/free-solid-svg-icons';
import { formatRelativeTime } from './utils/formatDate';
import { getConversationTitle, getConversationSubtitle } from './utils/chatUtils';

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
      const title = getConversationTitle(conversation, user?.id);
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
              const title = getConversationTitle(conversation, user?.id);
              const subtitle = getConversationSubtitle(conversation, user?.id);
              const lastTime = formatRelativeTime(conversation.last_message_at || conversation.updated_at || conversation.created_at);
              const unreadCount = conversation.unread_count || 0;
              const isFavorite = favorites.has(conversation.id);
              const isMuted = muted.has(conversation.id);

              return (
                <motion.button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-colors ${
                    isActive ? 'border border-cyan-500/30 bg-black/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        conversation.is_group
                          ? 'bg-violet-500/10'
                          : 'bg-emerald-500/10'
                      }`}>
                        <FontAwesomeIcon
                          icon={conversation.is_group ? faUsers : faUser}
                          className={`text-sm ${
                            conversation.is_group ? 'text-violet-400' : 'text-emerald-400'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-medium truncate ${
                            isActive ? 'text-cyan-300' : 'text-white'
                          }`}>{title}</p>
                          {isFavorite && (
                            <FontAwesomeIcon icon={faStar} className="text-amber-400 text-xs" />
                          )}
                          {isMuted && (
                            <FontAwesomeIcon icon={faBellSlash} className="text-zinc-500 text-xs" />
                          )}
                          {typingUsers.get(conversation.id)?.size > 0 && (
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                          )}
                        </div>
                        <p className={`text-xs truncate ${
                          isActive ? 'text-zinc-300' : 'text-zinc-500'
                        } ${typingUsers.get(conversation.id)?.size > 0 ? 'text-blue-300' : ''}`}>
                          {typingUsers.get(conversation.id)?.size > 0 ? 'typing...' : subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${
                        isActive ? 'text-cyan-400' : 'text-zinc-400'
                      }`}>{lastTime}</span>
                      {unreadCount > 0 && (
                        <div className={`px-2 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full min-w-[22px] text-center`}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
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
// LeftSidebar Component - Extracted from GeneralChat.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments, faSearch, faHashtag, faUsers, faStar, faBellSlash,
  faChartLine, faBolt, faClock, faStickyNote, faPlus, faTasks,
  faCalendar, faFileLines, faChevronRight, faHistory, faCheck,
  faLightbulb, faTag, faThumbtack, faBrain, faReply, faUser, faBell, faPen, faTimes,
  faEdit, faTrash, faSave
} from '@fortawesome/free-solid-svg-icons';
import { formatRelativeTime } from './utils/formatDate';
import { getConversationTitle, getConversationSubtitle } from './utils/chatUtils';
import {
  useUserNotes,
  useCreateUserNote,
  useUpdateUserNote,
  useDeleteUserNote,
  useUserReminders,
  useCreateUserReminder,
  useUpdateUserReminder,
  useDeleteUserReminder,
  useUserSavedMessages,
  useSaveMessage,
  useUnsaveMessage,
  useUserKeptMessages,
  useKeepMessage,
  useUnkeepMessage,
} from '../../hooks/useUserContent';
import { useAuthStore } from '../../store/authStore';

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
  const { user: currentUser } = useAuthStore();
  const [openUtility, setOpenUtility] = useState<Exclude<LeftSidebarTab, 'conversations'> | null>(null);
  const [showQuickNoteForm, setShowQuickNoteForm] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderRepeat, setReminderRepeat] = useState('none');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Data hooks
  const { data: userNotes = [] } = useUserNotes();
  const { data: userReminders = [] } = useUserReminders();
  const { data: savedMessages = [] } = useUserSavedMessages();
  const { data: keptMessages = [] } = useUserKeptMessages();

  // Mutation hooks
  const createNote = useCreateUserNote();
  const updateNote = useUpdateUserNote();
  const deleteNote = useDeleteUserNote();
  const createReminder = useCreateUserReminder();
  const updateReminder = useUpdateUserReminder();
  const deleteReminder = useDeleteUserReminder();
  const saveMessage = useSaveMessage();
  const unsaveMessage = useUnsaveMessage();
  const keepMessage = useKeepMessage();
  const unkeepMessage = useUnkeepMessage();

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
    if (openUtility === tabId) {
      setOpenUtility(null);
    } else {
      setOpenUtility(tabId);
      // Close Quick Note form when opening a utility menu
      setShowQuickNoteForm(false);
    }
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
    <div className="h-full flex flex-col w-[23vw] relative" ref={dropdownRef}>
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
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-11 pr-4 py-3 bg-zinc-900/90 backdrop-blur-sm rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 border border-zinc-800/60 focus:border-cyan-500/50 transition-all duration-200 shadow-lg"
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

      {/* Main Content Area - Scrollable with bottom padding for buttons */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32">
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


      {/* Utility Tabs - Absolutely Positioned at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black">
        {/* Quick Action Bar - Fixed Position */}
        <div className="p-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              {
                id: 'new_chat',
                icon: faPlus,
                label: 'New Chat',
                color: 'emerald',
                action: () => {
                  // TODO: Open new chat modal
                  console.log('New chat');
                }
              },
              {
                id: 'quick_note',
                icon: faPen,
                label: 'Quick Note',
                color: 'blue',
                action: () => {
                  setShowQuickNoteForm(!showQuickNoteForm);
                  // Close any open utility menu when toggling Quick Note form
                  if (!showQuickNoteForm) {
                    setOpenUtility(null);
                  }
                }
              },
              {
                id: 'new_task',
                icon: faTasks,
                label: 'New Task',
                color: 'purple',
                action: () => setShowTaskModal(true)
              },
            ].map((action) => (
              <motion.button
                key={action.id}
                onClick={action.action}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-all duration-200"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center`}>
                  <FontAwesomeIcon
                    icon={action.icon}
                    className={`text-sm text-${action.color}-400`}
                  />
                </div>
                <span className="text-sm text-zinc-300 font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Quick Note Inline Form */}
          <AnimatePresence>
            {showQuickNoteForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-zinc-800/50 overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Quick Note</h4>
                    <button
                      onClick={() => setShowQuickNoteForm(false)}
                      className="text-zinc-400 hover:text-zinc-300"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </div>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-24 bg-zinc-800/60 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-xs text-zinc-400 hover:text-zinc-300 transition-colors">
                        <FontAwesomeIcon icon={faTag} className="mr-1" />
                        Tag
                      </button>
                      <button className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-xs text-zinc-400 hover:text-zinc-300 transition-colors">
                        <FontAwesomeIcon icon={faThumbtack} className="mr-1" />
                        Pin
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (noteContent.trim()) {
                          createNote.mutate({
                            title: 'Quick Note',
                            content: noteContent.trim(),
                            tags: [],
                            is_pinned: false,
                          });
                          setNoteContent('');
                          setShowQuickNoteForm(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Utility Content Card - Expanding from top of utility tabs */}
        <AnimatePresence mode="wait">
          {openUtility && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: '0.75rem' }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mx-3 shadow-[0_-2px_8px_rgba(34,211,238,0.1)] overflow-hidden"
            >
              <div className="bg-black max-h-96 overflow-hidden">
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {openUtility === 'metrics' && (
                      <motion.div
                        key="metrics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="p-4 space-y-4"
                      >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white">Conversation Analytics</h3>
                        <button
                          onClick={() => setOpenUtility(null)}
                          className="text-zinc-400 hover:text-zinc-300 p-1"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-zinc-800/50 rounded-xl text-center">
                          <div className="text-xl font-bold text-white mb-1">{conversations.length}</div>
                          <div className="text-xs text-zinc-400">Total Chats</div>
                        </div>
                        <div className="p-3 bg-zinc-800/50 rounded-xl text-center">
                          <div className="text-xl font-bold text-white mb-1">{onlineUsers.size}</div>
                          <div className="text-xs text-zinc-400">Online Now</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-zinc-800/30 rounded-lg">
                          <span className="text-sm text-zinc-300">Most active day</span>
                          <span className="text-xs text-emerald-400 font-medium">Wednesday</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-zinc-800/30 rounded-lg">
                          <span className="text-sm text-zinc-300">Peak hours</span>
                          <span className="text-xs text-emerald-400 font-medium">2-4 PM</span>
                        </div>
                      </div>
                      </motion.div>
                    )}
                    {openUtility === 'productivity' && (
                      <motion.div
                        key="productivity"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="p-4 space-y-3"
                      >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white">Quick Actions</h3>
                        <button
                          onClick={() => setOpenUtility(null)}
                          className="text-zinc-400 hover:text-zinc-300 p-1"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => {
                            // Navigate to spaces page to create new conversation
                            window.location.href = '/spaces';
                            setOpenUtility(null);
                          }}
                          className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl text-left transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faPlus} className="text-yellow-400 text-sm" />
                            <div>
                              <div className="text-sm text-white font-medium">Start New Conversation</div>
                              <div className="text-xs text-zinc-400">Direct message or group chat</div>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            const title = prompt('Task title:');
                            if (title?.trim()) {
                              createReminder.mutate({
                                title: title.trim(),
                                description: '',
                                reminder_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                repeat_type: 'none',
                                is_completed: false,
                              });
                              setOpenUtility(null);
                            }
                          }}
                          className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl text-left transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faTasks} className="text-blue-400 text-sm" />
                            <div>
                              <div className="text-sm text-white font-medium">Create New Task</div>
                              <div className="text-xs text-zinc-400">Add to your todo list</div>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowTaskModal(true);
                            setOpenUtility(null);
                          }}
                          className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl text-left transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faCalendar} className="text-purple-400 text-sm" />
                            <div>
                              <div className="text-sm text-white font-medium">Schedule Message</div>
                              <div className="text-xs text-zinc-400">Send message later</div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Recent Activity */}
                      <div className="pt-4 border-t border-zinc-700/50">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-2 bg-zinc-800/30 rounded-lg">
                            <FontAwesomeIcon icon={faStickyNote} className="text-blue-400 text-xs" />
                            <div className="flex-1">
                              <div className="text-sm text-zinc-300">Created quick note</div>
                              <div className="text-xs text-zinc-500">2 minutes ago</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-zinc-800/30 rounded-lg">
                            <FontAwesomeIcon icon={faTasks} className="text-purple-400 text-xs" />
                            <div className="flex-1">
                              <div className="text-sm text-zinc-300">Added new task</div>
                              <div className="text-xs text-zinc-500">1 hour ago</div>
                            </div>
                          </div>
                        </div>
                        </div>
                      </motion.div>
                    )}
                    {openUtility === 'reminders' && (
                      <motion.div
                        key="reminders"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="p-4 space-y-4"
                      >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Smart Reminders</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowReminderModal(true);
                              setOpenUtility(null);
                            }}
                            className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-xs text-zinc-400 hover:text-zinc-300 transition-colors flex items-center gap-1"
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                            Add
                          </button>
                          <button
                            onClick={() => setOpenUtility(null)}
                            className="text-zinc-400 hover:text-zinc-300 p-1"
                          >
                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {userReminders.length === 0 ? (
                          <div className="text-center py-8">
                            <FontAwesomeIcon icon={faClock} className="text-zinc-600 text-2xl mb-2" />
                            <p className="text-sm text-zinc-400">No reminders yet</p>
                            <p className="text-xs text-zinc-500 mt-1">Create your first reminder above</p>
                          </div>
                        ) : (
                          userReminders
                            .filter(reminder => !reminder.is_completed)
                            .map((reminder) => {
                              const isPast = new Date(reminder.reminder_time) < new Date();
                              const timeUntil = formatRelativeTime(reminder.reminder_time);

                              return (
                                <div key={reminder.id} className={`p-3 bg-zinc-800/50 rounded-xl ${isPast ? 'border border-orange-500/30' : ''}`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className={`text-sm font-medium flex items-center gap-2 ${reminder.is_completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                                        {reminder.title}
                                        {isPast && <FontAwesomeIcon icon={faBell} className="text-xs text-orange-400" />}
                                      </div>
                                      {reminder.description && (
                                        <div className="text-xs text-zinc-400 mt-1">{reminder.description}</div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => {
                                          updateReminder.mutate({
                                            id: reminder.id,
                                            updates: { is_completed: !reminder.is_completed }
                                          });
                                        }}
                                        className={`text-xs p-1 ${reminder.is_completed ? 'text-green-400' : 'text-zinc-400 hover:text-green-400'}`}
                                      >
                                        <FontAwesomeIcon icon={faCheck} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm('Delete this reminder?')) {
                                            deleteReminder.mutate(reminder.id);
                                          }
                                        }}
                                        className="text-xs text-zinc-400 hover:text-red-400 p-1"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      isPast
                                        ? 'bg-orange-500/20 text-orange-300'
                                        : 'bg-zinc-700/50 text-zinc-400'
                                    }`}>
                                      {timeUntil}
                                    </span>
                                    {reminder.repeat_type !== 'none' && (
                                      <span className="text-xs text-zinc-500">{reminder.repeat_type}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                        </div>
                      </motion.div>
                    )}
                    {openUtility === 'notes' && (
                      <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="p-4 space-y-4"
                      >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Quick Notes</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setShowQuickNoteForm(true);
                              setOpenUtility(null);
                            }}
                            className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-xs text-zinc-400 hover:text-zinc-300 transition-colors flex items-center gap-1"
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                            New
                          </button>
                          <button
                            onClick={() => setOpenUtility(null)}
                            className="text-zinc-400 hover:text-zinc-300 p-1"
                          >
                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {userNotes.length === 0 ? (
                          <div className="text-center py-8">
                            <FontAwesomeIcon icon={faStickyNote} className="text-zinc-600 text-2xl mb-2" />
                            <p className="text-sm text-zinc-400">No notes yet</p>
                            <p className="text-xs text-zinc-500 mt-1">Create your first note above</p>
                          </div>
                        ) : (
                          userNotes.map((note) => (
                            <div key={note.id} className="p-3 bg-zinc-800/50 rounded-xl">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="text-sm text-white font-medium flex items-center gap-2">
                                    {note.title || 'Untitled'}
                                    {note.is_pinned && <FontAwesomeIcon icon={faThumbtack} className="text-xs text-yellow-400" />}
                                  </div>
                                  <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{note.content}</div>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={() => {
                                      const newTitle = prompt('Edit title:', note.title || '');
                                      const newContent = prompt('Edit content:', note.content);
                                      if (newTitle !== null && newContent !== null) {
                                        updateNote.mutate({
                                          id: note.id,
                                          updates: {
                                            title: newTitle.trim() || null,
                                            content: newContent.trim(),
                                            updated_at: new Date().toISOString(),
                                          },
                                        });
                                      }
                                    }}
                                    className="text-xs text-zinc-400 hover:text-zinc-300 p-1"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete this note?')) {
                                        deleteNote.mutate(note.id);
                                      }
                                    }}
                                    className="text-xs text-zinc-400 hover:text-red-400 p-1"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                {note.tags && note.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {note.tags.slice(0, 3).map((tag, idx) => (
                                      <span key={idx} className="text-xs bg-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <span className="text-xs text-zinc-500 ml-auto">
                                  {formatRelativeTime(note.updated_at)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Utility Tabs Section - Fixed Position */}
        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {utilityTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleUtilityClick(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                  openUtility === tab.id
                    ? `bg-zinc-800/70`
                    : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    openUtility === tab.id
                      ? `bg-${tab.color}-500/20`
                      : 'bg-zinc-900/50'
                  }`}>
                    <FontAwesomeIcon
                      icon={tab.icon}
                      className={`text-sm ${
                        openUtility === tab.id
                          ? `text-${tab.color}-400`
                          : `text-zinc-400`
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${
                      openUtility === tab.id
                        ? 'text-white'
                        : 'text-zinc-300'
                    }`}>
                      {tab.label}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {tab.id === 'metrics' && `${conversations.length} chats`}
                      {tab.id === 'productivity' && 'Quick actions'}
                      {tab.id === 'reminders' && 'Smart reminders'}
                      {tab.id === 'notes' && 'Quick notes'}
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-xs transition-transform ${
                      openUtility === tab.id
                        ? 'rotate-90 text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-zinc-900 p-6"
            >
              <button
                className="absolute right-6 top-6 w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                onClick={() => setShowTaskModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="text-white" />
              </button>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-2">Create New Task</h3>
                <p className="text-sm text-zinc-400">Add a task to your todo list</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full bg-zinc-800/60 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />

                <textarea
                  placeholder="Task description (optional)"
                  value={reminderDescription}
                  onChange={(e) => setReminderDescription(e.target.value)}
                  className="w-full h-20 bg-zinc-800/60 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Priority</label>
                    <select className="w-full bg-zinc-800/60 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Due Date</label>
                    <input
                      type="datetime-local"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full bg-zinc-800/60 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (reminderTitle.trim()) {
                        createReminder.mutate({
                          title: reminderTitle.trim(),
                          description: reminderDescription.trim(),
                          reminder_time: reminderTime ? new Date(reminderTime).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                          repeat_type: 'none',
                          is_completed: false,
                        });
                        setReminderTitle('');
                        setReminderDescription('');
                        setReminderTime('');
                        setShowTaskModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowReminderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-zinc-900 p-6"
            >
              <button
                className="absolute right-6 top-6 w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                onClick={() => setShowReminderModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="text-white" />
              </button>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-2">Set Reminder</h3>
                <p className="text-sm text-zinc-400">Create a reminder for important tasks</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="What should I remind you about?"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full bg-zinc-800/60 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">When</label>
                    <select
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full bg-zinc-800/60 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    >
                      <option value="">Custom time</option>
                      <option value="5min">In 5 minutes</option>
                      <option value="15min">In 15 minutes</option>
                      <option value="1hour">In 1 hour</option>
                      <option value="tomorrow">Tomorrow</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Repeat</label>
                    <select
                      value={reminderRepeat}
                      onChange={(e) => setReminderRepeat(e.target.value)}
                      className="w-full bg-zinc-800/60 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    >
                      <option value="none">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {reminderTime === '' && (
                  <input
                    type="datetime-local"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-zinc-800/60 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowReminderModal(false)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (reminderTitle.trim()) {
                        let reminderDate = new Date();

                        if (reminderTime === '5min') reminderDate.setMinutes(reminderDate.getMinutes() + 5);
                        else if (reminderTime === '15min') reminderDate.setMinutes(reminderDate.getMinutes() + 15);
                        else if (reminderTime === '1hour') reminderDate.setHours(reminderDate.getHours() + 1);
                        else if (reminderTime === 'tomorrow') reminderDate.setDate(reminderDate.getDate() + 1);
                        else if (reminderTime) reminderDate = new Date(reminderTime);

                        createReminder.mutate({
                          title: reminderTitle.trim(),
                          description: '',
                          reminder_time: reminderDate.toISOString(),
                          repeat_type: reminderRepeat as any,
                          is_completed: false,
                        });
                        setReminderTitle('');
                        setReminderTime('');
                        setReminderRepeat('none');
                        setShowReminderModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Set Reminder
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
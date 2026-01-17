// Modern DM Chat Interface - Clean Card Style
// web/src/pages/GeneralChat.tsx

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHashtag, faRocket,
  faCog, faChartLine, faTasks, faClock, faStickyNote, faPalette,
  faSlidersH, faImages, faLink,
  faBolt, faCalendar, faFire, faBrain, faPhone, faVideo,
  faUsers, faThumbtack, faSearch,
  faFilter, faTimes, faExclamationTriangle, faEdit, faTrash, faPlus,
  faImage, faPoll, faRobot, faKey, faLock, faMicrophone, faUserCheck,
  faComments, faEnvelope,
  faShieldHalved, faMagnifyingGlass, faUser, faStar, faBell, faBellSlash,
  faCheckCircle, faEye, faEyeSlash, faFileLines, faInfoCircle, faVolumeUp,
  faFingerprint, faDownload, faUserPlus, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageInput } from '../components/spaces/chat/centerPanel/MessageInput';
import { MessagesList } from '../components/spaces/chat/centerPanel/MessagesList';
import { CustomizationTab } from '../components/spaces/chat/rightPanel/CustomizationTab';
import { PinnedBanner } from '../components/spaces/chat/centerPanel/PinnedBanner';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { supabase } from '../lib/supabase';
import { useRealtimeConversation } from '../hooks/useRealtime';
import {
  useAddConversationReaction,
  useConversations,
  useConversationMessages,
  useCreateDirectConversation,
  useCreateGroupConversation,
  useDeleteConversationMessage,
  useMarkConversationAsRead,
  usePinnedConversationMessages,
  usePinConversationMessage,
  useRemoveConversationReaction,
  useSearchUsers,
  useSendConversationMessage,
  useUpdateConversationMessage,
} from '../hooks/useConversations';
import { useAuthStore } from '../store/authStore';
import { useChatSettingsStore } from '../store/chatSettingsStore';
import { useChatSettingsSync } from '../hooks/useChatSettingsSync';
import { getBackgroundStyle } from '../utils/themeUtils';
import { useBackgroundSizing, useShouldUseMirroredBackground } from '../hooks/useWindowSize';
import type { Conversation, SearchUserResult } from '@4space/shared/src/services/conversations.service';
import type { Message } from '@4space/shared/src/services/messages.service';
import type { ChatTheme } from '../store/chatSettingsStore';

// ====================================
// TYPES & INTERFACES - Space Chat Replica
// ====================================

type LeftSidebarTab = 'conversations' | 'metrics' | 'productivity' | 'reminders' | 'notes';
type RightSidebarTab = 'settings' | 'metrics' | 'media' | 'links' | 'customization';
type FilterMode = 'all' | 'unread' | 'favorites' | 'muted';


// ====================================
// UTILITY FUNCTIONS
// ====================================

const formatRelativeTime = (timestamp?: string | null) => {
  if (!timestamp) return '';
  const time = new Date(timestamp).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();
const linkRegex = /(https?:\/\/[^\s)]+)/gi;

const buildLinkItems = (messages: Message[]) => {
  const items: any[] = [];
  messages.forEach((message) => {
    const content = message.content || '';
    const matches = content.match(linkRegex) || [];
    matches.forEach((url) => {
      items.push({
        url,
        messageId: message.id,
        senderName: message.sender?.display_name || message.sender?.username || 'Unknown',
        createdAt: message.created_at,
      });
    });
  });
  return items;
};

const buildFileItems = (messages: Message[]) => {
  return messages
    .filter((message) => message.message_type === 'file' || message.attachments?.length)
    .map((message) => {
      const metadata = message.metadata || {};
      const attachment = message.attachments?.[0];
      return {
        id: message.id,
        name: metadata.fileName || attachment?.name || 'File',
        size: metadata.fileSize || attachment?.size || undefined,
        url: metadata.url || attachment?.url || undefined,
        senderName: message.sender?.display_name || message.sender?.username || 'Unknown',
        createdAt: message.created_at,
      };
    });
};

const isSingleEmoji = (text: string): boolean => {
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
  return emojiRegex.test(text.trim());
};

// ====================================
// MAIN COMPONENT
// ====================================

// ====================================
// LEFT SIDEBAR COMPONENT - Space Chat Replica
// ====================================

function LeftSidebar({
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
}: {
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
}) {
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
    <div className="h-full flex flex-col" ref={dropdownRef}>
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
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-4 border-cyan-400 shadow-lg'
                      : 'hover:bg-gradient-to-r hover:from-zinc-800 hover:to-zinc-700/50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                      conversation.is_group
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      {conversation.is_group ? (
                        <FontAwesomeIcon icon={faUsers} className="text-lg" />
                      ) : (
                        <span className="text-lg font-extrabold">{(title[0] || 'U').toUpperCase()}</span>
                      )}
                    </div>
                    {isOnline && !conversation.is_group && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-900 shadow-sm animate-pulse" />
                    )}
                    {isFavorite && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-amber-400 shadow-lg">
                        <FontAwesomeIcon icon={faStar} className="text-zinc-900 text-[10px]" />
                      </span>
                    )}
                    {isMuted && (
                      <span className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-600 shadow-lg">
                        <FontAwesomeIcon icon={faBellSlash} className="text-zinc-300 text-[10px]" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold truncate ${
                        isActive ? 'text-cyan-200' : 'text-white'
                      }`}>{title}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${
                          isActive ? 'text-cyan-300' : 'text-zinc-400'
                        }`}>{lastTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${
                        isActive ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>{subtitle}</p>
                      {unreadCount > 0 && (
                        <span className={`ml-2 px-2 py-1 ${
                          isActive
                            ? 'bg-cyan-400 text-cyan-900'
                            : 'bg-cyan-500 text-white'
                        } text-xs font-bold rounded-full min-w-[20px] text-center shadow-md`}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
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
                  <button className="w-full p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-yellow-500/20 hover:border-yellow-500/30">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faPlus} className="text-yellow-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">New Conversation</span>
                      <p className="text-xs text-yellow-300/70">Start a new DM or group</p>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-blue-500/20 hover:border-blue-500/30">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faTasks} className="text-blue-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">Create Task</span>
                      <p className="text-xs text-blue-300/70">Add to your todo list</p>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-purple-500/20 hover:border-purple-500/30">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faCalendar} className="text-purple-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">Schedule Message</span>
                      <p className="text-xs text-purple-300/70">Send later</p>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 rounded-xl text-left transition-all flex items-center gap-3 border border-emerald-500/20 hover:border-emerald-500/30">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileLines} className="text-emerald-400 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium">Quick Note</span>
                      <p className="text-xs text-emerald-300/70">Save for later</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Reminders</h3>
                  <button className="w-6 h-6 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 flex items-center justify-center transition-colors">
                    <FontAwesomeIcon icon={faPlus} className="text-orange-400 text-xs" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">Follow up with John</span>
                      <span className="text-xs text-orange-300">2h</span>
                    </div>
                    <p className="text-xs text-orange-200/70">About the project proposal</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">Team meeting</span>
                      <span className="text-xs text-orange-300">Tomorrow</span>
                    </div>
                    <p className="text-xs text-orange-200/70">Quarterly review discussion</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Quick Notes</h3>
                  <button className="w-6 h-6 rounded-lg bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors">
                    <FontAwesomeIcon icon={faPlus} className="text-green-400 text-xs" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">API endpoints</span>
                      <span className="text-xs text-green-300">Today</span>
                    </div>
                    <p className="text-xs text-green-200/70">/api/users, /api/messages, /api/conversations</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">Meeting notes</span>
                      <span className="text-xs text-green-300">Yesterday</span>
                    </div>
                    <p className="text-xs text-green-200/70">Discuss UI improvements and performance</p>
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

// ====================================
// RIGHT SIDEBAR COMPONENT - Space Chat Replica
// ====================================

function RightSidebar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  messages,
  selectedConversation,
  onlineUsers,
  mediaItems,
  linkItems,
}: {
  activeTab: RightSidebarTab;
  onTabChange: (tab: RightSidebarTab) => void;
  theme: ChatTheme;
  onThemeChange: (theme: ChatTheme, roomId?: string, category?: string) => void;
  messages: Message[];
  selectedConversation?: Conversation;
  onlineUsers: Map<string, any>;
  mediaItems: any[];
  linkItems: any[];
}) {
  const tabs: Array<{ id: RightSidebarTab; icon: any; label: string; color: string }> = [
    { id: 'metrics', icon: faChartLine, label: 'Metrics', color: 'emerald' },
    { id: 'media', icon: faImages, label: 'Media', color: 'violet' },
    { id: 'links', icon: faLink, label: 'Links', color: 'rose' },
    { id: 'customization', icon: faPalette, label: 'Theme', color: 'amber' },
    { id: 'settings', icon: faSlidersH, label: 'Settings', color: 'cyan' },
  ];

  return (
    <div className="h-full flex flex-col w-80">
      {/* Horizontal Tabs - Fixed Overflow */}
      <div className="flex-shrink-0 pb-0 pt-0 pl-4 pr-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pl-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500/10 text-${tab.color}-400`
                  : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg bg-${tab.color}-500/10 flex items-center justify-center`}>
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`text-xs ${
                    activeTab === tab.id
                      ? `text-${tab.color}-400`
                      : 'text-gray-500'
                  }`}
                />
              </div>
              <span className="whitespace-nowrap text-xs">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {activeTab === 'settings' && (
            <div className="p-4 space-y-4">
              {/* Appearance */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPalette} className="text-rose-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Appearance</h3>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faEye, label: 'Show avatars', sublabel: 'Display profile pictures', enabled: true, color: 'green' },
                    { icon: faClock, label: 'Show timestamps', sublabel: 'Display message times', enabled: true, color: 'blue' },
                    { icon: faUser, label: 'Show usernames', sublabel: 'Display sender names', enabled: true, color: 'purple' },
                    { icon: faHashtag, label: 'Show message status', sublabel: 'Sent/read indicators', enabled: true, color: 'cyan' },
                    { icon: faCheckCircle, label: 'Read receipts', sublabel: 'Show when messages are read', enabled: true, color: 'emerald' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                        <div>
                          <p className="text-sm text-white font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.sublabel}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={item.enabled}
                        onToggle={() => {}}
                        size="sm"
                        accentColor={theme.accentColor}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBell} className="text-orange-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Notifications</h3>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faBell, label: 'Push notifications', sublabel: 'Browser notifications', enabled: true, color: 'orange' },
                    { icon: faVolumeUp, label: 'Sound alerts', sublabel: 'Audio notifications', enabled: true, color: 'red' },
                    { icon: faExclamationTriangle, label: 'Mention alerts', sublabel: '@ mentions highlight', enabled: true, color: 'yellow' },
                    { icon: faMicrophone, label: 'Typing indicators', sublabel: 'Show typing status', enabled: true, color: 'pink' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                        <div>
                          <p className="text-sm text-white font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.sublabel}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={item.enabled}
                        onToggle={() => {}}
                        size="sm"
                        accentColor={theme.accentColor}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy & Security */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-red-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Privacy & Security</h3>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faShieldHalved, label: 'Self-destruct messages', sublabel: 'Auto-delete after time', enabled: false, color: 'red' },
                    { icon: faEyeSlash, label: 'Screenshot blocking', sublabel: 'Prevent screenshots', enabled: false, color: 'orange' },
                    { icon: faLock, label: 'End-to-end encryption', sublabel: 'Secure messaging', enabled: true, color: 'green' },
                    { icon: faFingerprint, label: 'Biometric unlock', sublabel: 'Fingerprint/Face ID', enabled: false, color: 'blue' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                        <div>
                          <p className="text-sm text-white font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.sublabel}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={item.enabled}
                        onToggle={() => {}}
                        size="sm"
                        accentColor={theme.accentColor}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBolt} className="text-cyan-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Performance</h3>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faRocket, label: 'Smooth animations', sublabel: 'Enhanced visual effects', enabled: true, color: 'cyan' },
                    { icon: faImages, label: 'Auto-load media', sublabel: 'Load images/videos', enabled: true, color: 'blue' },
                    { icon: faDownload, label: 'Auto-save files', sublabel: 'Download attachments', enabled: false, color: 'purple' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                        <div>
                          <p className="text-sm text-white font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.sublabel}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={item.enabled}
                        onToggle={() => {}}
                        size="sm"
                        accentColor={theme.accentColor}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faSlidersH} className="text-purple-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Advanced</h3>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faRobot, label: 'AI suggestions', sublabel: 'Smart reply suggestions', enabled: true, color: 'purple' },
                    { icon: faBrain, label: 'Smart replies', sublabel: 'Context-aware responses', enabled: false, color: 'indigo' },
                    { icon: faCalendar, label: 'Message scheduling', sublabel: 'Send messages later', enabled: true, color: 'emerald' },
                    { icon: faFire, label: 'Priority messages', sublabel: 'Highlight important messages', enabled: true, color: 'orange' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                        <div>
                          <p className="text-sm text-white font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.sublabel}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={item.enabled}
                        onToggle={() => {}}
                        size="sm"
                        accentColor={theme.accentColor}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-bold text-white mb-3">Conversation Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faHashtag} className="text-orange-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{messages.length}</p>
                  <p className="text-xs text-gray-500">Messages</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faUsers} className="text-blue-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedConversation?.participants?.length || 0}</p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faImages} className="text-green-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{mediaItems.length}</p>
                  <p className="text-xs text-gray-500">Media</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faLink} className="text-purple-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{linkItems.length}</p>
                  <p className="text-xs text-gray-500">Links</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                    <span className="text-sm text-gray-300">Last message</span>
                    <span className="text-xs text-gray-500">
                      {selectedConversation?.last_message_at ? formatRelativeTime(selectedConversation.last_message_at) : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
                    <span className="text-sm text-gray-300">Created</span>
                    <span className="text-xs text-gray-500">
                      {selectedConversation?.created_at ? formatRelativeTime(selectedConversation.created_at) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-bold text-white mb-3">Shared Media</h3>
              {mediaItems.length > 0 ? (
                <div className="space-y-3">
                  {mediaItems.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                        <FontAwesomeIcon icon={faImages} className="text-green-400 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">Media file {index + 1}</p>
                        <p className="text-xs text-gray-500">Image • 2.3 MB</p>
                      </div>
                      <FontAwesomeIcon icon={faDownload} className="text-gray-500 text-sm cursor-pointer hover:text-white" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faImages} className="text-gray-600 text-2xl mb-2" />
                  <p className="text-sm text-gray-400">No media shared yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-bold text-white mb-3">Shared Links</h3>
              {linkItems.length > 0 ? (
                <div className="space-y-3">
                  {linkItems.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                        <FontAwesomeIcon icon={faLink} className="text-blue-400 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">example.com/link-{index + 1}</p>
                        <p className="text-xs text-gray-500">Shared by You • 2 hours ago</p>
                      </div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="text-gray-500 text-sm cursor-pointer hover:text-white" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faLink} className="text-gray-600 text-2xl mb-2" />
                  <p className="text-sm text-gray-400">No links shared yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customization' && (
            <CustomizationTab theme={theme} onThemeChange={onThemeChange} />
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================
// MAIN COMPONENT - Space Chat Replica for DMs
// ====================================

export function GeneralChat() {
  useChatSettingsSync();

  const { user } = useAuthStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('conversations');
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('metrics');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatMode, setNewChatMode] = useState<'direct' | 'group'>('direct');
  const [newChatQuery, setNewChatQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SearchUserResult[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeCollection, setActiveCollection] = useState('Quick Notes');
  const [isMobile, setIsMobile] = useState(false);
  const [showThread, setShowThread] = useState(false);

  const {
    showTimestamps,
    showReadReceipts,
    showAvatars,
    showUsernames,
    showMessageStatus,
    showTypingIndicator,
    showOnlineStatus,
    screenSecurity,
    messageDensity,
    fontSize,
    theme,
    messageAnimations,
    autoScrollToBottom,
    reduceAnimations,
    groupMessages,
    setTheme,
    updateSettings,
  } = useChatSettingsStore();

  const getSettingsForRoom = useChatSettingsStore((state) => state.getSettingsForRoom);

  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { data: messagesData, isLoading: loadingMessages, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationMessages(selectedConversationId || undefined);
  const { data: pinnedMessages = [] } = usePinnedConversationMessages(selectedConversationId || undefined);

  const { data: searchResults = [] } = useSearchUsers(newChatQuery.trim());

  const createDirectConversation = useCreateDirectConversation();
  const createGroupConversation = useCreateGroupConversation();
  const sendMessage = useSendConversationMessage();
  const updateMessage = useUpdateConversationMessage();
  const deleteMessage = useDeleteConversationMessage();
  const pinConversationMessage = usePinConversationMessage();
  const addReaction = useAddConversationReaction();
  const removeReaction = useRemoveConversationReaction();
  const markConversationAsRead = useMarkConversationAsRead();

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const vaultConversation = useMemo(() => {
    return conversations.find((conversation) =>
      conversation.is_group &&
      conversation.name?.toLowerCase() === 'vault' &&
      (conversation.participants?.length || 0) <= 2
    );
  }, [conversations]);

  const messages = useMemo(() => messagesData?.pages.slice().reverse().flat() || [], [messagesData]);

  const normalizedMessages: Message[] = useMemo(() => {
    return messages.map((message: any) => ({
      ...message,
      room_id: message.conversation_id,
      space_id: message.conversation_id,
      is_pinned: message.is_pinned ?? false,
      is_system: message.is_system ?? false,
      updated_at: message.updated_at || message.created_at,
    })) as Message[];
  }, [messages]);

  const linkItems = useMemo(() => buildLinkItems(normalizedMessages), [normalizedMessages]);
  const fileItems = useMemo(() => buildFileItems(normalizedMessages), [normalizedMessages]);
  const mediaItems = useMemo(() => {
    return normalizedMessages
      .filter((message) => message.message_type === 'image' && message.metadata?.url)
      .slice(-12)
      .reverse();
  }, [normalizedMessages]);

  const overviewMetrics = useMemo(() => {
    return {
      messages: normalizedMessages.length,
      media: mediaItems.length,
      links: linkItems.length,
      files: fileItems.length,
      lastActive: selectedConversation?.last_message_at || selectedConversation?.updated_at || selectedConversation?.created_at,
    };
  }, [normalizedMessages.length, mediaItems.length, linkItems.length, fileItems.length, selectedConversation]);

  const { typingUsers, onlineUsers, sendTypingIndicator, stopTyping } = useRealtimeConversation(
    supabase as any,
    selectedConversationId || undefined,
    user?.id,
    !!selectedConversationId
  );

  const handleToggleFavorite = (conversationId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleToggleMute = (conversationId: string) => {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleSendMessage = useCallback(
    (content: string, type: string = 'text', attachments: any[] = []) => {
      if (!selectedConversationId) return;
      const trimmed = content.trim();
      if (!trimmed && attachments.length === 0) return;

      if (editingMessage) {
        updateMessage.mutate(
          { messageId: editingMessage.id, content: trimmed },
          { onSuccess: () => setEditingMessage(null) }
        );
        return;
      }

      const metadata: any = {
        ...(vaultConversation?.id === selectedConversationId ? { collection: activeCollection } : {}),
      };

      if (isSingleEmoji(trimmed)) {
        metadata.isSingleEmoji = true;
      }

      sendMessage.mutate(
        {
          conversation_id: selectedConversationId,
          content: trimmed,
          message_type: type,
          reply_to_id: replyTo?.id || null,
          attachments,
          metadata,
        },
        {
          onSuccess: () => setReplyTo(null),
        }
      );
    },
    [selectedConversationId, editingMessage, replyTo, vaultConversation, activeCollection]
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowThread(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const lastMessage = normalizedMessages[normalizedMessages.length - 1];
    if (!lastMessage || lastMessage.sender_id !== user?.id) {
      markConversationAsRead.mutate(selectedConversationId);
    }
  }, [normalizedMessages, selectedConversationId]);


  const shouldUseMirror = useShouldUseMirroredBackground();
  const { tileCount, imageHeight } = useBackgroundSizing();


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowThread(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);


  const conversationAppearance = getSettingsForRoom(selectedConversationId || undefined);
  const activeTheme: ChatTheme = conversationAppearance.theme || theme;
  const centerPanelBackgroundStyle = getBackgroundStyle(activeTheme);

  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter((conversation) => {
      if (filterMode === 'unread' && !(conversation.unread_count && conversation.unread_count > 0)) {
        return false;
      }
      if (filterMode === 'favorites' && !favorites.has(conversation.id)) return false;
      if (filterMode === 'muted' && !muted.has(conversation.id)) return false;
      if (!searchQuery.trim()) return true;
      const title = getConversationTitle(conversation, user?.id);
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      if (favorites.has(a.id) && !favorites.has(b.id)) return -1;
      if (!favorites.has(a.id) && favorites.has(b.id)) return 1;
      const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime();
      return bTime - aTime;
    });
  }, [conversations, filterMode, searchQuery, user?.id, favorites]);

  const handleOpenConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      if (isMobile) {
        setShowThread(true);
      }
    },
    [isMobile]
  );

  const handleOpenVault = async () => {
    if (vaultConversation) {
      handleOpenConversation(vaultConversation.id);
      return;
    }

    try {
      const conversation = await createGroupConversation.mutateAsync({
        name: 'Vault',
        participant_ids: [],
      });
      handleOpenConversation(conversation.id);
    } catch (error) {
      console.error('Failed to create vault:', error);
    }
  };


  const handleDeleteMessage = useCallback(
    (messageId: string, deleteForEveryone: boolean = false) => {
      if (!confirm(deleteForEveryone ? 'Delete this message for everyone?' : 'Delete this message?')) return;
      deleteMessage.mutate(messageId);
    },
    []
  );

  const handlePinMessage = useCallback(
    (messageId: string, options: { pin: boolean; pinnedUntil?: string | null; keep?: boolean }) => {
      pinConversationMessage.mutate({
        messageId,
        pin: options.pin,
        pinnedUntil: options.pinnedUntil,
        keep: options.keep,
      });
    },
    []
  );

  const handleReaction = useCallback(
    (messageId: string, reaction: string) => {
      addReaction.mutate({ messageId, reaction });
    },
    []
  );

  const handleRemoveReaction = useCallback(
    (messageId: string, reaction: string) => {
      removeReaction.mutate({ messageId, reaction });
    },
    []
  );

  const handleCloseNewChat = () => {
    setShowNewChat(false);
    setNewChatQuery('');
    setGroupName('');
    setSelectedUsers([]);
    setNewChatMode('direct');
  };

  const handleSelectUser = async (userResult: SearchUserResult) => {
    if (newChatMode === 'direct') {
      try {
        const conversation = await createDirectConversation.mutateAsync(userResult.id);
        handleOpenConversation(conversation.id);
        handleCloseNewChat();
      } catch (error) {
        console.error('Failed to start direct conversation:', error);
      }
      return;
    }

    setSelectedUsers((prev) => {
      const exists = prev.some((entry) => entry.id === userResult.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== userResult.id);
      }
      return [...prev, userResult];
    });
  };

  const handleCreateGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName || selectedUsers.length === 0) return;

    try {
      const conversation = await createGroupConversation.mutateAsync({
        name: trimmedName,
        participant_ids: selectedUsers.map((participant) => participant.id),
      });
      handleOpenConversation(conversation.id);
      handleCloseNewChat();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };


  const selectedParticipant = selectedConversation
    ? getPrimaryParticipant(selectedConversation, user?.id)
    : null;
  const isParticipantOnline = selectedParticipant
    ? onlineUsers.has(selectedParticipant.user_id)
    : false;

  // ====================================
  // RENDER: Space Chat Replica Layout
  // ====================================

  return (
    <div className="h-screen flex bg-black">
      {/* LEFT SIDEBAR - Space Chat Replica */}
      <LeftSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId || undefined}
        onSelectConversation={setSelectedConversationId}
        activeTab={leftSidebarTab}
        onTabChange={setLeftSidebarTab}
        isLoading={loadingConversations}
        onlineUsers={onlineUsers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        favorites={favorites}
        muted={muted}
        onToggleFavorite={handleToggleFavorite}
        onToggleMute={handleToggleMute}
        user={user}
      />

      {/* CENTER PANEL - Messages */}
      {selectedConversationId && (
        <div className="flex-1 flex flex-col" style={centerPanelBackgroundStyle}>
          {/* Background Tiles */}
          {activeTheme.backgroundType === 'featured' && activeTheme.backgroundImage && (
            <div className="absolute inset-0 pointer-events-none -z-10 flex flex-nowrap overflow-hidden">
              {[...Array(shouldUseMirror ? tileCount * 2 : tileCount)].map((_, i) => {
                const useMirrorImage = shouldUseMirror && i % 2 === 1;
                const imageSrc = useMirrorImage
                  ? activeTheme.backgroundImage?.replace('/src/assets/chat_themes_3/', '/src/assets/chat_themes_3_mirror/')
                  : activeTheme.backgroundImage;

                return (
                  <img
                    key={i}
                    src={imageSrc}
                    alt=""
                    className="flex-shrink-0"
                    style={{
                      height: imageHeight,
                      width: 'auto',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              {selectedConversation && (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-white">
                    {selectedConversation.is_group ? (
                      <FontAwesomeIcon icon={faUsers} />
                    ) : (
                      ((selectedConversation ? getConversationTitle(selectedConversation, user?.id) : 'U')[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {getConversationTitle(selectedConversation, user?.id)}
                    </p>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      {selectedConversation.is_group
                        ? `${selectedConversation.participants?.length || 0} members`
                        : isParticipantOnline
                          ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Online
                            </>
                          )
                          : 'Offline'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faPhone} className="text-emerald-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faVideo} className="text-violet-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faSlidersH} className="text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Pinned Banner */}
          {pinnedMessages.length > 0 && (
            <PinnedBanner
              pinnedMessages={pinnedMessages.map((message: any) => ({
                ...message,
                room_id: message.conversation_id,
                space_id: message.conversation_id,
                is_pinned: message.is_pinned ?? false,
                is_system: message.is_system ?? false,
                updated_at: message.updated_at || message.created_at,
              })) as Message[]}
              onScrollToMessage={(messageId: string) => console.log('Scroll to:', messageId)}
            />
          )}

          {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessagesList
                  messages={normalizedMessages}
                  currentUserId={user?.id}
                  onLoadMore={fetchNextPage}
                  hasMore={hasNextPage}
                  isLoading={loadingMessages}
                  isFetchingMore={isFetchingNextPage}
                  onReply={setReplyTo}
                  onEdit={setEditingMessage}
                  onDelete={handleDeleteMessage}
                  onPin={handlePinMessage}
              onBookmark={(messageId) => console.log('Bookmark:', messageId)}
                  onReaction={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                  theme={conversationAppearance.theme || theme}
                  fontSize={conversationAppearance.fontSize || fontSize}
                  messageDensity={conversationAppearance.messageDensity || messageDensity}
                  typingUsers={typingUsers}
                  showAvatars={showAvatars}
                  showUsernames={showUsernames}
                  showTimestamps={showTimestamps}
                  showReadReceipts={showReadReceipts}
                  showMessageStatus={showMessageStatus}
                  enableMessageReactions
                  enableMessageReplies
                  enableMessageForwarding
                  allowMessageEditing
                  allowMessageDeletion
                  allowMessagePinning
                  groupMessages={groupMessages}
                  autoScrollToBottom={autoScrollToBottom}
                  messageAnimations={messageAnimations}
                  reduceAnimations={reduceAnimations}
                />
              </div>

              {/* Message Input */}
          <div className="px-6 py-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/50">
                <MessageInput
                  onSend={handleSendMessage}
                  onTyping={() => {
                    if (showTypingIndicator) {
                      sendTypingIndicator();
                    }
                  }}
                  onStopTyping={() => {
                    if (showTypingIndicator) {
                      stopTyping();
                    }
                  }}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  editingMessage={editingMessage}
                  onCancelEdit={() => setEditingMessage(null)}
              placeholder={`Message ${selectedConversation ? getConversationTitle(selectedConversation, user?.id) : 'conversation'}...`}
                  allowFileUploads
                />
              </div>
        </div>
      )}

      {/* RIGHT SIDEBAR - Space Chat Replica */}
      {selectedConversationId && (
        <RightSidebar
          activeTab={rightSidebarTab}
          onTabChange={setRightSidebarTab}
                  theme={activeTheme}
          onThemeChange={setTheme}
          messages={normalizedMessages}
          selectedConversation={selectedConversation || undefined}
          onlineUsers={onlineUsers}
          mediaItems={mediaItems}
          linkItems={linkItems}
        />
      )}

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={handleCloseNewChat}
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
                onClick={handleCloseNewChat}
              >
                <FontAwesomeIcon icon={faTimes} className="text-white" />
              </button>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-2">New Conversation</h3>
                <p className="text-sm text-zinc-400">Find someone to message</p>
              </div>

              <div className="mb-4 flex gap-3">
                {['direct', 'group'].map((mode) => (
                  <button
                    key={mode}
                    className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                      newChatMode === mode
                        ? 'bg-zinc-800 text-white border-zinc-600'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => setNewChatMode(mode as 'direct' | 'group')}
                  >
                    <FontAwesomeIcon icon={mode === 'direct' ? faUser : faUsers} className="mr-2" />
                    {mode === 'direct' ? 'Direct' : 'Group'}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={newChatQuery}
                  onChange={(e) => setNewChatQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {newChatQuery.trim().length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    <FontAwesomeIcon icon={faSearch} className="text-3xl mb-3 text-zinc-700" />
                    <p>Search for users</p>
                  </div>
                )}

                {newChatQuery.trim().length > 0 && searchResults.length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    <p>No results found</p>
                  </div>
                )}

                {searchResults.map((result) => {
                  const isSelected = selectedUsers.some((entry) => entry.id === result.id);
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelectUser(result)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 border ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/50'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-white">
                        {(result.display_name || result.username || 'U')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-white">
                          {result.display_name || result.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-zinc-400">{result.username || result.email}</p>
                      </div>
                      {newChatMode === 'direct' ? (
                        <span className="text-xs font-bold text-zinc-400">Start</span>
                      ) : (
                        <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {isSelected ? 'Added' : 'Add'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {newChatMode === 'group' && (
                <button
                  className="mt-4 w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!groupName.trim() || selectedUsers.length === 0}
                  onClick={handleCreateGroup}
                >
                  Create Group
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================================
// HELPER FUNCTIONS
// ====================================

function getPrimaryParticipant(conversation: Conversation, currentUserId?: string | null) {
  const participants = conversation.participants || [];
  return participants.find((participant) => participant.user_id !== currentUserId) || participants[0] || null;
}

function getConversationTitle(conversation: Conversation, currentUserId?: string | null) {
  if (conversation.is_group) {
    if (conversation.name && conversation.name.trim()) return conversation.name;
    const names = (conversation.participants || [])
      .filter((participant) => participant.user_id !== currentUserId)
      .map((participant) => participant.user?.display_name || participant.user?.username || 'Unknown');
    return names.slice(0, 3).join(', ') || 'Group conversation';
  }

  const participant = getPrimaryParticipant(conversation, currentUserId);
  return participant?.user?.display_name || participant?.user?.username || 'Direct message';
}

function getConversationSubtitle(conversation: Conversation, currentUserId?: string | null) {
  if (conversation.last_message?.content) {
    const text = stripHtml(conversation.last_message.content);
    if (text) return text;
  }
  if (conversation.last_message?.message_type === 'image') return '📷 Photo';
  if (conversation.last_message?.message_type === 'file') return '📎 File';
  if (conversation.last_message?.message_type === 'voice') return '🎤 Voice message';
  if (conversation.is_group) {
    return `${(conversation.participants || []).length} members`;
  }
  const participant = getPrimaryParticipant(conversation, currentUserId);
  return participant?.user?.username || 'Say hello 👋';
}

// RightSidebarHomeTab Component - Home tab with sub-tabs: metrics, media, links, kept, pinned
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faImages, faLink, faBookmark, faThumbtack,
  faHashtag, faUsers, faSmile, faFileAlt, faHeart, faReply,
  faClock, faFire, faDownload, faExternalLinkAlt, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { formatRelativeTime } from './utils/formatDate';
import { calculateAverageResponseTime, calculateConversationAge, calculateActivityScore } from './utils/chatUtils';
import { useUserKeptMessages, useUnkeepMessage } from '../../hooks/useUserContent';

type HomeSubTab = 'metrics' | 'media' | 'links' | 'kept' | 'pinned';

interface Message {
  id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  name?: string;
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
}

interface RightSidebarHomeTabProps {
  activeSubTab: HomeSubTab;
  onSubTabChange: (tab: HomeSubTab) => void;
  messages: Message[];
  selectedConversation?: Conversation;
  mediaItems: any[];
  linkItems: any[];
}

export function RightSidebarHomeTab({
  activeSubTab,
  onSubTabChange,
  messages,
  selectedConversation,
  mediaItems,
  linkItems,
}: RightSidebarHomeTabProps) {
  // User content hooks
  const { data: keptMessages = [] } = useUserKeptMessages();
  const unkeepMessage = useUnkeepMessage();

  const subTabs: Array<{ id: HomeSubTab; icon: any; label: string; color: string }> = [
    { id: 'metrics', icon: faChartLine, label: 'Metrics', color: 'emerald' },
    { id: 'media', icon: faImages, label: 'Media', color: 'violet' },
    { id: 'links', icon: faLink, label: 'Links', color: 'rose' },
    { id: 'kept', icon: faBookmark, label: 'Kept', color: 'purple' },
    { id: 'pinned', icon: faThumbtack, label: 'Pinned', color: 'yellow' },
  ];

  // Dynamic sub-tab content map
  const subTabContent = useMemo(() => ({
    metrics: (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-bold text-white mb-3">Conversation Analytics</h3>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <FontAwesomeIcon icon={faHashtag} className="text-orange-400 text-sm" />
              <span className="text-xs text-gray-400">Messages</span>
            </div>
            <p className="text-lg font-bold text-white">{messages.length}</p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <FontAwesomeIcon icon={faUsers} className="text-blue-400 text-sm" />
              <span className="text-xs text-gray-400">Participants</span>
            </div>
            <p className="text-lg font-bold text-white">{selectedConversation?.participants?.length || 0}</p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <FontAwesomeIcon icon={faImages} className="text-green-400 text-sm" />
              <span className="text-xs text-gray-400">Media Files</span>
            </div>
            <p className="text-lg font-bold text-white">{mediaItems.length}</p>
          </div>
          <div className="p-3 bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <FontAwesomeIcon icon={faLink} className="text-purple-400 text-sm" />
              <span className="text-xs text-gray-400">Shared Links</span>
            </div>
            <p className="text-lg font-bold text-white">{linkItems.length}</p>
          </div>
        </div>

        {/* Message Insights */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message Insights</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faChartLine} className="text-cyan-400 text-sm" />
                <span className="text-xs text-gray-400">Avg/Day</span>
              </div>
              <p className="text-lg font-bold text-white">{messages.length > 0 ? Math.round(messages.length / Math.max(1, Math.ceil((Date.now() - (messages[0]?.created_at ? new Date(messages[0].created_at).getTime() : Date.now())) / (1000 * 60 * 60 * 24)))) : 0}</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faClock} className="text-amber-400 text-sm" />
                <span className="text-xs text-gray-400">Response Time</span>
              </div>
              <p className="text-lg font-bold text-white">~{calculateAverageResponseTime(messages)}m</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faFire} className="text-red-400 text-sm" />
                <span className="text-xs text-gray-400">Conversation Age</span>
              </div>
              <p className="text-lg font-bold text-white">{calculateConversationAge(selectedConversation)} days</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faHashtag} className="text-yellow-400 text-sm" />
                <span className="text-xs text-gray-400">Activity Score</span>
              </div>
              <p className="text-lg font-bold text-white">{calculateActivityScore(messages, selectedConversation)}</p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Activity Timeline</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
              <span className="text-sm text-gray-300">Most active day</span>
              <span className="text-xs text-cyan-400 font-medium">Wednesday</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
              <span className="text-sm text-gray-300">Peak hours</span>
              <span className="text-xs text-cyan-400 font-medium">2-4 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
              <span className="text-sm text-gray-300">Last message</span>
              <span className="text-xs text-gray-500">
                {selectedConversation?.last_message_at ? formatRelativeTime(selectedConversation.last_message_at) : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50">
              <span className="text-sm text-gray-300">Conversation age</span>
              <span className="text-xs text-gray-500">
                {selectedConversation?.created_at ? formatRelativeTime(selectedConversation.created_at) : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
              <FontAwesomeIcon icon={faSmile} className="text-emerald-400 text-lg mb-1" />
              <p className="text-xs text-emerald-300">Emojis Used</p>
              <p className="text-lg font-bold text-white">127</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
              <FontAwesomeIcon icon={faFileAlt} className="text-violet-400 text-lg mb-1" />
              <p className="text-xs text-violet-300">Word Count</p>
              <p className="text-lg font-bold text-white">2.4K</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-xl border border-rose-500/20">
              <FontAwesomeIcon icon={faHeart} className="text-rose-400 text-lg mb-1" />
              <p className="text-xs text-rose-300">Reactions</p>
              <p className="text-lg font-bold text-white">45</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
              <FontAwesomeIcon icon={faReply} className="text-amber-400 text-lg mb-1" />
              <p className="text-xs text-amber-300">Replies</p>
              <p className="text-lg font-bold text-white">23</p>
            </div>
          </div>
        </div>
      </div>
    ),

    media: (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-bold text-white mb-3">Shared Media</h3>
        {mediaItems.length > 0 ? (
          <div className="space-y-3">
            {mediaItems.slice(0, 10).map((_item, index) => (
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
    ),

    links: (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-bold text-white mb-3">Shared Links</h3>
        {linkItems.length > 0 ? (
          <div className="space-y-3">
            {linkItems.slice(0, 10).map((_item, index) => (
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
    ),

    kept: (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-bold text-white mb-3">Kept Messages</h3>
        {keptMessages.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faBookmark} className="text-purple-400 text-3xl mb-3" />
            <p className="text-zinc-400">No kept messages yet</p>
            <p className="text-sm text-zinc-500 mt-1">Right-click messages to keep them</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {keptMessages.map((item: any) => (
              <div key={item.id} className="p-3 bg-zinc-800/50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium line-clamp-2">
                      {item.message?.content || 'Message content'}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {item.message?.conversation?.name || 'Unknown conversation'} • {formatRelativeTime(item.created_at)}
                    </div>
                    {item.note && (
                      <div className="text-xs text-purple-300 mt-1 bg-purple-500/10 p-2 rounded">
                        Note: {item.note}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Remove from kept messages?')) {
                        unkeepMessage.mutate(item.message_id);
                      }
                    }}
                    className="text-zinc-400 hover:text-red-400 p-1 ml-2"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    pinned: (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-bold text-white mb-3">Pinned Messages</h3>
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faThumbtack} className="text-yellow-400 text-3xl mb-3" />
          <p className="text-zinc-400">No pinned messages yet</p>
          <p className="text-sm text-zinc-500 mt-1">Important messages you pin will appear here</p>
        </div>
      </div>
    ),
  }), [messages, selectedConversation, mediaItems, linkItems, keptMessages, unkeepMessage]);

  return (
    <div className="h-full flex flex-col">
      {/* Sub-tabs */}
      <div className="flex-shrink-0 pb-0 pt-0 pl-4 pr-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pl-1">
          {subTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onSubTabChange(tab.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium text-sm transition-all ${
                activeSubTab === tab.id
                  ? `bg-${tab.color}-500/10 text-${tab.color}-400`
                  : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg bg-${tab.color}-500/10 flex items-center justify-center`}>
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`text-xs ${
                    activeSubTab === tab.id
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
          {subTabContent[activeSubTab]}
        </div>
      </div>
    </div>
  );
}
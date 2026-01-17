// RightSidebar Component - Extracted from GeneralChat.tsx
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faImages, faLink, faPalette, faSlidersH,
  faEye, faClock, faUser, faHashtag, faCheckCircle,
  faBell, faVolumeUp, faExclamationTriangle, faMicrophone,
  faShieldHalved, faLock, faFingerprint, faUserSecret, faBan,
  faBolt, faRocket, faDownload,
  faRobot, faBrain, faCalendar, faFire,
  faHashtag as faHashtagAlt, faUsers as faUsersAlt, faSmile, faFileAlt, faHeart, faReply,
  faHistory, faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { CustomizationTab } from '../spaces/chat/rightPanel/CustomizationTab';
import { formatRelativeTime } from './utils/formatDate';

type RightSidebarTab = 'settings' | 'metrics' | 'media' | 'links' | 'customization';

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

interface ChatTheme extends ChatThemeTypeSettings {
  accentColor: string;
  backgroundType: string;
  [key: string]: any;
}

interface RightSidebarProps {
  activeTab: RightSidebarTab;
  onTabChange: (tab: RightSidebarTab) => void;
  theme: ChatTheme;
  onThemeChange: (theme: ChatTheme, roomId?: string, category?: string) => void;
  messages: Message[];
  selectedConversation?: Conversation;
  onlineUsers: Map<string, any>;
  mediaItems: any[];
  linkItems: any[];
}

export function RightSidebar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  messages,
  selectedConversation,
  onlineUsers,
  mediaItems,
  linkItems,
}: RightSidebarProps) {
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

              {/* Disappearing Messages */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="text-purple-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Disappearing Messages</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FontAwesomeIcon icon={faClock} className="text-purple-400 text-sm" />
                      <div>
                        <p className="text-sm text-white font-medium">Auto-delete messages</p>
                        <p className="text-xs text-gray-500">Messages disappear after selected time</p>
                      </div>
                    </div>
                    <select
                      value="off"
                      onChange={() => {}}
                      className="px-2 py-1 bg-zinc-700/50 border border-zinc-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    >
                      <option value="off">Off</option>
                      <option value="24h">24 hours</option>
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <FontAwesomeIcon icon={faHistory} className="text-indigo-400 text-sm" />
                      <div>
                        <p className="text-sm text-white font-medium">Message retention</p>
                        <p className="text-xs text-gray-500">Keep messages for limited time</p>
                      </div>
                    </div>
                    <select
                      value="forever"
                      onChange={() => {}}
                      className="px-2 py-1 bg-zinc-700/50 border border-zinc-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    >
                      <option value="forever">Forever</option>
                      <option value="1year">1 year</option>
                      <option value="6months">6 months</option>
                      <option value="1month">1 month</option>
                    </select>
                  </div>
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
                    { icon: faEye, label: 'Read receipts', sublabel: 'Show when you read messages', enabled: true, color: 'green' },
                    { icon: faUserSecret, label: 'Ghost mode', sublabel: 'Hide online status', enabled: false, color: 'purple' },
                    { icon: faLock, label: 'End-to-end encryption', sublabel: 'Secure messaging', enabled: true, color: 'green' },
                    { icon: faFingerprint, label: 'Biometric unlock', sublabel: 'Fingerprint/Face ID', enabled: false, color: 'blue' },
                    { icon: faBan, label: 'Block strangers', sublabel: 'Only contacts can message', enabled: false, color: 'red' },
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
              <h3 className="text-sm font-bold text-white mb-3">Conversation Analytics</h3>

              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faHashtagAlt} className="text-orange-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{messages.length}</p>
                  <p className="text-xs text-gray-500">Total Messages</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faUsersAlt} className="text-blue-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedConversation?.participants?.length || 0}</p>
                  <p className="text-xs text-gray-500">Participants</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faImages} className="text-green-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{mediaItems.length}</p>
                  <p className="text-xs text-gray-500">Media Files</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <FontAwesomeIcon icon={faLink} className="text-purple-400 text-xl mb-2" />
                  <p className="text-2xl font-bold text-white">{linkItems.length}</p>
                  <p className="text-xs text-gray-500">Shared Links</p>
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
                    <p className="text-lg font-bold text-white">{messages.length > 0 ? Math.round(messages.length / 7) : 0}</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon icon={faClock} className="text-amber-400 text-sm" />
                      <span className="text-xs text-gray-400">Response Time</span>
                    </div>
                    <p className="text-lg font-bold text-white">~2m</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon icon={faFire} className="text-red-400 text-sm" />
                      <span className="text-xs text-gray-400">Streak</span>
                    </div>
                    <p className="text-lg font-bold text-white">12 days</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon icon={faHashtag} className="text-yellow-400 text-sm" />
                      <span className="text-xs text-gray-400">Engagement</span>
                    </div>
                    <p className="text-lg font-bold text-white">94%</p>
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
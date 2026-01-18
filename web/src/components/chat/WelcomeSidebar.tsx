// WelcomeSidebar Component - General app settings and metrics
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faUser, faBell, faShieldHalved, faPalette,
  faTimes, faBolt, faCog, faStar, faClock, faMessage,
  faUsers, faRocket, faTrophy, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { ToggleSwitch } from '../ui/ToggleSwitch';

type WelcomeSidebarTab = 'overview' | 'profile' | 'activity' | 'settings';

interface WelcomeSidebarProps {
  activeTab: WelcomeSidebarTab;
  onTabChange: (tab: WelcomeSidebarTab) => void;
  onClose: () => void;
}

export function WelcomeSidebar({ activeTab, onTabChange, onClose }: WelcomeSidebarProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const tabs: Array<{ id: WelcomeSidebarTab; icon: any; label: string; color: string }> = [
    { id: 'overview', icon: faChartLine, label: 'Overview', color: 'cyan' },
    { id: 'profile', icon: faUser, label: 'Profile', color: 'blue' },
    { id: 'activity', icon: faBolt, label: 'Activity', color: 'green' },
    { id: 'settings', icon: faCog, label: 'Settings', color: 'purple' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 320 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 320 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full flex flex-col w-80  backdrop-blur-xl border-l border-zinc-700/50 bg-black"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-shrink-0 p-4 border-b border-zinc-700/30"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Welcome</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-zinc-400 text-sm" />
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex-shrink-0 p-3"
      >
        <div className="flex gap-1 justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500/15 text-${tab.color}-400 border border-${tab.color}-500/30 shadow-md`
                  : 'bg-zinc-800/40 text-gray-400 hover:text-gray-200 hover:bg-zinc-700/50'
              }`}
            >
              <FontAwesomeIcon
                icon={tab.icon}
                className={`text-base ${
                  activeTab === tab.id
                    ? `text-${tab.color}-400`
                    : 'text-gray-500'
                }`}
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-6"
            >
              {/* Welcome Message */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faRocket} className="text-2xl text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Welcome to 4Space</h3>
                <p className="text-zinc-400 text-sm">Your gateway to amazing conversations</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-800/50 rounded-xl text-center">
                  <FontAwesomeIcon icon={faMessage} className="text-cyan-400 text-xl mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">12</div>
                  <div className="text-xs text-zinc-400">Active Chats</div>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl text-center">
                  <FontAwesomeIcon icon={faUsers} className="text-green-400 text-xl mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">47</div>
                  <div className="text-xs text-zinc-400">Online Friends</div>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl text-center">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 text-xl mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">5</div>
                  <div className="text-xs text-zinc-400">Achievements</div>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl text-center">
                  <FontAwesomeIcon icon={faClock} className="text-purple-400 text-xl mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">2h</div>
                  <div className="text-xs text-zinc-400">Today</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBolt} className="text-green-400" />
                    Recent Activity
                  </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                    <FontAwesomeIcon icon={faMessage} className="text-blue-400 text-sm" />
                    <div className="flex-1">
                      <div className="text-sm text-white">Started new conversation</div>
                      <div className="text-xs text-zinc-500">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                    <div className="flex-1">
                      <div className="text-sm text-white">Earned "First Message" badge</div>
                      <div className="text-xs text-zinc-500">1 hour ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                    <FontAwesomeIcon icon={faUsers} className="text-green-400 text-sm" />
                    <div className="flex-1">
                      <div className="text-sm text-white">Joined a new space</div>
                      <div className="text-xs text-zinc-500">Yesterday</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-6"
            >
              {/* Profile Header */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Your Profile</h3>
                <p className="text-zinc-400 text-sm">Manage your account settings</p>
              </div>

              {/* Profile Stats */}
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">Member Since</span>
                    <span className="text-sm text-white font-medium">Jan 2024</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">Total Messages</span>
                    <span className="text-sm text-white font-medium">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Spaces Joined</span>
                    <span className="text-sm text-white font-medium">8</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-colors">
                    <FontAwesomeIcon icon={faPalette} className="text-purple-400 text-lg mb-2 block" />
                    <div className="text-xs text-white font-medium">Customize</div>
                  </button>
                  <button className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-colors">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-lg mb-2 block" />
                    <div className="text-xs text-white font-medium">Badges</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-6"
            >
              {/* Activity Header */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBolt} className="text-2xl text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Your Activity</h3>
                <p className="text-zinc-400 text-sm">Track your engagement and progress</p>
              </div>

              {/* Activity Stats */}
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBolt} className="text-yellow-400" />
                    This Week
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-cyan-400">24</div>
                      <div className="text-xs text-zinc-400">Messages</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">3</div>
                      <div className="text-xs text-zinc-400">Spaces</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">12</div>
                      <div className="text-xs text-zinc-400">Hours</div>
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faMessage} className="text-blue-400 text-xs" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Sent a message in "General"</div>
                        <div className="text-xs text-zinc-500">5 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faUsers} className="text-green-400 text-xs" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Joined "Tech Discussion" space</div>
                        <div className="text-xs text-zinc-500">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">Earned "Active Member" badge</div>
                        <div className="text-xs text-zinc-500">1 day ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-6"
            >
              {/* Settings Header */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCog} className="text-2xl text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">General Settings</h3>
                <p className="text-zinc-400 text-sm">Customize your app experience</p>
              </div>

              {/* Settings Options */}
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faBell} className="text-blue-400" />
                      <div>
                        <div className="text-sm text-white font-medium">Notifications</div>
                        <div className="text-xs text-zinc-400">Receive message alerts</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={notificationsEnabled}
                      onToggle={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faClock} className="text-green-400" />
                      <div>
                        <div className="text-sm text-white font-medium">Sound Effects</div>
                        <div className="text-xs text-zinc-400">Play notification sounds</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={soundEnabled}
                      onToggle={setSoundEnabled}
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faShieldHalved} className="text-orange-400" />
                      <div>
                        <div className="text-sm text-white font-medium">Privacy Mode</div>
                        <div className="text-xs text-zinc-400">Hide online status</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={privacyMode}
                      onToggle={setPrivacyMode}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-colors text-center">
                    <FontAwesomeIcon icon={faPalette} className="text-purple-400 text-lg mb-2 block" />
                    <div className="text-xs text-white font-medium">Themes</div>
                  </button>
                  <button className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-colors text-center">
                    <FontAwesomeIcon icon={faCalendar} className="text-blue-400 text-lg mb-2 block" />
                    <div className="text-xs text-white font-medium">Schedule</div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
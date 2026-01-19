// web/src/components/navbar/ProfileMenu.tsx
// Enhanced profile menu with rich features, stats, and comprehensive user management
// Follows the same design patterns as DisplayMenu and NotificationsMenu

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleUser, faChartLine, faCircleQuestion,
  faArrowRightFromBracket, faCamera, faEdit, faCrown,
  faShieldAlt, faBell, faPalette, faMoon, faSun,
  faClock, faMessage, faFileAlt, faUsers, faTrophy,
  faBug, faLightbulb, faCode, faHeart, faBookmark,
  faSliders, faKey, faCloud, faMicrophone, faVideo, faWifi,
  faSmile, faPen, faCheck, faX, faVolumeUp, faUserTimes,
  faShare, faDownload, faChevronRight, faHistory, faSync
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import DropdownButton from '../ui/DropdownButton';

interface UserStats {
  totalMessages: number;
  totalSpaces: number;
  totalFiles: number;
  unreadMessages: number;
  pendingInvites: number;
  storageUsed: number;
  storageLimit: number;
  lastActive: Date;
  joinedDate: Date;
}

interface QuickSetting {
  id: string;
  label: string;
  icon: any;
  value: boolean;
  onToggle: () => void;
  color: string;
}

interface StatusOption {
  id: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const statusOptions: StatusOption[] = [
  { id: 'online', label: 'Online', icon: faWifi, color: 'green', description: 'Available to chat' },
  { id: 'away', label: 'Away', icon: faClock, color: 'yellow', description: 'Stepping away' },
  { id: 'busy', label: 'Busy', icon: faUserTimes, color: 'red', description: 'Do not disturb' },
  { id: 'offline', label: 'Offline', icon: faWifi, color: 'gray', description: 'Appear offline' },
];

const quickSettings: QuickSetting[] = [
  { id: 'notifications', label: 'Notifications', icon: faBell, value: true, onToggle: () => {}, color: 'blue' },
  { id: 'sound', label: 'Sound', icon: faVolumeUp, value: true, onToggle: () => {}, color: 'purple' },
  { id: 'microphone', label: 'Microphone', icon: faMicrophone, value: false, onToggle: () => {}, color: 'green' },
  { id: 'camera', label: 'Camera', icon: faVideo, value: false, onToggle: () => {}, color: 'red' },
  { id: 'privacy', label: 'Privacy Mode', icon: faShieldAlt, value: false, onToggle: () => {}, color: 'orange' },
];

function formatStorage(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function ProfileMenuPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'activity' | 'support'>('overview');
  const [userStatus, setUserStatus] = useState('online');
  const [customStatus, setCustomStatus] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalMessages: 0,
    totalSpaces: 0,
    totalFiles: 0,
    unreadMessages: 0,
    pendingInvites: 0,
    storageUsed: 0,
    storageLimit: 1024 * 1024 * 1024, // 1GB
    lastActive: new Date(),
    joinedDate: new Date()
  });
  const [settings, setSettings] = useState(quickSettings);

  const isDark = theme === 'dark';
  const currentStatus = statusOptions.find(s => s.id === userStatus) || statusOptions[0];

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Mock data - replace with real API calls
      setStats({
        totalMessages: 1247,
        totalSpaces: 8,
        totalFiles: 156,
        unreadMessages: 3,
        pendingInvites: 2,
        storageUsed: 256 * 1024 * 1024, // 256MB
        storageLimit: 1024 * 1024 * 1024, // 1GB
        lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        joinedDate: new Date('2024-01-15')
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleStatusChange = (statusId: string) => {
    setUserStatus(statusId);
    // TODO: Update status in backend
  };

  const handleCustomStatusSave = () => {
    setIsEditingStatus(false);
    // TODO: Save custom status to backend
  };

  const toggleSetting = (settingId: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, value: !setting.value }
          : setting
      )
    );
    // TODO: Save setting to backend
  };

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  return (
    <div
      ref={containerRef}
      className="w-80 max-w-full p-3 bg-zinc-900 rounded-2xl shadow-2xl text-white max-h-[70vh] overflow-hidden flex flex-col box-border"
      onClick={e => e.stopPropagation()}
    >
      {/* Fixed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faCircleUser} className="text-white text-sm" />
          </div>
          <h3 className="text-lg font-bold text-white">Profile</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center justify-center"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <FontAwesomeIcon
              icon={isDark ? faSun : faMoon}
              className={`text-sm ${isDark ? 'text-amber-400' : 'text-indigo-400'}`}
            />
          </button>
          {/* Status Dropdown */}
          <DropdownButton
            placement="bottom-end"
            boundaryRef={containerRef as React.RefObject<HTMLElement>}
            toggleContent={
              <button className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full bg-${currentStatus.color}-500`} />
                <span className="text-xs text-zinc-400 capitalize">{userStatus}</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-xs text-zinc-500" />
              </button>
            }
          >
            <div className="p-2 bg-zinc-900 rounded-xl min-w-[180px]">
              {statusOptions.map((status) => (
                <button
                  key={status.id}
                  onClick={() => handleStatusChange(status.id)}
                  className={`w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${
                    userStatus === status.id ? 'bg-zinc-800' : ''
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full bg-${status.color}-500`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white capitalize">{status.label}</div>
                    <div className="text-xs text-zinc-500">{status.description}</div>
                  </div>
                  {userStatus === status.id && (
                    <FontAwesomeIcon icon={faCheck} className="text-cyan-400 text-xs" />
                  )}
                </button>
              ))}
            </div>
          </DropdownButton>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar box-border">

      {/* User Header */}
      <div className="mb-3">
        <div className="flex items-start gap-3 p-2.5 bg-zinc-800/50 rounded-lg">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-purple-500/30">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-${currentStatus.color}-500 border-2 border-zinc-900`} />
            <button className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <FontAwesomeIcon icon={faCamera} className="text-white text-[8px]" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-base truncate">
              {user?.email?.split('@')[0]}
            </h4>
            <p className="text-zinc-400 text-sm truncate mb-2">
              {user?.email}
            </p>
            {/* Custom Status */}
            <div className="mt-1">
              {isEditingStatus ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="Set status..."
                    className="flex-1 bg-zinc-700/50 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    maxLength={40}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCustomStatusSave();
                      if (e.key === 'Escape') setIsEditingStatus(false);
                    }}
                  />
                  <button
                    onClick={handleCustomStatusSave}
                    className="w-4 h-4 rounded bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faCheck} className="text-cyan-400 text-[8px]" />
                  </button>
                  <button
                    onClick={() => setIsEditingStatus(false)}
                    className="w-4 h-4 rounded bg-zinc-600/50 hover:bg-zinc-600/70 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faX} className="text-zinc-400 text-[8px]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="flex items-center gap-1 text-zinc-500 hover:text-zinc-400 transition-colors text-xs group"
                >
                  <FontAwesomeIcon icon={faSmile} className="text-[10px]" />
                  <span className="truncate">
                    {customStatus || 'Set status'}
                  </span>
                  <FontAwesomeIcon
                    icon={faPen}
                    className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faChartLine} className="text-emerald-400 text-xs" />
          </div>
          <span className="text-xs font-semibold text-white">Quick Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faMessage} className="text-blue-400 text-xs" />
              </div>
              <div>
                <span className="text-sm font-bold text-blue-400 block leading-tight">
                  {stats.totalMessages.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500">Messages</span>
              </div>
            </div>
          </div>
          <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-purple-400 text-xs" />
              </div>
              <div>
                <span className="text-sm font-bold text-purple-400 block leading-tight">
                  {stats.totalSpaces}
                </span>
                <span className="text-xs text-zinc-500">Spaces</span>
              </div>
            </div>
          </div>
          <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faFileAlt} className="text-orange-400 text-xs" />
              </div>
              <div>
                <span className="text-sm font-bold text-orange-400 block leading-tight">
                  {stats.totalFiles}
                </span>
                <span className="text-xs text-zinc-500">Files</span>
              </div>
            </div>
          </div>
          <div className="px-2.5 py-2 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-cyan-400 text-xs" />
              </div>
              <div>
                <span className="text-sm font-bold text-cyan-400 block leading-tight">
                  {formatRelativeTime(stats.lastActive)}
                </span>
                <span className="text-xs text-zinc-500">Last Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="px-2.5 py-1.5 bg-zinc-800/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">Storage Used</span>
            <span className="text-sm text-white font-medium">
              {formatStorage(stats.storageUsed)} / {formatStorage(stats.storageLimit)}
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                storagePercentage > 90 ? 'bg-red-500' :
                storagePercentage > 75 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation - Horizontally Scrollable */}
      <div className="mb-3">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: faCircleUser },
              { id: 'settings', label: 'Settings', icon: faSliders },
              { id: 'activity', label: 'Activity', icon: faChartLine },
              { id: 'support', label: 'Support', icon: faCircleQuestion },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50'
                }`}
              >
                <FontAwesomeIcon icon={icon} className="text-xs" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar box-border">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2 px-1 box-border"
            >
              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { icon: faEdit, label: 'Edit Profile', color: 'blue', onClick: () => navigate('/profile') },
                    { icon: faBookmark, label: 'Bookmarks', color: 'purple', onClick: () => {} },
                    { icon: faShare, label: 'Share Profile', color: 'green', onClick: () => {} },
                    { icon: faDownload, label: 'Export Data', color: 'orange', onClick: () => {} },
                  ].map(({ icon, label, color, onClick }) => (
                    <button
                      key={label}
                      onClick={() => { onClick(); onClose(); }}
                      className={`p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all hover:scale-105 group`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <FontAwesomeIcon icon={icon} className={`text-${color}-400`} />
                      </div>
                      <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Recent Activity</h4>
                <div className="space-y-1.5">
                  {[
                    { icon: faMessage, label: 'Sent a message in #general', time: '2m ago', color: 'blue' },
                    { icon: faUsers, label: 'Joined "Project Alpha" space', time: '1h ago', color: 'green' },
                    { icon: faFileAlt, label: 'Uploaded "design.pdf"', time: '3h ago', color: 'orange' },
                    { icon: faHeart, label: 'Reacted to a message', time: '5h ago', color: 'pink' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-zinc-800/30 rounded-lg">
                      <div className={`w-6 h-6 rounded bg-${activity.color}-500/20 flex items-center justify-center`}>
                        <FontAwesomeIcon icon={activity.icon} className={`text-${activity.color}-400 text-xs`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.label}</p>
                        <p className="text-xs text-zinc-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
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
              className="space-y-3 px-1 box-border"
            >
              {/* Quick Settings */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Quick Settings</h4>
                <div className="space-y-1.5">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${setting.color}-500/20 flex items-center justify-center`}>
                          <FontAwesomeIcon icon={setting.icon} className={`text-${setting.color}-400 text-sm`} />
                        </div>
                        <span className="text-sm text-white font-medium">{setting.label}</span>
                      </div>
                      <button
                        onClick={() => toggleSetting(setting.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          setting.value ? `bg-${setting.color}-500/30` : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                            setting.value ? `left-5 bg-${setting.color}-400` : 'left-0.5 bg-zinc-500'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Advanced</h4>
                <div className="space-y-1.5">
                  {[
                    { icon: faPalette, label: 'Theme & Appearance', desc: 'Customize your interface', color: 'purple', onClick: () => {} },
                    { icon: faBell, label: 'Notification Settings', desc: 'Manage alerts and sounds', color: 'blue', onClick: () => navigate('/settings/notifications') },
                    { icon: faShieldAlt, label: 'Privacy & Security', desc: 'Control your privacy', color: 'orange', onClick: () => navigate('/settings/security') },
                    { icon: faCloud, label: 'Data & Storage', desc: 'Manage your data', color: 'cyan', onClick: () => {} },
                    { icon: faKey, label: 'API & Integrations', desc: 'Connect third-party apps', color: 'slate', onClick: () => {} },
                  ].map(({ icon, label, desc, color, onClick }) => (
                    <button
                      key={label}
                      onClick={() => { onClick(); onClose(); }}
                      className="group w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-all hover:translate-x-0.5"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <FontAwesomeIcon icon={icon} className={`text-${color}-400 text-sm`} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white text-sm font-medium truncate">{label}</p>
                        <p className="text-zinc-400 text-xs">{desc}</p>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                    </button>
                  ))}
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
              className="space-y-3 px-1 box-border"
            >
              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <div className="text-lg font-bold text-cyan-400 mb-1">24</div>
                  <div className="text-xs text-zinc-500">Messages Today</div>
                </div>
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-400 mb-1">8</div>
                  <div className="text-xs text-zinc-500">Active Spaces</div>
                </div>
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-400 mb-1">12</div>
                  <div className="text-xs text-zinc-500">Files Shared</div>
                </div>
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <div className="text-lg font-bold text-green-400 mb-1">5</div>
                  <div className="text-xs text-zinc-500">New Connections</div>
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Activity Feed</h4>
                <div className="space-y-2">
                  {[
                    { icon: faMessage, title: 'New message in #general', desc: 'You sent a message 2 minutes ago', time: '2m', color: 'blue', type: 'message' },
                    { icon: faUsers, title: 'Joined new space', desc: 'Welcome to "Design Team" space', time: '1h', color: 'green', type: 'space' },
                    { icon: faFileAlt, title: 'File uploaded', desc: 'Shared "wireframes.pdf" (2.3MB)', time: '3h', color: 'orange', type: 'file' },
                    { icon: faHeart, title: 'Received reaction', desc: 'Someone liked your message', time: '5h', color: 'pink', type: 'reaction' },
                    { icon: faTrophy, title: 'Achievement unlocked', desc: 'First week streak completed!', time: '1d', color: 'yellow', type: 'achievement' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg bg-${activity.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                        <FontAwesomeIcon icon={activity.icon} className={`text-${activity.color}-400 text-sm`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white text-sm font-medium">{activity.title}</p>
                            <p className="text-zinc-400 text-xs mt-0.5">{activity.desc}</p>
                          </div>
                          <span className="text-zinc-500 text-xs flex-shrink-0">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Activity Actions */}
              <div className="pt-2 border-t border-zinc-800/50">
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 text-xs font-medium bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faHistory} className="text-xs" />
                    <span>View All</span>
                  </button>
                  <button className="flex-1 py-2 px-3 text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSync} className="text-xs" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 px-1 box-border"
            >
              {/* Help & Support */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Help & Support</h4>
                <div className="space-y-1.5">
                  {[
                    { icon: faCircleQuestion, label: 'Help Center', desc: 'Browse FAQs and guides', color: 'blue', onClick: () => {} },
                    { icon: faMessage, label: 'Contact Support', desc: 'Get help from our team', color: 'green', onClick: () => {} },
                    { icon: faBug, label: 'Report a Bug', desc: 'Found something broken?', color: 'red', onClick: () => {} },
                    { icon: faLightbulb, label: 'Feature Request', desc: 'Suggest new features', color: 'yellow', onClick: () => {} },
                    { icon: faCode, label: 'Developer Docs', desc: 'API documentation', color: 'slate', onClick: () => {} },
                  ].map(({ icon, label, desc, color, onClick }) => (
                    <button
                      key={label}
                      onClick={() => { onClick(); onClose(); }}
                      className="group w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-all hover:translate-x-0.5"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <FontAwesomeIcon icon={icon} className={`text-${color}-400 text-sm`} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white text-sm font-medium truncate">{label}</p>
                        <p className="text-zinc-400 text-xs">{desc}</p>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* System Info */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">System Information</h4>
                <div className="space-y-1.5">
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Version</span>
                      <span className="text-sm text-white font-mono">v2.1.0</span>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Last Updated</span>
                      <span className="text-sm text-white">Dec 15, 2024</span>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Account Type</span>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCrown} className="text-yellow-400 text-xs" />
                        <span className="text-sm text-yellow-400 font-medium">Premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faHeart} className="text-cyan-400 text-sm" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-white mb-1">Enjoying 4Space?</h5>
                    <p className="text-xs text-zinc-400 mb-2">Help us improve by sharing your feedback!</p>
                    <button className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-medium rounded-lg transition-colors">
                      Give Feedback
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {/* Footer Actions - Fixed at bottom */}
      <div className="flex-shrink-0 pt-3 border-t border-zinc-800/50">
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 py-2 px-3 text-sm font-medium bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faCircleUser} className="text-sm" />
            <span>Full Profile</span>
          </button>
          <button
            onClick={() => signOut()}
            className="flex-1 py-2 px-3 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-sm" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the panel for use with DropdownButton
export { ProfileMenuPanel };
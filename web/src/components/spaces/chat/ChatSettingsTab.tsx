// Enhanced Chat Settings Tab with Privacy Controls - Clean Icon UI
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faCheck, faBell, faLock, faShield,
  faUserSecret, faDownload, faImage, faVideo, faMobileAlt,
  faFingerprint, faClipboard, faCog, faGlobe, faEdit, faTrash,
  faArchive, faSignOutAlt, faVolumeUp, faVolumeMute, faClock,
  faHistory, faShare, faStar, faHeart, faSmile, faComment,
  faReply, faForward, faBookmark, faSearch, faFilter,
  faSort, faCalendar, faStickyNote, faPalette, faMoon,
  faSun, faDesktop, faMobile, faTablet, faWifi,
  faBatteryHalf, faCloud, faDatabase, faKey, faShieldAlt,
  faUser, faUsers, faCrown, faGavel, faExclamationTriangle,
  faArrowDown, faCompress, faKeyboard, faAt, faSignInAlt,
  faThumbtack, faTag, faFont, faPause, faBug,
  faAdjust
} from '@fortawesome/free-solid-svg-icons';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import { useChatSettingsStore } from '../../../store/chatSettingsStore';

interface ChatSettingsTabProps {
  roomId?: string;
}

export function ChatSettingsTab({ roomId: _roomId }: ChatSettingsTabProps) {
  const {
    applyToAllRooms,
    setApplyToAllRooms,
    theme,
  } = useChatSettingsStore();

  // Privacy settings (these would need to be added to the store)
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showProfilePhoto, setShowProfilePhoto] = useState(true);
  const [messagePreviewInNotifications, setMessagePreviewInNotifications] = useState(true);
  const [autoDownloadMedia, setAutoDownloadMedia] = useState(false);
  const [autoDownloadVideos, setAutoDownloadVideos] = useState(false);
  const [allowMessageDeletion, setAllowMessageDeletion] = useState(true);
  const [screenSecurity, setScreenSecurity] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Message settings
  const [allowMessageEditing, setAllowMessageEditing] = useState(true);
  const [showMessageTimestamps, setShowMessageTimestamps] = useState(true);
  const [showMessageStatus, setShowMessageStatus] = useState(true);
  const [enableMessageReactions, setEnableMessageReactions] = useState(true);
  const [enableMessageReplies, setEnableMessageReplies] = useState(true);
  const [enableMessageForwarding, setEnableMessageForwarding] = useState(true);
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true);
  const [showMessageHistory, setShowMessageHistory] = useState(true);

  // Chat behavior
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(true);
  const [compactMessageView, setCompactMessageView] = useState(false);
  const [showUnreadIndicators, setShowUnreadIndicators] = useState(true);
  const [enableKeyboardShortcuts, setEnableKeyboardShortcuts] = useState(true);
  const [highlightMentions, setHighlightMentions] = useState(true);
  const [showJoinLeaveMessages, setShowJoinLeaveMessages] = useState(false);
  const [muteRoom, setMuteRoom] = useState(false);
  const [pinImportantMessages, setPinImportantMessages] = useState(true);

  // Display settings
  const [showAvatars, setShowAvatars] = useState(true);
  const [showUsernames, setShowUsernames] = useState(true);
  const [showRoles, setShowRoles] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);

  // Sound & notifications
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [mentionSound, setMentionSound] = useState(true);
  const [messageSound, setMessageSound] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState('all');
  const [quietHours, setQuietHours] = useState(false);

  // Advanced settings
  const [messageRetention, setMessageRetention] = useState('forever');
  const [exportChatHistory, setExportChatHistory] = useState(true);
  const [backupSettings, setBackupSettings] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* Apply to All Rooms */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/15 transition-colors border border-purple-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faGlobe} className="text-purple-400 text-sm" />
          </div>
          <div>
            <span className="text-sm text-white font-medium">Apply to All Rooms</span>
            <p className="text-xs text-gray-500">Use globally</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={applyToAllRooms}
          onToggle={setApplyToAllRooms}
          accentColor={theme.accentColor}
        />
      </div>

      {/* Privacy & Visibility */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faLock} className="text-yellow-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Privacy & Visibility</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faEye, label: 'Show Online Status', sublabel: 'Others can see when you\'re online', enabled: showOnlineStatus, onToggle: setShowOnlineStatus, color: 'green' },
            { icon: faCheck, label: 'Read Receipts', sublabel: 'Show when you\'ve read messages', enabled: showReadReceipts, onToggle: setShowReadReceipts, color: 'blue' },
            { icon: faClipboard, label: 'Typing Indicators', sublabel: 'Show when you\'re typing', enabled: showTypingIndicator, onToggle: setShowTypingIndicator, color: 'cyan' },
            { icon: faUserSecret, label: 'Last Seen', sublabel: 'Show your last active time', enabled: showLastSeen, onToggle: setShowLastSeen, color: 'purple' },
            { icon: faImage, label: 'Profile Photo Visibility', sublabel: 'Who can see your profile picture', enabled: showProfilePhoto, onToggle: setShowProfilePhoto, color: 'pink' },
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
                onToggle={item.onToggle}
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

        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faBell} className="text-orange-400 text-sm" />
            <div>
              <p className="text-sm text-white font-medium">Message Preview</p>
              <p className="text-xs text-gray-500">Show content in notifications</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={messagePreviewInNotifications}
            onToggle={setMessagePreviewInNotifications}
            size="sm"
          />
        </div>
      </div>

      {/* Media & Downloads */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faDownload} className="text-cyan-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Media & Downloads</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faImage, label: 'Auto-Download Images', sublabel: 'Automatically download photos', enabled: autoDownloadMedia, onToggle: setAutoDownloadMedia, color: 'green' },
            { icon: faVideo, label: 'Auto-Download Videos', sublabel: 'Automatically download videos', enabled: autoDownloadVideos, onToggle: setAutoDownloadVideos, color: 'blue' },
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
                onToggle={item.onToggle}
                size="sm"
                accentColor={theme.accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faShield} className="text-red-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Security</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faCog, label: 'Allow Message Deletion', sublabel: 'Let others delete their messages', enabled: allowMessageDeletion, onToggle: setAllowMessageDeletion, color: 'gray' },
            { icon: faMobileAlt, label: 'Screen Security', sublabel: 'Prevent screenshots', enabled: screenSecurity, onToggle: setScreenSecurity, color: 'red' },
            { icon: faFingerprint, label: 'Two-Factor Auth', sublabel: 'Extra security layer', enabled: twoFactorAuth, onToggle: setTwoFactorAuth, color: 'purple' },
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
                onToggle={item.onToggle}
                size="sm"
                accentColor={theme.accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Message Settings */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faComment} className="text-blue-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Message Settings</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faEdit, label: 'Allow Message Editing', sublabel: 'Users can edit their messages', enabled: allowMessageEditing, onToggle: setAllowMessageEditing, color: 'blue' },
            { icon: faClock, label: 'Show Timestamps', sublabel: 'Display message timestamps', enabled: showMessageTimestamps, onToggle: setShowMessageTimestamps, color: 'gray' },
            { icon: faCheck, label: 'Message Status', sublabel: 'Show delivery status', enabled: showMessageStatus, onToggle: setShowMessageStatus, color: 'green' },
            { icon: faHeart, label: 'Message Reactions', sublabel: 'Allow emoji reactions', enabled: enableMessageReactions, onToggle: setEnableMessageReactions, color: 'pink' },
            { icon: faReply, label: 'Message Replies', sublabel: 'Enable reply functionality', enabled: enableMessageReplies, onToggle: setEnableMessageReplies, color: 'cyan' },
            { icon: faShare, label: 'Message Forwarding', sublabel: 'Allow forwarding messages', enabled: enableMessageForwarding, onToggle: setEnableMessageForwarding, color: 'purple' },
            { icon: faBookmark, label: 'Auto-save Drafts', sublabel: 'Save message drafts automatically', enabled: autoSaveDrafts, onToggle: setAutoSaveDrafts, color: 'yellow' },
            { icon: faHistory, label: 'Message History', sublabel: 'Show edit history', enabled: showMessageHistory, onToggle: setShowMessageHistory, color: 'indigo' },
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
                onToggle={item.onToggle}
                size="sm"
                accentColor={theme.accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Chat Behavior */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faCog} className="text-emerald-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Chat Behavior</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faArrowDown, label: 'Auto-scroll to Bottom', sublabel: 'Automatically scroll to new messages', enabled: autoScrollToBottom, onToggle: setAutoScrollToBottom, color: 'emerald' },
            { icon: faCompress, label: 'Compact View', sublabel: 'Use compact message layout', enabled: compactMessageView, onToggle: setCompactMessageView, color: 'gray' },
            { icon: faExclamationTriangle, label: 'Unread Indicators', sublabel: 'Show unread message badges', enabled: showUnreadIndicators, onToggle: setShowUnreadIndicators, color: 'orange' },
            { icon: faKeyboard, label: 'Keyboard Shortcuts', sublabel: 'Enable keyboard shortcuts', enabled: enableKeyboardShortcuts, onToggle: setEnableKeyboardShortcuts, color: 'blue' },
            { icon: faAt, label: 'Highlight Mentions', sublabel: 'Highlight when mentioned', enabled: highlightMentions, onToggle: setHighlightMentions, color: 'cyan' },
            { icon: faSignInAlt, label: 'Join/Leave Messages', sublabel: 'Show user join/leave notifications', enabled: showJoinLeaveMessages, onToggle: setShowJoinLeaveMessages, color: 'purple' },
            { icon: faVolumeMute, label: 'Mute Room', sublabel: 'Disable notifications for this room', enabled: muteRoom, onToggle: setMuteRoom, color: 'red' },
            { icon: faThumbtack, label: 'Pin Important Messages', sublabel: 'Allow pinning important messages', enabled: pinImportantMessages, onToggle: setPinImportantMessages, color: 'yellow' },
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
                onToggle={item.onToggle}
                size="sm"
                accentColor={theme.accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Display Settings */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faDesktop} className="text-violet-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Display Settings</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faUser, label: 'Show Avatars', sublabel: 'Display user profile pictures', enabled: showAvatars, onToggle: setShowAvatars, color: 'violet' },
            { icon: faTag, label: 'Show Usernames', sublabel: 'Display user display names', enabled: showUsernames, onToggle: setShowUsernames, color: 'blue' },
            { icon: faCrown, label: 'Show Roles', sublabel: 'Display user roles and badges', enabled: showRoles, onToggle: setShowRoles, color: 'yellow' },
            { icon: faMoon, label: 'Dark Mode', sublabel: 'Use dark theme', enabled: darkMode, onToggle: setDarkMode, color: 'slate' },
            { icon: faAdjust, label: 'High Contrast', sublabel: 'Increase color contrast', enabled: highContrastMode, onToggle: setHighContrastMode, color: 'orange' },
            { icon: faFont, label: 'Large Text', sublabel: 'Increase text size', enabled: largeText, onToggle: setLargeText, color: 'green' },
            { icon: faPause, label: 'Reduce Animations', sublabel: 'Minimize motion effects', enabled: reduceAnimations, onToggle: setReduceAnimations, color: 'gray' },
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
                onToggle={item.onToggle}
                size="sm"
                accentColor={theme.accentColor}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sound & Notifications */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faVolumeUp} className="text-rose-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Sound & Notifications</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faVolumeUp, label: 'Sound Enabled', sublabel: 'Play notification sounds', enabled: soundEnabled, onToggle: setSoundEnabled, color: 'rose' },
            { icon: faBell, label: 'Notification Sounds', sublabel: 'Sound for all notifications', enabled: notificationSound, onToggle: setNotificationSound, color: 'orange' },
            { icon: faAt, label: 'Mention Sounds', sublabel: 'Special sound for mentions', enabled: mentionSound, onToggle: setMentionSound, color: 'cyan' },
            { icon: faComment, label: 'Message Sounds', sublabel: 'Sound for new messages', enabled: messageSound, onToggle: setMessageSound, color: 'blue' },
            { icon: faDesktop, label: 'Desktop Notifications', sublabel: 'Browser notification popups', enabled: desktopNotifications, onToggle: setDesktopNotifications, color: 'purple' },
            { icon: faClock, label: 'Quiet Hours', sublabel: 'Disable sounds during quiet hours', enabled: quietHours, onToggle: setQuietHours, color: 'indigo' },
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
                onToggle={item.onToggle}
                size="sm"
                accentColor={theme.accentColor}
              />
            </div>
          ))}

          {/* Notification Frequency */}
          <div className="p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <FontAwesomeIcon icon={faFilter} className="text-teal-400 text-sm" />
              <span className="text-sm text-white font-medium">Notification Frequency</span>
            </div>
            <select
              value={notificationFrequency}
              onChange={(e) => setNotificationFrequency(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400/70 focus:ring-1 focus:ring-teal-400/30"
            >
              <option value="all">All Messages</option>
              <option value="mentions">Mentions Only</option>
              <option value="important">Important Only</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faAdjust} className="text-amber-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Advanced Settings</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faCloud, label: 'Export Chat History', sublabel: 'Allow exporting chat data', enabled: exportChatHistory, onToggle: setExportChatHistory, color: 'amber' },
            { icon: faDatabase, label: 'Backup Settings', sublabel: 'Automatically backup preferences', enabled: backupSettings, onToggle: setBackupSettings, color: 'green' },
            { icon: faWifi, label: 'Data Sync', sublabel: 'Sync data across devices', enabled: dataSync, onToggle: setDataSync, color: 'blue' },
            { icon: faBatteryHalf, label: 'Offline Mode', sublabel: 'Work without internet connection', enabled: offlineMode, onToggle: setOfflineMode, color: 'slate' },
            { icon: faBug, label: 'Debug Mode', sublabel: 'Enable debugging features', enabled: debugMode, onToggle: setDebugMode, color: 'red' },
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
                onToggle={item.onToggle}
                size="sm"
                accentColor={theme.accentColor}
              />
            </div>
          ))}

          {/* Message Retention */}
          <div className="p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <FontAwesomeIcon icon={faHistory} className="text-indigo-400 text-sm" />
              <span className="text-sm text-white font-medium">Message Retention</span>
            </div>
            <select
              value={messageRetention}
              onChange={(e) => setMessageRetention(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-400/70 focus:ring-1 focus:ring-indigo-400/30"
            >
              <option value="forever">Keep Forever</option>
              <option value="1year">1 Year</option>
              <option value="6months">6 Months</option>
              <option value="1month">1 Month</option>
              <option value="1week">1 Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Management */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-slate-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faGavel} className="text-slate-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Room Management</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium transition-colors">
            <FontAwesomeIcon icon={faArchive} className="mr-2" />
            Archive Room
          </button>

          <button className="w-full px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors">
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Leave Room
          </button>

          <button className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors">
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete Room (Dangerous)
          </button>
        </div>
      </div>
    </div>
  );
}
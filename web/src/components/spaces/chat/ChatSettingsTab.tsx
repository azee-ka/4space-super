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
  faAdjust, faInfoCircle, faBan, faUserTimes, faUserCheck,
  faClone, faChevronRight, faSkull, faHashtag
} from '@fortawesome/free-solid-svg-icons';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import { useChatSettingsStore } from '../../../store/chatSettingsStore';

interface ChatSettingsTabProps {
  roomId?: string;
  getAccentFocusClass?: (accentColor: string) => string;
}

export function ChatSettingsTab({ roomId: _roomId, getAccentFocusClass }: ChatSettingsTabProps) {
  const {
    applyToAllRooms,
    setApplyToAllRooms,
    applyToCategory,
    setApplyToCategory,
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
      {/* Apply Scope */}
      <div className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/15 transition-colors border border-purple-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faGlobe} className="text-purple-400 text-sm" />
            </div>
            <div>
              <span className="text-sm text-white font-medium">Apply Across All Rooms</span>
              <p className="text-xs text-gray-500">Share settings globally</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={applyToAllRooms}
            onToggle={setApplyToAllRooms}
            accentColor={theme.accentColor}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faHashtag} className="text-purple-400 text-sm" />
            </div>
            <div>
              <span className="text-sm text-white font-medium">Apply Within Category</span>
              <p className="text-xs text-gray-500">Share settings across category rooms</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={applyToCategory}
            onToggle={setApplyToCategory}
            accentColor={theme.accentColor}
            disabled={applyToAllRooms}
          />
        </div>
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
          {/* Disappearing Messages - Near top as commonly used */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
            <div className="flex items-center gap-2.5">
              <FontAwesomeIcon icon={faHistory} className="text-indigo-400 text-sm" />
              <div>
                <p className="text-sm text-white font-medium">Disappearing Messages</p>
                <p className="text-xs text-gray-500">Auto-delete messages after selected time</p>
              </div>
            </div>
            <select
              value={messageRetention}
              onChange={(e) => setMessageRetention(e.target.value)}
              className={`px-1.5 py-0.5 bg-zinc-700/50 border border-zinc-600/50 rounded text-white text-xs focus:outline-none ${getAccentFocusClass ? getAccentFocusClass(theme.accentColor) : 'focus:border-purple-400/70 focus:ring-purple-400/30'}`}
            >
              <option value="forever">Off</option>
              <option value="1hour">1h</option>
              <option value="24hours">24h</option>
              <option value="1week">1w</option>
              <option value="1month">1mo</option>
              <option value="6months">6mo</option>
              <option value="1year">1y</option>
            </select>
          </div>

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
            accentColor={theme.accentColor}
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
              className={`w-full px-3 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none ${getAccentFocusClass ? getAccentFocusClass(theme.accentColor) : 'focus:border-purple-400/70 focus:ring-purple-400/30'}`}
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
        </div>
      </div>

      {/* Advanced Room Management */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center border border-slate-500/30">
            <FontAwesomeIcon icon={faGavel} className="text-slate-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Room Management</h3>
            <p className="text-xs text-gray-500">Advanced room controls and moderation tools</p>
          </div>
        </div>

        <div className="space-y-4">

      {/* Moderation Actions */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-orange-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Moderation Actions</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faBan, label: 'Ban User', sublabel: 'Permanently ban a user from this room', color: 'red', action: 'ban' },
            { icon: faExclamationTriangle, label: 'Warn User', sublabel: 'Send a warning message to user', color: 'yellow', action: 'warn' },
            { icon: faUserTimes, label: 'Kick User', sublabel: 'Remove user from room temporarily', color: 'purple', action: 'kick' },
            { icon: faUserCheck, label: 'Verify User', sublabel: 'Mark user as verified/trusted', color: 'blue', action: 'verify' },
            { icon: faClock, label: 'Timeout User', sublabel: 'Temporarily mute user', color: 'orange', action: 'timeout' }
          ].map((item) => (
            <div key={item.action} className={`flex items-center justify-between p-3 rounded-xl bg-${item.color}-500/10 hover:bg-${item.color}-500/15 transition-colors border border-${item.color}-500/20`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                  <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-xs`} />
                </div>
                <div>
                  <span className="text-sm text-white font-medium">{item.label}</span>
                  <p className="text-xs text-gray-500">{item.sublabel}</p>
                </div>
              </div>
              <button className={`px-3 py-1.5 rounded-lg bg-${item.color}-500/20 hover:bg-${item.color}-500/30 text-${item.color}-400 text-xs font-medium transition-colors`}>
                Execute
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Room Lifecycle Actions */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gray-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faCog} className="text-gray-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Room Lifecycle</h3>
        </div>

        <div className="space-y-2">
          {[
            { icon: faArchive, label: 'Archive Room', sublabel: 'Move to archives - becomes read-only', color: 'amber', action: 'archive' },
            { icon: faClone, label: 'Duplicate Room', sublabel: 'Create a copy with same settings', color: 'emerald', action: 'duplicate' },
            { icon: faSignOutAlt, label: 'Leave Room', sublabel: 'Remove yourself from this room', color: 'blue', action: 'leave' },
            { icon: faCog, label: 'Room Settings', sublabel: 'Advanced room configuration', color: 'cyan', action: 'settings' }
          ].map((item) => (
            <div key={item.action} className={`flex items-center justify-between p-3 rounded-xl bg-${item.color}-500/10 hover:bg-${item.color}-500/15 transition-colors border border-${item.color}-500/20`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                  <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-xs`} />
                </div>
                <div>
                  <span className="text-sm text-white font-medium">{item.label}</span>
                  <p className="text-xs text-gray-500">{item.sublabel}</p>
                </div>
              </div>
              <button className={`px-3 py-1.5 rounded-lg bg-${item.color}-500/20 hover:bg-${item.color}-500/30 text-${item.color}-400 text-xs font-medium transition-colors`}>
                {item.action === 'settings' ? 'Open' : 'Execute'}
              </button>
            </div>
          ))}
        </div>
      </div>

          {/* Danger Zone */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-900/10 to-red-800/5 border border-red-500/30">
            <h4 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-sm" />
              </div>
              Danger Zone
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50 transition-colors">
                <div className="w-full cursor-pointer group" onClick={() => console.log('Delete room clicked')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <FontAwesomeIcon icon={faTrash} className="text-red-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">Delete Room</h5>
                        <p className="text-xs text-gray-400">Permanently delete this room and all messages</p>
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="text-red-400/60 text-sm group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50 transition-colors">
                <div className="w-full cursor-pointer group" onClick={() => console.log('Nuclear option clicked')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-800/20 flex items-center justify-center border border-red-700/30">
                        <FontAwesomeIcon icon={faSkull} className="text-red-300" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">Nuclear Option</h5>
                        <p className="text-xs text-gray-400">Delete room, ban all members, and blacklist</p>
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="text-red-300/60 text-sm group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

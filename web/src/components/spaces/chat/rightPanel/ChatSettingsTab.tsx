// Enhanced Chat Settings Tab with Privacy Controls - Clean Icon UI
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
import { ToggleSwitch } from '../../../ui/ToggleSwitch';
import { useChatSettingsStore } from '../../../../store/chatSettingsStore';
import { useRoomMemberSettings, useRoomSettings, useUpdateRoomMemberSettings, useUpdateRoomSettings } from '../../../../hooks/useSettings';
import { DEFAULT_ROOM_SETTINGS, type RoomMemberSettings } from '@4space/shared/src/types/chatSettings';

interface ChatSettingsTabProps {
  roomId?: string;
  canManageRoomSettings?: boolean;
  canModerateRoom?: boolean;
  getAccentFocusClass?: (accentColor: string) => string;
}

export function ChatSettingsTab({
  roomId,
  canManageRoomSettings = false,
  canModerateRoom = false,
  getAccentFocusClass,
}: ChatSettingsTabProps) {
  const {
    applyToAllRooms,
    setApplyToAllRooms,
    applyToCategory,
    setApplyToCategory,
    theme,
    showOnlineStatus,
    showReadReceipts,
    showTypingIndicator,
    showLastSeen,
    showProfilePhoto,
    messagePreviewInNotifications,
    autoDownloadMedia,
    autoDownloadVideos,
    screenSecurity,
    twoFactorAuth,
    showMessageStatus,
    autoSaveDrafts,
    showMessageHistory,
    autoScrollToBottom,
    compactMessageView,
    showUnreadIndicators,
    enableKeyboardShortcuts,
    highlightMentions,
    pinImportantMessages,
    showAvatars,
    showUsernames,
    showRoles,
    darkMode,
    highContrastMode,
    largeText,
    reduceAnimations,
    soundEnabled,
    notificationSound,
    mentionSound,
    messageSound,
    desktopNotifications,
    notificationFrequency,
    quietHours,
    exportChatHistory,
    backupSettings,
    dataSync,
    offlineMode,
    debugMode,
    showTimestamps,
    messageDensity,
    fontSize,
    updateSettings,
    setMessageDensity,
    setFontSize,
    setMessageAnimations,
  } = useChatSettingsStore();

  const { data: roomSettingsData } = useRoomSettings(roomId);
  const updateRoomSettings = useUpdateRoomSettings();
  const { data: roomMemberSettings } = useRoomMemberSettings(roomId);
  const updateRoomMemberSettings = useUpdateRoomMemberSettings();

  const roomSettings = roomSettingsData || DEFAULT_ROOM_SETTINGS;
  const showRoomControls = canManageRoomSettings && !!roomId;
  const showModerationControls = canModerateRoom && !!roomId;
  const notificationPreference = roomMemberSettings?.notificationPreference || notificationFrequency;

  const updateRoomSetting = (updates: Partial<typeof roomSettings>) => {
    if (!roomId) return;
    updateRoomSettings.mutate({ roomId, updates });
  };

  const updateMemberSetting = (updates: { notificationPreference?: string; isMuted?: boolean }) => {
    if (!roomId) return;
    updateRoomMemberSettings.mutate({ roomId, updates: updates as any });
  };

  const handleCompactToggle = (enabled: boolean) => {
    updateSettings({ compactMessageView: enabled });
    if (enabled) {
      setMessageDensity('compact');
    } else if (messageDensity === 'compact') {
      setMessageDensity('comfortable');
    }
  };

  const handleLargeTextToggle = (enabled: boolean) => {
    updateSettings({ largeText: enabled });
    if (enabled) {
      setFontSize(Math.max(fontSize, 18));
    } else if (fontSize >= 18) {
      setFontSize(14);
    }
  };

  const handleReduceAnimationsToggle = (enabled: boolean) => {
    updateSettings({ reduceAnimations: enabled });
    setMessageAnimations(!enabled);
  };

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
          {showRoomControls && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
              <div className="flex items-center gap-2.5">
                <FontAwesomeIcon icon={faHistory} className="text-indigo-400 text-sm" />
                <div>
                  <p className="text-sm text-white font-medium">Disappearing Messages</p>
                  <p className="text-xs text-gray-500">Auto-delete messages after selected time</p>
                </div>
              </div>
              <select
                value={roomSettings.messageRetention}
                onChange={(e) => updateRoomSetting({ messageRetention: e.target.value as any })}
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
          )}

          {[
            { icon: faEye, label: 'Show Online Status', sublabel: 'Others can see when you\'re online', enabled: showOnlineStatus, onToggle: (value: boolean) => updateSettings({ showOnlineStatus: value }), color: 'green' },
            { icon: faCheck, label: 'Read Receipts', sublabel: 'Show when you\'ve read messages', enabled: showReadReceipts, onToggle: (value: boolean) => updateSettings({ showReadReceipts: value }), color: 'blue' },
            { icon: faClipboard, label: 'Typing Indicators', sublabel: 'Show when you\'re typing', enabled: showTypingIndicator, onToggle: (value: boolean) => updateSettings({ showTypingIndicator: value }), color: 'cyan' },
            { icon: faUserSecret, label: 'Last Seen', sublabel: 'Show your last active time', enabled: showLastSeen, onToggle: (value: boolean) => updateSettings({ showLastSeen: value }), color: 'purple' },
            { icon: faImage, label: 'Profile Photo Visibility', sublabel: 'Who can see your profile picture', enabled: showProfilePhoto, onToggle: (value: boolean) => updateSettings({ showProfilePhoto: value }), color: 'pink' },
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
            onToggle={(value) => updateSettings({ messagePreviewInNotifications: value })}
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
            { icon: faImage, label: 'Auto-Download Images', sublabel: 'Automatically download photos', enabled: autoDownloadMedia, onToggle: (value: boolean) => updateSettings({ autoDownloadMedia: value }), color: 'green' },
            { icon: faVideo, label: 'Auto-Download Videos', sublabel: 'Automatically download videos', enabled: autoDownloadVideos, onToggle: (value: boolean) => updateSettings({ autoDownloadVideos: value }), color: 'blue' },
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
            {
              icon: faCog,
              label: 'Allow Message Deletion',
              sublabel: 'Let others delete their messages',
              enabled: roomSettings.allowMessageDeletion,
              onToggle: (value: boolean) => updateRoomSetting({ allowMessageDeletion: value }),
              color: 'gray',
              visible: showRoomControls,
            },
            {
              icon: faMobileAlt,
              label: 'Screen Security',
              sublabel: 'Prevent screenshots',
              enabled: screenSecurity,
              onToggle: (value: boolean) => updateSettings({ screenSecurity: value }),
              color: 'red',
              visible: true,
            },
            {
              icon: faFingerprint,
              label: 'Two-Factor Auth',
              sublabel: 'Extra security layer',
              enabled: twoFactorAuth,
              onToggle: (value: boolean) => updateSettings({ twoFactorAuth: value }),
              color: 'purple',
              visible: true,
            },
          ].filter((item) => item.visible).map((item) => (
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
            {
              icon: faEdit,
              label: 'Allow Message Editing',
              sublabel: 'Users can edit their messages',
              enabled: roomSettings.allowMessageEditing,
              onToggle: (value: boolean) => updateRoomSetting({ allowMessageEditing: value }),
              color: 'blue',
              visible: showRoomControls,
            },
            {
              icon: faClock,
              label: 'Show Timestamps',
              sublabel: 'Display message timestamps',
              enabled: showTimestamps,
              onToggle: (value: boolean) => updateSettings({ showTimestamps: value }),
              color: 'gray',
              visible: true,
            },
            {
              icon: faCheck,
              label: 'Message Status',
              sublabel: 'Show delivery status',
              enabled: showMessageStatus,
              onToggle: (value: boolean) => updateSettings({ showMessageStatus: value }),
              color: 'green',
              visible: true,
            },
            {
              icon: faHeart,
              label: 'Message Reactions',
              sublabel: 'Allow emoji reactions',
              enabled: roomSettings.enableMessageReactions,
              onToggle: (value: boolean) => updateRoomSetting({ enableMessageReactions: value }),
              color: 'pink',
              visible: showRoomControls,
            },
            {
              icon: faReply,
              label: 'Message Replies',
              sublabel: 'Enable reply functionality',
              enabled: roomSettings.enableMessageReplies,
              onToggle: (value: boolean) => updateRoomSetting({ enableMessageReplies: value }),
              color: 'cyan',
              visible: showRoomControls,
            },
            {
              icon: faShare,
              label: 'Message Forwarding',
              sublabel: 'Allow forwarding messages',
              enabled: roomSettings.enableMessageForwarding,
              onToggle: (value: boolean) => updateRoomSetting({ enableMessageForwarding: value }),
              color: 'purple',
              visible: showRoomControls,
            },
            {
              icon: faBookmark,
              label: 'Auto-save Drafts',
              sublabel: 'Save message drafts automatically',
              enabled: autoSaveDrafts,
              onToggle: (value: boolean) => updateSettings({ autoSaveDrafts: value }),
              color: 'yellow',
              visible: true,
            },
            {
              icon: faHistory,
              label: 'Message History',
              sublabel: 'Show edit history',
              enabled: showMessageHistory,
              onToggle: (value: boolean) => updateSettings({ showMessageHistory: value }),
              color: 'indigo',
              visible: true,
            },
          ].filter((item) => item.visible).map((item) => (
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
            { icon: faArrowDown, label: 'Auto-scroll to Bottom', sublabel: 'Automatically scroll to new messages', enabled: autoScrollToBottom, onToggle: (value: boolean) => updateSettings({ autoScrollToBottom: value }), color: 'emerald' },
            { icon: faCompress, label: 'Compact View', sublabel: 'Use compact message layout', enabled: compactMessageView, onToggle: handleCompactToggle, color: 'gray' },
            { icon: faExclamationTriangle, label: 'Unread Indicators', sublabel: 'Show unread message badges', enabled: showUnreadIndicators, onToggle: (value: boolean) => updateSettings({ showUnreadIndicators: value }), color: 'orange' },
            { icon: faKeyboard, label: 'Keyboard Shortcuts', sublabel: 'Enable keyboard shortcuts', enabled: enableKeyboardShortcuts, onToggle: (value: boolean) => updateSettings({ enableKeyboardShortcuts: value }), color: 'blue' },
            { icon: faAt, label: 'Highlight Mentions', sublabel: 'Highlight when mentioned', enabled: highlightMentions, onToggle: (value: boolean) => updateSettings({ highlightMentions: value }), color: 'cyan' },
            { icon: faSignInAlt, label: 'Join/Leave Messages', sublabel: 'Show user join/leave notifications', enabled: roomSettings.showJoinLeaveMessages, onToggle: (value: boolean) => updateRoomSetting({ showJoinLeaveMessages: value }), color: 'purple', visible: showRoomControls },
            { icon: faVolumeMute, label: 'Mute Room', sublabel: 'Disable notifications for this room', enabled: roomMemberSettings?.isMuted ?? false, onToggle: (value: boolean) => updateMemberSetting({ isMuted: value }), color: 'red', visible: !!roomId },
            { icon: faThumbtack, label: 'Pin Important Messages', sublabel: 'Allow pinning important messages', enabled: pinImportantMessages, onToggle: (value: boolean) => updateSettings({ pinImportantMessages: value }), color: 'yellow' },
          ].filter((item) => item.visible !== false).map((item) => (
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
            { icon: faUser, label: 'Show Avatars', sublabel: 'Display user profile pictures', enabled: showAvatars, onToggle: (value: boolean) => updateSettings({ showAvatars: value }), color: 'violet' },
            { icon: faTag, label: 'Show Usernames', sublabel: 'Display user display names', enabled: showUsernames, onToggle: (value: boolean) => updateSettings({ showUsernames: value }), color: 'blue' },
            { icon: faCrown, label: 'Show Roles', sublabel: 'Display user roles and badges', enabled: showRoles, onToggle: (value: boolean) => updateSettings({ showRoles: value }), color: 'yellow' },
            { icon: faMoon, label: 'Dark Mode', sublabel: 'Use dark theme', enabled: darkMode, onToggle: (value: boolean) => updateSettings({ darkMode: value }), color: 'slate' },
            { icon: faAdjust, label: 'High Contrast', sublabel: 'Increase color contrast', enabled: highContrastMode, onToggle: (value: boolean) => updateSettings({ highContrastMode: value }), color: 'orange' },
            { icon: faFont, label: 'Large Text', sublabel: 'Increase text size', enabled: largeText, onToggle: handleLargeTextToggle, color: 'green' },
            { icon: faPause, label: 'Reduce Animations', sublabel: 'Minimize motion effects', enabled: reduceAnimations, onToggle: handleReduceAnimationsToggle, color: 'gray' },
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
            { icon: faVolumeUp, label: 'Sound Enabled', sublabel: 'Play notification sounds', enabled: soundEnabled, onToggle: (value: boolean) => updateSettings({ soundEnabled: value }), color: 'rose' },
            { icon: faBell, label: 'Notification Sounds', sublabel: 'Sound for all notifications', enabled: notificationSound, onToggle: (value: boolean) => updateSettings({ notificationSound: value }), color: 'orange' },
            { icon: faAt, label: 'Mention Sounds', sublabel: 'Special sound for mentions', enabled: mentionSound, onToggle: (value: boolean) => updateSettings({ mentionSound: value }), color: 'cyan' },
            { icon: faComment, label: 'Message Sounds', sublabel: 'Sound for new messages', enabled: messageSound, onToggle: (value: boolean) => updateSettings({ messageSound: value }), color: 'blue' },
            { icon: faDesktop, label: 'Desktop Notifications', sublabel: 'Browser notification popups', enabled: desktopNotifications, onToggle: (value: boolean) => updateSettings({ desktopNotifications: value }), color: 'purple' },
            { icon: faClock, label: 'Quiet Hours', sublabel: 'Disable sounds during quiet hours', enabled: quietHours, onToggle: (value: boolean) => updateSettings({ quietHours: value }), color: 'indigo' },
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
              value={notificationPreference}
              onChange={(e) => {
                const value = e.target.value as any;
                updateSettings({ notificationFrequency: value });
                updateMemberSetting({ notificationPreference: value });
              }}
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
            { icon: faCloud, label: 'Export Chat History', sublabel: 'Allow exporting chat data', enabled: exportChatHistory, onToggle: (value: boolean) => updateSettings({ exportChatHistory: value }), color: 'amber' },
            { icon: faDatabase, label: 'Backup Settings', sublabel: 'Automatically backup preferences', enabled: backupSettings, onToggle: (value: boolean) => updateSettings({ backupSettings: value }), color: 'green' },
            { icon: faWifi, label: 'Data Sync', sublabel: 'Sync data across devices', enabled: dataSync, onToggle: (value: boolean) => updateSettings({ dataSync: value }), color: 'blue' },
            { icon: faBatteryHalf, label: 'Offline Mode', sublabel: 'Work without internet connection', enabled: offlineMode, onToggle: (value: boolean) => updateSettings({ offlineMode: value }), color: 'slate' },
            { icon: faBug, label: 'Debug Mode', sublabel: 'Enable debugging features', enabled: debugMode, onToggle: (value: boolean) => updateSettings({ debugMode: value }), color: 'red' },
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

      {showModerationControls && (
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
      )}
    </div>
  );
}

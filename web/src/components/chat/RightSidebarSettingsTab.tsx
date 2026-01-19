// RightSidebarSettingsTab Component - Settings tab
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette, faBell, faClock, faShieldHalved, faLock, faFingerprint,
  faUserSecret, faBan, faBolt, faRocket, faImages, faDownload,
  faRobot, faBrain, faCalendar, faFire, faSlidersH, faEye, faUser,
  faHashtag, faCheckCircle, faVolumeUp, faExclamationTriangle, faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useChatSettingsStore } from '../../store/chatSettingsStore';
import { useUserPreferences, useUpdateUserPreferences } from '../../hooks/useSettings';
import type { ChatTheme } from '@4space/shared/src/types/chatSettings';

interface RightSidebarSettingsTabProps {
  theme: ChatTheme;
}

export function RightSidebarSettingsTab({ theme }: RightSidebarSettingsTabProps) {
  const {
    showAvatars,
    showTimestamps,
    showReadReceipts,
    showLinkPreviews,
    formattingButtonsEnabled,
    messageAnimations,
    autoDeleteMessages,
    messageHistory,
    setShowAvatars,
    setShowTimestamps,
    setShowReadReceipts,
    setShowLinkPreviews,
    setFormattingButtonsEnabled,
    setMessageAnimations,
    setAutoDeleteMessages,
    setMessageHistory,
  } = useChatSettingsStore();

  // Settings hooks (only for user preferences)
  const { data: userPreferences } = useUserPreferences();
  const updateUserPreferences = useUpdateUserPreferences();

  const handleToggleShowAvatars = (enabled: boolean) => {
    setShowAvatars(enabled);
  };

  const handleToggleShowTimestamps = (enabled: boolean) => {
    setShowTimestamps(enabled);
  };

  const handleToggleShowReadReceipts = (enabled: boolean) => {
    setShowReadReceipts(enabled);
  };

  const handleToggleFormattingButtons = (enabled: boolean) => {
    setFormattingButtonsEnabled(enabled);
  };

  const handleToggleMessageAnimations = (enabled: boolean) => {
    setMessageAnimations(enabled);
  };

  const handleToggleShowLinkPreviews = (enabled: boolean) => {
    setShowLinkPreviews(enabled);
  };

  const handleAutoDeleteMessagesChange = (value: string) => {
    setAutoDeleteMessages(value as any);
  };

  const handleMessageHistoryChange = (value: string) => {
    setMessageHistory(value as any);
  };

  return (
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
            { icon: faEye, label: 'Show avatars', sublabel: 'Display profile pictures', enabled: showAvatars, color: 'green', setter: handleToggleShowAvatars },
            { icon: faClock, label: 'Show timestamps', sublabel: 'Display message times', enabled: showTimestamps, color: 'blue', setter: handleToggleShowTimestamps },
            { icon: faUser, label: 'Show usernames', sublabel: 'Display sender names', enabled: formattingButtonsEnabled, color: 'purple', setter: handleToggleFormattingButtons },
            { icon: faHashtag, label: 'Show message status', sublabel: 'Sent/read indicators', enabled: showReadReceipts, color: 'cyan', setter: handleToggleShowReadReceipts },
            { icon: faCheckCircle, label: 'Read receipts', sublabel: 'Show when messages are read', enabled: showReadReceipts, color: 'emerald', setter: handleToggleShowReadReceipts },
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
                onToggle={item.setter}
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
            { icon: faBell, label: 'Push notifications', sublabel: 'Browser notifications', enabled: showLinkPreviews, color: 'orange', setter: handleToggleShowLinkPreviews },
            { icon: faVolumeUp, label: 'Sound alerts', sublabel: 'Audio notifications', enabled: messageAnimations, color: 'red', setter: handleToggleMessageAnimations },
            { icon: faExclamationTriangle, label: 'Mention alerts', sublabel: '@ mentions highlight', enabled: showReadReceipts, color: 'yellow', setter: handleToggleShowReadReceipts },
            { icon: faMicrophone, label: 'Typing indicators', sublabel: 'Show typing status', enabled: showTimestamps, color: 'pink', setter: handleToggleShowTimestamps },
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
                onToggle={item.setter}
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
              value={autoDeleteMessages}
              onChange={(e) => handleAutoDeleteMessagesChange(e.target.value)}
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
              <FontAwesomeIcon icon={faClock} className="text-indigo-400 text-sm" />
              <div>
                <p className="text-sm text-white font-medium">Message retention</p>
                <p className="text-xs text-gray-500">Keep messages for limited time</p>
              </div>
            </div>
            <select
              value={messageHistory}
              onChange={(e) => handleMessageHistoryChange(e.target.value)}
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
            {
              icon: faEye,
              label: 'Read receipts',
              sublabel: 'Show when you read messages',
              enabled: userPreferences?.read_receipts ?? true,
              color: 'green',
              key: 'read_receipts'
            },
            {
              icon: faUserSecret,
              label: 'Ghost mode',
              sublabel: 'Hide online status',
              enabled: userPreferences?.ghost_mode ?? false,
              color: 'purple',
              key: 'ghost_mode'
            },
            {
              icon: faLock,
              label: 'End-to-end encryption',
              sublabel: 'Secure messaging',
              enabled: userPreferences?.end_to_end_encryption ?? true,
              color: 'green',
              key: 'end_to_end_encryption'
            },
            {
              icon: faFingerprint,
              label: 'Biometric unlock',
              sublabel: 'Fingerprint/Face ID',
              enabled: userPreferences?.biometric_unlock ?? false,
              color: 'blue',
              key: 'biometric_unlock'
            },
            {
              icon: faBan,
              label: 'Block strangers',
              sublabel: 'Only contacts can message',
              enabled: userPreferences?.block_strangers ?? false,
              color: 'red',
              key: 'block_strangers'
            },
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
                onToggle={(enabled) => updateUserPreferences.mutate({ [item.key]: enabled })}
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
            {
              icon: faRocket,
              label: 'Smooth animations',
              sublabel: 'Enhanced visual effects',
              enabled: userPreferences?.smooth_animations ?? true,
              color: 'cyan',
              key: 'smooth_animations'
            },
            {
              icon: faImages,
              label: 'Auto-load media',
              sublabel: 'Load images/videos',
              enabled: userPreferences?.auto_load_media ?? true,
              color: 'blue',
              key: 'auto_load_media'
            },
            {
              icon: faDownload,
              label: 'Auto-save files',
              sublabel: 'Download attachments',
              enabled: userPreferences?.auto_save_files ?? false,
              color: 'purple',
              key: 'auto_save_files'
            },
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
                onToggle={(enabled) => updateUserPreferences.mutate({ [item.key]: enabled })}
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
  );
}
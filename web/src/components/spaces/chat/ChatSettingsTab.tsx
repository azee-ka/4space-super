// Enhanced Chat Settings Tab with Privacy Controls - Clean Icon UI
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faCheck, faBell, faLock, faShield,
  faUserSecret, faDownload, faImage, faVideo, faMobileAlt,
  faFingerprint, faClipboard, faCog, faGlobe
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
    </div>
  );
}
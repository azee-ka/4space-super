// Enhanced Chat Settings Tab with Privacy Controls
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faEyeSlash, faCheck, faBell, faLock, faShield,
  faUserSecret, faDownload, faImage, faVideo, faMobileAlt,
  faFingerprint, faClipboard, faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { ToggleSwitch } from '../../ui/ToggleSwitch';
import { useChatSettingsStore } from '../../../store/chatSettingsStore';

interface ChatSettingsTabProps {
  roomId?: string;
}

export function ChatSettingsTab({ roomId }: ChatSettingsTabProps) {
  const {
    fontSize,
    setFontSize,
    messageDensity,
    setMessageDensity,
    applyToAllRooms,
    setApplyToAllRooms,
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
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Apply to All Rooms Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faGlobe} className="text-purple-400" />
              <div>
                <p className="text-sm font-medium text-white">Apply to All Rooms</p>
                <p className="text-xs text-gray-400 mt-0.5">Use these settings globally</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={applyToAllRooms}
              onToggle={setApplyToAllRooms}
            />
          </div>
        </motion.div>

        {/* Message Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <h3 className="text-sm font-bold text-white mb-4">Message Display</h3>
          
          {/* Font Size */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-400">Font Size</label>
              <span className="text-xs text-purple-400 font-medium">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="18"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Message Density */}
          <div>
            <label className="text-xs text-gray-400 block mb-2">Message Density</label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => setMessageDensity(density)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    messageDensity === density
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800'
                  }`}
                >
                  {density.charAt(0).toUpperCase() + density.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faLock} className="text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Privacy & Visibility</h3>
          </div>

          <div className="space-y-3">
            {/* Online Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} className="text-green-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Show Online Status</p>
                  <p className="text-xs text-gray-500">Others can see when you're online</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={showOnlineStatus}
                onToggle={setShowOnlineStatus}
              />
            </div>

            {/* Read Receipts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheck} className="text-blue-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Read Receipts</p>
                  <p className="text-xs text-gray-500">Show when you've read messages</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={showReadReceipts}
                onToggle={setShowReadReceipts}
              />
            </div>

            {/* Typing Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClipboard} className="text-cyan-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Typing Indicators</p>
                  <p className="text-xs text-gray-500">Show when you're typing</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={showTypingIndicator}
                onToggle={setShowTypingIndicator}
              />
            </div>

            {/* Last Seen */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUserSecret} className="text-purple-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Last Seen</p>
                  <p className="text-xs text-gray-500">Show your last active time</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={showLastSeen}
                onToggle={setShowLastSeen}
              />
            </div>

            {/* Profile Photo Visibility */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faImage} className="text-pink-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Profile Photo Visibility</p>
                  <p className="text-xs text-gray-500">Who can see your profile picture</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={showProfilePhoto}
                onToggle={setShowProfilePhoto}
              />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faBell} className="text-orange-400" />
            <h3 className="text-sm font-bold text-white">Notifications</h3>
          </div>

          <div className="space-y-3">
            {/* Message Preview */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Message Preview</p>
                <p className="text-xs text-gray-500">Show message content in notifications</p>
              </div>
              <ToggleSwitch
                enabled={messagePreviewInNotifications}
                onToggle={setMessagePreviewInNotifications}
              />
            </div>
          </div>
        </motion.div>

        {/* Media & Downloads */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faDownload} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Media & Downloads</h3>
          </div>

          <div className="space-y-3">
            {/* Auto-download media */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faImage} className="text-green-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Auto-Download Images</p>
                  <p className="text-xs text-gray-500">Automatically download photos</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={autoDownloadMedia}
                onToggle={setAutoDownloadMedia}
              />
            </div>

            {/* Auto-download videos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faVideo} className="text-blue-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Auto-Download Videos</p>
                  <p className="text-xs text-gray-500">Automatically download videos</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={autoDownloadVideos}
                onToggle={setAutoDownloadVideos}
              />
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faShield} className="text-red-400" />
            <h3 className="text-sm font-bold text-white">Security</h3>
          </div>

          <div className="space-y-3">
            {/* Message Deletion Rights */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Allow Message Deletion</p>
                <p className="text-xs text-gray-500">Let others delete their messages</p>
              </div>
              <ToggleSwitch
                enabled={allowMessageDeletion}
                onToggle={setAllowMessageDeletion}
              />
            </div>

            {/* Screen Security */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMobileAlt} className="text-red-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Screen Security</p>
                  <p className="text-xs text-gray-500">Prevent screenshots</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={screenSecurity}
                onToggle={setScreenSecurity}
              />
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFingerprint} className="text-purple-400 text-xs" />
                <div>
                  <p className="text-sm text-white">Two-Factor Auth</p>
                  <p className="text-xs text-gray-500">Extra security layer</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={twoFactorAuth}
                onToggle={setTwoFactorAuth}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

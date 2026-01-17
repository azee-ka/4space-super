// Advanced Room Settings Tab - Complete room management
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faShieldAlt, faUsers, faBell, faLock,
  faGlobe, faStar, faTrash, faEdit, faPlus,
  faHashtag, faVolumeUp, faVideo, faRocket,
  faBriefcase, faLightbulb, faGamepad, faMusic,
  faPalette, faCamera, faFileAlt, faLink
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useChatSettingsStore } from '../../../../store/chatSettingsStore';
import { ToggleSwitch } from '../../../ui/ToggleSwitch';
import { useRoomSettings, useUpdateRoomSettings } from '../../../../hooks/useSettings';
import { DEFAULT_ROOM_SETTINGS } from '@4space/shared/src/types/chatSettings';

interface RoomSettingsTabProps {
  selectedRoomId?: string;
  spaceId?: string;
  canManageRoomSettings?: boolean;
}

export function RoomSettingsTab({ selectedRoomId, spaceId, canManageRoomSettings = false }: RoomSettingsTabProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'privacy' | 'notifications' | 'categories' | 'moderation'>('general');
  const { theme } = useChatSettingsStore();

  const { data: roomSettingsData } = useRoomSettings(selectedRoomId);
  const updateRoomSettings = useUpdateRoomSettings();
  const roomSettings = roomSettingsData || DEFAULT_ROOM_SETTINGS;
  const isLocked = !selectedRoomId || !canManageRoomSettings;
  const lockedToggleProps = isLocked ? { disabled: true } : {};

  if (!canManageRoomSettings) {
    return null;
  }

  const sections = [
    { id: 'general', label: 'General', icon: faCog },
    { id: 'privacy', label: 'Privacy', icon: faShieldAlt },
    { id: 'notifications', label: 'Notifications', icon: faBell },
    { id: 'categories', label: 'Categories', icon: faHashtag },
    { id: 'moderation', label: 'Moderation', icon: faUsers }
  ];

  const updateSetting = (key: string, value: any) => {
    if (!selectedRoomId || isLocked) return;
    updateRoomSettings.mutate({
      roomId: selectedRoomId,
      updates: { [key]: value },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faCog} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Room Settings</h2>
            <p className="text-sm text-gray-400">Manage room behavior and permissions</p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex-shrink-0 p-4 border-b border-zinc-800/50">
        <div className="flex gap-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <FontAwesomeIcon icon={section.icon} className="mr-2" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Room Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Allow File Uploads</span>
                    <p className="text-xs text-gray-400">Members can share files and images</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.allowFileUploads}
                    onToggle={(value) => updateSetting('allowFileUploads', value)}
                    {...lockedToggleProps}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Voice Messages</span>
                    <p className="text-xs text-gray-400">Allow voice message recording</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.allowVoiceMessages}
                    onToggle={(value) => updateSetting('allowVoiceMessages', value)}
                    {...lockedToggleProps}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Polls & Voting</span>
                    <p className="text-xs text-gray-400">Members can create polls</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.allowPolls}
                    onToggle={(value) => updateSetting('allowPolls', value)}
                    {...lockedToggleProps}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Allow Bots</span>
                    <p className="text-xs text-gray-400">Bot accounts can join this room</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.allowBots}
                    onToggle={(value) => updateSetting('allowBots', value)}
                    {...lockedToggleProps}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white font-medium">Slow Mode (seconds)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={roomSettings.slowMode}
                    onChange={(e) => updateSetting('slowMode', parseInt(e.target.value) || 0)}
                    disabled={isLocked}
                    className={`w-full px-3 py-2 bg-zinc-800/70 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/70 focus:ring-1 focus:ring-purple-400/30 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  <p className="text-xs text-gray-400">Minimum time between messages (0 = disabled)</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Room Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Archive Room</span>
                    <p className="text-xs text-gray-400">Hide room from active list</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.isArchived}
                    onToggle={(value) => updateSetting('isArchived', value)}
                    {...lockedToggleProps}
                  />
                </div>

                <button
                  disabled={isLocked}
                  className={`w-full px-4 py-3 border rounded-lg text-red-400 text-sm font-medium transition-colors ${
                    isLocked
                      ? 'bg-red-600/10 border-red-500/20 opacity-60 cursor-not-allowed'
                      : 'bg-red-600/20 hover:bg-red-600/30 border-red-500/30'
                  }`}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete Room (Dangerous)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeSection === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Access Control</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Private Room</span>
                    <p className="text-xs text-gray-400">Only invited members can access</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.isPrivate}
                    onToggle={(value) => updateSetting('isPrivate', value)}
                    {...lockedToggleProps}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Require Approval</span>
                    <p className="text-xs text-gray-400">New members need approval to join</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.requireApproval}
                    onToggle={(value) => updateSetting('requireApproval', value)}
                    {...lockedToggleProps}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Allow Invites</span>
                    <p className="text-xs text-gray-400">Members can invite others</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.allowInvites}
                    onToggle={(value) => updateSetting('allowInvites', value)}
                    {...lockedToggleProps}
                  />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Member Limits</h3>
              <div className="space-y-2">
                <label className="text-sm text-white font-medium">Maximum Members</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={roomSettings.maxMembers}
                    onChange={(e) => updateSetting('maxMembers', parseInt(e.target.value) || 100)}
                    disabled={isLocked}
                    className={`w-full px-3 py-2 bg-zinc-800/70 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/70 focus:ring-1 focus:ring-purple-400/30 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                <p className="text-xs text-gray-400">Set to 0 for unlimited members</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Notification Settings</h3>
              <p className="text-sm text-gray-400 mb-4">
                Configure how members receive notifications for this room.
                These settings override individual user preferences.
              </p>

              <div className="space-y-4">
                <div className="p-3 bg-zinc-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">@everyone mentions</span>
                    <span className="text-xs text-green-400">Always notify</span>
                  </div>
                  <p className="text-xs text-gray-400">Critical announcements that affect all members</p>
                </div>

                <div className="p-3 bg-zinc-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">@role mentions</span>
                    <span className="text-xs text-yellow-400">Role-based</span>
                  </div>
                  <p className="text-xs text-gray-400">Mentions of specific roles (admin, moderator, etc.)</p>
                </div>

                <div className="p-3 bg-zinc-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">Direct replies</span>
                    <span className="text-xs text-blue-400">Smart notify</span>
                  </div>
                  <p className="text-xs text-gray-400">Replies to your messages and threads</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Management */}
        {activeSection === 'categories' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Room Categories</h3>
                <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs font-medium transition-colors">
                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                  Add Category
                </button>
              </div>

              <div className="space-y-3">
                {['General', 'Meetings', 'Projects', 'Ideas', 'Gaming'].map((category) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <FontAwesomeIcon icon={faHashtag} className="text-purple-400 text-sm" />
                      </div>
                      <span className="text-sm text-white font-medium">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Category Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Auto-sort rooms</span>
                    <p className="text-xs text-gray-400">Automatically organize rooms by activity</p>
                  </div>
                  <ToggleSwitch enabled={true} onToggle={() => {}} disabled={isLocked} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Show empty categories</span>
                    <p className="text-xs text-gray-400">Display categories even when empty</p>
                  </div>
                  <ToggleSwitch enabled={false} onToggle={() => {}} disabled={isLocked} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Moderation */}
        {activeSection === 'moderation' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Moderation Level</h3>
              <div className="space-y-3">
                {[
                  { level: 'Low', desc: 'Basic spam protection', color: 'green' },
                  { level: 'Medium', desc: 'Content filtering enabled', color: 'yellow' },
                  { level: 'High', desc: 'Strict moderation required', color: 'red' },
                  { level: 'Extreme', desc: 'Maximum security filters', color: 'red' }
                ].map((option) => (
                  <button
                    key={option.level}
                    onClick={() => {
                      if (!isLocked) {
                        updateSetting('moderationLevel', option.level.toLowerCase());
                      }
                    }}
                    disabled={isLocked}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      roomSettings.moderationLevel === option.level.toLowerCase()
                        ? `bg-${option.color}-500/20 border-${option.color}-500/50`
                        : 'bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-white font-medium">{option.level}</span>
                        <p className="text-xs text-gray-400 mt-1">{option.desc}</p>
                      </div>
                      {roomSettings.moderationLevel === option.level.toLowerCase() && (
                        <div className={`w-3 h-3 rounded-full bg-${option.color}-400`}></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4">Auto-Moderation</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Spam Detection</span>
                    <p className="text-xs text-gray-400">Automatically flag suspicious messages</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.autoModeration.spamDetection}
                    onToggle={(value) => updateSetting('autoModeration', { ...roomSettings.autoModeration, spamDetection: value })}
                    disabled={isLocked}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Link Filtering</span>
                    <p className="text-xs text-gray-400">Block suspicious or harmful links</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.autoModeration.linkFiltering}
                    onToggle={(value) => updateSetting('autoModeration', { ...roomSettings.autoModeration, linkFiltering: value })}
                    disabled={isLocked}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white font-medium">Image Moderation</span>
                    <p className="text-xs text-gray-400">Scan uploaded images for content</p>
                  </div>
                  <ToggleSwitch
                    enabled={roomSettings.autoModeration.imageModeration}
                    onToggle={(value) => updateSetting('autoModeration', { ...roomSettings.autoModeration, imageModeration: value })}
                    disabled={isLocked}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

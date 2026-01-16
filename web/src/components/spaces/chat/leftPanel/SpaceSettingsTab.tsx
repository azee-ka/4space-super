// Space-Wide Settings for Left Sidebar - General settings that apply to all rooms
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faShieldAlt, faUsers, faBell, faGlobe,
  faUserFriends, faVolumeUp, faEye, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useChatSettingsStore } from '../../../../store/chatSettingsStore';
import { ToggleSwitch } from '../../../ui/ToggleSwitch';

interface SpaceSettingsTabProps {
  onBack?: () => void;
}

export function SpaceSettingsTab({ onBack }: SpaceSettingsTabProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'privacy' | 'notifications' | 'members'>('general');
  const { theme } = useChatSettingsStore();

  // Mock space settings - in real app these would come from the database
  const [spaceSettings, setSpaceSettings] = useState({
    allowPublicRooms: true,
    requireRoomApproval: false,
    defaultRoomPrivacy: 'public',
    memberInvites: true,
    guestAccess: false,
    notificationDefaults: 'all',
    moderationLevel: 'medium'
  });

  const sections = [
    { id: 'general', label: 'General', icon: faCog },
    { id: 'privacy', label: 'Privacy', icon: faShieldAlt },
    { id: 'notifications', label: 'Notifications', icon: faBell },
    { id: 'members', label: 'Members', icon: faUsers }
  ];

  const updateSetting = (key: string, value: any) => {
    setSpaceSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-80 max-h-96 overflow-hidden bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white">Room Settings</h3>
            <p className="text-xs text-gray-400">Configure this room</p>
          </div>
        </div>
      </div>

      {/* Section Tabs - Compact */}
      <div className="p-3 border-b border-zinc-700/30">
        <div className="flex gap-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-all flex-1 ${
                activeSection === section.id
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
              }`}
            >
              <FontAwesomeIcon icon={section.icon} className="mr-1.5 text-xs" />
              <span className="truncate">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Compact */}
      <div className="max-h-64 overflow-y-auto custom-scrollbar p-3">
        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Public Rooms</span>
              <ToggleSwitch
                enabled={spaceSettings.allowPublicRooms}
                onToggle={(value) => updateSetting('allowPublicRooms', value)}
                accentColor={theme.accentColor}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Room Approval</span>
              <ToggleSwitch
                enabled={spaceSettings.requireRoomApproval}
                onToggle={(value) => updateSetting('requireRoomApproval', value)}
                accentColor={theme.accentColor}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Member Invites</span>
              <ToggleSwitch
                enabled={spaceSettings.memberInvites}
                onToggle={(value) => updateSetting('memberInvites', value)}
                accentColor={theme.accentColor}
              />
            </div>

            <div className="pt-2 border-t border-zinc-700/50">
              <label className="text-xs text-gray-400 block mb-2">Default Room Privacy</label>
              <select
                value={spaceSettings.defaultRoomPrivacy}
                onChange={(e) => updateSetting('defaultRoomPrivacy', e.target.value)}
                className="w-full px-2 py-1.5 bg-zinc-800/70 border border-zinc-600/50 rounded text-white text-xs focus:outline-none focus:border-purple-400/70"
              >
                <option value="public">Public - Anyone can join</option>
                <option value="private">Private - Invite only</option>
                <option value="hidden">Hidden - Members only</option>
              </select>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeSection === 'privacy' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Guest Access</span>
              <ToggleSwitch
                enabled={spaceSettings.guestAccess}
                onToggle={(value) => updateSetting('guestAccess', value)}
                accentColor={theme.accentColor}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Public Visibility</span>
              <ToggleSwitch
                enabled={true}
                onToggle={() => {}}
                accentColor={theme.accentColor}
              />
            </div>

            <div className="text-xs text-gray-400">
              Control who can discover and access this space
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 mb-3">
              Default notification settings for all rooms
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">@mentions</span>
              <span className="text-xs text-green-400">Always</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">New Messages</span>
              <span className="text-xs text-blue-400">Smart</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Room Activity</span>
              <span className="text-xs text-yellow-400">Muted</span>
            </div>
          </div>
        )}

        {/* Members */}
        {activeSection === 'members' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 mb-3">
              Manage member permissions and roles
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Auto-approve Members</span>
              <ToggleSwitch
                enabled={true}
                onToggle={() => {}}
                accentColor={theme.accentColor}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white font-medium">Member Directory</span>
              <ToggleSwitch
                enabled={true}
                onToggle={() => {}}
                accentColor={theme.accentColor}
              />
            </div>

            <div className="pt-2 border-t border-zinc-700/50">
              <button className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-colors">
                <FontAwesomeIcon icon={faUserFriends} className="mr-1.5" />
                Manage Members
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
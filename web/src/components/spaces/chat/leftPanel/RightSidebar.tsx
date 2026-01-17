import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSlidersH, faImages, faLink, faHashtag, faPalette, faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { ChatSettingsTab } from '../rightPanel/ChatSettingsTab';
import { RoomMetadataTab } from '../rightPanel/RoomMetadataTab';
import { RoomMetrics } from '../rightPanel/RoomMetrics';
import { MediaTab } from '../rightPanel/MediaTab';
import { LinksTab } from '../rightPanel/LinksTab';
import { CustomizationTab } from '../rightPanel/CustomizationTab';

type RightSidebarTab = 'settings' | 'metadata' | 'metrics' | 'media' | 'links' | 'customization';

interface RightSidebarProps {
  activeTab: RightSidebarTab;
  onTabChange: (tab: RightSidebarTab) => void;
  theme: any;
  onThemeChange: (theme: any, roomId?: string, category?: string) => void;
  messages: any[];
  roomMembers: any[];
  onlineUsers: Map<string, any>;
  selectedRoom: any;
  selectedRoomId?: string;
  spaceId: string;
  canManageRoomSettings?: boolean;
  canModerateRoom?: boolean;
  getAccentFocusClass: (accentColor: string) => string;
}

export function RightSidebar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  messages,
  roomMembers,
  onlineUsers,
  selectedRoom,
  selectedRoomId,
  spaceId,
  canManageRoomSettings = false,
  canModerateRoom = false,
  getAccentFocusClass,
}: RightSidebarProps) {
  const roomCategory = selectedRoom?.category || 'General';
  const tabs: Array<{ id: RightSidebarTab; icon: any; label: string; color: string }> = [
    { id: 'metrics', icon: faChartLine, label: 'Metrics', color: 'orange' },
    { id: 'media', icon: faImages, label: 'Media', color: 'green' },
    { id: 'links', icon: faLink, label: 'Links', color: 'blue' },
    { id: 'metadata', icon: faHashtag, label: 'Room Info', color: 'pink' },
    { id: 'customization', icon: faPalette, label: 'Theme', color: 'purple' },
    { id: 'settings', icon: faSlidersH, label: 'Settings', color: 'cyan' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Horizontal Tabs - Fixed Overflow */}
      <div className="flex-shrink-0 pb-0 pt-0 pl-4 pr-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pl-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500/10 text-${tab.color}-400`
                  : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg bg-${tab.color}-500/10 flex items-center justify-center`}>
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`text-xs ${
                    activeTab === tab.id
                      ? `text-${tab.color}-400`
                      : 'text-gray-500'
                  }`}
                />
              </div>
              <span className="whitespace-nowrap text-xs">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {activeTab === 'settings' && (
            <ChatSettingsTab
              roomId={selectedRoomId}
              canManageRoomSettings={canManageRoomSettings}
              canModerateRoom={canModerateRoom}
              getAccentFocusClass={getAccentFocusClass}
            />
          )}
          {activeTab === 'metadata' && (
            <RoomMetadataTab
              room={selectedRoom}
              memberCount={roomMembers.length}
              messageCount={messages.length}
              onUpdateRoom={(updates) => {
                console.log('Update room:', updates);
              }}
              canManageRoomSettings={canManageRoomSettings}
            />
          )}
          {activeTab === 'metrics' && (
            <RoomMetrics
              messageCount={selectedRoom?.message_count || messages.length}
              memberCount={roomMembers.length}
              onlineCount={onlineUsers.size}
              messages={messages}
              roomMembers={roomMembers}
              onlineUsers={onlineUsers}
              selectedRoom={selectedRoom}
            />
          )}
          {activeTab === 'media' && <MediaTab />}
          {activeTab === 'links' && <LinksTab />}
          {activeTab === 'customization' && (
            <CustomizationTab theme={theme} onThemeChange={onThemeChange} roomId={selectedRoomId} roomCategory={roomCategory} />
          )}
        </div>
      </div>
    </div>
  );
}

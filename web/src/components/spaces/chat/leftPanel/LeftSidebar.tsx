import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faHashtag, faRocket,
  faCog, faChartLine, faTasks, faClock, faStickyNote, faPalette,
  faSlidersH, faImages, faLink,
  faBolt, faCalendar, faFire, faBrain, faPhone, faVideo,
  faUsers, faThumbtack, faSearch,
  faFilter, faTimes, faExclamationTriangle, faEdit, faTrash, faPlus,
  faImage, faPoll, faRobot, faKey, faLock, faMicrophone, faUserCheck,
  faComments, faEnvelope,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomsList } from './RoomList';
import { ToggleSwitch } from '../../../ui/ToggleSwitch';
import { MetricsTab } from './MetricsTab';
import { ProductivityTab } from './ProductivityTab';
import { RemindersTab } from './RemindersTab';
import { NotesTab } from './NotesTab';

type LeftSidebarTab = 'rooms' | 'metrics' | 'productivity' | 'reminders' | 'notes';

interface LeftSidebarProps {
  spaceId: string;
  space: any;
  rooms: any[];
  selectedRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: (name: string, description?: string) => void;
  activeTab: LeftSidebarTab;
  onTabChange: (tab: LeftSidebarTab) => void;
  isLoading: boolean;
  onlineUsers: Map<string, any>;
  onOpenSettings?: () => void;
  onOpenCreateRoomModal?: () => void;
  showGeneralSettings?: boolean;
  categories?: Array<{ id: string; name: string; icon: string; color: string; description: string }>;
  onCategoriesChange?: (categories: Array<{ id: string; name: string; icon: string; color: string; description: string }>) => void;
  theme: any;
  getAccentFocusClass: (accentColor: string) => string;
}

export function LeftSidebar({
  spaceId: _spaceId,
  space: _space,
  rooms,
  selectedRoomId,
  onSelectRoom,
  onCreateRoom,
  activeTab: _activeTab,
  onTabChange: _onTabChange,
  isLoading,
  onlineUsers,
  onOpenSettings,
  onOpenCreateRoomModal,
  showGeneralSettings = false,
  categories = [],
  onCategoriesChange,
  theme,
  getAccentFocusClass,
}: LeftSidebarProps) {
  const [openUtility, setOpenUtility] = useState<Exclude<LeftSidebarTab, 'rooms'> | null>(null);
  const [filterUnread, setFilterUnread] = useState(false); // Add this state
  const dropdownRef = useRef<HTMLDivElement>(null);

  const utilityTabs: Array<{ id: Exclude<LeftSidebarTab, 'rooms'>; icon: any; label: string; color: string }> = [
    { id: 'metrics', icon: faChartLine, label: 'Metrics', color: 'purple' },
    { id: 'productivity', icon: faBolt, label: 'Actions', color: 'yellow' },
    { id: 'reminders', icon: faClock, label: 'Reminders', color: 'orange' },
    { id: 'notes', icon: faStickyNote, label: 'Notes', color: 'green' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenUtility(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUtilityClick = (tabId: Exclude<LeftSidebarTab, 'rooms'>) => {
    setOpenUtility(openUtility === tabId ? null : tabId);
  };

  return (
    <div className="h-full flex flex-col" ref={dropdownRef}>
      {/* Main Content Area - Takes Most Space */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {showGeneralSettings ? (
          /* General Settings View */
          <div className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faCog} className="text-cyan-400" />
                  General Settings
                </h2>

                <button
                  onClick={() => onOpenSettings?.()}
                  className="w-7 h-7 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                  title="Back to Rooms"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {/* Space Categories Management */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faHashtag} className="text-violet-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Space Categories</h3>
                </div>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${category.color}-500/20 flex items-center justify-center`}>
                          <FontAwesomeIcon icon={faHashtag} className={`text-${category.color}-400 text-sm`} />
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium">{category.name}</span>
                          <p className="text-xs text-gray-400">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                          <FontAwesomeIcon icon={faEdit} className="text-xs" />
                        </button>
                        <button
                          onClick={() => onCategoriesChange?.(categories.filter(cat => cat.id !== category.id))}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newCategory = {
                        id: Date.now().toString(),
                        name: 'New Category',
                        icon: 'faHashtag',
                        color: 'gray',
                        description: 'New category description'
                      };
                      onCategoriesChange?.([...categories, newCategory]);
                    }}
                    className={`w-full p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg text-gray-400 hover:text-white transition-colors border-2 border-dashed border-zinc-600/50 hover:border-${theme.accentColor}-400/50`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Category
                  </button>
                </div>
              </div>

              {/* Default Room Settings */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCog} className="text-cyan-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Default Room Settings</h3>
                </div>

                <div className="space-y-4">
                  {/* Privacy & Access */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faLock} className="text-red-400 text-xs" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Privacy & Access</h4>
                    </div>
                    {[
                      { icon: faLock, label: 'Private by Default', sublabel: 'New rooms are private', enabled: true, onToggle: () => {}, color: 'red' },
                      { icon: faUserCheck, label: 'Require Approval', sublabel: 'New members need approval', enabled: false, onToggle: () => {}, color: 'yellow' },
                      { icon: faEnvelope, label: 'Require Email', sublabel: 'Members must have verified email', enabled: false, onToggle: () => {}, color: 'emerald' },
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

                  {/* Default Room Configuration */}
                  <div className="space-y-3">
                    {/* Default Slow Mode Input */}
                    <div className="p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5 mb-2">
                        <FontAwesomeIcon icon={faClock} className="text-indigo-400 text-sm" />
                        <span className="text-sm text-white font-medium">Default Slow Mode</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        defaultValue="0"
                        className={`w-full px-3 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none ${getAccentFocusClass(theme.accentColor)}`}
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default slow mode for new rooms (seconds)</p>
                    </div>

                    {/* Default Max Members Input */}
                    <div className="p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5 mb-2">
                        <FontAwesomeIcon icon={faUsers} className="text-teal-400 text-sm" />
                        <span className="text-sm text-white font-medium">Default Max Members</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        defaultValue="100"
                        className={`w-full px-3 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none ${getAccentFocusClass(theme.accentColor)}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">Default member limit for new rooms</p>
                    </div>

                    {/* Default Moderation Level Select */}
                    <div className="p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5 mb-2">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-rose-400 text-sm" />
                        <span className="text-sm text-white font-medium">Default Moderation</span>
                      </div>
                      <select
                        defaultValue="medium"
                        className={`w-full px-3 py-2 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none ${getAccentFocusClass(theme.accentColor)}`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="extreme">Extreme</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Default moderation level for new rooms</p>
                    </div>
                  </div>

                  {/* Content & Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faImage} className="text-green-400 text-xs" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Content & Features</h4>
                    </div>
                    {[
                      { icon: faImage, label: 'Allow File Uploads', sublabel: 'New rooms allow file sharing', enabled: true, onToggle: () => {}, color: 'green' },
                      { icon: faMicrophone, label: 'Voice Messages', sublabel: 'New rooms allow voice messages', enabled: true, onToggle: () => {}, color: 'cyan' },
                      { icon: faPoll, label: 'Polls & Voting', sublabel: 'New rooms allow polls', enabled: true, onToggle: () => {}, color: 'purple' },
                      { icon: faComments, label: 'Allow Threads', sublabel: 'Enable threaded conversations', enabled: true, onToggle: () => {}, color: 'blue' },
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

                  {/* Moderation & Limits */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faRobot} className="text-orange-400 text-xs" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Moderation & Limits</h4>
                    </div>
                    {[
                      { icon: faRobot, label: 'Allow Bots', sublabel: 'New rooms allow bots', enabled: false, onToggle: () => {}, color: 'orange' },
                      { icon: faClock, label: 'Slow Mode', sublabel: 'Limit message frequency', enabled: false, onToggle: () => {}, color: 'indigo' },
                      { icon: faUsers, label: 'Member Limits', sublabel: 'Set maximum members', enabled: true, onToggle: () => {}, color: 'teal' },
                      { icon: faTrash, label: 'Auto-delete Messages', sublabel: 'Automatically delete old messages', enabled: false, onToggle: () => {}, color: 'rose' },
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

              {/* Space Features */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faRocket} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Space Features</h3>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faUsers, label: 'Voice Channels', sublabel: 'Enable voice communication', enabled: true, color: 'cyan' },
                    { icon: faVideo, label: 'Video Calls', sublabel: 'Allow video conferencing', enabled: true, color: 'red' },
                    { icon: faImage, label: 'File Sharing', sublabel: 'Allow file uploads globally', enabled: true, color: 'green' },
                    { icon: faPoll, label: 'Polls & Voting', sublabel: 'Enable polls across the space', enabled: true, color: 'purple' },
                    { icon: faRobot, label: 'Bot Integration', sublabel: 'Allow bot accounts', enabled: false, color: 'orange' },
                    { icon: faKey, label: 'API Integrations', sublabel: 'Enable third-party integrations', enabled: false, color: 'blue' },
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
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Rooms Section */
          <>
            <div className="px-5 py-4 border-b border-zinc-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faHashtag} className="text-cyan-400" />
                  Rooms
                </h2>

                <div className="flex items-center gap-1.5">
                  {/* Filter Unread Button */}
                  <button
                    onClick={() => setFilterUnread(!filterUnread)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      filterUnread
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800/70'
                    }`}
                    title={filterUnread ? 'Showing Unread Only' : 'Show All Rooms'}
                  >
                    <FontAwesomeIcon icon={faFilter} className="text-xs" />
                  </button>

                  {/* Settings Button */}
                  <button
                    onClick={() => onOpenSettings?.()}
                    className="w-7 h-7 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                    title="General Settings"
                  >
                    <FontAwesomeIcon icon={faCog} className="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <RoomsList
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={onSelectRoom}
                spaceId={_spaceId}
                onlineUsers={onlineUsers}
                spaceCategories={categories}
                onCreateRoom={() => onOpenCreateRoomModal?.()}
              />
            </div>
          </>
        )}
      </div>

      {/* Utility Tabs - Horizontal at Bottom */}
      <div className="flex-shrink-0 border-t border-zinc-800/50">
        {/* Dropdown Content - Opens Above Tabs */}
        <AnimatePresence>
          {openUtility && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-zinc-900/50 border-b border-zinc-800/50"
            >
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {openUtility === 'metrics' && <MetricsTab onlineUsers={onlineUsers} />}
                {openUtility === 'productivity' && <ProductivityTab spaceId={_spaceId} />}
                {openUtility === 'reminders' && <RemindersTab />}
                {openUtility === 'notes' && <NotesTab />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Horizontal Tab Bar */}
        <div className="p-3 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pl-1">
            {utilityTabs.map((tab) => {
              const isOpen = openUtility === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleUtilityClick(tab.id)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium text-sm transition-all ${
                    isOpen
                      ? `bg-${tab.color}-500/10 text-${tab.color}-400`
                      : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-${tab.color}-500/10 flex items-center justify-center`}>
                    <FontAwesomeIcon
                      icon={tab.icon}
                      className={`text-xs ${
                        isOpen
                          ? `text-${tab.color}-400`
                          : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
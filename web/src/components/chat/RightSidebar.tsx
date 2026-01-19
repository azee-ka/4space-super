// RightSidebar Component - Dynamic tab rendering
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSave, faPalette, faCog, faTimes } from '@fortawesome/free-solid-svg-icons';
import { RightSidebarHomeTab } from './RightSidebarHomeTab';
import { RightSidebarSavedTab } from './RightSidebarSavedTab';
import { RightSidebarSettingsTab } from './RightSidebarSettingsTab';
import { RightSidebarThemeTab } from './RightSidebarThemeTab';
import type { ChatTheme } from '@4space/shared/src/types/chatSettings';

type RightSidebarTab = 'home' | 'saved' | 'theme' | 'settings';
type HomeSubTab = 'metrics' | 'media' | 'links' | 'kept' | 'pinned';

interface Message {
  id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  name?: string;
  participants?: Array<{
    user_id: string;
    user?: {
      display_name?: string;
      username?: string;
    };
  }>;
  last_message?: {
    content: string;
  };
  last_message_at?: string;
  updated_at?: string;
  created_at?: string;
}

interface RightSidebarProps {
  activeTab: RightSidebarTab;
  onTabChange: (tab: RightSidebarTab) => void;
  theme: ChatTheme;
  onThemeChange: (theme: ChatTheme, roomId?: string, category?: string) => void;
  messages: Message[];
  selectedConversation?: Conversation;
  mediaItems: any[];
  linkItems: any[];
  showTopButtons?: boolean;
  onClose?: () => void;
}

export function RightSidebar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  messages,
  selectedConversation,
  mediaItems,
  linkItems,
  showTopButtons = false,
  onClose,
}: RightSidebarProps) {
  // State for home sub-tab
  const [activeHomeSubTab, setActiveHomeSubTab] = useState<HomeSubTab>('metrics');

  const tabs: Array<{ id: RightSidebarTab; icon: any; label: string; color: string }> = [
    { id: 'home', icon: faHome, label: 'Home', color: 'emerald' },
    { id: 'saved', icon: faSave, label: 'Saved', color: 'amber' },
    { id: 'theme', icon: faPalette, label: 'Theme', color: 'violet' },
    { id: 'settings', icon: faCog, label: 'Settings', color: 'cyan' },
  ];

  // Dynamic component renderer
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <RightSidebarHomeTab
            key="home"
            activeSubTab={activeHomeSubTab}
            onSubTabChange={setActiveHomeSubTab}
            messages={messages}
            selectedConversation={selectedConversation}
            mediaItems={mediaItems}
            linkItems={linkItems}
          />
        );
      case 'saved':
        return <RightSidebarSavedTab key="saved" />;
      case 'theme':
        return (
          <RightSidebarThemeTab
            key="theme"
            theme={theme}
            onThemeChange={onThemeChange}
          />
        );
      case 'settings':
        return <RightSidebarSettingsTab key="settings" theme={theme} />;
      default:
        return (
          <RightSidebarHomeTab
            key="home-default"
            activeSubTab={activeHomeSubTab}
            onSubTabChange={setActiveHomeSubTab}
            messages={messages}
            selectedConversation={selectedConversation}
            mediaItems={mediaItems}
            linkItems={linkItems}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col w-80">
      {/* Top Action Buttons */}
      {showTopButtons && (
        <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tabs.slice(0, 4).map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-500/10 text-${tab.color}-400`
                      : 'bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                  title={tab.label}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-sm" />
                </motion.button>
              ))}
            </div>
            {onClose && (
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close Panel"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </motion.button>
            )}
          </div>
        </div>
      )}


      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

// RightSidebarThemeTab Component - Theme/Customization tab for General Chat
import { RightSidebarCustomizationTab } from './RightSidebarCustomizationTab';
import type { ChatTheme } from '@4space/shared/src/types/chatSettings';

interface RightSidebarThemeTabProps {
  theme: ChatTheme;
  onThemeChange: (theme: ChatTheme, roomId?: string, category?: string) => void;
}

export function RightSidebarThemeTab({ theme, onThemeChange }: RightSidebarThemeTabProps) {
  return (
    <div className="p-4">
      <h2 className="text-white text-xl font-bold">THEME TAB</h2>
      <p className="text-gray-400">This is the theme customization tab</p>
      <div className="mt-4 p-4 bg-purple-500/20 rounded-lg">
        <p className="text-purple-300">Theme: {theme?.name || 'Default'}</p>
      </div>
    </div>
  );
}
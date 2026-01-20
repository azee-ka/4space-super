// RightSidebarThemeTab Component - Theme/Customization tab for General Chat
import { RightSidebarCustomizationTab } from './RightSidebarCustomizationTab';
import type { ChatTheme } from '@4space/shared/src/types/chatSettings';

interface RightSidebarThemeTabProps {
  theme: ChatTheme;
  onThemeChange: (theme: ChatTheme, roomId?: string, category?: string) => void;
}

export function RightSidebarThemeTab({ theme, onThemeChange }: RightSidebarThemeTabProps) {
  return (
    <RightSidebarCustomizationTab
      theme={theme}
      onThemeChange={onThemeChange}
    />
  );
}
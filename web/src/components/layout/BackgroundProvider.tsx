// web/src/components/layout/BackgroundProvider.tsx
// Global background provider that applies display settings
// Uses current settings (includes preview) for live preview
// Preview settings are NOT persisted - they'll be lost on page reload unless saved

import { useEffect } from 'react';
import { useDisplaySettingsStore } from '../../store/displaySettingsStore';

interface BackgroundProviderProps {
  children: React.ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  // Get current settings (includes preview) for live preview
  // Preview settings are NOT persisted - they'll be lost on page reload unless saved
  const { getBackgroundStyle, getFilterStyle, getCurrentSettings } = useDisplaySettingsStore();

  // Get current settings (includes preview) to trigger re-render on any change
  const currentSettings = getCurrentSettings();

  useEffect(() => {
    const backgroundStyle = getBackgroundStyle();
    const filterStyle = getFilterStyle();

    // Force remove any CSS class backgrounds first
    document.body.classList.remove('gradient-bg');

    // Always start with black background
    document.body.style.backgroundColor = '#000000';
    document.body.style.backgroundImage = 'none';

    // Overlay gradient on top of black background
    if (backgroundStyle.background && currentSettings.backgroundType !== 'solid' && currentSettings.backgroundType !== 'none') {
      // Use background-image for gradient, background-color for black base
      document.body.style.backgroundImage = backgroundStyle.background as string;
      document.body.style.backgroundColor = '#000000';
    } else if (currentSettings.backgroundType === 'solid') {
      // For solid colors, use the solid color directly
      document.body.style.backgroundColor = currentSettings.solidColor;
      document.body.style.backgroundImage = 'none';
    } else {
      // For 'none' type, just black background
      document.body.style.backgroundColor = '#000000';
      document.body.style.backgroundImage = 'none';
    }

    // Apply filters to body
    if (filterStyle.filter) {
      document.body.style.filter = filterStyle.filter as string;
    } else {
      document.body.style.filter = '';
    }

    // Ensure body takes full height and overrides any CSS
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    // Cleanup function - no cleanup needed since we want styles to persist
  }, [currentSettings, getBackgroundStyle, getFilterStyle]);

  return <>{children}</>;
}

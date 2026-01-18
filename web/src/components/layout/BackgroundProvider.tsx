// web/src/components/layout/BackgroundProvider.tsx
// Global background provider that applies display settings

import { useEffect } from 'react';
import { useDisplaySettingsStore } from '../../store/displaySettingsStore';

interface BackgroundProviderProps {
  children: React.ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  // Get the store instance to check for preview settings
  const store = useDisplaySettingsStore();

  // Subscribe to preview state changes
  const hasUnsavedChanges = store.hasUnsavedChanges;

  // Get current settings (includes preview)
  const currentSettings = store.getCurrentSettings();

  const { getBackgroundStyle, getFilterStyle } = useDisplaySettingsStore();

  useEffect(() => {
    const backgroundStyle = getBackgroundStyle();
    const filterStyle = getFilterStyle();

    console.log('Display settings changed:', {
      hasUnsavedChanges,
      currentSettings,
      backgroundStyle,
      filterStyle
    });

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

    console.log('Final body styles:', {
      background: document.body.style.background,
      backgroundColor: document.body.style.backgroundColor,
      filter: document.body.style.filter
    });

    // Cleanup function - no cleanup needed since we want styles to persist
  }, [hasUnsavedChanges, currentSettings, getBackgroundStyle, getFilterStyle]);

  return <>{children}</>;
}
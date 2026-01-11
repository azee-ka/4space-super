// web/src/store/themeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@4space/shared/src/utils/logger';
import { getTheme, setTheme as setThemeLocal } from '../lib/theme';

/**
 * Theme state store with persistence
 * Manages light/dark mode across the application
 */

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getTheme(),

      toggleTheme: () => {
        set((state) => {
          const newTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
          
          logger.debug('Theme toggled', { 
            component: 'themeStore',
            from: state.theme,
            to: newTheme,
          });

          setThemeLocal(newTheme);
          return { theme: newTheme };
        });
      },

      setTheme: (theme: Theme) => {
        logger.debug('Theme set', { 
          component: 'themeStore',
          theme,
        });

        setThemeLocal(theme);
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
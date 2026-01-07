import { create } from 'zustand';
import { getTheme, setTheme as setThemeLocal } from '../lib/theme';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getTheme(),
  
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      setThemeLocal(newTheme);
      return { theme: newTheme };
    });
  },
  
  setTheme: (theme) => {
    setThemeLocal(theme);
    set({ theme });
  },
}));

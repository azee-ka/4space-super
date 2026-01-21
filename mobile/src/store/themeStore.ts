import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AccentColor =
  | 'cyan'
  | 'pink'
  | 'green'
  | 'amber'
  | 'purple'
  | 'orange'
  | 'blue'
  | 'red'
  | 'fuchsia';

interface ThemeState {
  accentColor: AccentColor;
  setAccentColor: (accentColor: AccentColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      accentColor: 'cyan',
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    {
      name: 'theme-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

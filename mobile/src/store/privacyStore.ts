import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PrivacyVisibility = 'everyone' | 'contacts' | 'contacts_except' | 'nobody';

interface PrivacyState {
  lastSeenVisibility: PrivacyVisibility;
  onlineVisibility: PrivacyVisibility;
  excludedContactIds: string[];
  setLastSeenVisibility: (value: PrivacyVisibility) => void;
  setOnlineVisibility: (value: PrivacyVisibility) => void;
  setExcludedContactIds: (ids: string[]) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      lastSeenVisibility: 'everyone',
      onlineVisibility: 'everyone',
      excludedContactIds: [],
      setLastSeenVisibility: (value) => set({ lastSeenVisibility: value }),
      setOnlineVisibility: (value) => set({ onlineVisibility: value }),
      setExcludedContactIds: (ids) => set({ excludedContactIds: ids }),
    }),
    {
      name: 'privacy-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

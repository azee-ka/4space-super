import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatBackgroundId } from '../styles/chatBackgrounds';

interface ChatBackgroundState {
  backgroundId: ChatBackgroundId;
  customBackgroundUri?: string | null;
  setBackgroundId: (backgroundId: ChatBackgroundId) => void;
  setCustomBackgroundUri: (uri: string | null) => void;
}

export const useChatBackgroundStore = create<ChatBackgroundState>()(
  persist(
    (set) => ({
      backgroundId: 'void',
      customBackgroundUri: null,
      setBackgroundId: (backgroundId) => set({ backgroundId }),
      setCustomBackgroundUri: (uri) => set({ customBackgroundUri: uri }),
    }),
    {
      name: 'chat-background',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

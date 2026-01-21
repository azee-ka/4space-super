import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatBackgroundId } from '../styles/chatBackgrounds';

interface ChatBackgroundState {
  backgroundId: ChatBackgroundId;
  setBackgroundId: (backgroundId: ChatBackgroundId) => void;
}

export const useChatBackgroundStore = create<ChatBackgroundState>()(
  persist(
    (set) => ({
      backgroundId: 'void',
      setBackgroundId: (backgroundId) => set({ backgroundId }),
    }),
    {
      name: 'chat-background',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatBackgroundId } from '../styles/chatBackgrounds';

interface ChatBackgroundState {
  backgroundByConversation: Record<string, ChatBackgroundId | undefined>;
  customBackgroundUriByConversation: Record<string, string | null | undefined>;
  setBackgroundId: (conversationId: string, backgroundId: ChatBackgroundId) => void;
  setCustomBackgroundUri: (conversationId: string, uri: string | null) => void;
}

export const useChatBackgroundStore = create<ChatBackgroundState>()(
  persist(
    (set) => ({
      backgroundByConversation: {},
      customBackgroundUriByConversation: {},
      setBackgroundId: (conversationId, backgroundId) =>
        set((state) => ({
          backgroundByConversation: {
            ...state.backgroundByConversation,
            [conversationId]: backgroundId,
          },
        })),
      setCustomBackgroundUri: (conversationId, uri) =>
        set((state) => ({
          customBackgroundUriByConversation: {
            ...state.customBackgroundUriByConversation,
            [conversationId]: uri,
          },
        })),
    }),
    {
      name: 'chat-background',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

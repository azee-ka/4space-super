import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MessagePreferencesState {
  pinnedConversations: string[];
  mutedConversations: string[];
  archivedConversations: string[];
  pinnedMessages: Record<string, string | null>;
  savedMessages: Record<string, string[]>;

  togglePinnedConversation: (conversationId: string) => void;
  toggleMutedConversation: (conversationId: string) => void;
  toggleArchivedConversation: (conversationId: string) => void;
  setPinnedMessage: (conversationId: string, messageId: string | null) => void;
  toggleSavedMessage: (conversationId: string, messageId: string) => void;
}

const toggleListEntry = (list: string[], id: string) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

export const useMessagePreferencesStore = create<MessagePreferencesState>()(
  persist(
    (set, get) => ({
      pinnedConversations: [],
      mutedConversations: [],
      archivedConversations: [],
      pinnedMessages: {},
      savedMessages: {},

      togglePinnedConversation: (conversationId) =>
        set((state) => ({
          pinnedConversations: toggleListEntry(state.pinnedConversations, conversationId),
        })),

      toggleMutedConversation: (conversationId) =>
        set((state) => ({
          mutedConversations: toggleListEntry(state.mutedConversations, conversationId),
        })),

      toggleArchivedConversation: (conversationId) =>
        set((state) => ({
          archivedConversations: toggleListEntry(state.archivedConversations, conversationId),
        })),

      setPinnedMessage: (conversationId, messageId) =>
        set((state) => ({
          pinnedMessages: {
            ...state.pinnedMessages,
            [conversationId]: messageId,
          },
        })),

      toggleSavedMessage: (conversationId, messageId) => {
        const current = get().savedMessages[conversationId] || [];
        const next = toggleListEntry(current, messageId);
        set((state) => ({
          savedMessages: {
            ...state.savedMessages,
            [conversationId]: next,
          },
        }));
      },
    }),
    {
      name: 'message-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CHAT_THEME_PRESETS, DEFAULT_CHAT_THEME, getChatThemeById, ChatThemePreset, Density } from '../styles/chatThemes';

interface ConversationCustomization {
  themeId?: string;
  density?: Density;
  enableCallControls?: boolean;
}

interface ChatCustomizationState {
  conversationCustomizations: Record<string, ConversationCustomization>;
  setConversationTheme: (conversationId: string, themeId: ChatThemePreset['id']) => void;
  setConversationDensity: (conversationId: string, density: Density) => void;
  setCallControls: (conversationId: string, enabled: boolean) => void;
  getConversationTheme: (conversationId?: string) => ChatThemePreset & { density: Density };
  areCallControlsEnabled: (conversationId?: string) => boolean;
}

const DEFAULT_DENSITY: Density = 'cozy';

export const useChatCustomizationStore = create<ChatCustomizationState>()(
  persist(
    (set, get) => ({
      conversationCustomizations: {},

      setConversationTheme: (conversationId, themeId) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              themeId,
            },
          },
        })),

      setConversationDensity: (conversationId, density) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              density,
            },
          },
        })),

      setCallControls: (conversationId, enabled) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              enableCallControls: enabled,
            },
          },
        })),

      getConversationTheme: (conversationId) => {
        if (!conversationId) {
          return { ...DEFAULT_CHAT_THEME, density: DEFAULT_DENSITY };
        }
        const customization = get().conversationCustomizations[conversationId];
        const base = getChatThemeById(customization?.themeId);
        return { ...base, density: customization?.density || base.density || DEFAULT_DENSITY };
      },

      areCallControlsEnabled: (conversationId) => {
        if (!conversationId) return true;
        const customization = get().conversationCustomizations[conversationId];
        return customization?.enableCallControls !== false;
      },
    }),
    {
      name: 'chat-customizations',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

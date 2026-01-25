import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CHAT_THEME_PRESETS, DEFAULT_CHAT_THEME, getChatThemeById, ChatThemePreset, Density } from '../styles/chatThemes';

interface ConversationCustomization {
  themeId?: string;
  density?: Density;
  enableCallControls?: boolean;
  sentBubbleColor?: string;
  receivedBubbleColor?: string;
  sentTextColor?: string;
  receivedTextColor?: string;
  sentTimestampColor?: string;
  receivedTimestampColor?: string;
  bubbleRadius?: number;
  bubbleStyle?: 'solid' | 'gradient';
  sentBubbleGradient?: [string, string];
  receivedBubbleGradient?: [string, string];
  messageTextSize?: number;
}

interface ChatCustomizationState {
  conversationCustomizations: Record<string, ConversationCustomization>;
  setConversationTheme: (conversationId: string, themeId: ChatThemePreset['id']) => void;
  setConversationDensity: (conversationId: string, density: Density) => void;
  setCallControls: (conversationId: string, enabled: boolean) => void;
  setBubbleColors: (conversationId: string, colors: { sent?: string; received?: string }) => void;
  setTextColors: (conversationId: string, colors: { sent?: string; received?: string }) => void;
  setTimestampColors: (conversationId: string, colors: { sent?: string; received?: string }) => void;
  setBubbleRadius: (conversationId: string, radius: number) => void;
  setBubbleStyle: (conversationId: string, style: 'solid' | 'gradient') => void;
  setBubbleGradients: (conversationId: string, gradients: { sent?: [string, string]; received?: [string, string] }) => void;
  setMessageTextSize: (conversationId: string, size: number) => void;
  resetBubbleStyle: (conversationId: string) => void;
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

      setBubbleColors: (conversationId, colors) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              sentBubbleColor: colors.sent ?? state.conversationCustomizations[conversationId]?.sentBubbleColor,
              receivedBubbleColor: colors.received ?? state.conversationCustomizations[conversationId]?.receivedBubbleColor,
            },
          },
        })),

      setTextColors: (conversationId, colors) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              sentTextColor: colors.sent ?? state.conversationCustomizations[conversationId]?.sentTextColor,
              receivedTextColor: colors.received ?? state.conversationCustomizations[conversationId]?.receivedTextColor,
            },
          },
        })),

      setTimestampColors: (conversationId, colors) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              sentTimestampColor: colors.sent ?? state.conversationCustomizations[conversationId]?.sentTimestampColor,
              receivedTimestampColor: colors.received ?? state.conversationCustomizations[conversationId]?.receivedTimestampColor,
            },
          },
        })),

      setBubbleRadius: (conversationId, radius) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              bubbleRadius: radius,
            },
          },
        })),

      setBubbleStyle: (conversationId, style) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              bubbleStyle: style,
            },
          },
        })),

      setBubbleGradients: (conversationId, gradients) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              sentBubbleGradient:
                gradients.sent ?? state.conversationCustomizations[conversationId]?.sentBubbleGradient,
              receivedBubbleGradient:
                gradients.received ?? state.conversationCustomizations[conversationId]?.receivedBubbleGradient,
            },
          },
        })),

      setMessageTextSize: (conversationId, size) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              messageTextSize: size,
            },
          },
        })),

      resetBubbleStyle: (conversationId) =>
        set((state) => ({
          conversationCustomizations: {
            ...state.conversationCustomizations,
            [conversationId]: {
              ...state.conversationCustomizations[conversationId],
              sentBubbleColor: undefined,
              receivedBubbleColor: undefined,
              sentTextColor: undefined,
              receivedTextColor: undefined,
              bubbleRadius: undefined,
              bubbleStyle: undefined,
              sentBubbleGradient: undefined,
              receivedBubbleGradient: undefined,
              messageTextSize: undefined,
            },
          },
        })),

      getConversationTheme: (conversationId) => {
        if (!conversationId) {
          return { ...DEFAULT_CHAT_THEME, density: DEFAULT_DENSITY };
        }
        const customization = get().conversationCustomizations[conversationId];
        const base = getChatThemeById(customization?.themeId);
        return {
          ...base,
          sentBubbleColor: customization?.sentBubbleColor || base.sentBubbleColor,
          receivedBubbleColor: customization?.receivedBubbleColor || base.receivedBubbleColor,
          sentTextColor: customization?.sentTextColor || base.sentTextColor,
          receivedTextColor: customization?.receivedTextColor || base.receivedTextColor,
          bubbleRadius: customization?.bubbleRadius ?? base.bubbleRadius,
          bubbleStyle: customization?.bubbleStyle || 'solid',
          sentBubbleGradient: customization?.sentBubbleGradient,
          receivedBubbleGradient: customization?.receivedBubbleGradient,
          messageTextSize: customization?.messageTextSize,
          density: customization?.density || base.density || DEFAULT_DENSITY,
        };
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

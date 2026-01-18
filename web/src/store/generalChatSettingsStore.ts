// web/src/store/generalChatSettingsStore.ts
// Separate settings store for General Chat (DMs/Conversations)
// Independent from Space Chat settings

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatTheme, MessageDensity } from '@4space/shared/src/types/chatSettings';
import { DEFAULT_CHAT_THEME } from '@4space/shared/src/types/chatSettings';

// Settings specific to general chat
export interface GeneralChatSettings {
  // Display settings
  showAvatars: boolean;
  showTimestamps: boolean;
  showReadReceipts: boolean;
  showMessageStatus: boolean;
  showUsernames: boolean;
  showTypingIndicator: boolean;
  showOnlineStatus: boolean;

  // Appearance
  fontSize: number;
  messageDensity: MessageDensity;
  theme: ChatTheme;

  // Behavior
  groupMessages: boolean;
  messageAnimations: boolean;
  autoScrollToBottom: boolean;

  // Features
  enableMessageReactions: boolean;
  enableMessageReplies: boolean;
  allowMessageEditing: boolean;
  allowMessageDeletion: boolean;
}

// Defaults with everything enabled for a good default experience
const DEFAULT_GENERAL_CHAT_SETTINGS: GeneralChatSettings = {
  // Display - all enabled by default
  showAvatars: true,
  showTimestamps: true,
  showReadReceipts: true,
  showMessageStatus: true,
  showUsernames: true,
  showTypingIndicator: true,
  showOnlineStatus: true,

  // Appearance
  fontSize: 14,
  messageDensity: 'comfortable',
  theme: DEFAULT_CHAT_THEME,

  // Behavior
  groupMessages: true,
  messageAnimations: true,
  autoScrollToBottom: true,

  // Features - all enabled by default
  enableMessageReactions: true,
  enableMessageReplies: true,
  allowMessageEditing: true,
  allowMessageDeletion: true,
};

interface GeneralChatSettingsState extends GeneralChatSettings {
  // Setters
  setShowAvatars: (enabled: boolean) => void;
  setShowTimestamps: (enabled: boolean) => void;
  setShowReadReceipts: (enabled: boolean) => void;
  setShowMessageStatus: (enabled: boolean) => void;
  setShowUsernames: (enabled: boolean) => void;
  setShowTypingIndicator: (enabled: boolean) => void;
  setShowOnlineStatus: (enabled: boolean) => void;
  setFontSize: (size: number) => void;
  setMessageDensity: (density: MessageDensity) => void;
  setTheme: (theme: ChatTheme) => void;
  setGroupMessages: (enabled: boolean) => void;
  setMessageAnimations: (enabled: boolean) => void;
  setAutoScrollToBottom: (enabled: boolean) => void;
  setEnableMessageReactions: (enabled: boolean) => void;
  setEnableMessageReplies: (enabled: boolean) => void;
  setAllowMessageEditing: (enabled: boolean) => void;
  setAllowMessageDeletion: (enabled: boolean) => void;
  updateSettings: (updates: Partial<GeneralChatSettings>) => void;
  resetToDefaults: () => void;
}

export const useGeneralChatSettingsStore = create<GeneralChatSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_GENERAL_CHAT_SETTINGS,

      // Setters
      setShowAvatars: (enabled: boolean) => set({ showAvatars: enabled }),
      setShowTimestamps: (enabled: boolean) => set({ showTimestamps: enabled }),
      setShowReadReceipts: (enabled: boolean) => set({ showReadReceipts: enabled }),
      setShowMessageStatus: (enabled: boolean) => set({ showMessageStatus: enabled }),
      setShowUsernames: (enabled: boolean) => set({ showUsernames: enabled }),
      setShowTypingIndicator: (enabled: boolean) => set({ showTypingIndicator: enabled }),
      setShowOnlineStatus: (enabled: boolean) => set({ showOnlineStatus: enabled }),
      setFontSize: (size: number) => set({ fontSize: size }),
      setMessageDensity: (density: MessageDensity) => set({ messageDensity: density }),
      setTheme: (theme: ChatTheme) => set({ theme: theme }),
      setGroupMessages: (enabled: boolean) => set({ groupMessages: enabled }),
      setMessageAnimations: (enabled: boolean) => set({ messageAnimations: enabled }),
      setAutoScrollToBottom: (enabled: boolean) => set({ autoScrollToBottom: enabled }),
      setEnableMessageReactions: (enabled: boolean) => set({ enableMessageReactions: enabled }),
      setEnableMessageReplies: (enabled: boolean) => set({ enableMessageReplies: enabled }),
      setAllowMessageEditing: (enabled: boolean) => set({ allowMessageEditing: enabled }),
      setAllowMessageDeletion: (enabled: boolean) => set({ allowMessageDeletion: enabled }),

      updateSettings: (updates: Partial<GeneralChatSettings>) => {
        set((state) => ({ ...state, ...updates }));
      },

      resetToDefaults: () => {
        set(DEFAULT_GENERAL_CHAT_SETTINGS);
      },
    }),
    {
      name: 'general-chat-settings-storage', // Separate storage key from space chat
    }
  )
);

// Selector to get just the settings without the setters
export const selectGeneralChatSettings = (state: GeneralChatSettingsState): GeneralChatSettings => {
  const {
    setShowAvatars: _1,
    setShowTimestamps: _2,
    setShowReadReceipts: _3,
    setShowMessageStatus: _4,
    setShowUsernames: _5,
    setShowTypingIndicator: _6,
    setShowOnlineStatus: _7,
    setFontSize: _8,
    setMessageDensity: _9,
    setTheme: _10,
    setGroupMessages: _11,
    setMessageAnimations: _12,
    setAutoScrollToBottom: _13,
    setEnableMessageReactions: _14,
    setEnableMessageReplies: _15,
    setAllowMessageEditing: _16,
    setAllowMessageDeletion: _17,
    updateSettings: _18,
    resetToDefaults: _19,
    ...settings
  } = state;

  return settings;
};

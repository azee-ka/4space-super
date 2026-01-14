// web/src/store/chatSettingsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatTheme {
  background: string;
  messageBubbleShape: string;
  accentColor: string;
  messagePattern: string;
}

interface ChatSettingsState {
  // Chat Settings
  formattingButtonsEnabled: boolean;
  showTimestamps: boolean;
  showReadReceipts: boolean;
  showAvatars: boolean;
  showLinkPreviews: boolean;
  groupMessages: boolean;
  messageAnimations: boolean;
  
  // Room Settings
  notifications: 'all' | 'mentions' | 'none';
  muteRoom: boolean;
  autoDeleteMessages: 'never' | '7days' | '30days' | '1year';
  messageHistory: 'unlimited' | '30days' | '90days' | '1year';
  
  // Appearance Settings (moved from customization to avoid duplicates)
  fontSize: number;
  messageDensity: 'compact' | 'comfortable' | 'spacious';
  theme: ChatTheme;
  
  // Setters
  setFormattingButtonsEnabled: (enabled: boolean) => void;
  setShowTimestamps: (enabled: boolean) => void;
  setShowReadReceipts: (enabled: boolean) => void;
  setShowAvatars: (enabled: boolean) => void;
  setShowLinkPreviews: (enabled: boolean) => void;
  setGroupMessages: (enabled: boolean) => void;
  setMessageAnimations: (enabled: boolean) => void;
  setNotifications: (value: 'all' | 'mentions' | 'none') => void;
  setMuteRoom: (enabled: boolean) => void;
  setAutoDeleteMessages: (value: 'never' | '7days' | '30days' | '1year') => void;
  setMessageHistory: (value: 'unlimited' | '30days' | '90days' | '1year') => void;
  setFontSize: (size: number) => void;
  setMessageDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  setTheme: (theme: ChatTheme) => void;
}

export const useChatSettingsStore = create<ChatSettingsState>()(
  persist(
    (set) => ({
      // Chat Settings defaults
      formattingButtonsEnabled: true,
      showTimestamps: true,
      showReadReceipts: true,
      showAvatars: true,
      showLinkPreviews: true,
      groupMessages: true,
      messageAnimations: true,
      // Room Settings defaults
      notifications: 'all',
      muteRoom: false,
      autoDeleteMessages: 'never',
      messageHistory: 'unlimited',
      // Appearance Settings defaults
      fontSize: 14,
      messageDensity: 'comfortable',
      theme: {
        background: 'black',
        messageBubbleShape: 'rounded-xl',
        accentColor: 'cyan',
        messagePattern: 'none',
      },
      
      // Setters
      setFormattingButtonsEnabled: (enabled: boolean) => {
        set({ formattingButtonsEnabled: enabled });
      },
      setShowTimestamps: (enabled: boolean) => {
        set({ showTimestamps: enabled });
      },
      setShowReadReceipts: (enabled: boolean) => {
        set({ showReadReceipts: enabled });
      },
      setShowAvatars: (enabled: boolean) => {
        set({ showAvatars: enabled });
      },
      setShowLinkPreviews: (enabled: boolean) => {
        set({ showLinkPreviews: enabled });
      },
      setGroupMessages: (enabled: boolean) => {
        set({ groupMessages: enabled });
      },
      setMessageAnimations: (enabled: boolean) => {
        set({ messageAnimations: enabled });
      },
      setNotifications: (value: 'all' | 'mentions' | 'none') => {
        set({ notifications: value });
      },
      setMuteRoom: (enabled: boolean) => {
        set({ muteRoom: enabled });
      },
      setAutoDeleteMessages: (value: 'never' | '7days' | '30days' | '1year') => {
        set({ autoDeleteMessages: value });
      },
      setMessageHistory: (value: 'unlimited' | '30days' | '90days' | '1year') => {
        set({ messageHistory: value });
      },
      setFontSize: (size: number) => {
        set({ fontSize: size });
      },
      setMessageDensity: (density: 'compact' | 'comfortable' | 'spacious') => {
        set({ messageDensity: density });
      },
      setTheme: (theme: ChatTheme) => {
        set({ theme });
      },
    }),
    {
      name: 'chat-settings-storage',
    }
  )
);

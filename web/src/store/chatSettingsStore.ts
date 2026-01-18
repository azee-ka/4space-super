// web/src/store/chatSettingsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatTheme, MessageDensity, UserChatSettings } from '@4space/shared/src/types/chatSettings';
import { DEFAULT_USER_CHAT_SETTINGS } from '@4space/shared/src/types/chatSettings';

interface ChatSettingsState extends UserChatSettings {
  // Setters
  setFormattingButtonsEnabled: (enabled: boolean) => void;
  setShowTimestamps: (enabled: boolean) => void;
  setShowReadReceipts: (enabled: boolean) => void;
  setShowAvatars: (enabled: boolean) => void;
  setShowLinkPreviews: (enabled: boolean) => void;
  setGroupMessages: (enabled: boolean) => void;
  setMessageAnimations: (enabled: boolean) => void;
  setNotifications: (value: UserChatSettings['notifications']) => void;
  setMuteRoom: (enabled: boolean) => void;
  setAutoDeleteMessages: (value: UserChatSettings['autoDeleteMessages']) => void;
  setMessageHistory: (value: UserChatSettings['messageHistory']) => void;
  setFontSize: (size: number, roomId?: string, category?: string) => void;
  setMessageDensity: (density: MessageDensity, roomId?: string, category?: string) => void;
  setTheme: (theme: ChatTheme, roomId?: string, category?: string) => void;
  setAmbientLighting: (enabled: boolean) => void;
  setAmbientIntensity: (intensity: number) => void;
  setApplyToAllRooms: (apply: boolean) => void;
  setApplyToCategory: (apply: boolean) => void;
  updateSettings: (updates: Partial<UserChatSettings>) => void;
  hydrateSettings: (settings: Partial<UserChatSettings>) => void;

  // Get settings for a specific room
  getSettingsForRoom: (roomId?: string, category?: string) => {
    fontSize: number;
    messageDensity: MessageDensity;
    theme: ChatTheme;
  };
}

export const useChatSettingsStore = create<ChatSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_USER_CHAT_SETTINGS,

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
      setNotifications: (value: UserChatSettings['notifications']) => {
        set({ notifications: value });
      },
      setMuteRoom: (enabled: boolean) => {
        set({ muteRoom: enabled });
      },
      setAutoDeleteMessages: (value: UserChatSettings['autoDeleteMessages']) => {
        set({ autoDeleteMessages: value });
      },
      setMessageHistory: (value: UserChatSettings['messageHistory']) => {
        set({ messageHistory: value });
      },
      setFontSize: (size: number, roomId?: string, category?: string) => {
        set((state) => {
          if (!state.applyToAllRooms && category && state.applyToCategory) {
            return {
              categorySettings: {
                ...state.categorySettings,
                [category]: {
                  ...state.categorySettings[category],
                  fontSize: size,
                },
              },
            };
          }
          if (roomId && !state.applyToAllRooms) {
            return {
              roomSettings: {
                ...state.roomSettings,
                [roomId]: {
                  ...state.roomSettings[roomId],
                  fontSize: size,
                },
              },
            };
          }
          // Apply globally
          return { fontSize: size };
        });
      },
      setMessageDensity: (density: MessageDensity, roomId?: string, category?: string) => {
        set((state) => {
          if (!state.applyToAllRooms && category && state.applyToCategory) {
            return {
              categorySettings: {
                ...state.categorySettings,
                [category]: {
                  ...state.categorySettings[category],
                  messageDensity: density,
                },
              },
            };
          }
          if (roomId && !state.applyToAllRooms) {
            return {
              roomSettings: {
                ...state.roomSettings,
                [roomId]: {
                  ...state.roomSettings[roomId],
                  messageDensity: density,
                },
              },
            };
          }
          return { messageDensity: density };
        });
      },
      setTheme: (theme: ChatTheme, roomId?: string, category?: string) => {
        set((state) => {
          if (!state.applyToAllRooms && category && state.applyToCategory) {
            return {
              categorySettings: {
                ...state.categorySettings,
                [category]: {
                  ...state.categorySettings[category],
                  theme,
                },
              },
            };
          }
          if (roomId && !state.applyToAllRooms) {
            return {
              roomSettings: {
                ...state.roomSettings,
                [roomId]: {
                  ...state.roomSettings[roomId],
                  theme,
                },
              },
            };
          }
          return { theme };
        });
      },
      setAmbientLighting: (enabled: boolean) => {
        set({ ambientLighting: enabled });
      },
      setAmbientIntensity: (intensity: number) => {
        set({ ambientIntensity: intensity });
      },
      setApplyToAllRooms: (apply: boolean) => {
        set((state) => ({
          applyToAllRooms: apply,
          applyToCategory: apply ? false : state.applyToCategory,
        }));
      },
      setApplyToCategory: (apply: boolean) => {
        set((state) => ({
          applyToCategory: apply,
          applyToAllRooms: apply ? false : state.applyToAllRooms,
        }));
      },
      updateSettings: (updates: Partial<UserChatSettings>) => {
        set((state) => ({
          ...state,
          ...updates,
        }));
      },
      hydrateSettings: (settings: Partial<UserChatSettings>) => {
        set((state) => ({
          ...state,
          ...settings,
        }));
      },
      
      // Get settings for a specific room
      getSettingsForRoom(roomId?: string, category?: string) {
        const state = useChatSettingsStore.getState() as ChatSettingsState;
        if (!state.applyToAllRooms && category && state.applyToCategory && state.categorySettings[category]) {
          const categorySettings = state.categorySettings[category];
          return {
            fontSize: categorySettings.fontSize ?? state.fontSize,
            messageDensity: categorySettings.messageDensity ?? state.messageDensity,
            theme: categorySettings.theme ?? state.theme,
          };
        }
        if (roomId && !state.applyToAllRooms && state.roomSettings[roomId]) {
          // Return room-specific settings merged with global defaults
          const roomSettings = state.roomSettings[roomId];
          return {
            fontSize: roomSettings.fontSize ?? state.fontSize,
            messageDensity: roomSettings.messageDensity ?? state.messageDensity,
            theme: roomSettings.theme ?? state.theme,
          };
        }
        // Return global settings
        return {
          fontSize: state.fontSize,
          messageDensity: state.messageDensity,
          theme: state.theme,
        };
      },
    }),
    {
      name: 'chat-settings-storage',
      version: 2, // Increment to trigger migration
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Migration: Reset display settings to true (proper defaults)
          // This fixes old persisted states that had these disabled
          return {
            ...persistedState,
            showAvatars: true,
            showTimestamps: true,
            showReadReceipts: true,
            showMessageStatus: true,
            showUsernames: true,
            showTypingIndicator: true,
            showOnlineStatus: true,
            messageAnimations: true,
            groupMessages: true,
          };
        }
        return persistedState;
      },
    }
  )
);

export const selectUserChatSettings = (state: ChatSettingsState): UserChatSettings => {
  const {
    setFormattingButtonsEnabled: _setFormattingButtonsEnabled,
    setShowTimestamps: _setShowTimestamps,
    setShowReadReceipts: _setShowReadReceipts,
    setShowAvatars: _setShowAvatars,
    setShowLinkPreviews: _setShowLinkPreviews,
    setGroupMessages: _setGroupMessages,
    setMessageAnimations: _setMessageAnimations,
    setNotifications: _setNotifications,
    setMuteRoom: _setMuteRoom,
    setAutoDeleteMessages: _setAutoDeleteMessages,
    setMessageHistory: _setMessageHistory,
    setFontSize: _setFontSize,
    setMessageDensity: _setMessageDensity,
    setTheme: _setTheme,
    setAmbientLighting: _setAmbientLighting,
    setAmbientIntensity: _setAmbientIntensity,
    setApplyToAllRooms: _setApplyToAllRooms,
    setApplyToCategory: _setApplyToCategory,
    updateSettings: _updateSettings,
    hydrateSettings: _hydrateSettings,
    getSettingsForRoom: _getSettingsForRoom,
    ...settings
  } = state;

  return settings;
};

export type { BackgroundType, BubbleShapePreset, ChatTheme, MessageDensity } from '@4space/shared/src/types/chatSettings';

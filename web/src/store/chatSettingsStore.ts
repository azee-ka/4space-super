// web/src/store/chatSettingsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BackgroundType = 'solid' | 'gradient' | 'pattern' | 'artistic' | 'image';
export type BubbleShapePreset = 'square' | 'rounded' | 'pill' | 'extra-rounded' | 'custom';

export interface ChatTheme {
  // Background settings
  backgroundType: BackgroundType;
  backgroundColor: string; // solid color or gradient colors
  backgroundColor2?: string; // for gradients
  backgroundImage?: string; // base64 or URL
  backgroundPattern?: string; // pattern name (for both pattern and artistic)
  
  // Bubble settings
  sentBubbleColor: string;
  receivedBubbleColor: string;
  sentBubbleGradient?: string; // Optional gradient for sent bubbles (e.g., "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
  receivedBubbleGradient?: string; // Optional gradient for received bubbles
  bubbleShapePreset: BubbleShapePreset;
  bubbleBorderRadius: number; // 0-24 for custom radius
  accentColor: string;
  
  // Text colors for readability
  sentTextColor: string; // text color in sent bubbles
  receivedTextColor: string; // text color in received bubbles
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
  ambientLighting: boolean; // Ambient lighting for sidebars
  ambientIntensity: number; // 0-100, intensity of ambient lighting
  applyToAllRooms: boolean; // Apply settings to all rooms
  
  // Per-room settings storage
  roomSettings: Record<string, {
    fontSize?: number;
    messageDensity?: 'compact' | 'comfortable' | 'spacious';
    theme?: ChatTheme;
  }>;
  
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
  setFontSize: (size: number, roomId?: string) => void;
  setMessageDensity: (density: 'compact' | 'comfortable' | 'spacious', roomId?: string) => void;
  setTheme: (theme: ChatTheme, roomId?: string) => void;
  setAmbientLighting: (enabled: boolean) => void;
  setAmbientIntensity: (intensity: number) => void;
  setApplyToAllRooms: (apply: boolean) => void;
  
  // Get settings for a specific room
  getSettingsForRoom: (roomId?: string) => {
    fontSize: number;
    messageDensity: 'compact' | 'comfortable' | 'spacious';
    theme: ChatTheme;
  };
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
        backgroundType: 'solid',
        backgroundColor: '#000000',
        sentBubbleColor: '#7c3aed', // Purple - original default
        receivedBubbleColor: '#27272a',
        bubbleShapePreset: 'pill',
        bubbleBorderRadius: 12,
        accentColor: 'purple',
        sentTextColor: '#ffffff',
        receivedTextColor: '#ffffff',
      },
      ambientLighting: true, // Enabled by default for nice effect
      ambientIntensity: 50, // Default 50% intensity
      applyToAllRooms: false, // By default, settings apply to current room only
      roomSettings: {}, // Per-room settings storage
      
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
      setFontSize: (size: number, roomId?: string) => {
        set((state) => {
          if (roomId && !state.applyToAllRooms) {
            // Save to room-specific settings
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
      setMessageDensity: (density: 'compact' | 'comfortable' | 'spacious', roomId?: string) => {
        set((state) => {
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
      setTheme: (theme: ChatTheme, roomId?: string) => {
        set((state) => {
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
        set({ applyToAllRooms: apply });
      },
      
      // Get settings for a specific room
      getSettingsForRoom(roomId?: string) {
        const state = useChatSettingsStore.getState() as ChatSettingsState;
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
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification Settings Types
export type NotificationPreviewType = 'Always' | 'When Unlocked' | 'Never';
export type QuietHoursType = 'Off' | '22:00 - 07:00' | '23:00 - 08:00' | 'Custom';
export type NotificationSoundType = 'Default' | 'Chime' | 'Bell' | 'Ping' | 'Pop' | 'Whistle' | 'Swoosh' | 'None';

// Messaging Settings Types
export type AutoDeleteType = 'Off' | '24 hours' | '7 days' | '30 days';
export type MessageFormattingType = 'Rich' | 'Markdown' | 'Plain';

// Appearance Settings Types
export type ThemeStyleType = 'OLED Black' | 'Dim' | 'Classic';
export type FontSizeType = 'Small' | 'Medium' | 'Large' | 'Extra Large';

// Storage Settings Types
export type BackupModeType = 'Wi-Fi only' | 'Wi-Fi + Cellular' | 'Off';
export type MediaQualityType = 'Auto' | 'High' | 'Medium' | 'Low';
export type DownloadOverType = 'Wi-Fi only' | 'Wi-Fi + Cellular' | 'Always Ask';

// Advanced Settings Types
export type LanguageType = 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Japanese' | 'Korean' | 'Chinese' | 'Hindi' | 'Arabic';

// Privacy Settings Types
export type SessionTimeoutType = '5 min' | '15 min' | '30 min' | '1 hour' | 'Never';

interface NotificationSettings {
  // General
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeCount: boolean;
  lockScreenNotifications: boolean;

  // Message Alerts
  dmAlerts: boolean;
  groupChatAlerts: boolean;
  mentionsOnly: boolean;
  spaceUpdates: boolean;
  inAppPreview: boolean;
  reactionAlerts: boolean;
  callAlerts: boolean;

  // Customization
  notificationPreview: NotificationPreviewType;
  notificationSound: NotificationSoundType;
  quietHours: QuietHoursType;
  quietHoursCustomStart?: string;
  quietHoursCustomEnd?: string;

  // Advanced
  criticalAlerts: boolean;
  groupByConversation: boolean;
  notificationPriority: 'High' | 'Normal' | 'Low';
}

interface MessagingSettings {
  // Conversation Defaults
  readReceipts: boolean;
  typingIndicators: boolean;
  linkPreviews: boolean;
  messageRequests: boolean;

  // Media Playback
  autoPlayGifs: boolean;
  autoPlayVideos: boolean;
  autoDownloadMedia: boolean;
  autoDownloadOverWifi: boolean;

  // Inbox Management
  autoDelete: AutoDeleteType;
  chatFolders: boolean;
  archiveInactive: boolean;
  messageForwarding: boolean;
  messagePinning: boolean;
  starredMessages: boolean;

  // Smart Features
  smartReplies: boolean;
  translateMessages: boolean;
  stickerSuggestions: boolean;
  emojiSuggestions: boolean;
  gifSearch: boolean;
  voiceMessages: boolean;

  // Input & Formatting
  sendWithEnter: boolean;
  spellCheck: boolean;
  autoCorrect: boolean;
  messageFormatting: MessageFormattingType;
  codeBlockSupport: boolean;
  mentionSuggestions: boolean;
}

interface AppearanceSettings {
  // Theme
  darkMode: boolean;
  themeStyle: ThemeStyleType;
  fontSize: FontSizeType;

  // Layout
  compactMode: boolean;
  showAvatars: boolean;
  messageGrouping: boolean;
  showTimestamps: boolean;
  compactHeaders: boolean;

  // Accessibility
  reduceMotion: boolean;
  highContrast: boolean;
  largerTapTargets: boolean;
  colorBlindMode: boolean;

  // Customization
  chatWallpaper: string | null;
  bubbleStyle: 'Round' | 'Square' | 'Minimal';
  messageAlignment: 'Left' | 'Right' | 'Auto';
}

interface PrivacySettings {
  // Privacy Controls
  discoverable: boolean;
  analyticsSharing: boolean;
  crashReporting: boolean;

  // Security
  appLock: boolean;
  twoFactor: boolean;
  loginAlerts: boolean;
  sessionTimeout: SessionTimeoutType;
  biometricAuth: boolean;

  // Content
  screenshotsAllowed: boolean;
  readReceiptsPrivacy: boolean;
  hideOnlineStatus: boolean;
  incognitoMode: boolean;
}

interface StorageSettings {
  // Media
  autoPlayMedia: boolean;
  autoDownloadMedia: boolean;
  highQualityUploads: boolean;
  mediaQuality: MediaQualityType;
  downloadOver: DownloadOverType;

  // Network
  backupMode: BackupModeType;
  dataSaver: boolean;
  compressUploads: boolean;
  autoBackup: boolean;

  // Cache Management
  cacheLimit: number; // in GB
  autoClearCache: boolean;
  clearCacheAfter: '7 days' | '30 days' | '90 days' | 'Never';
}

interface AdvancedSettings {
  // System
  backgroundRefresh: boolean;
  autoArchive: boolean;
  language: LanguageType;

  // Connectivity
  proxyEnabled: boolean;
  proxyHost?: string;
  proxyPort?: number;
  useIPv6: boolean;

  // Developer
  developerMode: boolean;
  experimentalFeatures: boolean;
  debugLogs: boolean;

  // Performance
  hardwareAcceleration: boolean;
  animationsEnabled: boolean;
  prefetchContent: boolean;
}

interface SpaceSettings {
  defaultPrivacy: 'Private' | 'Shared' | 'Team' | 'Public';
  defaultSpaceType: 'Team' | 'Community' | 'Project' | 'Personal';
  autoJoinSpaces: boolean;
  autoPinUpdates: boolean;
  spaceNotifications: boolean;
  showSpaceActivity: boolean;
}

interface SettingsState {
  notifications: NotificationSettings;
  messaging: MessagingSettings;
  appearance: AppearanceSettings;
  privacy: PrivacySettings;
  storage: StorageSettings;
  advanced: AdvancedSettings;
  spaces: SpaceSettings;

  // Actions
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateMessagingSettings: (settings: Partial<MessagingSettings>) => void;
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateStorageSettings: (settings: Partial<StorageSettings>) => void;
  updateAdvancedSettings: (settings: Partial<AdvancedSettings>) => void;
  updateSpaceSettings: (settings: Partial<SpaceSettings>) => void;

  resetToDefaults: () => void;
}

const defaultSettings: Omit<SettingsState, 'updateNotificationSettings' | 'updateMessagingSettings' | 'updateAppearanceSettings' | 'updatePrivacySettings' | 'updateStorageSettings' | 'updateAdvancedSettings' | 'updateSpaceSettings' | 'resetToDefaults'> = {
  notifications: {
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    badgeCount: true,
    lockScreenNotifications: true,
    dmAlerts: true,
    groupChatAlerts: true,
    mentionsOnly: false,
    spaceUpdates: true,
    inAppPreview: true,
    reactionAlerts: true,
    callAlerts: true,
    notificationPreview: 'When Unlocked',
    notificationSound: 'Default',
    quietHours: 'Off',
    criticalAlerts: false,
    groupByConversation: true,
    notificationPriority: 'Normal',
  },
  messaging: {
    readReceipts: true,
    typingIndicators: true,
    linkPreviews: true,
    messageRequests: true,
    autoPlayGifs: true,
    autoPlayVideos: false,
    autoDownloadMedia: false,
    autoDownloadOverWifi: true,
    autoDelete: 'Off',
    chatFolders: true,
    archiveInactive: false,
    messageForwarding: true,
    messagePinning: true,
    starredMessages: true,
    smartReplies: false,
    translateMessages: false,
    stickerSuggestions: true,
    emojiSuggestions: true,
    gifSearch: true,
    voiceMessages: true,
    sendWithEnter: false,
    spellCheck: true,
    autoCorrect: true,
    messageFormatting: 'Rich',
    codeBlockSupport: true,
    mentionSuggestions: true,
  },
  appearance: {
    darkMode: true,
    themeStyle: 'OLED Black',
    fontSize: 'Medium',
    compactMode: false,
    showAvatars: true,
    messageGrouping: true,
    showTimestamps: false,
    compactHeaders: false,
    reduceMotion: false,
    highContrast: false,
    largerTapTargets: false,
    colorBlindMode: false,
    chatWallpaper: null,
    bubbleStyle: 'Round',
    messageAlignment: 'Auto',
  },
  privacy: {
    discoverable: true,
    analyticsSharing: false,
    crashReporting: true,
    appLock: false,
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: '30 min',
    biometricAuth: false,
    screenshotsAllowed: true,
    readReceiptsPrivacy: false,
    hideOnlineStatus: false,
    incognitoMode: false,
  },
  storage: {
    autoPlayMedia: true,
    autoDownloadMedia: false,
    highQualityUploads: true,
    mediaQuality: 'Auto',
    downloadOver: 'Wi-Fi only',
    backupMode: 'Wi-Fi only',
    dataSaver: false,
    compressUploads: false,
    autoBackup: true,
    cacheLimit: 5,
    autoClearCache: false,
    clearCacheAfter: '30 days',
  },
  advanced: {
    backgroundRefresh: true,
    autoArchive: false,
    language: 'English',
    proxyEnabled: false,
    useIPv6: false,
    developerMode: false,
    experimentalFeatures: false,
    debugLogs: false,
    hardwareAcceleration: true,
    animationsEnabled: true,
    prefetchContent: true,
  },
  spaces: {
    defaultPrivacy: 'Private',
    defaultSpaceType: 'Team',
    autoJoinSpaces: false,
    autoPinUpdates: false,
    spaceNotifications: true,
    showSpaceActivity: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updateMessagingSettings: (settings) =>
        set((state) => ({
          messaging: { ...state.messaging, ...settings },
        })),

      updateAppearanceSettings: (settings) =>
        set((state) => ({
          appearance: { ...state.appearance, ...settings },
        })),

      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      updateStorageSettings: (settings) =>
        set((state) => ({
          storage: { ...state.storage, ...settings },
        })),

      updateAdvancedSettings: (settings) =>
        set((state) => ({
          advanced: { ...state.advanced, ...settings },
        })),

      updateSpaceSettings: (settings) =>
        set((state) => ({
          spaces: { ...state.spaces, ...settings },
        })),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: '4space-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

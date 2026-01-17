// shared/src/types/chatSettings.ts

export type BackgroundType = 'featured' | 'solid' | 'gradient' | 'pattern' | 'artistic' | 'image';
export type BubbleShapePreset = 'square' | 'rounded' | 'pill' | 'extra-rounded' | 'custom';
export type MessageDensity = 'compact' | 'comfortable' | 'spacious';
export type NotificationPreference = 'all' | 'mentions' | 'important' | 'none';
export type AutoDeleteMessages = 'never' | '7days' | '30days' | '1year';
export type MessageHistory = 'unlimited' | '30days' | '90days' | '1year';
export type MessageRetention = 'forever' | '1hour' | '24hours' | '1week' | '1month' | '6months' | '1year';
export type ModerationLevel = 'low' | 'medium' | 'high' | 'extreme';
export type DefaultRoomPrivacy = 'public' | 'private' | 'hidden';

export interface ChatTheme {
  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundColor2?: string;
  backgroundImage?: string;
  backgroundPattern?: string;
  sentBubbleColor: string;
  receivedBubbleColor: string;
  sentBubbleGradient?: string;
  receivedBubbleGradient?: string;
  bubbleShapePreset: BubbleShapePreset;
  bubbleBorderRadius: number;
  accentColor: string;
  sentTextColor: string;
  receivedTextColor: string;
}

export interface RoomAppearanceOverride {
  fontSize?: number;
  messageDensity?: MessageDensity;
  theme?: ChatTheme;
}

export interface UserChatSettings {
  // Existing chat settings
  formattingButtonsEnabled: boolean;
  showTimestamps: boolean;
  showReadReceipts: boolean;
  showAvatars: boolean;
  showLinkPreviews: boolean;
  groupMessages: boolean;
  messageAnimations: boolean;
  notifications: NotificationPreference;
  muteRoom: boolean;
  autoDeleteMessages: AutoDeleteMessages;
  messageHistory: MessageHistory;

  // Appearance settings
  fontSize: number;
  messageDensity: MessageDensity;
  theme: ChatTheme;
  ambientLighting: boolean;
  ambientIntensity: number;
  applyToAllRooms: boolean;
  applyToCategory: boolean;
  roomSettings: Record<string, RoomAppearanceOverride>;
  categorySettings: Record<string, RoomAppearanceOverride>;

  // Privacy settings
  showOnlineStatus: boolean;
  showTypingIndicator: boolean;
  showLastSeen: boolean;
  showProfilePhoto: boolean;
  messagePreviewInNotifications: boolean;
  autoDownloadMedia: boolean;
  autoDownloadVideos: boolean;
  allowMessageDeletion: boolean;
  screenSecurity: boolean;
  twoFactorAuth: boolean;

  // Message settings
  allowMessageEditing: boolean;
  showMessageStatus: boolean;
  enableMessageReactions: boolean;
  enableMessageReplies: boolean;
  enableMessageForwarding: boolean;
  autoSaveDrafts: boolean;
  showMessageHistory: boolean;

  // Chat behavior
  autoScrollToBottom: boolean;
  compactMessageView: boolean;
  showUnreadIndicators: boolean;
  enableKeyboardShortcuts: boolean;
  highlightMentions: boolean;
  showJoinLeaveMessages: boolean;
  pinImportantMessages: boolean;

  // Display settings
  showUsernames: boolean;
  showRoles: boolean;
  darkMode: boolean;
  highContrastMode: boolean;
  largeText: boolean;
  reduceAnimations: boolean;

  // Sound & notifications
  soundEnabled: boolean;
  notificationSound: boolean;
  mentionSound: boolean;
  messageSound: boolean;
  desktopNotifications: boolean;
  notificationFrequency: NotificationPreference;
  quietHours: boolean;

  // Advanced settings
  exportChatHistory: boolean;
  backupSettings: boolean;
  dataSync: boolean;
  offlineMode: boolean;
  debugMode: boolean;

  // Customization extras
  aiThemeSuggestions: boolean;
  dynamicTimeTheme: boolean;
  themeSync: boolean;
  advancedAnimations: boolean;
  accessibilityMode: boolean;
  performanceMode: boolean;
  soundThemes: boolean;
  bubbleEffects: boolean;
  themeSharing: boolean;
}

export interface RoomSettings {
  allowFileUploads: boolean;
  allowVoiceMessages: boolean;
  allowPolls: boolean;
  allowBots: boolean;
  slowMode: number;
  isArchived: boolean;
  isPrivate: boolean;
  requireApproval: boolean;
  allowInvites: boolean;
  maxMembers: number;
  defaultRole: string;
  moderationLevel: ModerationLevel;
  messageRetention: MessageRetention;
  showJoinLeaveMessages: boolean;
  allowMessageEditing: boolean;
  allowMessageDeletion: boolean;
  enableMessageReactions: boolean;
  enableMessageReplies: boolean;
  enableMessageForwarding: boolean;
  autoModeration: {
    spamDetection: boolean;
    linkFiltering: boolean;
    imageModeration: boolean;
  };
}

export interface SpaceSettings {
  allowPublicRooms: boolean;
  requireRoomApproval: boolean;
  defaultRoomPrivacy: DefaultRoomPrivacy;
  memberInvites: boolean;
  guestAccess: boolean;
  notificationDefaults: NotificationPreference;
  moderationLevel: ModerationLevel;
}

export interface RoomMemberSettings {
  notificationPreference: NotificationPreference;
  isMuted: boolean;
}

export const DEFAULT_CHAT_THEME: ChatTheme = {
  backgroundType: 'solid',
  backgroundColor: '#000000',
  sentBubbleColor: '#7c3aed',
  receivedBubbleColor: '#27272a',
  bubbleShapePreset: 'pill',
  bubbleBorderRadius: 12,
  accentColor: 'purple',
  sentTextColor: '#ffffff',
  receivedTextColor: '#ffffff',
};

export const DEFAULT_USER_CHAT_SETTINGS: UserChatSettings = {
  formattingButtonsEnabled: true,
  showTimestamps: true,
  showReadReceipts: true,
  showAvatars: true,
  showLinkPreviews: true,
  groupMessages: true,
  messageAnimations: true,
  notifications: 'all',
  muteRoom: false,
  autoDeleteMessages: 'never',
  messageHistory: 'unlimited',

  fontSize: 14,
  messageDensity: 'comfortable',
  theme: DEFAULT_CHAT_THEME,
  ambientLighting: true,
  ambientIntensity: 50,
  applyToAllRooms: false,
  applyToCategory: false,
  roomSettings: {},
  categorySettings: {},

  showOnlineStatus: true,
  showTypingIndicator: true,
  showLastSeen: true,
  showProfilePhoto: true,
  messagePreviewInNotifications: true,
  autoDownloadMedia: false,
  autoDownloadVideos: false,
  allowMessageDeletion: true,
  screenSecurity: false,
  twoFactorAuth: false,

  allowMessageEditing: true,
  showMessageStatus: true,
  enableMessageReactions: true,
  enableMessageReplies: true,
  enableMessageForwarding: true,
  autoSaveDrafts: true,
  showMessageHistory: true,

  autoScrollToBottom: true,
  compactMessageView: false,
  showUnreadIndicators: true,
  enableKeyboardShortcuts: true,
  highlightMentions: true,
  showJoinLeaveMessages: false,
  pinImportantMessages: true,

  showUsernames: true,
  showRoles: true,
  darkMode: true,
  highContrastMode: false,
  largeText: false,
  reduceAnimations: false,

  soundEnabled: true,
  notificationSound: true,
  mentionSound: true,
  messageSound: false,
  desktopNotifications: true,
  notificationFrequency: 'all',
  quietHours: false,

  exportChatHistory: true,
  backupSettings: true,
  dataSync: true,
  offlineMode: false,
  debugMode: false,

  aiThemeSuggestions: false,
  dynamicTimeTheme: false,
  themeSync: false,
  advancedAnimations: true,
  accessibilityMode: false,
  performanceMode: false,
  soundThemes: false,
  bubbleEffects: true,
  themeSharing: false,
};

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  allowFileUploads: true,
  allowVoiceMessages: true,
  allowPolls: true,
  allowBots: false,
  slowMode: 0,
  isArchived: false,
  isPrivate: false,
  requireApproval: false,
  allowInvites: true,
  maxMembers: 100,
  defaultRole: 'member',
  moderationLevel: 'low',
  messageRetention: 'forever',
  showJoinLeaveMessages: false,
  allowMessageEditing: true,
  allowMessageDeletion: true,
  enableMessageReactions: true,
  enableMessageReplies: true,
  enableMessageForwarding: true,
  autoModeration: {
    spamDetection: true,
    linkFiltering: true,
    imageModeration: false,
  },
};

export const DEFAULT_SPACE_SETTINGS: SpaceSettings = {
  allowPublicRooms: true,
  requireRoomApproval: false,
  defaultRoomPrivacy: 'public',
  memberInvites: true,
  guestAccess: false,
  notificationDefaults: 'all',
  moderationLevel: 'medium',
};

export const DEFAULT_ROOM_MEMBER_SETTINGS: RoomMemberSettings = {
  notificationPreference: 'all',
  isMuted: false,
};

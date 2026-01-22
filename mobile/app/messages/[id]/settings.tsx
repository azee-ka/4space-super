import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../src/store/authStore';
import { useConversation, useMessages } from '../../../src/hooks/useConversations';
import { Avatar } from '../../../src/components/ui';
import { DEFAULT_CONVERSATION_SETTINGS, useChatStore } from '../../../src/store/chatStore';
import { useThemeStore } from '../../../src/store/themeStore';
import { ACCENT_OPTIONS, getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';
import { BackgroundPicker } from '../../../src/components/chat';
import { CHAT_THEME_PRESETS, DEFAULT_CHAT_THEME, getChatThemeById } from '../../../src/styles/chatThemes';
import { CHAT_BACKGROUNDS } from '../../../src/styles/chatBackgrounds';
import { useChatBackgroundStore } from '../../../src/store/chatBackgroundStore';
import { useChatCustomizationStore } from '../../../src/store/chatCustomizationStore';
import { useMessagePreferencesStore } from '../../../src/store/messagePreferencesStore';
import { ColorPicker } from '../../../src/components/ui/ColorPicker';

const SIDE_TABS = [
  { id: 'home', label: 'Home', icon: 'home', color: '#34d399' },
  { id: 'saved', label: 'Saved', icon: 'bookmark', color: '#f59e0b' },
  { id: 'theme', label: 'Theme', icon: 'color-palette', color: '#a855f7' },
  { id: 'settings', label: 'Settings', icon: 'settings', color: '#22d3ee' },
] as const;

type SideTabId = (typeof SIDE_TABS)[number]['id'];

type HomeTabId = 'metrics' | 'media' | 'links' | 'kept' | 'pinned';
type ThemeTabId = (typeof THEME_TABS)[number]['id'];

const HOME_TABS: Array<{ id: HomeTabId; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = [
  { id: 'metrics', label: 'Metrics', icon: 'analytics-outline', color: '#22d3ee' },
  { id: 'media', label: 'Media', icon: 'images-outline', color: '#a855f7' },
  { id: 'links', label: 'Links', icon: 'link-outline', color: '#f97316' },
  { id: 'kept', label: 'Kept', icon: 'bookmark-outline', color: '#f59e0b' },
  { id: 'pinned', label: 'Pinned', icon: 'pin-outline', color: '#f43f5e' },
];

const DENSITY_OPTIONS: { id: 'compact' | 'cozy' | 'spacious'; label: string; description: string }[] = [
  { id: 'compact', label: 'Compact', description: 'Tight spacing for fast scanning' },
  { id: 'cozy', label: 'Cozy', description: 'Balanced spacing for daily use' },
  { id: 'spacious', label: 'Spacious', description: 'Breathing room for focus' },
];

const THEME_TABS = [
  { id: 'featured', label: 'Featured' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'solid', label: 'Solid' },
  { id: 'custom', label: 'Custom' },
] as const;

const BUBBLE_PAIRS = [
  { id: 'neo-mint', label: 'Neo Mint', sent: '#22d3ee', received: '#0f172a' },
  { id: 'vivid-rose', label: 'Vivid Rose', sent: '#f43f5e', received: '#111827' },
  { id: 'electric-violet', label: 'Electric Violet', sent: '#a855f7', received: '#1e1b4b' },
  { id: 'solar-flare', label: 'Solar Flare', sent: '#f97316', received: '#1f2937' },
  { id: 'emerald-wave', label: 'Emerald Wave', sent: '#22c55e', received: '#0f172a' },
  { id: 'skyline', label: 'Skyline', sent: '#38bdf8', received: '#0b1324' },
] as const;

const BUBBLE_SWATCHES = ['#22d3ee', '#a855f7', '#f97316', '#f43f5e', '#22c55e', '#38bdf8', '#f59e0b', '#14b8a6'];
const TEXT_SWATCHES = ['#ffffff', '#e2e8f0', '#111827', '#0f172a', '#1f2937', '#fef3c7'];
const RADIUS_OPTIONS = [12, 16, 20, 24];
const MESSAGE_TEXT_SIZES = [14, 16, 18, 20];
const FEATURED_BACKGROUND_IDS = [
  'tech-1',
  'tech-2',
  'tech-3',
  'tech-matrix',
  'equations',
  'productivity',
  'sports',
  'food',
  'random-objects',
  'mechanical',
  'geometry',
  'graphic-geometry',
  'topography',
  'seasons',
  'data-stream',
  'systems',
  'systems-1',
];
const GRADIENT_BACKGROUND_IDS = [
  'gradient-deep-space',
  'gradient-ocean-depths',
  'gradient-purple-haze',
  'gradient-fire-ember',
  'gradient-tropical-paradise',
  'gradient-lavender-mist',
  'gradient-peach-cream',
  'gradient-mint-fresh',
  'gradient-royal-blue',
  'gradient-rose-wine',
  'gradient-amber-glow',
  'gradient-electric-blue',
];
const SOLID_BACKGROUND_IDS = [
  'solid-classic-dark',
  'solid-midnight-blue',
  'solid-forest-green',
  'solid-crimson-red',
  'solid-amber-gold',
  'solid-pink-rose',
  'solid-cyan-aqua',
  'solid-indigo-deep',
  'solid-emerald-bright',
  'solid-slate-gray',
  'solid-lime-green',
  'solid-orange-sunset',
  'solid-teal-ocean',
  'solid-violet-purple',
  'solid-fuchsia-magenta',
  'solid-sky-blue',
  'void',
  'solid-ink',
  'solid-graphite',
  'solid-obsidian',
  'solid-forest',
  'solid-ocean',
];

const GRADIENT_BUBBLE_PRESETS: Array<{
  id: string;
  label: string;
  sent: [string, string];
  received: [string, string];
}> = [
  { id: 'aurora', label: 'Aurora', sent: ['#22d3ee', '#a855f7'], received: ['#0b1324', '#111827'] },
  { id: 'sunrise', label: 'Sunrise', sent: ['#f97316', '#f43f5e'], received: ['#111827', '#1f2937'] },
  { id: 'mint-glow', label: 'Mint Glow', sent: ['#22c55e', '#14b8a6'], received: ['#0f172a', '#111827'] },
  { id: 'skyline', label: 'Skyline', sent: ['#38bdf8', '#22d3ee'], received: ['#111827', '#0b1324'] },
  { id: 'violet-arc', label: 'Violet Arc', sent: ['#a855f7', '#f43f5e'], received: ['#1e1b4b', '#111827'] },
  { id: 'ember', label: 'Ember', sent: ['#f59e0b', '#f97316'], received: ['#111827', '#1f2937'] },
];

type BubblePreset =
  | { style: 'solid'; sent: string; received: string }
  | { style: 'gradient'; sent: [string, string]; received: [string, string] };

const FEATURED_PRESET_MAP: Record<string, BubblePreset> = {
  'tech-1': { style: 'gradient', sent: ['#a855f7', '#7e22ce'], received: ['#312e81', '#1e1b4b'] },
  'tech-2': { style: 'gradient', sent: ['#f472b6', '#db2777'], received: ['#22d3ee', '#0891b2'] },
  'tech-3': { style: 'gradient', sent: ['#ec4899', '#be185d'], received: ['#06b6d4', '#0e7490'] },
  'tech-matrix': { style: 'gradient', sent: ['#d946ef', '#a21caf'], received: ['#a78bfa', '#6d28d9'] },
  equations: { style: 'gradient', sent: ['#22c55e', '#15803d'], received: ['#f97316', '#c2410c'] },
  productivity: { style: 'gradient', sent: ['#22c55e', '#15803d'], received: ['#047857', '#065f46'] },
  sports: { style: 'gradient', sent: ['#ef4444', '#b91c1c'], received: ['#22c55e', '#15803d'] },
  food: { style: 'gradient', sent: ['#ef4444', '#b91c1c'], received: ['#f97316', '#c2410c'] },
  'random-objects': { style: 'gradient', sent: ['#f59e0b', '#b45309'], received: ['#b45309', '#78350f'] },
  mechanical: { style: 'gradient', sent: ['#f97316', '#c2410c'], received: ['#06b6d4', '#0e7490'] },
  geometry: { style: 'gradient', sent: ['#d946ef', '#a21caf'], received: ['#3b82f6', '#1d4ed8'] },
  'graphic-geometry': { style: 'gradient', sent: ['#ef4444', '#b91c1c'], received: ['#3b82f6', '#1d4ed8'] },
  topography: { style: 'gradient', sent: ['#06b6d4', '#0e7490'], received: ['#14b8a6', '#0f766e'] },
  seasons: { style: 'gradient', sent: ['#f97316', '#c2410c'], received: ['#22c55e', '#15803d'] },
  'data-stream': { style: 'gradient', sent: ['#22c55e', '#15803d'], received: ['#047857', '#065f46'] },
  systems: { style: 'gradient', sent: ['#ec4899', '#be185d'], received: ['#9f1239', '#831843'] },
  'systems-1': { style: 'gradient', sent: ['#f59e0b', '#b45309'], received: ['#92400e', '#78350f'] },
};

const GRADIENT_PRESET_MAP: Record<string, BubblePreset> = {
  'gradient-deep-space': { style: 'gradient', sent: ['#667eea', '#764ba2'], received: ['#27272a', '#27272a'] },
  'gradient-ocean-depths': { style: 'gradient', sent: ['#3b82f6', '#2563eb'], received: ['#334155', '#334155'] },
  'gradient-purple-haze': { style: 'gradient', sent: ['#a855f7', '#8b5cf6'], received: ['#3a2a5a', '#3a2a5a'] },
  'gradient-fire-ember': { style: 'gradient', sent: ['#ef4444', '#ef4444'], received: ['#27272a', '#27272a'] },
  'gradient-tropical-paradise': { style: 'gradient', sent: ['#14b8a6', '#14b8a6'], received: ['#1e293b', '#1e293b'] },
  'gradient-lavender-mist': { style: 'gradient', sent: ['#a78bfa', '#a78bfa'], received: ['#27272a', '#27272a'] },
  'gradient-peach-cream': { style: 'gradient', sent: ['#fb923c', '#fb923c'], received: ['#27272a', '#27272a'] },
  'gradient-mint-fresh': { style: 'gradient', sent: ['#34d399', '#34d399'], received: ['#1f2937', '#1f2937'] },
  'gradient-royal-blue': { style: 'gradient', sent: ['#3b82f6', '#3b82f6'], received: ['#1e293b', '#1e293b'] },
  'gradient-rose-wine': { style: 'gradient', sent: ['#f43f5e', '#f43f5e'], received: ['#27272a', '#27272a'] },
  'gradient-amber-glow': { style: 'gradient', sent: ['#f59e0b', '#f59e0b'], received: ['#27272a', '#27272a'] },
  'gradient-electric-blue': { style: 'gradient', sent: ['#0ea5e9', '#0ea5e9'], received: ['#1e293b', '#1e293b'] },
};

const SOLID_PRESET_MAP: Record<string, BubblePreset> = {
  'solid-classic-dark': { style: 'solid', sent: '#7c3aed', received: '#27272a' },
  'solid-midnight-blue': { style: 'solid', sent: '#3b82f6', received: '#1e293b' },
  'solid-forest-green': { style: 'solid', sent: '#10b981', received: '#1f2937' },
  'solid-crimson-red': { style: 'solid', sent: '#dc2626', received: '#27272a' },
  'solid-amber-gold': { style: 'solid', sent: '#f59e0b', received: '#27272a' },
  'solid-pink-rose': { style: 'solid', sent: '#ec4899', received: '#27272a' },
  'solid-cyan-aqua': { style: 'solid', sent: '#06b6d4', received: '#1e293b' },
  'solid-indigo-deep': { style: 'solid', sent: '#6366f1', received: '#1e1b4b' },
  'solid-emerald-bright': { style: 'solid', sent: '#10b981', received: '#1f2937' },
  'solid-slate-gray': { style: 'solid', sent: '#475569', received: '#1e293b' },
  'solid-lime-green': { style: 'solid', sent: '#84cc16', received: '#27272a' },
  'solid-orange-sunset': { style: 'solid', sent: '#f97316', received: '#27272a' },
  'solid-teal-ocean': { style: 'solid', sent: '#14b8a6', received: '#1e293b' },
  'solid-violet-purple': { style: 'solid', sent: '#8b5cf6', received: '#27272a' },
  'solid-fuchsia-magenta': { style: 'solid', sent: '#d946ef', received: '#27272a' },
  'solid-sky-blue': { style: 'solid', sent: '#0ea5e9', received: '#1e293b' },
  void: { style: 'solid', sent: '#a855f7', received: '#0f172a' },
  'solid-ink': { style: 'solid', sent: '#22d3ee', received: '#0f172a' },
  'solid-graphite': { style: 'solid', sent: '#38bdf8', received: '#111827' },
  'solid-obsidian': { style: 'solid', sent: '#f97316', received: '#0f172a' },
  'solid-forest': { style: 'solid', sent: '#22c55e', received: '#0f172a' },
  'solid-ocean': { style: 'solid', sent: '#0ea5e9', received: '#0f172a' },
};

const THEME_BUBBLE_PRESETS: Record<
  Exclude<ThemeTabId, 'custom'>,
  { solid: typeof BUBBLE_PAIRS; gradient: typeof GRADIENT_BUBBLE_PRESETS }
> = {
  featured: { solid: BUBBLE_PAIRS, gradient: GRADIENT_BUBBLE_PRESETS },
  gradient: { solid: BUBBLE_PAIRS, gradient: GRADIENT_BUBBLE_PRESETS },
  solid: { solid: BUBBLE_PAIRS, gradient: GRADIENT_BUBBLE_PRESETS },
};
const THEME_BACKGROUND_MAP: Record<string, string> = {
  'tech-grid': 'tech-2',
  'neon-pulse': 'tech-3',
  'equation-board': 'equations',
  'productivity-boost': 'productivity',
  'sport-flash': 'sports',
  'food-court': 'food',
  'topography': 'topography',
  'data-stream': 'data-stream',
  'midnight-drive': 'nebula',
  'aurora-forest': 'systems',
};

const extractLinks = (text: string) => {
  const matches = text.match(/https?:\/\/[^\s]+/g);
  return matches || [];
};

export default function ChatSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuthStore();
  const { data: conversation } = useConversation(conversationId || '', user?.id || '');
  const { accentColor, setAccentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const {
    backgroundByConversation,
    customBackgroundUriByConversation,
    setBackgroundId,
    setCustomBackgroundUri,
  } = useChatBackgroundStore();
  const backgroundId = conversationId ? backgroundByConversation[conversationId] || 'void' : 'void';
  const customBackgroundUri = conversationId ? customBackgroundUriByConversation[conversationId] : null;
  const { width } = useWindowDimensions();
  const [pagerWidth, setPagerWidth] = useState(width);
  const contentPagerRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<SideTabId>('home');
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTabId>('metrics');
  const [activeThemeTab, setActiveThemeTab] = useState<ThemeTabId>('featured');
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const {
    pinnedMessages,
    savedMessages,
  } = useMessagePreferencesStore();

  const {
    data: messagePages,
  } = useMessages(conversationId || '');

  const messageList = useMemo(
    () => messagePages?.pages.flat() ?? [],
    [messagePages]
  );
  const sortedMessages = useMemo(
    () => [...messageList].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messageList]
  );
  const sentCount = useMemo(
    () => (user?.id ? messageList.filter((msg) => msg.sender_id === user.id).length : 0),
    [messageList, user?.id]
  );
  const receivedCount = useMemo(
    () => (user?.id ? messageList.filter((msg) => msg.sender_id !== user.id).length : 0),
    [messageList, user?.id]
  );

  const totalCharacters = useMemo(
    () => messageList.reduce((sum, msg) => sum + (msg.content?.length || 0), 0),
    [messageList]
  );
  const averageLength = messageList.length ? Math.round(totalCharacters / messageList.length) : 0;
  const averagePerDay = messageSpanDays ? Math.round(messageList.length / messageSpanDays) : 0;
  const averageGapMinutes = useMemo(() => {
    if (sortedMessages.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < sortedMessages.length; i += 1) {
      sum += new Date(sortedMessages[i].created_at).getTime() - new Date(sortedMessages[i - 1].created_at).getTime();
    }
    return Math.round(sum / (sortedMessages.length - 1) / 60000);
  }, [sortedMessages]);
  const averageResponseMinutes = useMemo(() => {
    if (!user?.id || sortedMessages.length < 2) return 0;
    let sum = 0;
    let count = 0;
    for (let i = 1; i < sortedMessages.length; i += 1) {
      const prev = sortedMessages[i - 1];
      const current = sortedMessages[i];
      if (prev.sender_id !== current.sender_id) {
        sum += new Date(current.created_at).getTime() - new Date(prev.created_at).getTime();
        count += 1;
      }
    }
    return count ? Math.round(sum / count / 60000) : 0;
  }, [sortedMessages, user?.id]);
  const newestMessageAt = messageList[0]?.created_at;
  const oldestMessageAt = messageList[messageList.length - 1]?.created_at;
  const messageSpanDays = useMemo(() => {
    if (!newestMessageAt || !oldestMessageAt) return 0;
    const start = new Date(oldestMessageAt).getTime();
    const end = new Date(newestMessageAt).getTime();
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [newestMessageAt, oldestMessageAt]);

  const peakHour = useMemo(() => {
    if (messageList.length === 0) return null;
    const buckets = new Array(24).fill(0);
    messageList.forEach((msg) => {
      const hour = new Date(msg.created_at).getHours();
      buckets[hour] += 1;
    });
    const max = Math.max(...buckets);
    const hourIndex = buckets.findIndex((count) => count === max);
    return `${hourIndex}:00`;
  }, [messageList]);

  const peakDay = useMemo(() => {
    if (messageList.length === 0) return null;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets = new Array(7).fill(0);
    messageList.forEach((msg) => {
      const day = new Date(msg.created_at).getDay();
      buckets[day] += 1;
    });
    const max = Math.max(...buckets);
    const dayIndex = buckets.findIndex((count) => count === max);
    return dayNames[dayIndex];
  }, [messageList]);

  const mediaItems = useMemo(
    () => messageList.filter((msg) => Boolean(msg.file_url) || msg.type !== 'text'),
    [messageList]
  );

  const linkItems = useMemo(
    () => messageList.flatMap((msg) => extractLinks(msg.content || '')),
    [messageList]
  );

  const mediaRate = messageList.length ? Math.round((mediaItems.length / messageList.length) * 100) : 0;
  const linkRate = messageList.length ? Math.round((linkItems.length / messageList.length) * 100) : 0;

  const savedIds = conversationId ? savedMessages[conversationId] || [] : [];
  const pinnedMessageId = conversationId ? pinnedMessages[conversationId] : null;

  const savedItems = useMemo(
    () => savedIds.map((id) => messageList.find((msg) => msg.id === id)).filter(Boolean),
    [savedIds, messageList]
  );

  const pinnedMessage = useMemo(
    () => (pinnedMessageId ? messageList.find((msg) => msg.id === pinnedMessageId) : undefined),
    [pinnedMessageId, messageList]
  );

  const settings = useChatStore((state) =>
    conversationId
      ? state.conversationSettings[conversationId] || DEFAULT_CONVERSATION_SETTINGS
      : DEFAULT_CONVERSATION_SETTINGS
  );
  const setConversationSettings = useChatStore((state) => state.setConversationSettings);

  const conversationCustomizations = useChatCustomizationStore((state) => state.conversationCustomizations);
  const conversationCustomization = conversationId ? conversationCustomizations[conversationId] : undefined;
  const chatTheme = useMemo(() => {
    if (!conversationId) {
      return { ...DEFAULT_CHAT_THEME, density: 'cozy' as const };
    }
    const customization = conversationCustomization;
    const base = getChatThemeById(customization?.themeId);
    return {
      ...base,
      sentBubbleColor: customization?.sentBubbleColor || base.sentBubbleColor,
      receivedBubbleColor: customization?.receivedBubbleColor || base.receivedBubbleColor,
      sentTextColor: customization?.sentTextColor || base.sentTextColor,
      receivedTextColor: customization?.receivedTextColor || base.receivedTextColor,
      bubbleRadius: customization?.bubbleRadius ?? base.bubbleRadius,
      density: customization?.density || base.density || 'cozy' as const,
    };
  }, [conversationId, conversationCustomization]);
  const bubbleStyle = conversationCustomization?.bubbleStyle || 'solid';
  const sentBubbleGradient = conversationCustomization?.sentBubbleGradient || [
    chatTheme.sentBubbleColor,
    chatTheme.sentBubbleColor,
  ];
  const receivedBubbleGradient = conversationCustomization?.receivedBubbleGradient || [
    chatTheme.receivedBubbleColor,
    chatTheme.receivedBubbleColor,
  ];
  const messageTextSize = conversationCustomization?.messageTextSize ?? 15;
  const callControlsEnabled = useMemo(() => {
    if (!conversationId) return true;
    const customization = conversationCustomizations[conversationId];
    return customization?.enableCallControls !== false;
  }, [conversationId, conversationCustomizations]);
  const setCallControls = useChatCustomizationStore((state) => state.setCallControls);
  const setConversationTheme = useChatCustomizationStore((state) => state.setConversationTheme);
  const setConversationDensity = useChatCustomizationStore((state) =>
    state.setConversationDensity
  );
  const setBubbleColors = useChatCustomizationStore((state) => state.setBubbleColors);
  const setTextColors = useChatCustomizationStore((state) => state.setTextColors);
  const setBubbleRadius = useChatCustomizationStore((state) => state.setBubbleRadius);
  const setBubbleStyle = useChatCustomizationStore((state) => state.setBubbleStyle);
  const setBubbleGradients = useChatCustomizationStore((state) => state.setBubbleGradients);
  const setMessageTextSize = useChatCustomizationStore((state) => state.setMessageTextSize);
  const resetBubbleStyle = useChatCustomizationStore((state) => state.resetBubbleStyle);

  const { headerTitle, avatarUri, avatarSeed } = useMemo(() => {
    if (!conversation) {
      return { headerTitle: 'Chat Settings', avatarUri: undefined, avatarSeed: 'chat-settings' };
    }
    if (conversation.type === 'group') {
      return {
        headerTitle: conversation.name || 'Group Chat',
        avatarUri: conversation.avatar_url,
        avatarSeed: conversation.id,
      };
    }
    const other = conversation.participants?.[0];
    return {
      headerTitle: other?.display_name || other?.username || 'Chat',
      avatarUri: other?.avatar_url,
      avatarSeed: other?.id || conversation.id,
    };
  }, [conversation]);

  const densityOption = DENSITY_OPTIONS.find((option) => option.id === chatTheme.density) ||
    DENSITY_OPTIONS[1];
  const matchingBackgroundId = THEME_BACKGROUND_MAP[chatTheme.id];
  const backgroundsByTab = useMemo(
    () => ({
      featured: CHAT_BACKGROUNDS.filter((preset) => FEATURED_BACKGROUND_IDS.includes(preset.id)),
      gradient: CHAT_BACKGROUNDS.filter((preset) => GRADIENT_BACKGROUND_IDS.includes(preset.id)),
      solid: CHAT_BACKGROUNDS.filter((preset) => SOLID_BACKGROUND_IDS.includes(preset.id)),
      custom: [],
    }),
    []
  );
  const backgroundPresetMap = useMemo(
    () => ({
      featured: FEATURED_PRESET_MAP,
      gradient: GRADIENT_PRESET_MAP,
      solid: SOLID_PRESET_MAP,
    }),
    []
  );
  const customDefaults = useMemo(
    () => ({
      sent: '#a855f7',
      received: '#0f172a',
      sentText: '#f8fafc',
      receivedText: '#e2e8f0',
    }),
    []
  );

  const [customInputs, setCustomInputs] = useState(() => ({
    sent: chatTheme.sentBubbleColor,
    received: chatTheme.receivedBubbleColor,
    sentStart: sentBubbleGradient[0],
    sentEnd: sentBubbleGradient[1],
    receivedStart: receivedBubbleGradient[0],
    receivedEnd: receivedBubbleGradient[1],
  }));
  const [colorPickerTarget, setColorPickerTarget] = useState<null | {
    key: 'sent' | 'received' | 'sentStart' | 'sentEnd' | 'receivedStart' | 'receivedEnd';
    label: string;
  }>(null);
  const [colorPickerValue, setColorPickerValue] = useState('#ffffff');

  useEffect(() => {
    setCustomInputs({
      sent: chatTheme.sentBubbleColor,
      received: chatTheme.receivedBubbleColor,
      sentStart: sentBubbleGradient[0],
      sentEnd: sentBubbleGradient[1],
      receivedStart: receivedBubbleGradient[0],
      receivedEnd: receivedBubbleGradient[1],
    });
  }, [
    chatTheme.sentBubbleColor,
    chatTheme.receivedBubbleColor,
    sentBubbleGradient[0],
    sentBubbleGradient[1],
    receivedBubbleGradient[0],
    receivedBubbleGradient[1],
  ]);

  useEffect(() => {
    if (activeThemeTab !== 'custom') return;
    if (!conversationId) return;
    if (customBackgroundUri) {
      setBackgroundId(conversationId, 'custom-photo');
      return;
    }
    if (backgroundId === 'custom-photo') {
      setBackgroundId(conversationId, 'void');
    }
    if (
      !conversationCustomization?.sentBubbleColor &&
      !conversationCustomization?.receivedBubbleColor &&
      !conversationCustomization?.sentBubbleGradient &&
      !conversationCustomization?.receivedBubbleGradient
    ) {
      setBubbleStyle(conversationId, 'solid');
      setBubbleColors(conversationId, {
        sent: customDefaults.sent,
        received: customDefaults.received,
      });
      setTextColors(conversationId, {
        sent: customDefaults.sentText,
        received: customDefaults.receivedText,
      });
    }
  }, [
    activeThemeTab,
    backgroundId,
    conversationCustomization?.receivedBubbleColor,
    conversationCustomization?.sentBubbleColor,
    conversationCustomization?.receivedBubbleGradient,
    conversationCustomization?.sentBubbleGradient,
    conversationId,
    customBackgroundUri,
    customDefaults,
    setBackgroundId,
    setBubbleColors,
    setBubbleStyle,
    setTextColors,
  ]);

  const handlePickCustomBackground = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to set a custom background.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images' as ImagePicker.MediaType],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      if (!conversationId) return;
      setCustomBackgroundUri(conversationId, result.assets[0].uri);
      setBackgroundId(conversationId, 'custom-photo');
    }
  };

  const handleClearCustomBackground = () => {
    if (!conversationId) return;
    setCustomBackgroundUri(conversationId, null);
    if (backgroundId === 'custom-photo') {
      setBackgroundId(conversationId, 'void');
    }
  };

  const applyCustomDefaults = () => {
    if (!conversationId) return;
    setBackgroundId(conversationId, 'void');
    setBubbleStyle(conversationId, 'solid');
    setBubbleColors(conversationId, {
      sent: customDefaults.sent,
      received: customDefaults.received,
    });
    setTextColors(conversationId, {
      sent: customDefaults.sentText,
      received: customDefaults.receivedText,
    });
  };

  const updateCustomInput = (key: keyof typeof customInputs, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [key]: value }));
  };

  const isValidHex = (value: string) => /^#([0-9a-fA-F]{6})$/.test(value.trim());

  const applySolidInput = (key: 'sent' | 'received', value: string) => {
    if (!isValidHex(value)) {
      updateCustomInput(key, key === 'sent' ? chatTheme.sentBubbleColor : chatTheme.receivedBubbleColor);
      return;
    }
    setBubbleStyle(conversationId, 'solid');
    setBubbleColors(conversationId, { [key]: value.trim() });
  };

  const applyGradientInput = (target: 'sentStart' | 'sentEnd' | 'receivedStart' | 'receivedEnd', value: string) => {
    if (!isValidHex(value)) {
      const fallback = {
        sentStart: sentBubbleGradient[0],
        sentEnd: sentBubbleGradient[1],
        receivedStart: receivedBubbleGradient[0],
        receivedEnd: receivedBubbleGradient[1],
      };
      updateCustomInput(target, fallback[target]);
      return;
    }
    const nextSent: [string, string] = [
      target === 'sentStart' ? value.trim() : sentBubbleGradient[0],
      target === 'sentEnd' ? value.trim() : sentBubbleGradient[1],
    ];
    const nextReceived: [string, string] = [
      target === 'receivedStart' ? value.trim() : receivedBubbleGradient[0],
      target === 'receivedEnd' ? value.trim() : receivedBubbleGradient[1],
    ];
    setBubbleStyle(conversationId, 'gradient');
    setBubbleGradients(conversationId, { sent: nextSent, received: nextReceived });
  };

  const openColorPicker = (
    key: 'sent' | 'received' | 'sentStart' | 'sentEnd' | 'receivedStart' | 'receivedEnd',
    label: string
  ) => {
    setColorPickerTarget({ key, label });
    setColorPickerValue(customInputs[key]);
  };

  const applyColorPicker = () => {
    if (!colorPickerTarget) return;
    updateCustomInput(colorPickerTarget.key, colorPickerValue);
    if (colorPickerTarget.key === 'sent' || colorPickerTarget.key === 'received') {
      applySolidInput(colorPickerTarget.key, colorPickerValue);
    } else {
      applyGradientInput(colorPickerTarget.key, colorPickerValue);
    }
    setColorPickerTarget(null);
  };

  if (!conversationId) {
    return null;
  }

  const renderMetrics = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Conversation Metrics</Text>
      <View style={styles.metricGrid}>
        <View style={[styles.metricCard, styles.metricCardCyan]}>
          <View style={styles.metricHeader}>
            <Ionicons name="chatbubbles-outline" size={16} color="#22d3ee" />
            <Text style={styles.metricLabel}>Messages</Text>
          </View>
          <Text style={styles.metricValue}>{messageList.length}</Text>
          <Text style={styles.metricHint}>Loaded in view</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardEmerald]}>
          <View style={styles.metricHeader}>
            <Ionicons name="people-outline" size={16} color="#34d399" />
            <Text style={styles.metricLabel}>Participants</Text>
          </View>
          <Text style={styles.metricValue}>{(conversation?.participants?.length || 0) + 1}</Text>
          <Text style={styles.metricHint}>Active members</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardViolet]}>
          <View style={styles.metricHeader}>
            <Ionicons name="images-outline" size={16} color="#a855f7" />
            <Text style={styles.metricLabel}>Media</Text>
          </View>
          <Text style={styles.metricValue}>{mediaItems.length}</Text>
          <Text style={styles.metricHint}>{mediaRate}% of chat</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardOrange]}>
          <View style={styles.metricHeader}>
            <Ionicons name="link-outline" size={16} color="#f97316" />
            <Text style={styles.metricLabel}>Links</Text>
          </View>
          <Text style={styles.metricValue}>{linkItems.length}</Text>
          <Text style={styles.metricHint}>{linkRate}% of chat</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardRose]}>
          <View style={styles.metricHeader}>
            <Ionicons name="send-outline" size={16} color="#f59e0b" />
            <Text style={styles.metricLabel}>Sent</Text>
          </View>
          <Text style={styles.metricValue}>{sentCount}</Text>
          <Text style={styles.metricHint}>Your messages</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardIndigo]}>
          <View style={styles.metricHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={16} color="#38bdf8" />
            <Text style={styles.metricLabel}>Received</Text>
          </View>
          <Text style={styles.metricValue}>{receivedCount}</Text>
          <Text style={styles.metricHint}>From others</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardAmber]}>
          <View style={styles.metricHeader}>
            <Ionicons name="text-outline" size={16} color="#fbbf24" />
            <Text style={styles.metricLabel}>Avg length</Text>
          </View>
          <Text style={styles.metricValue}>{averageLength}</Text>
          <Text style={styles.metricHint}>Characters</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardTeal]}>
          <View style={styles.metricHeader}>
            <Ionicons name="calendar-outline" size={16} color="#14b8a6" />
            <Text style={styles.metricLabel}>Avg/day</Text>
          </View>
          <Text style={styles.metricValue}>{averagePerDay}</Text>
          <Text style={styles.metricHint}>Messages/day</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardCyan]}>
          <View style={styles.metricHeader}>
            <Ionicons name="timer-outline" size={16} color="#22d3ee" />
            <Text style={styles.metricLabel}>Avg gap</Text>
          </View>
          <Text style={styles.metricValue}>{averageGapMinutes}m</Text>
          <Text style={styles.metricHint}>Between messages</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardViolet]}>
          <View style={styles.metricHeader}>
            <Ionicons name="swap-horizontal-outline" size={16} color="#a855f7" />
            <Text style={styles.metricLabel}>Response</Text>
          </View>
          <Text style={styles.metricValue}>{averageResponseMinutes}m</Text>
          <Text style={styles.metricHint}>Avg reply time</Text>
        </View>
      </View>

      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Conversation Pulse</Text>
        <Text style={styles.analyticsBody}>
          Peak activity and response timing are calculated from the messages loaded on device.
        </Text>
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsPill}>
            <Ionicons name="pulse-outline" size={14} color="#22d3ee" />
            <Text style={styles.analyticsPillText}>Realtime insights</Text>
          </View>
          <View style={styles.analyticsPill}>
            <Ionicons name="speedometer-outline" size={14} color="#f59e0b" />
            <Text style={styles.analyticsPillText}>Fast overview</Text>
          </View>
        </View>
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.analyticsTitle}>Timeline Highlights</Text>
        <View style={styles.timelineRow}>
          <Ionicons name="time-outline" size={16} color="#22d3ee" />
          <View style={styles.timelineMeta}>
            <Text style={styles.timelineLabel}>Newest message</Text>
            <Text style={styles.timelineValue}>{newestMessageAt ? new Date(newestMessageAt).toLocaleString() : '—'}</Text>
          </View>
        </View>
        <View style={styles.timelineRow}>
          <Ionicons name="hourglass-outline" size={16} color="#a855f7" />
          <View style={styles.timelineMeta}>
            <Text style={styles.timelineLabel}>Oldest loaded</Text>
            <Text style={styles.timelineValue}>{oldestMessageAt ? new Date(oldestMessageAt).toLocaleString() : '—'}</Text>
          </View>
        </View>
        <View style={styles.timelineRow}>
          <Ionicons name="calendar-outline" size={16} color="#14b8a6" />
          <View style={styles.timelineMeta}>
            <Text style={styles.timelineLabel}>Peak hour</Text>
            <Text style={styles.timelineValue}>{peakHour || '—'}</Text>
          </View>
        </View>
        <View style={styles.timelineRow}>
          <Ionicons name="sparkles-outline" size={16} color="#f59e0b" />
          <View style={styles.timelineMeta}>
            <Text style={styles.timelineLabel}>Peak day</Text>
            <Text style={styles.timelineValue}>{peakDay || '—'}</Text>
          </View>
        </View>
        <View style={styles.timelineRow}>
          <Ionicons name="pin-outline" size={16} color="#f43f5e" />
          <View style={styles.timelineMeta}>
            <Text style={styles.timelineLabel}>Pinned status</Text>
            <Text style={styles.timelineValue}>{pinnedMessage ? 'Pinned message ready' : 'No pin yet'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMedia = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Shared Media</Text>
      {mediaItems.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Ionicons name="images-outline" size={28} color="#a855f7" />
          <Text style={styles.emptyTitle}>No media yet</Text>
          <Text style={styles.emptySubtitle}>Photos, videos, and files appear here.</Text>
        </View>
      ) : (
        mediaItems.slice(0, 6).map((item) => (
          <View key={item.id} style={styles.listRow}>
            <View style={[styles.listIcon, { backgroundColor: 'rgba(168, 85, 247, 0.18)' }]}>
              <Ionicons name="image-outline" size={18} color="#a855f7" />
            </View>
            <View style={styles.listMeta}>
              <Text style={styles.listTitle}>Attachment</Text>
              <Text style={styles.listSubtitle} numberOfLines={1}>
                {item.file_name || item.content || 'Media file'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </View>
        ))
      )}
    </View>
  );

  const renderLinks = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Shared Links</Text>
      {linkItems.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Ionicons name="link-outline" size={28} color="#f97316" />
          <Text style={styles.emptyTitle}>No links yet</Text>
          <Text style={styles.emptySubtitle}>Links shared in chat will show up here.</Text>
        </View>
      ) : (
        linkItems.slice(0, 8).map((link, index) => (
          <View key={`${link}-${index}`} style={styles.listRow}>
            <View style={[styles.listIcon, { backgroundColor: 'rgba(249, 115, 22, 0.18)' }]}
            >
              <Ionicons name="link-outline" size={18} color="#f97316" />
            </View>
            <View style={styles.listMeta}>
              <Text style={styles.listTitle}>Shared link</Text>
              <Text style={styles.listSubtitle} numberOfLines={1}>{link}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={theme.colors.textSubtle} />
          </View>
        ))
      )}
    </View>
  );

  const renderKept = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Kept Messages</Text>
      {savedItems.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Ionicons name="bookmark-outline" size={28} color="#f59e0b" />
          <Text style={styles.emptyTitle}>No kept messages</Text>
          <Text style={styles.emptySubtitle}>Save important moments to keep them close.</Text>
        </View>
      ) : (
        savedItems.slice(0, 6).map((msg) => (
          <View key={msg.id} style={styles.listRow}>
            <View style={[styles.listIcon, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}>
              <Ionicons name="bookmark" size={18} color="#f59e0b" />
            </View>
            <View style={styles.listMeta}>
              <Text style={styles.listTitle}>Kept message</Text>
              <Text style={styles.listSubtitle} numberOfLines={1}>
                {msg.content || 'Saved message'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </View>
        ))
      )}
    </View>
  );

  const renderPinned = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Pinned Highlights</Text>
      {!pinnedMessage ? (
        <View style={styles.emptyPanel}>
          <Ionicons name="pin-outline" size={28} color="#f43f5e" />
          <Text style={styles.emptyTitle}>Nothing pinned</Text>
          <Text style={styles.emptySubtitle}>Pin key moments so they stay on top.</Text>
        </View>
      ) : (
        <View style={styles.listRow}>
          <View style={[styles.listIcon, { backgroundColor: 'rgba(244, 63, 94, 0.18)' }]}
          >
            <Ionicons name="pin" size={18} color="#f43f5e" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Pinned message</Text>
            <Text style={styles.listSubtitle} numberOfLines={2}>
              {pinnedMessage.content || 'Pinned'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </View>
      )}
    </View>
  );

  const renderHomeContent = () => {
    switch (activeHomeTab) {
      case 'media':
        return renderMedia();
      case 'links':
        return renderLinks();
      case 'kept':
        return renderKept();
      case 'pinned':
        return renderPinned();
      default:
        return renderMetrics();
    }
  };

  const renderSavedTab = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Saved Universe</Text>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles-outline" size={18} color="#f59e0b" />
          <Text style={styles.heroBadgeText}>Collections</Text>
        </View>
        <Text style={styles.heroTitle}>{savedItems.length} kept moments</Text>
        <Text style={styles.heroSubtitle}>
          Your saved reactions, notes, and highlights sync here.
        </Text>
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.primaryChip}>
            <Ionicons name="add" size={16} color={theme.colors.base} />
            <Text style={styles.primaryChipText}>New collection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryChip}>
            <Ionicons name="grid-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.secondaryChipText}>Organize</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent keeps</Text>
      {savedItems.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Ionicons name="bookmark-outline" size={28} color="#f59e0b" />
          <Text style={styles.emptyTitle}>No saved items</Text>
          <Text style={styles.emptySubtitle}>Save messages from the chat to see them here.</Text>
        </View>
      ) : (
        savedItems.slice(0, 6).map((msg) => (
          <View key={msg.id} style={styles.listRow}>
            <View style={[styles.listIcon, { backgroundColor: 'rgba(245, 158, 11, 0.18)' }]}
            >
              <Ionicons name="bookmark" size={18} color="#f59e0b" />
            </View>
            <View style={styles.listMeta}>
              <Text style={styles.listTitle}>Saved</Text>
              <Text style={styles.listSubtitle} numberOfLines={1}>{msg.content}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </View>
        ))
      )}
    </View>
  );

  const renderThemeTab = () => {
    const activeBackgrounds = backgroundsByTab[activeThemeTab];
    const presetSet = activeThemeTab === 'custom' ? null : THEME_BUBBLE_PRESETS[activeThemeTab];
    const bubblePresets = presetSet ? (bubbleStyle === 'gradient' ? presetSet.gradient : presetSet.solid) : [];

    return (
      <View style={styles.sectionStack}>
        <Text style={styles.sectionTitle}>Theme Studio</Text>
        <View style={styles.themeTabRow}>
          {THEME_TABS.map((tab) => {
            const isActive = activeThemeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.themeTab, isActive && styles.themeTabActive]}
                onPress={() => setActiveThemeTab(tab.id)}
              >
                <Text style={[styles.themeTabText, isActive && styles.themeTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeThemeTab === 'featured' && (
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(34, 211, 238, 0.18)' }]}>
                  <Ionicons name="sparkles-outline" size={16} color="#22d3ee" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Scene presets</Text>
                  <Text style={styles.settingHint}>Apply a curated scene with matching tones.</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={() => {
                  if (matchingBackgroundId) {
                    if (!conversationId) return;
                    setBackgroundId(conversationId, matchingBackgroundId as any);
                  }
                }}
              >
                <Ionicons name="color-wand-outline" size={16} color={theme.colors.base} />
                <Text style={styles.syncButtonText}>Sync</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.presetGrid}>
              {CHAT_THEME_PRESETS.map((preset) => {
                const isActive = preset.id === chatTheme.id;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.presetCard, isActive && styles.presetCardActive]}
                    onPress={() => setConversationTheme(conversationId, preset.id)}
                  >
                    <View style={[styles.presetSwatch, { backgroundColor: preset.backgroundColor }]} />
                    <View style={styles.presetBubbleRow}>
                      <View style={[styles.presetBubble, { backgroundColor: preset.sentBubbleColor }]} />
                      <View style={[styles.presetBubble, { backgroundColor: preset.receivedBubbleColor }]} />
                    </View>
                    <Text style={styles.presetTitle}>{preset.name}</Text>
                    <Text style={styles.presetSubtitle} numberOfLines={2}>{preset.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {activeThemeTab !== 'custom' && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: 'rgba(168, 85, 247, 0.18)' }]}>
                    <Ionicons name="images-outline" size={16} color="#a855f7" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Background presets</Text>
                    <Text style={styles.settingHint}>Pick a canvas that fits the vibe.</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowBackgroundPicker(true)}>
                  <Ionicons name="expand-outline" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.backgroundGrid}>
                {activeBackgrounds.map((preset) => {
                  const isActive = preset.id === backgroundId;
                  const presetMap = backgroundPresetMap[activeThemeTab];
                  const bubblePreset = presetMap?.[preset.id];
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[styles.backgroundCard, isActive && styles.backgroundCardActive]}
                      onPress={() => {
                        if (!conversationId) return;
                        setBackgroundId(conversationId, preset.id);
                        if (!bubblePreset) return;
                        if (bubblePreset.style === 'gradient') {
                          setBubbleStyle(conversationId, 'gradient');
                          setBubbleGradients(conversationId, {
                            sent: bubblePreset.sent,
                            received: bubblePreset.received,
                          });
                        } else {
                          setBubbleStyle(conversationId, 'solid');
                          setBubbleColors(conversationId, {
                            sent: bubblePreset.sent,
                            received: bubblePreset.received,
                          });
                        }
                      }}
                    >
                  {preset.type === 'image' && preset.image ? (
                    <ImageBackground
                      source={preset.image}
                      style={styles.backgroundPreview}
                      imageStyle={styles.backgroundPreviewImage}
                    >
                      <View
                        style={[
                          styles.backgroundOverlay,
                          { backgroundColor: preset.overlayColor, opacity: preset.overlayOpacity },
                        ]}
                      />
                    </ImageBackground>
                  ) : preset.type === 'gradient' && preset.colors ? (
                    <LinearGradient colors={preset.colors} style={styles.backgroundPreview}>
                      <View
                        style={[
                          styles.backgroundOverlay,
                          { backgroundColor: preset.overlayColor, opacity: preset.overlayOpacity },
                        ]}
                      />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.backgroundPreview, { backgroundColor: preset.color || theme.colors.base }]} />
                  )}
                      {bubblePreset && (
                        <View style={styles.backgroundBubbleRow}>
                          {bubblePreset.style === 'gradient' ? (
                            <>
                              <LinearGradient colors={bubblePreset.sent} style={styles.backgroundBubble} />
                              <LinearGradient colors={bubblePreset.received} style={styles.backgroundBubble} />
                            </>
                          ) : (
                            <>
                              <View style={[styles.backgroundBubble, { backgroundColor: bubblePreset.sent }]} />
                              <View style={[styles.backgroundBubble, { backgroundColor: bubblePreset.received }]} />
                            </>
                          )}
                        </View>
                      )}
                      <Text style={[styles.backgroundLabel, isActive && styles.backgroundLabelActive]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Bubble style</Text>
              <View style={styles.pillToggleRow}>
                {(['solid', 'gradient'] as const).map((option) => {
                  const isActive = bubbleStyle === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.pillToggle, isActive && styles.pillToggleActive]}
                      onPress={() => {
                        if (option === 'gradient') {
                          setBubbleStyle(conversationId, 'gradient');
                          setBubbleGradients(conversationId, {
                            sent: sentBubbleGradient,
                            received: receivedBubbleGradient,
                          });
                        } else {
                          setBubbleStyle(conversationId, 'solid');
                        }
                      }}
                    >
                      <Text style={[styles.pillToggleText, isActive && styles.pillToggleTextActive]}>
                        {option === 'solid' ? 'Solid bubbles' : 'Gradient bubbles'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {presetSet && (
                <>
                  <Text style={styles.settingHint}>
                    {bubbleStyle === 'solid'
                      ? 'Pick a solid pair for sent/received.'
                      : 'Pick gradient pairs matched to the background.'}
                  </Text>
                  <View style={styles.pairGrid}>
                    {bubblePresets.map((pair) => (
                      <TouchableOpacity
                        key={pair.id}
                        style={styles.pairCard}
                        onPress={() => {
                          if (bubbleStyle === 'gradient') {
                            const gradientPair = pair as (typeof GRADIENT_BUBBLE_PRESETS)[number];
                            setBubbleStyle(conversationId, 'gradient');
                            setBubbleGradients(conversationId, {
                              sent: gradientPair.sent,
                              received: gradientPair.received,
                            });
                          } else {
                            const solidPair = pair as (typeof BUBBLE_PAIRS)[number];
                            setBubbleStyle(conversationId, 'solid');
                            setBubbleColors(conversationId, {
                              sent: solidPair.sent,
                              received: solidPair.received,
                            });
                          }
                        }}
                      >
                        <View style={styles.pairSwatches}>
                          {bubbleStyle === 'gradient' ? (
                            <>
                              <LinearGradient colors={(pair as any).sent} style={styles.pairDot} />
                              <LinearGradient colors={(pair as any).received} style={styles.pairDot} />
                            </>
                          ) : (
                            <>
                              <View style={[styles.pairDot, { backgroundColor: (pair as any).sent }]} />
                              <View style={[styles.pairDot, { backgroundColor: (pair as any).received }]} />
                            </>
                          )}
                    </View>
                    <Text style={styles.pairLabel}>{pair.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {activeThemeTab !== 'custom' && (
          <View style={styles.sectionCard}>
            <Text style={styles.settingLabel}>Adjust bubble colors</Text>
            <Text style={styles.settingHint}>Override the preset without changing the background.</Text>
            {bubbleStyle === 'solid' ? (
              <>
                <View style={styles.colorPickerRow}>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => openColorPicker('sent', 'Sent bubble')}
                  >
                    <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.sent }]} />
                    <View style={styles.colorPickerMeta}>
                      <Text style={styles.colorPickerLabel}>Sent</Text>
                      <Text style={styles.colorPickerValue}>{customInputs.sent}</Text>
                    </View>
                    <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => openColorPicker('received', 'Received bubble')}
                  >
                    <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.received }]} />
                    <View style={styles.colorPickerMeta}>
                      <Text style={styles.colorPickerLabel}>Received</Text>
                      <Text style={styles.colorPickerValue}>{customInputs.received}</Text>
                    </View>
                    <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.settingLabel, { marginTop: 12 }]}>Sent swatches</Text>
                <View style={styles.swatchRow}>
                  {BUBBLE_SWATCHES.map((color) => (
                    <TouchableOpacity
                      key={`solid-sent-${color}`}
                      style={[styles.swatch, { backgroundColor: color }, chatTheme.sentBubbleColor === color && styles.swatchActive]}
                      onPress={() => setBubbleColors(conversationId, { sent: color })}
                    />
                  ))}
                </View>
                <Text style={[styles.settingLabel, { marginTop: 12 }]}>Received swatches</Text>
                <View style={styles.swatchRow}>
                  {BUBBLE_SWATCHES.map((color) => (
                    <TouchableOpacity
                      key={`solid-received-${color}`}
                      style={[styles.swatch, { backgroundColor: color }, chatTheme.receivedBubbleColor === color && styles.swatchActive]}
                      onPress={() => setBubbleColors(conversationId, { received: color })}
                    />
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={styles.colorPickerRow}>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => openColorPicker('sentStart', 'Sent gradient start')}
                  >
                    <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.sentStart }]} />
                    <View style={styles.colorPickerMeta}>
                      <Text style={styles.colorPickerLabel}>Sent start</Text>
                      <Text style={styles.colorPickerValue}>{customInputs.sentStart}</Text>
                    </View>
                    <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => openColorPicker('sentEnd', 'Sent gradient end')}
                  >
                    <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.sentEnd }]} />
                    <View style={styles.colorPickerMeta}>
                      <Text style={styles.colorPickerLabel}>Sent end</Text>
                      <Text style={styles.colorPickerValue}>{customInputs.sentEnd}</Text>
                    </View>
                    <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.colorPickerRow}>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => openColorPicker('receivedStart', 'Received gradient start')}
                  >
                    <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.receivedStart }]} />
                    <View style={styles.colorPickerMeta}>
                      <Text style={styles.colorPickerLabel}>Received start</Text>
                      <Text style={styles.colorPickerValue}>{customInputs.receivedStart}</Text>
                    </View>
                    <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => openColorPicker('receivedEnd', 'Received gradient end')}
                  >
                    <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.receivedEnd }]} />
                    <View style={styles.colorPickerMeta}>
                      <Text style={styles.colorPickerLabel}>Received end</Text>
                      <Text style={styles.colorPickerValue}>{customInputs.receivedEnd}</Text>
                    </View>
                    <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.settingLabel, { marginTop: 12 }]}>Gradient swatches</Text>
                <View style={styles.swatchRow}>
                  {GRADIENT_BUBBLE_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={`gradient-swatch-${preset.id}`}
                      style={styles.gradientSwatch}
                      onPress={() => {
                        setBubbleStyle(conversationId, 'gradient');
                        setBubbleGradients(conversationId, {
                          sent: preset.sent,
                          received: preset.received,
                        });
                      }}
                    >
                      <LinearGradient colors={preset.sent} style={styles.gradientSwatchHalf} />
                      <LinearGradient colors={preset.received} style={styles.gradientSwatchHalf} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
          </>
        )}

        {activeThemeTab === 'custom' && (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Custom background</Text>
              <Text style={styles.settingHint}>Upload a photo or keep the default dark canvas.</Text>
              {customBackgroundUri ? (
                <ImageBackground
                  source={{ uri: customBackgroundUri }}
                  style={styles.customPreview}
                  imageStyle={styles.customPreviewImage}
                >
                  <View style={styles.customPreviewOverlay} />
                </ImageBackground>
              ) : (
                <View style={styles.customPreviewFallback}>
                  <Ionicons name="image-outline" size={18} color={theme.colors.textMuted} />
                  <Text style={styles.customPreviewText}>No custom photo selected</Text>
                </View>
              )}
              <View style={styles.customActionRow}>
                <TouchableOpacity style={styles.secondaryChip} onPress={handlePickCustomBackground}>
                  <Ionicons name="cloud-upload-outline" size={16} color={theme.colors.textMuted} />
                  <Text style={styles.secondaryChipText}>Upload photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryChip} onPress={handleClearCustomBackground}>
                  <Ionicons name="close-outline" size={16} color={theme.colors.textMuted} />
                  <Text style={styles.secondaryChipText}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryChip} onPress={applyCustomDefaults}>
                  <Ionicons name="sparkles-outline" size={16} color={theme.colors.base} />
                  <Text style={styles.primaryChipText}>Use default palette</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Bubble style</Text>
              <View style={styles.pillToggleRow}>
                {(['solid', 'gradient'] as const).map((option) => {
                  const isActive = bubbleStyle === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.pillToggle, isActive && styles.pillToggleActive]}
                      onPress={() => {
                        if (option === 'gradient') {
                          setBubbleStyle(conversationId, 'gradient');
                          setBubbleGradients(conversationId, {
                            sent: sentBubbleGradient,
                            received: receivedBubbleGradient,
                          });
                        } else {
                          setBubbleStyle(conversationId, 'solid');
                        }
                      }}
                    >
                      <Text style={[styles.pillToggleText, isActive && styles.pillToggleTextActive]}>
                        {option === 'solid' ? 'Solid bubbles' : 'Gradient bubbles'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Custom bubble palette</Text>
              <Text style={styles.settingHint}>Pick from the spectrum or use quick swatches.</Text>
              {bubbleStyle === 'solid' ? (
                <>
                  <View style={styles.colorPickerRow}>
                    <TouchableOpacity
                      style={styles.colorPickerButton}
                      onPress={() => openColorPicker('sent', 'Sent bubble')}
                    >
                      <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.sent }]} />
                      <View style={styles.colorPickerMeta}>
                        <Text style={styles.colorPickerLabel}>Sent</Text>
                        <Text style={styles.colorPickerValue}>{customInputs.sent}</Text>
                      </View>
                      <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.colorPickerButton}
                      onPress={() => openColorPicker('received', 'Received bubble')}
                    >
                      <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.received }]} />
                      <View style={styles.colorPickerMeta}>
                        <Text style={styles.colorPickerLabel}>Received</Text>
                        <Text style={styles.colorPickerValue}>{customInputs.received}</Text>
                      </View>
                      <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.swatchRow}>
                    {BUBBLE_SWATCHES.map((color) => (
                      <TouchableOpacity
                        key={`custom-sent-${color}`}
                        style={[styles.swatch, { backgroundColor: color }, chatTheme.sentBubbleColor === color && styles.swatchActive]}
                        onPress={() => setBubbleColors(conversationId, { sent: color })}
                      />
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.colorPickerRow}>
                    <TouchableOpacity
                      style={styles.colorPickerButton}
                      onPress={() => openColorPicker('sentStart', 'Sent gradient start')}
                    >
                      <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.sentStart }]} />
                      <View style={styles.colorPickerMeta}>
                        <Text style={styles.colorPickerLabel}>Sent start</Text>
                        <Text style={styles.colorPickerValue}>{customInputs.sentStart}</Text>
                      </View>
                      <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.colorPickerButton}
                      onPress={() => openColorPicker('sentEnd', 'Sent gradient end')}
                    >
                      <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.sentEnd }]} />
                      <View style={styles.colorPickerMeta}>
                        <Text style={styles.colorPickerLabel}>Sent end</Text>
                        <Text style={styles.colorPickerValue}>{customInputs.sentEnd}</Text>
                      </View>
                      <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.colorPickerRow}>
                    <TouchableOpacity
                      style={styles.colorPickerButton}
                      onPress={() => openColorPicker('receivedStart', 'Received gradient start')}
                    >
                      <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.receivedStart }]} />
                      <View style={styles.colorPickerMeta}>
                        <Text style={styles.colorPickerLabel}>Received start</Text>
                        <Text style={styles.colorPickerValue}>{customInputs.receivedStart}</Text>
                      </View>
                      <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.colorPickerButton}
                      onPress={() => openColorPicker('receivedEnd', 'Received gradient end')}
                    >
                      <View style={[styles.colorPickerSwatch, { backgroundColor: customInputs.receivedEnd }]} />
                      <View style={styles.colorPickerMeta}>
                        <Text style={styles.colorPickerLabel}>Received end</Text>
                        <Text style={styles.colorPickerValue}>{customInputs.receivedEnd}</Text>
                      </View>
                      <Ionicons name="color-palette-outline" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Text colors</Text>
              <View style={styles.swatchRow}>
                {TEXT_SWATCHES.map((color) => (
                  <TouchableOpacity
                    key={`text-${color}`}
                    style={[styles.swatch, { backgroundColor: color }, chatTheme.sentTextColor === color && styles.swatchActive]}
                    onPress={() => setTextColors(conversationId, { sent: color })}
                  />
                ))}
              </View>
              <Text style={[styles.settingLabel, { marginTop: 12 }]}>Received text</Text>
              <View style={styles.swatchRow}>
                {TEXT_SWATCHES.map((color) => (
                  <TouchableOpacity
                    key={`text-received-${color}`}
                    style={[styles.swatch, { backgroundColor: color }, chatTheme.receivedTextColor === color && styles.swatchActive]}
                    onPress={() => setTextColors(conversationId, { received: color })}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Bubble radius</Text>
              <View style={styles.densityRow}>
                {RADIUS_OPTIONS.map((radius) => (
                  <TouchableOpacity
                    key={radius}
                    style={[styles.densityChip, chatTheme.bubbleRadius === radius && styles.densityChipActive]}
                    onPress={() => setBubbleRadius(conversationId, radius)}
                  >
                    <Text style={[styles.densityLabel, chatTheme.bubbleRadius === radius && styles.densityLabelActive]}>
                      {radius}px
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={() => resetBubbleStyle(conversationId)}>
                <Ionicons name="refresh-outline" size={16} color={theme.colors.textMuted} />
                <Text style={styles.resetButtonText}>Reset bubble styling</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Message text size</Text>
              <Text style={styles.settingHint}>Tune readability for this chat.</Text>
              <View style={styles.densityRow}>
                {MESSAGE_TEXT_SIZES.map((size) => {
                  const isActive = messageTextSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.densityChip, isActive && styles.densityChipActive]}
                      onPress={() => setMessageTextSize(conversationId, size)}
                    >
                      <Text style={[styles.densityLabel, isActive && styles.densityLabelActive]}>
                        {size}px
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Accent palette</Text>
              <Text style={styles.settingHint}>Accent color influences buttons and highlights.</Text>
              <View style={styles.accentRow}>
                {ACCENT_OPTIONS.map((option) => {
                  const isActive = option.value === accentColor;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.accentSwatch,
                        { backgroundColor: option.hex },
                        isActive && styles.accentSwatchActive,
                      ]}
                      onPress={() => setAccentColor(option.value)}
                    >
                      {isActive && <Ionicons name="checkmark" size={14} color={theme.colors.base} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.settingLabel}>Density</Text>
              <Text style={styles.settingHint}>{densityOption.description}</Text>
              <View style={styles.densityRow}>
                {DENSITY_OPTIONS.map((option) => {
                  const isActive = option.id === chatTheme.density;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.densityChip, isActive && styles.densityChipActive]}
                      onPress={() => setConversationDensity(conversationId, option.id)}
                    >
                      <Text style={[styles.densityLabel, isActive && styles.densityLabelActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderSettingsTab = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Chat Controls</Text>
      <View style={styles.sectionCard}>
        {[
          {
            icon: 'checkmark-done-outline',
            iconColor: '#22d3ee',
            label: 'Read receipts',
            hint: 'Let others know when you read messages',
            value: settings.readReceipts,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { readReceipts: value }),
          },
          {
            icon: 'chatbubble-ellipses-outline',
            iconColor: '#a855f7',
            label: 'Typing indicators',
            hint: 'Show when you are typing',
            value: settings.typingIndicators,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { typingIndicators: value }),
          },
          {
            icon: 'radio-outline',
            iconColor: '#22c55e',
            label: 'Online status',
            hint: 'Show when you are online in this chat',
            value: settings.showOnlineStatus,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { showOnlineStatus: value }),
          },
          {
            icon: 'time-outline',
            iconColor: '#38bdf8',
            label: 'Show timestamps',
            hint: 'Display sent times inside bubbles',
            value: settings.showTimestamps,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { showTimestamps: value }),
          },
          {
            icon: 'notifications-outline',
            iconColor: '#f97316',
            label: 'Mute notifications',
            hint: 'Silence alerts from this chat',
            value: settings.muteNotifications,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { muteNotifications: value }),
          },
          {
            icon: 'pin-outline',
            iconColor: '#f43f5e',
            label: 'Pin conversation',
            hint: 'Keep this chat at the top of your inbox',
            value: settings.pinned,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { pinned: value }),
          },
          {
            icon: 'at-outline',
            iconColor: '#38bdf8',
            label: 'Mention alerts',
            hint: 'Notify only when you are mentioned',
            value: settings.mentionAlerts,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { mentionAlerts: value }),
          },
          {
            icon: 'sparkles-outline',
            iconColor: '#34d399',
            label: 'Haptic feedback',
            hint: 'Subtle tap feedback on send and reactions',
            value: settings.hapticFeedback,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { hapticFeedback: value }),
          },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${item.iconColor}1f` }]}>
                <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingHint}>{item.hint}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Automation & Intelligence</Text>
      <View style={styles.sectionCard}>
        {[
          {
            icon: 'bulb-outline',
            iconColor: '#f59e0b',
            label: 'Smart replies',
            hint: 'Suggested responses based on conversation tone',
            value: settings.smartReplies,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { smartReplies: value }),
          },
          {
            icon: 'language-outline',
            iconColor: '#22d3ee',
            label: 'Auto translate',
            hint: 'Instantly translate messages into your language',
            value: settings.autoTranslate,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { autoTranslate: value }),
          },
          {
            icon: 'link-outline',
            iconColor: '#f97316',
            label: 'Link previews',
            hint: 'Show rich previews for shared links',
            value: settings.linkPreviews,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { linkPreviews: value }),
          },
          {
            icon: 'document-text-outline',
            iconColor: '#a855f7',
            label: 'Auto summaries',
            hint: 'Generate quick summaries for long chats',
            value: settings.autoSummaries,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { autoSummaries: value }),
          },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${item.iconColor}1f` }]}>
                <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingHint}>{item.hint}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Retention & History</Text>
      <View style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(249, 115, 22, 0.18)' }]}>
              <Ionicons name="time-outline" size={16} color="#f97316" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Auto delete</Text>
              <Text style={styles.settingHint}>Remove messages after a set time</Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Switch
              value={settings.autoDeleteEnabled}
              onValueChange={(value) => setConversationSettings(conversationId, { autoDeleteEnabled: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>
        <View style={styles.optionRow}>
          {[1, 7, 30, 90].map((days) => {
            const isActive = settings.autoDeleteDays === days;
            return (
              <TouchableOpacity
                key={days}
                style={[styles.optionChip, isActive && styles.optionChipActive]}
                onPress={() => setConversationSettings(conversationId, { autoDeleteDays: days })}
              >
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{days}d</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.optionDivider} />
        <Text style={styles.settingLabel}>Message history</Text>
        <View style={styles.optionRow}>
          {(['forever', '1y', '6m', '30d'] as const).map((option) => {
            const isActive = settings.messageHistory === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, isActive && styles.optionChipActive]}
                onPress={() => setConversationSettings(conversationId, { messageHistory: option })}
              >
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {option === 'forever' ? 'Forever' : option.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Media & Storage</Text>
      <View style={styles.sectionCard}>
        {[
          {
            icon: 'download-outline',
            iconColor: '#22d3ee',
            label: 'Auto download media',
            hint: 'Download photos and files on Wi-Fi',
            value: settings.mediaAutoDownload,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { mediaAutoDownload: value }),
          },
          {
            icon: 'cloud-upload-outline',
            iconColor: '#34d399',
            label: 'High-quality uploads',
            hint: 'Send images without compression',
            value: settings.highQualityUploads,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { highQualityUploads: value }),
          },
          {
            icon: 'save-outline',
            iconColor: '#f59e0b',
            label: 'Auto save media',
            hint: 'Save media to your library automatically',
            value: settings.autoSaveMedia,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { autoSaveMedia: value }),
          },
          {
            icon: 'leaf-outline',
            iconColor: '#a855f7',
            label: 'Compress images',
            hint: 'Reduce file sizes for faster sending',
            value: settings.compressImages,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { compressImages: value }),
          },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${item.iconColor}1f` }]}>
                <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingHint}>{item.hint}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Privacy & Access</Text>
      <View style={styles.sectionCard}>
        {[
          {
            icon: 'shield-outline',
            iconColor: '#22c55e',
            label: 'Message requests',
            hint: 'Require approval before new participants message',
            value: settings.messageRequests,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { messageRequests: value }),
          },
          {
            icon: 'eye-off-outline',
            iconColor: '#f97316',
            label: 'Hide previews',
            hint: 'Mask content in notifications',
            value: settings.hidePreviews,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { hidePreviews: value }),
          },
          {
            icon: 'warning-outline',
            iconColor: '#f43f5e',
            label: 'Screenshot alerts',
            hint: 'Notify when someone screenshots',
            value: settings.screenshotAlerts,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { screenshotAlerts: value }),
          },
          {
            icon: 'link-outline',
            iconColor: '#38bdf8',
            label: 'Block unknown links',
            hint: 'Warn on links from unknown senders',
            value: settings.blockUnknownLinks,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { blockUnknownLinks: value }),
          },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${item.iconColor}1f` }]}>
                <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingHint}>{item.hint}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Calls & Safety</Text>
      <View style={styles.sectionCard}>
        {[
          {
            icon: 'call-outline',
            iconColor: '#22d3ee',
            label: 'Header call buttons',
            hint: 'Hide voice and video buttons if they distract',
            value: callControlsEnabled,
            onToggle: (value: boolean) => setCallControls(conversationId, value),
          },
          {
            icon: 'moon-outline',
            iconColor: '#a855f7',
            label: 'Focus mode',
            hint: 'Silence non-essential notifications',
            value: settings.focusMode,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { focusMode: value }),
          },
          {
            icon: 'time-outline',
            iconColor: '#f59e0b',
            label: 'Quiet hours',
            hint: 'Pause alerts overnight',
            value: settings.quietHours,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { quietHours: value }),
          },
          {
            icon: 'hand-right-outline',
            iconColor: '#f43f5e',
            label: 'Call confirmation',
            hint: 'Require a tap to confirm calls',
            value: settings.callConfirm,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { callConfirm: value }),
          },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${item.iconColor}1f` }]}>
                <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingHint}>{item.hint}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Safety Center', 'Safety tools are coming next.')}
        >
          <View style={[styles.listIcon, { backgroundColor: 'rgba(34, 211, 238, 0.18)' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#22d3ee" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Safety Center</Text>
            <Text style={styles.listSubtitle}>Block, report, and manage privacy</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Notifications', 'Notification rules are on the way.')}
        >
          <View style={[styles.listIcon, { backgroundColor: 'rgba(248, 113, 113, 0.18)' }]}>
            <Ionicons name="notifications-outline" size={18} color="#f87171" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Notification rules</Text>
            <Text style={styles.listSubtitle}>Quiet hours, mentions, alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Export chat', 'Export tools are coming soon.')}
        >
          <View style={[styles.listIcon, { backgroundColor: 'rgba(34, 197, 94, 0.18)' }]}>
            <Ionicons name="cloud-download-outline" size={18} color="#22c55e" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Export chat</Text>
            <Text style={styles.listSubtitle}>Download a secure archive</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Clear history', 'Clear chat history is coming next.')}
        >
          <View style={[styles.listIcon, { backgroundColor: 'rgba(248, 113, 113, 0.18)' }]}>
            <Ionicons name="trash-outline" size={18} color="#f87171" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Clear history</Text>
            <Text style={styles.listSubtitle}>Remove local chat cache</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Archive chat', 'Archive options are coming next.')}
        >
          <View style={[styles.listIcon, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
            <Ionicons name="archive-outline" size={18} color="#3b82f6" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Archive chat</Text>
            <Text style={styles.listSubtitle}>Move this conversation out of the inbox</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Block user', 'Blocking is coming soon.')}
        >
          <View style={[styles.listIcon, { backgroundColor: 'rgba(147, 51, 234, 0.18)' }]}>
            <Ionicons name="person-remove-outline" size={18} color="#9333ea" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Block user</Text>
            <Text style={styles.listSubtitle}>Stop messages and calls from this contact</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = (tabId: SideTabId) => {
    switch (tabId) {
      case 'saved':
        return renderSavedTab();
      case 'theme':
        return renderThemeTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return (
          <View style={styles.sectionStack}>
            <View style={styles.homeTabRow}>
              {HOME_TABS.map((tab) => {
                const isActive = tab.id === activeHomeTab;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.homeTab, isActive && styles.homeTabActive]}
                    onPress={() => setActiveHomeTab(tab.id)}
                  >
                    <View style={[styles.homeTabIcon, isActive && { backgroundColor: tab.color }]}>
                      <Ionicons name={tab.icon} size={14} color={isActive ? theme.colors.base : tab.color} />
                    </View>
                    <Text style={[styles.homeTabLabel, isActive && styles.homeTabLabelActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {renderHomeContent()}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Control Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileRow}>
        <Avatar uri={avatarUri} name={headerTitle} seed={avatarSeed} size="lg" />
        <View style={styles.profileText}>
          <Text style={styles.profileName}>{headerTitle}</Text>
          <Text style={styles.profileSub}>Personalize, measure, and tune this chat</Text>
        </View>
      </View>

      <View
        style={styles.bodyCompact}
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth && nextWidth !== pagerWidth) {
            setPagerWidth(nextWidth);
          }
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sideTabsRowWrap}
          contentContainerStyle={styles.sideTabsRow}
        >
          {SIDE_TABS.map((tab, index) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.sideTabCompact, isActive && styles.sideTabCompactActive]}
                onPress={() => {
                  setActiveTab(tab.id);
                  contentPagerRef.current?.scrollTo({ x: index * pagerWidth, animated: true });
                }}
              >
                <View style={styles.sideTabIconCompact}>
                  <Ionicons name={tab.icon} size={20} color={tab.color} />
                </View>
                <Text style={[styles.sideTabLabel, isActive && styles.sideTabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          ref={contentPagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pagerWidth);
            const nextTab = SIDE_TABS[nextIndex];
            if (nextTab && nextTab.id !== activeTab) {
              setActiveTab(nextTab.id);
            }
          }}
          style={styles.content}
        >
          {SIDE_TABS.map((tab) => (
            <View key={tab.id} style={{ width: pagerWidth }}>
              <ScrollView contentContainerStyle={styles.contentContainer}>
                {renderContent(tab.id)}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>

      <BackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
      />

      <Modal
        visible={Boolean(colorPickerTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setColorPickerTarget(null)}
      >
        <View style={styles.colorPickerOverlay}>
          <View style={styles.colorPickerSheet}>
            <View style={styles.colorPickerHeader}>
              <View>
                <Text style={styles.colorPickerTitle}>{colorPickerTarget?.label || 'Pick color'}</Text>
                <Text style={styles.colorPickerSubtitle}>{colorPickerValue}</Text>
              </View>
              <TouchableOpacity style={styles.colorPickerClose} onPress={() => setColorPickerTarget(null)}>
                <Ionicons name="close" size={18} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ColorPicker value={colorPickerValue} onChange={setColorPickerValue} />
            <View style={styles.colorPickerActions}>
              <TouchableOpacity
                style={styles.secondaryChip}
                onPress={() => setColorPickerTarget(null)}
              >
                <Text style={styles.secondaryChipText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryChip} onPress={applyColorPicker}>
                <Text style={styles.primaryChipText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  profileSub: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 12,
  },
  bodyCompact: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 16,
    gap: 12,
  },
  sideTabs: {
    width: 92,
  },
  sideTabsContent: {
    gap: 12,
    paddingBottom: 20,
  },
  sideTabsRowWrap: {
    maxHeight: 76,
  },
  sideTabsRow: {
    gap: 12,
    paddingBottom: 10,
    alignItems: 'center',
  },
  sideTab: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  sideTabActive: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  sideTabCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  sideTabCompactActive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  sideTabIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sideTabIconCompact: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: theme.colors.base,
    borderWidth: 0,
  },
  sideTabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
  },
  sideTabLabelActive: {
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  homeTabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  homeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  homeTabActive: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  homeTabIcon: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  homeTabLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  homeTabLabelActive: {
    color: theme.colors.textPrimary,
  },
  themeTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  themeTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  themeTabActive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  themeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  themeTabTextActive: {
    color: theme.colors.textPrimary,
  },
  sectionStack: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
  },
  metricCardCyan: {
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  metricCardEmerald: {
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  metricCardViolet: {
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  metricCardOrange: {
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  metricCardRose: {
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  metricCardIndigo: {
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  metricCardAmber: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  metricCardTeal: {
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  metricHint: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
  analyticsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  analyticsBody: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 18,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  analyticsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  analyticsPillText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  timelineCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  timelineMeta: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  timelineValue: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  emptyPanel: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    textAlign: 'center',
    marginTop: 6,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listMeta: {
    flex: 1,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  listSubtitle: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  primaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f59e0b',
  },
  primaryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.base,
  },
  secondaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  secondaryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionChipActive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.accent,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  optionTextActive: {
    color: theme.colors.textPrimary,
  },
  optionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    minWidth: 0,
  },
  settingRight: {
    alignSelf: 'center',
    flexShrink: 0,
    marginLeft: 8,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  settingHint: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 2,
    flexShrink: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accentSwatch: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentSwatchActive: {
    transform: [{ scale: 1.05 }],
  },
  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pillToggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pillToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillToggleActive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.accent,
  },
  pillToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  pillToggleTextActive: {
    color: theme.colors.textPrimary,
  },
  backgroundGroupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  backgroundGroupChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  backgroundGroupChipActive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  backgroundGroupText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  backgroundGroupTextActive: {
    color: theme.colors.textPrimary,
  },
  backgroundCard: {
    width: '48%',
    padding: 10,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backgroundCardActive: {
    borderColor: theme.colors.accent,
  },
  backgroundPreview: {
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  backgroundPreviewImage: {
    resizeMode: 'contain',
    backgroundColor: theme.colors.surface,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  backgroundLabelActive: {
    color: theme.colors.textPrimary,
  },
  backgroundBubbleRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  backgroundBubble: {
    flex: 1,
    height: 16,
    borderRadius: 8,
  },
  pairGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pairCard: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pairSwatches: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  pairDot: {
    flex: 1,
    height: 18,
    borderRadius: 9,
  },
  pairLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 10,
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: theme.colors.textPrimary,
  },
  colorPickerRow: {
    gap: 10,
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  colorPickerSwatch: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  colorPickerMeta: {
    flex: 1,
  },
  colorPickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  colorPickerValue: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  colorPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  colorPickerSheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 16,
  },
  colorPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorPickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  colorPickerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
  colorPickerClose: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  gradientSwatch: {
    flexDirection: 'row',
    width: 44,
    height: 28,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientSwatchHalf: {
    flex: 1,
  },
  resetButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  customPreview: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
  },
  customPreviewImage: {
    resizeMode: 'cover',
  },
  customPreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 12, 0.35)',
  },
  customPreviewFallback: {
    height: 140,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  customPreviewText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  customActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.base,
  },
  densityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  densityChip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
  },
  densityChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
  },
  densityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  densityLabelActive: {
    color: theme.colors.textPrimary,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  presetCardActive: {
    borderColor: theme.colors.accent,
  },
  presetSwatch: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    marginBottom: 10,
  },
  presetBubbleRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  presetBubble: {
    flex: 1,
    height: 20,
    borderRadius: 10,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  presetSubtitle: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
});

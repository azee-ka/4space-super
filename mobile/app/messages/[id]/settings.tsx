import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/authStore';
import { useConversation, useMessages } from '../../../src/hooks/useConversations';
import { Avatar } from '../../../src/components/ui';
import { DEFAULT_CONVERSATION_SETTINGS, useChatStore } from '../../../src/store/chatStore';
import { useThemeStore } from '../../../src/store/themeStore';
import { ACCENT_OPTIONS, getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';
import { BackgroundPicker } from '../../../src/components/chat';
import { CHAT_THEME_PRESETS, DEFAULT_CHAT_THEME, getChatThemeById } from '../../../src/styles/chatThemes';
import { useChatCustomizationStore } from '../../../src/store/chatCustomizationStore';
import { useMessagePreferencesStore } from '../../../src/store/messagePreferencesStore';

const SIDE_TABS = [
  { id: 'home', label: 'Home', icon: 'planet-outline', color: '#34d399' },
  { id: 'saved', label: 'Saved', icon: 'bookmark-outline', color: '#f59e0b' },
  { id: 'theme', label: 'Theme', icon: 'color-palette-outline', color: '#a855f7' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', color: '#22d3ee' },
] as const;

type SideTabId = (typeof SIDE_TABS)[number]['id'];

type HomeTabId = 'metrics' | 'media' | 'links' | 'kept' | 'pinned';

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
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [activeTab, setActiveTab] = useState<SideTabId>('home');
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTabId>('metrics');
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

  const mediaItems = useMemo(
    () => messageList.filter((msg) => Boolean(msg.file_url) || msg.type !== 'text'),
    [messageList]
  );

  const linkItems = useMemo(
    () => messageList.flatMap((msg) => extractLinks(msg.content || '')),
    [messageList]
  );

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
  const chatTheme = useMemo(() => {
    if (!conversationId) {
      return { ...DEFAULT_CHAT_THEME, density: 'cozy' as const };
    }
    const customization = conversationCustomizations[conversationId];
    const base = getChatThemeById(customization?.themeId);
    return { ...base, density: customization?.density || base.density || 'cozy' as const };
  }, [conversationId, conversationCustomizations]);
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

  const { headerTitle, avatarUri } = useMemo(() => {
    if (!conversation) {
      return { headerTitle: 'Chat Settings', avatarUri: undefined };
    }
    if (conversation.type === 'group') {
      return { headerTitle: conversation.name || 'Group Chat', avatarUri: conversation.avatar_url };
    }
    const other = conversation.participants?.[0];
    return {
      headerTitle: other?.display_name || other?.username || 'Chat',
      avatarUri: other?.avatar_url,
    };
  }, [conversation]);

  const densityOption = DENSITY_OPTIONS.find((option) => option.id === chatTheme.density) ||
    DENSITY_OPTIONS[1];

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
          <Text style={styles.metricHint}>Attachments</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardOrange]}>
          <View style={styles.metricHeader}>
            <Ionicons name="link-outline" size={16} color="#f97316" />
            <Text style={styles.metricLabel}>Links</Text>
          </View>
          <Text style={styles.metricValue}>{linkItems.length}</Text>
          <Text style={styles.metricHint}>Shared URLs</Text>
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

  const renderThemeTab = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Theme Lab</Text>
      <View style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Chat background</Text>
            <Text style={styles.settingHint}>Textures, gradients, wallpapers</Text>
          </View>
          <TouchableOpacity onPress={() => setShowBackgroundPicker(true)}>
            <Ionicons name="color-wand-outline" size={18} color="#a855f7" />
          </TouchableOpacity>
        </View>
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

      <Text style={styles.sectionTitle}>Density</Text>
      <View style={styles.sectionCard}>
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

      <Text style={styles.sectionTitle}>Theme Presets</Text>
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
  );

  const renderSettingsTab = () => (
    <View style={styles.sectionStack}>
      <Text style={styles.sectionTitle}>Chat Controls</Text>
      <View style={styles.sectionCard}>
        {[
          {
            label: 'Read receipts',
            hint: 'Let others know when you read messages',
            value: settings.readReceipts,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { readReceipts: value }),
          },
          {
            label: 'Typing indicators',
            hint: 'Show when you are typing',
            value: settings.typingIndicators,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { typingIndicators: value }),
          },
          {
            label: 'Mute notifications',
            hint: 'Silence alerts from this chat',
            value: settings.muteNotifications,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { muteNotifications: value }),
          },
          {
            label: 'Pin conversation',
            hint: 'Keep this chat at the top of your inbox',
            value: settings.pinned,
            onToggle: (value: boolean) => setConversationSettings(conversationId, { pinned: value }),
          },
        ].map((item) => (
          <View key={item.label} style={styles.settingRow}
          >
            <View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingHint}>{item.hint}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Calls & Safety</Text>
      <View style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Header call buttons</Text>
            <Text style={styles.settingHint}>Hide voice and video buttons if they distract</Text>
          </View>
          <Switch
            value={callControlsEnabled}
            onValueChange={(value) => setCallControls(conversationId, value)}
            trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
            thumbColor={theme.colors.white}
          />
        </View>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Safety Center', 'Safety tools are coming next.')}
        >
          <View style={[styles.listIcon, { backgroundColor: 'rgba(34, 211, 238, 0.18)' }]}
          >
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
          <View style={[styles.listIcon, { backgroundColor: 'rgba(248, 113, 113, 0.18)' }]}
          >
            <Ionicons name="notifications-outline" size={18} color="#f87171" />
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listTitle}>Notification rules</Text>
            <Text style={styles.listSubtitle}>Quiet hours, mentions, alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
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
        <Avatar uri={avatarUri} name={headerTitle} size="lg" />
        <View style={styles.profileText}>
          <Text style={styles.profileName}>{headerTitle}</Text>
          <Text style={styles.profileSub}>Personalize, measure, and tune this chat</Text>
        </View>
      </View>

      {isCompact ? (
        <View style={styles.bodyCompact}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sideTabsRowWrap}
            contentContainerStyle={styles.sideTabsRow}
          >
            {SIDE_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.sideTabCompact, isActive && styles.sideTabCompactActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <View style={[styles.sideTabIconCompact, { backgroundColor: tab.color }]}>
                    <Ionicons name={tab.icon} size={16} color={theme.colors.base} />
                  </View>
                  <Text style={[styles.sideTabLabel, isActive && styles.sideTabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {renderContent()}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.body}>
          <ScrollView style={styles.sideTabs} contentContainerStyle={styles.sideTabsContent}>
            {SIDE_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.sideTab, isActive && styles.sideTabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <View style={[styles.sideTabIcon, { backgroundColor: tab.color }]}>
                    <Ionicons name={tab.icon} size={16} color={theme.colors.base} />
                  </View>
                  <Text style={[styles.sideTabLabel, isActive && styles.sideTabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {renderContent()}
          </ScrollView>
        </View>
      )}

      <BackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
      />
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
    paddingHorizontal: 12,
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
    maxHeight: 70,
  },
  sideTabsRow: {
    gap: 10,
    paddingBottom: 8,
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
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  sideTabCompactActive: {
    backgroundColor: theme.colors.surfaceSubtle,
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
  },
  sideTabIconCompact: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideTabLabel: {
    fontSize: 10,
    fontWeight: '600',
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingHint: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 2,
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

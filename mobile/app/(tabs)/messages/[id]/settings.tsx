import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundPicker } from '../../../../src/components/chat';
import { Avatar } from '../../../../src/components/ui';
import { useConversation } from '../../../../src/hooks/useConversations';
import { useAuthStore } from '../../../../src/store/authStore';
import { DEFAULT_CONVERSATION_SETTINGS, useChatStore } from '../../../../src/store/chatStore';
import { useThemeStore } from '../../../../src/store/themeStore';
import { ACCENT_OPTIONS, getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

const TABS = [
  { id: 'media', label: 'Media', icon: 'images-outline' as const },
  { id: 'links', label: 'Links', icon: 'link-outline' as const },
  { id: 'kept', label: 'Kept', icon: 'bookmark-outline' as const },
  { id: 'shared', label: 'Shared', icon: 'share-social-outline' as const },
  { id: 'pinned', label: 'Pinned', icon: 'pin-outline' as const },
];

export default function ChatSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuthStore();
  const { data: conversation } = useConversation(conversationId || '', user?.id || '');
  const { accentColor, setAccentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const settings = useChatStore((state) =>
    conversationId ? state.conversationSettings[conversationId] || DEFAULT_CONVERSATION_SETTINGS : DEFAULT_CONVERSATION_SETTINGS
  );
  const setConversationSettings = useChatStore((state) => state.setConversationSettings);

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

  if (!conversationId) {
    return null;
  }

  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label || 'items';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileRow}>
          <Avatar uri={avatarUri} name={headerTitle} size="lg" />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{headerTitle}</Text>
            <Text style={styles.profileSub}>Conversation details & shared items</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && { backgroundColor: theme.colors.surface }]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={isActive ? accentHex : theme.colors.textSubtle}
                />
                <Text style={[styles.tabLabel, isActive && { color: theme.colors.textPrimary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.tabContent}>
          <Ionicons name="file-tray-outline" size={28} color={theme.colors.textSubtle} />
          <Text style={styles.tabContentTitle}>No {activeTabLabel} yet</Text>
          <Text style={styles.tabContentSubtitle}>
            Items shared in this chat will appear here.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Read Receipts</Text>
              <Text style={styles.settingHint}>Control read indicators for this chat</Text>
            </View>
            <Switch
              value={settings.readReceipts}
              onValueChange={(value) => setConversationSettings(conversationId, { readReceipts: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Typing Indicators</Text>
              <Text style={styles.settingHint}>Show when you are typing</Text>
            </View>
            <Switch
              value={settings.typingIndicators}
              onValueChange={(value) => setConversationSettings(conversationId, { typingIndicators: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Mute Notifications</Text>
              <Text style={styles.settingHint}>Silence alerts from this chat</Text>
            </View>
            <Switch
              value={settings.muteNotifications}
              onValueChange={(value) => setConversationSettings(conversationId, { muteNotifications: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Pin Conversation</Text>
              <Text style={styles.settingHint}>Keep this chat at the top</Text>
            </View>
            <Switch
              value={settings.pinned}
              onValueChange={(value) => setConversationSettings(conversationId, { pinned: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Customization</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowBackgroundPicker(true)}>
            <View>
              <Text style={styles.settingLabel}>Chat Background</Text>
              <Text style={styles.settingHint}>Change the chat wallpaper</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Accent Color</Text>
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
                {isActive && (
                  <Ionicons name="checkmark" size={14} color={theme.colors.base} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
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
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 24,
  },
  tabContentTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  tabContentSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 22,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingHint: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
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
});

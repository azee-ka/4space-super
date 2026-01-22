import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../../src/store/authStore';
import { useConversation } from '../../../../src/hooks/useConversations';
import { Avatar } from '../../../../src/components/ui';
import { DEFAULT_CONVERSATION_SETTINGS, useChatStore } from '../../../../src/store/chatStore';
import { useThemeStore } from '../../../../src/store/themeStore';
import { ACCENT_OPTIONS, getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { BackgroundPicker } from '../../../../src/components/chat';
import { CHAT_THEME_PRESETS, DEFAULT_CHAT_THEME, getChatThemeById } from '../../../../src/styles/chatThemes';
import { useChatCustomizationStore } from '../../../../src/store/chatCustomizationStore';

const DENSITY_OPTIONS: { id: 'compact' | 'cozy' | 'spacious'; label: string; description: string }[] = [
  { id: 'compact', label: 'Compact', description: 'Tight spacing for commanders and pros' },
  { id: 'cozy', label: 'Cozy', description: 'Balanced spacing for daily use' },
  { id: 'spacious', label: 'Spacious', description: 'Airy layout with lots of breathing room' },
];

export default function ChatSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuthStore();
  const { data: conversation } = useConversation(conversationId || '', user?.id || '');
  const { accentColor, setAccentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const settings = useChatStore((state) =>
    conversationId
      ? state.conversationSettings[conversationId] || DEFAULT_CONVERSATION_SETTINGS
      : DEFAULT_CONVERSATION_SETTINGS
  );
  const setConversationSettings = useChatStore((state) => state.setConversationSettings);

  // Select raw data instead of computed methods to avoid infinite loops
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
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
            <Text style={styles.profileSub}>Customize the vibe of this chat</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          {[
            {
              label: 'Read receipts',
              hint: 'Let others know when you read their messages',
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
            <View key={item.label} style={styles.settingRow}>
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

        <Text style={styles.sectionTitle}>Call & Media Controls</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Header call buttons</Text>
              <Text style={styles.settingHint}>Hide the voice + video icons to avoid accidental taps</Text>
            </View>
            <Switch
              value={callControlsEnabled}
              onValueChange={(value) => setCallControls(conversationId, value)}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Layout Density</Text>
        <View style={styles.section}>
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
        <View style={styles.section}>
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
                  <Text style={styles.presetSubtitle}>{preset.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Background & Accent</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowBackgroundPicker(true)}>
            <View>
              <Text style={styles.settingLabel}>Chat background</Text>
              <Text style={styles.settingHint}>Swap wallpapers, gradients, and textures</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
          </TouchableOpacity>
          <Text style={[styles.settingHint, { marginBottom: 12 }]}>Accent color affects the composer and actions.</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  densityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
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

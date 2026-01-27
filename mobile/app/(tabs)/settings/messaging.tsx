import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';
import { useSettingsStore } from '../../../src/store/settingsStore';

export default function MessagingSettingsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { messaging, updateMessagingSettings } = useSettingsStore();


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messaging</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionTitle}>Conversation Defaults</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-done-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Read Receipts</Text>
                <Text style={styles.menuItemSubtext}>Let others see when you read</Text>
              </View>
            </View>
            <Switch
              value={messaging.readReceipts}
              onValueChange={(value) => updateMessagingSettings({ readReceipts: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Typing Indicators</Text>
                <Text style={styles.menuItemSubtext}>Show when you are typing</Text>
              </View>
            </View>
            <Switch
              value={messaging.typingIndicators}
              onValueChange={(value) => updateMessagingSettings({ typingIndicators: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="link-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Link Previews</Text>
                <Text style={styles.menuItemSubtext}>Show previews for shared links</Text>
              </View>
            </View>
            <Switch
              value={messaging.linkPreviews}
              onValueChange={(value) => updateMessagingSettings({ linkPreviews: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Media Playback</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="gif-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Play GIFs</Text>
                <Text style={styles.menuItemSubtext}>Play GIFs automatically</Text>
              </View>
            </View>
            <Switch
              value={messaging.autoPlayGifs}
              onValueChange={(value) => updateMessagingSettings({ autoPlayGifs: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="play-circle-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Play Videos</Text>
                <Text style={styles.menuItemSubtext}>Play videos automatically</Text>
              </View>
            </View>
            <Switch
              value={messaging.autoPlayVideos}
              onValueChange={(value) => updateMessagingSettings({ autoPlayVideos: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cloud-download-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Download Media</Text>
                <Text style={styles.menuItemSubtext}>Save media automatically</Text>
              </View>
            </View>
            <Switch
              value={messaging.autoDownloadMedia}
              onValueChange={(value) => updateMessagingSettings({ autoDownloadMedia: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="wifi-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Download Over Wi-Fi</Text>
                <Text style={styles.menuItemSubtext}>Only download on Wi-Fi</Text>
              </View>
            </View>
            <Switch
              value={messaging.autoDownloadOverWifi}
              onValueChange={(value) => updateMessagingSettings({ autoDownloadOverWifi: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Inbox Management</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-open-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Message Requests</Text>
                <Text style={styles.menuItemSubtext}>Allow new contacts to reach you</Text>
              </View>
            </View>
            <Switch
              value={messaging.messageRequests}
              onValueChange={(value) => updateMessagingSettings({ messageRequests: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push({
              pathname: '/settings/messaging/auto-delete',
              params: { current: messaging.autoDelete }
            })}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="timer-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Delete</Text>
                <Text style={styles.menuItemSubtext}>Auto-clear chats after {messaging.autoDelete}</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{messaging.autoDelete}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="folder-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Chat Folders</Text>
                <Text style={styles.menuItemSubtext}>Organize work, family, favorites</Text>
              </View>
            </View>
            <Switch
              value={messaging.chatFolders}
              onValueChange={(value) => updateMessagingSettings({ chatFolders: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="archive-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Archive</Text>
                <Text style={styles.menuItemSubtext}>Archive inactive chats</Text>
              </View>
            </View>
            <Switch
              value={messaging.archiveInactive}
              onValueChange={(value) => updateMessagingSettings({ archiveInactive: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="arrow-redo-outline" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Message Forwarding</Text>
                <Text style={styles.menuItemSubtext}>Allow forwarding messages</Text>
              </View>
            </View>
            <Switch
              value={messaging.messageForwarding}
              onValueChange={(value) => updateMessagingSettings({ messageForwarding: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="push-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Message Pinning</Text>
                <Text style={styles.menuItemSubtext}>Pin important messages</Text>
              </View>
            </View>
            <Switch
              value={messaging.messagePinning}
              onValueChange={(value) => updateMessagingSettings({ messagePinning: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="star-outline" size={20} color="#fbbf24" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Starred Messages</Text>
                <Text style={styles.menuItemSubtext}>Save messages to favorites</Text>
              </View>
            </View>
            <Switch
              value={messaging.starredMessages}
              onValueChange={(value) => updateMessagingSettings({ starredMessages: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Smart Features</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Smart Replies</Text>
                <Text style={styles.menuItemSubtext}>Suggested responses in chats</Text>
              </View>
            </View>
            <Switch
              value={messaging.smartReplies}
              onValueChange={(value) => updateMessagingSettings({ smartReplies: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="language-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Translate Messages</Text>
                <Text style={styles.menuItemSubtext}>Auto-translate incoming chats</Text>
              </View>
            </View>
            <Switch
              value={messaging.translateMessages}
              onValueChange={(value) => updateMessagingSettings({ translateMessages: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="happy-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Sticker Suggestions</Text>
                <Text style={styles.menuItemSubtext}>Surface expressive stickers</Text>
              </View>
            </View>
            <Switch
              value={messaging.stickerSuggestions}
              onValueChange={(value) => updateMessagingSettings({ stickerSuggestions: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="happy-outline" size={20} color="#fbbf24" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Emoji Suggestions</Text>
                <Text style={styles.menuItemSubtext}>Suggest emojis while typing</Text>
              </View>
            </View>
            <Switch
              value={messaging.emojiSuggestions}
              onValueChange={(value) => updateMessagingSettings({ emojiSuggestions: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="search-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>GIF Search</Text>
                <Text style={styles.menuItemSubtext}>Enable GIF picker</Text>
              </View>
            </View>
            <Switch
              value={messaging.gifSearch}
              onValueChange={(value) => updateMessagingSettings({ gifSearch: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mic-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Voice Messages</Text>
                <Text style={styles.menuItemSubtext}>Send audio recordings</Text>
              </View>
            </View>
            <Switch
              value={messaging.voiceMessages}
              onValueChange={(value) => updateMessagingSettings({ voiceMessages: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Input & Formatting</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="return-down-forward-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Send with Enter</Text>
                <Text style={styles.menuItemSubtext}>Use return key to send</Text>
              </View>
            </View>
            <Switch
              value={messaging.sendWithEnter}
              onValueChange={(value) => updateMessagingSettings({ sendWithEnter: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-done-outline" size={20} color="#3b82f6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Spell Check</Text>
                <Text style={styles.menuItemSubtext}>Check spelling as you type</Text>
              </View>
            </View>
            <Switch
              value={messaging.spellCheck}
              onValueChange={(value) => updateMessagingSettings({ spellCheck: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="create-outline" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Correct</Text>
                <Text style={styles.menuItemSubtext}>Fix typos automatically</Text>
              </View>
            </View>
            <Switch
              value={messaging.autoCorrect}
              onValueChange={(value) => updateMessagingSettings({ autoCorrect: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push({
              pathname: '/settings/messaging/formatting',
              params: { current: messaging.messageFormatting }
            })}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="text-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Message Formatting</Text>
                <Text style={styles.menuItemSubtext}>Text formatting style</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{messaging.messageFormatting}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="code-slash-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Code Block Support</Text>
                <Text style={styles.menuItemSubtext}>Format code snippets</Text>
              </View>
            </View>
            <Switch
              value={messaging.codeBlockSupport}
              onValueChange={(value) => updateMessagingSettings({ codeBlockSupport: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="at-outline" size={20} color="#ec4899" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Mention Suggestions</Text>
                <Text style={styles.menuItemSubtext}>Suggest user mentions</Text>
              </View>
            </View>
            <Switch
              value={messaging.mentionSuggestions}
              onValueChange={(value) => updateMessagingSettings({ mentionSuggestions: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginTop: 12,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuItemTextGroup: {
    flex: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  menuItemText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItemSubtext: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    marginTop: 2,
  },
  menuItemValue: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});

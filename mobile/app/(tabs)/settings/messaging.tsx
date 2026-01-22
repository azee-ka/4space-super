import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

export default function MessagingSettingsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [linkPreviews, setLinkPreviews] = useState(true);
  const [messageRequests, setMessageRequests] = useState(true);
  const [smartReplies, setSmartReplies] = useState(false);
  const [autoDelete, setAutoDelete] = useState('Off');
  const [chatFolders, setChatFolders] = useState(true);
  const [archiveInactive, setArchiveInactive] = useState(false);
  const [translateMessages, setTranslateMessages] = useState(false);
  const [stickerSuggestions, setStickerSuggestions] = useState(true);
  const [sendWithEnter, setSendWithEnter] = useState(false);

  const showPicker = (title: string, options: string[], setter: (value: string) => void) => {
    Alert.alert(title, '', [
      ...options.map((option) => ({ text: option, onPress: () => setter(option) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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
              value={readReceipts}
              onValueChange={setReadReceipts}
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
              value={typingIndicators}
              onValueChange={setTypingIndicators}
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
              value={linkPreviews}
              onValueChange={setLinkPreviews}
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
              value={messageRequests}
              onValueChange={setMessageRequests}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => showPicker('Auto-Delete Messages', ['Off', '24 hours', '7 days', '30 days'], setAutoDelete)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="timer-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Delete</Text>
                <Text style={styles.menuItemSubtext}>Auto-clear chats after {autoDelete}</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{autoDelete}</Text>
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
              value={chatFolders}
              onValueChange={setChatFolders}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
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
              value={archiveInactive}
              onValueChange={setArchiveInactive}
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
              value={smartReplies}
              onValueChange={setSmartReplies}
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
              value={translateMessages}
              onValueChange={setTranslateMessages}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
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
              value={stickerSuggestions}
              onValueChange={setStickerSuggestions}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Input</Text>
        <View style={styles.section}>
          <View style={styles.menuItem}>
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
              value={sendWithEnter}
              onValueChange={setSendWithEnter}
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

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SettingLinkRow, SettingToggleRow } from '../../../src/components/settings/SettingRow';
import { useInboxPreferencesStore, ChatFolder, QuickReply } from '../../../src/store/inboxPreferencesStore';
import { theme } from '../../../src/styles/theme';

const FOLDER_ICONS = [
  'folder', 'briefcase', 'heart', 'star', 'trophy', 'shield',
  'game-controller', 'rocket', 'bulb', 'cloud', 'flame', 'leaf'
];

const FOLDER_COLORS = [
  '#22d3ee', '#f472b6', '#34d399', '#fbbf24', '#a855f7',
  '#f97316', '#3b82f6', '#ef4444', '#10b981', '#ec4899'
];

const AUTO_LOCK_OPTIONS = [1, 5, 15, 30];

export default function InboxSettingsScreen() {
  const router = useRouter();
  const {
    lockCode,
    setLockCode,
    autoLockTimeout,
    setAutoLockTimeout,
    showReadReceipts,
    setShowReadReceipts,
    showTypingIndicators,
    setShowTypingIndicators,
    compactMode,
    setCompactMode,
    quickReplies,
    addQuickReply,
    deleteQuickReply,
    folders,
    createFolder,
    deleteFolder,
  } = useInboxPreferencesStore();

  const [showLockSetup, setShowLockSetup] = useState(false);
  const [newLockCode, setNewLockCode] = useState('');
  const [confirmLockCode, setConfirmLockCode] = useState('');
  const [showQuickReplyModal, setShowQuickReplyModal] = useState(false);
  const [newReplyLabel, setNewReplyLabel] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  const [newReplyEmoji, setNewReplyEmoji] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');
  const [newFolderColor, setNewFolderColor] = useState('#22d3ee');
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockStatus, setLockStatus] = useState<string | null>(null);
  const [showLockRemovalConfirm, setShowLockRemovalConfirm] = useState(false);
  const [pendingQuickReply, setPendingQuickReply] = useState<QuickReply | null>(null);
  const [pendingFolder, setPendingFolder] = useState<ChatFolder | null>(null);
  const [replyFormError, setReplyFormError] = useState<string | null>(null);
  const [folderFormError, setFolderFormError] = useState<string | null>(null);
  const [showAutoLockPicker, setShowAutoLockPicker] = useState(false);

  const handleSetLockCode = () => {
    if (newLockCode.length < 4) {
      setLockError('Lock code must be at least 4 characters');
      return;
    }
    if (newLockCode !== confirmLockCode) {
      setLockError('Lock codes do not match');
      return;
    }
    setLockCode(newLockCode);
    setShowLockSetup(false);
    setNewLockCode('');
    setConfirmLockCode('');
    setLockError(null);
    setLockStatus('Lock code saved. Lock chats from the inbox to secure them.');
  };

  const handleRemoveLockCode = () => {
    setShowLockRemovalConfirm(true);
  };

  const confirmRemoveLockCode = () => {
    setLockCode(null);
    setShowLockRemovalConfirm(false);
    setLockError(null);
    setLockStatus('Lock code removed.');
  };

  const handleAddQuickReply = () => {
    if (!newReplyLabel.trim() || !newReplyContent.trim()) {
      setReplyFormError('Please fill in all fields');
      return;
    }
    addQuickReply({
      label: newReplyLabel.trim(),
      content: newReplyContent.trim(),
      emoji: newReplyEmoji.trim() || undefined,
    });
    setShowQuickReplyModal(false);
    setNewReplyLabel('');
    setNewReplyContent('');
    setNewReplyEmoji('');
    setReplyFormError(null);
  };

  const handleDeleteQuickReply = (reply: QuickReply) => {
    setPendingQuickReply(reply);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      setFolderFormError('Please enter a folder name');
      return;
    }
    createFolder({
      name: newFolderName.trim(),
      icon: newFolderIcon,
      color: newFolderColor,
      conversationIds: [],
    });
    setShowFolderModal(false);
    setNewFolderName('');
    setNewFolderIcon('folder');
    setNewFolderColor('#22d3ee');
    setFolderFormError(null);
  };

  const handleDeleteFolder = (folder: ChatFolder) => {
    setPendingFolder(folder);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inbox Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#f472b620' }]}>
                  <Ionicons name="lock-closed" size={20} color="#f472b6" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Chat Lock</Text>
                  <Text style={styles.settingDescription}>
                    {lockCode ? 'Lock code is set' : 'Protect chats with a code'}
                  </Text>
                </View>
              </View>
              {lockCode ? (
                <TouchableOpacity onPress={handleRemoveLockCode} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setShowLockSetup(true)} style={styles.setupButton}>
                  <Text style={styles.setupButtonText}>Setup</Text>
                </TouchableOpacity>
              )}
            </View>

            {lockStatus && <Text style={styles.lockStatus}>{lockStatus}</Text>}

            {lockCode && (
              <>
                <View style={styles.divider} />
                <SettingLinkRow
                  icon="time-outline"
                  iconColor="#a855f7"
                  label="Auto-lock timeout"
                  description={`${autoLockTimeout} minutes of inactivity`}
                  onPress={() => setShowAutoLockPicker(true)}
                  trailing={
                    <View style={styles.autoLockTrailing}>
                      <Text style={styles.autoLockValue}>{autoLockTimeout} min</Text>
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
                    </View>
                  }
                  borderless
                />
              </>
            )}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.sectionCard}>
            <SettingToggleRow
              icon="checkmark-done-outline"
              iconColor="#22d3ee"
              label="Read receipts"
              description="Show when you've read messages"
              value={showReadReceipts}
              onValueChange={setShowReadReceipts}
            />
            <SettingToggleRow
              icon="create-outline"
              iconColor="#34d399"
              label="Typing indicators"
              description="Show when you're typing"
              value={showTypingIndicators}
              onValueChange={setShowTypingIndicators}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.sectionCard}>
            <SettingToggleRow
              icon="resize"
              iconColor="#fbbf24"
              label="Compact mode"
              description="Smaller chat items, more on screen"
              value={compactMode}
              onValueChange={setCompactMode}
            />
          </View>
        </View>

        {/* Folders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chat Folders</Text>
            <TouchableOpacity onPress={() => setShowFolderModal(true)}>
              <Ionicons name="add-circle" size={24} color="#22d3ee" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            {folders.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: folder.color + '20' }]}>
                      <Ionicons name={folder.icon as any} size={20} color={folder.color} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{folder.name}</Text>
                      <Text style={styles.settingDescription}>
                        {folder.conversationIds.length} chats
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteFolder(folder)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Quick Replies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Replies</Text>
            <TouchableOpacity onPress={() => setShowQuickReplyModal(true)}>
              <Ionicons name="add-circle" size={24} color="#22d3ee" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            {quickReplies.map((reply, index) => (
              <React.Fragment key={reply.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    {reply.emoji && (
                      <Text style={styles.quickReplyEmoji}>{reply.emoji}</Text>
                    )}
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{reply.label}</Text>
                      <Text style={styles.settingDescription} numberOfLines={1}>
                        {reply.content}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteQuickReply(reply)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Lock Setup Modal */}
      <Modal visible={showLockSetup} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLockSetup(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Setup Lock Code</Text>
            <Text style={styles.modalSubtitle}>
              Create a code to protect your locked chats. You'll type this in the search bar to unlock.
            </Text>
            {lockError && <Text style={styles.formError}>{lockError}</Text>}

            <TextInput
              placeholder="Enter lock code (min 4 characters)"
              placeholderTextColor={theme.colors.textSubtle}
              value={newLockCode}
              onChangeText={setNewLockCode}
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              placeholder="Confirm lock code"
              placeholderTextColor={theme.colors.textSubtle}
              value={confirmLockCode}
              onChangeText={setConfirmLockCode}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleSetLockCode}>
              <Text style={styles.modalButtonText}>Set Lock Code</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Quick Reply Modal */}
      <Modal visible={showQuickReplyModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowQuickReplyModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Quick Reply</Text>
            {replyFormError && <Text style={styles.formError}>{replyFormError}</Text>}

            <TextInput
              placeholder="Label (e.g., 'Thanks')"
              placeholderTextColor={theme.colors.textSubtle}
              value={newReplyLabel}
              onChangeText={setNewReplyLabel}
              style={styles.input}
            />

            <TextInput
              placeholder="Message content"
              placeholderTextColor={theme.colors.textSubtle}
              value={newReplyContent}
              onChangeText={setNewReplyContent}
              multiline
              style={[styles.input, styles.inputMultiline]}
            />

            <TextInput
              placeholder="Emoji (optional)"
              placeholderTextColor={theme.colors.textSubtle}
              value={newReplyEmoji}
              onChangeText={setNewReplyEmoji}
              style={styles.input}
              maxLength={2}
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleAddQuickReply}>
              <Text style={styles.modalButtonText}>Add Quick Reply</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Folder Modal */}
      <Modal visible={showFolderModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowFolderModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Create Folder</Text>
            {folderFormError && <Text style={styles.formError}>{folderFormError}</Text>}

            <TextInput
              placeholder="Folder name"
              placeholderTextColor={theme.colors.textSubtle}
              value={newFolderName}
              onChangeText={setNewFolderName}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {FOLDER_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newFolderIcon === icon && { backgroundColor: newFolderColor + '30' },
                  ]}
                  onPress={() => setNewFolderIcon(icon)}
                >
                  <Ionicons name={icon as any} size={24} color={newFolderIcon === icon ? newFolderColor : theme.colors.textSubtle} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {FOLDER_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newFolderColor === color && styles.colorOptionActive,
                  ]}
                  onPress={() => setNewFolderColor(color)}
                >
                  {newFolderColor === color && <Ionicons name="checkmark" size={16} color="#000" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddFolder}>
              <Text style={styles.modalButtonText}>Create Folder</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={showAutoLockPicker} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAutoLockPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Auto-Lock Timeout</Text>
            <Text style={styles.modalSubtitle}>
              Choose how long the inbox stays unlocked before requiring your lock code.
            </Text>
            <View style={styles.optionRow}>
              {AUTO_LOCK_OPTIONS.map((minutes) => {
                const isActive = autoLockTimeout === minutes;
                return (
                  <TouchableOpacity
                    key={minutes}
                    style={[styles.optionChip, isActive && styles.optionChipActive]}
                    onPress={() => {
                      setAutoLockTimeout(minutes);
                      setShowAutoLockPicker(false);
                    }}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {minutes} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={showLockRemovalConfirm} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLockRemovalConfirm(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Remove lock code</Text>
            <Text style={styles.modalSubtitle}>
              Removing the lock will unlock every saved chat. You can set a new code anytime.
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLockRemovalConfirm(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDestructiveButton]}
                onPress={confirmRemoveLockCode}
              >
                <Text style={[styles.modalButtonText, styles.modalDestructiveButtonText]}>
                  Remove code
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={Boolean(pendingQuickReply)} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPendingQuickReply(null)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Delete quick reply</Text>
            <Text style={styles.modalSubtitle}>
              Delete "{pendingQuickReply?.label}"? This action cannot be undone.
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setPendingQuickReply(null)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDestructiveButton]}
                onPress={() => {
                  if (pendingQuickReply) {
                    deleteQuickReply(pendingQuickReply.id);
                  }
                  setPendingQuickReply(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalDestructiveButtonText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={Boolean(pendingFolder)} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPendingFolder(null)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Delete folder</Text>
            <Text style={styles.modalSubtitle}>
              Delete "{pendingFolder?.name}"? Chats will stay in your inbox.
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setPendingFolder(null)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDestructiveButton]}
                onPress={() => {
                  if (pendingFolder) {
                    deleteFolder(pendingFolder.id);
                  }
                  setPendingFolder(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalDestructiveButtonText]}>
                  Delete folder
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  lockStatus: {
    marginTop: 6,
    fontSize: 12,
    color: '#22d3ee',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 8,
  },
  autoLockTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoLockValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginRight: 6,
  },
  setupButton: {
    backgroundColor: '#22d3ee20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  setupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22d3ee',
  },
  removeButton: {
    backgroundColor: '#ef444420',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  quickReplyEmoji: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.divider,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  modalDestructiveButton: {
    flex: 1,
    backgroundColor: '#ef4444',
  },
  modalDestructiveButtonText: {
    color: '#fff',
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.textPrimary,
    fontSize: 15,
    marginBottom: 12,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 10,
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  modalButton: {
    backgroundColor: '#22d3ee',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

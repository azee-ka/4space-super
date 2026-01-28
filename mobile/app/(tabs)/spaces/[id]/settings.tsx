import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSpace } from '../../../../src/hooks/useSpaces';
import { LoadingSpinner } from '../../../../src/components/ui';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

export default function SpaceSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaceId = Array.isArray(id) ? id[0] : id;
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { data: space, isLoading } = useSpace(spaceId);

  // Settings state
  const [spaceName, setSpaceName] = useState(space?.name || '');
  const [spaceDescription, setSpaceDescription] = useState(space?.description || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mentionsOnly, setMentionsOnly] = useState(false);
  const [messagePreview, setMessagePreview] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);

  React.useEffect(() => {
    if (space) {
      setSpaceName(space.name);
      setSpaceDescription(space.description || '');
    }
  }, [space]);

  const handleSaveBasicInfo = () => {
    // TODO: Implement update space mutation
    Alert.alert('Success', 'Space information updated');
  };

  const handleLeaveSpace = () => {
    Alert.alert(
      'Leave Space',
      'Are you sure you want to leave this space? You will lose access to all content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement leave space mutation
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteSpace = () => {
    Alert.alert(
      'Delete Space',
      'This action cannot be undone. All data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete space mutation
            router.replace('/spaces' as any);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!space) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Space Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Space Name</Text>
          <TextInput
            style={styles.input}
            value={spaceName}
            onChangeText={setSpaceName}
            placeholder="Enter space name"
            placeholderTextColor={theme.colors.textSubtle}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={spaceDescription}
            onChangeText={setSpaceDescription}
            placeholder="Enter space description"
            placeholderTextColor={theme.colors.textSubtle}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: accentHex }]} onPress={handleSaveBasicInfo}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications from this space</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="at-outline" size={20} color="#f59e0b" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Mentions Only</Text>
                <Text style={styles.settingDescription}>Only notify when mentioned</Text>
              </View>
            </View>
            <Switch
              value={mentionsOnly}
              onValueChange={setMentionsOnly}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
              disabled={!notificationsEnabled}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="eye-outline" size={20} color="#10b981" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Message Preview</Text>
                <Text style={styles.settingDescription}>Show message content in notifications</Text>
              </View>
            </View>
            <Switch
              value={messagePreview}
              onValueChange={setMessagePreview}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
              disabled={!notificationsEnabled}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high-outline" size={20} color="#a855f7" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Sound</Text>
                <Text style={styles.settingDescription}>Play sound for notifications</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
              disabled={!notificationsEnabled}
            />
          </View>
        </View>

        {/* Chat Settings */}
        <Text style={styles.sectionTitle}>Chat Settings</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="checkmark-done-outline" size={20} color="#34d399" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Read Receipts</Text>
                <Text style={styles.settingDescription}>Show when you've read messages</Text>
              </View>
            </View>
            <Switch
              value={readReceipts}
              onValueChange={setReadReceipts}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#f472b6" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Typing Indicators</Text>
                <Text style={styles.settingDescription}>Show when you're typing</Text>
              </View>
            </View>
            <Switch
              value={typingIndicators}
              onValueChange={setTypingIndicators}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#3b82f6" />
              </View>
              <Text style={styles.menuText}>Privacy Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="key-outline" size={18} color="#10b981" />
              </View>
              <Text style={styles.menuText}>Access Control</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="archive-outline" size={20} color="#f59e0b" />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Auto-Archive</Text>
                <Text style={styles.settingDescription}>Archive inactive conversations</Text>
              </View>
            </View>
            <Switch
              value={autoArchive}
              onValueChange={setAutoArchive}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        {/* Advanced */}
        <Text style={styles.sectionTitle}>Advanced</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push(`/spaces/${spaceId}/analytics` as any)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#a855f720' }]}>
                <Ionicons name="stats-chart-outline" size={18} color="#a855f7" />
              </View>
              <Text style={styles.menuText}>Analytics</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#22d3ee20' }]}>
                <Ionicons name="cloud-upload-outline" size={18} color="#22d3ee" />
              </View>
              <Text style={styles.menuText}>Export Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#f472b620' }]}>
                <Ionicons name="color-palette-outline" size={18} color="#f472b6" />
              </View>
              <Text style={styles.menuText}>Customize Appearance</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerItem} onPress={handleLeaveSpace}>
            <View style={styles.dangerItemLeft}>
              <View style={styles.dangerIcon}>
                <Ionicons name="exit-outline" size={18} color="#ef4444" />
              </View>
              <View style={styles.dangerContent}>
                <Text style={styles.dangerLabel}>Leave Space</Text>
                <Text style={styles.dangerDescription}>You'll lose access to all content</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ef4444" />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteSpace}>
            <View style={styles.dangerItemLeft}>
              <View style={styles.dangerIcon}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </View>
              <View style={styles.dangerContent}>
                <Text style={styles.dangerLabel}>Delete Space</Text>
                <Text style={styles.dangerDescription}>Permanently delete this space</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 12,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  dangerItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  dangerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ef444420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerContent: {
    flex: 1,
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 3,
  },
  dangerDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});

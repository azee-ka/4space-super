import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Switch, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/authStore';
import { Avatar, Button } from '../../../src/components/ui';
import { useThemeStore } from '../../../src/store/themeStore';
import { ACCENT_OPTIONS, getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const { accentColor, setAccentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationPreview, setNotificationPreview] = useState('When Unlocked');
  const [quietHours, setQuietHours] = useState('Off');

  const [readReceiptsDefault, setReadReceiptsDefault] = useState(true);
  const [typingIndicatorsDefault, setTypingIndicatorsDefault] = useState(true);
  const [linkPreviews, setLinkPreviews] = useState(true);
  const [messageRequests, setMessageRequests] = useState(true);
  const [smartReplies, setSmartReplies] = useState(false);

  const [autoPlayMedia, setAutoPlayMedia] = useState(true);
  const [autoDownloadMedia, setAutoDownloadMedia] = useState(false);
  const [highQualityUploads, setHighQualityUploads] = useState(true);
  const [backupMode, setBackupMode] = useState('Wi-Fi only');

  const [darkMode, setDarkMode] = useState(true);
  const [themeMode, setThemeMode] = useState('OLED Black');
  const [fontSize, setFontSize] = useState('Medium');
  const [compactMode, setCompactMode] = useState(false);

  const [onlineStatus, setOnlineStatus] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [analyticsSharing, setAnalyticsSharing] = useState(false);

  const [appLock, setAppLock] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 min');

  const [autoJoinSpaces, setAutoJoinSpaces] = useState(true);
  const [spaceActivitySummary, setSpaceActivitySummary] = useState(true);
  const [spaceMentions, setSpaceMentions] = useState(true);
  const [defaultSpacePrivacy, setDefaultSpacePrivacy] = useState('Private');

  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const [backgroundRefresh, setBackgroundRefresh] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [autoArchive, setAutoArchive] = useState(false);
  const [language, setLanguage] = useState('English');

  const storageUsed = 3.4;
  const storageTotal = 10;
  const storagePercent = Math.min(100, Math.round((storageUsed / storageTotal) * 100));

  const showPicker = (title: string, options: string[], setter: (value: string) => void) => {
    Alert.alert(title, '', [
      ...options.map((option) => ({ text: option, onPress: () => setter(option) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Unable to open link', 'Please try again later.');
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Unable to open link', 'Please try again later.');
    }
  };

  const handleShareProfile = async (mode: 'profile' | 'invite') => {
    const username = user?.username ? `@${user.username}` : 'me';
    const link = user?.username ? `https://4space.app/u/${user.username}` : 'https://4space.app';
    const message =
      mode === 'invite'
        ? `Join me on 4Space: ${link}`
        : `Find ${username} on 4Space: ${link}`;

    try {
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to open the share sheet.');
    }
  };

  const handleResetPreferences = () => {
    Alert.alert('Reset Preferences', 'Reset all settings to their defaults?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setNotifications(true);
          setSoundEnabled(true);
          setVibrationEnabled(true);
          setNotificationPreview('When Unlocked');
          setQuietHours('Off');

          setReadReceiptsDefault(true);
          setTypingIndicatorsDefault(true);
          setLinkPreviews(true);
          setMessageRequests(true);
          setSmartReplies(false);

          setAutoPlayMedia(true);
          setAutoDownloadMedia(false);
          setHighQualityUploads(true);
          setBackupMode('Wi-Fi only');

          setDarkMode(true);
          setThemeMode('OLED Black');
          setFontSize('Medium');
          setCompactMode(false);

          setOnlineStatus(true);
          setDiscoverable(true);
          setAnalyticsSharing(false);

          setAppLock(false);
          setTwoFactor(false);
          setLoginAlerts(true);
          setSessionTimeout('30 min');

          setAutoJoinSpaces(true);
          setSpaceActivitySummary(true);
          setSpaceMentions(true);
          setDefaultSpacePrivacy('Private');

          setReduceMotion(false);
          setHighContrast(false);
          setHapticFeedback(true);

          setBackgroundRefresh(true);
          setDataSaver(false);
          setAutoArchive(false);
          setLanguage('English');
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Clear cached media and temporary files?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => Alert.alert('Cache cleared', 'Temporary files were removed.'),
      },
    ]);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar
              uri={user?.avatar_url}
              name={user?.display_name || user?.username}
              size="xl"
            />
            <View style={styles.profileMeta}>
              <Text style={styles.displayName}>{user?.display_name || user?.username}</Text>
              <Text style={styles.username}>@{user?.username}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Core</Text>
                </View>
                <View style={[styles.badge, styles.badgeAccent]}>
                  <Text style={[styles.badgeText, styles.badgeAccentText]}>Sync On</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.profileActions}>
            <Button title="Edit Profile" onPress={() => router.push('/settings/profile')} size="sm" />
            <Button
              title="View Profile"
              onPress={() => handleShareProfile('profile')}
              size="sm"
              variant="secondary"
            />
          </View>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickAction} onPress={() => handleShareProfile('invite')}>
              <Ionicons name="person-add-outline" size={16} color="#34d399" />
              <Text style={styles.quickActionText}>Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/settings/profile')}>
              <Ionicons name="person-circle-outline" size={16} color="#22d3ee" />
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => showPicker('Theme Style', ['OLED Black', 'Dim', 'Classic'], setThemeMode)}
            >
              <Ionicons name="color-palette-outline" size={16} color="#f472b6" />
              <Text style={styles.quickActionText}>Theme</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push('/settings/profile')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Profile & Identity</Text>
                <Text style={styles.menuItemSubtext}>Name, username, bio, profile link</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>App Lock</Text>
                <Text style={styles.menuItemSubtext}>Require Face ID or passcode</Text>
              </View>
            </View>
            <Switch
              value={appLock}
              onValueChange={setAppLock}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#a78bfa" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Two-Factor Auth</Text>
                <Text style={styles.menuItemSubtext}>Extra protection for logins</Text>
              </View>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Login Alerts</Text>
                <Text style={styles.menuItemSubtext}>Get notified on new sign-ins</Text>
              </View>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showPicker('Session Timeout', ['15 min', '30 min', '1 hour', 'Never'], setSessionTimeout)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="timer-outline" size={20} color="#60a5fa" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Session Timeout</Text>
                <Text style={styles.menuItemSubtext}>Auto-lock when idle</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{sessionTimeout}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Messaging</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-done-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Read Receipts</Text>
                <Text style={styles.menuItemSubtext}>Let others know you read</Text>
              </View>
            </View>
            <Switch
              value={readReceiptsDefault}
              onValueChange={setReadReceiptsDefault}
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
              value={typingIndicatorsDefault}
              onValueChange={setTypingIndicatorsDefault}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
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

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-open-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Message Requests</Text>
                <Text style={styles.menuItemSubtext}>Allow new people to reach you</Text>
              </View>
            </View>
            <Switch
              value={messageRequests}
              onValueChange={setMessageRequests}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Smart Replies</Text>
                <Text style={styles.menuItemSubtext}>Suggested responses for chats</Text>
              </View>
            </View>
            <Switch
              value={smartReplies}
              onValueChange={setSmartReplies}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Push Notifications</Text>
                <Text style={styles.menuItemSubtext}>Get alerts for messages</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="volume-high-outline" size={20} color="#ec4899" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Sound</Text>
                <Text style={styles.menuItemSubtext}>Play notification sounds</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="phone-portrait-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Vibration</Text>
                <Text style={styles.menuItemSubtext}>Haptic feedback for alerts</Text>
              </View>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() =>
              showPicker(
                'Notification Preview',
                ['Always', 'When Unlocked', 'Never'],
                setNotificationPreview
              )
            }
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="eye-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Preview Content</Text>
                <Text style={styles.menuItemSubtext}>Show message snippets</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{notificationPreview}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showPicker('Quiet Hours', ['Off', '22:00 - 07:00', '23:00 - 08:00'], setQuietHours)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="moon-outline" size={20} color="#a78bfa" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Quiet Hours</Text>
                <Text style={styles.menuItemSubtext}>Mute notifications at night</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{quietHours}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Spaces</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="enter-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Join Invites</Text>
                <Text style={styles.menuItemSubtext}>Enter spaces right away</Text>
              </View>
            </View>
            <Switch
              value={autoJoinSpaces}
              onValueChange={setAutoJoinSpaces}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="pulse-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Activity Summary</Text>
                <Text style={styles.menuItemSubtext}>Daily recap for spaces</Text>
              </View>
            </View>
            <Switch
              value={spaceActivitySummary}
              onValueChange={setSpaceActivitySummary}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="at-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Mentions Only</Text>
                <Text style={styles.menuItemSubtext}>Only notify when tagged</Text>
              </View>
            </View>
            <Switch
              value={spaceMentions}
              onValueChange={setSpaceMentions}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showPicker('Default Privacy', ['Private', 'Shared', 'Team', 'Public'], setDefaultSpacePrivacy)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Default Privacy</Text>
                <Text style={styles.menuItemSubtext}>New spaces start as {defaultSpacePrivacy.toLowerCase()}</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{defaultSpacePrivacy}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Media & Storage</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="play-circle-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Autoplay Media</Text>
                <Text style={styles.menuItemSubtext}>Play videos automatically</Text>
              </View>
            </View>
            <Switch
              value={autoPlayMedia}
              onValueChange={setAutoPlayMedia}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cloud-download-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Download</Text>
                <Text style={styles.menuItemSubtext}>Save media to your device</Text>
              </View>
            </View>
            <Switch
              value={autoDownloadMedia}
              onValueChange={setAutoDownloadMedia}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>High-Quality Uploads</Text>
                <Text style={styles.menuItemSubtext}>Sharper photos and videos</Text>
              </View>
            </View>
            <Switch
              value={highQualityUploads}
              onValueChange={setHighQualityUploads}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showPicker('Backup Mode', ['Wi-Fi only', 'Wi-Fi + Cellular', 'Off'], setBackupMode)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cloud-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Backup Mode</Text>
                <Text style={styles.menuItemSubtext}>Keep chats safe in the cloud</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{backupMode}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageTitle}>Storage Usage</Text>
            <Text style={styles.storageValue}>{`${storageUsed.toFixed(1)} GB / ${storageTotal} GB`}</Text>
          </View>
          <View style={styles.storageBar}>
            <View style={[styles.storageFill, { width: `${storagePercent}%`, backgroundColor: accentHex }]} />
          </View>
          <View style={styles.storageMeta}>
            <Text style={styles.storageMetaText}>Media cache: 1.1 GB</Text>
            <Text style={styles.storageMetaText}>{storagePercent}% used</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="moon-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Dark Mode</Text>
                <Text style={styles.menuItemSubtext}>OLED-friendly theme</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => showPicker('Theme Style', ['OLED Black', 'Dim', 'Classic'], setThemeMode)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="color-palette-outline" size={20} color={accentHex} />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Theme Style</Text>
                <Text style={styles.menuItemSubtext}>Adjust your contrast level</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{themeMode}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => showPicker('Font Size', ['Small', 'Medium', 'Large'], setFontSize)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="text-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Font Size</Text>
                <Text style={styles.menuItemSubtext}>Scale text across the app</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{fontSize}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="grid-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Compact Layout</Text>
                <Text style={styles.menuItemSubtext}>Reduce spacing density</Text>
              </View>
            </View>
            <Switch
              value={compactMode}
              onValueChange={setCompactMode}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="eye-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Online Status</Text>
                <Text style={styles.menuItemSubtext}>Show when you are active</Text>
              </View>
            </View>
            <Switch
              value={onlineStatus}
              onValueChange={setOnlineStatus}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="search-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Discoverable</Text>
                <Text style={styles.menuItemSubtext}>Let others find you</Text>
              </View>
            </View>
            <Switch
              value={discoverable}
              onValueChange={setDiscoverable}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="analytics-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Share Analytics</Text>
                <Text style={styles.menuItemSubtext}>Help improve the product</Text>
              </View>
            </View>
            <Switch
              value={analyticsSharing}
              onValueChange={setAnalyticsSharing}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="walk-outline" size={20} color="#60a5fa" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Reduce Motion</Text>
                <Text style={styles.menuItemSubtext}>Minimize animations</Text>
              </View>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="contrast-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>High Contrast</Text>
                <Text style={styles.menuItemSubtext}>Boost UI legibility</Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="radio-button-on-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Haptic Feedback</Text>
                <Text style={styles.menuItemSubtext}>Subtle taps on actions</Text>
              </View>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>App Behavior</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="refresh-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Background Refresh</Text>
                <Text style={styles.menuItemSubtext}>Keep data updated quietly</Text>
              </View>
            </View>
            <Switch
              value={backgroundRefresh}
              onValueChange={setBackgroundRefresh}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="speedometer-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Data Saver</Text>
                <Text style={styles.menuItemSubtext}>Reduce bandwidth usage</Text>
              </View>
            </View>
            <Switch
              value={dataSaver}
              onValueChange={setDataSaver}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="archive-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto-Archive</Text>
                <Text style={styles.menuItemSubtext}>Archive inactive chats</Text>
              </View>
            </View>
            <Switch
              value={autoArchive}
              onValueChange={setAutoArchive}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showPicker('Language', ['English', 'Spanish', 'French', 'Hindi'], setLanguage)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="language-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Language</Text>
                <Text style={styles.menuItemSubtext}>App display language</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{language}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.accentSection}>
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
                  {isActive && <Ionicons name="checkmark" size={14} color={theme.colors.base} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => openLink('https://4space.app/help')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle-outline" size={20} color="#60a5fa" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Help Center</Text>
                <Text style={styles.menuItemSubtext}>Guides and troubleshooting</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => openLink('mailto:support@4space.app')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Contact Support</Text>
                <Text style={styles.menuItemSubtext}>Reach the 4Space team</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openLink('https://4space.app/legal')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Terms & Privacy</Text>
                <Text style={styles.menuItemSubtext}>Policies and permissions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Maintenance</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={handleClearCache}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="trash-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Clear Cache</Text>
                <Text style={styles.menuItemSubtext}>Remove temporary media files</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleResetPreferences}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="refresh-circle-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Reset Preferences</Text>
                <Text style={styles.menuItemSubtext}>Restore default settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <View style={styles.signOutContainer}>
          <Button title="Sign Out" onPress={handleSignOut} variant="danger" fullWidth />
        </View>

        <Text style={styles.version}>4Space v1.0.0</Text>
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
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMeta: {
    marginLeft: 12,
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  username: {
    color: theme.colors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 999,
  },
  badgeAccent: {
    backgroundColor: theme.colors.accentSoft,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  badgeAccentText: {
    color: theme.colors.accent,
  },
  profileActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
  },
  quickActionText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  accentSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 4,
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
  storageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  storageValue: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  storageBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 10,
  },
  storageFill: {
    height: 8,
    borderRadius: 999,
  },
  storageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  storageMetaText: {
    color: theme.colors.textSubtle,
    fontSize: 12,
  },
  signOutContainer: {
    marginTop: 24,
  },
  version: {
    color: theme.colors.textSubtle,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});

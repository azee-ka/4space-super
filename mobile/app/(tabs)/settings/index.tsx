import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/authStore';
import { Avatar, Button } from '../../../src/components/ui';
import { theme } from '../../../src/styles/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        // In a real app, show a toast notification
        console.warn('Unable to open link');
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      // In a real app, show a toast notification
      console.error('Unable to open link');
    }
  };

  const handleShareProfile = async () => {
    const link = user?.username ? `https://4space.app/u/${user.username}` : 'https://4space.app';
    try {
      await Share.share({ message: `Find me on 4Space: ${link}` });
    } catch (error) {
      // In a real app, show a toast notification
      console.error('Share failed');
    }
  };

  const handleSignOut = () => {
    router.push('/settings/sign-out');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar
              uri={user?.avatar_url}
              name={user?.display_name || user?.username}
              seed={user?.id}
              size="xl"
            />
            <View style={styles.profileMeta}>
              <Text style={styles.displayName}>{user?.display_name || user?.username}</Text>
              <Text style={styles.username}>@{user?.username}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Ionicons name="shield-checkmark-outline" size={12} color="#34d399" />
                  <Text style={styles.badgeText}>Secure</Text>
                </View>
                <View style={[styles.badge, styles.badgeAccent]}>
                  <Ionicons name="sparkles-outline" size={12} color="#22d3ee" />
                  <Text style={[styles.badgeText, styles.badgeAccentText]}>Pro Ready</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.profileActions}>
            <Button title="Edit Profile" onPress={() => router.push('/settings/profile')} size="sm" />
            <Button title="Share" onPress={handleShareProfile} size="sm" variant="secondary" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => router.push('/settings/profile')}>
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

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => router.push('/settings/devices')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="phone-portrait-outline" size={20} color="#60a5fa" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Devices & Sessions</Text>
                <Text style={styles.menuItemSubtext}>Active logins, trusted devices</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/privacy')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Privacy & Security</Text>
                <Text style={styles.menuItemSubtext}>Controls, permissions, blocking</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => router.push('/settings/notifications')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Notifications & Sounds</Text>
                <Text style={styles.menuItemSubtext}>Alerts, previews, quiet hours</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => router.push('/settings/messaging')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#ec4899" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Messaging & Media</Text>
                <Text style={styles.menuItemSubtext}>Read receipts, folders, auto-delete</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => router.push('/settings/storage')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cloud-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Data & Storage</Text>
                <Text style={styles.menuItemSubtext}>Auto-download, backups, cache</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/appearance')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="color-palette-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Appearance</Text>
                <Text style={styles.menuItemSubtext}>Theme, fonts, accent color</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Spaces</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/spaces')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="apps-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Space Preferences</Text>
                <Text style={styles.menuItemSubtext}>Default privacy, invites, summaries</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Advanced</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/advanced')}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="options-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Advanced Settings</Text>
                <Text style={styles.menuItemSubtext}>Proxy, experiments, language</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => openLink('https://4space.app/help')}>
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

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => openLink('mailto:support@4space.app')}>
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

          <TouchableOpacity style={styles.menuItem} onPress={() => openLink('https://4space.app/legal')}>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

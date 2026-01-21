import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Switch } from 'react-native';
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
  const profileAccent = '#22d3ee';

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
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
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Profile Section */}
          <View style={styles.profile}>
            <Avatar
              uri={user?.avatar_url}
              name={user?.display_name || user?.username}
              size="xl"
            />
            <Text style={styles.displayName}>
              {user?.display_name || user?.username}
            </Text>
            <Text style={styles.username}>@{user?.username}</Text>
            <TouchableOpacity style={styles.editProfileButton}>
              <Ionicons name="create-outline" size={16} color={profileAccent} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Account Settings */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.section}>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={20} color={profileAccent} />
                </View>
                <Text style={styles.menuItemText}>Profile Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#a78bfa" />
                </View>
                <Text style={styles.menuItemText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="key-outline" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.section}>
            <View style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications-outline" size={20} color="#f97316" />
                </View>
                <Text style={styles.menuItemText}>Push Notifications</Text>
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
                <Text style={styles.menuItemText}>Sound</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#10b981" />
                </View>
                <Text style={styles.menuItemText}>Vibration</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>

          {/* Appearance */}
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.section}>
            <View style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="moon-outline" size={20} color="#38bdf8" />
                </View>
                <Text style={styles.menuItemText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
                thumbColor={theme.colors.white}
              />
            </View>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="color-palette-outline" size={20} color={accentHex} />
                </View>
                <Text style={styles.menuItemText}>Theme</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>Black</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="text-outline" size={20} color="#a855f7" />
                </View>
                <Text style={styles.menuItemText}>Font Size</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>Medium</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
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
                    {isActive && (
                      <Ionicons name="checkmark" size={14} color={theme.colors.base} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Support */}
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.section}>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color="#60a5fa" />
                </View>
                <Text style={styles.menuItemText}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#22d3ee" />
                </View>
                <Text style={styles.menuItemText}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text-outline" size={20} color="#34d399" />
                </View>
                <Text style={styles.menuItemText}>Terms & Privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="danger"
              fullWidth
            />
          </View>

          <Text style={styles.version}>
            4Space v1.0.0
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  username: {
    color: theme.colors.textMuted,
    marginTop: 4,
    fontSize: 15,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginTop: 24,
    marginBottom: 12,
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
    padding: 16,
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
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  menuItemText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemValue: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  signOutContainer: {
    marginTop: 32,
  },
  version: {
    color: theme.colors.textSubtle,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 32,
  },
});

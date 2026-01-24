import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';
import { PrivacyVisibility, usePrivacyStore } from '../../../src/store/privacyStore';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const {
    lastSeenVisibility,
    onlineVisibility,
    excludedContactIds,
    setLastSeenVisibility,
    setOnlineVisibility,
  } = usePrivacyStore();
  const [discoverable, setDiscoverable] = React.useState(true);
  const [analyticsSharing, setAnalyticsSharing] = React.useState(false);
  const [appLock, setAppLock] = React.useState(false);
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [loginAlerts, setLoginAlerts] = React.useState(true);
  const [sessionTimeout, setSessionTimeout] = React.useState('30 min');
  const [screenshotsAllowed, setScreenshotsAllowed] = React.useState(true);

  const privacyOptions: Array<{ label: string; value: PrivacyVisibility }> = [
    { label: 'Everyone', value: 'everyone' },
    { label: 'My contacts', value: 'contacts' },
    { label: 'My contacts except...', value: 'contacts_except' },
    { label: 'Nobody', value: 'nobody' },
  ];

  const formatVisibility = (value: PrivacyVisibility) => {
    switch (value) {
      case 'everyone':
        return 'Everyone';
      case 'contacts':
        return 'My contacts';
      case 'contacts_except':
        return 'Contacts except';
      case 'nobody':
        return 'Nobody';
    }
  };

  const showPrivacyPicker = (
    title: string,
    current: PrivacyVisibility,
    setter: (value: PrivacyVisibility) => void
  ) => {
    Alert.alert(title, '', [
      ...privacyOptions.map((option) => ({
        text: option.label,
        onPress: () => setter(option.value),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="eye-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Last seen</Text>
                <Text style={styles.menuItemSubtext}>Who can see your last seen</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.valueChip}
              onPress={() => showPrivacyPicker('Last seen', lastSeenVisibility, setLastSeenVisibility)}
            >
              <Text style={styles.valueText}>{formatVisibility(lastSeenVisibility)}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="radio-outline" size={20} color="#22c55e" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Online status</Text>
                <Text style={styles.menuItemSubtext}>Who can see when you are online</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.valueChip}
              onPress={() => showPrivacyPicker('Online status', onlineVisibility, setOnlineVisibility)}
            >
              <Text style={styles.valueText}>{formatVisibility(onlineVisibility)}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-remove-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Excluded contacts</Text>
                <Text style={styles.menuItemSubtext}>
                  {excludedContactIds.length > 0 ? `${excludedContactIds.length} excluded` : 'No exclusions'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.valueChip}
              onPress={() => Alert.alert('Coming soon', 'Exclude contacts from seeing your status.')}
            >
              <Text style={styles.valueText}>Manage</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Privacy controls</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="search-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Discoverable</Text>
                <Text style={styles.menuItemSubtext}>Allow others to find you</Text>
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

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.section}>
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
                <Ionicons name="shield-checkmark-outline" size={20} color="#34d399" />
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
                <Text style={styles.menuItemSubtext}>Notify on new device sign-ins</Text>
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

        <Text style={styles.sectionTitle}>Content</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="images-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Allow Screenshots</Text>
                <Text style={styles.menuItemSubtext}>Let others capture your profile</Text>
              </View>
            </View>
            <Switch
              value={screenshotsAllowed}
              onValueChange={setScreenshotsAllowed}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Blocked Users', 'Manage blocked users coming soon.')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="hand-left-outline" size={20} color="#ef4444" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Blocked Users</Text>
                <Text style={styles.menuItemSubtext}>Review blocked accounts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
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
  valueChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  menuItemValue: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});

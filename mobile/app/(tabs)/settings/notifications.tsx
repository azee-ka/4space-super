import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [mentionsOnly, setMentionsOnly] = useState(false);
  const [inAppPreview, setInAppPreview] = useState(true);
  const [reactionAlerts, setReactionAlerts] = useState(true);
  const [callAlerts, setCallAlerts] = useState(true);
  const [notificationPreview, setNotificationPreview] = useState('When Unlocked');
  const [quietHours, setQuietHours] = useState('Off');

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#f97316" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Push Notifications</Text>
                <Text style={styles.menuItemSubtext}>Get alerts for new messages</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
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
                <Text style={styles.menuItemSubtext}>Play notification tones</Text>
              </View>
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
        </View>

        <Text style={styles.sectionTitle}>Channels</Text>
        <View style={styles.section}>
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
              value={mentionsOnly}
              onValueChange={setMentionsOnly}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="flash-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>In-App Preview</Text>
                <Text style={styles.menuItemSubtext}>Show banner while in app</Text>
              </View>
            </View>
            <Switch
              value={inAppPreview}
              onValueChange={setInAppPreview}
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
                <Text style={styles.menuItemText}>Reaction Alerts</Text>
                <Text style={styles.menuItemSubtext}>Notify on emoji reactions</Text>
              </View>
            </View>
            <Switch
              value={reactionAlerts}
              onValueChange={setReactionAlerts}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Call Alerts</Text>
                <Text style={styles.menuItemSubtext}>Incoming calls and invites</Text>
              </View>
            </View>
            <Switch
              value={callAlerts}
              onValueChange={setCallAlerts}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => showPicker('Notification Preview', ['Always', 'When Unlocked', 'Never'], setNotificationPreview)}
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
                <Ionicons name="moon-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Quiet Hours</Text>
                <Text style={styles.menuItemSubtext}>Mute notifications overnight</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{quietHours}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
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
  menuItemValue: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});

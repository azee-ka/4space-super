import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';
import { Button } from '../../../src/components/ui';

export default function SignOutScreen() {
  const router = useRouter();
  const { signOut, user } = useAuthStore();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      // Handle error - in a real app, show toast notification
      console.error('Sign out error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Out</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#ef4444' + '20' }]}>
            <Ionicons name="log-out" size={32} color="#ef4444" />
          </View>
          <Text style={styles.infoTitle}>Sign out of your account?</Text>
          <Text style={styles.infoDescription}>
            You'll need to sign in again to access your account on this device.
          </Text>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.accountRow}>
            <Ionicons name="person-circle-outline" size={28} color={theme.colors.textPrimary} />
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user?.display_name || user?.username}</Text>
              <Text style={styles.accountEmail}>@{user?.username}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What happens when you sign out</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="notifications-off-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.detailText}>You'll stop receiving notifications on this device</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.detailText}>You'll need to enter your credentials to sign back in</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="cloud-done-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.detailText}>Your messages and data will remain safely stored</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="phone-portrait-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.detailText}>Other devices will stay signed in</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSubtle} />
          <Text style={styles.noteText}>
            To sign out from all devices, go to Devices & Sessions and remove each device individually.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
            fullWidth
          />
          <Button
            title="Stay Signed In"
            onPress={() => router.back()}
            variant="secondary"
            fullWidth
          />
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
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
    padding: 16,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  accountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountInfo: {
    marginLeft: 12,
    flex: 1,
  },
  accountName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: theme.colors.textSubtle,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    marginRight: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginLeft: 12,
  },
  actions: {
    gap: 12,
  },
});

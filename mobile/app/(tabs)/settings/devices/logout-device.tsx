import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { Button } from '../../../../src/components/ui';

export default function LogoutDeviceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const deviceName = params.deviceName as string || 'Unknown Device';
  const deviceLocation = params.deviceLocation as string || 'Unknown Location';
  const deviceLastActive = params.deviceLastActive as string || 'Unknown';

  const handleLogout = () => {
    // In a real app, you'd revoke the device session here
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Remove Device</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#ef4444' + '20' }]}>
            <Ionicons name="log-out" size={32} color="#ef4444" />
          </View>
          <Text style={styles.infoTitle}>Sign out from device?</Text>
          <Text style={styles.infoDescription}>
            You will be logged out from this device and all active sessions will be terminated.
          </Text>
        </View>

        <View style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <View style={styles.deviceIcon}>
              <Ionicons
                name={deviceName.includes('Mac') ? 'laptop-outline' : deviceName.includes('iPad') ? 'tablet-portrait-outline' : 'phone-portrait-outline'}
                size={28}
                color={theme.colors.textPrimary}
              />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{deviceName}</Text>
              <View style={styles.deviceMeta}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textSubtle} />
                <Text style={styles.deviceMetaText}>{deviceLocation}</Text>
              </View>
              <View style={styles.deviceMeta}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textSubtle} />
                <Text style={styles.deviceMetaText}>Last active: {deviceLastActive}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={20} color="#f59e0b" />
          <Text style={styles.warningText}>
            After signing out, you'll need to log in again to access your account on this device.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="danger"
            fullWidth
          />
          <Button
            title="Cancel"
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
  deviceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    marginRight: 14,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceMetaText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginLeft: 6,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
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

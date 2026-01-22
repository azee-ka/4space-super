import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../../src/styles/theme';

const DEVICES = [
  {
    id: 'current',
    name: 'iPhone 15 Pro',
    location: 'San Francisco, CA',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 'macbook',
    name: 'MacBook Pro 14"',
    location: 'San Jose, CA',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 'ipad',
    name: 'iPad Pro',
    location: 'New York, NY',
    lastActive: 'Yesterday',
    current: false,
  },
];

export default function DevicesSettingsScreen() {
  const router = useRouter();

  const handleLogoutDevice = (name: string) => {
    Alert.alert('Remove Device', `Sign out from ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Devices & Sessions</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionTitle}>Active Sessions</Text>
        <View style={styles.section}>
          {DEVICES.map((device, index) => {
            const isLast = index === DEVICES.length - 1;
            return (
              <View
                key={device.id}
                style={[styles.deviceRow, !isLast && styles.menuItemBorder]}
              >
                <View style={styles.deviceLeft}>
                  <View style={[styles.iconContainer, device.current && styles.iconContainerActive]}>
                    <Ionicons
                      name={device.name.includes('Mac') ? 'laptop-outline' : 'phone-portrait-outline'}
                      size={20}
                      color={device.current ? '#22d3ee' : theme.colors.textMuted}
                    />
                  </View>
                  <View style={styles.deviceTextGroup}>
                    <Text style={styles.deviceTitle}>{device.name}</Text>
                    <Text style={styles.deviceSubtitle}>{device.location}</Text>
                    <Text style={styles.deviceMeta}>{device.lastActive}</Text>
                  </View>
                </View>
                {device.current ? (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => handleLogoutDevice(device.name)}>
                    <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Device Alerts', 'Notification settings coming soon.')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>New Device Alerts</Text>
                <Text style={styles.menuItemSubtext}>Be notified on new sign-ins</Text>
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
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceTextGroup: {
    flex: 1,
  },
  deviceTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  deviceSubtitle: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    marginTop: 2,
  },
  deviceMeta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  currentBadgeText: {
    color: theme.colors.textSubtle,
    fontSize: 11,
    fontWeight: '600',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTextGroup: {
    flex: 1,
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
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  iconContainerActive: {
    backgroundColor: theme.colors.accentSoft,
  },
});

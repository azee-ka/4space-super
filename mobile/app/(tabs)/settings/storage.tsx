import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

export default function StorageSettingsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [autoPlayMedia, setAutoPlayMedia] = useState(true);
  const [autoDownloadMedia, setAutoDownloadMedia] = useState(false);
  const [highQualityUploads, setHighQualityUploads] = useState(true);
  const [backupMode, setBackupMode] = useState('Wi-Fi only');
  const [dataSaver, setDataSaver] = useState(false);

  const storageUsed = 3.4;
  const storageTotal = 10;
  const storagePercent = Math.min(100, Math.round((storageUsed / storageTotal) * 100));

  const showPicker = (title: string, options: string[], setter: (value: string) => void) => {
    Alert.alert(title, '', [
      ...options.map((option) => ({ text: option, onPress: () => setter(option) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Clear cached media and temporary files?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Data & Storage</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionTitle}>Media</Text>
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

          <View style={styles.menuItem}>
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
        </View>

        <Text style={styles.sectionTitle}>Network</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
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

          <View style={styles.menuItem}>
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
          <TouchableOpacity style={styles.storageAction} onPress={handleClearCache}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={styles.storageActionText}>Clear Cache</Text>
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
  storageAction: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  storageActionText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});

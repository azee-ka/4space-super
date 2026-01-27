import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';
import { useSettingsStore } from '../../../src/store/settingsStore';

export default function StorageSettingsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { storage, updateStorageSettings } = useSettingsStore();

  const storageUsed = 3.4;
  const storageTotal = 10;
  const storagePercent = Math.min(100, Math.round((storageUsed / storageTotal) * 100));

  const handleClearCache = () => {
    router.push('/settings/storage/clear-cache');
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
              value={storage.autoPlayMedia}
              onValueChange={(value) => updateStorageSettings({ autoPlayMedia: value })}
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
              value={storage.autoDownloadMedia}
              onValueChange={(value) => updateStorageSettings({ autoDownloadMedia: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push({ pathname: '/settings/storage/media-quality', params: { current: storage.mediaQuality } })}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="image-outline" size={20} color="#f472b6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Media Quality</Text>
                <Text style={styles.menuItemSubtext}>Photo and video quality</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{storage.mediaQuality}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push({ pathname: '/settings/storage/download-over', params: { current: storage.downloadOver } })}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="wifi-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Download Over</Text>
                <Text style={styles.menuItemSubtext}>Network preference for downloads</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{storage.downloadOver}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

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
              value={storage.highQualityUploads}
              onValueChange={(value) => updateStorageSettings({ highQualityUploads: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="contract-outline" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Compress Uploads</Text>
                <Text style={styles.menuItemSubtext}>Reduce file size for faster uploads</Text>
              </View>
            </View>
            <Switch
              value={storage.compressUploads}
              onValueChange={(value) => updateStorageSettings({ compressUploads: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Network & Backup</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push({ pathname: '/settings/storage/backup-mode', params: { current: storage.backupMode } })}
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
              <Text style={styles.menuItemValue}>{storage.backupMode}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cloud-upload-outline" size={20} color="#3b82f6" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Auto Backup</Text>
                <Text style={styles.menuItemSubtext}>Automatically backup chats</Text>
              </View>
            </View>
            <Switch
              value={storage.autoBackup}
              onValueChange={(value) => updateStorageSettings({ autoBackup: value })}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

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
              value={storage.dataSaver}
              onValueChange={(value) => updateStorageSettings({ dataSaver: value })}
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

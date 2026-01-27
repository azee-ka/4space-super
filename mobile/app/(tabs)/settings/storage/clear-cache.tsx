import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { Button } from '../../../../src/components/ui';

export default function ClearCacheScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const handleClearCache = () => {
    // In a real app, you'd clear the cache here
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clear Cache</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#ef4444' + '20' }]}>
            <Ionicons name="trash" size={32} color="#ef4444" />
          </View>
          <Text style={styles.infoTitle}>Clear cached data?</Text>
          <Text style={styles.infoDescription}>
            This will remove cached media and temporary files to free up storage space.
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="images-outline" size={20} color={theme.colors.textSubtle} />
            <Text style={styles.detailLabel}>Media cache</Text>
            <Text style={styles.detailValue}>1.1 GB</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Ionicons name="document-outline" size={20} color={theme.colors.textSubtle} />
            <Text style={styles.detailLabel}>Temporary files</Text>
            <Text style={styles.detailValue}>0.3 GB</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Ionicons name="server-outline" size={20} color={theme.colors.textSubtle} />
            <Text style={styles.detailLabel}>Total to clear</Text>
            <Text style={[styles.detailValue, { color: accentHex, fontWeight: '700' }]}>1.4 GB</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSubtle} />
          <Text style={styles.noteText}>
            Your messages and personal data will not be affected. Media will be re-downloaded when needed.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Clear Cache"
            onPress={handleClearCache}
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
  detailsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 15,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
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

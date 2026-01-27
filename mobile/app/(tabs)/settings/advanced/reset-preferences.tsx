import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { Button } from '../../../../src/components/ui';

export default function ResetPreferencesScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const handleReset = () => {
    // In a real app, you'd reset preferences here
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#ef4444' + '20' }]}>
            <Ionicons name="refresh-circle" size={36} color="#ef4444" />
          </View>
          <Text style={styles.infoTitle}>Reset all settings?</Text>
          <Text style={styles.infoDescription}>
            This will restore all settings to their default values. Your messages and account data will not be affected.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>What will be reset</Text>
        <View style={styles.resetList}>
          <View style={styles.resetItem}>
            <View style={styles.resetIconContainer}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.resetText}>Notification preferences</Text>
          </View>
          <View style={styles.resetItem}>
            <View style={styles.resetIconContainer}>
              <Ionicons name="color-palette-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.resetText}>Appearance settings</Text>
          </View>
          <View style={styles.resetItem}>
            <View style={styles.resetIconContainer}>
              <Ionicons name="cloud-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.resetText}>Data and storage settings</Text>
          </View>
          <View style={styles.resetItem}>
            <View style={styles.resetIconContainer}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.resetText}>Messaging preferences</Text>
          </View>
          <View style={styles.resetItem}>
            <View style={styles.resetIconContainer}>
              <Ionicons name="shield-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.resetText}>Privacy controls</Text>
          </View>
          <View style={styles.resetItem}>
            <View style={styles.resetIconContainer}>
              <Ionicons name="language-outline" size={20} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.resetText}>Language and advanced options</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What will NOT be reset</Text>
        <View style={styles.safeList}>
          <View style={styles.safeItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.safeText}>Your messages and chats</Text>
          </View>
          <View style={styles.safeItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.safeText}>Account information</Text>
          </View>
          <View style={styles.safeItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.safeText}>Media and files</Text>
          </View>
          <View style={styles.safeItem}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.safeText}>Contacts and spaces</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Reset to Defaults"
            onPress={handleReset}
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
    marginBottom: 24,
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
  resetList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  resetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resetIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    marginRight: 12,
  },
  resetText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  safeList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  safeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safeText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  actions: {
    gap: 12,
  },
});

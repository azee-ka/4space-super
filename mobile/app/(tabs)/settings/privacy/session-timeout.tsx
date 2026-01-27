import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

type SessionTimeoutOption = '5 min' | '15 min' | '30 min' | '1 hour' | 'Never';

const OPTIONS: Array<{ value: SessionTimeoutOption; label: string; description: string }> = [
  {
    value: '5 min',
    label: '5 Minutes',
    description: 'Lock app after 5 minutes of inactivity',
  },
  {
    value: '15 min',
    label: '15 Minutes',
    description: 'Lock app after 15 minutes of inactivity',
  },
  {
    value: '30 min',
    label: '30 Minutes',
    description: 'Lock app after 30 minutes of inactivity',
  },
  {
    value: '1 hour',
    label: '1 Hour',
    description: 'Lock app after 1 hour of inactivity',
  },
  {
    value: 'Never',
    label: 'Never',
    description: 'Don\'t auto-lock (not recommended)',
  },
];

export default function SessionTimeoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const currentValue = (params.current as SessionTimeoutOption) || '30 min';

  const handleSelect = (value: SessionTimeoutOption) => {
    // In a real app, you'd save this to state/storage
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Timeout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={[styles.iconCircle, { backgroundColor: accentHex + '20' }]}>
            <Ionicons name="shield-checkmark" size={28} color={accentHex} />
          </View>
          <Text style={styles.infoTitle}>Protect your privacy</Text>
          <Text style={styles.infoDescription}>
            The app will automatically lock when you haven't used it for the selected duration. You'll need to authenticate again to access it.
          </Text>
        </View>

        <View style={styles.optionsList}>
          {OPTIONS.map((option, index) => {
            const isSelected = option.value === currentValue;
            const isLast = index === OPTIONS.length - 1;
            const isNotRecommended = option.value === 'Never';

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, !isLast && styles.optionItemBorder]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.labelRow}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {isNotRecommended && (
                      <View style={styles.warningBadge}>
                        <Ionicons name="warning" size={12} color="#f59e0b" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={accentHex} />
                )}
              </TouchableOpacity>
            );
          })}
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
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
  optionsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionContent: {
    flex: 1,
    marginRight: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  warningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
  },
});

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { PrivacyVisibility, usePrivacyStore } from '../../../../src/store/privacyStore';

const OPTIONS: Array<{ value: PrivacyVisibility; label: string; description: string }> = [
  {
    value: 'everyone',
    label: 'Everyone',
    description: 'All users can see when you were last active',
  },
  {
    value: 'contacts',
    label: 'My Contacts',
    description: 'Only your contacts can see your last seen',
  },
  {
    value: 'contacts_except',
    label: 'My Contacts Except...',
    description: 'Your contacts except specific people you exclude',
  },
  {
    value: 'nobody',
    label: 'Nobody',
    description: 'Hide your last seen from everyone',
  },
];

export default function LastSeenScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { lastSeenVisibility, setLastSeenVisibility } = usePrivacyStore();

  const handleSelect = (value: PrivacyVisibility) => {
    setLastSeenVisibility(value);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Last Seen</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="eye-outline" size={32} color={accentHex} />
          <Text style={styles.infoTitle}>Control your visibility</Text>
          <Text style={styles.infoDescription}>
            Choose who can see when you were last active on 4Space. Note: If you hide your last seen, you won't be able to see others' last seen either.
          </Text>
        </View>

        <View style={styles.optionsList}>
          {OPTIONS.map((option, index) => {
            const isSelected = option.value === lastSeenVisibility;
            const isLast = index === OPTIONS.length - 1;

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, !isLast && styles.optionItemBorder]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
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
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
  },
});

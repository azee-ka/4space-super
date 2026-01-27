import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { useSettingsStore, MessageFormattingType } from '../../../../src/store/settingsStore';

const OPTIONS: Array<{ value: MessageFormattingType; label: string; description: string; example: string }> = [
  {
    value: 'Rich',
    label: 'Rich Text',
    description: 'Full formatting with bold, italic, links, and more',
    example: '**Bold**, *italic*, [links](url)',
  },
  {
    value: 'Markdown',
    label: 'Markdown',
    description: 'GitHub-style markdown formatting',
    example: '# Headers, `code`, > quotes',
  },
  {
    value: 'Plain',
    label: 'Plain Text',
    description: 'No formatting, just plain text',
    example: 'Simple text only',
  },
];

export default function MessageFormattingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { updateMessagingSettings } = useSettingsStore();

  const currentValue = (params.current as MessageFormattingType) || 'Rich';

  const handleSelect = (value: MessageFormattingType) => {
    updateMessagingSettings({ messageFormatting: value });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message Formatting</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Choose how text formatting appears in your messages
        </Text>

        <View style={styles.optionsList}>
          {OPTIONS.map((option, index) => {
            const isSelected = option.value === currentValue;
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
                  <View style={styles.exampleContainer}>
                    <Text style={styles.exampleText}>{option.example}</Text>
                  </View>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={accentHex} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={accentHex} />
          <Text style={styles.infoText}>
            Formatting affects how your messages appear to others. Rich text provides the most flexibility.
          </Text>
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
  description: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
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
    marginBottom: 8,
  },
  exampleContainer: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  exampleText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: 'monospace',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
  },
});

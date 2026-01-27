import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { useSettingsStore } from '../../../../src/store/settingsStore';

type BubbleStyleType = 'Round' | 'Square' | 'Minimal';

const OPTIONS: Array<{ value: BubbleStyleType; label: string; description: string }> = [
  {
    value: 'Round',
    label: 'Rounded',
    description: 'Soft, rounded corners (16px)',
  },
  {
    value: 'Square',
    label: 'Square',
    description: 'Sharp corners with minimal radius (4px)',
  },
  {
    value: 'Minimal',
    label: 'Minimal',
    description: 'Subtle styling with background tint',
  },
];

export default function BubbleStyleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { updateAppearanceSettings } = useSettingsStore();

  const currentValue = (params.current as BubbleStyleType) || 'Round';

  const handleSelect = (value: BubbleStyleType) => {
    updateAppearanceSettings({ bubbleStyle: value });
    router.back();
  };

  const getBubblePreviewStyle = (style: BubbleStyleType) => {
    switch (style) {
      case 'Round':
        return { borderRadius: 16 };
      case 'Square':
        return { borderRadius: 4 };
      case 'Minimal':
        return { borderRadius: 8, opacity: 0.7 };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bubble Style</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Choose the shape of message bubbles in conversations
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

                  <View style={styles.previewContainer}>
                    <View style={[styles.previewBubbleReceived, getBubblePreviewStyle(option.value)]}>
                      <Text style={styles.previewText}>Hey there!</Text>
                    </View>
                    <View style={[styles.previewBubbleSent, getBubblePreviewStyle(option.value), { backgroundColor: accentHex }]}>
                      <Text style={styles.previewText}>Hello!</Text>
                    </View>
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
            This style applies to all message bubbles throughout the app
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
    marginBottom: 12,
  },
  previewContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  previewBubbleReceived: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewBubbleSent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
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

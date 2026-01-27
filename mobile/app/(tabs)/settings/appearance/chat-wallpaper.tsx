import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { useSettingsStore } from '../../../../src/store/settingsStore';

type WallpaperType = 'None' | 'Gradient 1' | 'Gradient 2' | 'Pattern 1' | 'Pattern 2' | 'Minimal' | 'Custom';

const OPTIONS: Array<{ value: WallpaperType; label: string; description: string; preview: string }> = [
  {
    value: 'None',
    label: 'None',
    description: 'Default solid background',
    preview: theme.colors.base,
  },
  {
    value: 'Gradient 1',
    label: 'Gradient Blue',
    description: 'Subtle blue gradient',
    preview: '#1e3a8a',
  },
  {
    value: 'Gradient 2',
    label: 'Gradient Purple',
    description: 'Soft purple gradient',
    preview: '#581c87',
  },
  {
    value: 'Pattern 1',
    label: 'Geometric',
    description: 'Light geometric pattern',
    preview: '#1f2937',
  },
  {
    value: 'Pattern 2',
    label: 'Dots',
    description: 'Subtle dot pattern',
    preview: '#374151',
  },
  {
    value: 'Minimal',
    label: 'Minimal',
    description: 'Very subtle texture',
    preview: '#111827',
  },
  {
    value: 'Custom',
    label: 'Custom Image',
    description: 'Upload your own wallpaper',
    preview: '#4f46e5',
  },
];

export default function ChatWallpaperScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { updateAppearanceSettings } = useSettingsStore();

  const currentValue = (params.current as WallpaperType) || 'None';

  const handleSelect = (value: WallpaperType) => {
    if (value === 'Custom') {
      // TODO: Open image picker
      console.log('Open image picker for custom wallpaper');
      return;
    }

    updateAppearanceSettings({ chatWallpaper: value === 'None' ? null : value });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Wallpaper</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Choose a background for your chat conversations
        </Text>

        <View style={styles.wallpaperGrid}>
          {OPTIONS.map((option) => {
            const isSelected = option.value === currentValue;

            return (
              <TouchableOpacity
                key={option.value}
                style={styles.wallpaperCard}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.wallpaperPreview, { backgroundColor: option.preview }]}>
                  {option.value === 'Custom' && (
                    <Ionicons name="image-outline" size={32} color={theme.colors.textSubtle} />
                  )}
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: accentHex }]}>
                      <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                    </View>
                  )}
                </View>
                <Text style={styles.wallpaperLabel}>{option.label}</Text>
                <Text style={styles.wallpaperDescription}>{option.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={accentHex} />
          <Text style={styles.infoText}>
            Wallpapers apply only to chat backgrounds and don't affect other parts of the app.
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
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  wallpaperCard: {
    width: '48%',
    marginBottom: 8,
  },
  wallpaperPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  wallpaperDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 16,
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

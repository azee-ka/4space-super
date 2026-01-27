import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { useSettingsStore, NotificationSoundType } from '../../../../src/store/settingsStore';

const OPTIONS: Array<{ value: NotificationSoundType; label: string; description: string }> = [
  {
    value: 'Default',
    label: 'Default',
    description: 'Classic notification sound',
  },
  {
    value: 'Chime',
    label: 'Chime',
    description: 'Gentle chime tone',
  },
  {
    value: 'Bell',
    label: 'Bell',
    description: 'Pleasant bell sound',
  },
  {
    value: 'Ping',
    label: 'Ping',
    description: 'Quick ping notification',
  },
  {
    value: 'Pop',
    label: 'Pop',
    description: 'Subtle pop sound',
  },
  {
    value: 'Whistle',
    label: 'Whistle',
    description: 'Short whistle tone',
  },
  {
    value: 'Swoosh',
    label: 'Swoosh',
    description: 'Smooth swoosh sound',
  },
  {
    value: 'None',
    label: 'None',
    description: 'Silent notifications',
  },
];

export default function NotificationSoundScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { updateNotificationSettings } = useSettingsStore();

  const currentValue = (params.current as NotificationSoundType) || 'Default';

  const handleSelect = (value: NotificationSoundType) => {
    updateNotificationSettings({ notificationSound: value });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Sound</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Choose a sound that plays when you receive notifications
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
                </View>
                <View style={styles.optionActions}>
                  {option.value !== 'None' && (
                    <TouchableOpacity
                      style={[styles.playButton, { borderColor: accentHex }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        // Play sound preview
                      }}
                    >
                      <Ionicons name="play" size={14} color={accentHex} />
                    </TouchableOpacity>
                  )}
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={accentHex} style={styles.checkIcon} />
                  )}
                </View>
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
  },
  optionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    marginLeft: 4,
  },
});

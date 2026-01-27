import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { useSettingsStore, DownloadOverType } from '../../../../src/store/settingsStore';

const OPTIONS: Array<{ value: DownloadOverType; label: string; description: string; iconName: string; color: string }> = [
  {
    value: 'Wi-Fi only',
    label: 'Wi-Fi Only',
    description: 'Save mobile data, downloads only on Wi-Fi',
    iconName: 'wifi',
    color: '#22d3ee',
  },
  {
    value: 'Wi-Fi + Cellular',
    label: 'Wi-Fi + Cellular',
    description: 'Download on any connection',
    iconName: 'cellular',
    color: '#10b981',
  },
  {
    value: 'Always Ask',
    label: 'Always Ask',
    description: 'Choose for each download',
    iconName: 'help-circle',
    color: '#a855f7',
  },
];

export default function DownloadOverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { updateStorageSettings } = useSettingsStore();

  const currentValue = (params.current as DownloadOverType) || 'Wi-Fi only';

  const handleSelect = (value: DownloadOverType) => {
    updateStorageSettings({ downloadOver: value });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Download Over</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Choose which connections can be used for downloading media
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
                <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.iconName as any} size={20} color={option.color} />
                </View>
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

        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={20} color="#f59e0b" />
          <Text style={styles.warningText}>
            Downloading over cellular may use significant mobile data and incur carrier charges.
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  warningCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
  },
});

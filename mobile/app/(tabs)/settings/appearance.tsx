import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../src/store/themeStore';
import { ACCENT_OPTIONS, getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const { accentColor, setAccentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [darkMode, setDarkMode] = useState(true);
  const [themeMode, setThemeMode] = useState('OLED Black');
  const [fontSize, setFontSize] = useState('Medium');
  const [compactMode, setCompactMode] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const showPicker = (title: string, options: string[], setter: (value: string) => void) => {
    Alert.alert(title, '', [
      ...options.map((option) => ({ text: option, onPress: () => setter(option) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appearance</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="moon-outline" size={20} color="#38bdf8" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Dark Mode</Text>
                <Text style={styles.menuItemSubtext}>OLED-friendly experience</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => showPicker('Theme Style', ['OLED Black', 'Dim', 'Classic'], setThemeMode)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="color-palette-outline" size={20} color={accentHex} />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Theme Style</Text>
                <Text style={styles.menuItemSubtext}>Adjust contrast and surfaces</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{themeMode}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showPicker('Font Size', ['Small', 'Medium', 'Large'], setFontSize)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="text-outline" size={20} color="#a855f7" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Font Size</Text>
                <Text style={styles.menuItemSubtext}>Scale text across the app</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{fontSize}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.accentSection}>
          <Text style={styles.sectionTitle}>Accent Color</Text>
          <View style={styles.accentRow}>
            {ACCENT_OPTIONS.map((option) => {
              const isActive = option.value === accentColor;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.accentSwatch,
                    { backgroundColor: option.hex },
                    isActive && styles.accentSwatchActive,
                  ]}
                  onPress={() => setAccentColor(option.value)}
                >
                  {isActive && <Ionicons name="checkmark" size={14} color={theme.colors.base} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Layout</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="grid-outline" size={20} color="#22d3ee" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Compact Layout</Text>
                <Text style={styles.menuItemSubtext}>Reduce spacing density</Text>
              </View>
            </View>
            <Switch
              value={compactMode}
              onValueChange={setCompactMode}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={20} color="#34d399" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Show Avatars</Text>
                <Text style={styles.menuItemSubtext}>Display profile photos in chats</Text>
              </View>
            </View>
            <Switch
              value={showAvatars}
              onValueChange={setShowAvatars}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="walk-outline" size={20} color="#60a5fa" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>Reduce Motion</Text>
                <Text style={styles.menuItemSubtext}>Minimize animations</Text>
              </View>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="contrast-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuItemTextGroup}>
                <Text style={styles.menuItemText}>High Contrast</Text>
                <Text style={styles.menuItemSubtext}>Boost UI legibility</Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: theme.colors.surfaceSubtle, true: accentHex }}
              thumbColor={theme.colors.white}
            />
          </View>
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
  accentSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  accentSwatch: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentSwatchActive: {
    transform: [{ scale: 1.05 }],
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
});

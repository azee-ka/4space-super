import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { usePrivacyStore } from '../../../../src/store/privacyStore';
import ContactSelectionPanel from './components/ContactSelectionPanel';

export default function ExcludedContactsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { excludedContactIds, setExcludedContactIds } = usePrivacyStore();

  const toggleExclude = (id: string) => {
    setExcludedContactIds((prev) => {
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Excluded Contacts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={[styles.iconCircle, { backgroundColor: accentHex + '20' }]}>
            <Ionicons name="person-remove" size={28} color={accentHex} />
          </View>
          <Text style={styles.infoTitle}>Manage privacy exceptions</Text>
          <Text style={styles.infoDescription}>
            Contacts you exclude won't be able to see your last seen or online status, even if you've set it to 'My contacts'.
          </Text>
        </View>

        <ContactSelectionPanel
          selectedIds={excludedContactIds}
          onToggle={toggleExclude}
          description="People you exclude won't see your presence indicators."
        />

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSubtle} />
          <Text style={styles.noteText}>
            You can clear exclusions anytime and they only affect presence visibility.
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
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
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
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  noteText: {
    color: theme.colors.textSubtle,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 18,
  },
});

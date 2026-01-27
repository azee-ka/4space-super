import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';
import { Avatar } from '../../../../src/components/ui';

// Mock data
const MOCK_CONTACTS = [
  { id: '1', name: 'Alice Johnson', username: 'alice', avatar: null },
  { id: '2', name: 'Bob Smith', username: 'bobsmith', avatar: null },
  { id: '3', name: 'Carol White', username: 'carolw', avatar: null },
  { id: '4', name: 'David Brown', username: 'davidb', avatar: null },
];

export default function ExcludedContactsScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [searchQuery, setSearchQuery] = useState('');
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  const filteredContacts = MOCK_CONTACTS.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExclude = (id: string) => {
    setExcludedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSubtle} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts..."
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          )}
        </View>

        {excludedIds.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Excluded ({excludedIds.length})</Text>
            <View style={styles.contactsList}>
              {MOCK_CONTACTS.filter(c => excludedIds.includes(c.id)).map((contact, index) => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    index < MOCK_CONTACTS.filter(c => excludedIds.includes(c.id)).length - 1 && styles.contactItemBorder
                  ]}
                  onPress={() => toggleExclude(contact.id)}
                >
                  <Avatar
                    uri={contact.avatar}
                    name={contact.name}
                    seed={contact.id}
                    size="md"
                  />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactUsername}>@{contact.username}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={accentHex} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>All Contacts</Text>
        <View style={styles.contactsList}>
          {filteredContacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={theme.colors.textSubtle} />
              <Text style={styles.emptyText}>No contacts found</Text>
            </View>
          ) : (
            filteredContacts.map((contact, index) => {
              const isExcluded = excludedIds.includes(contact.id);
              const isLast = index === filteredContacts.length - 1;

              return (
                <TouchableOpacity
                  key={contact.id}
                  style={[styles.contactItem, !isLast && styles.contactItemBorder]}
                  onPress={() => toggleExclude(contact.id)}
                >
                  <Avatar
                    uri={contact.avatar}
                    name={contact.name}
                    seed={contact.id}
                    size="md"
                  />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactUsername}>@{contact.username}</Text>
                  </View>
                  {isExcluded ? (
                    <Ionicons name="checkmark-circle" size={24} color={accentHex} />
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginTop: 8,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  contactItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  contactUsername: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    marginTop: 12,
  },
});

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../../../src/components/ui';
import { theme } from '../../../../../src/styles/theme';
import { getAccentColorHex } from '../../../../../src/utils/themeUtils';
import { useThemeStore } from '../../../../../src/store/themeStore';
import {
  DisplayContact,
  useDeviceContacts,
} from '../../../../../src/hooks/useDeviceContacts';

type ContactSelectionPanelProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onInvite?: (contact: DisplayContact) => void;
  allowInvites?: boolean;
  title?: string;
  description?: string;
};

export default function ContactSelectionPanel({
  selectedIds,
  onToggle,
  onInvite,
  allowInvites = true,
  title = 'Select contacts to exclude',
  description = 'Pick contacts who should not see your activity.',
}: ContactSelectionPanelProps) {
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const {
    contacts,
    loading,
    permissionStatus,
    permissionError,
    fallbackContacts,
    requestPermissions,
  } = useDeviceContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const contactSource = contacts.length > 0 ? contacts : fallbackContacts;
  const searchLower = searchQuery.toLowerCase().trim();
  const numericQuery = searchQuery.replace(/\D/g, '');

  const filteredContacts = useMemo(() => {
    if (!searchLower && !numericQuery) {
      return contactSource;
    }

    return contactSource.filter((contact) => {
      const matchesName = contact.name.toLowerCase().includes(searchLower);
      const matchesPhoneText =
        contact.primaryPhone?.toLowerCase().includes(searchLower);
      const matchesPhoneDigits =
        numericQuery.length > 0 &&
        contact.primaryPhone
          ?.replace(/\D/g, '')
          .includes(numericQuery);

      return matchesName || matchesPhoneText || matchesPhoneDigits;
    });
  }, [contactSource, numericQuery, searchLower]);

  const toggleInvite = (contact: DisplayContact) => {
    if (invitedIds.includes(contact.id)) {
      return;
    }

    setInvitedIds((prev) => [...prev, contact.id]);
    onInvite?.(contact);
  };

  const openSettings = () => {
    Linking.openSettings().catch(() => {});
  };

  const statusText =
    permissionStatus === 'denied'
      ? 'Permission required'
      : 'Loading contacts…';

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedLabel}>{selectedIds.length} selected</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textSubtle} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contacts"
          placeholderTextColor={theme.colors.textSubtle}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      {permissionStatus === 'denied' && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionBannerText}>
            Allow contact access to select real people to exclude. Tap retry to prompt again or open settings to grant access manually.
          </Text>
          <View style={styles.permissionActions}>
            <TouchableOpacity onPress={requestPermissions}>
              <Text style={[styles.permissionAction, { color: accentHex }]}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openSettings}>
              <Text style={[styles.permissionAction, { color: accentHex }]}>Open settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {permissionError && (
        <Text style={styles.permissionError}>{permissionError}</Text>
      )}

      {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={accentHex} style={styles.loadingIndicator} />
            <Text style={styles.loadingText}>{statusText}</Text>
          </View>
        )}

      <View style={styles.contactsList}>
        {filteredContacts.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={48} color={theme.colors.textSubtle} />
            <Text style={styles.emptyText}>No contacts match your search.</Text>
          </View>
        ) : (
          filteredContacts.map((contact, index) => {
            const isSelected = selectedIds.includes(contact.id);
            const isInvited = invitedIds.includes(contact.id);
            const isLast = index === filteredContacts.length - 1;

            return (
              <View
                key={contact.id}
                style={[styles.contactRow, !isLast && styles.contactBorder]}
              >
                <TouchableOpacity
                  style={styles.contactLabel}
                  onPress={() => onToggle(contact.id)}
                  activeOpacity={0.7}
                >
                  <Avatar
                    uri={contact.avatar}
                    name={contact.name}
                    seed={contact.id}
                    size="md"
                  />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactMeta}>
                      {contact.primaryPhone || (contact.isOnApp ? 'On 4Space' : 'Not on 4Space')}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.contactActions}>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={accentHex} />
                  )}

                  {!contact.isOnApp && allowInvites && (
                    <TouchableOpacity
                      style={[
                        styles.inviteButton,
                        isInvited && styles.invitedButton,
                      ]}
                      onPress={() => toggleInvite(contact)}
                      disabled={isInvited}
                    >
                      <Text
                        style={[
                          styles.inviteText,
                          isInvited && styles.invitedText,
                        ]}
                      >
                        {isInvited ? 'Invited' : 'Invite'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
  },
  selectedBadge: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.base,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  permissionBanner: {
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 12,
    marginBottom: 10,
  },
  permissionBannerText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
    marginBottom: 8,
  },
  permissionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionAction: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 16,
  },
  permissionError: {
    fontSize: 12,
    color: theme.colors.danger,
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  contactsList: {
    borderRadius: 14,
    backgroundColor: theme.colors.base,
    overflow: 'hidden',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    marginTop: 10,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  contactBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  contactMeta: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  contactActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  },
  inviteButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  invitedButton: {
    borderColor: theme.colors.textSubtle,
  },
  inviteText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  invitedText: {
    color: theme.colors.textSubtle,
  },
});

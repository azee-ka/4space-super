import { useCallback, useEffect, useState } from 'react';
import * as Contacts from 'expo-contacts';

export type DisplayContact = {
  id: string;
  name: string;
  primaryPhone: string | null;
  avatar: string | null;
  isOnApp: boolean;
};

const FALLBACK_CONTACTS: DisplayContact[] = [
  { id: 'fallback-1', name: 'Alice Johnson', primaryPhone: '+1 (555) 010-9000', avatar: null, isOnApp: true },
  { id: 'fallback-2', name: 'Ben Richards', primaryPhone: '+1 (555) 010-9001', avatar: null, isOnApp: false },
  { id: 'fallback-3', name: 'Chloe Martinez', primaryPhone: '+1 (555) 010-9002', avatar: null, isOnApp: false },
  { id: 'fallback-4', name: 'Daniel Kim', primaryPhone: '+1 (555) 010-9003', avatar: null, isOnApp: true },
];

const computeIsOnApp = (id: string) => {
  const code = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return code % 2 === 0;
};

const normalizeContact = (contact: Contacts.ExistingContact): DisplayContact => {
  const displayName = (contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`).trim() || 'Contact';
  const primaryPhone = contact.phoneNumbers?.[0]?.number?.trim() ?? null;

  return {
    id: contact.id,
    name: displayName,
    primaryPhone,
    avatar: contact.image?.uri ?? null,
    isOnApp: computeIsOnApp(contact.id),
  };
};

export function useDeviceContacts() {
  const [contacts, setContacts] = useState<DisplayContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        sort: Contacts.SortTypes.LastName,
        pageSize: 250,
      });

      const normalized = data
        .map(normalizeContact)
        .filter((contact) => contact.name.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

      setContacts(normalized);
    } catch (err) {
      console.error('Unable to load contacts', err);
      setError('Unable to load your contacts right now.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      const { status, accessPrivileges } = await Contacts.getPermissionsAsync();
      const granted =
        status === 'granted' ||
        accessPrivileges === 'all' ||
        accessPrivileges === 'limited';

      setPermissionStatus(granted ? 'granted' : 'denied');

      if (granted) {
        await loadContacts();
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('Contacts permission check failed', err);
      setError('Unable to access your contacts.');
      setPermissionStatus('denied');
      setContacts([]);
    }
  }, [loadContacts]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestPermissions = useCallback(async () => {
    setError(null);

    try {
      const { status, accessPrivileges } = await Contacts.requestPermissionsAsync();
      const granted =
        status === 'granted' ||
        accessPrivileges === 'all' ||
        accessPrivileges === 'limited';

      setPermissionStatus(granted ? 'granted' : 'denied');

      if (granted) {
        await loadContacts();
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('Contacts request failed', err);
      setError('Unable to request contact access.');
      setPermissionStatus('denied');
      setContacts([]);
    }
  }, [loadContacts]);

  return {
    contacts,
    loading,
    permissionStatus,
    permissionError: error,
    fallbackContacts: FALLBACK_CONTACTS,
    requestPermissions,
    refreshContacts: loadContacts,
  };
}

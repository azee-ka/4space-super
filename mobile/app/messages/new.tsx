import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useConversations } from '../../src/hooks/useConversations';
import { Avatar } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { theme } from '../../src/styles/theme';

interface ProfileResult {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string | null;
}

export default function NewMessageScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: conversations } = useConversations(user?.id || '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);

  const recentContacts = useMemo(() => {
    if (!conversations) return [];
    return conversations
      .filter((conversation) => conversation.type === 'dm')
      .map((conversation) => conversation.participants[0])
      .filter(Boolean)
      .slice(0, 6) as ProfileResult[];
  }, [conversations]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
        .limit(20);

      if (error) {
        setLoading(false);
        return;
      }

      const filtered = (data || []).filter((profile) => profile.id !== user?.id);
      setResults(filtered as ProfileResult[]);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, user?.id]);

  const handleStartChat = async (profile: ProfileResult) => {
    if (!profile.id) return;
    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
        other_user_id: profile.id,
      });

      if (error) throw error;

      const conversationId = typeof data === 'string' ? data : data?.id || data;
      if (!conversationId) {
        throw new Error('Conversation could not be created.');
      }

      router.replace(`/messages/${conversationId}` as any);
    } catch (error: any) {
      Alert.alert('Unable to start chat', error?.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Message</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            placeholder="Search by name or username"
            placeholderTextColor={theme.colors.textSubtle}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {loading && <ActivityIndicator size="small" color={theme.colors.textMuted} />}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('New Group', 'Group creation is coming next.')}
          >
            <Ionicons name="people-outline" size={18} color="#34d399" />
            <Text style={styles.quickActionText}>Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Broadcast', 'Channel broadcasts are coming soon.')}
          >
            <Ionicons name="megaphone-outline" size={18} color="#f97316" />
            <Text style={styles.quickActionText}>Broadcast</Text>
          </TouchableOpacity>
        </View>

        {recentContacts.length > 0 && !query.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <View style={styles.grid}>
              {recentContacts.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={styles.profileCard}
                  onPress={() => handleStartChat(profile)}
                >
                  <Avatar
                    uri={profile.avatar_url}
                    name={profile.display_name || profile.username}
                    seed={profile.id}
                    size="lg"
                  />
                  <Text style={styles.profileName} numberOfLines={1}>
                    {profile.display_name || profile.username}
                  </Text>
                  <Text style={styles.profileHandle} numberOfLines={1}>
                    @{profile.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {query.trim().length === 0 ? (
            <Text style={styles.emptyText}>Start typing to find people.</Text>
          ) : results.length === 0 ? (
            <Text style={styles.emptyText}>No matches yet. Try a different name.</Text>
          ) : (
            <View style={styles.resultsList}>
              {results.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={styles.resultRow}
                  onPress={() => handleStartChat(profile)}
                >
                  <Avatar
                    uri={profile.avatar_url}
                    name={profile.display_name || profile.username}
                    seed={profile.id}
                    size="md"
                  />
                  <View style={styles.resultMeta}>
                    <Text style={styles.resultName}>
                      {profile.display_name || profile.username}
                    </Text>
                    <Text style={styles.resultHandle}>@{profile.username}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
                </TouchableOpacity>
              ))}
            </View>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  quickActionText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  profileCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  profileName: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  profileHandle: {
    color: theme.colors.textSubtle,
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  resultsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultMeta: {
    flex: 1,
    marginLeft: 10,
  },
  resultName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  resultHandle: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    marginTop: 2,
  },
});

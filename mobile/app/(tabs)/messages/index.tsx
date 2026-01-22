import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../src/store/authStore';
import { useConversations } from '../../../src/hooks/useConversations';
import { ConversationItem } from '../../../src/components/chat';
import { LoadingSpinner, Avatar } from '../../../src/components/ui';
import { useMessagePreferencesStore } from '../../../src/store/messagePreferencesStore';
import { theme } from '../../../src/styles/theme';
import { supabase } from '../../../src/lib/supabase';
import { Conversation } from '../../../src/types';

const FILTERS = ['All', 'Unread', 'Pinned', 'Groups', 'Muted', 'Archived'] as const;

type FilterKey = (typeof FILTERS)[number];

type SortKey = 'Recent' | 'Unread' | 'Name';

export default function MessagesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [sortMode, setSortMode] = useState<SortKey>('Recent');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showActions, setShowActions] = useState(false);

  const {
    pinnedConversations,
    mutedConversations,
    archivedConversations,
    togglePinnedConversation,
    toggleMutedConversation,
    toggleArchivedConversation,
  } = useMessagePreferencesStore();

  const counts = useMemo(() => {
    const list = conversations || [];
    return {
      all: list.length,
      unread: list.filter((c) => c.unread_count > 0).length,
      pinned: list.filter((c) => pinnedConversations.includes(c.id)).length,
      groups: list.filter((c) => c.type === 'group').length,
      muted: list.filter((c) => mutedConversations.includes(c.id)).length,
      archived: list.filter((c) => archivedConversations.includes(c.id)).length,
    };
  }, [conversations, pinnedConversations, mutedConversations, archivedConversations]);

  const filteredConversations = useMemo(() => {
    const list = conversations || [];
    const lowered = searchQuery.trim().toLowerCase();

    const matchesSearch = (conversation: Conversation) => {
      if (!lowered) return true;
      const name =
        conversation.type === 'group'
          ? conversation.name
          : conversation.participants[0]?.display_name || conversation.participants[0]?.username;
      const lastMessage = conversation.last_message?.content || '';
      return (
        name?.toLowerCase().includes(lowered) ||
        lastMessage.toLowerCase().includes(lowered)
      );
    };

    const isPinned = (conversation: Conversation) => pinnedConversations.includes(conversation.id);
    const isMuted = (conversation: Conversation) => mutedConversations.includes(conversation.id);
    const isArchived = (conversation: Conversation) => archivedConversations.includes(conversation.id);

    const base = list.filter(matchesSearch).filter((conversation) => {
      switch (activeFilter) {
        case 'Unread':
          return conversation.unread_count > 0 && !isArchived(conversation);
        case 'Pinned':
          return isPinned(conversation) && !isArchived(conversation);
        case 'Groups':
          return conversation.type === 'group' && !isArchived(conversation);
        case 'Muted':
          return isMuted(conversation) && !isArchived(conversation);
        case 'Archived':
          return isArchived(conversation);
        default:
          return !isArchived(conversation);
      }
    });

    const sorted = [...base].sort((a, b) => {
      if (sortMode === 'Unread') {
        return (b.unread_count || 0) - (a.unread_count || 0);
      }
      if (sortMode === 'Name') {
        return (a.name || a.participants[0]?.display_name || '').localeCompare(
          b.name || b.participants[0]?.display_name || ''
        );
      }
      const aTime = a.last_message?.created_at || a.updated_at || a.created_at;
      const bTime = b.last_message?.created_at || b.updated_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return sorted;
  }, [conversations, searchQuery, activeFilter, sortMode, pinnedConversations, mutedConversations, archivedConversations]);

  const pinnedList = filteredConversations.filter((conversation) => pinnedConversations.includes(conversation.id));
  const recentList = filteredConversations.filter((conversation) => !pinnedConversations.includes(conversation.id));

  const sections = useMemo(() => {
    if (activeFilter === 'All') {
      const data = [] as { title: string; data: Conversation[] }[];
      if (pinnedList.length > 0) {
        data.push({ title: 'Pinned', data: pinnedList });
      }
      if (recentList.length > 0) {
        data.push({ title: 'Recent', data: recentList });
      }
      return data;
    }

    return [{ title: activeFilter, data: filteredConversations }];
  }, [activeFilter, pinnedList, recentList, filteredConversations]);

  const handleActionPress = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowActions(true);
  };

  const handleMarkRead = async () => {
    if (!selectedConversation || !user) return;
    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', selectedConversation.id)
        .eq('user_id', user.id);

      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as read.');
    } finally {
      setShowActions(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const emptyStateMessage = activeFilter === 'Archived'
    ? 'Your archived conversations live here.'
    : 'Start a new conversation to begin messaging.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Inbox</Text>
            <Text style={styles.headerSubtitle}>
              {counts.unread} unread · {counts.all} total
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={18} color="#22d3ee" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() =>
                Alert.alert('Sort', 'Choose your inbox order', [
                  { text: 'Recent', onPress: () => setSortMode('Recent') },
                  { text: 'Unread', onPress: () => setSortMode('Unread') },
                  { text: 'Name', onPress: () => setSortMode('Name') },
                  { text: 'Cancel', style: 'cancel' },
                ])
              }
            >
              <Ionicons name="options-outline" size={18} color="#f472b6" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Search people, messages, or tags"
              placeholderTextColor={theme.colors.textSubtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/messages/new' as any)}>
            <Ionicons name="create-outline" size={18} color="#22d3ee" />
            <Text style={styles.quickActionText}>New Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('New Group', 'Group creation is coming next.')}
          >
            <Ionicons name="people-outline" size={18} color="#34d399" />
            <Text style={styles.quickActionText}>New Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Broadcast', 'Channel broadcast is coming soon.')}
          >
            <Ionicons name="megaphone-outline" size={18} color="#f97316" />
            <Text style={styles.quickActionText}>Broadcast</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Automations', 'Smart flows are on the way.')}
          >
            <Ionicons name="sparkles-outline" size={18} color="#a855f7" />
            <Text style={styles.quickActionText}>Automate</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            const count =
              filter === 'All'
                ? counts.all
                : filter === 'Unread'
                  ? counts.unread
                  : filter === 'Pinned'
                    ? counts.pinned
                    : filter === 'Groups'
                      ? counts.groups
                      : filter === 'Muted'
                        ? counts.muted
                        : counts.archived;

            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter}
                </Text>
                <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {pinnedList.length > 0 && activeFilter === 'All' && (
          <View style={styles.pinnedLane}>
            <Text style={styles.sectionTitle}>Pinned lane</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedScroll}>
              {pinnedList.map((conversation) => {
                const name =
                  conversation.type === 'group'
                    ? conversation.name
                    : conversation.participants[0]?.display_name || conversation.participants[0]?.username;
                const seed =
                  conversation.type === 'group'
                    ? conversation.id
                    : conversation.participants[0]?.id || conversation.id;
                return (
                  <TouchableOpacity
                    key={conversation.id}
                    style={styles.pinnedCard}
                    onPress={() => router.push('/messages/' + conversation.id)}
                  >
                    <View style={styles.pinnedAvatar}>
                      <Avatar
                        uri={conversation.type === 'group' ? conversation.avatar_url : conversation.participants[0]?.avatar_url}
                        name={name || 'Pinned'}
                        seed={seed}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.pinnedName} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.pinnedSnippet} numberOfLines={1}>
                      {conversation.last_message?.content || 'Pinned'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyDescription}>{emptyStateMessage}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/messages/new' as any)}>
              <Ionicons name="add" size={18} color={theme.colors.base} />
              <Text style={styles.emptyButtonText}>Start a message</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <ConversationItem
                conversation={item}
                isPinned={pinnedConversations.includes(item.id)}
                isMuted={mutedConversations.includes(item.id)}
                isArchived={archivedConversations.includes(item.id)}
                onLongPress={() => handleActionPress(item)}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/messages/new' as any)}>
        <Ionicons name="create-outline" size={22} color={theme.colors.base} />
      </TouchableOpacity>

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowActions(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.actionsModal}>
            <Text style={styles.modalTitle}>Conversation actions</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedConversation) {
                    togglePinnedConversation(selectedConversation.id);
                  }
                  setShowActions(false);
                }}
                style={styles.actionButton}
              >
                <Ionicons name="pin" size={20} color="#f97316" />
                <Text style={styles.actionText}>
                  {selectedConversation && pinnedConversations.includes(selectedConversation.id) ? 'Unpin' : 'Pin'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedConversation) {
                    toggleMutedConversation(selectedConversation.id);
                  }
                  setShowActions(false);
                }}
                style={styles.actionButton}
              >
                <Ionicons name="volume-mute" size={20} color="#94a3b8" />
                <Text style={styles.actionText}>
                  {selectedConversation && mutedConversations.includes(selectedConversation.id) ? 'Unmute' : 'Mute'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedConversation) {
                    toggleArchivedConversation(selectedConversation.id);
                  }
                  setShowActions(false);
                }}
                style={styles.actionButton}
              >
                <Ionicons name="archive-outline" size={20} color="#64748b" />
                <Text style={styles.actionText}>
                  {selectedConversation && archivedConversations.includes(selectedConversation.id) ? 'Unarchive' : 'Archive'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMarkRead} style={styles.actionButton}>
                <Ionicons name="checkmark-done-outline" size={20} color="#34d399" />
                <Text style={styles.actionText}>Mark as read</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: theme.colors.textMuted,
    marginTop: 6,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  filterChipActive: {
    backgroundColor: theme.colors.surface,
  },
  filterChipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.colors.textPrimary,
  },
  filterBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeActive: {
    backgroundColor: theme.colors.accentSoft,
  },
  filterBadgeText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  filterBadgeTextActive: {
    color: theme.colors.accent,
  },
  pinnedLane: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pinnedScroll: {
    gap: 12,
    paddingRight: 16,
  },
  pinnedCard: {
    width: 160,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
  },
  pinnedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: 10,
  },
  pinnedName: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  pinnedSnippet: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  sectionHeader: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: theme.colors.base,
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: theme.colors.accent,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  actionsModal: {
    backgroundColor: theme.colors.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  actionsContainer: {
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});

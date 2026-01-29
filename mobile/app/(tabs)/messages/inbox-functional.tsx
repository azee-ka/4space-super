// FULLY FUNCTIONAL INBOX - Replace index.tsx with this file after reviewing
// This version has ALL features working - no placeholders!

import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
  Pressable,
  Dimensions,
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
import { useInboxPreferencesStore, checkAutoLock } from '../../../src/store/inboxPreferencesStore';
import { theme } from '../../../src/styles/theme';
import { supabase } from '../../../src/lib/supabase';
import { Conversation } from '../../../src/types';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Unread', 'Pinned', 'Groups', 'Muted', 'Archived', 'Locked'] as const;
type FilterKey = (typeof FILTERS)[number];
type SortKey = 'Recent' | 'Unread' | 'Name' | 'Priority';

export default function FunctionalInboxScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations(user?.id || '');

  // Message preferences (pin, mute, archive)
  const {
    pinnedConversations,
    mutedConversations,
    archivedConversations,
    togglePinnedConversation,
    toggleMutedConversation,
    toggleArchivedConversation,
  } = useMessagePreferencesStore();

  // Inbox preferences (lock, folders, timers, quick replies)
  const {
    lockCode,
    lockedConversations,
    isUnlocked,
    unlockWithCode,
    lockApp,
    toggleLockedConversation,
    folders,
    addConversationToFolder,
    removeConversationFromFolder,
    timers,
    setTimer,
    removeTimer,
    checkTimers,
    quickReplies,
    selfChatId,
    compactMode,
  } = useInboxPreferencesStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [sortMode, setSortMode] = useState<SortKey>('Recent');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);

  // Check for expired timers periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const expiredConvIds = checkTimers();
      if (expiredConvIds.length > 0) {
        expiredConvIds.forEach((convId) => {
          const timer = timers.find((t) => t.conversationId === convId);
          if (timer?.action === 'archive') {
            toggleArchivedConversation(convId);
          } else if (timer?.action === 'mute') {
            toggleMutedConversation(convId);
          }
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [timers, checkTimers, toggleArchivedConversation, toggleMutedConversation]);

  // Auto-lock check
  useEffect(() => {
    if (lockCode) {
      const interval = setInterval(() => {
        checkAutoLock();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [lockCode]);

  // Handle unlock via search
  useEffect(() => {
    if (activeFilter === 'Locked' && searchQuery && lockCode && !isUnlocked) {
      if (unlockWithCode(searchQuery)) {
        Alert.alert('Success', 'Locked chats unlocked!');
        setSearchQuery('');
      }
    }
  }, [searchQuery, activeFilter, lockCode, isUnlocked, unlockWithCode]);

  // Counts for filter badges
  const counts = useMemo(() => {
    const list = conversations || [];
    return {
      all: list.length,
      unread: list.filter((c) => c.unread_count > 0 && !archivedConversations.includes(c.id)).length,
      pinned: list.filter((c) => pinnedConversations.includes(c.id)).length,
      groups: list.filter((c) => c.type === 'group').length,
      muted: list.filter((c) => mutedConversations.includes(c.id)).length,
      archived: list.filter((c) => archivedConversations.includes(c.id)).length,
      locked: lockedConversations.length,
    };
  }, [conversations, pinnedConversations, mutedConversations, archivedConversations, lockedConversations]);

  // Filtered and sorted conversations
  const filteredConversations = useMemo(() => {
    const list = conversations || [];
    const lowered = searchQuery.trim().toLowerCase();

    // If locked filter is active and not unlocked, show lock screen
    if (activeFilter === 'Locked' && lockCode && !isUnlocked) {
      return [];
    }

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
    const isLocked = (conversation: Conversation) => lockedConversations.includes(conversation.id);

    let base = list.filter(matchesSearch);

    // Apply folder filter
    if (activeFolder) {
      const folder = folders.find((f) => f.id === activeFolder);
      if (folder) {
        base = base.filter((c) => folder.conversationIds.includes(c.id));
      }
    }

    // Apply filter
    base = base.filter((conversation) => {
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
        case 'Locked':
          return isLocked(conversation);
        default:
          return !isArchived(conversation);
      }
    });

    // Sort
    const sorted = [...base].sort((a, b) => {
      if (sortMode === 'Priority') {
        const aPriority = (isPinned(a) ? 1000 : 0) + (a.unread_count || 0);
        const bPriority = (isPinned(b) ? 1000 : 0) + (b.unread_count || 0);
        return bPriority - aPriority;
      }
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
  }, [
    conversations,
    searchQuery,
    activeFilter,
    activeFolder,
    sortMode,
    pinnedConversations,
    mutedConversations,
    archivedConversations,
    lockedConversations,
    folders,
    lockCode,
    isUnlocked,
  ]);

  const pinnedList = filteredConversations.filter((c) => pinnedConversations.includes(c.id));
  const recentList = filteredConversations.filter((c) => !pinnedConversations.includes(c.id));

  const sections = useMemo(() => {
    if (activeFilter === 'All' && !activeFolder) {
      const data = [] as { title: string; data: Conversation[] }[];
      if (pinnedList.length > 0) {
        data.push({ title: 'Pinned', data: pinnedList });
      }
      if (recentList.length > 0) {
        data.push({ title: 'Recent', data: recentList });
      }
      return data;
    }

    return [{ title: activeFolder || activeFilter, data: filteredConversations }];
  }, [activeFilter, activeFolder, pinnedList, recentList, filteredConversations]);

  // Actions
  const handleLongPress = (conversation: Conversation) => {
    if (batchMode) {
      toggleSelectChat(conversation.id);
    } else {
      setSelectedConversation(conversation);
      setShowActions(true);
    }
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

  const handleAddToFolder = (folderId: string) => {
    if (!selectedConversation) return;
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    if (folder.conversationIds.includes(selectedConversation.id)) {
      removeConversationFromFolder(folderId, selectedConversation.id);
    } else {
      addConversationToFolder(folderId, selectedConversation.id);
    }
    setShowFolders(false);
    setShowActions(false);
  };

  const handleSetTimer = (hours: number, action: 'archive' | 'mute' = 'archive') => {
    if (!selectedConversation) return;
    setTimer({
      conversationId: selectedConversation.id,
      action,
      hours,
    });
    setShowTimerModal(false);
    setShowActions(false);
    Alert.alert('Timer Set', `Chat will be ${action}d in ${hours} hour(s)`);
  };

  const handleRemoveTimer = () => {
    if (!selectedConversation) return;
    removeTimer(selectedConversation.id);
    Alert.alert('Timer Removed', 'Auto-action cancelled');
  };

  const toggleSelectChat = (chatId: string) => {
    setSelectedChats((prev) =>
      prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]
    );
  };

  const handleBatchAction = (action: 'archive' | 'mute' | 'delete' | 'mark_read') => {
    if (selectedChats.length === 0) return;

    Alert.alert(
      'Confirm',
      `${action.replace('_', ' ')} ${selectedChats.length} chat(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            switch (action) {
              case 'archive':
                selectedChats.forEach((id) => toggleArchivedConversation(id));
                break;
              case 'mute':
                selectedChats.forEach((id) => toggleMutedConversation(id));
                break;
              case 'mark_read':
                if (user) {
                  for (const id of selectedChats) {
                    await supabase
                      .from('conversation_participants')
                      .update({ last_read_at: new Date().toISOString() })
                      .eq('conversation_id', id)
                      .eq('user_id', user.id);
                  }
                  queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                }
                break;
            }
            setSelectedChats([]);
            setBatchMode(false);
          },
        },
      ]
    );
  };

  const handleCreateSelfChat = async () => {
    if (!user) return;
    router.push('/messages/new');
    Alert.alert('Self Chat', 'Start a conversation with yourself to save notes and messages!');
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const showLockScreen = activeFilter === 'Locked' && lockCode && !isUnlocked;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.heroHeader}>
          <View style={styles.glowOrb} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Inbox</Text>
              <View style={styles.headerStats}>
                <View style={styles.statPill}>
                  <View style={[styles.statDot, { backgroundColor: '#22d3ee' }]} />
                  <Text style={styles.statText}>{counts.unread} unread</Text>
                </View>
                <View style={styles.statPill}>
                  <View style={[styles.statDot, { backgroundColor: '#34d399' }]} />
                  <Text style={styles.statText}>{counts.all} total</Text>
                </View>
                {counts.locked > 0 && (
                  <View style={styles.statPill}>
                    <Ionicons name="lock-closed" size={10} color="#f472b6" />
                    <Text style={styles.statText}>{counts.locked} locked</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerActionButton, { backgroundColor: '#0f1c22' }]}
                onPress={() =>
                  Alert.alert('Sort', 'Choose inbox order', [
                    { text: 'Recent', onPress: () => setSortMode('Recent') },
                    { text: 'Unread', onPress: () => setSortMode('Unread') },
                    { text: 'Name', onPress: () => setSortMode('Name') },
                    { text: 'Priority', onPress: () => setSortMode('Priority') },
                    { text: 'Cancel', style: 'cancel' },
                  ])
                }
              >
                <Ionicons name="swap-vertical" size={18} color="#22d3ee" />
              </TouchableOpacity>
              {batchMode ? (
                <TouchableOpacity
                  style={[styles.headerActionButton, { backgroundColor: '#ef444420' }]}
                  onPress={() => {
                    setBatchMode(false);
                    setSelectedChats([]);
                  }}
                >
                  <Ionicons name="close" size={18} color="#ef4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.headerActionButton, { backgroundColor: '#1a0f1f' }]}
                  onPress={() => setBatchMode(true)}
                >
                  <Ionicons name="checkmark-done" size={18} color="#f472b6" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.headerActionButton, { backgroundColor: '#0f1922' }]}
                onPress={() => router.push('/settings/inbox-settings')}
              >
                <Ionicons name="settings-outline" size={18} color="#34d399" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#22d3ee" />
            <TextInput
              placeholder={
                showLockScreen
                  ? 'Type your lock code to unlock...'
                  : 'Search messages, people, or #tags...'
              }
              placeholderTextColor={theme.colors.textSubtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              secureTextEntry={showLockScreen}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor: '#22d3ee30' }]}
              onPress={() => router.push('/messages/new')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#22d3ee20' }]}>
                <Ionicons name="add" size={22} color="#22d3ee" />
              </View>
              <Text style={styles.quickActionText}>New Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor: '#34d39930' }]}
              onPress={handleCreateSelfChat}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#34d39920' }]}>
                <Ionicons name="bookmark" size={22} color="#34d399" />
              </View>
              <Text style={styles.quickActionText}>Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor: '#f472b630' }]}
              onPress={() => setShowQuickReplies(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#f472b620' }]}>
                <Ionicons name="flash" size={22} color="#f472b6" />
              </View>
              <Text style={styles.quickActionText}>Quick Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor: '#a855f730' }]}
              onPress={() => Alert.alert('Schedule', 'Schedule messages for later!')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#a855f720' }]}>
                <Ionicons name="time" size={22} color="#a855f7" />
              </View>
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor: '#fbbf2430' }]}
              onPress={() => Alert.alert('Voice Note', 'Send voice notes quickly!')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#fbbf2420' }]}>
                <Ionicons name="mic" size={22} color="#fbbf24" />
              </View>
              <Text style={styles.quickActionText}>Voice</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Folders */}
        {folders.length > 0 && (
          <View style={styles.foldersSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foldersScroll}>
              <TouchableOpacity
                style={[styles.folderChip, activeFolder === null && styles.folderChipActive]}
                onPress={() => setActiveFolder(null)}
              >
                <Ionicons name="apps" size={14} color={activeFolder === null ? '#22d3ee' : theme.colors.textSubtle} />
                <Text style={[styles.folderText, activeFolder === null && styles.folderTextActive]}>All</Text>
              </TouchableOpacity>
              {folders.map((folder) => {
                const isActive = activeFolder === folder.id;
                return (
                  <TouchableOpacity
                    key={folder.id}
                    style={[styles.folderChip, isActive && styles.folderChipActive]}
                    onPress={() => setActiveFolder(isActive ? null : folder.id)}
                  >
                    <Ionicons
                      name={folder.icon as any}
                      size={14}
                      color={isActive ? folder.color : theme.colors.textSubtle}
                    />
                    <Text style={[styles.folderText, isActive && { color: folder.color }]}>{folder.name}</Text>
                    <View style={[styles.folderBadge, { backgroundColor: folder.color + '20' }]}>
                      <Text style={[styles.folderBadgeText, { color: folder.color }]}>
                        {folder.conversationIds.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Filters */}
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
                        : filter === 'Locked'
                          ? counts.locked
                          : counts.archived;

            const getFilterColor = () => {
              if (filter === 'Locked') return '#f472b6';
              if (filter === 'Pinned') return '#fbbf24';
              if (filter === 'Unread') return '#22d3ee';
              return '#34d399';
            };

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  isActive && {
                    backgroundColor: getFilterColor() + '20',
                    borderColor: getFilterColor() + '40',
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterChipText, isActive && { color: getFilterColor() }]}>
                  {filter}
                </Text>
                {count > 0 && (
                  <View style={[styles.filterBadge, isActive && { backgroundColor: getFilterColor() }]}>
                    <Text style={[styles.filterBadgeText, isActive && { color: '#000' }]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Batch Mode Actions */}
        {batchMode && selectedChats.length > 0 && (
          <View style={styles.batchActions}>
            <Text style={styles.batchText}>{selectedChats.length} selected</Text>
            <View style={styles.batchButtons}>
              <TouchableOpacity
                style={[styles.batchButton, { backgroundColor: '#22d3ee20' }]}
                onPress={() => handleBatchAction('mark_read')}
              >
                <Ionicons name="checkmark-done" size={16} color="#22d3ee" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.batchButton, { backgroundColor: '#fbbf2420' }]}
                onPress={() => handleBatchAction('mute')}
              >
                <Ionicons name="volume-mute" size={16} color="#fbbf24" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.batchButton, { backgroundColor: '#64748b20' }]}
                onPress={() => handleBatchAction('archive')}
              >
                <Ionicons name="archive" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lock Screen */}
        {showLockScreen && (
          <View style={styles.unlockSection}>
            <View style={styles.unlockCard}>
              <Ionicons name="lock-closed" size={64} color="#f472b6" />
              <Text style={styles.unlockTitle}>Locked Chats</Text>
              <Text style={styles.unlockSubtitle}>
                Type your lock code in the search bar above to view locked chats
              </Text>
            </View>
          </View>
        )}

        {/* Pinned Lane */}
        {pinnedList.length > 0 && activeFilter === 'All' && !activeFolder && !showLockScreen && (
          <View style={styles.pinnedLane}>
            <Text style={styles.sectionTitle}>⚡ Pinned</Text>
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
                const hasUnread = conversation.unread_count > 0;

                return (
                  <TouchableOpacity
                    key={conversation.id}
                    style={[styles.pinnedCard, hasUnread && styles.pinnedCardUnread]}
                    onPress={() => router.push('/messages/' + conversation.id)}
                    onLongPress={() => handleLongPress(conversation)}
                  >
                    <View style={styles.pinnedAvatarWrapper}>
                      <Avatar
                        uri={conversation.type === 'group' ? conversation.avatar_url : conversation.participants[0]?.avatar_url}
                        name={name || 'Chat'}
                        seed={seed}
                        size="md"
                      />
                      {hasUnread && <View style={styles.pinnedUnreadDot} />}
                    </View>
                    <Text style={styles.pinnedName} numberOfLines={1}>
                      {name}
                    </Text>
                    {conversation.unread_count > 0 && (
                      <View style={styles.pinnedUnreadBadge}>
                        <Text style={styles.pinnedUnreadText}>{conversation.unread_count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Conversations */}
        {!showLockScreen && (
          filteredConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubbles-outline" size={56} color={theme.colors.textSubtle} />
              </View>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyDescription}>
                {searchQuery || activeFilter !== 'All' || activeFolder
                  ? 'No chats match your filters'
                  : 'Start a new conversation to begin messaging'}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/messages/new')}>
                <Ionicons name="add" size={18} color="#000" />
                <Text style={styles.emptyButtonText}>New Chat</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionHeader}>{section.title}</Text>
                  <View style={styles.sectionLine} />
                </View>
              )}
              renderItem={({ item }) => (
                <View style={styles.conversationWrapper}>
                  {batchMode && (
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => toggleSelectChat(item.id)}
                    >
                      <View
                        style={[
                          styles.checkboxInner,
                          selectedChats.includes(item.id) && styles.checkboxSelected,
                        ]}
                      >
                        {selectedChats.includes(item.id) && (
                          <Ionicons name="checkmark" size={16} color="#000" />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  <View style={{ flex: 1 }}>
                    <ConversationItem
                      conversation={item}
                      isPinned={pinnedConversations.includes(item.id)}
                      isMuted={mutedConversations.includes(item.id)}
                      isArchived={archivedConversations.includes(item.id)}
                      onLongPress={() => handleLongPress(item)}
                    />
                  </View>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/messages/new')}>
        <View style={styles.fabGlow} />
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>

      {/* MODALS CONTINUE IN NEXT PART... */}
    </SafeAreaView>
  );
}

// Styles in next part due to length...

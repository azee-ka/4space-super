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
import * as LocalAuthentication from 'expo-local-authentication';
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

const FILTERS = ['All', 'Unread', 'Pinned', 'Groups', 'Muted', 'Archived'] as const;
type FilterKey = (typeof FILTERS)[number];
type SortKey = 'Recent' | 'Unread' | 'Name' | 'Priority';

export default function InboxScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations(user?.id || '');

  const {
    pinnedConversations,
    mutedConversations,
    archivedConversations,
    togglePinnedConversation,
    toggleMutedConversation,
    toggleArchivedConversation,
  } = useMessagePreferencesStore();

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
    compactMode,
  } = useInboxPreferencesStore();

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
  const [showLockedFolder, setShowLockedFolder] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Check biometric availability
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    })();
  }, []);

  // Check for expired timers
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
    }, 60000);

    return () => clearInterval(interval);
  }, [timers, checkTimers, toggleArchivedConversation, toggleMutedConversation]);

  // Auto-lock check
  useEffect(() => {
    if (lockCode) {
      const interval = setInterval(() => {
        checkAutoLock();
        if (!useInboxPreferencesStore.getState().isUnlocked) {
          setShowLockedFolder(false);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [lockCode]);

  // Handle password reveal in search
  useEffect(() => {
    if (searchQuery && lockCode && searchQuery === lockCode) {
      if (unlockWithCode(searchQuery)) {
        setShowLockedFolder(true);
        setSearchQuery('');
        Alert.alert('🔓 Unlocked', 'Locked folder is now accessible');
      }
    }
  }, [searchQuery, lockCode, unlockWithCode]);

  const counts = useMemo(() => {
    const list = conversations || [];
    return {
      all: list.filter((c) => !archivedConversations.includes(c.id)).length,
      unread: list.filter((c) => c.unread_count > 0 && !archivedConversations.includes(c.id)).length,
      pinned: list.filter((c) => pinnedConversations.includes(c.id)).length,
      groups: list.filter((c) => c.type === 'group').length,
      muted: list.filter((c) => mutedConversations.includes(c.id)).length,
      archived: list.filter((c) => archivedConversations.includes(c.id)).length,
      locked: lockedConversations.length,
    };
  }, [conversations, pinnedConversations, mutedConversations, archivedConversations, lockedConversations]);

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

    let base = list.filter(matchesSearch);

    if (activeFolder) {
      const folder = folders.find((f) => f.id === activeFolder);
      if (folder) {
        base = base.filter((c) => folder.conversationIds.includes(c.id));
      }
    }

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
        default:
          return !isArchived(conversation);
      }
    });

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
    folders,
  ]);

  const lockedChats = useMemo(() => {
    if (!conversations) return [];
    return conversations.filter((c) => lockedConversations.includes(c.id));
  }, [conversations, lockedConversations]);

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

  const handleOpenLockedFolder = async () => {
    if (!lockCode) {
      Alert.alert('No Lock Set', 'Please set a lock code in settings first.');
      router.push('/settings/inbox-settings');
      return;
    }

    if (isUnlocked) {
      setShowLockedFolder(true);
      return;
    }

    if (biometricAvailable) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Locked Chats',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        unlockWithCode(lockCode);
        setShowLockedFolder(true);
      }
    } else {
      Alert.alert(
        'Enter Password',
        'Type your lock password in the search bar to unlock',
        [{ text: 'OK' }]
      );
    }
  };

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

  const handleBatchAction = (action: 'archive' | 'mute' | 'mark_read') => {
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

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

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
                  <Text style={styles.statText}>{counts.all} chats</Text>
                </View>
                {counts.locked > 0 && lockCode && (
                  <TouchableOpacity style={styles.statPill} onPress={handleOpenLockedFolder}>
                    <Ionicons name="lock-closed" size={10} color="#f472b6" />
                    <Text style={styles.statText}>{counts.locked} locked</Text>
                  </TouchableOpacity>
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
                lockCode && !isUnlocked
                  ? 'Type password to reveal locked folder...'
                  : 'Search messages, people, or #tags...'
              }
              placeholderTextColor={theme.colors.textSubtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              secureTextEntry={lockCode && !isUnlocked && searchQuery.length > 0}
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

            {lockCode && (
              <TouchableOpacity
                style={[styles.quickActionCard, { borderColor: '#f472b630' }]}
                onPress={handleOpenLockedFolder}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#f472b620' }]}>
                  <Ionicons name="lock-closed" size={22} color="#f472b6" />
                </View>
                <Text style={styles.quickActionText}>Locked</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor: '#34d39930' }]}
              onPress={() => router.push('/messages/saved')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#34d39920' }]}>
                <Ionicons name="bookmark" size={22} color="#34d399" />
              </View>
              <Text style={styles.quickActionText}>Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { borderColor: '#a855f730' }]}
              onPress={() => setShowQuickReplies(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#a855f720' }]}>
                <Ionicons name="flash" size={22} color="#a855f7" />
              </View>
              <Text style={styles.quickActionText}>Quick Reply</Text>
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
                        : counts.archived;

            const getFilterColor = () => {
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

        {/* Pinned Lane */}
        {pinnedList.length > 0 && activeFilter === 'All' && !activeFolder && (
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
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery || activeFilter !== 'All' || activeFolder
                ? 'No chats match your filters'
                : 'Start a new conversation'}
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
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/messages/new')}>
        <View style={styles.fabGlow} />
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>

      {/* MODALS BELOW - Continuing in next message due to length */}

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowActions(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Chat Actions</Text>
            <ScrollView style={styles.actionsScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedConversation) {
                    togglePinnedConversation(selectedConversation.id);
                  }
                  setShowActions(false);
                }}
                style={styles.actionButton}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#fbbf2420' }]}>
                  <Ionicons name="pin" size={20} color="#fbbf24" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>
                    {selectedConversation && pinnedConversations.includes(selectedConversation.id) ? 'Unpin' : 'Pin'}
                  </Text>
                  <Text style={styles.actionSubtext}>Quick access at top</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (selectedConversation) {
                    toggleLockedConversation(selectedConversation.id);
                  }
                  setShowActions(false);
                }}
                style={styles.actionButton}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#f472b620' }]}>
                  <Ionicons name="lock-closed" size={20} color="#f472b6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>
                    {selectedConversation && lockedConversations.includes(selectedConversation.id) ? 'Unlock' : 'Lock'}
                  </Text>
                  <Text style={styles.actionSubtext}>Require password to access</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowActions(false);
                  setShowTimerModal(true);
                }}
                style={styles.actionButton}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#a855f720' }]}>
                  <Ionicons name="time" size={20} color="#a855f7" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>Set Timer</Text>
                  <Text style={styles.actionSubtext}>Auto-archive after time</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowActions(false);
                  setShowFolders(true);
                }}
                style={styles.actionButton}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#3b82f620' }]}>
                  <Ionicons name="folder" size={20} color="#3b82f6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>Add to Folder</Text>
                  <Text style={styles.actionSubtext}>Organize chats</Text>
                </View>
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
                <View style={[styles.actionIcon, { backgroundColor: '#64748b20' }]}>
                  <Ionicons name="volume-mute" size={20} color="#94a3b8" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>
                    {selectedConversation && mutedConversations.includes(selectedConversation.id) ? 'Unmute' : 'Mute'}
                  </Text>
                  <Text style={styles.actionSubtext}>Silence notifications</Text>
                </View>
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
                <View style={[styles.actionIcon, { backgroundColor: '#64748b20' }]}>
                  <Ionicons name="archive-outline" size={20} color="#64748b" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>
                    {selectedConversation && archivedConversations.includes(selectedConversation.id) ? 'Unarchive' : 'Archive'}
                  </Text>
                  <Text style={styles.actionSubtext}>Hide from main list</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleMarkRead} style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: '#34d39920' }]}>
                  <Ionicons name="checkmark-done" size={20} color="#34d399" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>Mark as Read</Text>
                  <Text style={styles.actionSubtext}>Clear unread badge</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Timer Modal */}
      <Modal
        visible={showTimerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimerModal(false)}
      >
        <Pressable onPress={() => setShowTimerModal(false)} style={styles.modalOverlay}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set Auto-Archive Timer</Text>
            <View style={styles.timerOptions}>
              {[1, 3, 6, 12, 24].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={styles.timerOption}
                  onPress={() => handleSetTimer(hours)}
                >
                  <Ionicons name="time-outline" size={24} color="#a855f7" />
                  <Text style={styles.timerOptionText}>{hours}h</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Folders Modal */}
      <Modal
        visible={showFolders}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFolders(false)}
      >
        <Pressable onPress={() => setShowFolders(false)} style={styles.modalOverlay}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add to Folder</Text>
            <View style={styles.folderOptions}>
              {folders.map((folder) => {
                const isInFolder = selectedConversation && folder.conversationIds.includes(selectedConversation.id);
                return (
                  <TouchableOpacity
                    key={folder.id}
                    style={[styles.folderOption, isInFolder && { borderColor: folder.color }]}
                    onPress={() => handleAddToFolder(folder.id)}
                  >
                    <View style={[styles.folderOptionIcon, { backgroundColor: folder.color + '20' }]}>
                      <Ionicons name={folder.icon as any} size={24} color={folder.color} />
                    </View>
                    <Text style={styles.folderOptionText}>{folder.name}</Text>
                    {isInFolder && <Ionicons name="checkmark-circle" size={20} color={folder.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Quick Replies Modal */}
      <Modal
        visible={showQuickReplies}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickReplies(false)}
      >
        <Pressable onPress={() => setShowQuickReplies(false)} style={styles.modalOverlay}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Quick Replies</Text>
            <View style={styles.quickReplyOptions}>
              {quickReplies.map((reply) => (
                <TouchableOpacity
                  key={reply.id}
                  style={styles.quickReplyOption}
                  onPress={() => {
                    // In real app, copy to clipboard or insert into message
                    Alert.alert('Quick Reply', reply.content);
                    setShowQuickReplies(false);
                  }}
                >
                  {reply.emoji && <Text style={styles.quickReplyEmoji}>{reply.emoji}</Text>}
                  <View style={styles.quickReplyContent}>
                    <Text style={styles.quickReplyLabel}>{reply.label}</Text>
                    <Text style={styles.quickReplyText} numberOfLines={1}>{reply.content}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Locked Folder Modal */}
      <Modal
        visible={showLockedFolder}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLockedFolder(false)}
      >
        <SafeAreaView style={styles.lockedFolderModal} edges={['top', 'bottom']}>
          <View style={styles.lockedFolderHeader}>
            <TouchableOpacity onPress={() => setShowLockedFolder(false)}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.lockedFolderTitle}>🔒 Locked Chats</Text>
            <TouchableOpacity onPress={() => {
              lockApp();
              setShowLockedFolder(false);
            }}>
              <Ionicons name="lock-closed" size={24} color="#f472b6" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.lockedFolderContent}>
            {lockedChats.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="lock-open-outline" size={64} color={theme.colors.textSubtle} />
                <Text style={styles.emptyTitle}>No Locked Chats</Text>
                <Text style={styles.emptyDescription}>
                  Long press any chat and select Lock to add it here
                </Text>
              </View>
            ) : (
              lockedChats.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isPinned={false}
                  isMuted={mutedConversations.includes(conversation.id)}
                  isArchived={false}
                  onLongPress={() => {
                    setSelectedConversation(conversation);
                    setShowActions(true);
                  }}
                />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Styles continue below...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  content: {
    paddingBottom: 120,
  },
  heroHeader: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#22d3ee',
    opacity: 0.05,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
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
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionsScroll: {
    gap: 10,
    paddingRight: 16,
  },
  quickActionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  foldersSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  foldersScroll: {
    gap: 8,
    paddingRight: 16,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  folderChipActive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#22d3ee30',
  },
  folderText: {
    color: theme.colors.textSubtle,
    fontSize: 13,
    fontWeight: '600',
  },
  folderTextActive: {
    color: '#22d3ee',
  },
  folderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  folderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  batchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  batchText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  batchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  batchButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedLane: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  pinnedScroll: {
    gap: 12,
    paddingRight: 16,
  },
  pinnedCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pinnedCardUnread: {
    borderColor: '#22d3ee30',
  },
  pinnedAvatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  pinnedUnreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22d3ee',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  pinnedName: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  pinnedUnreadBadge: {
    backgroundColor: '#22d3ee',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pinnedUnreadText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  sectionHeader: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  listContent: {
    paddingBottom: 40,
  },
  conversationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  checkbox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#22d3ee',
    borderColor: '#22d3ee',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22d3ee',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: '#22d3ee',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.glow,
  },
  fabGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22d3ee',
    opacity: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.divider,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  actionsScroll: {
    maxHeight: 400,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtext: {
    color: theme.colors.textSubtle,
    fontSize: 12,
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 16,
  },
  timerOption: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  timerOptionText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  folderOptions: {
    gap: 12,
    paddingVertical: 16,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  folderOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderOptionText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  quickReplyOptions: {
    gap: 12,
    paddingVertical: 16,
  },
  quickReplyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  quickReplyEmoji: {
    fontSize: 32,
  },
  quickReplyContent: {
    flex: 1,
  },
  quickReplyLabel: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickReplyText: {
    color: theme.colors.textSubtle,
    fontSize: 14,
  },
  lockedFolderModal: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  lockedFolderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  lockedFolderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  lockedFolderContent: {
    flex: 1,
  },
});

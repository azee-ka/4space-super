import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Space } from '../../../src/types';
import { useSpace, useSpaceMembers, useSpaceStats } from '../../../src/hooks/useSpaces';
import { LoadingSpinner, Avatar } from '../../../src/components/ui';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

const SPACE_ICON_MAP: Record<string, string> = {
  lock: 'lock-closed-outline',
  heart: 'heart-outline',
  users: 'people-outline',
  briefcase: 'briefcase-outline',
  globe: 'globe-outline',
  rocket: 'rocket-outline',
  folder: 'folder-outline',
  star: 'star-outline',
  bulb: 'bulb-outline',
  game: 'game-controller-outline',
  personal: 'lock-closed-outline',
  couple: 'heart-outline',
  team: 'people-outline',
  portfolio: 'briefcase-outline',
  community: 'globe-outline',
  project: 'rocket-outline',
};

const resolveSpaceColor = (space: Space) => {
  if (space.color) {
    const match = space.color.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
    if (match) return match[0];
  }
  return '#22d3ee';
};

type TabType = 'overview' | 'channels' | 'activity' | 'files' | 'workspace';

// Mock data for demonstration - replace with real data
const MOCK_CHANNELS = [
  { id: '1', name: 'general', description: 'General discussions', unread: 3, icon: 'chatbubbles-outline', color: '#3b82f6' },
  { id: '2', name: 'announcements', description: 'Important updates', unread: 0, icon: 'megaphone-outline', color: '#f59e0b' },
  { id: '3', name: 'random', description: 'Off-topic fun', unread: 12, icon: 'happy-outline', color: '#ec4899' },
  { id: '4', name: 'help', description: 'Get help from team', unread: 0, icon: 'help-circle-outline', color: '#10b981' },
];

const MOCK_ACTIVITY = [
  { id: '1', type: 'message', user: 'John Doe', action: 'sent a message in #general', time: '2 min ago', icon: 'chatbubble-outline', color: '#3b82f6' },
  { id: '2', type: 'file', user: 'Jane Smith', action: 'uploaded design-mockups.fig', time: '15 min ago', icon: 'document-outline', color: '#a855f7' },
  { id: '3', type: 'member', user: 'Mike Johnson', action: 'joined the space', time: '1 hour ago', icon: 'person-add-outline', color: '#10b981' },
  { id: '4', type: 'task', user: 'Sarah Wilson', action: 'completed "Update documentation"', time: '2 hours ago', icon: 'checkmark-circle-outline', color: '#34d399' },
  { id: '5', type: 'message', user: 'Tom Brown', action: 'sent a message in #announcements', time: '3 hours ago', icon: 'megaphone-outline', color: '#f59e0b' },
];

const MOCK_FILES = [
  { id: '1', name: 'Project Brief.pdf', size: '2.4 MB', type: 'pdf', date: 'Today', icon: 'document-text-outline', color: '#ef4444' },
  { id: '2', name: 'Design Mockups.fig', size: '15.8 MB', type: 'figma', date: 'Yesterday', icon: 'color-palette-outline', color: '#a855f7' },
  { id: '3', name: 'Meeting Notes.md', size: '48 KB', type: 'markdown', date: '2 days ago', icon: 'document-outline', color: '#3b82f6' },
  { id: '4', name: 'Budget Sheet.xlsx', size: '156 KB', type: 'excel', date: '3 days ago', icon: 'grid-outline', color: '#10b981' },
];

export default function SpaceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaceId = Array.isArray(id) ? id[0] : id;
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { data: space, isLoading, refetch } = useSpace(spaceId);
  const { data: stats } = useSpaceStats(spaceId);
  const { data: members = [] } = useSpaceMembers(spaceId);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const iconName = space?.icon || space?.type || 'rocket';
  const iconColor = space ? resolveSpaceColor(space) : '#22d3ee';
  const memberPreview = useMemo(() => members.slice(0, 8), [members]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const tabs: Array<{ value: TabType; label: string; icon: string }> = [
    { value: 'overview', label: 'Overview', icon: 'home-outline' },
    { value: 'channels', label: 'Channels', icon: 'chatbubbles-outline' },
    { value: 'workspace', label: 'Workspace', icon: 'briefcase-outline' },
    { value: 'activity', label: 'Activity', icon: 'pulse-outline' },
    { value: 'files', label: 'Files', icon: 'folder-outline' },
  ];

  const handleTabChange = (tabValue: TabType) => {
    setActiveTab(tabValue);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!space) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSubtle} />
          </View>
          <Text style={styles.emptyTitle}>Space not found</Text>
          <Text style={styles.emptyDescription}>This space may have been deleted or you don't have access</Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: accentHex }]}
            onPress={() => router.back()}
          >
            <Text style={styles.emptyButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{space.name}</Text>
          <Text style={styles.headerSubtitle}>{members.length} members</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => router.push(`/spaces/${spaceId}/invite` as any)}
          >
            <Ionicons name="person-add-outline" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => router.push(`/spaces/${spaceId}/settings` as any)}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={[styles.spaceIcon, { backgroundColor: iconColor }]}>
          <Ionicons name={(SPACE_ICON_MAP[iconName] || 'rocket-outline') as any} size={24} color={theme.colors.base} />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.spaceName}>{space.name}</Text>
          <Text style={styles.spaceDescription}>{space.description || 'No description'}</Text>
          <View style={styles.heroMeta}>
            <View style={[styles.privacyBadge, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name="shield-checkmark-outline" size={12} color={iconColor} />
              <Text style={[styles.privacyText, { color: iconColor }]}>{space.privacy}</Text>
            </View>
            {space.type && (
              <View style={styles.typeBadge}>
                <Ionicons name="pricetag-outline" size={12} color={theme.colors.textSubtle} />
                <Text style={styles.typeText}>{space.type}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#3b82f6' + '15' }]}>
              <Ionicons name="people" size={16} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{stats?.members || members.length || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#10b981' + '15' }]}>
              <Ionicons name="chatbubbles" size={16} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{stats?.messages || 0}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#a855f7' + '15' }]}>
              <Ionicons name="folder" size={16} color="#a855f7" />
            </View>
            <Text style={styles.statValue}>{stats?.files || 0}</Text>
            <Text style={styles.statLabel}>Files</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#f59e0b' + '15' }]}>
              <Ionicons name="checkmark-done" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{stats?.tasks || 0}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tab, isActive && { backgroundColor: accentHex }]}
                onPress={() => handleTabChange(tab.value)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={12}
                  color={isActive ? theme.colors.base : theme.colors.textSubtle}
                />
                <Text style={[styles.tabText, isActive && { color: theme.colors.base }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentHex} />}
      >
        {activeTab === 'overview' && (
          <View style={styles.tabPane}>
            {/* Members Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Members ({members.length})</Text>
              <TouchableOpacity onPress={() => router.push(`/spaces/${spaceId}/members` as any)}>
                <Text style={[styles.sectionAction, { color: accentHex }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <View style={styles.memberRow}>
                {memberPreview.map((member) => (
                  <Avatar
                    key={member.id}
                    uri={member.user?.avatar_url}
                    name={member.user?.display_name || member.user?.email || 'User'}
                    seed={member.user?.id || member.id}
                    size="md"
                  />
                ))}
                {members.length > memberPreview.length && (
                  <View style={styles.memberOverflow}>
                    <Text style={styles.memberOverflowText}>+{members.length - memberPreview.length}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Workspace Apps Summary */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workspace Apps</Text>
              <TouchableOpacity onPress={() => handleTabChange('workspace')}>
                <Text style={[styles.sectionAction, { color: accentHex }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              {/* Board Summary */}
              <TouchableOpacity style={styles.workspaceAppItem} onPress={() => handleTabChange('workspace')}>
                <View style={[styles.workspaceAppIcon, { backgroundColor: '#f472b6' + '20' }]}>
                  <Ionicons name="grid-outline" size={18} color="#f472b6" />
                </View>
                <View style={styles.workspaceAppContent}>
                  <Text style={styles.workspaceAppName}>Board</Text>
                  <Text style={styles.workspaceAppSummary}>12 tasks across 4 columns</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />

              {/* Calendar Summary */}
              <TouchableOpacity style={styles.workspaceAppItem} onPress={() => handleTabChange('workspace')}>
                <View style={[styles.workspaceAppIcon, { backgroundColor: '#fbbf24' + '20' }]}>
                  <Ionicons name="calendar-outline" size={18} color="#fbbf24" />
                </View>
                <View style={styles.workspaceAppContent}>
                  <Text style={styles.workspaceAppName}>Calendar</Text>
                  <Text style={styles.workspaceAppSummary}>3 upcoming events this week</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />

              {/* Polls Summary */}
              <TouchableOpacity style={styles.workspaceAppItem} onPress={() => handleTabChange('workspace')}>
                <View style={[styles.workspaceAppIcon, { backgroundColor: '#f97316' + '20' }]}>
                  <Ionicons name="bar-chart-outline" size={18} color="#f97316" />
                </View>
                <View style={styles.workspaceAppContent}>
                  <Text style={styles.workspaceAppName}>Polls</Text>
                  <Text style={styles.workspaceAppSummary}>1 active poll • 23 votes</Text>
                </View>
                <View style={[styles.workspaceAppBadge, { backgroundColor: accentHex }]}>
                  <Text style={styles.workspaceAppBadgeText}>1</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />

              {/* Docs Summary */}
              <TouchableOpacity style={styles.workspaceAppItem} onPress={() => handleTabChange('workspace')}>
                <View style={[styles.workspaceAppIcon, { backgroundColor: '#22d3ee' + '20' }]}>
                  <Ionicons name="document-text-outline" size={18} color="#22d3ee" />
                </View>
                <View style={styles.workspaceAppContent}>
                  <Text style={styles.workspaceAppName}>Documents</Text>
                  <Text style={styles.workspaceAppSummary}>4 documents • Last updated 2d ago</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />

              {/* Links Summary */}
              <TouchableOpacity style={styles.workspaceAppItem} onPress={() => handleTabChange('workspace')}>
                <View style={[styles.workspaceAppIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                  <Ionicons name="link-outline" size={18} color="#8b5cf6" />
                </View>
                <View style={styles.workspaceAppContent}>
                  <Text style={styles.workspaceAppName}>Links</Text>
                  <Text style={styles.workspaceAppSummary}>3 saved links</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>

            {/* Pinned Channels */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pinned Channels</Text>
              <TouchableOpacity onPress={() => handleTabChange('channels')}>
                <Text style={[styles.sectionAction, { color: accentHex }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              {MOCK_CHANNELS.slice(0, 3).map((channel, index) => (
                <View key={channel.id}>
                  <TouchableOpacity
                    style={styles.sectionRow}
                    onPress={() => router.push(`/spaces/${spaceId}/channels/${channel.id}` as any)}
                  >
                    <View style={styles.sectionRowLeft}>
                      <View style={[styles.sectionIcon, { backgroundColor: channel.color + '20' }]}>
                        <Ionicons name={channel.icon as any} size={16} color={channel.color} />
                      </View>
                      <View>
                        <Text style={styles.sectionRowText}>#{channel.name}</Text>
                        <Text style={styles.sectionRowSubtext}>{channel.description}</Text>
                      </View>
                    </View>
                    {channel.unread > 0 && (
                      <View style={[styles.miniUnreadBadge, { backgroundColor: accentHex }]}>
                        <Text style={styles.miniUnreadText}>{channel.unread}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {index < 2 && <View style={styles.sectionDivider} />}
                </View>
              ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => handleTabChange('activity')}>
                <Text style={[styles.sectionAction, { color: accentHex }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              {MOCK_ACTIVITY.slice(0, 4).map((activity, index) => (
                <View key={activity.id}>
                  <View style={styles.activityRow}>
                    <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
                      <Ionicons name={activity.icon as any} size={14} color={activity.color} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityUser}>{activity.user}</Text>
                        <Text style={styles.activityAction}> {activity.action}</Text>
                      </Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                  {index < 3 && <View style={styles.sectionDivider} />}
                </View>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionRow}
                onPress={() => router.push(`/spaces/${spaceId}/analytics` as any)}
              >
                <View style={styles.sectionRowLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                    <Ionicons name="stats-chart" size={16} color="#3b82f6" />
                  </View>
                  <Text style={styles.sectionRowText}>View Analytics</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />
              <TouchableOpacity
                style={styles.sectionRow}
                onPress={() => router.push(`/spaces/${spaceId}/invite` as any)}
              >
                <View style={styles.sectionRowLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#10b981' + '20' }]}>
                    <Ionicons name="person-add" size={16} color="#10b981" />
                  </View>
                  <Text style={styles.sectionRowText}>Invite Members</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />
              <TouchableOpacity
                style={styles.sectionRow}
                onPress={() => router.push(`/spaces/${spaceId}/settings` as any)}
              >
                <View style={styles.sectionRowLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#a855f7' + '20' }]}>
                    <Ionicons name="settings" size={16} color="#a855f7" />
                  </View>
                  <Text style={styles.sectionRowText}>Space Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'channels' && (
          <View style={styles.tabPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Channels ({MOCK_CHANNELS.length})</Text>
              <TouchableOpacity>
                <Ionicons name="add-circle-outline" size={20} color={accentHex} />
              </TouchableOpacity>
            </View>
            <View style={styles.channelsContainer}>
              {MOCK_CHANNELS.map((channel, index) => (
                <TouchableOpacity
                  key={channel.id}
                  style={[styles.channelCard, index < MOCK_CHANNELS.length - 1 && styles.channelCardBorder]}
                  onPress={() => router.push(`/spaces/${spaceId}/channels/${channel.id}` as any)}
                >
                  <View style={[styles.channelIcon, { backgroundColor: channel.color + '20' }]}>
                    <Ionicons name={channel.icon as any} size={16} color={channel.color} />
                  </View>
                  <View style={styles.channelContent}>
                    <Text style={styles.channelName}>#{channel.name}</Text>
                    <Text style={styles.channelDescription}>{channel.description}</Text>
                  </View>
                  <View style={styles.channelRight}>
                    {channel.unread > 0 && (
                      <View style={[styles.unreadBadge, { backgroundColor: accentHex }]}>
                        <Text style={styles.unreadText}>{channel.unread}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={14} color={theme.colors.textSubtle} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.tabPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <View style={styles.activityContainer}>
              {MOCK_ACTIVITY.map((activity, index) => (
                <View
                  key={activity.id}
                  style={[styles.activityCard, index < MOCK_ACTIVITY.length - 1 && styles.activityCardBorder]}
                >
                  <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                    <Ionicons name={activity.icon as any} size={14} color={activity.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityUser}>{activity.user}</Text> {activity.action}
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'files' && (
          <View style={styles.tabPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Files</Text>
              <TouchableOpacity onPress={() => router.push(`/spaces/${spaceId}/files` as any)}>
                <Text style={[styles.sectionAction, { color: accentHex }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filesContainer}>
              {MOCK_FILES.map((file, index) => (
                <TouchableOpacity
                  key={file.id}
                  style={[styles.fileCard, index < MOCK_FILES.length - 1 && styles.fileCardBorder]}
                >
                  <View style={[styles.fileIcon, { backgroundColor: file.color + '20' }]}>
                    <Ionicons name={file.icon as any} size={16} color={file.color} />
                  </View>
                  <View style={styles.fileContent}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <View style={styles.fileMeta}>
                      <Text style={styles.fileMetaText}>{file.size}</Text>
                      <Text style={styles.fileMetaDot}>•</Text>
                      <Text style={styles.fileMetaText}>{file.date}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.fileAction}>
                    <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.textSubtle} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'workspace' && (
          <View style={styles.tabPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workspace Apps</Text>
            </View>
            <View style={styles.workspaceAppsGrid}>
              {[
                { id: 'board', name: 'Board', icon: 'grid-outline', color: '#f472b6', description: '12 tasks', badge: 3, route: `/spaces/${spaceId}/workspace/board` },
                { id: 'calendar', name: 'Calendar', icon: 'calendar-outline', color: '#fbbf24', description: '3 events', badge: 0, route: `/spaces/${spaceId}/workspace/calendar` },
                { id: 'polls', name: 'Polls', icon: 'bar-chart-outline', color: '#f97316', description: '1 active', badge: 1, route: `/spaces/${spaceId}/workspace/polls` },
                { id: 'docs', name: 'Docs', icon: 'document-text-outline', color: '#22d3ee', description: '4 documents', badge: 0, route: `/spaces/${spaceId}/workspace/docs` },
                { id: 'links', name: 'Links', icon: 'link-outline', color: '#8b5cf6', description: '3 saved', badge: 0, route: `/spaces/${spaceId}/workspace/links` },
                { id: 'notes', name: 'Notes', icon: 'newspaper-outline', color: '#10b981', description: 'Quick notes', badge: 0, route: `/spaces/${spaceId}/workspace/notes` },
                { id: 'whiteboard', name: 'Whiteboard', icon: 'brush-outline', color: '#ec4899', description: 'Brainstorm', badge: 0, route: `/spaces/${spaceId}/workspace/whiteboard` },
                { id: 'forms', name: 'Forms', icon: 'list-outline', color: '#14b8a6', description: 'Surveys', badge: 0, route: `/spaces/${spaceId}/workspace/forms` },
                { id: 'wiki', name: 'Wiki', icon: 'book-outline', color: '#f97316', description: 'Knowledge', badge: 0, route: `/spaces/${spaceId}/workspace/wiki` },
              ].map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.workspaceAppCard}
                  onPress={() => router.push(app.route as any)}
                >
                  <View style={[styles.workspaceAppCardIcon, { backgroundColor: app.color + '20' }]}>
                    <Ionicons name={app.icon as any} size={32} color={app.color} />
                    {app.badge > 0 && (
                      <View style={[styles.workspaceAppCardBadge, { backgroundColor: accentHex }]}>
                        <Text style={styles.workspaceAppCardBadgeText}>{app.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.workspaceAppCardName}>{app.name}</Text>
                  <Text style={styles.workspaceAppCardDescription}>{app.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.section}>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                  <Ionicons name="add-circle" size={20} color="#3b82f6" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>Create New Task</Text>
                  <Text style={styles.quickActionSubtitle}>Add a task to your board</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#10b981' + '20' }]}>
                  <Ionicons name="calendar" size={20} color="#10b981" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>Schedule Event</Text>
                  <Text style={styles.quickActionSubtitle}>Add to workspace calendar</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.sectionDivider} />
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#a855f7' + '20' }]}>
                  <Ionicons name="stats-chart" size={20} color="#a855f7" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>Create Poll</Text>
                  <Text style={styles.quickActionSubtitle}>Get team feedback</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  headerRow: {
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
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  spaceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heroContent: {
    flex: 1,
  },
  spaceName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  spaceDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 16,
    marginBottom: 6,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    textTransform: 'capitalize',
  },
  statsScroll: {
    marginBottom: 8,
    paddingHorizontal: 16,
    flexGrow: 0,
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: theme.colors.textSubtle,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  primaryAction: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  primaryActionText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryAction: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secondaryActionText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsScroll: {
    marginBottom: 10,
    paddingHorizontal: 16,
    maxHeight: 28,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 28,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  tabContent: {
    flex: 1,
  },
  tabPane: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberOverflow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberOverflowText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureCard: {
    width: '23%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  featureBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  featureBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.base,
  },
  featureName: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sectionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRowText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionRowSubtext: {
    color: theme.colors.textSubtle,
    fontSize: 11,
    marginTop: 2,
  },
  miniUnreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  miniUnreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.base,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
  },
  activityAction: {
    fontWeight: '400',
    color: theme.colors.textSubtle,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 6,
  },
  channelsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  channelCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  channelIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  channelContent: {
    flex: 1,
  },
  channelName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 1,
  },
  channelDescription: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    lineHeight: 14,
  },
  channelRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.base,
  },
  activityContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
  },
  activityCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 16,
  },
  activityUser: {
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  filesContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  fileCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileContent: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fileMetaText: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  fileMetaDot: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  fileAction: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 14,
  },
  // Board styles
  boardScroll: {
    marginBottom: 16,
  },
  boardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  boardColumn: {
    width: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  boardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  boardCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  boardCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  boardCard: {
    backgroundColor: theme.colors.base,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  boardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  boardCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  boardCardDesc: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginBottom: 10,
    lineHeight: 15,
  },
  boardCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boardCardPriority: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  boardCardPriorityText: {
    fontSize: 9,
    fontWeight: '600',
  },
  boardCardAssignee: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardCardAssigneeText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  boardCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boardCardActionText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  boardAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  boardAddCardText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '500',
  },
  // Calendar styles
  calendarCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  calendarDayLabel: {
    width: '13.5%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 8,
  },
  calendarDay: {
    width: '13.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  // Poll styles
  pollHeader: {
    marginBottom: 16,
  },
  pollQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  pollMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pollMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pollMetaText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  pollOption: {
    marginBottom: 12,
  },
  pollOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pollOptionBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  pollOptionFill: {
    height: '100%',
    borderRadius: 3,
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollOptionText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  pollOptionPercent: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  pollOptionVotes: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  pollFooter: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  pollActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  pollActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.base,
  },
  pollActionButtonSecondary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    gap: 6,
  },
  pollActionButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  pollClosedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pollClosedText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '500',
  },
  pollResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  pollResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollWinnerBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollResultText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  pollResultPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  // Doc styles
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docContent: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  docMeta: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  docMetaDot: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  docUpdated: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  docActions: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Link styles
  linkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  linkUrl: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
    marginBottom: 6,
  },
  linkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkSaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkSavesText: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  linkAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 4,
  },
  linkActionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Workspace App Summary styles (for Overview tab)
  workspaceAppItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  workspaceAppIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workspaceAppContent: {
    flex: 1,
  },
  workspaceAppName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  workspaceAppSummary: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  workspaceAppBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  workspaceAppBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.base,
  },
  // Workspace Apps Grid (for Workspace tab)
  workspaceAppsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  workspaceAppCard: {
    width: '31%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  workspaceAppCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  workspaceAppCardBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  workspaceAppCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.base,
  },
  workspaceAppCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  workspaceAppCardDescription: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    textAlign: 'center',
  },
  // Quick Actions
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
});

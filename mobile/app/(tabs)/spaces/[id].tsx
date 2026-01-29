import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Space } from '../../../src/types';
import { useSpace, useSpaceMembers, useSpaceStats } from '../../../src/hooks/useSpaces';
import { LoadingSpinner, Avatar } from '../../../src/components/ui';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

type TabType = 'overview' | 'channels' | 'workspace' | 'analytics' | 'activity' | 'members' | 'settings';
type TimeRange = '7d' | '30d' | '90d' | 'all';

// Mock channels data
const MOCK_CHANNELS = [
  { id: '1', name: 'general', description: 'General discussions', unread: 3, icon: 'chatbubbles-outline', color: '#3b82f6' },
  { id: '2', name: 'announcements', description: 'Important updates', unread: 0, icon: 'megaphone-outline', color: '#f59e0b' },
  { id: '3', name: 'random', description: 'Off-topic fun', unread: 12, icon: 'happy-outline', color: '#ec4899' },
  { id: '4', name: 'help', description: 'Get help from team', unread: 0, icon: 'help-circle-outline', color: '#10b981' },
  { id: '5', name: 'design', description: 'Design discussions', unread: 5, icon: 'color-palette-outline', color: '#a855f7' },
  { id: '6', name: 'development', description: 'Dev team channel', unread: 0, icon: 'code-slash-outline', color: '#3b82f6' },
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
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const iconName = space?.icon || space?.type || 'rocket';
  const iconColor = space ? resolveSpaceColor(space) : '#22d3ee';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Calculate advanced metrics
  const metrics = useMemo(() => {
    const totalMembers = members.length || stats?.members || 0;
    const totalMessages = stats?.messages || 0;
    const totalFiles = stats?.files || 0;
    const totalTasks = stats?.tasks || 0;

    // Calculate engagement rate (messages per member per day)
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, 'all': 365 };
    const days = daysMap[timeRange];
    const engagementRate = totalMembers > 0 ? Math.round((totalMessages / totalMembers / days) * 10) / 10 : 0;

    // Calculate activity score (0-100)
    const activityScore = Math.min(100, Math.round((totalMessages * 0.5 + totalFiles * 2 + totalTasks * 1.5) / 10));

    // Calculate growth (mock data - in real app, compare with previous period)
    const messageGrowth = Math.floor(Math.random() * 30) - 5;
    const memberGrowth = Math.floor(Math.random() * 20);
    const fileGrowth = Math.floor(Math.random() * 25) - 5;

    // Peak activity hours
    const peakHour = Math.floor(Math.random() * 12) + 9; // 9 AM to 9 PM
    const peakActivity = `${peakHour > 12 ? peakHour - 12 : peakHour}${peakHour >= 12 ? 'PM' : 'AM'} - ${peakHour + 1 > 12 ? peakHour + 1 - 12 : peakHour + 1}${peakHour + 1 >= 12 ? 'PM' : 'AM'}`;

    // Response time (mock)
    const avgResponseMinutes = Math.floor(Math.random() * 45) + 5;
    const responseTime = avgResponseMinutes < 60 ? `${avgResponseMinutes}m` : `${Math.floor(avgResponseMinutes / 60)}h ${avgResponseMinutes % 60}m`;

    return {
      totalMembers,
      totalMessages,
      totalFiles,
      totalTasks,
      engagementRate,
      activityScore,
      messageGrowth,
      memberGrowth,
      fileGrowth,
      peakActivity,
      responseTime,
    };
  }, [members, stats, timeRange]);

  // Generate activity timeline (last 7 days)
  const activityTimeline = useMemo(() => {
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      timeline.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        messages: Math.floor(Math.random() * 50) + 10,
        files: Math.floor(Math.random() * 10),
        tasks: Math.floor(Math.random() * 8),
      });
    }
    return timeline;
  }, []);

  // Most active members
  const activeMembersData = useMemo(() => {
    return members.slice(0, 5).map((member, index) => ({
      ...member,
      messageCount: Math.floor(Math.random() * 200) + 50,
      activityLevel: Math.floor(Math.random() * 100) + 1,
      rank: index + 1,
    }));
  }, [members]);

  const tabs: Array<{ value: TabType; label: string; icon: string }> = [
    { value: 'overview', label: 'Overview', icon: 'grid-outline' },
    { value: 'channels', label: 'Channels', icon: 'chatbubbles-outline' },
    { value: 'workspace', label: 'Workspace', icon: 'briefcase-outline' },
    { value: 'analytics', label: 'Analytics', icon: 'stats-chart-outline' },
    { value: 'activity', label: 'Activity', icon: 'pulse-outline' },
    { value: 'members', label: 'Members', icon: 'people-outline' },
    { value: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  const timeRanges: Array<{ value: TimeRange; label: string }> = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'all', label: 'ALL' },
  ];

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
          <Text style={styles.headerSubtitle}>{metrics.totalMembers} members</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="search-outline" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tab, isActive && { backgroundColor: accentHex }]}
                onPress={() => setActiveTab(tab.value)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
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

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentHex} />}
      >
        {activeTab === 'overview' && (
          <View style={styles.tabPane}>
            {/* Space Hero */}
            <View style={styles.hero}>
              <View style={[styles.spaceIcon, { backgroundColor: iconColor }]}>
                <Ionicons name={(SPACE_ICON_MAP[iconName] || 'rocket-outline') as any} size={32} color={theme.colors.base} />
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

            {/* Key Metrics Grid */}
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { borderLeftColor: '#3b82f6' }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                    <Ionicons name="chatbubbles" size={16} color="#3b82f6" />
                  </View>
                  <View style={[styles.growthBadge, metrics.messageGrowth >= 0 ? { backgroundColor: '#10b981' + '15' } : { backgroundColor: '#ef4444' + '15' }]}>
                    <Ionicons
                      name={metrics.messageGrowth >= 0 ? 'trending-up' : 'trending-down'}
                      size={10}
                      color={metrics.messageGrowth >= 0 ? '#10b981' : '#ef4444'}
                    />
                    <Text style={[styles.growthText, { color: metrics.messageGrowth >= 0 ? '#10b981' : '#ef4444' }]}>
                      {metrics.messageGrowth >= 0 ? '+' : ''}{metrics.messageGrowth}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{metrics.totalMessages.toLocaleString()}</Text>
                <Text style={styles.metricLabel}>Messages</Text>
                <Text style={styles.metricSubtext}>{metrics.engagementRate} per member/day</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#10b981' }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: '#10b981' + '15' }]}>
                    <Ionicons name="people" size={16} color="#10b981" />
                  </View>
                  <View style={[styles.growthBadge, { backgroundColor: '#10b981' + '15' }]}>
                    <Ionicons name="trending-up" size={10} color="#10b981" />
                    <Text style={[styles.growthText, { color: '#10b981' }]}>
                      +{metrics.memberGrowth}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{metrics.totalMembers}</Text>
                <Text style={styles.metricLabel}>Members</Text>
                <Text style={styles.metricSubtext}>Active community</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#a855f7' }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: '#a855f7' + '15' }]}>
                    <Ionicons name="folder" size={16} color="#a855f7" />
                  </View>
                  <View style={[styles.growthBadge, metrics.fileGrowth >= 0 ? { backgroundColor: '#10b981' + '15' } : { backgroundColor: '#ef4444' + '15' }]}>
                    <Ionicons
                      name={metrics.fileGrowth >= 0 ? 'trending-up' : 'trending-down'}
                      size={10}
                      color={metrics.fileGrowth >= 0 ? '#10b981' : '#ef4444'}
                    />
                    <Text style={[styles.growthText, { color: metrics.fileGrowth >= 0 ? '#10b981' : '#ef4444' }]}>
                      {metrics.fileGrowth >= 0 ? '+' : ''}{metrics.fileGrowth}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{metrics.totalFiles}</Text>
                <Text style={styles.metricLabel}>Files Shared</Text>
                <Text style={styles.metricSubtext}>Documents & media</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#f59e0b' }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                    <Ionicons name="checkmark-done" size={16} color="#f59e0b" />
                  </View>
                  <View style={[styles.growthBadge, { backgroundColor: '#3b82f6' + '15' }]}>
                    <Text style={[styles.growthText, { color: '#3b82f6' }]}>
                      {metrics.activityScore}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{metrics.totalTasks}</Text>
                <Text style={styles.metricLabel}>Tasks</Text>
                <Text style={styles.metricSubtext}>Activity score</Text>
              </View>
            </View>

            {/* Activity Score */}
            <Text style={styles.sectionTitle}>Activity Health</Text>
            <View style={styles.activityHealthCard}>
              <View style={styles.activityHealthHeader}>
                <View>
                  <Text style={styles.activityScoreValue}>{metrics.activityScore}</Text>
                  <Text style={styles.activityScoreLabel}>Activity Score</Text>
                </View>
                <View style={[styles.scoreRing, { borderColor: accentHex }]}>
                  <Text style={styles.scoreRingText}>{metrics.activityScore}%</Text>
                </View>
              </View>
              <View style={styles.activityHealthBar}>
                <View style={[styles.activityHealthFill, { width: `${metrics.activityScore}%`, backgroundColor: accentHex }]} />
              </View>
              <View style={styles.activityHealthMeta}>
                <View style={styles.activityHealthItem}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.textSubtle} />
                  <Text style={styles.activityHealthText}>Peak: {metrics.peakActivity}</Text>
                </View>
                <View style={styles.activityHealthItem}>
                  <Ionicons name="flash-outline" size={14} color={theme.colors.textSubtle} />
                  <Text style={styles.activityHealthText}>Avg response: {metrics.responseTime}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('channels')}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                  <Ionicons name="chatbubbles" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.quickActionLabel}>Channels</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('workspace')}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#10b981' + '15' }]}>
                  <Ionicons name="briefcase" size={20} color="#10b981" />
                </View>
                <Text style={styles.quickActionLabel}>Apps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('analytics')}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#a855f7' + '15' }]}>
                  <Ionicons name="stats-chart" size={20} color="#a855f7" />
                </View>
                <Text style={styles.quickActionLabel}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('members')}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                  <Ionicons name="people" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.quickActionLabel}>Members</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'channels' && (
          <View style={styles.tabPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Channels ({MOCK_CHANNELS.length})</Text>
              <TouchableOpacity>
                <Ionicons name="add-circle-outline" size={22} color={accentHex} />
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
                    <Ionicons name={channel.icon as any} size={18} color={channel.color} />
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
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Channel Stats */}
            <Text style={styles.sectionTitle}>Channel Activity</Text>
            <View style={styles.channelStatsCard}>
              <View style={styles.channelStatRow}>
                <View style={styles.channelStat}>
                  <Text style={styles.channelStatValue}>{MOCK_CHANNELS.length}</Text>
                  <Text style={styles.channelStatLabel}>Total Channels</Text>
                </View>
                <View style={styles.channelStat}>
                  <Text style={styles.channelStatValue}>{MOCK_CHANNELS.reduce((sum, c) => sum + c.unread, 0)}</Text>
                  <Text style={styles.channelStatLabel}>Unread Messages</Text>
                </View>
                <View style={styles.channelStat}>
                  <Text style={styles.channelStatValue}>{MOCK_CHANNELS.filter((c) => c.unread > 0).length}</Text>
                  <Text style={styles.channelStatLabel}>Active Channels</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'workspace' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Workspace Apps</Text>
            <View style={styles.workspaceAppsGrid}>
              {[
                { id: 'board', name: 'Board', icon: 'grid-outline', color: '#f472b6', description: '12 tasks', badge: 3 },
                { id: 'calendar', name: 'Calendar', icon: 'calendar-outline', color: '#fbbf24', description: '3 events', badge: 0 },
                { id: 'polls', name: 'Polls', icon: 'bar-chart-outline', color: '#f97316', description: '1 active', badge: 1 },
                { id: 'docs', name: 'Docs', icon: 'document-text-outline', color: '#22d3ee', description: '4 documents', badge: 0 },
                { id: 'links', name: 'Links', icon: 'link-outline', color: '#8b5cf6', description: '3 saved', badge: 0 },
                { id: 'notes', name: 'Notes', icon: 'newspaper-outline', color: '#10b981', description: 'Quick notes', badge: 0 },
                { id: 'whiteboard', name: 'Whiteboard', icon: 'brush-outline', color: '#ec4899', description: 'Brainstorm', badge: 0 },
                { id: 'forms', name: 'Forms', icon: 'list-outline', color: '#14b8a6', description: 'Surveys', badge: 0 },
                { id: 'wiki', name: 'Wiki', icon: 'book-outline', color: '#f97316', description: 'Knowledge', badge: 0 },
              ].map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.workspaceAppCard}
                  onPress={() => router.push(`/spaces/${spaceId}/workspace/${app.id}` as any)}
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

            {/* App Usage Stats */}
            <Text style={styles.sectionTitle}>Most Used Apps</Text>
            <View style={styles.appUsageCard}>
              {[
                { name: 'Board', usage: 85, color: '#f472b6' },
                { name: 'Calendar', usage: 72, color: '#fbbf24' },
                { name: 'Docs', usage: 68, color: '#22d3ee' },
                { name: 'Polls', usage: 54, color: '#f97316' },
              ].map((app, index) => (
                <View key={index} style={styles.appUsageRow}>
                  <Text style={styles.appUsageName}>{app.name}</Text>
                  <View style={styles.appUsageBarContainer}>
                    <View style={[styles.appUsageBar, { width: `${app.usage}%`, backgroundColor: app.color }]} />
                  </View>
                  <Text style={styles.appUsagePercent}>{app.usage}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'analytics' && (
          <View style={styles.tabPane}>
            {/* Time Range Selector */}
            <View style={styles.timeRangeRow}>
              {timeRanges.map((range) => {
                const isActive = timeRange === range.value;
                return (
                  <TouchableOpacity
                    key={range.value}
                    style={[styles.timeRangeChip, isActive && { backgroundColor: accentHex }]}
                    onPress={() => setTimeRange(range.value)}
                  >
                    <Text style={[styles.timeRangeText, isActive && { color: theme.colors.base }]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Activity Chart */}
            <Text style={styles.sectionTitle}>Activity Trends</Text>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Message Activity (Last 7 Days)</Text>
              <View style={styles.chartContainer}>
                {activityTimeline.map((day, index) => {
                  const maxMessages = Math.max(...activityTimeline.map((d) => d.messages));
                  const height = (day.messages / maxMessages) * 120;
                  return (
                    <View key={index} style={styles.chartBarContainer}>
                      <View style={styles.chartBarWrapper}>
                        <View style={[styles.chartBar, { height, backgroundColor: accentHex }]} />
                      </View>
                      <Text style={styles.chartLabel}>{day.date}</Text>
                      <Text style={styles.chartValue}>{day.messages}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Engagement Metrics */}
            <Text style={styles.sectionTitle}>Engagement Breakdown</Text>
            <View style={styles.engagementCard}>
              <View style={styles.engagementRow}>
                <View style={styles.engagementItem}>
                  <View style={[styles.engagementBar, { backgroundColor: '#3b82f6' }]}>
                    <View style={[styles.engagementFill, { width: '85%', backgroundColor: '#3b82f6' + '40' }]} />
                  </View>
                  <Text style={styles.engagementLabel}>Messages</Text>
                  <Text style={styles.engagementValue}>85%</Text>
                </View>
                <View style={styles.engagementItem}>
                  <View style={[styles.engagementBar, { backgroundColor: '#10b981' }]}>
                    <View style={[styles.engagementFill, { width: '62%', backgroundColor: '#10b981' + '40' }]} />
                  </View>
                  <Text style={styles.engagementLabel}>Files</Text>
                  <Text style={styles.engagementValue}>62%</Text>
                </View>
                <View style={styles.engagementItem}>
                  <View style={[styles.engagementBar, { backgroundColor: '#a855f7' }]}>
                    <View style={[styles.engagementFill, { width: '48%', backgroundColor: '#a855f7' + '40' }]} />
                  </View>
                  <Text style={styles.engagementLabel}>Tasks</Text>
                  <Text style={styles.engagementValue}>48%</Text>
                </View>
                <View style={styles.engagementItem}>
                  <View style={[styles.engagementBar, { backgroundColor: '#f59e0b' }]}>
                    <View style={[styles.engagementFill, { width: '73%', backgroundColor: '#f59e0b' + '40' }]} />
                  </View>
                  <Text style={styles.engagementLabel}>Events</Text>
                  <Text style={styles.engagementValue}>73%</Text>
                </View>
              </View>
            </View>

            {/* Top Contributors */}
            <Text style={styles.sectionTitle}>Top Contributors</Text>
            <View style={styles.contributorsCard}>
              {activeMembersData.map((member, index) => (
                <View key={member.id} style={styles.contributorRow}>
                  <View style={styles.contributorRank}>
                    <Text style={styles.contributorRankText}>#{member.rank}</Text>
                  </View>
                  <Avatar
                    uri={member.user?.avatar_url}
                    name={member.user?.display_name || member.user?.email || 'User'}
                    seed={member.user?.id || member.id}
                    size="sm"
                  />
                  <View style={styles.contributorInfo}>
                    <Text style={styles.contributorName}>{member.user?.display_name || 'User'}</Text>
                    <Text style={styles.contributorMeta}>{member.messageCount} messages</Text>
                  </View>
                  <View style={styles.contributorActivity}>
                    <View style={styles.activityBar}>
                      <View style={[styles.activityBarFill, { width: `${member.activityLevel}%`, backgroundColor: accentHex }]} />
                    </View>
                    <Text style={styles.contributorActivityText}>{member.activityLevel}%</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Performance Insights */}
            <Text style={styles.sectionTitle}>Performance Insights</Text>
            <View style={styles.insightsCard}>
              <View style={styles.insightRow}>
                <View style={[styles.insightIcon, { backgroundColor: '#10b981' + '15' }]}>
                  <Ionicons name="trending-up" size={18} color="#10b981" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Strong Growth</Text>
                  <Text style={styles.insightDescription}>Member activity increased 24% this month</Text>
                </View>
              </View>
              <View style={styles.insightRow}>
                <View style={[styles.insightIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                  <Ionicons name="time-outline" size={18} color="#3b82f6" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Peak Hours</Text>
                  <Text style={styles.insightDescription}>Most active between {metrics.peakActivity}</Text>
                </View>
              </View>
              <View style={styles.insightRow}>
                <View style={[styles.insightIcon, { backgroundColor: '#a855f7' + '15' }]}>
                  <Ionicons name="people-outline" size={18} color="#a855f7" />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>High Engagement</Text>
                  <Text style={styles.insightDescription}>{Math.round(metrics.engagementRate * 10)}% of members active daily</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Recent Activity Feed</Text>
            <View style={styles.activityFeed}>
              {[
                { icon: 'chatbubble', color: '#3b82f6', user: 'John Doe', action: 'sent a message in #general', time: '2m ago' },
                { icon: 'document', color: '#a855f7', user: 'Jane Smith', action: 'uploaded design-specs.pdf', time: '15m ago' },
                { icon: 'person-add', color: '#10b981', user: 'Mike Wilson', action: 'joined the space', time: '1h ago' },
                { icon: 'checkmark-circle', color: '#f59e0b', user: 'Sarah Brown', action: 'completed "Update homepage"', time: '2h ago' },
                { icon: 'calendar', color: '#ec4899', user: 'Tom Davis', action: 'scheduled team meeting', time: '3h ago' },
                { icon: 'chatbubble', color: '#3b82f6', user: 'Emily Clark', action: 'sent a message in #design', time: '4h ago' },
                { icon: 'folder', color: '#a855f7', user: 'David Lee', action: 'created new folder "Assets"', time: '5h ago' },
                { icon: 'star', color: '#fbbf24', user: 'Lisa Taylor', action: 'starred "Q4 Planning Doc"', time: '6h ago' },
              ].map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[styles.activityItemIcon, { backgroundColor: activity.color + '15' }]}>
                    <Ionicons name={activity.icon as any} size={16} color={activity.color} />
                  </View>
                  <View style={styles.activityItemContent}>
                    <Text style={styles.activityItemText}>
                      <Text style={styles.activityItemUser}>{activity.user}</Text>
                      {' '}{activity.action}
                    </Text>
                    <Text style={styles.activityItemTime}>{activity.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Space Members ({members.length})</Text>
            <View style={styles.membersGrid}>
              {members.map((member) => (
                <TouchableOpacity key={member.id} style={styles.memberCard}>
                  <Avatar
                    uri={member.user?.avatar_url}
                    name={member.user?.display_name || member.user?.email || 'User'}
                    seed={member.user?.id || member.id}
                    size="lg"
                  />
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.user?.display_name || 'User'}
                  </Text>
                  <Text style={styles.memberRole}>{member.role || 'Member'}</Text>
                  <View style={styles.memberStats}>
                    <View style={styles.memberStat}>
                      <Text style={styles.memberStatValue}>{Math.floor(Math.random() * 500)}</Text>
                      <Text style={styles.memberStatLabel}>Messages</Text>
                    </View>
                    <View style={styles.memberStat}>
                      <Text style={styles.memberStatValue}>{Math.floor(Math.random() * 50)}</Text>
                      <Text style={styles.memberStatLabel}>Files</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Space Information</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Name</Text>
                <Text style={styles.settingValue}>{space.name}</Text>
              </View>
              <View style={styles.settingDivider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Description</Text>
                <Text style={styles.settingValue}>{space.description || 'No description'}</Text>
              </View>
              <View style={styles.settingDivider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Privacy</Text>
                <Text style={[styles.settingValue, { textTransform: 'capitalize' }]}>{space.privacy}</Text>
              </View>
              <View style={styles.settingDivider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Type</Text>
                <Text style={[styles.settingValue, { textTransform: 'capitalize' }]}>{space.type || 'General'}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                </View>
                <View style={[styles.toggle, { backgroundColor: accentHex }]}>
                  <View style={styles.toggleKnob} />
                </View>
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="mail-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Email Digests</Text>
                </View>
                <View style={styles.toggle}>
                  <View style={styles.toggleKnob} />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="eye-off-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Hide from Discovery</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Member Permissions</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Advanced</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="download-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Export Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="archive-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Archive Space</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Delete Space</Text>
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
  tabsScroll: {
    marginBottom: 10,
    paddingHorizontal: 16,
    maxHeight: 32,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  content: {
    flex: 1,
  },
  tabPane: {
    padding: 16,
    paddingBottom: 40,
  },
  hero: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  spaceIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroContent: {
    flex: 1,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  spaceDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
    marginBottom: 10,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    textTransform: 'capitalize',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  activityHealthCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  activityHealthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityScoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  activityScoreLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '600',
    marginTop: 2,
  },
  scoreRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  activityHealthBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  activityHealthFill: {
    height: '100%',
    borderRadius: 4,
  },
  activityHealthMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  activityHealthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityHealthText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  channelsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  channelCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  channelContent: {
    flex: 1,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  channelDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  channelRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.base,
  },
  channelStatsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  channelStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  channelStat: {
    alignItems: 'center',
  },
  channelStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  channelStatLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    textAlign: 'center',
  },
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
  appUsageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 16,
  },
  appUsageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appUsageName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    width: 80,
  },
  appUsageBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  appUsageBar: {
    height: '100%',
    borderRadius: 4,
  },
  appUsagePercent: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    width: 40,
    textAlign: 'right',
  },
  timeRangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  timeRangeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarWrapper: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    marginTop: 8,
    fontWeight: '600',
  },
  chartValue: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  engagementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  engagementRow: {
    gap: 16,
  },
  engagementItem: {
    gap: 8,
  },
  engagementBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  engagementFill: {
    height: '100%',
    borderRadius: 6,
  },
  engagementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  engagementValue: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  contributorsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contributorRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributorRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSubtle,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  contributorMeta: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  contributorActivity: {
    width: 80,
    alignItems: 'flex-end',
    gap: 4,
  },
  activityBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  activityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  contributorActivityText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  insightsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 16,
  },
  activityFeed: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityItemContent: {
    flex: 1,
  },
  activityItemText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  activityItemUser: {
    fontWeight: '700',
  },
  activityItemTime: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 10,
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  memberStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  memberStat: {
    alignItems: 'center',
  },
  memberStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  memberStatLabel: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingValue: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    maxWidth: '60%',
    textAlign: 'right',
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 6,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.base,
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
});

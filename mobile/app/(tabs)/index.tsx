import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useConversations } from '../../src/hooks/useConversations';
import { Avatar } from '../../src/components/ui';
import { ConversationItem } from '../../src/components/chat';
import { useThemeStore } from '../../src/store/themeStore';
import { getAccentColorHex } from '../../src/utils/themeUtils';
import { theme } from '../../src/styles/theme';

const { width } = Dimensions.get('window');

type TimeRange = '7d' | '30d' | '90d' | 'all';

const QUICK_ACTIONS = [
  { id: 'messages', label: 'Messages', icon: 'chatbubbles', color: '#22d3ee', route: '/messages' },
  { id: 'spaces', label: 'Spaces', icon: 'apps', color: '#34d399', route: '/spaces' },
  { id: 'calls', label: 'Calls', icon: 'call', color: '#a855f7', route: '/calls' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar', color: '#fbbf24', route: '/calendar' },
];

const ACTIVITY_ITEMS = [
  { id: '1', type: 'message', user: 'Alice Johnson', action: 'sent you a message', time: '2m ago', icon: 'chatbubble', color: '#22d3ee' },
  { id: '2', type: 'space', user: 'Team Alpha', action: 'new activity in workspace', time: '15m ago', icon: 'apps', color: '#34d399' },
  { id: '3', type: 'mention', user: 'Bob Smith', action: 'mentioned you in a comment', time: '1h ago', icon: 'at', color: '#f472b6' },
  { id: '4', type: 'task', user: 'Project Board', action: 'task assigned to you', time: '2h ago', icon: 'checkbox', color: '#fbbf24' },
  { id: '5', type: 'call', user: 'Sarah Wilson', action: 'missed call', time: '3h ago', icon: 'call', color: '#a855f7' },
];

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { data: conversations } = useConversations(user?.id || '');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const recentConversations = useMemo(() => (conversations || []).slice(0, 4), [conversations]);

  const stats = useMemo(() => {
    const totalConversations = conversations?.length || 0;
    const totalUnread = (conversations || []).reduce((sum, conv) => sum + conv.unread_count, 0);
    const totalGroups = (conversations || []).filter(c => c.type === 'group').length;
    const totalDMs = totalConversations - totalGroups;

    // Mock engagement metrics (replace with real data)
    const messagesThisWeek = 248;
    const activeChats = 12;
    const responseTime = '3.5m';
    const peakHour = '2pm - 4pm';

    return {
      totalConversations,
      totalUnread,
      totalGroups,
      totalDMs,
      messagesThisWeek,
      activeChats,
      responseTime,
      peakHour,
    };
  }, [conversations]);

  const insights = useMemo(() => {
    return [
      {
        id: 'engagement',
        title: 'High Engagement',
        description: `You've sent ${stats.messagesThisWeek} messages this week`,
        icon: 'trending-up',
        color: '#34d399',
        trend: '+15%',
      },
      {
        id: 'response',
        title: 'Quick Responder',
        description: `Average response time: ${stats.responseTime}`,
        icon: 'flash',
        color: '#22d3ee',
        trend: '-12%',
      },
      {
        id: 'active',
        title: 'Active Hours',
        description: `Most active: ${stats.peakHour}`,
        icon: 'time',
        color: '#fbbf24',
        trend: 'Peak',
      },
    ];
  }, [stats]);

  const productivity = useMemo(() => {
    // Mock productivity data
    return {
      tasksCompleted: 24,
      tasksTotal: 35,
      eventsToday: 3,
      documentsViewed: 8,
      filesShared: 12,
    };
  }, []);

  const weeklyActivity = useMemo(() => {
    // Mock weekly activity chart data (7 days)
    return [
      { day: 'Mon', messages: 45, height: 0.6 },
      { day: 'Tue', messages: 62, height: 0.85 },
      { day: 'Wed', messages: 38, height: 0.5 },
      { day: 'Thu', messages: 71, height: 1.0 },
      { day: 'Fri', messages: 55, height: 0.75 },
      { day: 'Sat', messages: 28, height: 0.35 },
      { day: 'Sun', messages: 19, height: 0.25 },
    ];
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.glowOrb} />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.display_name || user?.username}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Avatar
                uri={user?.avatar_url}
                name={user?.display_name || user?.username}
                seed={user?.id}
                size="lg"
              />
            </TouchableOpacity>
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.timeRangeChip, timeRange === range && styles.timeRangeChipActive]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#22d3ee' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="chatbubbles" size={20} color="#22d3ee" />
                <Text style={styles.statValue}>{stats.totalConversations}</Text>
              </View>
              <Text style={styles.statLabel}>Total Chats</Text>
              <Text style={styles.statDetail}>
                {stats.totalDMs} DMs • {stats.totalGroups} Groups
              </Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#f472b6' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="notifications" size={20} color="#f472b6" />
                <Text style={styles.statValue}>{stats.totalUnread}</Text>
              </View>
              <Text style={styles.statLabel}>Unread</Text>
              <Text style={styles.statDetail}>Needs attention</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#34d399' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="send" size={20} color="#34d399" />
                <Text style={styles.statValue}>{stats.messagesThisWeek}</Text>
              </View>
              <Text style={styles.statLabel}>Messages</Text>
              <Text style={styles.statDetail}>This week</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#fbbf24' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="pulse" size={20} color="#fbbf24" />
                <Text style={styles.statValue}>{stats.activeChats}</Text>
              </View>
              <Text style={styles.statLabel}>Active</Text>
              <Text style={styles.statDetail}>Ongoing chats</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Trend</Text>
            <TouchableOpacity>
              <Ionicons name="expand-outline" size={18} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          </View>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyActivity.map((day, index) => (
                <View key={day.day} style={styles.chartColumn}>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${day.height * 100}%`,
                          backgroundColor: index === 3 ? '#22d3ee' : theme.colors.surface,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{day.day}</Text>
                  <Text style={styles.chartValue}>{day.messages}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ AI Insights</Text>
          <View style={styles.insightsContainer}>
            {insights.map((insight) => (
              <View key={insight.id} style={[styles.insightCard, { borderLeftColor: insight.color }]}>
                <View style={styles.insightHeader}>
                  <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
                    <Ionicons name={insight.icon as any} size={18} color={insight.color} />
                  </View>
                  <View style={[styles.trendBadge, { backgroundColor: insight.color + '20' }]}>
                    <Text style={[styles.trendText, { color: insight.color }]}>{insight.trend}</Text>
                  </View>
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Productivity Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productivity</Text>
          <View style={styles.productivityGrid}>
            <View style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#34d399" />
                <Text style={styles.productivityValue}>
                  {productivity.tasksCompleted}/{productivity.tasksTotal}
                </Text>
              </View>
              <Text style={styles.productivityLabel}>Tasks Completed</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(productivity.tasksCompleted / productivity.tasksTotal) * 100}%`,
                      backgroundColor: '#34d399',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <Ionicons name="calendar" size={24} color="#fbbf24" />
                <Text style={styles.productivityValue}>{productivity.eventsToday}</Text>
              </View>
              <Text style={styles.productivityLabel}>Events Today</Text>
            </View>

            <View style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <Ionicons name="document-text" size={24} color="#a855f7" />
                <Text style={styles.productivityValue}>{productivity.documentsViewed}</Text>
              </View>
              <Text style={styles.productivityLabel}>Docs Viewed</Text>
            </View>

            <View style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <Ionicons name="share-social" size={24} color="#22d3ee" />
                <Text style={styles.productivityValue}>{productivity.filesShared}</Text>
              </View>
              <Text style={styles.productivityLabel}>Files Shared</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: accentHex }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityFeed}>
            {ACTIVITY_ITEMS.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityUser}>{item.user}</Text>
                      <Text style={styles.activityAction}> {item.action}</Text>
                    </Text>
                    <Text style={styles.activityTime}>{item.time}</Text>
                  </View>
                </TouchableOpacity>
                {index < ACTIVITY_ITEMS.length - 1 && <View style={styles.activityDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Conversations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Conversations</Text>
            <TouchableOpacity onPress={() => router.push('/messages' as any)}>
              <Text style={[styles.sectionLink, { color: accentHex }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentConversations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={40} color={theme.colors.textSubtle} />
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          ) : (
            <View style={styles.conversationsList}>
              {recentConversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))}
            </View>
          )}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Recommendations</Text>
          <View style={styles.recommendationsContainer}>
            <View style={styles.recommendationCard}>
              <Ionicons name="people" size={24} color="#34d399" />
              <Text style={styles.recommendationTitle}>Connect with teammates</Text>
              <Text style={styles.recommendationDescription}>
                5 team members available to chat
              </Text>
              <TouchableOpacity style={styles.recommendationButton}>
                <Text style={styles.recommendationButtonText}>View</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recommendationCard}>
              <Ionicons name="notifications" size={24} color="#fbbf24" />
              <Text style={styles.recommendationTitle}>Catch up on mentions</Text>
              <Text style={styles.recommendationDescription}>
                You have 3 unread mentions
              </Text>
              <TouchableOpacity style={styles.recommendationButton}>
                <Text style={styles.recommendationButtonText}>Review</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  heroHeader: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#22d3ee',
    opacity: 0.08,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 4,
  },
  userName: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
  },
  timeRangeChipActive: {
    backgroundColor: '#22d3ee20',
    borderWidth: 1,
    borderColor: '#22d3ee40',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  timeRangeTextActive: {
    color: '#22d3ee',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statDetail: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBarContainer: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  chartValue: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    lineHeight: 20,
  },
  productivityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productivityCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  productivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productivityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  productivityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  activityFeed: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  activityUser: {
    fontWeight: '700',
  },
  activityAction: {
    fontWeight: '400',
    color: theme.colors.textSubtle,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  activityDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 4,
  },
  conversationsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSubtle,
    fontSize: 14,
    marginTop: 12,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  recommendationDescription: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    marginBottom: 8,
  },
  recommendationButton: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  recommendationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

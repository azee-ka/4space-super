import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
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
import { useMessagePreferencesStore } from '../../src/store/messagePreferencesStore';
import { useInboxPreferencesStore } from '../../src/store/inboxPreferencesStore';

const { width } = Dimensions.get('window');

type TimeRange = '24h' | '7d' | '30d' | '90d';
type ViewMode = 'overview' | 'analytics' | 'productivity' | 'social';

interface ActivityLog {
  id: string;
  type: 'message' | 'call' | 'meeting' | 'task' | 'file' | 'mention';
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
}

interface ProductivityMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  total: number;
  icon: string;
  color: string;
}

interface ContactActivity {
  id: string;
  name: string;
  avatar?: string;
  messageCount: number;
  lastActive: string;
  status: 'online' | 'away' | 'offline';
  relationshipScore: number;
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { data: conversations, refetch } = useConversations(user?.id || '');
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const { pinnedConversations, mutedConversations, archivedConversations } = useMessagePreferencesStore();
  const { timers, scheduledMessages, quickReplies } = useInboxPreferencesStore();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Calculate real-time metrics
  const metrics = useMemo(() => {
    const convs = conversations || [];
    const now = Date.now();
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };
    const rangeMs = timeRanges[timeRange];

    const recentConvs = convs.filter((c) => {
      const lastMsg = c.last_message?.created_at || c.updated_at;
      return now - new Date(lastMsg).getTime() < rangeMs;
    });

    const totalMessages = recentConvs.reduce((sum, c) => sum + (c.message_count || 0), 0);
    const totalUnread = convs.reduce((sum, c) => sum + c.unread_count, 0);
    const activeChats = recentConvs.length;
    const groupChats = convs.filter((c) => c.type === 'group').length;
    const pinnedCount = pinnedConversations.length;
    const mutedCount = mutedConversations.length;
    const archivedCount = archivedConversations.length;

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.round((activeChats * 5 + totalMessages * 0.1)));

    // Calculate response rate
    const responseRate = convs.length > 0 ? Math.round((convs.filter((c) => c.unread_count === 0).length / convs.length) * 100) : 100;

    // Peak activity time (mock - in real app, analyze message timestamps)
    const peakHours = ['9 AM - 11 AM', '2 PM - 4 PM', '8 PM - 10 PM'];
    const peakTime = peakHours[Math.floor(Math.random() * peakHours.length)];

    return {
      totalConversations: convs.length,
      totalMessages,
      totalUnread,
      activeChats,
      groupChats,
      pinnedCount,
      mutedCount,
      archivedCount,
      engagementScore,
      responseRate,
      peakTime,
      pendingTimers: timers.length,
      scheduledCount: scheduledMessages.filter((m) => m.status === 'pending').length,
      quickReplyCount: quickReplies.length,
    };
  }, [conversations, timeRange, pinnedConversations, mutedConversations, archivedConversations, timers, scheduledMessages, quickReplies]);

  // Productivity metrics
  const productivityMetrics = useMemo<ProductivityMetric[]>(() => {
    return [
      {
        id: 'engagement',
        label: 'Engagement Score',
        value: metrics.engagementScore,
        change: 12,
        total: 100,
        icon: 'trending-up',
        color: '#22d3ee',
      },
      {
        id: 'response',
        label: 'Response Rate',
        value: metrics.responseRate,
        change: -5,
        total: 100,
        icon: 'flash',
        color: '#34d399',
      },
      {
        id: 'active',
        label: 'Active Chats',
        value: metrics.activeChats,
        change: 8,
        total: metrics.totalConversations,
        icon: 'pulse',
        color: '#f472b6',
      },
      {
        id: 'unread',
        label: 'Unread Messages',
        value: metrics.totalUnread,
        change: -15,
        total: metrics.totalMessages,
        icon: 'mail-unread',
        color: '#fbbf24',
      },
    ];
  }, [metrics]);

  // Activity timeline
  const activityTimeline = useMemo<ActivityLog[]>(() => {
    const activities: ActivityLog[] = [];

    // Generate from actual conversations
    (conversations || []).slice(0, 8).forEach((conv, idx) => {
      const name = conv.type === 'group' ? conv.name : conv.participants[0]?.display_name || 'User';
      const lastMsg = conv.last_message?.content || 'No messages yet';
      const time = conv.last_message?.created_at || conv.updated_at;
      const minutesAgo = Math.floor((Date.now() - new Date(time).getTime()) / 60000);
      const timeStr = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`;

      activities.push({
        id: conv.id,
        type: 'message',
        title: `Message from ${name}`,
        subtitle: lastMsg.substring(0, 50),
        time: timeStr,
        icon: 'chatbubble',
        color: '#22d3ee',
        priority: conv.unread_count > 0 ? 'high' : 'medium',
      });
    });

    return activities;
  }, [conversations]);

  // Contact activity ranking
  const topContacts = useMemo<ContactActivity[]>(() => {
    const contacts: ContactActivity[] = [];

    (conversations || [])
      .filter((c) => c.type === 'dm')
      .slice(0, 10)
      .forEach((conv) => {
        const participant = conv.participants[0];
        if (!participant) return;

        const lastMsg = conv.last_message?.created_at || conv.updated_at;
        const hoursAgo = Math.floor((Date.now() - new Date(lastMsg).getTime()) / 3600000);
        const lastActiveStr = hoursAgo < 1 ? 'Active now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

        contacts.push({
          id: participant.id,
          name: participant.display_name || participant.username || 'Unknown',
          avatar: participant.avatar_url,
          messageCount: conv.message_count || 0,
          lastActive: lastActiveStr,
          status: hoursAgo < 1 ? 'online' : hoursAgo < 6 ? 'away' : 'offline',
          relationshipScore: Math.min(100, (conv.message_count || 0) * 2),
        });
      });

    return contacts.sort((a, b) => b.messageCount - a.messageCount);
  }, [conversations]);

  // Chart data for message trends
  const messageTrends = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => ({
      day,
      messages: Math.floor(Math.random() * 80) + 20,
      height: Math.random() * 0.8 + 0.2,
    }));
  }, [timeRange]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderOverviewMode = () => (
    <>
      {/* Key Metrics Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <TouchableOpacity onPress={() => setViewMode('analytics')}>
            <Text style={[styles.sectionLink, { color: accentHex }]}>View Analytics</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { borderLeftColor: '#22d3ee', borderLeftWidth: 3 }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="chatbubbles" size={20} color="#22d3ee" />
              <Text style={styles.metricValue}>{metrics.totalConversations}</Text>
            </View>
            <Text style={styles.metricLabel}>Total Conversations</Text>
            <View style={styles.metricSubStats}>
              <View style={styles.metricSubStat}>
                <Ionicons name="people" size={12} color={theme.colors.textSubtle} />
                <Text style={styles.metricSubText}>{metrics.groupChats} Groups</Text>
              </View>
              <View style={styles.metricSubStat}>
                <Ionicons name="person" size={12} color={theme.colors.textSubtle} />
                <Text style={styles.metricSubText}>{metrics.totalConversations - metrics.groupChats} DMs</Text>
              </View>
            </View>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#f472b6', borderLeftWidth: 3 }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="pulse" size={20} color="#f472b6" />
              <Text style={styles.metricValue}>{metrics.activeChats}</Text>
            </View>
            <Text style={styles.metricLabel}>Active Chats</Text>
            <View style={styles.metricSubStats}>
              <View style={styles.metricSubStat}>
                <Ionicons name="time" size={12} color={theme.colors.textSubtle} />
                <Text style={styles.metricSubText}>Last {timeRange}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#fbbf24', borderLeftWidth: 3 }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="mail-unread" size={20} color="#fbbf24" />
              <Text style={styles.metricValue}>{metrics.totalUnread}</Text>
            </View>
            <Text style={styles.metricLabel}>Unread Messages</Text>
            <View style={styles.metricSubStats}>
              <View style={styles.metricSubStat}>
                <Ionicons name="alert-circle" size={12} color={theme.colors.textSubtle} />
                <Text style={styles.metricSubText}>Needs attention</Text>
              </View>
            </View>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#34d399', borderLeftWidth: 3 }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="send" size={20} color="#34d399" />
              <Text style={styles.metricValue}>{metrics.totalMessages}</Text>
            </View>
            <Text style={styles.metricLabel}>Total Messages</Text>
            <View style={styles.metricSubStats}>
              <View style={styles.metricSubStat}>
                <Ionicons name="trending-up" size={12} color={theme.colors.textSubtle} />
                <Text style={styles.metricSubText}>Period range</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Engagement Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement Overview</Text>
        <View style={styles.engagementCard}>
          <View style={styles.engagementRow}>
            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>Engagement Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.engagementScore, { color: '#22d3ee' }]}>{metrics.engagementScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${metrics.engagementScore}%`, backgroundColor: '#22d3ee' }]}
                />
              </View>
            </View>

            <View style={styles.engagementItem}>
              <Text style={styles.engagementLabel}>Response Rate</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.engagementScore, { color: '#34d399' }]}>{metrics.responseRate}</Text>
                <Text style={styles.scoreMax}>%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${metrics.responseRate}%`, backgroundColor: '#34d399' }]}
                />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.engagementStats}>
            <View style={styles.engagementStat}>
              <Ionicons name="pin" size={16} color="#fbbf24" />
              <Text style={styles.engagementStatValue}>{metrics.pinnedCount}</Text>
              <Text style={styles.engagementStatLabel}>Pinned</Text>
            </View>
            <View style={styles.engagementStat}>
              <Ionicons name="volume-mute" size={16} color="#94a3b8" />
              <Text style={styles.engagementStatValue}>{metrics.mutedCount}</Text>
              <Text style={styles.engagementStatLabel}>Muted</Text>
            </View>
            <View style={styles.engagementStat}>
              <Ionicons name="archive" size={16} color="#64748b" />
              <Text style={styles.engagementStatValue}>{metrics.archivedCount}</Text>
              <Text style={styles.engagementStatLabel}>Archived</Text>
            </View>
            <View style={styles.engagementStat}>
              <Ionicons name="time" size={16} color="#a855f7" />
              <Text style={styles.engagementStatValue}>{metrics.pendingTimers}</Text>
              <Text style={styles.engagementStatLabel}>Timers</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Activity Timeline */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={18} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>
        <View style={styles.timelineContainer}>
          {activityTimeline.map((activity, idx) => (
            <View key={activity.id}>
              <TouchableOpacity style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon as any} size={16} color={activity.color} />
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineTitle}>{activity.title}</Text>
                    <Text style={styles.timelineTime}>{activity.time}</Text>
                  </View>
                  <Text style={styles.timelineSubtitle} numberOfLines={1}>
                    {activity.subtitle}
                  </Text>
                  {activity.priority === 'high' && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityBadgeText}>High Priority</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              {idx < activityTimeline.length - 1 && <View style={styles.timelineDivider} />}
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/messages/new')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#22d3ee20' }]}>
              <Ionicons name="add-circle" size={28} color="#22d3ee" />
            </View>
            <Text style={styles.quickActionLabel}>New Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/messages')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#f472b620' }]}>
              <Ionicons name="chatbubbles" size={28} color="#f472b6" />
            </View>
            <Text style={styles.quickActionLabel}>All Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/spaces')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#34d39920' }]}>
              <Ionicons name="apps" size={28} color="#34d399" />
            </View>
            <Text style={styles.quickActionLabel}>Spaces</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/settings')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#fbbf2420' }]}>
              <Ionicons name="settings" size={28} color="#fbbf24" />
            </View>
            <Text style={styles.quickActionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderAnalyticsMode = () => (
    <>
      {/* Message Trends Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Message Trends</Text>
          <TouchableOpacity>
            <Ionicons name="expand" size={18} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>
        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {messageTrends.map((data, idx) => (
              <View key={data.day} style={styles.chartColumn}>
                <View style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: `${data.height * 100}%`,
                        backgroundColor: data.messages > 60 ? '#22d3ee' : theme.colors.surface,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{data.day}</Text>
                <Text style={styles.chartValue}>{data.messages}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Productivity Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productivity Metrics</Text>
        <View style={styles.productivityGrid}>
          {productivityMetrics.map((metric) => (
            <View key={metric.id} style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <View style={[styles.productivityIcon, { backgroundColor: metric.color + '20' }]}>
                  <Ionicons name={metric.icon as any} size={20} color={metric.color} />
                </View>
                <View style={[styles.changeIndicator, { backgroundColor: metric.change >= 0 ? '#34d39920' : '#ef444420' }]}>
                  <Ionicons
                    name={metric.change >= 0 ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={metric.change >= 0 ? '#34d399' : '#ef4444'}
                  />
                  <Text style={[styles.changeText, { color: metric.change >= 0 ? '#34d399' : '#ef4444' }]}>
                    {Math.abs(metric.change)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.productivityValue}>{metric.value}</Text>
              <Text style={styles.productivityLabel}>{metric.label}</Text>
              <View style={styles.productivityProgress}>
                <View
                  style={[
                    styles.productivityProgressFill,
                    { width: `${(metric.value / metric.total) * 100}%`, backgroundColor: metric.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Top Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Active Contacts</Text>
        <View style={styles.contactsContainer}>
          {topContacts.slice(0, 6).map((contact, idx) => (
            <View key={contact.id}>
              <View style={styles.contactItem}>
                <View style={styles.contactRank}>
                  <Text style={styles.contactRankText}>{idx + 1}</Text>
                </View>
                <View style={styles.contactAvatar}>
                  <Avatar uri={contact.avatar} name={contact.name} seed={contact.id} size="md" />
                  <View style={[styles.contactStatus, { backgroundColor: contact.status === 'online' ? '#34d399' : contact.status === 'away' ? '#fbbf24' : '#64748b' }]} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactMeta}>{contact.messageCount} messages · {contact.lastActive}</Text>
                </View>
                <View style={styles.contactScore}>
                  <Text style={styles.contactScoreValue}>{contact.relationshipScore}</Text>
                  <Text style={styles.contactScoreLabel}>Score</Text>
                </View>
              </View>
              {idx < 5 && <View style={styles.contactDivider} />}
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const renderProductivityMode = () => (
    <>
      {/* Scheduled & Timers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Automation Status</Text>
        <View style={styles.automationGrid}>
          <View style={styles.automationCard}>
            <View style={[styles.automationIcon, { backgroundColor: '#a855f720' }]}>
              <Ionicons name="time" size={24} color="#a855f7" />
            </View>
            <Text style={styles.automationValue}>{metrics.pendingTimers}</Text>
            <Text style={styles.automationLabel}>Active Timers</Text>
            <TouchableOpacity style={styles.automationButton}>
              <Text style={styles.automationButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.automationCard}>
            <View style={[styles.automationIcon, { backgroundColor: '#22d3ee20' }]}>
              <Ionicons name="calendar" size={24} color="#22d3ee" />
            </View>
            <Text style={styles.automationValue}>{metrics.scheduledCount}</Text>
            <Text style={styles.automationLabel}>Scheduled</Text>
            <TouchableOpacity style={styles.automationButton}>
              <Text style={styles.automationButtonText}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.automationCard}>
            <View style={[styles.automationIcon, { backgroundColor: '#f472b620' }]}>
              <Ionicons name="flash" size={24} color="#f472b6" />
            </View>
            <Text style={styles.automationValue}>{metrics.quickReplyCount}</Text>
            <Text style={styles.automationLabel}>Quick Replies</Text>
            <TouchableOpacity style={styles.automationButton}>
              <Text style={styles.automationButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Peak Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Insights</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <View style={[styles.insightIcon, { backgroundColor: '#fbbf2420' }]}>
              <Ionicons name="sunny" size={24} color="#fbbf24" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Peak Activity Time</Text>
              <Text style={styles.insightValue}>{metrics.peakTime}</Text>
              <Text style={styles.insightDescription}>You're most active during these hours</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentHex} />}
      >
        {/* Header */}
        <View style={styles.heroHeader}>
          <View style={styles.glowOrb} />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.display_name || user?.username}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Avatar uri={user?.avatar_url} name={user?.display_name || user?.username} seed={user?.id} size="lg" />
            </TouchableOpacity>
          </View>

          {/* View Mode Selector */}
          <View style={styles.viewModeContainer}>
            {(['overview', 'analytics', 'productivity'] as ViewMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.viewModeChip, viewMode === mode && styles.viewModeChipActive]}
                onPress={() => setViewMode(mode)}
              >
                <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            {(['24h', '7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.timeRangeChip, timeRange === range && styles.timeRangeChipActive]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
                  {range.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Render selected view mode */}
        {viewMode === 'overview' && renderOverviewMode()}
        {viewMode === 'analytics' && renderAnalyticsMode()}
        {viewMode === 'productivity' && renderProductivityMode()}
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
  viewModeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  viewModeChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
  },
  viewModeChipActive: {
    backgroundColor: '#22d3ee20',
    borderWidth: 1,
    borderColor: '#22d3ee40',
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  viewModeTextActive: {
    color: '#22d3ee',
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  timeRangeTextActive: {
    color: theme.colors.textPrimary,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  metricSubStats: {
    gap: 4,
  },
  metricSubStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricSubText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  engagementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 16,
  },
  engagementItem: {
    flex: 1,
  },
  engagementLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  engagementScore: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginLeft: 4,
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
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 16,
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  engagementStat: {
    alignItems: 'center',
    gap: 4,
  },
  engagementStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  engagementStatLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  timelineContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 12,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  timelineTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  timelineSubtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginBottom: 4,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef444420',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
  },
  timelineDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productivityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  productivityValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  productivityLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '600',
    marginBottom: 8,
  },
  productivityProgress: {
    height: 4,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  productivityProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  contactsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRankText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  contactAvatar: {
    position: 'relative',
  },
  contactStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  contactMeta: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  contactScore: {
    alignItems: 'center',
  },
  contactScoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22d3ee',
  },
  contactScoreLabel: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  contactDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 8,
  },
  automationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  automationCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  automationIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  automationValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  automationLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  automationButton: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  automationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  insightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 16,
  },
  insightIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSpace, useSpaceStats } from '../../../../src/hooks/useSpaces';
import { LoadingSpinner } from '../../../../src/components/ui';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

const { width } = Dimensions.get('window');

type TimePeriod = '7d' | '30d' | '90d' | 'all';

// Mock data - replace with real data
const MOCK_ACTIVITY = {
  messages: [20, 35, 45, 30, 50, 40, 55],
  members: [1, 2, 2, 3, 4, 5, 7],
  files: [2, 4, 3, 5, 6, 4, 8],
};

const MOCK_TOP_CONTRIBUTORS = [
  { id: '1', name: 'John Doe', messages: 145, avatar: null },
  { id: '2', name: 'Jane Smith', messages: 120, avatar: null },
  { id: '3', name: 'Mike Johnson', messages: 98, avatar: null },
  { id: '4', name: 'Sarah Wilson', messages: 76, avatar: null },
  { id: '5', name: 'Tom Brown', messages: 54, avatar: null },
];

const MOCK_POPULAR_CHANNELS = [
  { id: '1', name: 'general', messages: 320, color: '#3b82f6' },
  { id: '2', name: 'random', messages: 245, color: '#ec4899' },
  { id: '3', name: 'help', messages: 180, color: '#10b981' },
  { id: '4', name: 'announcements', messages: 95, color: '#f59e0b' },
];

export default function SpaceAnalyticsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaceId = Array.isArray(id) ? id[0] : id;
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { data: space, isLoading: spaceLoading } = useSpace(spaceId);
  const { data: stats, isLoading: statsLoading } = useSpaceStats(spaceId);

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d');

  const timePeriodOptions: Array<{ value: TimePeriod; label: string }> = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const getMaxValue = (data: number[]) => Math.max(...data);

  if (spaceLoading || statsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!space) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={18} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Period Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
          <View style={styles.periodRow}>
            {timePeriodOptions.map((option) => {
              const isActive = timePeriod === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.periodChip, isActive && { backgroundColor: accentHex }]}
                  onPress={() => setTimePeriod(option.value)}
                >
                  <Text style={[styles.periodText, isActive && { color: theme.colors.base }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Overview Stats */}
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <View style={[styles.overviewIconCircle, { backgroundColor: '#3b82f6' + '15' }]}>
              <Ionicons name="chatbubbles" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.overviewValue}>{stats?.messages || 0}</Text>
            <Text style={styles.overviewLabel}>Messages</Text>
            <View style={styles.overviewChange}>
              <Ionicons name="trending-up" size={12} color="#10b981" />
              <Text style={[styles.overviewChangeText, { color: '#10b981' }]}>+12%</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={[styles.overviewIconCircle, { backgroundColor: '#10b981' + '15' }]}>
              <Ionicons name="people" size={20} color="#10b981" />
            </View>
            <Text style={styles.overviewValue}>{stats?.members || 0}</Text>
            <Text style={styles.overviewLabel}>Members</Text>
            <View style={styles.overviewChange}>
              <Ionicons name="trending-up" size={12} color="#10b981" />
              <Text style={[styles.overviewChangeText, { color: '#10b981' }]}>+8%</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={[styles.overviewIconCircle, { backgroundColor: '#a855f7' + '15' }]}>
              <Ionicons name="folder" size={20} color="#a855f7" />
            </View>
            <Text style={styles.overviewValue}>{stats?.files || 0}</Text>
            <Text style={styles.overviewLabel}>Files</Text>
            <View style={styles.overviewChange}>
              <Ionicons name="trending-up" size={12} color="#10b981" />
              <Text style={[styles.overviewChangeText, { color: '#10b981' }]}>+15%</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={[styles.overviewIconCircle, { backgroundColor: '#f59e0b' + '15' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.overviewValue}>{stats?.tasks || 0}</Text>
            <Text style={styles.overviewLabel}>Tasks</Text>
            <View style={styles.overviewChange}>
              <Ionicons name="trending-down" size={12} color="#ef4444" />
              <Text style={[styles.overviewChangeText, { color: '#ef4444' }]}>-5%</Text>
            </View>
          </View>
        </View>

        {/* Activity Chart */}
        <Text style={styles.sectionTitle}>Activity Over Time</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>Messages</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Members</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#a855f7' }]} />
              <Text style={styles.legendText}>Files</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {MOCK_ACTIVITY.messages.map((value, index) => {
              const maxValue = getMaxValue(MOCK_ACTIVITY.messages);
              const height = (value / maxValue) * 100;

              return (
                <View key={index} style={styles.chartColumn}>
                  <View style={styles.chartBars}>
                    <View
                      style={[
                        styles.chartBar,
                        { height: `${height}%`, backgroundColor: '#3b82f6' },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top Contributors */}
        <Text style={styles.sectionTitle}>Top Contributors</Text>
        <View style={styles.section}>
          {MOCK_TOP_CONTRIBUTORS.map((contributor, index) => {
            const maxMessages = MOCK_TOP_CONTRIBUTORS[0].messages;
            const percentage = (contributor.messages / maxMessages) * 100;

            return (
              <View key={contributor.id} style={styles.contributorRow}>
                <View style={styles.contributorLeft}>
                  <View style={styles.contributorRank}>
                    <Text style={styles.contributorRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.contributorInfo}>
                    <Text style={styles.contributorName}>{contributor.name}</Text>
                    <View style={styles.contributorBar}>
                      <View
                        style={[
                          styles.contributorBarFill,
                          { width: `${percentage}%`, backgroundColor: accentHex },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <Text style={styles.contributorMessages}>{contributor.messages}</Text>
              </View>
            );
          })}
        </View>

        {/* Popular Channels */}
        <Text style={styles.sectionTitle}>Popular Channels</Text>
        <View style={styles.section}>
          {MOCK_POPULAR_CHANNELS.map((channel) => {
            const maxMessages = MOCK_POPULAR_CHANNELS[0].messages;
            const percentage = (channel.messages / maxMessages) * 100;

            return (
              <View key={channel.id} style={styles.channelRow}>
                <View style={[styles.channelIcon, { backgroundColor: channel.color + '20' }]}>
                  <Ionicons name="chatbubble-outline" size={16} color={channel.color} />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>#{channel.name}</Text>
                  <View style={styles.channelBar}>
                    <View
                      style={[
                        styles.channelBarFill,
                        { width: `${percentage}%`, backgroundColor: channel.color },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.channelMessages}>{channel.messages}</Text>
              </View>
            );
          })}
        </View>

        {/* Engagement Metrics */}
        <Text style={styles.sectionTitle}>Engagement</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#3b82f620' }]}>
              <Ionicons name="time-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.metricValue}>4.2h</Text>
            <Text style={styles.metricLabel}>Avg. Session</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="pulse-outline" size={20} color="#10b981" />
            </View>
            <Text style={styles.metricValue}>85%</Text>
            <Text style={styles.metricLabel}>Activity Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.metricValue}>4.7</Text>
            <Text style={styles.metricLabel}>Satisfaction</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#ec489920' }]}>
              <Ionicons name="repeat-outline" size={20} color="#ec4899" />
            </View>
            <Text style={styles.metricValue}>92%</Text>
            <Text style={styles.metricLabel}>Retention</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  header: {
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  exportButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  periodScroll: {
    marginBottom: 20,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  overviewCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  overviewIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginBottom: 8,
  },
  overviewChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overviewChangeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: 20,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartBars: {
    flex: 1,
    width: '80%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginTop: 8,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contributorLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  contributorRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributorRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  contributorBar: {
    height: 4,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 2,
  },
  contributorBarFill: {
    height: 4,
    borderRadius: 2,
  },
  contributorMessages: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSubtle,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  channelIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
    marginRight: 12,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  channelBar: {
    height: 4,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 2,
  },
  channelBarFill: {
    height: 4,
    borderRadius: 2,
  },
  channelMessages: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSubtle,
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
    alignItems: 'center',
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});

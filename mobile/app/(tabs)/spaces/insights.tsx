import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Space } from '../../../src/types';
import { useSpaces } from '../../../src/hooks/useSpaces';
import { theme } from '../../../src/styles/theme';

const featureHighlights = [
  'AI-generated space briefs',
  'Live metrics dashboard',
  'Automated privacy checks',
  'Smart reminders & rituals',
  'Shared agendas & retros',
  'Secure guest & token links',
];

const InsightsPage = () => {
  const router = useRouter();
  const { data: spaces = [], isLoading } = useSpaces();
  const [activeTab, setActiveTab] = useState<'metrics' | 'activity' | 'settings'>('metrics');
  const [settingsState, setSettingsState] = useState({
    autoReports: true,
    privacyAudit: false,
    reminders: true,
  });

  const stats = useMemo(
    () => ({
      total: spaces.length,
      privateCount: spaces.filter((space) => space.privacy === 'private').length,
      teamCount: spaces.filter((space) => space.privacy === 'team').length,
      shared: spaces.filter((space) => space.privacy !== 'private').length,
    }),
    [spaces]
  );

  const insights = useMemo(() => {
    const now = Date.now();
    const activeSpaces = spaces.filter((space) => {
      const updated = space.updated_at ? new Date(space.updated_at).getTime() : 0;
      return now - updated < 1000 * 60 * 60 * 24 * 7;
    }).length;
    const busiestSpace = spaces.reduce<Space | null>((prev, current) => {
      const prevCount = prev ? (prev.members_count ?? prev.member_count ?? 0) : 0;
      const currentCount = current.members_count ?? current.member_count ?? 0;
      return currentCount > prevCount ? current : prev;
    }, null);
    const averageMembers = spaces.length ? Math.round(
      spaces.reduce((sum, space) => sum + (space.members_count ?? space.member_count ?? 0), 0) / spaces.length
    ) : 0;

    return [
      {
        label: 'Active this week',
        value: `${activeSpaces}/${spaces.length}`,
        detail: 'Recently updated spaces',
        icon: 'pulse-outline',
        color: '#f59e0b',
      },
      {
        label: 'Avg members',
        value: `${averageMembers}`,
        detail: 'Combined teams',
        icon: 'people-circle-outline',
        color: '#38bdf8',
      },
      {
        label: 'Largest space',
        value: busiestSpace ? busiestSpace.name : '—',
        detail: busiestSpace ? `${busiestSpace.members_count ?? busiestSpace.member_count ?? 0} members` : 'No members yet',
        icon: 'trophy-outline',
        color: '#ec4899',
      },
    ];
  }, [spaces]);

  const activityFeed = useMemo(
    () =>
      spaces
        .map((space) => ({
          id: space.id,
          name: space.name,
          updatedAt: space.updated_at,
          members: space.members_count ?? space.member_count ?? 0,
          privacy: space.privacy,
        }))
        .sort((a, b) => {
          const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 6),
    [spaces]
  );

  const tabs = [
    { key: 'metrics', label: 'Metrics' },
    { key: 'activity', label: 'Activity' },
    { key: 'settings', label: 'Settings' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading insights...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Workspace intelligence</Text>
          <Text style={styles.headerSubtitle}>Deep dive into every space</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabPill,
              activeTab === tab.key && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'metrics' && (
          <>
            <View style={styles.statsRow}>
              {[stats.total, stats.privateCount, stats.teamCount, stats.shared].map((value, index) => (
                <View key={index} style={styles.statCardLarge}>
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>
                    {['Total', 'Private', 'Team', 'Shared'][index]}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.insightsSection}>
              {insights.map((insight) => (
                <View key={insight.label} style={[styles.insightCard, { borderColor: insight.color }]}>
                  <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
                    <Ionicons name={insight.icon as any} size={20} color={insight.color} />
                  </View>
                  <Text style={styles.insightLabel}>{insight.label}</Text>
                  <Text style={styles.insightValue}>{insight.value}</Text>
                  <Text style={styles.insightDetail}>{insight.detail}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'activity' && (
          <View style={styles.activityList}>
            {activityFeed.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="pulse-outline" size={16} color={theme.colors.textPrimary} />
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>{activity.name}</Text>
                  <Text style={styles.activityMeta}>
                    {activity.members} members · {activity.updatedAt ? new Date(activity.updatedAt).toLocaleDateString() : 'No recent activity'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'settings' && (
          <>
            <View style={styles.settingsList}>
              {[
                { key: 'autoReports', label: 'Auto reports', detail: 'Send weekly summaries to your team' },
                { key: 'privacyAudit', label: 'Privacy audit', detail: 'Scan members & guests' },
                { key: 'reminders', label: 'Reminders', detail: 'Nudge members about milestones' },
              ].map((setting) => (
                <View key={setting.key} style={styles.settingRow}>
                  <View>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                    <Text style={styles.settingDetail}>{setting.detail}</Text>
                  </View>
                  <Switch
                    value={settingsState[setting.key as keyof typeof settingsState]}
                    onValueChange={(value) =>
                      setSettingsState((prev) => ({
                        ...prev,
                        [setting.key]: value,
                      }))
                    }
                    thumbColor={theme.colors.base}
                    trackColor={{ false: theme.colors.surface, true: accentHex }}
                  />
                </View>
              ))}
            </View>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>More capabilities</Text>
            <View style={styles.featuresList}>
              {featureHighlights.map((item) => (
                <View key={item} style={styles.featuresListItem}>
                  <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
                  <Text style={styles.featuresListText}>{item}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    color: theme.colors.textSubtle,
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: 6,
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: theme.colors.background,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  tabPillActive: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSubtle,
    fontWeight: '600',
    fontSize: 12,
  },
  tabTextActive: {
    color: theme.colors.base,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCardLarge: {
    flex: 1,
    minWidth: 140,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  insightsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  insightCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 6,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  insightDetail: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  activityList: {
    gap: 12,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  activityMeta: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  settingsList: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  settingDetail: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  featuresList: {
    gap: 12,
  },
  featuresListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuresListText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
});

export default InsightsPage;

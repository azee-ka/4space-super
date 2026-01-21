import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
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

export default function SpaceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaceId = Array.isArray(id) ? id[0] : id;
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { data: space, isLoading } = useSpace(spaceId);
  const { data: stats } = useSpaceStats(spaceId);
  const { data: members = [] } = useSpaceMembers(spaceId);

  const iconName = space?.icon || space?.type || 'rocket';
  const iconColor = space ? resolveSpaceColor(space) : '#22d3ee';

  const memberPreview = useMemo(() => members.slice(0, 5), [members]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!space) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Space not found</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Space</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={[styles.spaceIcon, { backgroundColor: iconColor }]}>
            <Ionicons name={(SPACE_ICON_MAP[iconName] || 'rocket-outline') as any} size={22} color={theme.colors.base} />
          </View>
          <Text style={styles.spaceName}>{space.name}</Text>
          <Text style={styles.spaceDescription}>{space.description || 'No description yet.'}</Text>
          <View style={styles.privacyBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={accentHex} />
            <Text style={styles.privacyText}>{space.privacy}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.members || members.length || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.messages || 0}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.files || 0}</Text>
            <Text style={styles.statLabel}>Files</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: accentHex }]}
            onPress={() => router.push('/messages' as any)}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={theme.colors.base} />
            <Text style={styles.primaryActionText}>Open Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction}>
            <Ionicons name="person-add-outline" size={18} color={theme.colors.textPrimary} />
            <Text style={styles.secondaryActionText}>Invite</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Members</Text>
        <View style={styles.section}>
          <View style={styles.memberRow}>
            {memberPreview.map((member) => (
              <Avatar
                key={member.id}
                uri={member.user?.avatar_url}
                name={member.user?.display_name || member.user?.email || 'User'}
                size="sm"
              />
            ))}
            {members.length > memberPreview.length && (
              <View style={styles.memberOverflow}>
                <Text style={styles.memberOverflowText}>+{members.length - memberPreview.length}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.sectionRow}>
            <Text style={styles.sectionRowText}>View all members</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Workspace</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionRow}>
            <View style={styles.sectionRowLeft}>
              <Ionicons name="folder-outline" size={18} color="#a855f7" />
              <Text style={styles.sectionRowText}>Files</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionRow}>
            <View style={styles.sectionRowLeft}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#34d399" />
              <Text style={styles.sectionRowText}>Tasks</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionRow}>
            <View style={styles.sectionRowLeft}>
              <Ionicons name="calendar-outline" size={18} color="#fbbf24" />
              <Text style={styles.sectionRowText}>Calendar</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  spaceIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  spaceName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  spaceDescription: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.textSubtle,
    textAlign: 'center',
    maxWidth: 280,
  },
  privacyBadge: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  privacyText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 22,
    padding: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  memberOverflow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberOverflowText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  sectionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionRowText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useConversations } from '../../src/hooks/useConversations';
import { Avatar } from '../../src/components/ui';
import { ConversationItem } from '../../src/components/chat';
import { theme } from '../../src/styles/theme';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: conversations } = useConversations(user?.id || '');
  const recentConversations = (conversations || []).slice(0, 3);
  const totalConversations = conversations?.length || 0;
  const totalUnread = (conversations || []).reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.username}>
              {user?.display_name || user?.username}
            </Text>
          </View>
          <Avatar uri={user?.avatar_url} name={user?.display_name || user?.username} size="lg" />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/messages' as any)}
          >
            <Ionicons name="chatbubbles-outline" size={22} color={theme.colors.textPrimary} />
            <Text style={styles.actionTitle}>Messages</Text>
            <Text style={styles.actionSubtitle}>Jump into chats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/spaces' as any)}
          >
            <Ionicons name="apps-outline" size={22} color={theme.colors.textPrimary} />
            <Text style={styles.actionTitle}>Spaces</Text>
            <Text style={styles.actionSubtitle}>Manage teams</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <Text style={styles.sectionHint}>Last 30 days</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumberPrimary}>{totalConversations}</Text>
              <Text style={styles.statLabel}>Chats</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumberCyan}>{totalUnread}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumberPrimary}>0</Text>
              <Text style={styles.statLabel}>Mentions</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Conversations</Text>
            <TouchableOpacity onPress={() => router.push('/messages' as any)}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>
          {recentConversations.length === 0 ? (
            <Text style={styles.emptyText}>No conversations yet.</Text>
          ) : (
            <View style={styles.listWrap}>
              {recentConversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))}
            </View>
          )}
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
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  username: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  actionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  actionSubtitle: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  sectionLink: {
    fontSize: 12,
    color: theme.colors.accent,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: theme.radii.md,
    padding: 14,
    backgroundColor: theme.colors.surface,
  },
  statNumberPrimary: {
    color: theme.colors.accent,
    fontSize: 24,
    fontWeight: '700',
  },
  statNumberCyan: {
    color: theme.colors.accentViolet,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  emptyText: {
    color: theme.colors.textSubtle,
    paddingVertical: 16,
  },
  listWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
});

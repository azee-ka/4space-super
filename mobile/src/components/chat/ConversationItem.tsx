import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Conversation } from '../../types';
import { Avatar } from '../ui';
import { theme } from '../../styles/theme';

interface ConversationItemProps {
  conversation: Conversation;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  onLongPress?: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isPinned = false,
  isMuted = false,
  isArchived = false,
  onLongPress,
}) => {
  const router = useRouter();

  const getConversationName = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    const otherUser = conversation.participants[0];
    return otherUser?.display_name || otherUser?.username || 'Unknown User';
  };

  const getConversationAvatar = () => {
    if (conversation.type === 'group') {
      return conversation.avatar_url;
    }
    return conversation.participants[0]?.avatar_url;
  };

  const getConversationSeed = () => {
    if (conversation.type === 'group') {
      return conversation.id;
    }
    return conversation.participants[0]?.id || conversation.id;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const unreadCount = conversation.unread_count || 0;
  const hasUnread = unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={() => router.push('/messages/' + conversation.id)}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <View style={[styles.avatarRing, hasUnread && styles.avatarRingUnread]}>
        <Avatar uri={getConversationAvatar()} name={getConversationName()} seed={getConversationSeed()} size="lg" />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {getConversationName()}
            </Text>
            {conversation.type === 'group' && (
              <View style={styles.groupPill}>
                <Text style={styles.groupPillText}>Group</Text>
              </View>
            )}
            {isPinned && <Ionicons name="pin" size={14} color="#f97316" />}
            {isMuted && <Ionicons name="volume-mute" size={14} color="#94a3b8" />}
            {isArchived && <Ionicons name="archive-outline" size={14} color="#64748b" />}
          </View>
          {conversation.last_message && (
            <Text style={styles.time}>{formatTime(conversation.last_message.created_at)}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.message} numberOfLines={1}>
            {conversation.last_message?.content || 'No messages yet'}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  avatarRingUnread: {
    backgroundColor: theme.colors.accent,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  name: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
    maxWidth: '70%',
  },
  groupPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 999,
  },
  groupPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  badge: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: theme.colors.base,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

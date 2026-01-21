import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Conversation } from '../../types';
import { Avatar } from '../ui';
import { theme } from '../../styles/theme';

interface ConversationItemProps {
  conversation: Conversation;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      onPress={() => router.push('/messages/' + conversation.id)}
      style={styles.container}
    >
      <Avatar uri={getConversationAvatar()} name={getConversationName()} size="lg" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {getConversationName()}
          </Text>
          {conversation.last_message && (
            <Text style={styles.time}>
              {formatTime(conversation.last_message.created_at)}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.message} numberOfLines={1}>
            {conversation.last_message?.content || 'No messages yet'}
          </Text>
          {conversation.unread_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
              </Text>
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
    paddingHorizontal: 20,
    backgroundColor: theme.colors.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
    flex: 1,
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
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radii.pill,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Message, User } from '../../types';
import { Avatar } from '../ui';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  onLongPress?: () => void;
  onReactionPress?: () => void;
  onReplyPress?: () => void;
  currentUser: User;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  onLongPress,
  onReactionPress,
  onReplyPress,
  currentUser,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupReactions = () => {
    const grouped = message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, typeof message.reactions>);

    return Object.entries(grouped).map(([emoji, reactions]) => ({
      emoji,
      count: reactions.length,
      hasCurrentUser: reactions.some(r => r.user_id === currentUser.id),
    }));
  };

  const reactionGroups = groupReactions();

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[styles.container, isOwnMessage ? styles.containerEnd : styles.containerStart]}
    >
      <View style={[styles.messageRow, isOwnMessage && styles.messageRowReverse]}>
        {showAvatar && !isOwnMessage && (
          <View style={styles.avatarContainer}>
            <Avatar uri={message.sender.avatar_url} name={message.sender.display_name || message.sender.username} size="sm" />
          </View>
        )}

        <View>
          {!isOwnMessage && showAvatar && (
            <Text style={styles.senderName}>
              {message.sender.display_name || message.sender.username}
            </Text>
          )}

            {message.reply_to && (
            <View style={[styles.replyContainer, isOwnMessage ? styles.replyOwn : styles.replyOther]}>
              <Text style={styles.replyName}>
                {message.reply_to.sender?.display_name || message.reply_to.sender?.username || 'User'}
              </Text>
              <Text style={styles.replyContent} numberOfLines={2}>
                {message.reply_to.content}
              </Text>
            </View>
          )}

          <View style={[styles.bubble, isOwnMessage ? styles.bubbleOwn : styles.bubbleOther]}>
            {message.type === 'image' && message.file_url && (
              <Image source={{ uri: message.file_url }} style={styles.image} resizeMode="cover" />
            )}

            {message.type === 'file' && message.file_name && (
              <View style={styles.fileContainer}>
                <Ionicons name="document-outline" size={20} color={theme.colors.white} />
                <Text style={styles.fileName} numberOfLines={1}>
                  {message.file_name}
                </Text>
              </View>
            )}

            <Text style={[styles.messageText, isOwnMessage ? styles.messageTextOwn : styles.messageTextOther]}>
              {message.content}
            </Text>

            <View style={styles.metaContainer}>
              {message.is_edited && (
                <Text style={[styles.metaText, isOwnMessage ? styles.metaTextOwn : styles.metaTextOther]}>
                  edited
                </Text>
              )}
              <Text style={[styles.metaText, isOwnMessage ? styles.metaTextOwn : styles.metaTextOther]}>
                {formatTime(message.created_at)}
              </Text>
              {isOwnMessage && (
                <View style={styles.readIndicator}>
                  {message.read_by.length > 1 ? (
                    <Ionicons name="checkmark-done" size={12} color={theme.colors.accent} />
                  ) : (
                    <Ionicons name="checkmark" size={12} color={theme.colors.textMuted} />
                  )}
                </View>
              )}
            </View>
          </View>

          {reactionGroups.length > 0 && (
            <View style={styles.reactionsContainer}>
              {reactionGroups.map(({ emoji, count, hasCurrentUser }) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={onReactionPress}
                  style={[styles.reactionBubble, hasCurrentUser ? styles.reactionActive : styles.reactionInactive]}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{count}</Text>
                </TouchableOpacity>
              ))}
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
    marginBottom: 8,
  },
  containerStart: {
    justifyContent: 'flex-start',
  },
  containerEnd: {
    justifyContent: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    maxWidth: '80%',
  },
  messageRowReverse: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: 8,
  },
  senderName: {
    color: theme.colors.accent,
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  replyContainer: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    borderLeftWidth: 4,
  },
  replyOwn: {
    backgroundColor: theme.colors.accentSoft,
    borderLeftColor: theme.colors.accent,
  },
  replyOther: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderLeftColor: theme.colors.border,
  },
  replyName: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  replyContent: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  bubble: {
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
  },
  bubbleOwn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.borderStrong,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.border,
  },
  image: {
    width: 192,
    height: 192,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 4,
  },
  fileName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  messageText: {
    fontSize: 16,
  },
  messageTextOwn: {
    color: theme.colors.white,
  },
  messageTextOther: {
    color: theme.colors.textPrimary,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  metaText: {
    fontSize: 10,
    marginRight: 4,
  },
  metaTextOwn: {
    color: theme.colors.textPrimary,
  },
  metaTextOther: {
    color: theme.colors.textMuted,
  },
  readIndicator: {
    marginLeft: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reactionBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 4,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  reactionActive: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.borderStrong,
  },
  reactionInactive: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.border,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
});

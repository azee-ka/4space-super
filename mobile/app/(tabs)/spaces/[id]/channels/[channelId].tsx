import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../../src/utils/themeUtils';
import { theme } from '../../../../../src/styles/theme';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  reactions?: Array<{ emoji: string; count: number; userReacted: boolean }>;
  attachments?: Array<{ id: string; name: string; type: string; url: string }>;
  replyTo?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  memberCount: number;
  isPinned: boolean;
  isPrivate: boolean;
}

const MOCK_CHANNEL: Channel = {
  id: '1',
  name: 'general',
  description: 'General discussions and announcements',
  icon: 'chatbubbles-outline',
  color: '#3b82f6',
  memberCount: 12,
  isPinned: false,
  isPrivate: false,
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Welcome to the general channel! Feel free to share your thoughts and ideas here.',
    sender: { id: '1', name: 'John Doe' },
    timestamp: '2026-01-27T09:00:00',
    reactions: [
      { emoji: '👋', count: 5, userReacted: true },
      { emoji: '🎉', count: 3, userReacted: false },
    ],
  },
  {
    id: '2',
    content: "Hey everyone! I've just uploaded the latest project files to the Files section.",
    sender: { id: '2', name: 'Jane Smith' },
    timestamp: '2026-01-27T09:15:00',
    attachments: [
      { id: '1', name: 'project-files.zip', type: 'archive', url: '' },
    ],
  },
  {
    id: '3',
    content: 'Thanks for sharing! I will review them shortly.',
    sender: { id: '3', name: 'Bob Wilson' },
    timestamp: '2026-01-27T09:20:00',
    replyTo: '2',
    reactions: [{ emoji: '👍', count: 2, userReacted: false }],
  },
  {
    id: '4',
    content: "Quick question - what's the deadline for the next milestone?",
    sender: { id: '4', name: 'Alice Brown' },
    timestamp: '2026-01-27T10:30:00',
  },
  {
    id: '5',
    content: 'The deadline is February 10th. We have plenty of time to get everything done.',
    sender: { id: '1', name: 'John Doe' },
    timestamp: '2026-01-27T10:35:00',
    replyTo: '4',
  },
  {
    id: '6',
    content: 'Perfect! I will start working on the design mockups today.',
    sender: { id: '5', name: 'Charlie Davis' },
    timestamp: '2026-01-27T11:00:00',
    reactions: [{ emoji: '🎨', count: 1, userReacted: false }],
  },
];

export default function ChannelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (days === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // TODO: Implement send message mutation
    console.log('Send message:', message, 'Reply to:', replyingTo?.id);
    setMessage('');
    setReplyingTo(null);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // TODO: Implement add/remove reaction mutation
    console.log('Toggle reaction:', messageId, emoji);
  };

  const handleMessageLongPress = (msg: Message) => {
    Alert.alert(
      'Message Actions',
      msg.content,
      [
        { text: 'Reply', onPress: () => setReplyingTo(msg) },
        { text: 'React', onPress: () => showReactionPicker(msg) },
        { text: 'Copy', onPress: () => console.log('Copy message') },
        { text: 'Delete', onPress: () => handleDeleteMessage(msg), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showReactionPicker = (msg: Message) => {
    const emojis = ['👍', '❤️', '😂', '🎉', '👏', '🔥'];
    Alert.alert(
      'React to message',
      'Choose an emoji',
      emojis.map((emoji) => ({
        text: emoji,
        onPress: () => handleReaction(msg.id, emoji),
      })).concat({ text: 'Cancel', style: 'cancel' })
    );
  };

  const handleDeleteMessage = (msg: Message) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete message mutation
            console.log('Delete message:', msg.id);
          },
        },
      ]
    );
  };

  const handleChannelInfo = () => {
    Alert.alert(
      MOCK_CHANNEL.name,
      MOCK_CHANNEL.description || 'No description',
      [
        { text: 'Edit Channel', onPress: () => console.log('Edit channel') },
        { text: 'View Members', onPress: () => console.log('View members') },
        { text: 'Channel Settings', onPress: () => console.log('Channel settings') },
        { text: 'Leave Channel', onPress: () => console.log('Leave channel'), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMessage = (msg: Message, index: number) => {
    const isFirstMessage = index === 0;
    const prevMessage = !isFirstMessage ? MOCK_MESSAGES[index - 1] : null;
    const showSender = isFirstMessage || prevMessage?.sender.id !== msg.sender.id;

    const replyToMessage = msg.replyTo
      ? MOCK_MESSAGES.find((m) => m.id === msg.replyTo)
      : null;

    return (
      <View key={msg.id} style={styles.messageContainer}>
        {showSender && (
          <View style={styles.messageSender}>
            <View style={styles.senderAvatar}>
              <Text style={styles.senderAvatarText}>
                {msg.sender.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.senderName}>{msg.sender.name}</Text>
            <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.messageBubble, !showSender && styles.messageBubbleGrouped]}
          onLongPress={() => handleMessageLongPress(msg)}
          activeOpacity={0.7}
        >
          {replyToMessage && (
            <View style={styles.replyPreview}>
              <View style={[styles.replyLine, { backgroundColor: accentHex }]} />
              <View>
                <Text style={styles.replyName}>{replyToMessage.sender.name}</Text>
                <Text style={styles.replyContent} numberOfLines={1}>
                  {replyToMessage.content}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.messageContent}>{msg.content}</Text>

          {msg.attachments && msg.attachments.length > 0 && (
            <View style={styles.attachments}>
              {msg.attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  style={styles.attachment}
                  onPress={() => console.log('Open attachment:', attachment.id)}
                >
                  <Ionicons name="document-attach-outline" size={20} color={accentHex} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Ionicons name="download-outline" size={16} color={theme.colors.textSubtle} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {msg.reactions && msg.reactions.length > 0 && (
            <View style={styles.reactions}>
              {msg.reactions.map((reaction, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.reaction,
                    reaction.userReacted && { backgroundColor: accentHex + '20', borderColor: accentHex },
                  ]}
                  onPress={() => handleReaction(msg.id, reaction.emoji)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text
                    style={[
                      styles.reactionCount,
                      reaction.userReacted && { color: accentHex, fontWeight: '700' },
                    ]}
                  >
                    {reaction.count}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addReaction}
                onPress={() => showReactionPicker(msg)}
              >
                <Ionicons name="add" size={14} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.channelInfo} onPress={handleChannelInfo}>
          <View style={[styles.channelIcon, { backgroundColor: MOCK_CHANNEL.color + '20' }]}>
            <Ionicons name={MOCK_CHANNEL.icon as any} size={18} color={MOCK_CHANNEL.color} />
          </View>
          <View style={styles.channelDetails}>
            <View style={styles.channelNameRow}>
              <Text style={styles.channelName}>#{MOCK_CHANNEL.name}</Text>
              {MOCK_CHANNEL.isPrivate && (
                <Ionicons name="lock-closed" size={14} color={theme.colors.textSubtle} />
              )}
            </View>
            <Text style={styles.channelMembers}>{MOCK_CHANNEL.memberCount} members</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton} onPress={handleChannelInfo}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {MOCK_MESSAGES.map((msg, index) => renderMessage(msg, index))}
        </ScrollView>

        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <View style={[styles.replyLine, { backgroundColor: accentHex }]} />
              <View style={styles.replyingToContent}>
                <Text style={styles.replyingToLabel}>Replying to {replyingTo.sender.name}</Text>
                <Text style={styles.replyingToText} numberOfLines={1}>
                  {replyingTo.content}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelReplyButton}
                onPress={() => setReplyingTo(null)}
              >
                <Ionicons name="close" size={18} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add-circle-outline" size={24} color={theme.colors.textSubtle} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder={`Message #${MOCK_CHANNEL.name}`}
              placeholderTextColor={theme.colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: message.trim() ? accentHex : theme.colors.surfaceSubtle },
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Ionicons
                name="send"
                size={18}
                color={message.trim() ? '#fff' : theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  channelInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  channelIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  channelDetails: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  channelMembers: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageSender: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  messageTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  messageBubble: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    marginLeft: 40,
  },
  messageBubbleGrouped: {
    marginTop: -10,
  },
  replyPreview: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  replyLine: {
    width: 3,
    borderRadius: 2,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  replyContent: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  messageContent: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  attachments: {
    marginTop: 8,
    gap: 6,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  addReaction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.base,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
    gap: 8,
  },
  replyingToContent: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  replyingToText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  cancelReplyButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

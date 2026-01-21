import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../src/store/authStore';
import { useChatStore } from '../../../src/store/chatStore';
import { useConversation, useMessages, useSendMessage, useAddReaction } from '../../../src/hooks/useConversations';
import { BackgroundPicker, ChatBackground, TypingIndicator } from '../../../src/components/chat';
import { LoadingSpinner, Avatar } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { Message } from '../../../src/types';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../../src/styles/theme';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuthStore();
  const { replyingTo, setReplyingTo, addTypingUser, typingUsers } = useChatStore();
  const queryClient = useQueryClient();
  const { data: conversation } = useConversation(conversationId || '', user?.id || '');
  const { data: messages, isLoading, error: messagesError } = useMessages(conversationId || '');
  const sendMessageMutation = useSendMessage();
  const addReactionMutation = useAddReaction();
  const flatListRef = useRef<FlatList>(null);
  const typingChannelRef = useRef<any>(null);

  const [showActions, setShowActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showConversationSettings, setShowConversationSettings] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const [typingIndicatorsEnabled, setTypingIndicatorsEnabled] = useState(true);
  const [muteConversation, setMuteConversation] = useState(false);
  const [pinConversation, setPinConversation] = useState(false);

  const conversationTypingUsers = typingUsers.get(conversationId || '') || [];
  const quickEmojis = ['😀', '😂', '😍', '🤔', '👍', '🎉', '🔥', '💯', '✨', '❤️'];
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

  // Scroll to bottom when messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  // Real-time subscriptions
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase.channel('room:' + conversationId);
    typingChannelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== user.id) {
          addTypingUser(conversationId, {
            conversation_id: conversationId,
            user_id: payload.payload.userId,
            user: payload.payload.user,
            timestamp: Date.now(),
          });
        }
      })
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'conversation_id=eq.' + conversationId
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
        }
      )
      .subscribe();

    return () => {
      typingChannelRef.current = null;
      channel.unsubscribe();
    };
  }, [conversationId, user, queryClient]);

  useEffect(() => {
    if (!messagesError) return;
    console.error('Messages fetch error:', messagesError);
    Alert.alert('Messages error', 'Failed to load messages. Pull to refresh or try again.');
  }, [messagesError]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !user || !conversationId) return;

    const content = messageText.trim();
    setMessageText('');
    setReplyingTo(null);

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        content,
        senderId: user.id,
        replyToId: replyingTo?.id,
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Error sending message:', error);
      Alert.alert('Error', message);
      setMessageText(content);
    }
  }, [messageText, user, conversationId, replyingTo, sendMessageMutation]);

  const handleTyping = useCallback(() => {
    if (!user || !conversationId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const channel = typingChannelRef.current;
    if (!channel) return;

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
        },
      },
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [user, conversationId]);

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      await addReactionMutation.mutateAsync({
        messageId,
        userId: user.id,
        emoji,
      });
      setShowActions(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, [user, addReactionMutation]);

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Handle image upload
      console.log('Image selected:', result.assets[0].uri);
    }
  }, []);

  const handlePickFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({});

    if (result.type === 'success') {
      console.log('File selected:', result.uri);
    }
  }, []);

  const formatDebugValue = (value: any, maxLength = 200) => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') {
      return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
    }
    try {
      const serialized = JSON.stringify(value);
      return serialized.length > maxLength ? `${serialized.slice(0, maxLength)}...` : serialized;
    } catch {
      const fallback = String(value);
      return fallback.length > maxLength ? `${fallback.slice(0, maxLength)}...` : fallback;
    }
  };

  const hasVisibleText = (value: string) =>
    value.replace(/[\s\u200B-\u200D\uFEFF]/g, '').length > 0;

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.sender_id === user?.id;
    const prevMessage = index > 0 && messages ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.sender_id !== item.sender_id;
    const hasReactions = item.reactions && item.reactions.length > 0;
    const displayContent =
      (typeof item.content === 'string' ? item.content : '') ||
      (typeof item.metadata === 'string'
        ? item.metadata
        : typeof item.metadata?.content === 'string'
          ? item.metadata.content
          : typeof item.metadata?.text === 'string'
            ? item.metadata.text
            : '') ||
      (typeof item.encrypted_content === 'string' ? item.encrypted_content : '') ||
      '';
    const showDebug = !hasVisibleText(displayContent);

    const debugPayload = showDebug
      ? `id=${item.id}
type=${item.type}
content=${formatDebugValue(item.content)}
content_len=${typeof item.content === 'string' ? item.content.length : 'n/a'}
encrypted=${formatDebugValue(item.encrypted_content)}
metadata=${formatDebugValue(item.metadata)}`
      : '';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => {
          setSelectedMessage(item);
          setShowActions(true);
        }}
        style={[styles.messageContainer, isOwn && styles.messageContainerOwn]}
      >
        <View style={styles.messageRow}>
          {!isOwn && showAvatar && (
            <Avatar
              uri={item.sender.avatar_url}
              name={item.sender.display_name || item.sender.username}
              size="sm"
            />
          )}
          {!isOwn && !showAvatar && <View style={styles.avatarSpacer} />}

          <View style={[styles.messageBubbleContainer, isOwn && styles.messageBubbleContainerOwn]}>
            {item.reply_to && (
              <View style={styles.replyPreview}>
                <View style={styles.replyLine} />
                <View style={styles.replyContent}>
                  <Text style={styles.replyAuthor}>
                    {item.reply_to.sender.display_name || item.reply_to.sender.username}
                  </Text>
                  <Text style={styles.replyText} numberOfLines={1}>
                    {item.reply_to.content}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.messageBubble, isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther]}>
              {!isOwn && showAvatar && (
                <Text style={styles.senderName}>
                  {item.sender.display_name || item.sender.username}
                </Text>
              )}
              {showDebug ? (
                <Text style={styles.debugText}>
                  {debugPayload}
                </Text>
              ) : (
                <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : styles.messageTextOther]}>
                  {displayContent}
                </Text>
              )}
              <View style={styles.messageFooter}>
                <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {isOwn && readReceiptsEnabled && (
                  <Ionicons
                    name={item.read_by.length > 1 ? 'checkmark-done' : 'checkmark'}
                    size={14}
                    color={item.read_by.length > 1 ? theme.colors.accent : theme.colors.textMuted}
                  />
                )}
            </View>
            </View>

            {hasReactions && (
              <View style={styles.reactionsContainer}>
                {Object.entries(
                  item.reactions.reduce((acc: Record<string, number>, r) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([emoji, count]) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => handleReaction(item.id, emoji)}
                    style={styles.reactionBadge}
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
  }, [user, messages, handleReaction]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) return null;

  const otherUser = conversation?.participants?.[0];
  const isGroup = conversation?.type === 'group';
  const memberCount = isGroup ? (conversation?.participants?.length || 0) + 1 : 0;
  const headerTitle = isGroup
    ? conversation?.name || 'Group Chat'
    : otherUser?.display_name || otherUser?.username || 'Chat';
  const headerSubtitle = conversationTypingUsers.length > 0
    ? 'typing...'
    : isGroup
      ? `${memberCount} member${memberCount === 1 ? '' : 's'}`
      : 'Online';

  return (
    <ChatBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={100}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerInfo}>
            <Avatar
              uri={isGroup ? conversation?.avatar_url : otherUser?.avatar_url}
              name={headerTitle}
              size="md"
            />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
              <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => setShowBackgroundPicker(true)}
            >
              <Ionicons name="color-palette" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="videocam" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="call" size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => setShowConversationSettings(true)}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages || []}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Typing Indicator */}
        {typingIndicatorsEnabled && conversationTypingUsers.length > 0 && (
          <TypingIndicator
            usernames={conversationTypingUsers.map(t => t.user?.display_name || t.user?.username || 'User')}
          />
        )}

        {/* Reply Preview */}
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <View style={styles.replyingToContent}>
              <Text style={styles.replyingToLabel}>
                Replying to {replyingTo.sender.display_name || replyingTo.sender.username}
              </Text>
              <Text style={styles.replyingToMessage} numberOfLines={1}>
                {replyingTo.content}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              style={styles.inputAction}
            >
              <Ionicons name="happy-outline" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.textInputWrapper}>
              <TextInput
                value={messageText}
                onChangeText={(text) => {
                  setMessageText(text);
                  handleTyping();
                }}
                placeholder="Message..."
                placeholderTextColor={theme.colors.textSubtle}
                multiline
                maxLength={2000}
                style={styles.textInput}
              />
            </View>

            <TouchableOpacity onPress={handlePickImage} style={styles.inputAction}>
              <Ionicons name="camera-outline" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePickFile} style={styles.inputAction}>
              <Ionicons name="attach-outline" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
              style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            >
              <Ionicons
                name="send"
                size={18}
                color={messageText.trim() ? theme.colors.base : theme.colors.textSubtle}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Emoji Bar */}
          {showEmojiPicker && (
            <View style={styles.emojiPickerContainer}>
              <View style={styles.emojiPicker}>
                {quickEmojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      setMessageText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    style={styles.emojiButton}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Message Actions Modal */}
        <Modal
          visible={showActions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActions(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowActions(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.actionsModal}>
              <View style={styles.quickReactionsContainer}>
                {reactionEmojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      if (selectedMessage) {
                        handleReaction(selectedMessage.id, emoji);
                      }
                    }}
                    style={styles.quickReaction}
                  >
                    <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(selectedMessage);
                    setShowActions(false);
                  }}
                  style={styles.actionButton}
                >
                  <Ionicons name="arrow-undo" size={22} color={theme.colors.accent} />
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="copy-outline" size={22} color={theme.colors.textMuted} />
                  <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={22} color={theme.colors.textMuted} />
                  <Text style={styles.actionText}>Forward</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="bookmark-outline" size={22} color={theme.colors.warning} />
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>

                {selectedMessage?.sender_id === user?.id && (
                  <>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="create-outline" size={22} color={theme.colors.textMuted} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
        <Modal
          visible={showConversationSettings}
          transparent
          animationType="slide"
          onRequestClose={() => setShowConversationSettings(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowConversationSettings(false)}
            style={styles.modalOverlay}
          >
            <TouchableOpacity activeOpacity={1} style={styles.settingsSheet}>
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>Conversation Settings</Text>
                <TouchableOpacity onPress={() => setShowConversationSettings(false)}>
                  <Ionicons name="close" size={22} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Read Receipts</Text>
                <Switch
                  value={readReceiptsEnabled}
                  onValueChange={setReadReceiptsEnabled}
                  trackColor={{ false: theme.colors.surfaceSubtle, true: theme.colors.accent }}
                  thumbColor={theme.colors.white}
                />
              </View>

              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Typing Indicators</Text>
                <Switch
                  value={typingIndicatorsEnabled}
                  onValueChange={setTypingIndicatorsEnabled}
                  trackColor={{ false: theme.colors.surfaceSubtle, true: theme.colors.accent }}
                  thumbColor={theme.colors.white}
                />
              </View>

              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Mute Notifications</Text>
                <Switch
                  value={muteConversation}
                  onValueChange={setMuteConversation}
                  trackColor={{ false: theme.colors.surfaceSubtle, true: theme.colors.accent }}
                  thumbColor={theme.colors.white}
                />
              </View>

              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Pin Conversation</Text>
                <Switch
                  value={pinConversation}
                  onValueChange={setPinConversation}
                  trackColor={{ false: theme.colors.surfaceSubtle, true: theme.colors.accent }}
                  thumbColor={theme.colors.white}
                />
              </View>

              <TouchableOpacity
                style={styles.settingsAction}
                onPress={() => {
                  setShowConversationSettings(false);
                  setShowBackgroundPicker(true);
                }}
              >
                <Text style={styles.settingsActionText}>Change Chat Background</Text>
                <Ionicons name="color-palette-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
      </SafeAreaView>
      <BackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
      />
    </ChatBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 16,
    backgroundColor: theme.colors.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  messageContainerOwn: {
    alignSelf: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarSpacer: {
    width: 40,
  },
  messageBubbleContainer: {
    flex: 1,
  },
  messageBubbleContainerOwn: {
    alignItems: 'flex-end',
  },
  replyPreview: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    padding: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  replyLine: {
    width: 3,
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 14,
    maxWidth: '100%',
    borderWidth: 1,
  },
  messageBubbleOwn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.borderStrong,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: theme.colors.white,
  },
  messageTextOther: {
    color: theme.colors.textPrimary,
  },
  debugText: {
    fontSize: 11,
    color: theme.colors.warning,
    lineHeight: 14,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  timestampOwn: {
    color: 'rgba(248, 250, 252, 0.8)',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 12,
  },
  replyingToContent: {
    flex: 1,
    marginRight: 12,
  },
  replyingToLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: 2,
  },
  replyingToMessage: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  inputContainer: {
    backgroundColor: theme.colors.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  inputAction: {
    padding: 8,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  textInput: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  sendButtonInactive: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  emojiPickerContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: 12,
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  emojiButton: {
    padding: 8,
  },
  emojiText: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  actionsModal: {
    backgroundColor: theme.colors.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: 32,
  },
  quickReactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  quickReaction: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickReactionEmoji: {
    fontSize: 24,
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  settingsSheet: {
    backgroundColor: theme.colors.base,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingsLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  settingsAction: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingsActionText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});

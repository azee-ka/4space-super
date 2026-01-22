import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../src/store/authStore';
import { DEFAULT_CONVERSATION_SETTINGS, useChatStore } from '../../../src/store/chatStore';
import { useMessagePreferencesStore } from '../../../src/store/messagePreferencesStore';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { useConversation, useMessages, useSendMessage, useAddReaction } from '../../../src/hooks/useConversations';
import { ChatBackground, TypingIndicator, BackgroundPicker } from '../../../src/components/chat';
import { LoadingSpinner, Avatar } from '../../../src/components/ui';
import { supabase } from '../../../src/lib/supabase';
import { Message } from '../../../src/types';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../../src/styles/theme';
import { useChatCustomizationStore } from '../../../src/store/chatCustomizationStore';
import { DEFAULT_CHAT_THEME, getChatThemeById } from '../../../src/styles/chatThemes';

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    label: 'Smileys',
    emojis: ['😀', '😃', '😅', '😂', '🤣', '😊', '😍', '🤩', '😘', '😎'],
  },
  {
    id: 'gestures',
    label: 'Gestures',
    emojis: ['👍', '👏', '🙏', '🤝', '👌', '✌️', '🤟', '🤘', '🤙', '👋'],
  },
  {
    id: 'hearts',
    label: 'Hearts',
    emojis: ['❤️', '💛', '💚', '💙', '💜', '🧡', '🤎', '💖', '💘', '💗'],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    emojis: ['✨', '🔥', '⚡', '🌟', '🎉', '💥', '🌀', '🎯', '🌈', '💫'],
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { replyingTo, setReplyingTo, addTypingUser, typingUsers, conversationSettings } = useChatStore();
  const { pinnedMessages, savedMessages, setPinnedMessage, toggleSavedMessage } = useMessagePreferencesStore();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const queryClient = useQueryClient();
  const { data: conversation } = useConversation(conversationId || '', user?.id || '');
  const { data: messages, isLoading, error: messagesError } = useMessages(conversationId || '');
  const sendMessageMutation = useSendMessage();
  const addReactionMutation = useAddReaction();
  const flatListRef = useRef<FlatList>(null);
  const typingChannelRef = useRef<any>(null);
  const didInitialScrollRef = useRef(false);

  const [showActions, setShowActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(EMOJI_CATEGORIES[0].id);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showComposerTools, setShowComposerTools] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showJump, setShowJump] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSettings = conversationId
    ? conversationSettings[conversationId] || DEFAULT_CONVERSATION_SETTINGS
    : DEFAULT_CONVERSATION_SETTINGS;
  const readReceiptsEnabled = currentSettings.readReceipts;
  const typingIndicatorsEnabled = currentSettings.typingIndicators;

  const conversationTypingUsers = typingUsers.get(conversationId || '') || [];
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

  // Select raw data instead of computed methods to avoid infinite loops
  const conversationCustomizations = useChatCustomizationStore((state) => state.conversationCustomizations);
  const chatTheme = useMemo(() => {
    if (!conversationId) {
      return { ...DEFAULT_CHAT_THEME, density: 'cozy' as const };
    }
    const customization = conversationCustomizations[conversationId];
    const base = getChatThemeById(customization?.themeId);
    return { ...base, density: customization?.density || base.density || 'cozy' as const };
  }, [conversationId, conversationCustomizations]);

  const showCallControls = useMemo(() => {
    if (!conversationId) return true;
    const customization = conversationCustomizations[conversationId];
    return customization?.enableCallControls !== false;
  }, [conversationId, conversationCustomizations]);
  const messageSpacing =
    chatTheme.density === 'compact'
      ? 6
      : chatTheme.density === 'spacious'
        ? 18
        : 12;

  const pinnedMessageId = conversationId ? pinnedMessages[conversationId] : null;
  const savedMessageIds = conversationId ? savedMessages[conversationId] || [] : [];

  const displayMessages = useMemo(() => {
    if (!messages) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!searchOpen || !query) return messages;

    return messages.filter((msg) => {
      const content = msg.content || '';
      return content.toLowerCase().includes(query);
    });
  }, [messages, searchOpen, searchQuery]);

  const pinnedMessage = useMemo(() => {
    if (!pinnedMessageId || !messages) return null;
    return messages.find((msg) => msg.id === pinnedMessageId) || null;
  }, [messages, pinnedMessageId]);

  useEffect(() => {
    if (!conversationId) return;
    didInitialScrollRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (messages && messages.length > 0 && !didInitialScrollRef.current) {
      didInitialScrollRef.current = true;
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 0);
    }
  }, [messages?.length]);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        tabBarStyle: { display: 'none' },
      });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            backgroundColor: theme.colors.base,
            borderTopColor: theme.colors.base,
            borderTopWidth: 0,
            height: 92,
            paddingBottom: 32,
            paddingTop: 10,
          },
        });
      };
    }, [navigation])
  );

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
          filter: 'conversation_id=eq.' + conversationId,
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
  }, [messageText, user, conversationId, replyingTo, sendMessageMutation, setReplyingTo]);

  const handleTyping = useCallback(() => {
    if (!typingIndicatorsEnabled) return;
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
  }, [user, conversationId, typingIndicatorsEnabled]);

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
      Alert.alert('Image ready', 'Image upload is coming soon.');
    }
  }, []);

  const handlePickFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({});

    if (result.type === 'success') {
      Alert.alert('File ready', 'File sharing is coming soon.');
    }
  }, []);

  const handleShareMessage = useCallback(async (message: Message) => {
    if (!message.content) return;
    try {
      await Share.share({ message: message.content });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to open the share sheet.');
    }
  }, []);

  const handleDeleteMessage = useCallback(async (message: Message) => {
    try {
      await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', message.id);

      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      setShowActions(false);
    } catch (error) {
      Alert.alert('Delete failed', 'Could not delete the message.');
    }
  }, [conversationId, queryClient]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setShowJump(distanceFromBottom > 140);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const scrollToPinned = () => {
    if (!pinnedMessageId || !messages) return;
    const index = messages.findIndex((msg) => msg.id === pinnedMessageId);
    if (index < 0) return;

    flatListRef.current?.scrollToIndex({ index, viewPosition: 0.4, animated: true });
  };

  const hasVisibleText = (value: string) =>
    value.replace(/[\s\u200B-\u200D\uFEFF]/g, '').length > 0;

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.sender_id === user?.id;
    const prevMessage = index > 0 && displayMessages ? displayMessages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.sender_id !== item.sender_id;
    const hasReactions = item.reactions && item.reactions.length > 0;
    const displayContent = item.content || '';
    const showDebug = !hasVisibleText(displayContent);
    const isSaved = savedMessageIds.includes(item.id);
    const isPinned = pinnedMessageId === item.id;
    const bubbleColorStyle = { backgroundColor: isOwn ? chatTheme.sentBubbleColor : chatTheme.receivedBubbleColor };
    const bubbleTextColor = isOwn ? chatTheme.sentTextColor : chatTheme.receivedTextColor;

    const prevDate = prevMessage ? new Date(prevMessage.created_at) : null;
    const currentDate = new Date(item.created_at);
    const showDateSeparator =
      !prevDate ||
      prevDate.toDateString() !== currentDate.toDateString();

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => {
            setSelectedMessage(item);
            setShowActions(true);
          }}
          style={[styles.messageContainer, { marginBottom: messageSpacing }, isOwn && styles.messageContainerOwn]}
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

            <View
              style={[
                styles.messageBubble,
                isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                bubbleColorStyle,
                { borderRadius: chatTheme.bubbleRadius },
              ]}
            >
                {!isOwn && showAvatar && (
                  <Text style={styles.senderName}>
                    {item.sender.display_name || item.sender.username}
                  </Text>
                )}
                {showDebug ? (
                  <Text style={styles.debugText}>
                    Unsupported content
                  </Text>
                ) : (
                  <Text style={[styles.messageText, { color: bubbleTextColor }]}>
                    {displayContent}
                  </Text>
                )}
                <View style={styles.messageFooter}>
                  <View style={styles.messageFlags}>
                    {isPinned && <Ionicons name="pin" size={12} color="#f97316" />}
                    {isSaved && <Ionicons name="bookmark" size={12} color="#22d3ee" />}
                  </View>
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
      </View>
    );
  }, [user, displayMessages, handleReaction, readReceiptsEnabled, pinnedMessageId, savedMessageIds]);

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
      <View style={[styles.themeLayer, { backgroundColor: chatTheme.backgroundColor }]} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={50}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerInfo}
              onPress={() => {
                if (conversationId) {
                  router.push(`/messages/${conversationId}/settings` as any);
                }
              }}
            >
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
              {showCallControls && (
                <>
                  <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="videocam" size={18} color="#a855f7" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="call" size={18} color="#34d399" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {searchOpen && (
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={theme.colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search in conversation"
                placeholderTextColor={theme.colors.textSubtle}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.textSubtle} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {pinnedMessage && (
            <TouchableOpacity style={styles.pinnedBar} onPress={scrollToPinned}>
              <Ionicons name="pin" size={14} color="#f97316" />
              <Text style={styles.pinnedText} numberOfLines={1}>
                {pinnedMessage.content}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          )}

          <View style={styles.focusRow}>
            {['Media', 'Links', 'Files', 'Pinned'].map((label) => (
              <TouchableOpacity
                key={label}
                style={styles.focusChip}
                onPress={() => {
                  if (conversationId) {
                    router.push(`/messages/${conversationId}/settings` as any);
                  }
                }}
              >
                <Text style={styles.focusChipText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index, animated: true });
              }, 150);
            }}
          />

          {typingIndicatorsEnabled && conversationTypingUsers.length > 0 && (
            <TypingIndicator
              usernames={conversationTypingUsers.map(t => t.user?.display_name || t.user?.username || 'User')}
            />
          )}

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
                <Ionicons name="close-circle" size={22} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {showJump && (
            <TouchableOpacity style={styles.jumpButton} onPress={scrollToBottom}>
              <Ionicons name="chevron-down" size={18} color={theme.colors.base} />
            </TouchableOpacity>
          )}

          <View style={styles.inputContainer}>
            {showComposerTools && (
              <View style={styles.toolsRow}>
                <TouchableOpacity style={styles.toolButton} onPress={handlePickImage}>
                  <Ionicons name="image-outline" size={20} color="#22d3ee" />
                  <Text style={styles.toolText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolButton} onPress={handlePickFile}>
                  <Ionicons name="attach-outline" size={20} color="#f97316" />
                  <Text style={styles.toolText}>File</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => Alert.alert('Location', 'Location sharing is coming soon.')}
                >
                  <Ionicons name="location-outline" size={20} color="#34d399" />
                  <Text style={styles.toolText}>Location</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => Alert.alert('Poll', 'Polls are coming soon.')}
                >
                  <Ionicons name="bar-chart-outline" size={20} color="#a855f7" />
                  <Text style={styles.toolText}>Poll</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => setShowComposerTools((prev) => !prev)}
                style={styles.inputAction}
              >
                <Ionicons name={showComposerTools ? 'close' : 'add'} size={22} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                style={styles.inputAction}
              >
                <Ionicons name="happy-outline" size={22} color={theme.colors.textMuted} />
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

          </View>

          <Modal
            visible={showEmojiPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEmojiPicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowEmojiPicker(false)}
              style={styles.modalOverlay}
            >
              <View style={styles.emojiModal}>
                <View style={styles.emojiModalHeader}>
                  <Text style={styles.emojiModalTitle}>Emoji picker</Text>
                  <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                    <Ionicons name="close" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.emojiCategories}
                >
                  {EMOJI_CATEGORIES.map((category) => {
                    const isActive = category.id === activeEmojiCategory;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[styles.emojiCategory, isActive && styles.emojiCategoryActive]}
                        onPress={() => setActiveEmojiCategory(category.id)}
                      >
                        <Text
                          style={[
                            styles.emojiCategoryLabel,
                            isActive && styles.emojiCategoryLabelActive,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <ScrollView contentContainerStyle={styles.emojiGrid}>
                  {(EMOJI_CATEGORIES.find((cat) => cat.id === activeEmojiCategory)?.emojis || []).map(
                    (emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={styles.emojiButton}
                        onPress={() => {
                          setMessageText((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

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
                    <Ionicons name="arrow-undo" size={22} color={accentHex} />
                    <Text style={styles.actionText}>Reply</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (selectedMessage && conversationId) {
                        const nextPinned = selectedMessage.id === pinnedMessageId ? null : selectedMessage.id;
                        setPinnedMessage(conversationId, nextPinned);
                      }
                      setShowActions(false);
                    }}
                    style={styles.actionButton}
                  >
                    <Ionicons name="pin" size={22} color="#f97316" />
                    <Text style={styles.actionText}>
                      {selectedMessage?.id === pinnedMessageId ? 'Unpin' : 'Pin'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (selectedMessage && conversationId) {
                        toggleSavedMessage(conversationId, selectedMessage.id);
                      }
                      setShowActions(false);
                    }}
                    style={styles.actionButton}
                  >
                    <Ionicons name="bookmark" size={22} color="#22d3ee" />
                    <Text style={styles.actionText}>
                      {selectedMessage && savedMessageIds.includes(selectedMessage.id) ? 'Unsave' : 'Save'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (selectedMessage) {
                        handleShareMessage(selectedMessage);
                      }
                      setShowActions(false);
                    }}
                    style={styles.actionButton}
                  >
                    <Ionicons name="share-outline" size={22} color={theme.colors.textMuted} />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>

                  {selectedMessage?.sender_id === user?.id && (
                    <TouchableOpacity
                      onPress={() => {
                        if (selectedMessage) {
                          handleDeleteMessage(selectedMessage);
                        }
                      }}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
  themeLayer: {
    ...StyleSheet.absoluteFillObject,
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
    gap: 8,
  },
  headerAction: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  pinnedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pinnedText: {
    color: theme.colors.textMuted,
    flex: 1,
    fontSize: 12,
  },
  focusRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: theme.colors.base,
  },
  focusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  focusChipText: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  dateSeparator: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dateSeparatorText: {
    color: theme.colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  messageContainer: {
    marginBottom: 0,
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
    maxWidth: 280,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageBubbleOwn: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
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
  debugText: {
    fontSize: 12,
    color: theme.colors.warning,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  messageFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  jumpButton: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: theme.colors.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 12,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  toolText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  inputAction: {
    padding: 6,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
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
  emojiModal: {
    backgroundColor: theme.colors.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '70%',
  },
  emojiModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  emojiModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  emojiCategories: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  emojiCategory: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  emojiCategoryActive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  emojiCategoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  emojiCategoryLabelActive: {
    color: theme.colors.textPrimary,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 8,
  },
  emojiButton: {
    padding: 6,
  },
  emojiText: {
    fontSize: 26,
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
    paddingVertical: 12,
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
});

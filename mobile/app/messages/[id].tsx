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
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { DEFAULT_CONVERSATION_SETTINGS, useChatStore } from '../../src/store/chatStore';
import { useMessagePreferencesStore } from '../../src/store/messagePreferencesStore';
import { useThemeStore } from '../../src/store/themeStore';
import { getAccentColorHex } from '../../src/utils/themeUtils';
import { useConversation, useMessages, useSendMessage, useAddReaction } from '../../src/hooks/useConversations';
import { TypingIndicator, BackgroundPicker } from '../../src/components/chat';
import { LoadingSpinner, Avatar } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { Message } from '../../src/types';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../src/styles/theme';
import { useChatCustomizationStore } from '../../src/store/chatCustomizationStore';
import { DEFAULT_CHAT_THEME, getChatThemeById } from '../../src/styles/chatThemes';


export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuthStore();
  const { replyingTo, setReplyingTo, addTypingUser, typingUsers, conversationSettings } = useChatStore();
  const { pinnedMessages, savedMessages, setPinnedMessage, toggleSavedMessage } = useMessagePreferencesStore();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const queryClient = useQueryClient();
  const { data: conversation } = useConversation(conversationId || '', user?.id || '');
  const {
    data: messagePages,
    isLoading,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId || '');
  const sendMessageMutation = useSendMessage();
  const addReactionMutation = useAddReaction();
  const flatListRef = useRef<FlatList>(null);
  const typingChannelRef = useRef<any>(null);

  const [showActions, setShowActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showJump, setShowJump] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    return {
      ...base,
      sentBubbleColor: customization?.sentBubbleColor || base.sentBubbleColor,
      receivedBubbleColor: customization?.receivedBubbleColor || base.receivedBubbleColor,
      sentTextColor: customization?.sentTextColor || base.sentTextColor,
      receivedTextColor: customization?.receivedTextColor || base.receivedTextColor,
      bubbleRadius: customization?.bubbleRadius ?? base.bubbleRadius,
      messageTextSize: customization?.messageTextSize ?? 15,
      density: customization?.density || base.density || 'cozy' as const,
    };
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
  const messageFontSize = chatTheme.messageTextSize ?? 15;
  const messageLineHeight = Math.round(messageFontSize * 1.35);

  const pinnedMessageId = conversationId ? pinnedMessages[conversationId] : null;
  const savedMessageIds = conversationId ? savedMessages[conversationId] || [] : [];

  const messages = useMemo(
    () => messagePages?.pages.flat() ?? [],
    [messagePages]
  );

  const displayMessages = useMemo(() => {
    if (!messages.length) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!searchOpen || !query) return messages;

    return messages.filter((msg) => {
      const content = msg.content || '';
      return content.toLowerCase().includes(query);
    });
  }, [messages, searchOpen, searchQuery]);

  const renderedMessages = useMemo(
    () => displayMessages,
    [displayMessages]
  );

  const pinnedMessage = useMemo(() => {
    if (!pinnedMessageId || !messages.length) return null;
    return messages.find((msg) => msg.id === pinnedMessageId) || null;
  }, [messages, pinnedMessageId]);


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
      const asset = result.assets[0];
      try {
        // Upload to Supabase storage
        const fileExt = asset.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `chat-images/${conversationId}/${fileName}`;

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(filePath, blob, {
            contentType: asset.type || 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('chat-media')
          .getPublicUrl(filePath);

        // Send message with image
        await sendMessageMutation.mutateAsync({
          conversationId: conversationId!,
          content: asset.fileName || 'Image',
          senderId: user!.id,
          fileUrl: urlData.publicUrl,
          fileName: asset.fileName || fileName,
          fileType: 'image',
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('Upload failed', 'Failed to upload image. Please try again.');
      }
    }
  }, [conversationId, user, sendMessageMutation]);

  const handlePickFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({});

    if (result.type === 'success') {
      try {
        // Upload file to Supabase storage
        const fileName = result.name;
        const filePath = `chat-files/${conversationId}/${Date.now()}_${fileName}`;

        const response = await fetch(result.uri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(filePath, blob, {
            contentType: result.mimeType || 'application/octet-stream',
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('chat-media')
          .getPublicUrl(filePath);

        // Send message with file
        await sendMessageMutation.mutateAsync({
          conversationId: conversationId!,
          content: fileName,
          senderId: user!.id,
          fileUrl: urlData.publicUrl,
          fileName: fileName,
          fileType: 'file',
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('File upload error:', error);
        Alert.alert('Upload failed', 'Failed to upload file. Please try again.');
      }
    }
  }, [conversationId, user, sendMessageMutation]);

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
    const distanceFromBottom = contentOffset.y;
    const distanceFromTop = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const shouldShow = distanceFromBottom > 140 && distanceFromTop > 0;
    setShowJump(shouldShow);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const scrollToPinned = () => {
    if (!pinnedMessageId || !messages.length) return;
    const index = renderedMessages.findIndex((msg) => msg.id === pinnedMessageId);
    if (index < 0) return;

    flatListRef.current?.scrollToIndex({ index, viewPosition: 0.4, animated: true });
  };

  const hasVisibleText = (value: string) =>
    value.replace(/[\s\u200B-\u200D\uFEFF]/g, '').length > 0;

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.sender_id === user?.id;
    const prevMessage = renderedMessages ? renderedMessages[index + 1] : null;
    const showAvatar = !prevMessage || prevMessage.sender_id !== item.sender_id;
    const hasReactions = item.reactions && item.reactions.length > 0;
    const displayContent = item.content || '';
    const isSaved = savedMessageIds.includes(item.id);
    const isPinned = pinnedMessageId === item.id;
    const bubbleColorStyle = { backgroundColor: isOwn ? chatTheme.sentBubbleColor : chatTheme.receivedBubbleColor };
    const bubbleTextColor = isOwn ? chatTheme.sentTextColor : chatTheme.receivedTextColor;
    const bubbleGradient = isOwn ? chatTheme.sentBubbleGradient : chatTheme.receivedBubbleGradient;
    const useGradient =
      chatTheme.bubbleStyle === 'gradient' &&
      Array.isArray(bubbleGradient) &&
      bubbleGradient.length === 2;

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
          {!isOwn && showAvatar && (
            <View style={styles.avatarRow}>
              <Avatar
                uri={item.sender.avatar_url}
                name={item.sender.display_name || item.sender.username}
                size="sm"
              />
            </View>
          )}

          <View style={styles.messageRow}>
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

            {useGradient ? (
              <LinearGradient
                colors={bubbleGradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.messageBubble,
                  isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                  { borderRadius: chatTheme.bubbleRadius },
                ]}
              >
                {!isOwn && showAvatar && (
                  <Text style={styles.senderName}>
                    {item.sender.display_name || item.sender.username}
                  </Text>
                )}
                {item.type === 'image' && item.attachments && item.attachments[0] && (
                  <TouchableOpacity onPress={() => setSelectedImage(item.attachments[0]?.url ?? null)}>
                    <Image
                      source={{ uri: item.attachments[0]?.url ?? null }}
                      style={styles.messageImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </TouchableOpacity>
                )}
                {item.type === 'file' && item.attachments && item.attachments[0] && (
                  <TouchableOpacity style={styles.messageFile} onPress={() => Linking.openURL(item.attachments[0].url)}>
                    <Ionicons name="document-outline" size={24} color={bubbleTextColor} />
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, { color: bubbleTextColor }]} numberOfLines={1}>
                        {item.attachments[0].name}
                      </Text>
                      <Text style={[styles.fileSize, { color: bubbleTextColor }]}>File</Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={bubbleTextColor} />
                  </TouchableOpacity>
                )}
                {item.type === 'text' && (
                  <Text style={[styles.messageText, { color: bubbleTextColor, fontSize: messageFontSize, lineHeight: messageLineHeight }]}>
                    {displayContent}
                  </Text>
                )}
              </LinearGradient>
            ) : (
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
                {item.type === 'image' && item.attachments && item.attachments[0] && (
                  <TouchableOpacity onPress={() => setSelectedImage(item.attachments[0].url)}>
                    <Image
                      source={{ uri: item.attachments[0].url }}
                      style={styles.messageImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </TouchableOpacity>
                )}
                {item.type === 'file' && item.attachments && item.attachments[0] && (
                  <TouchableOpacity style={styles.messageFile} onPress={() => Linking.openURL(item.attachments[0].url)}>
                    <Ionicons name="document-outline" size={24} color={bubbleTextColor} />
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, { color: bubbleTextColor }]} numberOfLines={1}>
                        {item.attachments[0].name}
                      </Text>
                      <Text style={[styles.fileSize, { color: bubbleTextColor }]}>File</Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={bubbleTextColor} />
                  </TouchableOpacity>
                )}
                {item.type === 'text' && (
                  <Text style={[styles.messageText, { color: bubbleTextColor, fontSize: messageFontSize, lineHeight: messageLineHeight }]}>
                    {displayContent}
                  </Text>
                )}
              </View>
            )}

            <View style={[styles.messageFooter, isOwn && styles.messageFooterOwn]}>
              <View style={styles.messageFlags}>
                {isPinned && <Ionicons name="pin" size={12} color="#f97316" />}
                {isSaved && <Ionicons name="bookmark" size={12} color="#22d3ee" />}
              </View>
              <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {isOwn && readReceiptsEnabled && (
                <View style={styles.readReceipts}>
                  <Ionicons
                    name={item.read_by.length > 1 ? 'checkmark-done' : 'checkmark'}
                    size={12}
                    color={item.read_by.length > 1 ? '#34d399' : theme.colors.textMuted}
                  />
                  {item.read_by.length > 1 && (
                    <Ionicons
                      name="checkmark-done"
                      size={12}
                      color="#34d399"
                      style={{ marginLeft: -6 }}
                    />
                  )}
                </View>
              )}
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
  }, [user, renderedMessages, handleReaction, readReceiptsEnabled, pinnedMessageId, savedMessageIds]);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: chatTheme.backgroundColor }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -20 : 0}
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
              <TouchableOpacity style={styles.headerAction} onPress={() => {
                Alert.alert('Extensions', 'Chat extensions and settings - coming soon!');
              }}>
                <Ionicons name="grid-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
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
            data={renderedMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
            style={{ flex: 1 }}
            inverted
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.2}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index, animated: true });
              }, 150);
            }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.paginationLoader}>
                  <ActivityIndicator size="small" color={theme.colors.textSubtle} />
                </View>
              ) : null
            }
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

            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => setShowPlusMenu(true)}
                style={styles.inputAction}
              >
                <Ionicons name="add" size={22} color={theme.colors.textMuted} />
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

        </KeyboardAvoidingView>

    <BackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
      />


      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.imageViewerClose}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage! }}
            style={styles.imageViewerImage}
            contentFit="contain"
            transition={200}
          />
        </View>
      </Modal>
    </SafeAreaView>
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
  paginationLoader: {
    paddingVertical: 16,
    alignItems: 'center',
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
  },
  avatarRow: {
    marginBottom: 4,
    alignItems: 'flex-start',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleOwn: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  messageFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.7,
  },
  debugText: {
    fontSize: 12,
    color: theme.colors.warning,
  },
  debugText: {
    fontSize: 12,
    color: theme.colors.warning,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginHorizontal: 12,
  },
  messageFooterOwn: {
    justifyContent: 'flex-end',
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
  readReceipts: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
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
  plusMenu: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusMenuContent: {
    backgroundColor: theme.colors.base,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  plusMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    borderRadius: 12,
  },
  plusMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusMenuText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  imageViewerImage: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
  },
});
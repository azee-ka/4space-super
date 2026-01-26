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
  Animated,
  Easing,
  Keyboard,
  Pressable,
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
import { TypingIndicator, BackgroundPicker, GifPicker, PollCreator, LocationPicker, MessageOptionsModal, MediaViewer, AdvancedImageEditor, CameraPicker, ForwardMessageModal } from '../../src/components/chat';
import { PollBubble } from '../../src/components/chat/PollBubble';
import type { MessageOptions, MediaItem } from '../../src/components/chat';
import { LoadingSpinner, Avatar } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { Message } from '../../src/types';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { theme } from '../../src/styles/theme';
import { useChatCustomizationStore } from '../../src/store/chatCustomizationStore';
import { DEFAULT_CHAT_THEME, getChatThemeById } from '../../src/styles/chatThemes';
import { useChatBackgroundStore } from '../../src/store/chatBackgroundStore';
import { getChatBackgroundById } from '../../src/styles/chatBackgrounds';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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
  const inputTranslateAnim = useRef(new Animated.Value(0)).current;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showJump, setShowJump] = useState(false);
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [showViewerChrome, setShowViewerChrome] = useState(true);
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaMoreMenu, setShowMediaMoreMenu] = useState(false);
  const [mediaAspectRatios, setMediaAspectRatios] = useState<Record<string, number>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const plusMenuAnim = useRef(new Animated.Value(0)).current;
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [messageOptions, setMessageOptions] = useState<MessageOptions>({ viewOnce: false, timedDuration: 0 });
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<MediaItem | null>(null);
  const [showCameraPicker, setShowCameraPicker] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [signedAttachmentUrls, setSignedAttachmentUrls] = useState<Record<string, string>>({});
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const mediaViewerListRef = useRef<FlatList>(null);
  const maxBubbleWidth = Math.min(Dimensions.get('window').width * 0.78, 340);
  const screenHeight = Dimensions.get('window').height;

  const currentSettings = conversationId
    ? conversationSettings[conversationId] || DEFAULT_CONVERSATION_SETTINGS
    : DEFAULT_CONVERSATION_SETTINGS;
  const readReceiptsEnabled = currentSettings.readReceipts;
  const typingIndicatorsEnabled = currentSettings.typingIndicators;
  const showTimestamps = currentSettings.showTimestamps !== false;

  const conversationTypingUsers = typingUsers.get(conversationId || '') || [];
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];
  const plusMenuItems = [
    { key: 'photos', label: 'Photos', icon: 'image', tint: '#60a5fa' },
    { key: 'camera', label: 'Camera', icon: 'camera', tint: '#f97316' },
    { key: 'file', label: 'File', icon: 'document-text', tint: '#a78bfa' },
    { key: 'poll', label: 'Poll', icon: 'stats-chart', tint: '#34d399' },
    { key: 'location', label: 'Location', icon: 'location', tint: '#f87171' },
    { key: 'contact', label: 'Contact', icon: 'person-circle', tint: '#fbbf24' },
    { key: 'sticker', label: 'Sticker', icon: 'happy', tint: '#22d3ee' },
    { key: 'gif', label: 'GIF', icon: 'film', tint: '#fb7185' },
    { key: 'game', label: 'Games', icon: 'game-controller', tint: '#c084fc' },
    { key: 'extension', label: 'Extensions', icon: 'code-slash', tint: '#38bdf8' },
  ];

  // Select raw data instead of computed methods to avoid infinite loops
  const conversationCustomizations = useChatCustomizationStore((state) => state.conversationCustomizations);
  const { backgroundByConversation, customBackgroundUriByConversation } = useChatBackgroundStore();

  const chatTheme = useMemo(() => {
    if (!conversationId) {
      return { ...DEFAULT_CHAT_THEME, density: 'cozy' as const };
    }
    const customization = conversationCustomizations[conversationId];
    const base = getChatThemeById(customization?.themeId) || DEFAULT_CHAT_THEME;
    return {
      ...base,
      backgroundColor: base.backgroundColor,
      sentBubbleColor: customization?.sentBubbleColor || base.sentBubbleColor,
      receivedBubbleColor: customization?.receivedBubbleColor || base.receivedBubbleColor,
      sentTextColor: customization?.sentTextColor || base.sentTextColor,
      receivedTextColor: customization?.receivedTextColor || base.receivedTextColor,
      sentTimestampColor: customization?.sentTimestampColor || base.sentTimestampColor || 'rgba(248,250,252,0.75)',
      receivedTimestampColor: customization?.receivedTimestampColor || base.receivedTimestampColor || 'rgba(30,41,59,0.65)',
      bubbleRadius: customization?.bubbleRadius ?? base.bubbleRadius,
      bubbleStyle: customization?.bubbleStyle || base.bubbleStyle || 'solid',
      sentBubbleGradient: customization?.sentBubbleGradient || base.sentBubbleGradient,
      receivedBubbleGradient: customization?.receivedBubbleGradient || base.receivedBubbleGradient,
      messageTextSize: customization?.messageTextSize ?? 15,
      density: customization?.density || base.density || 'cozy' as const,
    };
  }, [conversationId, conversationCustomizations]);

  const chatBackground = useMemo(() => {
    if (!conversationId) return getChatBackgroundById('void');
    const bgId = backgroundByConversation[conversationId];
    const customUri = customBackgroundUriByConversation[conversationId];
    const bg = getChatBackgroundById(bgId);

    // Override with custom URI if it's the custom-photo type and a URI is set
    if (bg.id === 'custom-photo' && customUri) {
      return { ...bg, image: { uri: customUri } };
    }
    return bg;
  }, [conversationId, backgroundByConversation, customBackgroundUriByConversation]);

  const showCallControls = useMemo(() => {
    if (!conversationId) return true;
    const customization = conversationCustomizations[conversationId];
    return customization?.enableCallControls !== false;
  }, [conversationId, conversationCustomizations]);
  const messageSpacing =
    chatTheme.density === 'compact'
      ? 4
      : chatTheme.density === 'spacious'
        ? 14
        : 9;
  const messageFontSize = chatTheme.messageTextSize ?? 15;
  const messageLineHeight = Math.round(messageFontSize * 1.35);
  const bubbleCornerLarge = chatTheme?.bubbleRadius ?? DEFAULT_CHAT_THEME.bubbleRadius;
  // Tighter corners used when messages cluster into a block (older→newer inside a few minutes).
  // Slightly sharper than before so the block effect is obvious on small radii, but never squared off.
  const bubbleCornerTight = Math.max(
    3,
    Math.min(12, Math.round((chatTheme?.bubbleRadius ?? DEFAULT_CHAT_THEME.bubbleRadius) * 0.28))
  );

  const pinnedMessageId = conversationId ? pinnedMessages[conversationId] : null;
  const savedMessageIds = conversationId ? savedMessages[conversationId] || [] : [];
  const listInputSpacer = inputHeight || (Platform.OS === 'ios' ? 96 : 80); // fallback until measured

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

  const mediaItems = useMemo(() => {
    const items: {
      id: string;
      url: string;
      type: 'image' | 'video';
      caption?: string | null;
      createdAt?: string;
      message: Message;
    }[] = [];

    renderedMessages.forEach((msg) => {
      const metadataValue = (() => {
        if (!msg.metadata) return null;
        if (typeof msg.metadata === 'string') {
          try {
            return JSON.parse(msg.metadata);
          } catch {
            return null;
          }
        }
        if (typeof msg.metadata === 'object') return msg.metadata;
        return null;
      })();
      const resolvedAttachments = (() => {
        if (Array.isArray(msg.attachments)) return msg.attachments;
        if (typeof msg.attachments === 'string') {
          try {
            const parsed = JSON.parse(msg.attachments);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object') return [parsed];
          } catch {
            return undefined;
          }
        }
        if (msg.attachments && typeof msg.attachments === 'object') {
          return [msg.attachments];
        }
        const metaAttachment = metadataValue?.attachments ?? metadataValue?.attachment ?? metadataValue?.file ?? metadataValue?.media;
        if (Array.isArray(metaAttachment)) return metaAttachment;
        if (metaAttachment && typeof metaAttachment === 'object') return [metaAttachment];
        return undefined;
      })();
      const attachment = resolvedAttachments?.[0];
      const metadataFileUrl =
        metadataValue?.fileUrl ?? metadataValue?.file_url ?? metadataValue?.url ?? metadataValue?.publicUrl ?? metadataValue?.downloadUrl;
      const metadataFileName =
        metadataValue?.fileName ?? metadataValue?.file_name ?? metadataValue?.name ?? metadataValue?.filename;
      const metadataFileType =
        metadataValue?.fileType ?? metadataValue?.file_type ?? metadataValue?.type ?? metadataValue?.mimeType ?? metadataValue?.mime_type;
      const attachmentUrlRaw =
        attachment?.url ??
        attachment?.file_url ??
        attachment?.fileUrl ??
        attachment?.publicUrl ??
        attachment?.downloadUrl ??
        metadataFileUrl ??
        msg.file_url ??
        undefined;
      const attachmentUrlBase = (() => {
        if (attachmentUrlRaw) return attachmentUrlRaw;
        const path = attachment?.path ?? attachment?.storage_path ?? metadataValue?.path ?? metadataValue?.storage_path;
        if (!path) return undefined;
        const bucket = attachment?.bucket ?? attachment?.bucket_id ?? metadataValue?.bucket ?? 'chat-media';
        try {
          const { data } = supabase.storage.from(bucket).getPublicUrl(path);
          return data?.publicUrl;
        } catch {
          return undefined;
        }
      })();
      const attachmentUrl = signedAttachmentUrls[msg.id] ?? attachmentUrlBase;
      if (!attachmentUrl) return;
      const attachmentName =
        attachment?.name ??
        attachment?.file_name ??
        attachment?.fileName ??
        metadataFileName ??
        msg.file_name ??
        msg.content ??
        undefined;
      const attachmentType =
        attachment?.type ??
        attachment?.fileType ??
        metadataFileType ??
        msg.type;
      const typeLower = typeof attachmentType === 'string' ? attachmentType.toLowerCase() : '';
      const extFromUrl = getLowerExtension(attachmentUrl);
      const extFromName = getLowerExtension(attachmentName || undefined);
      const isImage =
        typeLower === 'image' ||
        typeLower === 'gif' ||
        typeLower.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(extFromUrl || extFromName || '');
      const isVideo =
        typeLower === 'video' ||
        typeLower.startsWith('video/') ||
        ['mp4', 'mov', 'm4v', 'webm', 'avi'].includes(extFromUrl || extFromName || '');
      if (!isImage && !isVideo) return;
      const caption = isImage && msg.content && msg.content !== 'Image' && msg.content !== 'GIF' ? msg.content : null;
      items.push({
        id: msg.id,
        url: attachmentUrl,
        type: isVideo ? 'video' : 'image',
        caption,
        createdAt: msg.created_at,
        message: msg,
      });
    });
    return items;
  }, [renderedMessages, signedAttachmentUrls, getLowerExtension]);

  const mediaIndexById = useMemo(() => {
    const map = new Map<string, number>();
    mediaItems.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  }, [mediaItems]);

  const openMediaViewer = useCallback((messageId: string) => {
    const index = mediaIndexById.get(messageId);
    if (index == null) return;
    setMediaViewerIndex(index);
    setMediaViewerVisible(true);
    setShowViewerChrome(true);
    setShowReactionBar(false);
    setShowEmojiPicker(false);
    setShowMediaMoreMenu(false);
    requestAnimationFrame(() => {
      mediaViewerListRef.current?.scrollToIndex({ index, animated: false });
    });
  }, [mediaIndexById]);

  const currentMediaItem = mediaItems[mediaViewerIndex];
  const currentMediaMessage = currentMediaItem?.message;
  const isDisappearingMessage =
    currentMediaMessage?.type === 'view-once' || currentMediaMessage?.type === 'timed-message';

  useEffect(() => {
    if (!mediaViewerVisible || !mediaItems.length) return;
    if (mediaViewerIndex >= mediaItems.length) {
      setMediaViewerIndex(mediaItems.length - 1);
    }
  }, [mediaViewerVisible, mediaItems.length, mediaViewerIndex]);

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

  useEffect(() => {
    if (!renderedMessages.length) return;
    let cancelled = false;

    const resolveSignedUrls = async () => {
      const updates: Record<string, string> = {};

      await Promise.all(
        renderedMessages.map(async (msg) => {
          if (signedAttachmentUrls[msg.id]) return;
          const rawMeta = msg.metadata;
          const metadataValue = (() => {
            if (!rawMeta) return null;
            if (typeof rawMeta === 'string') {
              try {
                return JSON.parse(rawMeta);
              } catch {
                return null;
              }
            }
            if (typeof rawMeta === 'object') return rawMeta;
            return null;
          })();

          const attachments = (() => {
            if (Array.isArray(msg.attachments)) return msg.attachments;
            if (typeof msg.attachments === 'string') {
              try {
                const parsed = JSON.parse(msg.attachments);
                if (Array.isArray(parsed)) return parsed;
                if (parsed && typeof parsed === 'object') return [parsed];
              } catch {
                return undefined;
              }
            }
            if (msg.attachments && typeof msg.attachments === 'object') {
              return [msg.attachments];
            }
            const metaAttachment =
              metadataValue?.attachments ??
              metadataValue?.attachment ??
              metadataValue?.file ??
              metadataValue?.media;
            if (Array.isArray(metaAttachment)) return metaAttachment;
            if (metaAttachment && typeof metaAttachment === 'object') return [metaAttachment];
            return undefined;
          })();

          const attachment = attachments?.[0];
          const urlFromMeta =
            metadataValue?.fileUrl ??
            metadataValue?.file_url ??
            metadataValue?.url ??
            metadataValue?.publicUrl ??
            metadataValue?.downloadUrl;
          const urlFromAttachment =
            attachment?.url ??
            attachment?.file_url ??
            attachment?.fileUrl ??
            attachment?.publicUrl ??
            attachment?.downloadUrl;
          const fallbackUrl = msg.file_url ?? urlFromAttachment ?? urlFromMeta;
          const parsed = parseSupabaseStorageUrl(fallbackUrl);
          const bucket = attachment?.bucket ?? attachment?.bucket_id ?? metadataValue?.bucket ?? parsed?.bucket;
          const path = attachment?.path ?? attachment?.storage_path ?? metadataValue?.path ?? metadataValue?.storage_path ?? parsed?.path;

          if (!bucket || !path) return;

          try {
            const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
            if (error || !data?.signedUrl) return;
            updates[msg.id] = data.signedUrl;
          } catch {
            return;
          }
        })
      );

      if (!cancelled && Object.keys(updates).length) {
        setSignedAttachmentUrls((prev) => ({ ...prev, ...updates }));
      }
    };

    resolveSignedUrls();

    return () => {
      cancelled = true;
    };
  }, [renderedMessages, signedAttachmentUrls]);


  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Position input just above keyboard - move up by keyboard height minus small offset
        const offset = Platform.OS === 'ios' ? 25 : 0; // Small gap above keyboard
        Animated.timing(inputTranslateAnim, {
          toValue: -(e.endCoordinates.height - offset),
          duration: Math.max(120, e.duration - 150 || 250),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
        requestAnimationFrame(scrollToBottomImmediate);
      }
    );

    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        setKeyboardHeight(0);
        Animated.timing(inputTranslateAnim, {
          toValue: 0,
          duration: Math.max(120, e.duration - 150 || 250),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
        requestAnimationFrame(scrollToBottomImmediate);
      }
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [inputTranslateAnim, scrollToBottomImmediate]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !user || !conversationId) return;

    const content = messageText.trim();
    setMessageText('');
    setReplyingTo(null);

    // TODO: Add metadata support to backend for view-once and timed messages
    // Store metadata in message for now
    const hasSpecialOptions = messageOptions.viewOnce || (messageOptions.timedDuration && messageOptions.timedDuration > 0);

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        content,
        senderId: user.id,
        replyToId: replyingTo?.id,
        // Note: metadata field needs to be added to backend schema
        ...(hasSpecialOptions && {
          fileType: messageOptions.viewOnce ? 'view-once' : 'timed-message',
        }),
      } as any);

      // Reset message options after sending
      setMessageOptions({ viewOnce: false, timedDuration: 0 });

      // Always snap to the newest message after sending
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Error sending message:', error);
      Alert.alert('Error', message);
      setMessageText(content);
    }
  }, [messageText, user, conversationId, replyingTo, messageOptions, sendMessageMutation, setReplyingTo]);

  const openPlusMenu = useCallback(() => {
    setShowPlusMenu(true);
    plusMenuAnim.setValue(0);
    Animated.spring(plusMenuAnim, {
      toValue: 1,
      speed: 18,
      bounciness: 7,
      useNativeDriver: true,
    }).start();
    if (currentSettings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [currentSettings.hapticFeedback, plusMenuAnim]);

  const closePlusMenu = useCallback(() => {
    Animated.timing(plusMenuAnim, {
      toValue: 0,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setShowPlusMenu(false);
    });
    if (currentSettings.hapticFeedback) {
      Haptics.selectionAsync().catch(() => {});
    }
  }, [currentSettings.hapticFeedback, plusMenuAnim]);

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

  const handleSendVideo = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user || !conversationId) return;
    try {
      const uri = asset.uri;
      let contentType = asset.mimeType || 'video/mp4';
      if (!contentType || contentType === 'application/octet-stream') {
        const ext = getLowerExtension(uri) || 'mp4';
        const mimeMap: Record<string, string> = {
          'mp4': 'video/mp4',
          'mov': 'video/quicktime',
          'm4v': 'video/x-m4v',
          'webm': 'video/webm',
        };
        contentType = mimeMap[ext] || 'video/mp4';
      }
      const ext = getLowerExtension(uri) || 'mp4';
      const fileName =
        (asset as any).fileName ||
        uri.split('/').pop() ||
        `${Date.now()}.${ext}`;
      const filePath = `${user.id}/${conversationId}/videos/${Date.now()}_${fileName}`;
      const resolvedSize = await getFileSize(uri);

      await uploadToStorage(uri, contentType, filePath);

      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        content: 'Video',
        senderId: user.id,
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        fileType: 'video',
        metadata: {
          fileUrl: urlData.publicUrl,
          fileName: fileName,
          fileType: 'video',
          fileSize: resolvedSize,
          bucket: 'chat-media',
          path: filePath,
        },
      });

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Video upload error:', error);
      Alert.alert('Upload failed', 'Failed to upload video. Please try again.');
    }
  }, [conversationId, user, sendMessageMutation, getLowerExtension, uploadToStorage, getFileSize]);

  const handlePickImage = useCallback(async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isVideoAsset =
          asset.type === 'video' ||
          (asset.mimeType ? asset.mimeType.startsWith('video/') : false) ||
          ['mp4', 'mov', 'm4v', 'webm'].includes(getLowerExtension(asset.uri) || '');
        if (isVideoAsset) {
          await handleSendVideo(asset);
        } else {
          setPhotoToEdit(asset.uri);
          setShowPhotoEditor(true);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  }, [getLowerExtension, handleSendVideo]);

  const handleSavePhoto = useCallback(async (uri: string, caption?: string) => {
    setShowPhotoEditor(false);
    if (!user || !conversationId) return;

    try {
      let normalizedUri = uri;
      if (!normalizedUri.startsWith('file://')) {
        try {
          const manipResult = await ImageManipulator.manipulateAsync(
            normalizedUri,
            [],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );
          normalizedUri = manipResult.uri;
        } catch (err) {
          console.warn('[Chat] Image normalize failed, using original uri', err);
        }
      }
      const initialResponse = await fetch(normalizedUri);
      const initialBlob = await initialResponse.blob();

      // Ensure content type is correctly determined
      let contentType = initialBlob.type;
      if (!contentType || contentType === 'application/octet-stream') {
        const ext = normalizedUri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeMap: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'heic': 'image/heic',
          'heif': 'image/heif',
        };
        contentType = mimeMap[ext] || 'image/jpeg';
      }
      const resolvedSize = (await getFileSize(normalizedUri)) || initialBlob.size || 0;
      const mimeExtMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/heic': 'heic',
        'image/heif': 'heif',
      };
      const safeExt = mimeExtMap[contentType] || contentType.split('/')[1] || 'jpg';
      const fileName = `${Date.now()}.${safeExt}`;
      // Path format: userId/conversationId/images/fileName (for RLS policy)
      const filePath = `${user.id}/${conversationId}/images/${fileName}`;

      const uploadedSize = await uploadToStorage(normalizedUri, contentType, filePath);
      const finalSize = uploadedSize || resolvedSize;

      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        content: caption || 'Image',
        senderId: user.id,
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        fileType: 'image',
        metadata: {
          fileUrl: urlData.publicUrl,
          fileName: fileName,
          fileType: 'image',
          fileSize: finalSize,
          bucket: 'chat-media',
          path: filePath,
        },
      });

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Upload failed', 'Failed to upload image. Please try again.');
    }
  }, [conversationId, user, sendMessageMutation]);

  const handleTakePhoto = useCallback(async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoToEdit(result.assets[0].uri);
        setShowPhotoEditor(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  }, []);

  const handleTakeVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to record video.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await handleSendVideo(result.assets[0]);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  }, [handleSendVideo]);

  const handleCameraPhoto = useCallback((uri: string) => {
    setImageToEdit({ id: 'new', url: uri, type: 'image', message: {} as Message });
    setShowAdvancedEditor(true);
  }, []);

  const handleCameraVideo = useCallback(async (uri: string) => {
    await handleSendVideo({ uri, type: 'video', mimeType: 'video/mp4' } as ImagePicker.ImagePickerAsset);
  }, [handleSendVideo]);

  const handleEditFromViewer = useCallback((mediaItem: MediaItem) => {
    setMediaViewerVisible(false);
    setImageToEdit(mediaItem);
    setShowAdvancedEditor(true);
  }, []);

  const handleForwardMessage = useCallback((message: Message) => {
    setMediaViewerVisible(false);
    setMessageToForward(message);
    setShowForwardModal(true);
  }, []);

  const handleForwardSubmit = useCallback(async (conversationIds: string[]) => {
    if (!messageToForward || !user) return;

    try {
      for (const convId of conversationIds) {
        await sendMessageMutation.mutateAsync({
          conversationId: convId,
          content: messageToForward.content,
          senderId: user.id,
          fileUrl: messageToForward.file_url,
          fileName: messageToForward.file_name,
          fileType: messageToForward.type,
        } as any);
      }
      Alert.alert('Success', `Message forwarded to ${conversationIds.length} conversation(s)`);
    } catch (error) {
      console.error('Forward error:', error);
      Alert.alert('Error', 'Failed to forward message');
    }
  }, [messageToForward, user, sendMessageMutation]);

  const handleKeepMessage = useCallback((message: Message) => {
    Alert.alert('Saved', 'Media has been saved');
  }, []);

  const handleSelectGif = useCallback(async (gifUrl: string) => {
    setShowGifPicker(false);
    if (!user || !conversationId) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        content: 'GIF',
        senderId: user.id,
        fileUrl: gifUrl,
        fileName: 'animation.gif',
        fileType: 'image',
      });

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('GIF send error:', error);
      Alert.alert('Error', 'Failed to send GIF. Please try again.');
    }
  }, [conversationId, user, sendMessageMutation]);

  const handleCreatePoll = useCallback(async (poll: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    anonymous: boolean;
    pollType?: 'poll' | 'quiz';
    correctOptions?: number[];
    expiresAt?: string | null;
  }) => {
    setShowPollCreator(false);
    if (!user || !conversationId) return;

    try {
      // Store poll data as JSON in content
      const pollData = {
        type: 'poll',
        question: poll.question,
        options: poll.options.map(opt => ({ text: opt, votes: [] })),
        allowMultiple: poll.allowMultiple,
        anonymous: poll.anonymous,
        pollType: poll.pollType || 'poll',
        correctOptions: poll.correctOptions || [],
        expiresAt: poll.expiresAt || null,
      };

      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        content: JSON.stringify(pollData),
        senderId: user.id,
        fileType: 'poll',
      });

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Poll creation error:', error);
      Alert.alert('Error', 'Failed to create poll. Please try again.');
    }
  }, [conversationId, user, sendMessageMutation]);

  const handleSelectLocation = useCallback(async (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setShowLocationPicker(false);
    if (!user || !conversationId) return;

    try {
      const locationData = {
        type: 'location',
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      };

      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        content: location.address || `Location: ${location.latitude}, ${location.longitude}`,
        senderId: user.id,
        fileType: 'location',
      });

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Location send error:', error);
      Alert.alert('Error', 'Failed to send location. Please try again.');
    }
  }, [conversationId, user, sendMessageMutation]);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!user || !conversationId) return;

      try {
        // Upload file to Supabase storage
        const fileName = asset.name;
        // Path format: userId/conversationId/files/fileName (for RLS policy)
        const filePath = `${user.id}/${conversationId}/files/${Date.now()}_${fileName}`;

        // Determine proper mime type from file extension if mimeType is generic
        let contentType = asset.mimeType || 'application/pdf';
        if (!contentType || contentType === 'application/octet-stream') {
          const ext = fileName.split('.').pop()?.toLowerCase();
          const mimeMap: Record<string, string> = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
          };
          contentType = ext ? (mimeMap[ext] || 'application/pdf') : 'application/pdf';
        }
        const resolvedSize = await getFileSize(asset.uri);
        const uploadedSize = await uploadToStorage(asset.uri, contentType, filePath);
        const finalSize = uploadedSize || resolvedSize;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('chat-media')
          .getPublicUrl(filePath);

        // Send message with file
        await sendMessageMutation.mutateAsync({
          conversationId: conversationId,
          content: fileName,
          senderId: user.id,
          fileUrl: urlData.publicUrl,
          fileName: fileName,
          fileType: 'file',
          metadata: {
            fileUrl: urlData.publicUrl,
            fileName: fileName,
            fileType: 'file',
            fileSize: finalSize,
            bucket: 'chat-media',
            path: filePath,
          },
        });

        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      } catch (error) {
        console.error('File upload error:', error);
        Alert.alert('Upload failed', 'Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('File picker error:', error);
      // User canceled or error occurred
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

  const parsePollData = useCallback((message: Message) => {
    const raw = message.metadata ?? message.content;
    if (!raw) return null;
    try {
      if (typeof raw === 'object') {
        const directPoll = (raw as any).pollData ?? (raw as any).poll;
        if (directPoll?.type === 'poll' && Array.isArray(directPoll.options)) return directPoll;
        if (raw.type === 'poll' && Array.isArray((raw as any).options)) return raw;
        const nested = (raw as any).content ?? (raw as any).text;
        if (typeof nested === 'string') {
          const parsedNested = JSON.parse(nested);
          if (parsedNested?.type === 'poll' && Array.isArray(parsedNested.options)) return parsedNested;
        }
        return null;
      }
      if (typeof raw === 'string') {
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.type !== 'poll' || !Array.isArray(parsed.options)) return null;
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  const handlePollVote = useCallback(async (message: Message, optionIndex: number) => {
    if (!user) return;
    const pollData = parsePollData(message);
    if (!pollData || !Array.isArray(pollData.options)) return;

    const alreadyVoted = pollData.options.some((opt: any) =>
      Array.isArray(opt?.votes) ? opt.votes.includes(user.id) : false
    );
    if (alreadyVoted) return;

    const updatedPoll = {
      ...pollData,
      options: pollData.options.map((opt: any, idx: number) => {
        if (idx !== optionIndex) return opt;
        const votes = Array.isArray(opt.votes) ? opt.votes : [];
        return { ...opt, votes: votes.includes(user.id) ? votes : [...votes, user.id] };
      }),
    };

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: JSON.stringify(updatedPoll),
          metadata: updatedPoll,
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    } catch (err) {
      console.error('Poll vote error:', err);
      Alert.alert('Vote failed', 'Could not submit your vote. Please try again.');
    }
  }, [user, parsePollData, queryClient, conversationId]);

  const handlePollVoteMultiple = useCallback(async (message: Message, optionIndexes: number[]) => {
    if (!user) return;
    const pollData = parsePollData(message);
    if (!pollData || !Array.isArray(pollData.options)) return;

    const alreadyVoted = pollData.options.some((opt: any) =>
      Array.isArray(opt?.votes) ? opt.votes.includes(user.id) : false
    );
    if (alreadyVoted) return;

    const selectedSet = new Set(optionIndexes);
    const updatedPoll = {
      ...pollData,
      options: pollData.options.map((opt: any, idx: number) => {
        if (!selectedSet.has(idx)) return opt;
        const votes = Array.isArray(opt.votes) ? opt.votes : [];
        return { ...opt, votes: votes.includes(user.id) ? votes : [...votes, user.id] };
      }),
    };

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: JSON.stringify(updatedPoll),
          metadata: updatedPoll,
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    } catch (err) {
      console.error('Poll vote error:', err);
      Alert.alert('Vote failed', 'Could not submit your vote. Please try again.');
    }
  }, [user, parsePollData, queryClient, conversationId]);

  const formatMediaDateTime = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateLabel} · ${timeLabel}`;
  };

  const handleShareMedia = useCallback(async (item?: { url: string; caption?: string | null }) => {
    if (!item) return;
    try {
      await Share.share({
        message: item.caption || 'Media',
        url: item.url,
      });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to open the share sheet.');
    }
  }, []);

  const handleForwardMedia = useCallback(() => {
    Alert.alert('Forward', 'Forwarding will be available soon.');
  }, []);

  const handleKeepMedia = useCallback(() => {
    Alert.alert('Keep', 'Keeping disappearing media will be available soon.');
  }, []);

  const handleEditMedia = useCallback((item?: { type: 'image' | 'video'; url: string }) => {
    if (!item || item.type !== 'image') {
      Alert.alert('Edit', 'Video editing will be available soon.');
      return;
    }
    setPhotoToEdit(item.url);
    setShowPhotoEditor(true);
    setMediaViewerVisible(false);
  }, []);

  const handleReplyFromViewer = useCallback(() => {
    if (!currentMediaMessage) return;
    setReplyingTo(currentMediaMessage);
    setMediaViewerVisible(false);
  }, [currentMediaMessage, setReplyingTo]);

  const handleGoToMessage = useCallback(() => {
    if (!currentMediaMessage) return;
    const index = renderedMessages.findIndex((msg) => msg.id === currentMediaMessage.id);
    if (index < 0) return;
    setMediaViewerVisible(false);
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({ index, viewPosition: 0.4, animated: true });
    });
  }, [currentMediaMessage, renderedMessages]);

  const handleMoreMedia = useCallback(() => {
    setShowMediaMoreMenu((prev) => !prev);
  }, [handleGoToMessage, handleReplyFromViewer]);

  const formatBytes = (bytes?: number) => {
    if (!bytes || !Number.isFinite(bytes)) return null;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
    return `${rounded} ${units[index]}`;
  };

  const isProbablyUrl = (value?: string | null) => {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  };

  function getFileExtension(name?: string) {
    if (!name) return null;
    const parts = name.split('.');
    if (parts.length < 2) return null;
    return parts[parts.length - 1]?.toUpperCase() || null;
  }
  function getLowerExtension(value?: string | null) {
    if (!value) return null;
    const clean = value.split('?')[0] || '';
    const parts = clean.split('.');
    if (parts.length < 2) return null;
    return parts[parts.length - 1]?.toLowerCase() || null;
  }
  const decodeBase64ToArrayBuffer = (base64: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let bufferLength = base64.length * 0.75;
    if (base64[base64.length - 1] === '=') bufferLength -= 1;
    if (base64[base64.length - 2] === '=') bufferLength -= 1;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arrayBuffer);
    let p = 0;
    for (let i = 0; i < base64.length; i += 4) {
      const encoded1 = chars.indexOf(base64[i]);
      const encoded2 = chars.indexOf(base64[i + 1]);
      const encoded3 = chars.indexOf(base64[i + 2]);
      const encoded4 = chars.indexOf(base64[i + 3]);
      const chunk = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      bytes[p++] = (chunk >> 16) & 255;
      if (encoded3 !== 64) bytes[p++] = (chunk >> 8) & 255;
      if (encoded4 !== 64) bytes[p++] = chunk & 255;
    }
    return arrayBuffer;
  };
  const parseSupabaseStorageUrl = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/([^?]+)/);
    if (!match) return null;
    return {
      bucket: decodeURIComponent(match[1]),
      path: decodeURIComponent(match[2]),
    };
  };
  async function getFileSize(uri: string) {
    try {
      const info = await LegacyFileSystem.getInfoAsync(uri);
      return typeof info.size === 'number' ? info.size : 0;
    } catch {
      return 0;
    }
  }
  async function uploadToStorage(uri: string, contentType: string, filePath: string) {
    const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });
    const buffer = decodeBase64ToArrayBuffer(base64);
    const byteArray = new Uint8Array(buffer);
    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(filePath, byteArray, { contentType });
    if (uploadError) throw uploadError;
    return byteArray.byteLength;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    // Inverted list: y=0 is bottom/newest. Show jump when we're away from bottom.
    setShowJump(contentOffset.y > 120);
  };

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const scrollToBottomImmediate = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

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
    const nextMessage = renderedMessages ? renderedMessages[index - 1] : null;

    const closeGapMs = 5 * 60 * 1000; // <5 minutes: treat as tight stack
    const blockGapMs = 30 * 60 * 1000; // >=30 minutes: show separator
    const longGapMs = 12 * 60 * 1000; // avatar re-appears after this gap
    const prevGap = prevMessage
      ? Math.abs(new Date(item.created_at).getTime() - new Date(prevMessage.created_at).getTime())
      : Infinity;
    const nextGap = nextMessage
      ? Math.abs(new Date(item.created_at).getTime() - new Date(nextMessage.created_at).getTime())
      : Infinity;

    const groupedWithPrev =
      prevMessage && prevMessage.sender_id === item.sender_id && prevGap < closeGapMs;
    const groupedWithNext =
      nextMessage && nextMessage.sender_id === item.sender_id && nextGap < closeGapMs;

    const showAvatar = !isOwn && (!groupedWithPrev || prevGap > longGapMs);
    const hasReactions = item.reactions && item.reactions.length > 0;
    const displayContent = item.content || '';
    const metadataValue = (() => {
      if (!item.metadata) return null;
      if (typeof item.metadata === 'string') {
        try {
          return JSON.parse(item.metadata);
        } catch {
          return null;
        }
      }
      if (typeof item.metadata === 'object') return item.metadata;
      return null;
    })();
    const resolvedAttachments = (() => {
      if (Array.isArray(item.attachments)) return item.attachments;
      if (typeof item.attachments === 'string') {
        try {
          const parsed = JSON.parse(item.attachments);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === 'object') return [parsed];
        } catch {
          return undefined;
        }
      }
      if (item.attachments && typeof item.attachments === 'object') {
        return [item.attachments];
      }
      const metaAttachment = metadataValue?.attachments ?? metadataValue?.attachment ?? metadataValue?.file ?? metadataValue?.media;
      if (Array.isArray(metaAttachment)) return metaAttachment;
      if (metaAttachment && typeof metaAttachment === 'object') return [metaAttachment];
      return undefined;
    })();
    const attachment = resolvedAttachments?.[0];
    const metadataFileUrl =
      metadataValue?.fileUrl ?? metadataValue?.file_url ?? metadataValue?.url ?? metadataValue?.publicUrl ?? metadataValue?.downloadUrl;
    const metadataFileName =
      metadataValue?.fileName ?? metadataValue?.file_name ?? metadataValue?.name ?? metadataValue?.filename;
    const metadataFileType =
      metadataValue?.fileType ?? metadataValue?.file_type ?? metadataValue?.type ?? metadataValue?.mimeType ?? metadataValue?.mime_type;
    const contentUrl = isProbablyUrl(displayContent) ? displayContent.trim() : undefined;
    const attachmentUrlRaw =
      attachment?.url ??
      attachment?.file_url ??
      attachment?.fileUrl ??
      attachment?.publicUrl ??
      attachment?.downloadUrl ??
      metadataFileUrl ??
      contentUrl ??
      item.file_url ??
      undefined;
    const attachmentUrlBase = (() => {
      if (attachmentUrlRaw) return attachmentUrlRaw;
      const path = attachment?.path ?? attachment?.storage_path ?? metadataValue?.path ?? metadataValue?.storage_path;
      if (!path) return undefined;
      const bucket = attachment?.bucket ?? attachment?.bucket_id ?? metadataValue?.bucket ?? 'chat-media';
      try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data?.publicUrl;
      } catch {
        return undefined;
      }
    })();
    const attachmentUrl = signedAttachmentUrls[item.id] ?? attachmentUrlBase;
    const attachmentName =
      attachment?.name ??
      attachment?.file_name ??
      attachment?.fileName ??
      metadataFileName ??
      item.file_name ??
      item.content ??
      undefined;
    const attachmentType =
      attachment?.type ??
      attachment?.fileType ??
      metadataFileType ??
      item.type;
    const attachmentSize =
      attachment?.size ?? attachment?.file_size ?? metadataValue?.fileSize ?? metadataValue?.file_size ?? item.file_size ?? undefined;
    const extensionFromUrl = (() => {
      if (!attachmentUrl) return null;
      const clean = attachmentUrl.split('?')[0] || '';
      const parts = clean.split('.');
      return parts.length > 1 ? parts[parts.length - 1]?.toLowerCase() : null;
    })();
    const extensionFromName = (() => {
      if (!attachmentName) return null;
      const parts = attachmentName.split('.');
      return parts.length > 1 ? parts[parts.length - 1]?.toLowerCase() : null;
    })();
    const typeLower = typeof attachmentType === 'string' ? attachmentType.toLowerCase() : '';
    const isImage =
      typeLower === 'image' ||
      typeLower === 'gif' ||
      typeLower.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(extensionFromUrl || extensionFromName || '');
    const isVideo =
      typeLower === 'video' ||
      typeLower.startsWith('video/') ||
      ['mp4', 'mov', 'm4v', 'webm', 'avi'].includes(extensionFromUrl || extensionFromName || '');
    const isPoll = typeLower === 'poll';
    const isFile = typeLower === 'file' || (!!attachmentUrl && !isImage && !isPoll && !isVideo);
    const pollData = isPoll ? parsePollData(item) : null;
    const caption = isImage && item.content && item.content !== 'Image' && item.content !== 'GIF'
      ? item.content
      : null;
    const fileExt = getFileExtension(attachmentName || '');
    const fileSizeLabel = formatBytes(attachmentSize);
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
      prevDate.toDateString() !== currentDate.toDateString() ||
      prevGap >= blockGapMs;
    const isToday = (() => {
      const today = new Date();
      return currentDate.toDateString() === today.toDateString();
    })();
    const isYesterday = (() => {
      const today = new Date();
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      return currentDate.toDateString() === y.toDateString();
    })();
    const dateLabel = isToday
      ? 'Today'
      : isYesterday
        ? 'Yesterday'
        : currentDate.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: currentDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          });
    const timeLabel = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const separatorLabel = `${dateLabel} · ${timeLabel}`;

    // Corner tightening is applied independently per side, only when the neighboring
    // message from the same sender is within the 5-minute window.
    const bubbleRadius = (() => {
      if (isOwn) {
        return {
          borderTopLeftRadius: bubbleCornerLarge,
          borderBottomLeftRadius: bubbleCornerLarge,
          borderTopRightRadius: groupedWithPrev ? bubbleCornerTight : bubbleCornerLarge,
          borderBottomRightRadius: groupedWithNext ? bubbleCornerTight : bubbleCornerLarge,
        };
      }

      // Received bubbles: tighten the left edge when stacked.
      return {
        borderTopRightRadius: bubbleCornerLarge,
        borderBottomRightRadius: bubbleCornerLarge,
        borderTopLeftRadius: groupedWithPrev ? bubbleCornerTight : bubbleCornerLarge,
        borderBottomLeftRadius: groupedWithNext ? bubbleCornerTight : bubbleCornerLarge,
      };
    })();

    // Give clustered bubbles a bit of breathing room; solo bubbles a touch more
    const containerMargin = (() => {
      // With an inverted list, marginBottom visually separates the current bubble from the newer one.
      const adjacencyGap = nextMessage
        ? nextGap
        : prevMessage
          ? prevGap
          : Infinity;

      // Check if the next message is from a different sender
      const senderChanged = nextMessage && nextMessage.sender_id !== item.sender_id;

      if (!Number.isFinite(adjacencyGap)) return messageSpacing * 1.5;
      // If sender changed, add more space regardless of time
      if (senderChanged) return messageSpacing * 1.2;
      if (adjacencyGap < closeGapMs) return messageSpacing * 0.40; // slight gap for <5 min
      if (adjacencyGap < blockGapMs) return messageSpacing * 1.35; // medium gap for 5–30 min
      return messageSpacing * 1; // large break for 30+ min (separator also shows)
    })();
    const readCount = item.read_by?.length || 0;
    const otherParticipantCount = conversation?.participants?.length || 0;
    const seenByAll = readCount >= otherParticipantCount && otherParticipantCount > 0;
    const delivered = readCount > 0;
    const receiptColor = seenByAll
      ? '#38bdf8'
      : delivered
        ? (isOwn ? 'rgba(255,255,255,0.85)' : theme.colors.textMuted)
        : theme.colors.textMuted;

    const shouldShowMeta = showTimestamps || isPinned || isSaved || (isOwn && readReceiptsEnabled);

    const timestampColor = isOwn ? chatTheme.sentTimestampColor : chatTheme.receivedTimestampColor;

    const InlineMeta = ({ asTextComponent = false }: { asTextComponent?: boolean }) => {
      if (!shouldShowMeta) return null;

      if (asTextComponent && showTimestamps && !readReceiptsEnabled && !isPinned && !isSaved) {
        // Render as nested Text for inline wrapping - stays on same line as content
        return (
          <Text style={[styles.timestampInline, { color: timestampColor }]}>
            {'   '}{timeLabel}
          </Text>
        );
      }

      // Render as View for non-text content (images/files) or when receipts/flags are shown
      return (
        <View style={[styles.inlineMeta, isOwn && styles.inlineMetaOwn]}>
          {showTimestamps && (
            <Text style={[styles.timestampInline, { color: timestampColor }]}>{timeLabel}</Text>
          )}
          {isOwn && readReceiptsEnabled && (
            <View style={styles.readReceiptsInside}>
              <Ionicons
                name={delivered ? 'checkmark-done' : 'checkmark'}
                size={12}
                color={delivered ? (seenByAll ? '#38bdf8' : receiptColor) : theme.colors.textMuted}
              />
              {delivered && (
                <Ionicons
                  name="checkmark-done"
                  size={12}
                  color={seenByAll ? '#38bdf8' : receiptColor}
                  style={{ marginLeft: -6 }}
                />
              )}
            </View>
          )}
          {(isPinned || isSaved) && (
            <View style={styles.messageFlagsInside}>
              {isPinned && <Ionicons name="pin" size={12} color="#f97316" />}
              {isSaved && <Ionicons name="bookmark" size={12} color="#22d3ee" />}
            </View>
          )}
        </View>
      );
    };

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {separatorLabel}
            </Text>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => {
            setSelectedMessage(item);
            setShowActions(true);
          }}
          style={[
            styles.messageContainer,
            { marginBottom: containerMargin },
            isOwn && styles.messageContainerOwn,
          ]}
        >
          {!isOwn && (
            <View style={styles.avatarColumn}>
              {showAvatar ? (
                <Avatar
                  uri={item.sender.avatar_url}
                  name={item.sender.display_name || item.sender.username}
                  size="sm"
                />
              ) : (
                <View style={styles.avatarSpacer} />
              )}
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

            {useGradient && !isImage ? (
              <LinearGradient
                colors={bubbleGradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.messageBubble,
                  isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                  bubbleRadius,
                  { maxWidth: maxBubbleWidth },
                  (isImage || isVideo) && styles.mediaBubble,
                ]}
              >
                {!isOwn && showAvatar && (
                  <Text style={styles.senderName}>
                    {item.sender.display_name || item.sender.username}
                  </Text>
                )}
                {isImage && attachmentUrl && (
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openMediaViewer(item.id)}>
                    {imageLoadErrors[item.id] ? (
                      <View style={styles.imageErrorFallback}>
                        <Text style={[styles.messageText, { color: bubbleTextColor }]}>
                          Image failed to load
                        </Text>
                        <Text style={[styles.mediaCaption, { color: bubbleTextColor }]}>
                          Tap to open
                        </Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: attachmentUrl }}
                        style={styles.messageImage}
                        contentFit="cover"
                        transition={200}
                        onLoad={() => {
                          if (imageLoadErrors[item.id]) {
                            setImageLoadErrors((prev) => ({ ...prev, [item.id]: false }));
                          }
                        }}
                        onError={(err) => {
                          console.warn('[Chat] Image load error', {
                            id: item.id,
                            url: attachmentUrl,
                            error: err?.error,
                          });
                          setImageLoadErrors((prev) => ({ ...prev, [item.id]: true }));
                        }}
                      />
                    )}
                    {!!caption && (
                      <Text style={[styles.mediaCaption, { color: bubbleTextColor }]}>{caption}</Text>
                    )}
                  </TouchableOpacity>
                )}
                {isVideo && attachmentUrl && (
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openMediaViewer(item.id)}>
                    <View style={styles.videoPreview}>
                      <Ionicons name="play-circle" size={40} color="white" />
                      <Text style={styles.videoPreviewText}>Video</Text>
                    </View>
                    {!!caption && (
                      <Text style={[styles.mediaCaption, { color: bubbleTextColor }]}>{caption}</Text>
                    )}
                  </TouchableOpacity>
                )}
                {isImage && !attachmentUrl && (
                  <Text style={[styles.messageText, { color: bubbleTextColor }]}>Image unavailable</Text>
                )}
                {isVideo && !attachmentUrl && (
                  <Text style={[styles.messageText, { color: bubbleTextColor }]}>Video unavailable</Text>
                )}
                {isFile && attachmentUrl && (
                  <TouchableOpacity style={styles.messageFile} onPress={() => Linking.openURL(attachmentUrl)}>
                    <Ionicons name="document-text-outline" size={24} color={bubbleTextColor} />
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, { color: bubbleTextColor }]} numberOfLines={1}>
                        {attachmentName || 'File'}
                      </Text>
                      <Text style={[styles.fileSize, { color: bubbleTextColor }]}>
                        {(fileExt || 'File')}{fileSizeLabel ? ` · ${fileSizeLabel}` : ''}
                      </Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={bubbleTextColor} />
                  </TouchableOpacity>
                )}
                {isFile && !attachmentUrl && (
                  <Text style={[styles.messageText, { color: bubbleTextColor }]}>File unavailable</Text>
                )}
                {isPoll && pollData ? (
                  <PollBubble
                    pollData={pollData}
                    currentUserId={user?.id || ''}
                    isOwn={isOwn}
                    onVote={(optionIndex) => handlePollVote(item, optionIndex)}
                    onVoteMultiple={(optionIndexes) => handlePollVoteMultiple(item, optionIndexes)}
                  />
                ) : (isImage && attachmentUrl) || (isFile && attachmentUrl) || (isVideo && attachmentUrl) ? null : (
                  <Text
                    style={[
                      styles.messageText,
                      { color: bubbleTextColor, fontSize: messageFontSize, lineHeight: messageLineHeight },
                    ]}
                  >
                    {isPoll ? 'Poll unavailable' : displayContent}
                    {showTimestamps && !readReceiptsEnabled && !isPinned && !isSaved && (
                      <InlineMeta asTextComponent={true} />
                    )}
                  </Text>
                )}
                {(item.type !== 'text' || readReceiptsEnabled || isPinned || isSaved) && showTimestamps && (
                  <View style={styles.metaBelowContent}>
                    <InlineMeta />
                  </View>
                )}
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.messageBubble,
                  isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                  bubbleColorStyle,
                  bubbleRadius,
                  { maxWidth: maxBubbleWidth },
                  (isImage || isVideo) && styles.mediaBubble,
                ]}
              >
                {!isOwn && showAvatar && (
                  <Text style={styles.senderName}>
                    {item.sender.display_name || item.sender.username}
                  </Text>
                )}
                {isImage && attachmentUrl && (
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openMediaViewer(item.id)}>
                    {imageLoadErrors[item.id] ? (
                      <View style={styles.imageErrorFallback}>
                        <Text style={[styles.messageText, { color: bubbleTextColor }]}>
                          Image failed to load
                        </Text>
                        <Text style={[styles.mediaCaption, { color: bubbleTextColor }]}>
                          Tap to open
                        </Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: attachmentUrl }}
                        style={styles.messageImage}
                        contentFit="cover"
                        transition={200}
                        onLoad={() => {
                          if (imageLoadErrors[item.id]) {
                            setImageLoadErrors((prev) => ({ ...prev, [item.id]: false }));
                          }
                        }}
                        onError={(err) => {
                          console.warn('[Chat] Image load error', {
                            id: item.id,
                            url: attachmentUrl,
                            error: err?.error,
                          });
                          setImageLoadErrors((prev) => ({ ...prev, [item.id]: true }));
                        }}
                      />
                    )}
                    {!!caption && (
                      <Text style={[styles.mediaCaption, { color: bubbleTextColor }]}>{caption}</Text>
                    )}
                  </TouchableOpacity>
                )}
                {isVideo && attachmentUrl && (
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openMediaViewer(item.id)}>
                    <View style={styles.videoPreview}>
                      <Ionicons name="play-circle" size={40} color="white" />
                      <Text style={styles.videoPreviewText}>Video</Text>
                    </View>
                    {!!caption && (
                      <Text style={[styles.mediaCaption, { color: bubbleTextColor }]}>{caption}</Text>
                    )}
                  </TouchableOpacity>
                )}
                {isImage && !attachmentUrl && (
                  <Text style={[styles.messageText, { color: bubbleTextColor }]}>Image unavailable</Text>
                )}
                {isVideo && !attachmentUrl && (
                  <Text style={[styles.messageText, { color: bubbleTextColor }]}>Video unavailable</Text>
                )}
                {isFile && attachmentUrl && (
                  <TouchableOpacity style={styles.messageFile} onPress={() => Linking.openURL(attachmentUrl)}>
                    <Ionicons name="document-text-outline" size={24} color={bubbleTextColor} />
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, { color: bubbleTextColor }]} numberOfLines={1}>
                        {attachmentName || 'File'}
                      </Text>
                      <Text style={[styles.fileSize, { color: bubbleTextColor }]}>
                        {(fileExt || 'File')}{fileSizeLabel ? ` · ${fileSizeLabel}` : ''}
                      </Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={bubbleTextColor} />
                  </TouchableOpacity>
                )}
                {isFile && !attachmentUrl && (
                  <Text style={[styles.messageText, { color: bubbleTextColor }]}>File unavailable</Text>
                )}
                {isPoll && pollData ? (
                  <PollBubble
                    pollData={pollData}
                    currentUserId={user?.id || ''}
                    isOwn={isOwn}
                    onVote={(optionIndex) => handlePollVote(item, optionIndex)}
                    onVoteMultiple={(optionIndexes) => handlePollVoteMultiple(item, optionIndexes)}
                  />
                ) : (isImage && attachmentUrl) || (isFile && attachmentUrl) || (isVideo && attachmentUrl) ? null : (
                  <Text
                    style={[
                      styles.messageText,
                      { color: bubbleTextColor, fontSize: messageFontSize, lineHeight: messageLineHeight },
                    ]}
                  >
                    {isPoll ? 'Poll unavailable' : displayContent}
                    {showTimestamps && !readReceiptsEnabled && !isPinned && !isSaved && (
                      <InlineMeta asTextComponent={true} />
                    )}
                  </Text>
                )}
                {(item.type !== 'text' || readReceiptsEnabled || isPinned || isSaved) && showTimestamps && (
                  <View style={styles.metaBelowContent}>
                    <InlineMeta />
                  </View>
                )}
              </View>
            )}

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
  }, [user, renderedMessages, handleReaction, readReceiptsEnabled, pinnedMessageId, savedMessageIds, maxBubbleWidth, chatTheme, signedAttachmentUrls, imageLoadErrors, openMediaViewer]);

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

  const renderBackground = () => {
    if (chatBackground.type === 'image' && chatBackground.image) {
      return (
        <>
          <Image
            source={chatBackground.image}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: chatBackground.overlayColor,
                opacity: chatBackground.overlayOpacity,
              },
            ]}
          />
        </>
      );
    } else if (chatBackground.type === 'gradient' && chatBackground.colors) {
      return (
        <>
          <LinearGradient
            colors={chatBackground.colors}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: chatBackground.overlayColor,
                opacity: chatBackground.overlayOpacity,
              },
            ]}
          />
        </>
      );
    } else {
      // Solid color
      return (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: chatBackground.color || chatTheme.backgroundColor },
          ]}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {renderBackground()}
      <View style={styles.headerTopFill} />
        <View style={styles.container}>
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

          <FlatList
            ref={flatListRef}
            data={renderedMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{
              padding: 16,
              paddingTop: listInputSpacer + Math.max(12, keyboardHeight - 10), // slight gap above input
              paddingBottom: 16,
            }}
            style={{ flex: 1 }}
            inverted
            maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 80 }}
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

          <Animated.View
            style={[styles.inputContainer, { transform: [{ translateY: inputTranslateAnim }] }]}
            onLayout={(event) => {
              const nextHeight = Math.round(event.nativeEvent.layout.height);
              if (nextHeight && nextHeight !== inputHeight) {
                setInputHeight(nextHeight);
              }
            }}
          >

            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={openPlusMenu}
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
                onPress={() => setShowMessageOptions(true)}
                style={styles.inputAction}
              >
                <Ionicons
                  name={messageOptions.viewOnce ? 'eye-off' : 'timer-outline'}
                  size={20}
                  color={
                    messageOptions.viewOnce || (messageOptions.timedDuration && messageOptions.timedDuration > 0)
                      ? theme.colors.accent
                      : theme.colors.textMuted
                  }
                />
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

          </Animated.View>

        </View>

    <BackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
        conversationId={conversationId}
      />

      <Modal
        visible={showPlusMenu}
        transparent
        animationType="none"
        onRequestClose={closePlusMenu}
      >
        <View style={styles.plusMenuBackdrop}>
          <BlurView intensity={60} style={StyleSheet.absoluteFillObject} />
          {/* <View style={styles.plusMenuBlurTint} /> */}
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closePlusMenu} />
          <Animated.View
            style={[
              styles.plusMenuListContainer,
              {
                top: 0,
                paddingBottom: inputHeight + 12,
                transform: [
                  {
                    translateY: plusMenuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                  {
                    scale: plusMenuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
                opacity: plusMenuAnim,
              },
            ]}
          >
            <ScrollView
              style={styles.plusMenuList}
              contentContainerStyle={[
                styles.plusMenuListContent,
                { paddingTop: screenHeight * 0.5 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {plusMenuItems.map((item) => {
                const handlePress = () => {
                  closePlusMenu();
                  // Increased delay to ensure menu animation completes before opening native pickers
                  setTimeout(() => {
                    switch (item.key) {
                      case 'photos':
                        handlePickImage();
                        break;
                      case 'camera':
                        setShowCameraPicker(true);
                        break;
                      case 'file':
                        handlePickFile();
                        break;
                      case 'poll':
                        setShowPollCreator(true);
                        break;
                      case 'location':
                        setShowLocationPicker(true);
                        break;
                      case 'gif':
                        setShowGifPicker(true);
                        break;
                      case 'sticker':
                        Alert.alert('Coming Soon', 'Sticker picker will be available soon!');
                        break;
                      case 'contact':
                        Alert.alert('Coming Soon', 'Contact picker will be available soon!');
                        break;
                      case 'game':
                        Alert.alert('Coming Soon', 'Games will be available soon!');
                        break;
                      case 'extension':
                        Alert.alert('Coming Soon', 'Extensions will be available soon!');
                        break;
                    }
                  }, 500);
                };

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.plusMenuItem}
                    activeOpacity={0.8}
                    onPress={handlePress}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={30}
                      color={item.tint}
                      style={styles.plusMenuIconGlyph}
                    />
                    <View style={styles.plusMenuTextWrap}>
                      <Text style={styles.plusMenuText}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <MediaViewer
        visible={mediaViewerVisible}
        mediaItems={mediaItems}
        initialIndex={mediaViewerIndex}
        onClose={() => setMediaViewerVisible(false)}
        onReply={(message) => {
          setReplyingTo(message);
          setMediaViewerVisible(false);
        }}
        onReact={handleReaction}
        onForward={handleForwardMessage}
        onDelete={handleDeleteMessage}
        onEdit={handleEditFromViewer}
        onGoToMessage={(message) => {
          const index = renderedMessages.findIndex((msg) => msg.id === message.id);
          if (index >= 0) {
            setMediaViewerVisible(false);
            requestAnimationFrame(() => {
              flatListRef.current?.scrollToIndex({ index, viewPosition: 0.4, animated: true });
            });
          }
        }}
      />

      {imageToEdit && (
        <AdvancedImageEditor
          visible={showAdvancedEditor}
          imageUri={imageToEdit.url}
          onClose={() => {
            setShowAdvancedEditor(false);
            setImageToEdit(null);
          }}
          onSave={async (uri, caption, sendMode, timerSeconds) => {
            await handleSavePhoto(uri, caption);
            setShowAdvancedEditor(false);
            setImageToEdit(null);
          }}
          hapticsEnabled={currentSettings.hapticFeedback}
          accentColor={accentHex}
        />
      )}

      {photoToEdit && (
        <AdvancedImageEditor
          visible={showPhotoEditor}
          imageUri={photoToEdit}
          onClose={() => {
            setShowPhotoEditor(false);
            setPhotoToEdit(null);
          }}
          onSave={handleSavePhoto}
        />
      )}

      <GifPicker
        visible={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={handleSelectGif}
      />

      <PollCreator
        visible={showPollCreator}
        onClose={() => setShowPollCreator(false)}
        onCreatePoll={handleCreatePoll}
      />

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleSelectLocation}
      />

      <MessageOptionsModal
        visible={showMessageOptions}
        onClose={() => setShowMessageOptions(false)}
        onConfirm={(options) => {
          setMessageOptions(options);
          setShowMessageOptions(false);
        }}
      />

      <CameraPicker
        visible={showCameraPicker}
        onClose={() => setShowCameraPicker(false)}
        onPhotoTaken={handleCameraPhoto}
        onVideoTaken={handleCameraVideo}
      />

      <ForwardMessageModal
        visible={showForwardModal}
        message={messageToForward}
        conversations={[]}
        onClose={() => setShowForwardModal(false)}
        onForward={handleForwardSubmit}
      />
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
  headerTopFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: theme.colors.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 16,
    backgroundColor: theme.colors.base,
    borderBottomWidth: 0,
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
    marginTop: 18,
    marginBottom: 18,
    paddingVertical: 6,
  },
  dateSeparatorText: {
    color: theme.colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 999,
  },
  messageContainer: {
    marginBottom: 0,
    maxWidth: '90%',
  },
  messageContainerOwn: {
    alignSelf: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarRow: {
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  avatarSpacer: {
    width: 40,
  },
  messageBubbleContainer: {
    flexShrink: 1,
    maxWidth: '100%',
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
  avatarColumn: {
    width: 32,
    alignItems: 'center',
    marginRight: 6,
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
    padding: 10,
    paddingHorizontal: 14,
    maxWidth: 320,
  },
  mediaBubble: {
    padding: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
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
    flexShrink: 1,
  },
  textAndMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 1,
  },
  metaBelowContent: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageMetaOwn: {
    alignSelf: 'flex-end',
  },
  timestampInside: {
    fontSize: 11,
    color: 'rgba(30,41,59,0.6)',
  },
  timestampInsideOwn: {
    color: 'rgba(248,250,252,0.8)',
  },
  readReceiptsInside: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.05)',
  },
  inlineMetaOwn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  timestampInline: {
    fontSize: 10,
    color: 'rgba(30,41,59,0.65)',
    fontWeight: '500',
  },
  timestampInlineOwn: {
    color: 'rgba(248,250,252,0.75)',
  },
  messageFlagsInside: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 2,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  imageErrorFallback: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: 4,
  },
  videoPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    marginBottom: 4,
  },
  videoPreviewText: {
    marginTop: 8,
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaCaption: {
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontSize: 13,
    lineHeight: 18,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  inputAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  textInput: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  sendButtonInactive: {
    backgroundColor: 'rgba(0,0,0,1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
  plusMenuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  plusMenuBlurTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  plusMenuListContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  plusMenuList: {
    width: '100%',
  },
  plusMenuListContent: {
    paddingBottom: 0,
    gap: 12,
  },
  plusMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 16,
    borderRadius: 16,
  },
  plusMenuIconGlyph: {
    textShadowColor: 'transparent',
  },
  plusMenuText: {
    fontSize: 22,
    color: 'rgba(255,255,255)',
    fontWeight: '700',
    // boxShadow: '0 0 50px 3px rgba(255,255,255,0.5)',
  },
  plusMenuTextWrap: {
    position: 'relative',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  plusMenuTextGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0)',
    borderRadius: 999,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 3,
  },
  mediaViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 10, 0.98)',
  },
  mediaViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 46,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 4,
    backgroundColor: 'rgba(8, 10, 20, 0.6)',
  },
  mediaViewerClose: {
    width: 40,
    alignItems: 'flex-start',
  },
  mediaViewerTitle: {
    alignItems: 'center',
    gap: 2,
  },
  mediaViewerTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  mediaViewerCounter: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  mediaViewerHeaderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaViewerHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mediaViewerSlide: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  mediaViewerImage: {
    width: Dimensions.get('window').width,
    maxHeight: Dimensions.get('window').height * 0.78,
  },
  mediaViewerVideo: {
    width: '100%',
    height: Dimensions.get('window').height * 0.6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaViewerVideoText: {
    marginTop: 10,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaViewerCaption: {
    marginTop: 16,
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  mediaViewerThumbs: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  mediaViewerFooterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 14,
    paddingTop: 8,
    backgroundColor: 'rgba(8, 10, 20, 0.55)',
    zIndex: 3,
  },
  mediaViewerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  mediaViewerActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  mediaViewerActionIconDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
  },
  mediaViewerActionSpacer: {
    flex: 1,
  },
  mediaViewerReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  mediaViewerReaction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  mediaViewerReactionText: {
    fontSize: 16,
  },
  mediaViewerReactionPlus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  mediaViewerEmojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  mediaViewerEmojiItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  mediaViewerOverlayRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaViewerOverlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  mediaViewerReplyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaViewerMoreMenu: {
    position: 'absolute',
    top: 90,
    right: 16,
    backgroundColor: 'rgba(10,12,20,0.85)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    minWidth: 160,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  mediaViewerMoreItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  mediaViewerMoreText: {
    color: 'white',
    fontSize: 13,
  },
  mediaViewerThumbItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mediaViewerThumbItemActive: {
    borderColor: 'transparent',
  },
  mediaViewerThumbImage: {
    width: '100%',
    height: '100%',
  },
  mediaViewerThumbVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

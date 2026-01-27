import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
  Pressable,
  FlatList,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Message } from '../../types';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  message: Message;
}

interface MediaViewerProps {
  visible: boolean;
  mediaItems: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onForward: (message: Message) => void;
  onDelete: (message: Message) => void;
  onEdit: (mediaItem: MediaItem) => void;
  onGoToMessage?: (message: Message) => void;
  onQuickDraw?: (mediaItem: MediaItem) => void;
}

const PRESET_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export const MediaViewer: React.FC<MediaViewerProps> = ({
  visible,
  mediaItems,
  initialIndex,
  onClose,
  onReply,
  onReact,
  onForward,
  onDelete,
  onEdit,
  onGoToMessage,
  onQuickDraw,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const thumbnailScrollRef = useRef<FlatList>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const currentItem = mediaItems[currentIndex];
  const currentMessage = currentItem?.message;

  // Keep index in sync when initialIndex changes
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setShowReactionPicker(false);
      setShowMoreMenu(false);
    }
  }, [visible, initialIndex]);

  // Scroll to initial item when viewer opens
  React.useEffect(() => {
    if (visible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: currentIndex * SCREEN_WIDTH,
          animated: false,
        });
      }, 50);
    }
  }, [visible, currentIndex]);

  // Auto-scroll thumbnail when current index changes
  React.useEffect(() => {
    if (visible && thumbnailScrollRef.current && currentIndex >= 0) {
      requestAnimationFrame(() => {
        thumbnailScrollRef.current?.scrollToIndex({
          index: currentIndex,
          animated: true,
          viewPosition: 0.5,
        });
      });
    }
  }, [currentIndex, visible]);

  const handleScrollEnd = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < mediaItems.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex, mediaItems.length]);

  // Separate effect for haptics to avoid blocking scroll
  React.useEffect(() => {
    if (visible && currentIndex >= 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentIndex, visible]);

  const toggleControls = useCallback(() => {
    setShowControls((prev) => {
      const newValue = prev ? 0 : 1;
      Animated.timing(controlsOpacity, {
        toValue: newValue,
        duration: 250,
        useNativeDriver: true,
      }).start();
      return !prev;
    });
    setShowReactionPicker(false);
    setShowMoreMenu(false);
  }, [controlsOpacity]);

  const handleReaction = useCallback((emoji: string) => {
    if (currentMessage) {
      onReact(currentMessage.id, emoji);
      setShowReactionPicker(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentMessage, onReact]);

  const handleSave = useCallback(async () => {
    if (!currentItem) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to save media.');
        return;
      }

      const fileUri = FileSystem.documentDirectory + `media_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(currentItem.url, fileUri);

      if (downloadResult.status === 200) {
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Alert.alert('Saved', 'Media saved to your gallery.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Error', 'Failed to save media.');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save media.');
    }
  }, [currentItem]);

  const handleDelete = useCallback(() => {
    if (!currentMessage) return;

    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(currentMessage);
            onClose();
          },
        },
      ]
    );
  }, [currentMessage, onDelete, onClose]);

  const handleKeep = useCallback(() => {
    Alert.alert('Keep', 'This message will be saved from auto-deletion.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleShare = useCallback(() => {
    Alert.alert('Share', 'Share functionality coming soon!');
  }, []);

  const handleViewInfo = useCallback(() => {
    if (!currentMessage) return;
    const metadata = typeof currentMessage.metadata === 'string'
      ? JSON.parse(currentMessage.metadata || '{}')
      : currentMessage.metadata || {};

    const info = `
File: ${metadata.fileName || 'Unknown'}
Size: ${metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
Sent: ${new Date(currentMessage.created_at).toLocaleString()}
From: ${currentMessage.sender.display_name || currentMessage.sender.username}
    `.trim();

    Alert.alert('Media Info', info);
  }, [currentMessage]);

  const handleQuickDraw = useCallback(() => {
    if (currentItem && onQuickDraw) {
      onQuickDraw(currentItem);
      onClose();
    } else {
      Alert.alert('Quick Draw', 'Quick draw feature coming soon!');
    }
  }, [currentItem, onQuickDraw, onClose]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDisappearingMessage = useMemo(() => {
    return currentMessage?.type === 'view-once' || currentMessage?.type === 'timed-message';
  }, [currentMessage]);

  const renderThumbnail = useCallback(
    ({ item, index }: { item: MediaItem; index: number }) => {
      const distance = Math.abs(index - currentIndex);
      const isActive = index === currentIndex;

      // Size and opacity based on distance from current
      let opacity = 0.5;
      let width = 40;
      let height = 40;

      if (isActive) {
        opacity = 1;
        width = 54;
        height = 54;
      } else if (distance === 1) {
        opacity = 0.7;
        width = 42;
        height = 42;
      }

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setCurrentIndex(index);
            scrollViewRef.current?.scrollTo({
              x: index * SCREEN_WIDTH,
              animated: true,
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[
            styles.thumbnail,
            {
              width,
              height,
              opacity,
            },
          ]}
        >
          <Image
            source={{ uri: item.url }}
            style={styles.thumbnailImage}
            contentFit={isActive ? 'contain' : 'cover'}
            cachePolicy="memory-disk"
            priority="high"
            recyclingKey={`thumb-${item.id}`}
          />
          {item.type === 'video' && (
            <View style={styles.thumbnailVideoIndicator}>
              <Ionicons name="play" size={8} color="white" />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [currentIndex]
  );

  if (!visible || !currentItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Main Media Scroll View */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          bounces={false}
          decelerationRate="fast"
        >
          {mediaItems.map((item, idx) => (
            <Pressable
              key={item.id}
              style={styles.mediaContainer}
              onPress={toggleControls}
            >
              <Image
                source={{ uri: item.url }}
                style={styles.mediaImage}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={0}
                priority={Math.abs(idx - currentIndex) <= 1 ? 'high' : 'normal'}
                recyclingKey={`media-${item.id}`}
              />
              {item.type === 'video' && (
                <View style={styles.videoPlayOverlay}>
                  <Ionicons name="play-circle" size={64} color="white" />
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Controls Overlay with Fade Animation */}
        <Animated.View
          style={[styles.controlsContainer, { opacity: controlsOpacity }]}
          pointerEvents={showControls ? 'box-none' : 'none'}
        >
          {/* Top Gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={styles.topGradient}
            pointerEvents="box-none"
          >
            <View style={styles.topBar}>
              <TouchableOpacity onPress={onClose} style={styles.topButton}>
                <Ionicons name="chevron-back" size={28} color="white" />
              </TouchableOpacity>

              <View style={styles.topCenter}>
                <Text style={styles.topCenterText} numberOfLines={1}>
                  {currentMessage?.sender.display_name || currentMessage?.sender.username}
                </Text>
                <Text style={styles.topCenterSubtext}>
                  {formatTime(currentMessage?.created_at || '')}
                </Text>
              </View>

              <View style={styles.topRight}>
                <TouchableOpacity
                  onPress={() => currentItem && onEdit(currentItem)}
                  style={styles.topButton}
                >
                  <Ionicons name="color-wand-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowMoreMenu(!showMoreMenu)}
                  style={styles.topButton}
                >
                  <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* More Menu Dropdown */}
            {showMoreMenu && (
              <View style={styles.moreMenu}>
                {onGoToMessage && (
                  <TouchableOpacity
                    style={styles.moreMenuItem}
                    onPress={() => {
                      setShowMoreMenu(false);
                      onGoToMessage(currentMessage);
                      onClose();
                    }}
                  >
                    <Ionicons name="locate-outline" size={20} color="white" />
                    <Text style={styles.moreMenuText}>Go to Message in Chat</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.moreMenuItem}
                  onPress={() => {
                    setShowMoreMenu(false);
                    handleViewInfo();
                  }}
                >
                  <Ionicons name="information-circle-outline" size={20} color="white" />
                  <Text style={styles.moreMenuText}>View Media Info</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moreMenuItem}
                  onPress={() => {
                    setShowMoreMenu(false);
                    handleShare();
                  }}
                >
                  <Ionicons name="share-outline" size={20} color="white" />
                  <Text style={styles.moreMenuText}>Share to Other Apps</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>

          {/* Bottom Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.bottomGradient}
            pointerEvents="box-none"
          >
            {/* Reaction & Reply Row (above thumbnails) */}
            <View style={styles.reactionReplyRow}>
              <TouchableOpacity
                style={styles.reactionButton}
                onPress={() => setShowReactionPicker(!showReactionPicker)}
              >
                <Ionicons name="happy-outline" size={22} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => {
                  onReply(currentMessage);
                  onClose();
                }}
              >
                <Ionicons name="arrow-undo-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>

            {/* Reaction Picker */}
            {showReactionPicker && (
              <View style={styles.reactionPicker}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PRESET_REACTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.reactionEmoji}
                      onPress={() => handleReaction(emoji)}
                    >
                      <Text style={styles.reactionEmojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.reactionEmoji}
                    onPress={() => {
                      Alert.alert('Emoji Picker', 'Full emoji picker coming soon!');
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={26} color="white" />
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {/* Thumbnail Strip (compact and centered) */}
            {mediaItems.length > 1 && (
              <View style={styles.thumbnailStrip}>
                <FlatList
                  ref={thumbnailScrollRef}
                  data={mediaItems}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderThumbnail}
                  keyExtractor={(item) => item.id}
                  extraData={currentIndex}
                  contentContainerStyle={styles.thumbnailList}
                  getItemLayout={(_data, index) => ({
                    length: 54,
                    offset: 54 * index,
                    index,
                  })}
                  initialScrollIndex={currentIndex >= 0 ? currentIndex : 0}
                  onScrollToIndexFailed={() => {}}
                  removeClippedSubviews={false}
                  maxToRenderPerBatch={15}
                  windowSize={21}
                  initialNumToRender={11}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleQuickDraw}
              >
                <Ionicons name="pencil-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Draw</Text>
              </TouchableOpacity>

              {isDisappearingMessage && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleKeep}
                >
                  <Ionicons name="bookmark-outline" size={24} color="white" />
                  <Text style={styles.actionButtonText}>Keep</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
              >
                <Ionicons name="download-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onForward(currentMessage);
                  onClose();
                }}
              >
                <Ionicons name="arrow-forward-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Forward</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => currentItem && onEdit(currentItem)}
              >
                <Ionicons name="color-wand-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topButton: {
    padding: 8,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  topCenterText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  topCenterSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  topRight: {
    flexDirection: 'row',
    gap: 8,
  },
  moreMenu: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  moreMenuText: {
    fontSize: 16,
    color: 'white',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 40,
  },
  reactionReplyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  reactionButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  replyButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  reactionPicker: {
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  reactionEmoji: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmojiText: {
    fontSize: 26,
  },
  thumbnailStrip: {
    height: 64,
    marginBottom: 14,
    justifyContent: 'center',
  },
  thumbnailList: {
    paddingHorizontal: SCREEN_WIDTH / 2 - 27,
    alignItems: 'center',
  },
  thumbnail: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  thumbnailActive: {
    borderColor: 'transparent',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailVideoIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 2,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
    marginTop: 3,
  },
  deleteButton: {
    // Red styling applied to icon and text individually
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});

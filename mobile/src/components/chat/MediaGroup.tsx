import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_BUBBLE_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 340);

interface MediaGroupProps {
  messages: Message[];
  onMediaPress: (messageId: string) => void;
  maxWidth?: number;
}

interface GroupedMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  message: Message;
}

export const MediaGroup: React.FC<MediaGroupProps> = ({
  messages,
  onMediaPress,
  maxWidth = MAX_BUBBLE_WIDTH,
}) => {
  // Extract and group media from consecutive messages
  const mediaItems: GroupedMedia[] = useMemo(() => {
    return messages
      .map((msg) => {
        // Extract media URL from message
        const metadata = typeof msg.metadata === 'string'
          ? JSON.parse(msg.metadata || '{}')
          : msg.metadata || {};

        const attachments = Array.isArray(msg.attachments)
          ? msg.attachments
          : typeof msg.attachments === 'string'
          ? JSON.parse(msg.attachments || '[]')
          : [];

        const attachment = attachments[0];
        const url = attachment?.url || msg.file_url || metadata?.fileUrl;

        if (!url) return null;

        const type = msg.type === 'video' || msg.file_type === 'video' ? 'video' : 'image';

        return {
          id: msg.id,
          url,
          type,
          message: msg,
        };
      })
      .filter((item): item is GroupedMedia => item !== null);
  }, [messages]);

  // Calculate layout based on number of items
  const getLayout = () => {
    const count = mediaItems.length;

    if (count === 1) {
      return {
        rows: [[0]],
        itemWidth: maxWidth,
        itemHeight: maxWidth * 0.75,
      };
    }

    if (count === 2) {
      return {
        rows: [[0, 1]],
        itemWidth: (maxWidth - 4) / 2,
        itemHeight: maxWidth * 0.6,
      };
    }

    if (count === 3) {
      return {
        rows: [[0], [1, 2]],
        itemWidth: (maxWidth - 4) / 2,
        itemHeight: (maxWidth - 4) / 2,
      };
    }

    if (count === 4) {
      return {
        rows: [[0, 1], [2, 3]],
        itemWidth: (maxWidth - 4) / 2,
        itemHeight: (maxWidth - 4) / 2,
      };
    }

    // For 5+ items, show first 4 with "+N" overlay on last
    return {
      rows: [[0, 1], [2, 3]],
      itemWidth: (maxWidth - 4) / 2,
      itemHeight: (maxWidth - 4) / 2,
      showMore: true,
      moreCount: count - 4,
    };
  };

  const layout = getLayout();

  const renderMediaItem = (index: number, width: number, height: number) => {
    const item = mediaItems[index];
    if (!item) return null;

    const isLast = index === 3 && layout.showMore;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.mediaItem, { width, height }]}
        activeOpacity={0.9}
        onPress={() => onMediaPress(item.id)}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.mediaImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />

        {item.type === 'video' && (
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={32} color="white" />
          </View>
        )}

        {isLast && layout.moreCount && layout.moreCount > 0 && (
          <View style={styles.moreOverlay}>
            <Text style={styles.moreText}>+{layout.moreCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (mediaItems.length === 0) return null;

  return (
    <View style={[styles.container, { width: maxWidth }]}>
      {layout.rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((itemIndex) => renderMediaItem(itemIndex, layout.itemWidth, layout.itemHeight))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  mediaItem: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  moreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  moreText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
});

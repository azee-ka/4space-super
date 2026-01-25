import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface GifPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

interface GifResult {
  id: string;
  url: string;
  previewUrl: string;
  title: string;
}

const GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY'; // Replace with actual API key
const TRENDING_ENDPOINT = `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=50`;
const SEARCH_ENDPOINT = (query: string) =>
  `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=50`;

export const GifPicker: React.FC<GifPickerProps> = ({
  visible,
  onClose,
  onSelectGif,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchTrendingGifs();
    }
  }, [visible]);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(TRENDING_ENDPOINT);
      const data = await response.json();
      const formattedGifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        previewUrl: gif.images.fixed_width_small.url,
        title: gif.title,
      }));
      setGifs(formattedGifs);
    } catch (error) {
      console.error('Error fetching trending gifs:', error);
      // Use mock data for now
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      fetchTrendingGifs();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(SEARCH_ENDPOINT(query));
      const data = await response.json();
      const formattedGifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        previewUrl: gif.images.fixed_width_small.url,
        title: gif.title,
      }));
      setGifs(formattedGifs);
    } catch (error) {
      console.error('Error searching gifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchGifs(searchQuery);
  };

  const handleSelectGif = (gif: GifResult) => {
    onSelectGif(gif.url);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a GIF</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder="Search GIFs..."
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              fetchTrendingGifs();
            }}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : (
          <FlatList
            data={gifs}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gifItem}
                onPress={() => handleSelectGif(item)}
              >
                <Image
                  source={{ uri: item.previewUrl }}
                  style={styles.gifImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={48} color={theme.colors.textSubtle} />
                <Text style={styles.emptyText}>No GIFs found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            }
          />
        )}

        <View style={styles.footer}>
          <Text style={styles.poweredBy}>Powered by GIPHY</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 8,
  },
  gifItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
});

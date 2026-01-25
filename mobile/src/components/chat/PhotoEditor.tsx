import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { theme } from '../../styles/theme';

interface PhotoEditorProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onSave: (uri: string, caption?: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  visible,
  imageUri,
  onClose,
  onSave,
}) => {
  const [editedUri, setEditedUri] = useState(imageUri);
  const [caption, setCaption] = useState('');
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = [
    { id: 'none', name: 'Original' },
    { id: 'grayscale', name: 'B&W' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'saturate', name: 'Vibrant' },
  ];

  const handleRotate = async () => {
    try {
      const newRotation = (rotation + 90) % 360;
      setRotation(newRotation);

      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setEditedUri(manipResult.uri);
    } catch (error) {
      console.error('Error rotating image:', error);
    }
  };

  const handleFlip = async (direction: 'horizontal' | 'vertical') => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ flip: direction === 'horizontal'
            ? ImageManipulator.FlipType.Horizontal
            : ImageManipulator.FlipType.Vertical
        }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setEditedUri(manipResult.uri);
    } catch (error) {
      console.error('Error flipping image:', error);
    }
  };

  const handleSave = () => {
    onSave(editedUri, caption);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Photo</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Ionicons name="checkmark" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: editedUri }}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption..."
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.captionInput}
            multiline
            maxLength={200}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Editing Tools */}
        <View style={styles.toolsContainer}>
          <TouchableOpacity style={styles.tool} onPress={handleRotate}>
            <Ionicons name="refresh" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.toolText}>Rotate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool} onPress={() => handleFlip('horizontal')}>
            <Ionicons name="swap-horizontal" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.toolText}>Flip H</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool} onPress={() => handleFlip('vertical')}>
            <Ionicons name="swap-vertical" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.toolText}>Flip V</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool}>
            <Ionicons name="crop" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.toolText}>Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool}>
            <Ionicons name="text" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.toolText}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool}>
            <Ionicons name="brush" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.toolText}>Draw</Text>
          </TouchableOpacity>
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
  },
  captionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  captionInput: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    minHeight: 40,
    maxHeight: 80,
  },
  filtersContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  filterTextActive: {
    color: theme.colors.base,
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tool: {
    alignItems: 'center',
    gap: 4,
  },
  toolText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});

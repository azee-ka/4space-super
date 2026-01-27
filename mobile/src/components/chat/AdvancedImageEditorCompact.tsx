import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { ScrollableTickSlider } from './ScrollableTickSlider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CACHE_DIR = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';

interface AdvancedImageEditorProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onSave: (uri: string) => void;
  hapticsEnabled?: boolean;
  accentColor?: string;
}

type Tool = 'none' | 'crop' | 'filters' | 'adjust';
type FilterType = 'none' | 'vivid' | 'vivid-warm' | 'vivid-cool' | 'dramatic' | 'dramatic-warm' | 'dramatic-cool' | 'mono' | 'silvertone' | 'noir';
type AdjustmentKey = 'brightness' | 'contrast' | 'saturation' | 'exposure' | 'highlights' | 'shadows' | 'warmth';

const FILTERS = [
  { id: 'none', name: 'Original', adjustments: [] },
  { id: 'vivid', name: 'Vivid', adjustments: [{ brightness: 0.05 }, { contrast: 1.15 }, { saturate: 1.4 }] },
  { id: 'vivid-warm', name: 'Vivid Warm', adjustments: [{ brightness: 0.08 }, { saturate: 1.3 }, { contrast: 1.1 }] },
  { id: 'dramatic', name: 'Dramatic', adjustments: [{ contrast: 1.4 }, { brightness: -0.12 }, { saturate: 1.25 }] },
  { id: 'mono', name: 'Mono', adjustments: [{ grayscale: 1 }, { contrast: 1.15 }] },
  { id: 'noir', name: 'Noir', adjustments: [{ grayscale: 1 }, { contrast: 1.5 }, { brightness: -0.25 }] },
];

const ADJUSTMENTS = [
  { key: 'brightness', label: 'Bright', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'saturation', label: 'Saturate', min: -100, max: 100 },
  { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
  { key: 'highlights', label: 'Lights', min: -100, max: 100 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100 },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100 },
] as const;

export function AdvancedImageEditorCompact({
  visible,
  imageUri,
  onClose,
  onSave,
  hapticsEnabled = true,
  accentColor = '#007AFF',
}: AdvancedImageEditorProps) {
  const [workingUri, setWorkingUri] = useState(imageUri);
  const [currentTool, setCurrentTool] = useState<Tool>('none');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<AdjustmentKey, number>>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    warmth: 0,
  });
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentKey>('brightness');
  const [cropRotation, setCropRotation] = useState(0);
  const originalUriRef = useRef(imageUri);
  const undoStack = useRef<string[]>([imageUri]);
  const undoIndex = useRef(0);

  const canUndo = undoIndex.current > 0;
  const canRedo = undoIndex.current < undoStack.current.length - 1;

  const triggerImpact = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticsEnabled]);

  const pushToUndo = useCallback((uri: string) => {
    undoStack.current = undoStack.current.slice(0, undoIndex.current + 1);
    undoStack.current.push(uri);
    undoIndex.current += 1;
  }, []);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undoIndex.current -= 1;
      setWorkingUri(undoStack.current[undoIndex.current]);
      triggerImpact();
    }
  }, [canUndo, triggerImpact]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      undoIndex.current += 1;
      setWorkingUri(undoStack.current[undoIndex.current]);
      triggerImpact();
    }
  }, [canRedo, triggerImpact]);

  const applyFilter = useCallback(async (filterId: FilterType) => {
    setIsProcessing(true);
    setSelectedFilter(filterId);
    triggerImpact();

    try {
      const filter = FILTERS.find((f) => f.id === filterId);
      if (!filter || filter.id === 'none') {
        setWorkingUri(originalUriRef.current);
        return;
      }

      const result = await ImageManipulator.manipulateAsync(
        originalUriRef.current,
        [],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setWorkingUri(result.uri);
      pushToUndo(result.uri);
    } catch (error) {
      console.error('Filter error:', error);
      Alert.alert('Error', 'Failed to apply filter');
    } finally {
      setIsProcessing(false);
    }
  }, [triggerImpact, pushToUndo]);

  const handleRotate = useCallback(async () => {
    setIsProcessing(true);
    triggerImpact();

    try {
      const newRotation = (rotation + 90) % 360;
      setRotation(newRotation);

      const result = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setWorkingUri(result.uri);
      pushToUndo(result.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to rotate image');
    } finally {
      setIsProcessing(false);
    }
  }, [workingUri, rotation, triggerImpact, pushToUndo]);

  const handleFlip = useCallback(async () => {
    setIsProcessing(true);
    triggerImpact();

    try {
      setFlipped(!flipped);

      const result = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setWorkingUri(result.uri);
      pushToUndo(result.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to flip image');
    } finally {
      setIsProcessing(false);
    }
  }, [workingUri, flipped, triggerImpact, pushToUndo]);

  const handleSaveEdited = useCallback(async () => {
    try {
      const finalUri = CACHE_DIR + `edited_${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: workingUri, to: finalUri });
      Alert.alert('Saved', 'Edited version saved separately');
      triggerImpact();
    } catch (error) {
      Alert.alert('Error', 'Failed to save edited version');
    }
  }, [workingUri, triggerImpact]);

  const handleDone = useCallback(() => {
    onSave(workingUri);
    onClose();
  }, [workingUri, onSave, onClose]);

  const selectedAdjustmentConfig = useMemo(
    () => ADJUSTMENTS.find((a) => a.key === selectedAdjustment) || ADJUSTMENTS[0],
    [selectedAdjustment]
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Compact Header - Status Bar Area */}
        <View style={styles.compactHeader}>
          <Pressable onPress={onClose} style={styles.headerButton} hitSlop={8}>
            <Ionicons name="close" size={22} color="white" />
          </Pressable>
          <Pressable onPress={handleDone} style={styles.headerButton} hitSlop={8}>
            <Ionicons name="checkmark" size={24} color={accentColor} />
          </Pressable>
        </View>

        {/* Second Row - Undo/Redo and Draw/More */}
        <View style={styles.toolsRow}>
          <View style={styles.toolsBubble}>
            <Pressable
              onPress={handleUndo}
              style={[styles.iconButton, !canUndo && styles.iconButtonDisabled]}
              disabled={!canUndo}
              hitSlop={8}
            >
              <Ionicons name="arrow-undo" size={18} color={canUndo ? 'white' : 'rgba(255,255,255,0.3)'} />
            </Pressable>
            <Pressable
              onPress={handleRedo}
              style={[styles.iconButton, !canRedo && styles.iconButtonDisabled]}
              disabled={!canRedo}
              hitSlop={8}
            >
              <Ionicons name="arrow-redo" size={18} color={canRedo ? 'white' : 'rgba(255,255,255,0.3)'} />
            </Pressable>
          </View>

          <Text style={styles.toolTitle}>
            {currentTool === 'none' ? '' : currentTool === 'adjust' ? 'Adjust' : currentTool === 'crop' ? 'Crop' : 'Filters'}
          </Text>

          <View style={styles.toolsBubble}>
            <Pressable onPress={() => Alert.alert('Draw', 'Coming soon!')} style={styles.iconButton} hitSlop={8}>
              <Ionicons name="pencil-outline" size={18} color="white" />
            </Pressable>
            <Pressable
              onPress={() => setShowMoreMenu(!showMoreMenu)}
              style={styles.iconButton}
              hitSlop={8}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="white" />
            </Pressable>
          </View>
        </View>

        {/* More Menu Dropdown */}
        {showMoreMenu && (
          <View style={styles.moreMenu}>
            <Pressable style={styles.moreMenuItem} onPress={() => { setShowMoreMenu(false); handleRotate(); }}>
              <Ionicons name="refresh" size={18} color="white" />
              <Text style={styles.moreMenuText}>Rotate</Text>
            </Pressable>
            <Pressable style={styles.moreMenuItem} onPress={() => { setShowMoreMenu(false); handleFlip(); }}>
              <Ionicons name="swap-horizontal" size={18} color="white" />
              <Text style={styles.moreMenuText}>Flip</Text>
            </Pressable>
            <Pressable style={styles.moreMenuItem} onPress={() => { setShowMoreMenu(false); handleSaveEdited(); }}>
              <Ionicons name="copy-outline" size={18} color="white" />
              <Text style={styles.moreMenuText}>Save Edit Separately</Text>
            </Pressable>
          </View>
        )}

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: workingUri }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="none"
          />
          {isProcessing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
        </View>

        {/* Compact Tool Options */}
        {currentTool === 'filters' && (
          <View style={styles.compactPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
              {FILTERS.map((filter) => (
                <Pressable
                  key={filter.id}
                  onPress={() => applyFilter(filter.id as FilterType)}
                  style={styles.filterItem}
                >
                  <View style={[
                    styles.filterThumb,
                    selectedFilter === filter.id && { borderColor: accentColor, borderWidth: 2 }
                  ]}>
                    <Image
                      source={{ uri: originalUriRef.current }}
                      style={styles.filterThumbImage}
                      contentFit="cover"
                    />
                  </View>
                  <Text style={[
                    styles.filterName,
                    selectedFilter === filter.id && { color: accentColor, fontWeight: '600' }
                  ]}>
                    {filter.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {currentTool === 'adjust' && (
          <View style={styles.compactPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adjustRow}>
              {ADJUSTMENTS.map((adj) => {
                const isActive = selectedAdjustment === adj.key;
                const value = Math.round(adjustments[adj.key]);
                return (
                  <Pressable
                    key={adj.key}
                    onPress={() => {
                      setSelectedAdjustment(adj.key);
                      triggerImpact();
                    }}
                    style={styles.adjustItem}
                  >
                    <View style={[
                      styles.adjustCircle,
                      isActive && { backgroundColor: accentColor }
                    ]}>
                      <Text style={[styles.adjustValue, isActive && { color: '#000' }]}>
                        {value > 0 ? `+${value}` : value}
                      </Text>
                    </View>
                    <Text style={[styles.adjustLabel, isActive && { color: accentColor, fontWeight: '600' }]}>
                      {adj.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.sliderContainer}>
              <ScrollableTickSlider
                min={selectedAdjustmentConfig.min}
                max={selectedAdjustmentConfig.max}
                value={adjustments[selectedAdjustment]}
                onChange={(value) => setAdjustments((prev) => ({ ...prev, [selectedAdjustment]: value }))}
                accentColor={accentColor}
                hapticsEnabled={hapticsEnabled}
              />
              <Text style={styles.sliderValue}>{adjustments[selectedAdjustment]}</Text>
            </View>
          </View>
        )}

        {currentTool === 'crop' && (
          <View style={styles.compactPanel}>
            <View style={styles.cropControls}>
              <Pressable
                style={styles.cropButton}
                onPress={() => {
                  setCropRotation((prev) => (prev + 90) % 360);
                  handleRotate();
                }}
              >
                <Text style={styles.cropButtonText}>Rotate {cropRotation}°</Text>
              </Pressable>
              <Pressable
                style={styles.cropButton}
                onPress={() => Alert.alert('Crop', 'Interactive crop coming soon!')}
              >
                <Text style={styles.cropButtonText}>Adjust Frame</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Compact Bottom Tabs */}
        <View style={styles.bottomTabs}>
          <Pressable
            style={[styles.tab, currentTool === 'adjust' && styles.tabActive]}
            onPress={() => { setCurrentTool('adjust'); triggerImpact(); }}
          >
            <Ionicons name="options-outline" size={20} color={currentTool === 'adjust' ? accentColor : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.tabText, currentTool === 'adjust' && { color: accentColor }]}>Adjust</Text>
          </Pressable>

          <Pressable
            style={[styles.tab, currentTool === 'crop' && styles.tabActive]}
            onPress={() => { setCurrentTool('crop'); triggerImpact(); }}
          >
            <Ionicons name="crop-outline" size={20} color={currentTool === 'crop' ? accentColor : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.tabText, currentTool === 'crop' && { color: accentColor }]}>Crop</Text>
          </Pressable>

          <Pressable
            style={[styles.tab, currentTool === 'filters' && styles.tabActive]}
            onPress={() => { setCurrentTool('filters'); triggerImpact(); }}
          >
            <Ionicons name="color-filter-outline" size={20} color={currentTool === 'filters' ? accentColor : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.tabText, currentTool === 'filters' && { color: accentColor }]}>Filters</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  headerButton: {
    padding: 8,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toolsBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  moreMenu: {
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  moreMenuText: {
    fontSize: 15,
    color: 'white',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  compactPanel: {
    backgroundColor: '#000',
    paddingVertical: 8,
  },
  filtersRow: {
    paddingHorizontal: 12,
    gap: 12,
    alignItems: 'center',
  },
  filterItem: {
    alignItems: 'center',
    gap: 6,
  },
  filterThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterThumbImage: {
    width: '100%',
    height: '100%',
  },
  filterName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  adjustRow: {
    paddingHorizontal: 12,
    gap: 16,
    alignItems: 'center',
  },
  adjustItem: {
    alignItems: 'center',
    gap: 6,
  },
  adjustCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  adjustLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  sliderContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  cropControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  cropButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cropButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingBottom: 30,
    paddingTop: 8,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 4,
  },
  tabActive: {
    // Active styling in icon and text color
  },
  tabText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
});

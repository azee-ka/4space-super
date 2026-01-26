import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  Dimensions,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { TickSlider } from './TickSlider';
import { MediaSendOptions, MediaSendMode } from './MediaSendOptions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CACHE_DIR = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';

interface AdvancedImageEditorProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onSave: (uri: string, caption?: string, sendMode?: MediaSendMode, timerSeconds?: number) => void;
  hapticsEnabled: boolean;
  accentColor: string;
}

type Tool = 'none' | 'crop' | 'filters' | 'adjust';
type FilterType = 'none' | 'vivid' | 'vivid-warm' | 'vivid-cool' | 'dramatic' | 'dramatic-warm' | 'dramatic-cool' | 'mono' | 'silvertone' | 'noir';
type AdjustmentKey =
  | 'brilliance'
  | 'exposure'
  | 'highlights'
  | 'shadows'
  | 'contrast'
  | 'brightness'
  | 'saturation'
  | 'vibrance'
  | 'warmth'
  | 'clarity'
  | 'definition'
  | 'sharpness'
  | 'noise'
  | 'grain'
  | 'fade'
  | 'tint'
  | 'blackPoint'
  | 'hue'
  | 'vignette';
type CropControlKey = 'rotation' | 'horizontalStretch' | 'verticalStretch';

interface Filter {
  id: FilterType;
  name: string;
  adjustments: any[];
}

const FILTERS: Filter[] = [
  { id: 'none', name: 'Original', adjustments: [] },
  { id: 'vivid', name: 'Vivid', adjustments: [{ brightness: 0.05 }, { contrast: 1.15 }, { saturate: 1.4 }] },
  { id: 'vivid-warm', name: 'Vivid Warm', adjustments: [{ brightness: 0.08 }, { saturate: 1.3 }, { contrast: 1.1 }] },
  { id: 'vivid-cool', name: 'Vivid Cool', adjustments: [{ brightness: 0.05 }, { saturate: 1.35 }, { contrast: 1.12 }] },
  { id: 'dramatic', name: 'Dramatic', adjustments: [{ contrast: 1.4 }, { brightness: -0.12 }, { saturate: 1.25 }] },
  { id: 'dramatic-warm', name: 'Dramatic Warm', adjustments: [{ contrast: 1.35 }, { brightness: -0.08 }, { saturate: 1.2 }] },
  { id: 'dramatic-cool', name: 'Dramatic Cool', adjustments: [{ contrast: 1.38 }, { brightness: -0.1 }, { saturate: 1.15 }] },
  { id: 'mono', name: 'Mono', adjustments: [{ grayscale: 1 }, { contrast: 1.15 }] },
  { id: 'silvertone', name: 'Silvertone', adjustments: [{ grayscale: 1 }, { contrast: 1.08 }, { brightness: 0.08 }] },
  { id: 'noir', name: 'Noir', adjustments: [{ grayscale: 1 }, { contrast: 1.5 }, { brightness: -0.25 }] },
];

const ADJUSTMENT_CONFIGS: {
  key: AdjustmentKey;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: 'brilliance', label: 'Brilliance', min: -100, max: 100, step: 1 },
  { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1 },
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1 },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100, step: 1 },
  { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, step: 1 },
  { key: 'tint', label: 'Tint', min: -100, max: 100, step: 1 },
  { key: 'hue', label: 'Hue', min: -100, max: 100, step: 1 },
  { key: 'fade', label: 'Fade', min: -100, max: 100, step: 1 },
  { key: 'blackPoint', label: 'Black Point', min: -100, max: 100, step: 1 },
  { key: 'sharpness', label: 'Sharpness', min: -100, max: 100, step: 1 },
  { key: 'clarity', label: 'Clarity', min: -100, max: 100, step: 1 },
  { key: 'definition', label: 'Definition', min: -100, max: 100, step: 1 },
  { key: 'noise', label: 'Noise', min: -100, max: 100, step: 1 },
  { key: 'grain', label: 'Grain', min: -100, max: 100, step: 1 },
  { key: 'vignette', label: 'Vignette', min: -100, max: 100, step: 1 },
];

const DEFAULT_ADJUSTMENTS = ADJUSTMENT_CONFIGS.reduce((acc, item) => {
  acc[item.key] = 0;
  return acc;
}, {} as Record<AdjustmentKey, number>);

const CROP_CONTROLS: {
  key: CropControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: 'rotation', label: 'Rotation', min: -45, max: 45, step: 1 },
  { key: 'horizontalStretch', label: 'Horizontal Stretch', min: -50, max: 50, step: 1 },
  { key: 'verticalStretch', label: 'Vertical Stretch', min: -50, max: 50, step: 1 },
];

const DEFAULT_CROP_SETTINGS = CROP_CONTROLS.reduce((acc, item) => {
  acc[item.key] = 0;
  return acc;
}, {} as Record<CropControlKey, number>);

export function AdvancedImageEditor({
  visible,
  imageUri,
  onClose,
  onSave,
  hapticsEnabled,
}: AdvancedImageEditorProps) {
  const [workingUri, setWorkingUri] = useState(imageUri);
  const [annotationText, setAnnotationText] = useState('');
  const [draftAnnotation, setDraftAnnotation] = useState('');
  const [textToolVisible, setTextToolVisible] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('none');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentKey>('exposure');
  const [adjustments, setAdjustments] = useState<Record<AdjustmentKey, number>>(DEFAULT_ADJUSTMENTS);
  const [selectedCropControl, setSelectedCropControl] = useState<CropControlKey>('rotation');
  const [cropSettings, setCropSettings] = useState<Record<CropControlKey, number>>(DEFAULT_CROP_SETTINGS);
  const downloadCacheRef = useRef<Record<string, string>>({});
  const originalUriRef = useRef(imageUri);
  const triggerImpact = useCallback(
    (style = Haptics.ImpactFeedbackStyle.Light) => {
      if (!hapticsEnabled || Platform.OS !== 'ios') return;
      Haptics.impactAsync(style);
    },
    [hapticsEnabled]
  );
  const triggerNotification = useCallback(() => {
    if (!hapticsEnabled || Platform.OS !== 'ios') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hapticsEnabled]);
  const ensureLocalUri = useCallback(
    async (uri: string) => {
      if (!CACHE_DIR) return uri;
      if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith(CACHE_DIR)) {
        return uri;
      }

      if (downloadCacheRef.current[uri]) {
        return downloadCacheRef.current[uri];
      }

      const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
      const destination = `${CACHE_DIR}editor-${Date.now()}.${extension}`;
      const result = await FileSystem.downloadAsync(uri, destination);
      downloadCacheRef.current[uri] = result.uri;
      return result.uri;
    },
    []
  );

  // Track applied modifications
  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;

    originalUriRef.current = imageUri;
    setWorkingUri(imageUri);
    setCurrentTool('adjust');
    setSelectedFilter('none');
    setSelectedAdjustment('exposure');
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedCropControl('rotation');
    setCropSettings(DEFAULT_CROP_SETTINGS);
    setAnnotationText('');
    setDraftAnnotation('');
    setTextToolVisible(false);

    const download = async () => {
      try {
        const localUri = await ensureLocalUri(imageUri);
        if (!cancelled) {
          originalUriRef.current = localUri;
          setWorkingUri(localUri);
        }
      } catch (error) {
        console.error('Image download error:', error);
      }
    };

    download();

    return () => {
      cancelled = true;
    };
  }, [visible, imageUri, ensureLocalUri]);

  const applyAllEdits = useCallback(
    async (options?: { filter?: FilterType; adjustments?: Record<AdjustmentKey, number> }) => {
      const filterId = options?.filter ?? selectedFilter;
      const adjustmentsState = options?.adjustments ?? adjustments;
      const filter = FILTERS.find((item) => item.id === filterId);

      const manualPayload: Record<string, number> = {};
      const brightnessValue = (adjustmentsState.brightness + adjustmentsState.exposure) / 100;
      if (Math.abs(brightnessValue) > 0.01) {
        manualPayload.brightness = brightnessValue;
      }

      const contrastValue = Math.abs(adjustmentsState.contrast) > 0.01 ? 1 + adjustmentsState.contrast / 100 : undefined;
      if (contrastValue !== undefined) {
        manualPayload.contrast = contrastValue;
      }

      const saturationValue = Math.abs(adjustmentsState.saturation) > 0.01 ? 1 + adjustmentsState.saturation / 100 : undefined;
      if (saturationValue !== undefined) {
        manualPayload.saturate = saturationValue;
      }

      const filterPayload = filter?.adjustments.reduce<Record<string, number>>((acc, entry) => {
        return { ...acc, ...entry };
      }, {}) ?? {};

      const payload = { ...filterPayload, ...manualPayload };

      if (Object.keys(payload).length === 0) {
        originalUriRef.current && setWorkingUri(originalUriRef.current);
        return;
      }

      setIsProcessing(true);
      try {
        const sourceUri = await ensureLocalUri(originalUriRef.current);
        const result = await ImageManipulator.manipulateAsync(
          sourceUri,
          [{ adjust: payload }],
          { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
        );
        setWorkingUri(result.uri);
      } catch (error) {
        console.error('Edit application error:', error);
        Alert.alert('Error', 'Failed to apply edits');
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedFilter, adjustments, ensureLocalUri]
  );

  const applyFilter = useCallback(
    (filter: FilterType) => {
      triggerImpact();
      setSelectedFilter(filter);
      applyAllEdits({ filter });
    },
    [applyAllEdits, triggerImpact]
  );

  const handleAdjustmentComplete = useCallback(() => {
    applyAllEdits({ adjustments });
  }, [applyAllEdits, adjustments]);

  const selectedAdjustmentConfig = useMemo(
    () => ADJUSTMENT_CONFIGS.find((item) => item.key === selectedAdjustment) || ADJUSTMENT_CONFIGS[0],
    [selectedAdjustment]
  );
  const selectedCropConfig = useMemo(
    () => CROP_CONTROLS.find((item) => item.key === selectedCropControl) || CROP_CONTROLS[0],
    [selectedCropControl]
  );

  const handleRotate = useCallback(async () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);

    setIsProcessing(true);
    try {
      const sourceUri = await ensureLocalUri(workingUri);
      const result = await ImageManipulator.manipulateAsync(
        sourceUri,
        [{ rotate: 90 }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );

      setWorkingUri(result.uri);
      originalUriRef.current = result.uri;
    } catch (error) {
      console.error('Rotate error:', error);
      Alert.alert('Error', 'Failed to rotate image');
    } finally {
      setIsProcessing(false);
    }
  }, [workingUri, ensureLocalUri, triggerImpact]);

  const handleFlipHorizontal = useCallback(async () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);

    setIsProcessing(true);
    try {
      const sourceUri = await ensureLocalUri(workingUri);
      const result = await ImageManipulator.manipulateAsync(
        sourceUri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );

      setWorkingUri(result.uri);
      originalUriRef.current = result.uri;
    } catch (error) {
      console.error('Flip error:', error);
      Alert.alert('Error', 'Failed to flip image');
    } finally {
      setIsProcessing(false);
    }
  }, [workingUri, ensureLocalUri, triggerImpact]);

  const handleDone = useCallback(() => {
    triggerNotification();
    setShowSendOptions(true);
  }, [triggerNotification]);

  const handleSendModeSelect = useCallback(async (mode: MediaSendMode, timerSeconds?: number) => {
    await onSave(workingUri, annotationText, mode, timerSeconds);
  }, [workingUri, annotationText, onSave]);

  const handleClose = useCallback(() => {
    triggerImpact();

    if (workingUri !== imageUri || annotationText.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'All edits will be lost.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: onClose,
          },
        ]
      );
    } else {
      onClose();
    }
  }, [workingUri, imageUri, annotationText, onClose, triggerImpact]);

  const handleToolSelect = useCallback(
    (tool: Tool) => {
      triggerImpact();
      setCurrentTool(tool);
    },
    [triggerImpact]
  );

  const handleTextToolOpen = useCallback(() => {
    triggerImpact();
    setDraftAnnotation(annotationText);
    setTextToolVisible(true);
  }, [annotationText, triggerImpact]);

  const handleTextToolApply = useCallback(() => {
    triggerImpact();
    setAnnotationText(draftAnnotation.trim());
    setTextToolVisible(false);
  }, [draftAnnotation, triggerImpact]);

  const handleTextToolCancel = useCallback(() => {
    setTextToolVisible(false);
    setDraftAnnotation(annotationText);
  }, [annotationText]);

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.headerClose} hitSlop={8}>
              <Ionicons name="close" size={26} color="#FFF" />
            </Pressable>
            <Text style={[styles.headerTitle, { color: accentColor }]}>Edit Photo</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.shortcutRow}>
            <Pressable onPress={handleRotate} style={styles.shortcutButton} hitSlop={8}>
              <Ionicons name="refresh" size={18} color={accentColor} />
              <Text style={[styles.shortcutLabel, { color: accentColor }]}>Rotate</Text>
            </Pressable>
            <Pressable onPress={handleFlipHorizontal} style={styles.shortcutButton} hitSlop={8}>
              <Ionicons name="swap-horizontal" size={18} color={accentColor} />
              <Text style={[styles.shortcutLabel, { color: accentColor }]}>Flip</Text>
            </Pressable>
            <Pressable onPress={handleDone} style={[styles.shortcutButton, styles.shortcutPrimary]} hitSlop={8}>
              <Ionicons name="checkmark" size={18} color="#050505" />
              <Text style={[styles.shortcutLabel, styles.shortcutLabelPrimary]}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.writeRow}>
            <Pressable
              onPress={handleTextToolOpen}
              style={[styles.writeButton, textToolVisible && styles.writeButtonActive]}
              hitSlop={8}
            >
              <Ionicons name="pencil-outline" size={18} color={textToolVisible ? '#fff' : accentColor} />
              <Text style={[styles.writeButtonLabel, { color: textToolVisible ? '#fff' : accentColor }]}>Write</Text>
            </Pressable>
          </View>

          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: workingUri }}
              style={styles.image}
              contentFit="contain"
              cachePolicy="none"
            />
            {currentTool === 'crop' && (
              <View style={styles.cropGrid} pointerEvents="none">
                {[0.25, 0.5, 0.75].map((position) => (
                  <View key={`h-${position}`} style={[styles.cropLine, { top: `${position * 100}%` }]} />
                ))}
                {[0.25, 0.5, 0.75].map((position) => (
                  <View
                    key={`v-${position}`}
                    style={[styles.cropLine, { left: `${position * 100}%`, width: 1, height: '100%' }]}
                  />
                ))}
              </View>
            )}
            {annotationText.length > 0 && (
              <Text style={[styles.annotationText, { color: accentColor }]} numberOfLines={3}>
                {annotationText}
              </Text>
            )}
            {textToolVisible && (
              <View style={styles.textToolOverlay}>
                <Text style={styles.textToolLabel}>Write on image</Text>
                <TextInput
                  style={styles.textToolInput}
                  value={draftAnnotation}
                  placeholder="Type something..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  onChangeText={setDraftAnnotation}
                  multiline
                />
                <View style={styles.textToolActions}>
                  <Pressable onPress={handleTextToolCancel} style={styles.textToolButton}>
                    <Text style={styles.textToolButtonLabel}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleTextToolApply} style={[styles.textToolButton, styles.textToolButtonPrimary]}>
                    <Text style={[styles.textToolButtonLabel, styles.textToolButtonLabelPrimary]}>Apply</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {isProcessing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}
          </View>

          {/* Options Panel */}
          {currentTool === 'filters' && (
            <View style={styles.optionsPanel}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {FILTERS.map((filter) => (
                  <Pressable
                    key={filter.id}
                    onPress={() => applyFilter(filter.id)}
                    style={[styles.filterButton, selectedFilter === filter.id && styles.filterButtonActive]}
                  >
                    <View style={[styles.filterPreview, selectedFilter === filter.id && { borderColor: accentColor, borderWidth: 1.8 }]}>
                      <Image
                        source={{ uri: originalUriRef.current }}
                        style={styles.filterPreviewImage}
                        contentFit="cover"
                      />
                    </View>
                    <Text
                      style={[
                        styles.filterLabel,
                        selectedFilter === filter.id && { color: accentColor, fontWeight: '600' },
                      ]}
                    >
                      {filter.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {currentTool === 'adjust' && (
            <View style={[styles.optionsPanel, styles.adjustmentPanel]}>
              <View style={styles.adjustmentDialRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.adjustmentDialList}
                >
                  {ADJUSTMENT_CONFIGS.map((item) => {
                    const isActive = selectedAdjustment === item.key;
                    const displayValue = Math.round(adjustments[item.key]);
                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => {
                          triggerImpact();
                          setSelectedAdjustment(item.key);
                        }}
                        style={[styles.adjustmentDial, isActive && styles.adjustmentDialActive]}
                      >
                        <View style={[styles.adjustmentDialCircle, isActive && styles.adjustmentDialCircleActive]}>
                          <Text style={[styles.adjustmentDialValue, isActive && styles.adjustmentDialValueActive]}>
                            {displayValue > 0 ? `+${displayValue}` : displayValue}
                          </Text>
                        </View>
                        <Text
                          style={[styles.adjustmentDialLabel, isActive && styles.adjustmentDialLabelActive]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.sliderWrapper}>
                <TickSlider
                  min={selectedAdjustmentConfig.min}
                  max={selectedAdjustmentConfig.max}
                  value={adjustments[selectedAdjustment]}
                  onChange={(nextValue) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      [selectedAdjustment]: nextValue,
                    }))
                  }
                  onSlidingComplete={handleAdjustmentComplete}
                  step={selectedAdjustmentConfig.step}
                  accentColor={accentColor}
                  label={selectedAdjustmentConfig.label}
                  hapticsEnabled={hapticsEnabled}
                />
              </View>
            </View>
          )}

          {currentTool === 'crop' && (
            <View style={[styles.optionsPanel, styles.adjustmentPanel]}>
              <View style={styles.adjustmentDialRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.adjustmentDialList}
                >
                  {CROP_CONTROLS.map((control) => {
                    const isActive = selectedCropControl === control.key;
                    const displayValue = Math.round(cropSettings[control.key]);
                    return (
                      <Pressable
                        key={control.key}
                        onPress={() => {
                          triggerImpact();
                          setSelectedCropControl(control.key);
                        }}
                        style={[styles.adjustmentDial, isActive && styles.adjustmentDialActive]}
                      >
                        <View style={[styles.adjustmentDialCircle, isActive && styles.adjustmentDialCircleActive]}>
                          <Text style={[styles.adjustmentDialValue, isActive && styles.adjustmentDialValueActive]}>
                            {displayValue > 0 ? `+${displayValue}` : displayValue}
                          </Text>
                        </View>
                        <Text
                          style={[styles.adjustmentDialLabel, isActive && styles.adjustmentDialLabelActive]}
                          numberOfLines={1}
                        >
                          {control.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.sliderWrapper}>
                <TickSlider
                  min={selectedCropConfig.min}
                  max={selectedCropConfig.max}
                  value={cropSettings[selectedCropControl]}
                  onChange={(nextValue) =>
                    setCropSettings((prev) => ({
                      ...prev,
                      [selectedCropControl]: nextValue,
                    }))
                  }
                  onSlidingComplete={handleAdjustmentComplete}
                  step={selectedCropConfig.step}
                  accentColor={accentColor}
                  label={selectedCropConfig.label}
                  hapticsEnabled={hapticsEnabled}
                />
              </View>
            </View>
          )}

          {/* Bottom Tabs */}
          <View style={styles.bottomTabs}>
            <Pressable
              onPress={() => handleToolSelect('filters')}
              style={[styles.bottomTab, currentTool === 'filters' && styles.bottomTabActive]}
            >
              <Ionicons name="color-filter" size={22} color={currentTool === 'filters' ? accentColor : '#FFF'} />
              <Text
                style={[
                  styles.bottomTabLabel,
                  currentTool === 'filters' && { color: accentColor, fontWeight: '600' },
                ]}
              >
                Filter
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleToolSelect('adjust')}
              style={[styles.bottomTab, currentTool === 'adjust' && styles.bottomTabActive]}
            >
              <Ionicons name="options" size={22} color={currentTool === 'adjust' ? accentColor : '#FFF'} />
              <Text
                style={[
                  styles.bottomTabLabel,
                  currentTool === 'adjust' && { color: accentColor, fontWeight: '600' },
                ]}
              >
                Adjust
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleToolSelect('crop')}
              style={[styles.bottomTab, currentTool === 'crop' && styles.bottomTabActive]}
            >
              <Ionicons name="crop-outline" size={22} color={currentTool === 'crop' ? accentColor : '#FFF'} />
              <Text
                style={[
                  styles.bottomTabLabel,
                  currentTool === 'crop' && { color: accentColor, fontWeight: '600' },
                ]}
              >
                Crop
              </Text>
            </Pressable>
          </View>

        </View>
      </Modal>

      <MediaSendOptions
        visible={showSendOptions}
        onClose={() => setShowSendOptions(false)}
        onSelect={handleSendModeSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerButtonText: {
    color: '#FFF',
    fontSize: 17,
  },
  headerButtonDone: {
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 12,
  },
  optionsPanel: {
    minHeight: 260,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#1c1c1c',
    paddingBottom: 12,
  },
  adjustmentPanel: {
    paddingTop: 12,
  },
  headerClose: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  cropGrid: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 0,
    justifyContent: 'center',
  },
  cropLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  annotationText: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textToolOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(5,5,5,0.85)',
    borderWidth: 1,
    borderColor: '#202020',
  },
  textToolLabel: {
    color: '#EEE',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 6,
  },
  textToolInput: {
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.04)',
    textAlignVertical: 'top',
  },
  textToolActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  textToolButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  textToolButtonPrimary: {
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  textToolButtonLabel: {
    color: '#FFF',
    fontWeight: '600',
  },
  textToolButtonLabelPrimary: {
    color: '#050505',
  },
  adjustmentDialRow: {
    height: 120,
    marginBottom: 8,
  },
  adjustmentDialList: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  adjustmentDial: {
    width: 84,
    marginRight: 14,
    alignItems: 'center',
  },
  adjustmentDialActive: {
    transform: [{ scale: 1.02 }],
  },
  adjustmentDialCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  adjustmentDialCircleActive: {
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.35,
    elevation: 6,
  },
  adjustmentDialValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adjustmentDialValueActive: {
    color: '#a4d7ff',
  },
  adjustmentDialLabel: {
    color: '#AAA',
    fontSize: 10,
    textAlign: 'center',
    width: 70,
  },
  adjustmentDialLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sliderWrapper: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  filtersScroll: {
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  filterButton: {
    width: 90,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  filterButtonActive: {
    opacity: 1,
  },
  filterPreview: {
    width: 74,
    height: 74,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPreviewImage: {
    width: '100%',
    height: '100%',
  },
  filterLabel: {
    color: '#ccc',
    fontSize: 11,
    textAlign: 'center',
  },
  bottomTabs: {
    height: 78,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
  },
  bottomTab: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bottomTabActive: {
    backgroundColor: '#111',
    borderColor: '#2f2f2f',
  },
  bottomTabLabel: {
    color: '#bbb',
    fontSize: 11,
    marginTop: 6,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  shortcutButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  shortcutPrimary: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  shortcutLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  shortcutLabelPrimary: {
    color: '#050505',
  },
  writeRow: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  writeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  writeButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

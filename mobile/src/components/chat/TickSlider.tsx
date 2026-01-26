import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface TickSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  step?: number;
  accentColor?: string;
  label?: string;
  hapticsEnabled?: boolean;
}

const TICK_SPACING = 12;
const MAJOR_TICK = 6;

export function TickSlider({
  min,
  max,
  value,
  onChange,
  onSlidingComplete,
  step = 1,
  accentColor = '#FFFFFF',
  label,
  hapticsEnabled = true,
}: TickSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isDraggingRef = useRef(false);
  const lastValueRef = useRef(value);

  const tickCount = useMemo(() => Math.floor((max - min) / step) + 1, [min, max, step]);

  const valueToIndex = useCallback((val: number) => Math.round((val - min) / step), [min, step]);
  const indexToValue = useCallback(
    (index: number) => Math.max(min, Math.min(max, min + index * step)),
    [min, max, step]
  );

  const sidePadding = Math.max(trackWidth / 2, 0);

  const triggerHaptic = useCallback(() => {
    if (!hapticsEnabled || Platform.OS !== 'ios') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [hapticsEnabled]);

  const scrollToValue = useCallback(
    (val: number) => {
      if (!scrollRef.current || trackWidth === 0) return;
      const index = valueToIndex(val);
      const rawOffset = sidePadding + index * TICK_SPACING - trackWidth / 2;
      const offset = Math.max(0, rawOffset);
      scrollRef.current.scrollTo({ x: offset, animated: true });
    },
    [sidePadding, trackWidth, valueToIndex]
  );

  const handleValueChange = useCallback(
    (nextValue: number) => {
      const clampedValue = Math.max(min, Math.min(max, nextValue));
      if (clampedValue === lastValueRef.current) return;
      lastValueRef.current = clampedValue;
      onChange(clampedValue);
      triggerHaptic();
    },
    [max, min, onChange, triggerHaptic]
  );

  const handleScroll = useCallback(
    (event: any) => {
      const offset = event.nativeEvent.contentOffset.x;
      const rawIndex = (offset + trackWidth / 2 - sidePadding) / TICK_SPACING;
      const nextValue = indexToValue(Math.round(rawIndex));
      if (nextValue !== value) {
        handleValueChange(nextValue);
      }
    },
    [trackWidth, sidePadding, indexToValue, handleValueChange, value]
  );

  const handleMomentumEnd = useCallback(
    (event: any) => {
      const offset = event.nativeEvent.contentOffset.x;
      const rawIndex = (offset + trackWidth / 2 - sidePadding) / TICK_SPACING;
      const nextValue = indexToValue(Math.round(rawIndex));
      onSlidingComplete?.(nextValue);
      isDraggingRef.current = false;
      scrollToValue(nextValue);
    },
    [trackWidth, sidePadding, indexToValue, onSlidingComplete]
  );

  const handleScrollBegin = useCallback(() => {
    isDraggingRef.current = true;
    triggerHaptic();
  }, [triggerHaptic]);

  useEffect(() => {
    lastValueRef.current = value;
    if (!isDraggingRef.current) {
      scrollToValue(value);
    }
  }, [value, scrollToValue]);

  const ticks = useMemo(
    () =>
      Array.from({ length: tickCount }).map((_, index) => ({
        index,
        isMajor: index % MAJOR_TICK === 0,
      })),
    [tickCount]
  );

  return (
    <View style={styles.container} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
      {(label || typeof value === 'number') && (
        <View style={styles.valueRow}>
          {label && <Text style={styles.valueLabel}>{label}</Text>}
          <Text style={styles.valueText}>{value}</Text>
        </View>
      )}

      <View style={styles.tickTrack}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
          onScrollBeginDrag={handleScrollBegin}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumEnd}
          onScrollEndDrag={handleMomentumEnd}
          contentContainerStyle={[
            styles.tickContent,
            { paddingHorizontal: sidePadding },
          ]}
        >
          {ticks.map((tick) => {
            const isActive = tick.index === valueToIndex(value);
            return (
              <View key={tick.index} style={styles.tickWrapper}>
                <View
                  style={[
                    styles.tick,
                    tick.isMajor ? styles.tickMajor : styles.tickMinor,
                    isActive && { backgroundColor: accentColor },
                  ]}
                />
              </View>
            );
          })}
        </ScrollView>
        <View style={[styles.centerIndicator, { backgroundColor: accentColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 84,
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  valueLabel: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1.1,
  },
  valueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tickTrack: {
    height: 40,
    justifyContent: 'center',
  },
  tickContent: {
    alignItems: 'flex-end',
  },
  tickWrapper: {
    width: TICK_SPACING,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tick: {
    width: 2,
    borderRadius: 1,
    backgroundColor: '#2d2d2d',
  },
  tickMajor: {
    height: 26,
  },
  tickMinor: {
    height: 14,
  },
  centerIndicator: {
    position: 'absolute',
    width: 2,
    height: 36,
    borderRadius: 1,
    alignSelf: 'center',
  },
});

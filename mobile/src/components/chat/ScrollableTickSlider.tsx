import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TICK_WIDTH = 16; // Total width per tick including spacing

interface ScrollableTickSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  accentColor?: string;
  hapticsEnabled?: boolean;
}

export function ScrollableTickSlider({
  min,
  max,
  value,
  onChange,
  accentColor = '#007AFF',
  hapticsEnabled = true,
}: ScrollableTickSliderProps) {
  const scrollRef = useRef<ScrollView>(null);
  const isDragging = useRef(false);
  const lastHapticValue = useRef(value);
  const lastValue = useRef(value);
  const [viewportWidth, setViewportWidth] = useState(SCREEN_WIDTH);

  const tickCount = max - min + 1; // 201 ticks for -100 to 100
  const sidePadding = viewportWidth / 2;

  // Scroll to value only on mount or external value changes (not from dragging)
  useEffect(() => {
    if (!isDragging.current && scrollRef.current && viewportWidth > 0 && value !== lastValue.current) {
      const index = value - min;
      const targetOffset = index * TICK_WIDTH;
      scrollRef.current.scrollTo({ x: targetOffset, animated: false });
      lastValue.current = value;
    }
  }, [value, min, viewportWidth]);

  const handleScroll = useCallback(
    (event: any) => {
      if (!isDragging.current) return;

      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / TICK_WIDTH);
      const newValue = Math.max(min, Math.min(max, min + index));

      if (newValue !== lastValue.current) {
        lastValue.current = newValue;
        onChange(newValue);

        // Trigger haptic on value change
        if (hapticsEnabled && newValue !== lastHapticValue.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticValue.current = newValue;
        }
      }
    },
    [min, max, onChange, hapticsEnabled]
  );

  const handleScrollBegin = useCallback(() => {
    isDragging.current = true;
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticsEnabled]);

  const handleScrollEnd = useCallback(
    (event: any) => {
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / TICK_WIDTH);
      const newValue = Math.max(min, Math.min(max, min + index));

      // Snap to nearest tick
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: (newValue - min) * TICK_WIDTH,
          animated: true,
        });
      }

      // Set dragging to false after snap completes
      setTimeout(() => {
        isDragging.current = false;
      }, 100);
    },
    [min, max]
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate={0.99}
        onScrollBeginDrag={handleScrollBegin}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
        }}
      >
        {Array.from({ length: tickCount }, (_, i) => {
          const tickValue = min + i;
          const isMajorTick = tickValue % 10 === 0;
          const isActive = tickValue === lastValue.current;

          let height = 12;
          let opacity = 0.3;

          if (isActive) {
            height = 32;
            opacity = 1;
          } else if (isMajorTick) {
            height = 20;
            opacity = 0.6;
          }

          return (
            <View
              key={tickValue}
              style={[
                styles.tickWrapper,
                {
                  width: TICK_WIDTH,
                },
              ]}
            >
              <View
                style={[
                  styles.tick,
                  {
                    height,
                    backgroundColor: isActive
                      ? accentColor
                      : `rgba(255,255,255,${opacity})`,
                  },
                ]}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Center indicator line */}
      <View style={[styles.centerIndicator, { backgroundColor: accentColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  tickWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 2,
    borderRadius: 1,
  },
  centerIndicator: {
    position: 'absolute',
    width: 3,
    height: 40,
    borderRadius: 1.5,
    alignSelf: 'center',
    pointerEvents: 'none',
    opacity: 0.8,
  },
});

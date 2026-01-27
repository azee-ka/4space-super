import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface SimpleTickSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  accentColor?: string;
  hapticsEnabled?: boolean;
}

export function SimpleTickSlider({
  min,
  max,
  value,
  onChange,
  accentColor = '#007AFF',
  hapticsEnabled = true,
}: SimpleTickSliderProps) {
  const lastHapticValue = useRef(value);

  const handleValueChange = useCallback((newValue: number) => {
    const rounded = Math.round(newValue);

    // Trigger haptic only when value actually changes
    if (hapticsEnabled && rounded !== lastHapticValue.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticValue.current = rounded;
    }

    onChange(rounded);
  }, [onChange, hapticsEnabled]);

  // Create 201 ticks for -100 to 100
  const tickCount = max - min + 1;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const tickValue = min + i;
    const isMajorTick = tickValue % 10 === 0; // Major tick every 10
    const isActive = tickValue === value;
    return { value: tickValue, isMajor: isMajorTick, isActive };
  });

  return (
    <View style={styles.container}>
      {/* Tick marks layer */}
      <View style={styles.ticksContainer}>
        {ticks.map((tick, index) => {
          const position = (index / (tickCount - 1)) * 100;
          let height = 8;
          let opacity = 0.3;

          if (tick.isActive) {
            height = 24;
            opacity = 1;
          } else if (tick.isMajor) {
            height = 16;
            opacity = 0.5;
          }

          return (
            <View
              key={tick.value}
              style={[
                styles.tick,
                {
                  left: `${position}%`,
                  height,
                  backgroundColor: tick.isActive ? accentColor : `rgba(255,255,255,${opacity})`,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Slider (invisible track) */}
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={handleValueChange}
        step={1}
        minimumTrackTintColor="transparent"
        maximumTrackTintColor="transparent"
        thumbTintColor={accentColor}
      />

      {/* Center indicator */}
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
  ticksContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tick: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
    bottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  centerIndicator: {
    position: 'absolute',
    width: 2,
    height: 32,
    borderRadius: 1,
    alignSelf: 'center',
    bottom: 14,
    pointerEvents: 'none',
  },
});

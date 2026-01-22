import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type HSV = { h: number; s: number; v: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length !== 6) return { r: 255, g: 255, b: 255 };
  const parsed = parseInt(cleaned, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;

const rgbToHsv = ({ r, g, b }: { r: number; g: number; b: number }): HSV => {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;
  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === normalizedR) {
      h = ((normalizedG - normalizedB) / delta) % 6;
    } else if (max === normalizedG) {
      h = (normalizedB - normalizedR) / delta + 2;
    } else {
      h = (normalizedR - normalizedG) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return { h, s, v };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(hexToRgb(value)));
  const [svLayout, setSvLayout] = useState({ width: 1, height: 1 });
  const [hueLayout, setHueLayout] = useState({ width: 1 });
  const hueRef = useRef(hsv.h);

  useEffect(() => {
    setHsv(rgbToHsv(hexToRgb(value)));
  }, [value]);

  useEffect(() => {
    hueRef.current = hsv.h;
  }, [hsv.h]);

  const hueColor = useMemo(() => {
    const rgb = hsvToRgb(hsv.h, 1, 1);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }, [hsv.h]);

  const handleSvChange = (x: number, y: number) => {
    const sat = clamp(x / svLayout.width, 0, 1);
    const val = clamp(1 - y / svLayout.height, 0, 1);
    const rgb = hsvToRgb(hueRef.current, sat, val);
    setHsv((prev) => ({ ...prev, s: sat, v: val }));
    onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const handleHueChange = (x: number) => {
    const hue = clamp(x / hueLayout.width, 0, 1) * 360;
    const rgb = hsvToRgb(hue, hsv.s, hsv.v);
    setHsv((prev) => ({ ...prev, h: hue }));
    onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const svResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          handleSvChange(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          handleSvChange(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
      }),
    [svLayout]
  );

  const hueResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          handleHueChange(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          handleHueChange(event.nativeEvent.locationX);
        },
      }),
    [hueLayout, hsv.s, hsv.v]
  );

  const handleSvLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSvLayout({ width: Math.max(width, 1), height: Math.max(height, 1) });
  };

  const handleHueLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setHueLayout({ width: Math.max(width, 1) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.svWrapper} onLayout={handleSvLayout} {...svResponder.panHandlers}>
        <LinearGradient
          colors={['#ffffff', hueColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.svGradient}
        >
          <LinearGradient
            colors={['transparent', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.svGradient}
          >
            <View style={styles.svArea} />
          </LinearGradient>
        </LinearGradient>
        <View
          style={[
            styles.svThumb,
            {
              left: hsv.s * svLayout.width - 9,
              top: (1 - hsv.v) * svLayout.height - 9,
            },
          ]}
        />
      </View>

      <View style={styles.hueWrapper} onLayout={handleHueLayout} {...hueResponder.panHandlers}>
        <LinearGradient
          colors={['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.hueBar}
        />
        <View style={[styles.hueThumb, { left: (hsv.h / 360) * hueLayout.width - 8 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  svWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  svGradient: {
    flex: 1,
  },
  svArea: {
    flex: 1,
  },
  svThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  hueWrapper: {
    height: 18,
    borderRadius: 999,
    overflow: 'hidden',
  },
  hueBar: {
    height: 18,
  },
  hueThumb: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
});

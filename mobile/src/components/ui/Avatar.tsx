import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  seed?: string;
}

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return { r: 255, g: 255, b: 255 };
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const lightenHex = (hex: string, amount = 0.4) => {
  const { r, g, b } = hexToRgb(hex);
  const nr = Math.min(255, Math.round(r + (255 - r) * amount));
  const ng = Math.min(255, Math.round(g + (255 - g) * amount));
  const nb = Math.min(255, Math.round(b + (255 - b) * amount));
  return { r: nr, g: ng, b: nb };
};

export const Avatar: React.FC<AvatarProps> = ({ uri, name = 'U', size = 'md', seed }) => {
  const palette = [
    '#22d3ee',
    '#60a5fa',
    '#f59e0b',
    '#f97316',
    '#f43f5e',
    '#a855f7',
    '#22c55e',
    '#38bdf8',
    '#e879f9',
    '#fb7185',
    '#facc15',
    '#14b8a6',
  ];
  const source = seed || name;
  const hash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackColor = palette[hash % palette.length];

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeStyle = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : size === 'xl' ? styles.xl : styles.md;
  const textSize = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : size === 'xl' ? styles.textXl : styles.textMd;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatar, sizeStyle]}
        resizeMode="cover"
      />
    );
  }

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : size === 'xl' ? 34 : 18;

  const iconRgb = lightenHex(fallbackColor, 0.45);
  const iconColor = `rgba(${iconRgb.r}, ${iconRgb.g}, ${iconRgb.b}, 0.7)`;
  const bgRgb = hexToRgb(fallbackColor);
  const backgroundColor = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.28)`;

  return (
    <View style={[styles.avatar, styles.placeholder, sizeStyle, { backgroundColor }]}>
      <Ionicons name="person" size={iconSize} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    width: 32,
    height: 32,
  },
  md: {
    width: 40,
    height: 40,
  },
  lg: {
    width: 48,
    height: 48,
  },
  xl: {
    width: 80,
    height: 80,
  },
  initials: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 16,
  },
  textXl: {
    fontSize: 24,
  },
});

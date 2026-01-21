import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name = 'U', size = 'md' }) => {
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

  return (
    <View style={[styles.avatar, styles.placeholder, sizeStyle]}>
      <Text style={[styles.initials, textSize]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  placeholder: {
    backgroundColor: theme.colors.accent,
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

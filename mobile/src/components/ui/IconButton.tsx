import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'danger';
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  size = 'md',
  variant = 'default',
}) => {
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32 };
      case 'md':
        return { width: 40, height: 40 };
      case 'lg':
        return { width: 48, height: 48 };
      default:
        return { width: 40, height: 40 };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.accent,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.danger,
        };
      default:
        return {
          backgroundColor: theme.colors.surfaceSubtle,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, getSizeStyle(), getVariantStyle()]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

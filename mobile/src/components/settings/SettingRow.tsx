import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const withAlpha = (hex: string, alpha = '20'): string => {
  if (!hex.startsWith('#')) return hex;
  if (hex.length === 7) return `${hex}${alpha}`;
  if (hex.length === 4) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}${alpha}`;
  }
  return hex;
};

export interface SettingToggleRowProps {
  icon: IconName;
  iconColor: string;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  icon,
  iconColor,
  label,
  description,
  onValueChange,
  value,
  disabled,
}) => (
  <View style={[styles.row, styles.rowBorder]}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: withAlpha(iconColor, '20') }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: theme.colors.surfaceSubtle, true: withAlpha(iconColor, '55') }}
      thumbColor={theme.colors.white}
    />
  </View>
);

export interface SettingLinkRowProps {
  icon: IconName;
  iconColor: string;
  label: string;
  description: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  borderless?: boolean;
  active?: boolean;
}

export const SettingLinkRow: React.FC<SettingLinkRowProps> = ({
  icon,
  iconColor,
  label,
  description,
  onPress,
  trailing,
  borderless,
  active,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={[styles.row, !borderless && styles.rowBorder, onPress && styles.rowPressable]}
  >
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: withAlpha(iconColor, '20') }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.description, active && { color: theme.colors.textPrimary }]}>{description}</Text>
      </View>
    </View>
    {trailing ? (
      <View style={styles.trailing}>{trailing}</View>
    ) : (
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowPressable: {
    minHeight: 48,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginTop: 3,
    lineHeight: 18,
  },
  trailing: {
    marginLeft: 8,
  },
});

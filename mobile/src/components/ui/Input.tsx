import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  label?: string;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  label,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  leftIcon,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : styles.inputNormal]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.accent}
          style={styles.input}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: theme.colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputNormal: {
    borderColor: theme.colors.border,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    marginTop: 4,
  },
});

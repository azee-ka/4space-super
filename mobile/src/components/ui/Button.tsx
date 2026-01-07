import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'rounded-lg items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-dark-800 border border-dark-700',
    ghost: 'bg-transparent',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };
  
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'text-primary-600',
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${(disabled || loading) && 'opacity-50'}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#0ea5e9'} />
      ) : (
        <Text
          className={`
            font-semibold
            ${textVariantClasses[variant]}
            ${textSizeClasses[size]}
          `}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

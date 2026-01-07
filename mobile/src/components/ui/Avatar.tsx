import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-primary-600
        items-center
        justify-center
        overflow-hidden
      `}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="w-full h-full" />
      ) : (
        <Text className={`text-white font-bold ${textSizeClasses[size]}`}>
          {initials}
        </Text>
      )}
    </View>
  );
}

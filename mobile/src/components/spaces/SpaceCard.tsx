import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Space } from '@4space/shared';
import { Ionicons } from '@expo/vector-icons';

interface SpaceCardProps {
  space: Space;
  onPress: () => void;
}

export function SpaceCard({ space, onPress }: SpaceCardProps) {
  const getIcon = () => {
    if (space.icon) return space.icon;
    return space.privacy === 'public' ? 'globe' : 'lock-closed';
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-dark-800 rounded-xl p-4 mb-3 border border-dark-700 active:opacity-70"
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: space.color || '#0ea5e9' }}
        >
          <Ionicons name={getIcon() as any} size={24} color="white" />
        </View>
        
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">
            {space.name}
          </Text>
          {space.description && (
            <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
              {space.description}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#71717a" />
      </View>
    </Pressable>
  );
}

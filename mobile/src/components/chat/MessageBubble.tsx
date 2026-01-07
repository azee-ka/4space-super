import React from 'react';
import { View, Text } from 'react-native';
import { Message } from '@4space/shared';
import { Avatar } from '../ui/Avatar';

interface MessageBubbleProps {
  message: Message & { decrypted_content?: string; sender?: any };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View
      className={`flex-row mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && (
        <Avatar
          name={message.sender?.display_name || 'Unknown'}
          imageUrl={message.sender?.avatar_url}
          size="sm"
        />
      )}
      
      <View className={`ml-2 max-w-[75%] ${isOwn && 'mr-2'}`}>
        {!isOwn && (
          <Text className="text-gray-400 text-xs mb-1 ml-1">
            {message.sender?.display_name || 'Unknown'}
          </Text>
        )}
        
        <View
          className={`
            px-4 py-2 rounded-2xl
            ${isOwn ? 'bg-primary-600 rounded-br-sm' : 'bg-dark-800 rounded-bl-sm'}
          `}
        >
          <Text className="text-white text-base">
            {message.decrypted_content || 'Encrypted message'}
          </Text>
        </View>
        
        <Text className="text-gray-500 text-xs mt-1 ml-1">
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

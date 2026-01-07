import React, { useState } from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputProps {
  onSend: (text: string) => void;
  loading?: boolean;
}

export function MessageInput({ onSend, loading = false }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !loading) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View className="bg-dark-900 border-t border-dark-800 px-4 py-3">
        <View className="flex-row items-center bg-dark-800 rounded-full px-4">
          <TextInput
            className="flex-1 text-white py-3"
            placeholder="Type a message..."
            placeholderTextColor="#71717a"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || loading}
            className={`ml-2 ${(!text.trim() || loading) && 'opacity-50'}`}
          >
            <Ionicons name="send" size={24} color="#0ea5e9" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

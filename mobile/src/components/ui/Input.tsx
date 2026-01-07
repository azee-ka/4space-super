import React from 'react';
import { TextInput, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  const [isSecure, setIsSecure] = React.useState(secureTextEntry);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-white text-sm font-medium mb-2">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          className={`
            bg-dark-800 border rounded-lg px-4 py-3 text-white
            ${error ? 'border-red-500' : 'border-dark-700'}
            ${multiline ? 'min-h-[100px]' : ''}
          `}
          placeholder={placeholder}
          placeholderTextColor="#71717a"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            className="absolute right-3 top-3"
          >
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={24}
              color="#71717a"
            />
          </Pressable>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}

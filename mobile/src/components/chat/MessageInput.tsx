import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Message } from '../../types';
import { theme } from '../../styles/theme';

interface MessageInputProps {
  onSendMessage: (content: string, fileUri?: string, fileName?: string, fileType?: string) => void;
  onTyping?: () => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  replyingTo,
  onCancelReply,
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      onSendMessage(
        message.trim(),
        selectedFile?.uri,
        selectedFile?.name,
        selectedFile?.type
      );
      setMessage('');
      setSelectedFile(null);
      setShowEmoji(false);
    }
  };

  const handleTextChange = (text: string) => {
    setMessage(text);
    onTyping?.();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        type: asset.type || 'image',
      });
    }
  };

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        type: 'file',
      });
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        {replyingTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyContent}>
              <Text style={styles.replyText}>
                Replying to {replyingTo.sender.display_name || replyingTo.sender.username}
              </Text>
              <Text style={styles.replyMessage} numberOfLines={1}>
                {replyingTo.content}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancelReply}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {selectedFile && (
          <View style={styles.fileContainer}>
            <Ionicons
              name={selectedFile.type === 'image' || selectedFile.type === 'video' ? 'image' : 'document'}
              size={20}
              color={theme.colors.accent}
            />
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFile(null)}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {showEmoji && (
          <View style={styles.emojiContainer}>
            {EMOJI_LIST.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => addEmoji(emoji)}
                style={styles.emojiButton}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={() => setShowEmoji(!showEmoji)}
            style={styles.iconButton}
          >
            <Ionicons name="happy-outline" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.iconButton}
          >
            <Ionicons name="image-outline" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickFile}
            style={styles.iconButton}
          >
            <Ionicons name="attach-outline" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="Message..."
              placeholderTextColor={theme.colors.textSubtle}
              value={message}
              onChangeText={handleTextChange}
              multiline
              maxLength={2000}
              style={styles.textInput}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim() && !selectedFile}
            style={styles.sendButtonContainer}
          >
            <View style={[styles.sendButton, (message.trim() || selectedFile) ? styles.sendButtonActive : styles.sendButtonInactive]}>
              <Ionicons
                name="send"
                size={18}
                color={message.trim() || selectedFile ? theme.colors.base : theme.colors.textSubtle}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '500',
  },
  replyMessage: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 8,
  },
  fileName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    padding: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 8,
  },
  emojiButton: {
    padding: 8,
    margin: 4,
  },
  emojiText: {
    fontSize: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  iconButton: {
    marginRight: 8,
    paddingBottom: 12,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textInput: {
    color: theme.colors.textPrimary,
    paddingVertical: 12,
    maxHeight: 96,
  },
  sendButtonContainer: {
    marginLeft: 8,
    paddingBottom: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  sendButtonInactive: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
});

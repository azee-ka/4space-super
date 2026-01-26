import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Avatar } from '../ui';
import { Message } from '../../types';

interface Conversation {
  id: string;
  name: string;
  avatar_url?: string;
  participants?: any[];
}

interface ForwardMessageModalProps {
  visible: boolean;
  message: Message | null;
  conversations: Conversation[];
  onClose: () => void;
  onForward: (conversationIds: string[]) => void;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  visible,
  message,
  conversations,
  onClose,
  onForward,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) =>
      conv.name?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const toggleConversation = (conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleForward = () => {
    if (selectedConversations.size > 0) {
      onForward(Array.from(selectedConversations));
      setSelectedConversations(new Set());
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedConversations(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <BlurView intensity={80} tint="dark" style={styles.backdrop}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Forward Message</Text>
              <TouchableOpacity
                onPress={handleForward}
                style={[
                  styles.forwardButton,
                  selectedConversations.size === 0 && styles.forwardButtonDisabled,
                ]}
                disabled={selectedConversations.size === 0}
              >
                <Text
                  style={[
                    styles.forwardButtonText,
                    selectedConversations.size === 0 && styles.forwardButtonTextDisabled,
                  ]}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search conversations..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>

            {/* Selected Count */}
            {selectedConversations.size > 0 && (
              <View style={styles.selectedBanner}>
                <Text style={styles.selectedText}>
                  {selectedConversations.size} conversation{selectedConversations.size > 1 ? 's' : ''} selected
                </Text>
              </View>
            )}

            {/* Conversations List */}
            <FlatList
              data={filteredConversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedConversations.has(item.id);

                return (
                  <TouchableOpacity
                    style={[styles.conversationItem, isSelected && styles.conversationItemSelected]}
                    onPress={() => toggleConversation(item.id)}
                  >
                    <Avatar
                      uri={item.avatar_url}
                      name={item.name}
                      size="md"
                    />
                    <View style={styles.conversationInfo}>
                      <Text style={styles.conversationName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.conversationMeta} numberOfLines={1}>
                        {item.participants?.length || 0} member{item.participants?.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>No conversations found</Text>
                </View>
              }
            />

            {/* Message Preview */}
            {message && (
              <View style={styles.messagePreview}>
                <View style={styles.previewLine} />
                <View style={styles.previewContent}>
                  <Text style={styles.previewLabel}>Forwarding:</Text>
                  <Text style={styles.previewText} numberOfLines={2}>
                    {message.content || 'Media'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  forwardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#007AFF',
  },
  forwardButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
  forwardButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  forwardButtonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  selectedBanner: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  selectedText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  conversationItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  conversationMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  messagePreview: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  previewLine: {
    width: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  previewContent: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    fontWeight: '500',
  },
  previewText: {
    fontSize: 14,
    color: 'white',
  },
});

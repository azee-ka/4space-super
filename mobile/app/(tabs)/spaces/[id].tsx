import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSpacesStore } from '../../../src/store/spacesStore';
import { useAuthStore } from '../../../src/store/authStore';
import { MessageBubble } from '../../../src/components/chat/MessageBubble';
import { MessageInput } from '../../../src/components/chat/MessageInput';
import { supabase } from '../../../src/lib/supabase';
import { Message } from '@4space/shared';
import { EncryptionService } from '@4space/shared';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedSpace } = useSpacesStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, display_name, avatar_url)
        `)
        .eq('space_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const spaceKey = await SecureStore.getItemAsync(`space_key_${id}`);
      if (spaceKey) {
        const decryptedMessages = data.map((msg) => ({
          ...msg,
          decrypted_content: EncryptionService.decryptMessage(
            msg.encrypted_content,
            spaceKey
          ),
        }));
        setMessages(decryptedMessages);
      } else {
        setMessages(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`space-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `space_id=eq.${id}`,
        },
        async (payload) => {
          const spaceKey = await SecureStore.getItemAsync(`space_key_${id}`);
          const decrypted = spaceKey
            ? EncryptionService.decryptMessage(
                payload.new.encrypted_content,
                spaceKey
              )
            : null;

          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              decrypted_content: decrypted,
              sender,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !id) return;

    setSending(true);
    try {
      const spaceKey = await SecureStore.getItemAsync(`space_key_${id as string}`);
      if (!spaceKey) {
        Alert.alert('Error', 'Space key not found');
        return;
      }

      const encrypted = EncryptionService.encryptMessage(text, spaceKey);

      const { error } = await supabase.from('messages').insert({
        space_id: id,
        sender_id: user.id,
        encrypted_content: encrypted,
      });

      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <View className="px-6 py-4 border-b border-dark-800 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-white text-lg font-semibold">
            {selectedSpace?.name || 'Chat'}
          </Text>
          {selectedSpace?.description && (
            <Text className="text-gray-400 text-sm">
              {selectedSpace.description}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwn={item.sender_id === user?.id}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        inverted={false}
      />

      <MessageInput onSend={handleSendMessage} loading={sending} />
    </SafeAreaView>
  );
}

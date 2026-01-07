import React, { useState } from 'react';
import { View, Text, Modal, Pressable, Alert } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useSpacesStore } from '../../store/spacesStore';
import { Ionicons } from '@expo/vector-icons';

interface CreateSpaceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateSpaceModal({ visible, onClose }: CreateSpaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const createSpace = useSpacesStore((state) => state.createSpace);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a space name');
      return;
    }

    setLoading(true);
    try {
      await createSpace(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
      Alert.alert('Success', 'Space created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-dark-900 rounded-t-3xl p-6 pb-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-xl font-bold">Create Space</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          </View>

          <Input
            label="Space Name"
            placeholder="My Awesome Space"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Input
            label="Description (Optional)"
            placeholder="What's this space about?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Create Space"
            onPress={handleCreate}
            loading={loading}
            className="mt-4"
          />
        </View>
      </View>
    </Modal>
  );
}

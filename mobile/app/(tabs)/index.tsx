import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useSpacesStore } from '../../src/store/spacesStore';
import { SpaceCard } from '../../src/components/spaces/SpaceCard';
import { CreateSpaceModal } from '../../src/components/spaces/CreateSpaceModal';
import { Button } from '../../src/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function SpacesHome() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { spaces, loading, fetchSpaces, selectSpace } = useSpacesStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSpaces();
    setRefreshing(false);
  };

  const handleSpacePress = (space: any) => {
    selectSpace(space);
    router.push(`/(tabs)/spaces/${space.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <View className="px-6 py-4 border-b border-dark-800">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">4Space</Text>
            <Text className="text-gray-400 text-sm">
              {user?.email}
            </Text>
          </View>
          <Pressable onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 px-6">
        {spaces.length === 0 && !loading ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="apps-outline" size={64} color="#3f3f46" />
            <Text className="text-gray-400 text-lg mt-4 mb-2">
              No spaces yet
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6">
              Create your first space to get started
            </Text>
            <Button
              title="Create Space"
              onPress={() => setModalVisible(true)}
            />
          </View>
        ) : (
          <FlatList
            data={spaces}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SpaceCard
                space={item}
                onPress={() => handleSpacePress(item)}
              />
            )}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#0ea5e9"
              />
            }
          />
        )}
      </View>

      {spaces.length > 0 && (
        <Pressable
          onPress={() => setModalVisible(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}

      <CreateSpaceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

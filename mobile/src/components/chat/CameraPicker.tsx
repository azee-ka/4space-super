import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

interface CameraPickerProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
  onVideoTaken: (uri: string) => void;
}

type MediaType = 'photo' | 'video';

export function CameraPicker({
  visible,
  onClose,
  onPhotoTaken,
  onVideoTaken,
}: CameraPickerProps) {
  const [showOptions, setShowOptions] = useState(true);

  // Launch camera immediately when visible
  useEffect(() => {
    if (visible && !showOptions) {
      launchCamera('photo');
    }
  }, [visible, showOptions]);

  const launchCamera = async (type: MediaType) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos and videos.'
        );
        onClose();
        return;
      }

      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: type === 'photo' ? 0.95 : 0.9,
        videoMaxDuration: type === 'video' ? 300 : undefined, // 5 minutes max
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (type === 'photo') {
          onPhotoTaken(uri);
        } else {
          onVideoTaken(uri);
        }
      }

      onClose();
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
      onClose();
    }
  };

  const handleModeSelect = (type: MediaType) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowOptions(false);
    launchCamera(type);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {showOptions ? (
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View style={styles.container}>
            <BlurView intensity={95} tint="dark" style={styles.blur}>
              <View style={styles.header}>
                <Text style={styles.title}>Camera</Text>
              </View>

              <Pressable
                onPress={() => handleModeSelect('photo')}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="camera" size={24} color="#007AFF" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Take Photo</Text>
                  <Text style={styles.optionDescription}>Capture a photo</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleModeSelect('video')}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="videocam" size={24} color="#FF3B30" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Record Video</Text>
                  <Text style={styles.optionDescription}>Record up to 5 minutes</Text>
                </View>
              </Pressable>
            </BlurView>
          </View>
        </Pressable>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blur: {
    padding: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    color: '#999',
    fontSize: 13,
  },
});

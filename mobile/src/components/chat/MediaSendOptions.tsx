import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export type MediaSendMode = 'normal' | 'view-once' | 'timed';

interface MediaSendOptionsProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (mode: MediaSendMode, timerSeconds?: number) => void;
}

const TIMER_OPTIONS = [
  { label: '5 seconds', value: 5 },
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '1 hour', value: 3600 },
  { label: '1 day', value: 86400 },
  { label: '1 week', value: 604800 },
];

export function MediaSendOptions({
  visible,
  onClose,
  onSelect,
}: MediaSendOptionsProps) {
  const [showTimerOptions, setShowTimerOptions] = useState(false);

  const handleSelect = (mode: MediaSendMode, timer?: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSelect(mode, timer);
    onClose();
  };

  const handleTimedPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowTimerOptions(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.container}>
          <BlurView intensity={95} tint="dark" style={styles.blur}>
            {!showTimerOptions ? (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Send Options</Text>
                </View>

                <Pressable
                  onPress={() => handleSelect('normal')}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="send" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Send Normally</Text>
                    <Text style={styles.optionDescription}>Message stays in chat</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => handleSelect('view-once')}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="eye-off" size={24} color="#FF9500" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>View Once</Text>
                    <Text style={styles.optionDescription}>Disappears after viewing</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleTimedPress}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="timer" size={24} color="#FF3B30" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Self-Destruct Timer</Text>
                    <Text style={styles.optionDescription}>Choose deletion time</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.header}>
                  <Pressable onPress={() => setShowTimerOptions(false)} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                  </Pressable>
                  <Text style={styles.title}>Self-Destruct Timer</Text>
                </View>

                {TIMER_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect('timed', option.value)}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name="time" size={24} color="#FF3B30" />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{option.label}</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
          </BlurView>
        </View>
      </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
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

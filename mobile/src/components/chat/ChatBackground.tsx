import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatBackgroundStore } from '../../store/chatBackgroundStore';
import { getChatBackgroundById } from '../../styles/chatBackgrounds';
import { theme } from '../../styles/theme';

interface ChatBackgroundProps {
  children: React.ReactNode;
}

export const ChatBackground: React.FC<ChatBackgroundProps> = ({ children }) => {
  const { backgroundId, customBackgroundUri } = useChatBackgroundStore();
  const preset = getChatBackgroundById(backgroundId);

  if (backgroundId === 'custom-photo' && customBackgroundUri) {
    return (
      <ImageBackground source={{ uri: customBackgroundUri }} style={styles.container} imageStyle={styles.image}>
        <View
          pointerEvents="none"
          style={[
            styles.overlay,
            { backgroundColor: preset.overlayColor, opacity: preset.overlayOpacity },
          ]}
        />
        <View style={styles.content}>{children}</View>
      </ImageBackground>
    );
  }

  if (preset.type === 'gradient' && preset.colors) {
    return (
      <LinearGradient colors={preset.colors} style={styles.container}>
        <View
          pointerEvents="none"
          style={[
            styles.overlay,
            { backgroundColor: preset.overlayColor, opacity: preset.overlayOpacity },
          ]}
        />
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    );
  }

  if (preset.type === 'image' && preset.image) {
    return (
      <ImageBackground source={preset.image} style={styles.container} imageStyle={styles.image}>
        <View
          pointerEvents="none"
          style={[
            styles.overlay,
            { backgroundColor: preset.overlayColor, opacity: preset.overlayOpacity },
          ]}
        />
        <View style={styles.content}>{children}</View>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: preset.color || theme.colors.base }]}>
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          { backgroundColor: preset.overlayColor, opacity: preset.overlayOpacity },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});

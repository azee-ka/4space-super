import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { theme } from '../../styles/theme';

interface AppBackgroundProps {
  children: React.ReactNode;
  overlayOpacity?: number;
}

const backgroundImage = require('../../../assets/chat_themes/geometry-gradient.png');

export const AppBackground: React.FC<AppBackgroundProps> = ({ children, overlayOpacity = 0.72 }) => {
  return (
    <ImageBackground source={backgroundImage} style={styles.container} imageStyle={styles.image}>
      <View pointerEvents="none" style={[styles.overlay, { opacity: overlayOpacity }]} />
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  image: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.base,
  },
});

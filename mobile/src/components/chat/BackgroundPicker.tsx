import React from 'react';
import {
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CHAT_BACKGROUNDS } from '../../styles/chatBackgrounds';
import { useChatBackgroundStore } from '../../store/chatBackgroundStore';
import { theme } from '../../styles/theme';

interface BackgroundPickerProps {
  visible: boolean;
  onClose: () => void;
}

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({ visible, onClose }) => {
  const { backgroundId, setBackgroundId } = useChatBackgroundStore();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Chat Background</Text>
              <Text style={styles.subtitle}>Pick a vibe for your space</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cards}
          >
            {CHAT_BACKGROUNDS.map((preset) => {
              const isActive = preset.id === backgroundId;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.card, isActive && styles.cardActive]}
                  onPress={() => setBackgroundId(preset.id)}
                >
                  {preset.type === 'image' && preset.image ? (
                    <ImageBackground source={preset.image} style={styles.preview} imageStyle={styles.previewImage}>
                      <View
                        style={[
                          styles.previewOverlay,
                          { backgroundColor: preset.overlayColor, opacity: preset.overlayOpacity },
                        ]}
                      />
                    </ImageBackground>
                  ) : (
                    <View style={[styles.preview, { backgroundColor: preset.color || theme.colors.base }]} />
                  )}
                  <Text style={[styles.cardLabel, isActive && styles.cardLabelActive]}>
                    {preset.label}
                  </Text>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Ionicons name="checkmark" size={12} color={theme.colors.base} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cards: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
  },
  card: {
    width: 140,
    padding: 12,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  cardActive: {
    backgroundColor: theme.colors.surface,
  },
  preview: {
    height: 80,
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewImage: {
    resizeMode: 'cover',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  cardLabelActive: {
    color: theme.colors.textPrimary,
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

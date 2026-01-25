import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export type MessageOptions = {
  viewOnce?: boolean;
  timedDuration?: number; // in seconds, 0 means no timer
};

interface MessageOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (options: MessageOptions) => void;
}

const TIMED_OPTIONS = [
  { label: 'No Timer', value: 0, icon: 'time-outline' },
  { label: '3 seconds', value: 3, icon: 'flash' },
  { label: '5 seconds', value: 5, icon: 'flash' },
  { label: '10 seconds', value: 10, icon: 'timer' },
  { label: '30 seconds', value: 30, icon: 'timer' },
  { label: '1 minute', value: 60, icon: 'hourglass' },
  { label: '5 minutes', value: 300, icon: 'hourglass' },
  { label: '1 hour', value: 3600, icon: 'time' },
  { label: '1 day', value: 86400, icon: 'calendar' },
];

export const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [viewOnce, setViewOnce] = useState(false);
  const [timedDuration, setTimedDuration] = useState(0);

  const handleConfirm = () => {
    onConfirm({
      viewOnce,
      timedDuration: viewOnce ? 0 : timedDuration, // View once overrides timed
    });
    // Reset state
    setViewOnce(false);
    setTimedDuration(0);
    onClose();
  };

  const handleReset = () => {
    setViewOnce(false);
    setTimedDuration(0);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message Options</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
            <Text style={styles.confirmText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* View Once Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="eye-off" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>View Once</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Message will disappear after it's been viewed once
            </Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                viewOnce && styles.optionCardActive,
              ]}
              onPress={() => {
                setViewOnce(!viewOnce);
                if (!viewOnce) {
                  setTimedDuration(0); // Reset timer if enabling view once
                }
              }}
            >
              <View style={styles.optionContent}>
                <Ionicons
                  name="eye-off"
                  size={24}
                  color={viewOnce ? theme.colors.accent : theme.colors.textMuted}
                />
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      viewOnce && styles.optionTitleActive,
                    ]}
                  >
                    Enable View Once
                  </Text>
                  <Text style={styles.optionDescription}>
                    Recipient can view this message only once
                  </Text>
                </View>
              </View>
              {viewOnce && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.accent}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Timed Messages Section */}
          {!viewOnce && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="timer" size={20} color={theme.colors.accent} />
                <Text style={styles.sectionTitle}>Self-Destruct Timer</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Message will auto-delete after the specified time
              </Text>

              <View style={styles.timedGrid}>
                {TIMED_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timedOption,
                      timedDuration === option.value && styles.timedOptionActive,
                    ]}
                    onPress={() => setTimedDuration(option.value)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={
                        timedDuration === option.value
                          ? theme.colors.accent
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.timedOptionText,
                        timedDuration === option.value && styles.timedOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Preview Section */}
          {(viewOnce || timedDuration > 0) && (
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewCard}>
                <Ionicons
                  name={viewOnce ? 'eye-off' : 'timer'}
                  size={32}
                  color={theme.colors.accent}
                />
                <Text style={styles.previewText}>
                  {viewOnce
                    ? 'Message will disappear after being viewed'
                    : `Message will self-destruct in ${formatDuration(timedDuration)}`}
                </Text>
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Remove Options</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) !== 1 ? 's' : ''}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) !== 1 ? 's' : ''}`;
  return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) !== 1 ? 's' : ''}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}10`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  optionTitleActive: {
    color: theme.colors.accent,
  },
  optionDescription: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  timedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '48%',
    flex: 1,
  },
  timedOptionActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}10`,
  },
  timedOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  timedOptionTextActive: {
    color: theme.colors.accent,
  },
  previewSection: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  previewCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: `${theme.colors.accent}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    gap: 12,
  },
  previewText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.warning,
  },
});

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface PollCreatorProps {
  visible: boolean;
  onClose: () => void;
  onCreatePoll: (poll: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    anonymous: boolean;
    pollType?: 'poll' | 'quiz';
    correctOptions?: number[];
    expiresAt?: string | null;
  }) => void;
}

export const PollCreator: React.FC<PollCreatorProps> = ({
  visible,
  onClose,
  onCreatePoll,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [pollType, setPollType] = useState<'poll' | 'quiz'>('poll');
  const [correctOptions, setCorrectOptions] = useState<number[]>([]);
  const [expiresInHours, setExpiresInHours] = useState<number | null>(null);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrectOption = (index: number) => {
    if (correctOptions.includes(index)) {
      setCorrectOptions(correctOptions.filter(i => i !== index));
    } else {
      setCorrectOptions([...correctOptions, index]);
    }
  };

  const handleCreate = () => {
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (question.trim().length > 0 && validOptions.length >= 2) {
      const expiresAt = expiresInHours
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
        : null;

      onCreatePoll({
        question: question.trim(),
        options: validOptions,
        allowMultiple,
        anonymous,
        pollType,
        correctOptions: pollType === 'quiz' ? correctOptions : [],
        expiresAt,
      });
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setAllowMultiple(false);
      setAnonymous(false);
      setPollType('poll');
      setCorrectOptions([]);
      setExpiresInHours(null);
      onClose();
    }
  };

  const hasEnoughOptions = options.filter(opt => opt.trim().length > 0).length >= 2;
  const hasCorrectSelection = pollType === 'quiz' ? correctOptions.length > 0 : true;
  const isValid = question.trim().length > 0 && hasEnoughOptions && hasCorrectSelection;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Poll</Text>
          <TouchableOpacity
            onPress={handleCreate}
            style={styles.headerButton}
            disabled={!isValid}
          >
            <Text style={[styles.createText, !isValid && styles.createTextDisabled]}>
              Create
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Question</Text>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask a question..."
              placeholderTextColor={theme.colors.textSubtle}
              style={styles.questionInput}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Options</Text>
            {options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                  value={option}
                  onChangeText={(value) => handleOptionChange(index, value)}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.colors.textSubtle}
                  style={styles.optionInput}
                  maxLength={100}
                />
                {pollType === 'quiz' && (
                  <TouchableOpacity
                    onPress={() => toggleCorrectOption(index)}
                    style={styles.correctToggle}
                  >
                    <Ionicons
                      name={correctOptions.includes(index) ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={correctOptions.includes(index) ? '#22c55e' : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
                {options.length > 2 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveOption(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {pollType === 'quiz' && correctOptions.length === 0 && (
              <Text style={styles.quizHint}>Select at least one correct answer.</Text>
            )}

            {options.length < 10 && (
              <TouchableOpacity onPress={handleAddOption} style={styles.addOptionButton}>
                <Ionicons name="add-circle-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.addOptionText}>Add Option</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Settings</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Quiz mode</Text>
                <Text style={styles.settingDescription}>
                  Mark correct answers and show results after voting
                </Text>
              </View>
              <Switch
                value={pollType === 'quiz'}
                onValueChange={(value) => setPollType(value ? 'quiz' : 'poll')}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={theme.colors.base}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Allow multiple answers</Text>
                <Text style={styles.settingDescription}>
                  Let people select more than one option
                </Text>
              </View>
              <Switch
                value={allowMultiple}
                onValueChange={setAllowMultiple}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={theme.colors.base}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Anonymous voting</Text>
                <Text style={styles.settingDescription}>
                  Don't show who voted for what
                </Text>
              </View>
              <Switch
                value={anonymous}
                onValueChange={setAnonymous}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={theme.colors.base}
              />
            </View>

            <View style={styles.settingRowColumn}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>End poll after</Text>
                <Text style={styles.settingDescription}>
                  Optional time limit for voting
                </Text>
              </View>
              <View style={styles.expiryRow}>
                {[null, 1, 24, 72, 168].map((hours) => {
                  const label = hours === null ? 'No limit' : hours === 1 ? '1h' : hours === 24 ? '1d' : hours === 72 ? '3d' : '7d';
                  const selected = expiresInHours === hours;
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[styles.expiryChip, selected && styles.expiryChipActive]}
                      onPress={() => setExpiresInHours(hours)}
                    >
                      <Text style={[styles.expiryChipText, selected && styles.expiryChipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  createTextDisabled: {
    color: theme.colors.textSubtle,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  questionInput: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  correctToggle: {
    marginLeft: 8,
    padding: 4,
  },
  optionInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.accent,
  },
  quizHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: -4,
    marginBottom: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingRowColumn: {
    flexDirection: 'column',
    gap: 10,
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  expiryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expiryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  expiryChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}15`,
  },
  expiryChipText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  expiryChipTextActive: {
    color: theme.colors.accent,
  },
});

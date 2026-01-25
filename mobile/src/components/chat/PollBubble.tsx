import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface PollOption {
  text: string;
  votes: string[]; // Array of user IDs who voted for this option
}

interface PollData {
  type: 'poll';
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  anonymous: boolean;
}

interface PollBubbleProps {
  pollData: PollData;
  currentUserId: string;
  isOwn: boolean;
  onVote?: (optionIndex: number) => void;
  onVoteMultiple?: (optionIndexes: number[]) => void;
}

export const PollBubble: React.FC<PollBubbleProps> = ({
  pollData,
  currentUserId,
  isOwn,
  onVote,
  onVoteMultiple,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const options = Array.isArray(pollData.options) ? pollData.options : [];
  const totalVotes = options.reduce((sum, opt) => sum + (opt?.votes?.length ?? 0), 0);
  const userHasVoted = options.some(opt => (opt?.votes ?? []).includes(currentUserId));

  const handleVote = (optionIndex: number) => {
    if (userHasVoted) return; // Can't vote again

    if (pollData.allowMultiple) {
      // Toggle selection for multiple choice
      if (selectedOptions.includes(optionIndex)) {
        setSelectedOptions(selectedOptions.filter(i => i !== optionIndex));
      } else {
        setSelectedOptions([...selectedOptions, optionIndex]);
      }
    } else {
      // Single choice
      setSelectedOptions([optionIndex]);
      // Auto-submit for single choice
      if (onVote) {
        onVote(optionIndex);
      }
    }
  };

  const handleSubmitMultiple = () => {
    if (selectedOptions.length === 0) return;
    if (onVoteMultiple) {
      onVoteMultiple(selectedOptions);
      setSelectedOptions([]);
      return;
    }
    if (onVote) {
      selectedOptions.forEach(index => onVote(index));
      setSelectedOptions([]);
    }
  };

  const getVotePercentage = (optionIndex: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round(((options[optionIndex]?.votes?.length ?? 0) / totalVotes) * 100);
  };

  const hasUserVotedForOption = (optionIndex: number): boolean => {
    return (options[optionIndex]?.votes ?? []).includes(currentUserId);
  };

  return (
    <View style={styles.container}>
      {/* Poll Question */}
      <View style={styles.questionContainer}>
        <Ionicons
          name="stats-chart"
          size={18}
          color={isOwn ? 'rgba(255,255,255,0.9)' : theme.colors.accent}
        />
        <Text style={[styles.question, isOwn && styles.questionOwn]}>
          {pollData.question}
        </Text>
      </View>

      {/* Poll Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const percentage = getVotePercentage(index);
          const isSelected = selectedOptions.includes(index);
          const hasVoted = hasUserVotedForOption(index);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                hasVoted && styles.optionButtonVoted,
                userHasVoted && styles.optionButtonDisabled,
              ]}
              onPress={() => handleVote(index)}
              disabled={userHasVoted}
              activeOpacity={0.7}
            >
              {/* Vote progress bar background */}
              {userHasVoted && (
                <View
                  style={[
                    styles.voteProgressBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: hasVoted
                        ? (isOwn ? 'rgba(255,255,255,0.3)' : `${theme.colors.accent}30`)
                        : 'rgba(100,100,100,0.15)'
                    }
                  ]}
                />
              )}

              {/* Option content */}
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  {/* Checkbox/Radio indicator */}
                  <View style={[
                    styles.optionIndicator,
                    pollData.allowMultiple && styles.optionIndicatorSquare,
                    (isSelected || hasVoted) && styles.optionIndicatorActive,
                    isOwn && styles.optionIndicatorOwn,
                  ]}>
                    {(isSelected || hasVoted) && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={isOwn ? '#fff' : theme.colors.accent}
                      />
                    )}
                  </View>

                  {/* Option text */}
                  <Text style={[
                    styles.optionText,
                    isOwn && styles.optionTextOwn,
                    (isSelected || hasVoted) && styles.optionTextActive,
                  ]}>
                {option?.text ?? 'Option'}
              </Text>
            </View>

                {/* Vote count/percentage */}
                {userHasVoted && (
                  <View style={styles.optionRight}>
                    <Text style={[styles.voteCount, isOwn && styles.voteCountOwn]}>
                      {percentage}%
                    </Text>
                    {!pollData.anonymous && (
                      <Text style={[styles.voteNumber, isOwn && styles.voteNumberOwn]}>
                        ({option.votes.length})
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Submit button for multiple choice */}
      {pollData.allowMultiple && !userHasVoted && selectedOptions.length > 0 && (
        <TouchableOpacity
          style={[styles.submitButton, isOwn && styles.submitButtonOwn]}
          onPress={handleSubmitMultiple}
        >
          <Text style={[styles.submitButtonText, isOwn && styles.submitButtonTextOwn]}>
            Submit Vote{selectedOptions.length > 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}

      {/* Poll metadata */}
      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <Ionicons
            name={pollData.allowMultiple ? 'checkbox-outline' : 'radio-button-on-outline'}
            size={12}
            color={isOwn ? 'rgba(255,255,255,0.6)' : theme.colors.textSubtle}
          />
          <Text style={[styles.metaText, isOwn && styles.metaTextOwn]}>
            {pollData.allowMultiple ? 'Multiple choice' : 'Single choice'}
          </Text>
        </View>
        {pollData.anonymous && (
          <View style={styles.metaRow}>
            <Ionicons
              name="eye-off-outline"
              size={12}
              color={isOwn ? 'rgba(255,255,255,0.6)' : theme.colors.textSubtle}
            />
            <Text style={[styles.metaText, isOwn && styles.metaTextOwn]}>
              Anonymous
            </Text>
          </View>
        )}
        <View style={styles.metaRow}>
          <Ionicons
            name="people-outline"
            size={12}
            color={isOwn ? 'rgba(255,255,255,0.6)' : theme.colors.textSubtle}
          />
          <Text style={[styles.metaText, isOwn && styles.metaTextOwn]}>
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 240,
    maxWidth: 320,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  questionOwn: {
    color: 'rgba(255,255,255,0.95)',
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    position: 'relative',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(100,100,100,0.2)',
    backgroundColor: 'rgba(0,0,0,0.03)',
    overflow: 'hidden',
  },
  optionButtonSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}10`,
  },
  optionButtonVoted: {
    borderColor: theme.colors.accent,
  },
  optionButtonDisabled: {
    opacity: 1,
  },
  voteProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(100,100,100,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  optionIndicatorSquare: {
    borderRadius: 4,
  },
  optionIndicatorActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent,
  },
  optionIndicatorOwn: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  optionTextOwn: {
    color: 'rgba(255,255,255,0.9)',
  },
  optionTextActive: {
    fontWeight: '600',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  voteCountOwn: {
    color: 'rgba(255,255,255,0.95)',
  },
  voteNumber: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  voteNumberOwn: {
    color: 'rgba(255,255,255,0.6)',
  },
  submitButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonOwn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonTextOwn: {
    color: 'rgba(255,255,255,0.95)',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100,100,100,0.15)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  metaTextOwn: {
    color: 'rgba(255,255,255,0.6)',
  },
});

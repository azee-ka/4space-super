import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
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
  pollType?: 'poll' | 'quiz';
  poll_type?: 'poll' | 'quiz';
  correctOptions?: number[];
  expiresAt?: string;
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
  const pollMode = pollData.pollType || pollData.poll_type || (pollData.type === 'quiz' ? 'quiz' : 'poll');
  const correctOptions = useMemo(() => {
    if (Array.isArray(pollData.correctOptions)) return new Set(pollData.correctOptions);
    const indices = new Set<number>();
    options.forEach((opt, idx) => {
      if ((opt as any)?.isCorrect) indices.add(idx);
    });
    return indices;
  }, [pollData.correctOptions, options]);
  const totalVotes = options.reduce((sum, opt) => sum + (opt?.votes?.length ?? 0), 0);
  const userHasVoted = options.some(opt => (opt?.votes ?? []).includes(currentUserId));
  const hasCorrectAnswers = pollMode === 'quiz' && correctOptions.size > 0;

  const progressAnims = useRef<Animated.Value[]>([]);
  useEffect(() => {
    if (progressAnims.current.length !== options.length) {
      progressAnims.current = options.map(() => new Animated.Value(0));
    }
  }, [options.length]);

  useEffect(() => {
    progressAnims.current.forEach((anim, index) => {
      const percentage = totalVotes === 0 ? 0 : Math.round(((options[index]?.votes?.length ?? 0) / totalVotes) * 100);
      Animated.timing(anim, {
        toValue: percentage,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });
  }, [options, totalVotes]);

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
          const isCorrect = correctOptions.has(index);
          const revealCorrect = userHasVoted && hasCorrectAnswers;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                hasVoted && styles.optionButtonVoted,
                userHasVoted && styles.optionButtonDisabled,
                revealCorrect && isCorrect && styles.optionButtonCorrect,
                revealCorrect && !isCorrect && hasVoted && styles.optionButtonWrong,
              ]}
              onPress={() => handleVote(index)}
              disabled={userHasVoted}
              activeOpacity={0.7}
            >
              {/* Vote progress bar background */}
              {userHasVoted && (
                <Animated.View
                  style={[
                    styles.voteProgressBar,
                    {
                      width: progressAnims.current[index]
                        ? progressAnims.current[index].interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          })
                        : `${percentage}%`,
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
                    {revealCorrect && (
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : hasVoted ? 'close-circle' : 'ellipse-outline'}
                        size={14}
                        color={isCorrect ? '#22c55e' : hasVoted ? '#ef4444' : theme.colors.textSubtle}
                      />
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
        {pollMode === 'quiz' && (
          <View style={styles.metaRow}>
            <Ionicons
              name="school-outline"
              size={12}
              color={isOwn ? 'rgba(255,255,255,0.6)' : theme.colors.textSubtle}
            />
            <Text style={[styles.metaText, isOwn && styles.metaTextOwn]}>
              Quiz mode
            </Text>
          </View>
        )}
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
        {!!pollData.expiresAt && (
          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={12}
              color={isOwn ? 'rgba(255,255,255,0.6)' : theme.colors.textSubtle}
            />
            <Text style={[styles.metaText, isOwn && styles.metaTextOwn]}>
              Ends {new Date(pollData.expiresAt).toLocaleDateString()}
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
  optionButtonCorrect: {
    borderColor: 'rgba(34,197,94,0.5)',
  },
  optionButtonWrong: {
    borderColor: 'rgba(239,68,68,0.5)',
  },
});

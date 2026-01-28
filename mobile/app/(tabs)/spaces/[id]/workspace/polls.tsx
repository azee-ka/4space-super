import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../../src/utils/themeUtils';
import { theme } from '../../../../../src/styles/theme';

type PollStatus = 'active' | 'closed' | 'scheduled';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

interface Poll {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  endsAt?: string;
  status: PollStatus;
  options: PollOption[];
  totalVotes: number;
  allowMultiple: boolean;
  anonymous: boolean;
  userVoted: boolean;
  userVotes: string[];
}

export default function PollsWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [filter, setFilter] = useState<PollStatus | 'all'>('all');
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      title: 'Next Sprint Focus',
      description: 'What should be our main priority for the next sprint?',
      createdBy: 'Sarah Chen',
      createdAt: '2026-01-25',
      endsAt: '2026-01-30',
      status: 'active',
      totalVotes: 12,
      allowMultiple: false,
      anonymous: false,
      userVoted: true,
      userVotes: ['opt1'],
      options: [
        { id: 'opt1', text: 'Performance optimization', votes: 5, voters: ['Sarah', 'Mike', 'Alex', 'Emma', 'You'] },
        { id: 'opt2', text: 'New feature development', votes: 4, voters: ['David', 'Lisa', 'John', 'Kate'] },
        { id: 'opt3', text: 'Bug fixes and stability', votes: 2, voters: ['Tom', 'Anna'] },
        { id: 'opt4', text: 'Code refactoring', votes: 1, voters: ['Chris'] },
      ],
    },
    {
      id: '2',
      title: 'Team Lunch Location',
      description: 'Where should we have our team lunch this Friday?',
      createdBy: 'Mike Johnson',
      createdAt: '2026-01-26',
      endsAt: '2026-01-28',
      status: 'active',
      totalVotes: 8,
      allowMultiple: false,
      anonymous: true,
      userVoted: false,
      userVotes: [],
      options: [
        { id: 'opt1', text: 'Italian Restaurant', votes: 3, voters: [] },
        { id: 'opt2', text: 'Sushi Place', votes: 2, voters: [] },
        { id: 'opt3', text: 'Mexican Grill', votes: 2, voters: [] },
        { id: 'opt4', text: 'Burger Joint', votes: 1, voters: [] },
      ],
    },
    {
      id: '3',
      title: 'Design System Update',
      description: 'Which components should we prioritize in the design system update?',
      createdBy: 'Emma Wilson',
      createdAt: '2026-01-24',
      endsAt: '2026-01-27',
      status: 'active',
      totalVotes: 15,
      allowMultiple: true,
      anonymous: false,
      userVoted: true,
      userVotes: ['opt1', 'opt3'],
      options: [
        { id: 'opt1', text: 'Button variants', votes: 8, voters: ['Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Kate', 'You'] },
        { id: 'opt2', text: 'Form inputs', votes: 5, voters: ['Alex', 'Tom', 'Anna', 'Chris', 'Mark'] },
        { id: 'opt3', text: 'Navigation components', votes: 7, voters: ['Sarah', 'Emma', 'David', 'John', 'Kate', 'Chris', 'You'] },
        { id: 'opt4', text: 'Modal dialogs', votes: 4, voters: ['Mike', 'Alex', 'Lisa', 'Tom'] },
        { id: 'opt5', text: 'Data tables', votes: 3, voters: ['Anna', 'Mark', 'Paul'] },
      ],
    },
    {
      id: '4',
      title: 'Meeting Time Preference',
      description: 'What time works best for weekly team sync?',
      createdBy: 'Alex Brown',
      createdAt: '2026-01-20',
      endsAt: '2026-01-25',
      status: 'closed',
      totalVotes: 10,
      allowMultiple: false,
      anonymous: false,
      userVoted: true,
      userVotes: ['opt2'],
      options: [
        { id: 'opt1', text: 'Monday 9:00 AM', votes: 2, voters: ['Mike', 'Alex'] },
        { id: 'opt2', text: 'Tuesday 10:00 AM', votes: 6, voters: ['Sarah', 'Emma', 'David', 'Lisa', 'John', 'You'] },
        { id: 'opt3', text: 'Wednesday 2:00 PM', votes: 1, voters: ['Tom'] },
        { id: 'opt4', text: 'Thursday 3:00 PM', votes: 1, voters: ['Anna'] },
      ],
    },
    {
      id: '5',
      title: 'Tech Stack Decision',
      description: 'Which framework should we use for the new dashboard?',
      createdBy: 'David Lee',
      createdAt: '2026-01-18',
      endsAt: '2026-01-23',
      status: 'closed',
      totalVotes: 14,
      allowMultiple: false,
      anonymous: false,
      userVoted: true,
      userVotes: ['opt1'],
      options: [
        { id: 'opt1', text: 'React + TypeScript', votes: 9, voters: ['Sarah', 'Mike', 'Alex', 'Emma', 'David', 'Lisa', 'John', 'Kate', 'You'] },
        { id: 'opt2', text: 'Vue.js', votes: 3, voters: ['Tom', 'Anna', 'Chris'] },
        { id: 'opt3', text: 'Angular', votes: 2, voters: ['Mark', 'Paul'] },
      ],
    },
    {
      id: '6',
      title: 'Q2 Team Building',
      description: 'What activity should we do for Q2 team building event?',
      createdBy: 'Lisa Martinez',
      createdAt: '2026-02-01',
      status: 'scheduled',
      totalVotes: 0,
      allowMultiple: false,
      anonymous: false,
      userVoted: false,
      userVotes: [],
      options: [
        { id: 'opt1', text: 'Escape Room', votes: 0, voters: [] },
        { id: 'opt2', text: 'Bowling', votes: 0, voters: [] },
        { id: 'opt3', text: 'Cooking Class', votes: 0, voters: [] },
        { id: 'opt4', text: 'Outdoor Hiking', votes: 0, voters: [] },
      ],
    },
  ]);

  const getFilteredPolls = () => {
    if (filter === 'all') return polls;
    return polls.filter(poll => poll.status === filter);
  };

  const stats = {
    active: polls.filter(p => p.status === 'active').length,
    closed: polls.filter(p => p.status === 'closed').length,
    total: polls.length,
    participated: polls.filter(p => p.userVoted).length,
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prevPolls =>
      prevPolls.map(poll => {
        if (poll.id !== pollId) return poll;

        const updatedOptions = poll.options.map(opt => {
          if (poll.allowMultiple) {
            // Multiple choice
            if (opt.id === optionId) {
              const alreadyVoted = poll.userVotes.includes(optionId);
              return {
                ...opt,
                votes: alreadyVoted ? opt.votes - 1 : opt.votes + 1,
                voters: alreadyVoted
                  ? opt.voters.filter(v => v !== 'You')
                  : [...opt.voters, 'You'],
              };
            }
            return opt;
          } else {
            // Single choice
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: opt.votes + 1,
                voters: [...opt.voters, 'You'],
              };
            }
            // Remove vote from previously selected option
            if (poll.userVotes.includes(opt.id)) {
              return {
                ...opt,
                votes: opt.votes - 1,
                voters: opt.voters.filter(v => v !== 'You'),
              };
            }
            return opt;
          }
        });

        const newUserVotes = poll.allowMultiple
          ? poll.userVotes.includes(optionId)
            ? poll.userVotes.filter(id => id !== optionId)
            : [...poll.userVotes, optionId]
          : [optionId];

        const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

        return {
          ...poll,
          options: updatedOptions,
          userVoted: newUserVotes.length > 0,
          userVotes: newUserVotes,
          totalVotes,
        };
      })
    );
  };

  const getStatusColor = (status: PollStatus) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'closed':
        return '#6b7280';
      case 'scheduled':
        return '#f59e0b';
      default:
        return theme.colors.textSubtle;
    }
  };

  const getStatusIcon = (status: PollStatus) => {
    switch (status) {
      case 'active':
        return 'radio-button-on';
      case 'closed':
        return 'checkmark-circle';
      case 'scheduled':
        return 'time';
      default:
        return 'ellipse';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    addButton: {
      padding: 8,
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSubtle,
      textAlign: 'center',
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: accentColorHex + '15',
      borderColor: accentColorHex,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSubtle,
    },
    filterButtonTextActive: {
      color: accentColorHex,
    },
    pollsScroll: {
      flex: 1,
    },
    pollsContainer: {
      padding: 20,
      gap: 16,
    },
    pollCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pollHeader: {
      gap: 8,
    },
    pollHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pollTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    pollDescription: {
      fontSize: 13,
      color: theme.colors.textSubtle,
      lineHeight: 18,
    },
    pollMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSubtle,
    },
    pollOptions: {
      gap: 8,
    },
    optionButton: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    optionButtonSelected: {
      borderColor: accentColorHex,
      backgroundColor: accentColorHex + '10',
    },
    optionContent: {
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    optionCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionCheckboxSelected: {
      borderColor: accentColorHex,
      backgroundColor: accentColorHex,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    optionPercentage: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    optionBar: {
      height: 4,
      backgroundColor: accentColorHex,
    },
    pollActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    primaryButton: {
      backgroundColor: accentColorHex,
      borderColor: accentColorHex,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    primaryButtonText: {
      color: '#ffffff',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    modalClose: {
      padding: 4,
    },
    modalBody: {
      padding: 20,
      gap: 20,
    },
    modalSection: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    resultOption: {
      gap: 8,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resultText: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    resultStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resultPercentage: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    resultVotes: {
      fontSize: 13,
      color: theme.colors.textSubtle,
    },
    resultBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    resultBarFill: {
      height: '100%',
      backgroundColor: accentColorHex,
      borderRadius: 4,
    },
    votersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    voterBadge: {
      backgroundColor: theme.colors.background,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    voterText: {
      fontSize: 11,
      color: theme.colors.textSubtle,
    },
    modalFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 12,
    },
    footerButton: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    deleteButton: {
      backgroundColor: '#ef444415',
      borderColor: '#ef4444',
    },
    deleteButtonText: {
      color: '#ef4444',
      fontSize: 15,
      fontWeight: '700',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    emptyStateText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSubtle,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.colors.textSubtle,
      opacity: 0.7,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Polls</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={accentColorHex} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.participated}</Text>
          <Text style={styles.statLabel}>Participated</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterButtonText, filter === 'active' && styles.filterButtonTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'closed' && styles.filterButtonActive]}
          onPress={() => setFilter('closed')}
        >
          <Text style={[styles.filterButtonText, filter === 'closed' && styles.filterButtonTextActive]}>
            Closed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Polls List */}
      <ScrollView style={styles.pollsScroll}>
        <View style={styles.pollsContainer}>
          {getFilteredPolls().length > 0 ? (
            getFilteredPolls().map(poll => (
              <View key={poll.id} style={styles.pollCard}>
                {/* Poll Header */}
                <View style={styles.pollHeader}>
                  <View style={styles.pollHeaderRow}>
                    <Text style={styles.pollTitle}>{poll.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(poll.status) + '20' }]}>
                      <Ionicons
                        name={getStatusIcon(poll.status) as any}
                        size={12}
                        color={getStatusColor(poll.status)}
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(poll.status) }]}>
                        {poll.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pollDescription}>{poll.description}</Text>
                </View>

                {/* Poll Meta */}
                <View style={styles.pollMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={14} color={theme.colors.textSubtle} />
                    <Text style={styles.metaText}>{poll.createdBy}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSubtle} />
                    <Text style={styles.metaText}>{poll.createdAt}</Text>
                  </View>
                  {poll.endsAt && (
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.textSubtle} />
                      <Text style={styles.metaText}>Ends {poll.endsAt}</Text>
                    </View>
                  )}
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={14} color={theme.colors.textSubtle} />
                    <Text style={styles.metaText}>{poll.totalVotes} votes</Text>
                  </View>
                  {poll.allowMultiple && (
                    <View style={styles.metaItem}>
                      <Ionicons name="checkmark-done" size={14} color={accentColorHex} />
                      <Text style={[styles.metaText, { color: accentColorHex }]}>Multiple choice</Text>
                    </View>
                  )}
                  {poll.anonymous && (
                    <View style={styles.metaItem}>
                      <Ionicons name="eye-off" size={14} color={theme.colors.textSubtle} />
                      <Text style={styles.metaText}>Anonymous</Text>
                    </View>
                  )}
                </View>

                {/* Poll Options */}
                <View style={styles.pollOptions}>
                  {poll.options.map(option => {
                    const percentage = poll.totalVotes > 0
                      ? Math.round((option.votes / poll.totalVotes) * 100)
                      : 0;
                    const isSelected = poll.userVotes.includes(option.id);
                    const showResults = poll.userVoted || poll.status === 'closed';

                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonSelected,
                        ]}
                        onPress={() => {
                          if (poll.status === 'active') {
                            handleVote(poll.id, option.id);
                          }
                        }}
                        disabled={poll.status !== 'active'}
                      >
                        <View style={styles.optionContent}>
                          <View style={styles.optionLeft}>
                            <View style={[
                              styles.optionCheckbox,
                              isSelected && styles.optionCheckboxSelected,
                            ]}>
                              {isSelected && (
                                <Ionicons name="checkmark" size={14} color="#ffffff" />
                              )}
                            </View>
                            <Text style={styles.optionText}>{option.text}</Text>
                          </View>
                          {showResults && (
                            <Text style={styles.optionPercentage}>{percentage}%</Text>
                          )}
                        </View>
                        {showResults && (
                          <View style={styles.optionBar} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Poll Actions */}
                <View style={styles.pollActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedPoll(poll);
                      setShowResults(true);
                      setShowPollModal(true);
                    }}
                  >
                    <Text style={styles.actionButtonText}>View Results</Text>
                  </TouchableOpacity>
                  {poll.status === 'active' && !poll.userVoted && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryButton]}
                      disabled={poll.userVotes.length === 0}
                    >
                      <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                        Submit Vote
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color={theme.colors.textSubtle} />
              <Text style={styles.emptyStateText}>No polls found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different filter</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Poll Results Modal */}
      <Modal
        visible={showPollModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPollModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Poll Results</Text>
              <TouchableOpacity onPress={() => setShowPollModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPoll && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>{selectedPoll.title}</Text>
                    <Text style={styles.pollDescription}>{selectedPoll.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>
                      Results ({selectedPoll.totalVotes} votes)
                    </Text>
                    {selectedPoll.options.map(option => {
                      const percentage = selectedPoll.totalVotes > 0
                        ? Math.round((option.votes / selectedPoll.totalVotes) * 100)
                        : 0;

                      return (
                        <View key={option.id} style={styles.resultOption}>
                          <View style={styles.resultHeader}>
                            <Text style={styles.resultText}>{option.text}</Text>
                            <View style={styles.resultStats}>
                              <Text style={styles.resultPercentage}>{percentage}%</Text>
                              <Text style={styles.resultVotes}>({option.votes})</Text>
                            </View>
                          </View>
                          <View style={styles.resultBar}>
                            <View
                              style={[styles.resultBarFill, { width: `${percentage}%` }]}
                            />
                          </View>
                          {!selectedPoll.anonymous && option.voters.length > 0 && (
                            <View style={styles.votersList}>
                              {option.voters.map((voter, idx) => (
                                <View key={idx} style={styles.voterBadge}>
                                  <Text style={styles.voterText}>{voter}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  {selectedPoll.status === 'active' && (
                    <TouchableOpacity style={[styles.footerButton, styles.deleteButton]}>
                      <Text style={styles.deleteButtonText}>Close Poll</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

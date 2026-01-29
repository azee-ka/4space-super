import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../../src/utils/themeUtils';
import { theme } from '../../../../../src/styles/theme';

type FormStatus = 'active' | 'closed' | 'draft';
type QuestionType = 'text' | 'multiple-choice' | 'checkbox' | 'rating' | 'email';

interface FormQuestion {
  id: string;
  type: QuestionType;
  question: string;
  required: boolean;
  options?: string[];
}

interface Form {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  questions: number;
  responses: number;
  completionRate: number;
  questions_detail: FormQuestion[];
}

export default function FormsWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [filter, setFilter] = useState<FormStatus | 'all'>('all');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [forms, setForms] = useState<Form[]>([
    {
      id: '1',
      title: 'User Satisfaction Survey',
      description: 'Gather feedback on product experience and satisfaction',
      status: 'active',
      createdBy: 'Sarah Chen',
      createdAt: '2026-01-20',
      modifiedAt: '2026-01-27',
      questions: 12,
      responses: 156,
      completionRate: 87,
      questions_detail: [
        { id: 'q1', type: 'rating', question: 'How satisfied are you with our product?', required: true },
        { id: 'q2', type: 'multiple-choice', question: 'How often do you use our product?', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
        { id: 'q3', type: 'text', question: 'What features do you use most?', required: false },
        { id: 'q4', type: 'checkbox', question: 'Which improvements would you like to see?', required: false, options: ['Performance', 'New features', 'Better UI', 'More integrations'] },
      ],
    },
    {
      id: '2',
      title: 'Employee Onboarding Form',
      description: 'Collect information from new team members',
      status: 'active',
      createdBy: 'Emma Wilson',
      createdAt: '2026-01-18',
      modifiedAt: '2026-01-25',
      questions: 8,
      responses: 24,
      completionRate: 95,
      questions_detail: [
        { id: 'q1', type: 'text', question: 'Full Name', required: true },
        { id: 'q2', type: 'email', question: 'Email Address', required: true },
        { id: 'q3', type: 'text', question: 'Phone Number', required: true },
        { id: 'q4', type: 'multiple-choice', question: 'Department', required: true, options: ['Engineering', 'Design', 'Marketing', 'Sales'] },
      ],
    },
    {
      id: '3',
      title: 'Event Registration',
      description: 'Register for upcoming team building event',
      status: 'active',
      createdBy: 'Mike Johnson',
      createdAt: '2026-01-22',
      modifiedAt: '2026-01-26',
      questions: 6,
      responses: 42,
      completionRate: 73,
      questions_detail: [
        { id: 'q1', type: 'text', question: 'Name', required: true },
        { id: 'q2', type: 'email', question: 'Email', required: true },
        { id: 'q3', type: 'multiple-choice', question: 'Will you attend?', required: true, options: ['Yes', 'No', 'Maybe'] },
        { id: 'q4', type: 'checkbox', question: 'Dietary restrictions', required: false, options: ['Vegetarian', 'Vegan', 'Gluten-free', 'None'] },
      ],
    },
    {
      id: '4',
      title: 'Feature Request Form',
      description: 'Submit ideas for new product features',
      status: 'active',
      createdBy: 'Alex Brown',
      createdAt: '2026-01-15',
      modifiedAt: '2026-01-24',
      questions: 5,
      responses: 89,
      completionRate: 91,
      questions_detail: [
        { id: 'q1', type: 'text', question: 'Feature Title', required: true },
        { id: 'q2', type: 'text', question: 'Describe the feature', required: true },
        { id: 'q3', type: 'multiple-choice', question: 'Priority', required: true, options: ['High', 'Medium', 'Low'] },
        { id: 'q4', type: 'rating', question: 'How important is this to you?', required: false },
      ],
    },
    {
      id: '5',
      title: 'Bug Report Form',
      description: 'Report issues and bugs you encounter',
      status: 'active',
      createdBy: 'David Lee',
      createdAt: '2026-01-12',
      modifiedAt: '2026-01-23',
      questions: 7,
      responses: 67,
      completionRate: 82,
      questions_detail: [
        { id: 'q1', type: 'text', question: 'Bug Summary', required: true },
        { id: 'q2', type: 'text', question: 'Steps to reproduce', required: true },
        { id: 'q3', type: 'multiple-choice', question: 'Severity', required: true, options: ['Critical', 'High', 'Medium', 'Low'] },
        { id: 'q4', type: 'text', question: 'Expected behavior', required: false },
      ],
    },
    {
      id: '6',
      title: 'Customer Feedback',
      description: 'Share your experience with our service',
      status: 'closed',
      createdBy: 'Lisa Martinez',
      createdAt: '2026-01-08',
      modifiedAt: '2026-01-20',
      questions: 10,
      responses: 203,
      completionRate: 89,
      questions_detail: [
        { id: 'q1', type: 'rating', question: 'Overall satisfaction', required: true },
        { id: 'q2', type: 'text', question: 'What did you like most?', required: false },
        { id: 'q3', type: 'text', question: 'What could be improved?', required: false },
      ],
    },
    {
      id: '7',
      title: 'Team Skills Assessment',
      description: 'Assess team member skills and interests',
      status: 'draft',
      createdBy: 'Tom Anderson',
      createdAt: '2026-01-25',
      modifiedAt: '2026-01-26',
      questions: 15,
      responses: 0,
      completionRate: 0,
      questions_detail: [
        { id: 'q1', type: 'multiple-choice', question: 'Primary skill area', required: true, options: ['Frontend', 'Backend', 'Design', 'DevOps'] },
        { id: 'q2', type: 'checkbox', question: 'Additional skills', required: false, options: ['React', 'Node.js', 'Python', 'AWS'] },
      ],
    },
  ]);

  const getFilteredForms = () => {
    if (filter === 'all') return forms;
    return forms.filter(form => form.status === filter);
  };

  const stats = {
    total: forms.length,
    active: forms.filter(f => f.status === 'active').length,
    totalResponses: forms.reduce((sum, f) => sum + f.responses, 0),
    avgCompletion: Math.round(forms.reduce((sum, f) => sum + f.completionRate, 0) / forms.length),
  };

  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'closed':
        return '#6b7280';
      case 'draft':
        return '#f59e0b';
      default:
        return theme.colors.textSubtle;
    }
  };

  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'active':
        return 'radio-button-on';
      case 'closed':
        return 'checkmark-circle';
      case 'draft':
        return 'create';
      default:
        return 'ellipse';
    }
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'text':
        return 'text';
      case 'multiple-choice':
        return 'radio-button-on';
      case 'checkbox':
        return 'checkbox';
      case 'rating':
        return 'star';
      case 'email':
        return 'mail';
      default:
        return 'help-circle';
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
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 6,
      marginBottom: 6,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#06b6d4',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSubtle,
      letterSpacing: 0.2,
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
    formsScroll: {
      flex: 1,
    },
    formsContainer: {
      padding: 20,
      gap: 16,
    },
    formCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    formHeader: {
      gap: 8,
    },
    formHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    formTitle: {
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
    formDescription: {
      fontSize: 13,
      color: theme.colors.textSubtle,
      lineHeight: 18,
    },
    formMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
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
    formStats: {
      flexDirection: 'row',
      gap: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    statItemNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    statItemLabel: {
      fontSize: 11,
      color: theme.colors.textSubtle,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: accentColorHex,
      borderRadius: 3,
    },
    formActions: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    primaryButton: {
      backgroundColor: accentColorHex,
      borderColor: accentColorHex,
    },
    actionButtonText: {
      fontSize: 13,
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
      flex: 1,
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
    modalInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalInfoText: {
      fontSize: 15,
      color: theme.colors.text,
      flex: 1,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statBoxNumber: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statBoxLabel: {
      fontSize: 12,
      color: theme.colors.textSubtle,
      textAlign: 'center',
    },
    questionsList: {
      gap: 12,
    },
    questionItem: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 8,
    },
    questionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    questionType: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 3,
      paddingHorizontal: 8,
      backgroundColor: accentColorHex + '15',
      borderRadius: 6,
    },
    questionTypeText: {
      fontSize: 10,
      fontWeight: '700',
      color: accentColorHex,
      textTransform: 'uppercase',
    },
    requiredBadge: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      backgroundColor: '#ef444415',
      borderRadius: 6,
    },
    requiredText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ef4444',
      textTransform: 'uppercase',
    },
    questionText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
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
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    footerPrimaryButton: {
      backgroundColor: accentColorHex,
      borderColor: accentColorHex,
    },
    footerButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    footerPrimaryButtonText: {
      color: '#ffffff',
    },
    deleteButton: {
      backgroundColor: '#ef444415',
      borderColor: '#ef4444',
    },
    deleteButtonText: {
      color: '#ef4444',
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
        <Text style={styles.headerTitle}>Forms</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={accentColorHex} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Forms</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalResponses}</Text>
          <Text style={styles.statLabel}>Responses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.avgCompletion}%</Text>
          <Text style={styles.statLabel}>Avg Complete</Text>
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
        <TouchableOpacity
          style={[styles.filterButton, filter === 'draft' && styles.filterButtonActive]}
          onPress={() => setFilter('draft')}
        >
          <Text style={[styles.filterButtonText, filter === 'draft' && styles.filterButtonTextActive]}>
            Drafts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Forms List */}
      <ScrollView style={styles.formsScroll}>
        <View style={styles.formsContainer}>
          {getFilteredForms().length > 0 ? (
            getFilteredForms().map(form => (
              <TouchableOpacity
                key={form.id}
                style={styles.formCard}
                onPress={() => {
                  setSelectedForm(form);
                  setShowFormModal(true);
                }}
              >
                <View style={styles.formHeader}>
                  <View style={styles.formHeaderRow}>
                    <Text style={styles.formTitle}>{form.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(form.status) + '20' }]}>
                      <Ionicons
                        name={getStatusIcon(form.status) as any}
                        size={12}
                        color={getStatusColor(form.status)}
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(form.status) }]}>
                        {form.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.formDescription}>{form.description}</Text>
                </View>

                <View style={styles.formMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={14} color={theme.colors.textSubtle} />
                    <Text style={styles.metaText}>{form.createdBy}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSubtle} />
                    <Text style={styles.metaText}>{form.modifiedAt}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="help-circle-outline" size={14} color={theme.colors.textSubtle} />
                    <Text style={styles.metaText}>{form.questions} questions</Text>
                  </View>
                </View>

                <View style={styles.formStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemNumber}>{form.responses}</Text>
                    <Text style={styles.statItemLabel}>Responses</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemNumber}>{form.completionRate}%</Text>
                    <Text style={styles.statItemLabel}>Completion</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${form.completionRate}%` }]} />
                    </View>
                  </View>
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="bar-chart-outline" size={16} color={theme.colors.text} />
                    <Text style={styles.actionButtonText}>Results</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                    <Ionicons name="create-outline" size={16} color="#ffffff" />
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={48} color={theme.colors.textSubtle} />
              <Text style={styles.emptyStateText}>No forms found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different filter</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Form Detail Modal */}
      <Modal
        visible={showFormModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFormModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedForm?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowFormModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedForm && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.formDescription}>{selectedForm.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Statistics</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{selectedForm.responses}</Text>
                        <Text style={styles.statBoxLabel}>Responses</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{selectedForm.questions}</Text>
                        <Text style={styles.statBoxLabel}>Questions</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{selectedForm.completionRate}%</Text>
                        <Text style={styles.statBoxLabel}>Completion</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name={getStatusIcon(selectedForm.status) as any}
                        size={20}
                        color={getStatusColor(selectedForm.status)}
                      />
                      <Text style={styles.modalInfoText}>
                        Status: {selectedForm.status.charAt(0).toUpperCase() + selectedForm.status.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created by {selectedForm.createdBy}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created {selectedForm.createdAt}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Modified {selectedForm.modifiedAt}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>
                      Questions ({selectedForm.questions_detail.length})
                    </Text>
                    <View style={styles.questionsList}>
                      {selectedForm.questions_detail.map((q, idx) => (
                        <View key={q.id} style={styles.questionItem}>
                          <View style={styles.questionHeader}>
                            <View style={styles.questionType}>
                              <Ionicons
                                name={getQuestionTypeIcon(q.type) as any}
                                size={10}
                                color={accentColorHex}
                              />
                              <Text style={styles.questionTypeText}>{q.type.replace('-', ' ')}</Text>
                            </View>
                            {q.required && (
                              <View style={styles.requiredBadge}>
                                <Text style={styles.requiredText}>Required</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.questionText}>
                            {idx + 1}. {q.question}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={[styles.footerButton, styles.footerPrimaryButton]}>
                    <Ionicons name="bar-chart-outline" size={20} color="#ffffff" />
                    <Text style={[styles.footerButtonText, styles.footerPrimaryButtonText]}>
                      View Results
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={[styles.footerButton, { flex: 1 }]}>
                      <Ionicons name="share-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.footerButtonText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.footerButton, { flex: 1 }]}>
                      <Ionicons name="create-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.footerButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.footerButton, styles.deleteButton, { flex: 1 }]}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
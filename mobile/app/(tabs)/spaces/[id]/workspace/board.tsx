import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../../src/utils/themeUtils';
import { theme } from '../../../../../src/styles/theme';

type Priority = 'Low' | 'Medium' | 'High';
type Status = 'todo' | 'in_progress' | 'review' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  status: Status;
  comments: number;
  dueDate?: string;
  labels: string[];
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Design new landing page', description: 'Create mockups for homepage redesign', priority: 'High', assignee: 'JD', status: 'todo', comments: 3, dueDate: 'Jan 30', labels: ['Design', 'UI'] },
  { id: '2', title: 'Update documentation', description: 'Add API endpoint examples', priority: 'Medium', assignee: 'SM', status: 'todo', comments: 1, labels: ['Docs'] },
  { id: '3', title: 'Fix navigation bug', description: 'Navigation breaks on mobile', priority: 'High', assignee: 'TK', status: 'todo', comments: 5, dueDate: 'Jan 28', labels: ['Bug', 'Mobile'] },
  { id: '4', title: 'Implement dark mode', description: 'Add theme switcher to settings', priority: 'Medium', assignee: 'AL', status: 'in_progress', comments: 2, labels: ['Feature'] },
  { id: '5', title: 'Optimize images', description: 'Reduce bundle size', priority: 'Low', assignee: 'RJ', status: 'in_progress', comments: 0, labels: ['Performance'] },
  { id: '6', title: 'Add search feature', description: 'Global search across workspace', priority: 'High', assignee: 'MK', status: 'in_progress', comments: 7, dueDate: 'Feb 2', labels: ['Feature'] },
  { id: '7', title: 'User authentication', description: 'OAuth integration complete', priority: 'High', assignee: 'JD', status: 'review', comments: 4, labels: ['Backend'] },
  { id: '8', title: 'Performance audit', description: 'Lighthouse score improvements', priority: 'Medium', assignee: 'SM', status: 'review', comments: 2, labels: ['Performance'] },
  { id: '9', title: 'Setup CI/CD pipeline', description: 'Automated deployments configured', priority: 'High', assignee: 'TK', status: 'done', comments: 1, labels: ['DevOps'] },
  { id: '10', title: 'Database migration', description: 'Moved to PostgreSQL', priority: 'High', assignee: 'RJ', status: 'done', comments: 3, labels: ['Backend'] },
];

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#6b7280' },
  { id: 'in_progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#a855f7' },
  { id: 'done', title: 'Done', color: '#10b981' },
];

export default function BoardWorkspaceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaceId = Array.isArray(id) ? id[0] : id;
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [filter, setFilter] = useState<'all' | Priority>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getTasksByStatus = (status: Status) => {
    return tasks.filter(task => task.status === status && (filter === 'all' || task.priority === filter));
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Board</Text>
          <Text style={styles.headerSubtitle}>{tasks.length} tasks</Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: accentHex }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {['all', 'High', 'Medium', 'Low'].map((f) => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, isActive && { backgroundColor: accentHex }]}
                onPress={() => setFilter(f as typeof filter)}
              >
                <Text style={[styles.filterText, isActive && { color: '#fff' }]}>
                  {f === 'all' ? 'All Tasks' : f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {COLUMNS.map(column => (
          <View key={column.id} style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: column.color }]} />
            <Text style={styles.statValue}>{getTasksByStatus(column.id as Status).length}</Text>
            <Text style={styles.statLabel}>{column.title}</Text>
          </View>
        ))}
      </View>

      {/* Kanban Board */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardScroll}>
        <View style={styles.boardContainer}>
          {COLUMNS.map(column => {
            const columnTasks = getTasksByStatus(column.id as Status);
            return (
              <View key={column.id} style={styles.column}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>{column.title}</Text>
                  <View style={[styles.columnCount, { backgroundColor: column.color + '20' }]}>
                    <Text style={[styles.columnCountText, { color: column.color }]}>
                      {columnTasks.length}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                  {columnTasks.map(task => (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskCard}
                      onPress={() => setSelectedTask(task)}
                    >
                      <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                          <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                            {task.priority}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>

                      {task.labels.length > 0 && (
                        <View style={styles.labelsRow}>
                          {task.labels.slice(0, 2).map(label => (
                            <View key={label} style={styles.label}>
                              <Text style={styles.labelText}>{label}</Text>
                            </View>
                          ))}
                          {task.labels.length > 2 && (
                            <Text style={styles.moreLabels}>+{task.labels.length - 2}</Text>
                          )}
                        </View>
                      )}

                      <View style={styles.taskFooter}>
                        <View style={styles.taskFooterLeft}>
                          <View style={styles.assigneeBadge}>
                            <Text style={styles.assigneeText}>{task.assignee}</Text>
                          </View>
                          {task.dueDate && (
                            <View style={styles.dueDateBadge}>
                              <Ionicons name="calendar-outline" size={10} color={theme.colors.textSubtle} />
                              <Text style={styles.dueDateText}>{task.dueDate}</Text>
                            </View>
                          )}
                        </View>
                        {task.comments > 0 && (
                          <View style={styles.commentsCount}>
                            <Ionicons name="chatbubble-outline" size={12} color={theme.colors.textSubtle} />
                            <Text style={styles.commentsText}>{task.comments}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.addTaskButton}
                    onPress={() => setShowCreateModal(true)}
                  >
                    <Ionicons name="add" size={16} color={theme.colors.textSubtle} />
                    <Text style={styles.addTaskText}>Add task</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          visible={!!selectedTask}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedTask(null)}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedTask(null)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Task Details</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.detailTitle}>{selectedTask.title}</Text>
              <Text style={styles.detailDescription}>{selectedTask.description}</Text>

              <View style={styles.detailRow}>
                <Ionicons name="flag" size={20} color={getPriorityColor(selectedTask.priority)} />
                <Text style={styles.detailLabel}>Priority</Text>
                <View style={[styles.detailValue, { backgroundColor: getPriorityColor(selectedTask.priority) + '20' }]}>
                  <Text style={[styles.detailValueText, { color: getPriorityColor(selectedTask.priority) }]}>
                    {selectedTask.priority}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="person" size={20} color={theme.colors.textSubtle} />
                <Text style={styles.detailLabel}>Assigned to</Text>
                <Text style={styles.detailValueText}>{selectedTask.assignee}</Text>
              </View>

              {selectedTask.dueDate && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={20} color={theme.colors.textSubtle} />
                  <Text style={styles.detailLabel}>Due date</Text>
                  <Text style={styles.detailValueText}>{selectedTask.dueDate}</Text>
                </View>
              )}

              <View style={styles.labelsSection}>
                <Text style={styles.sectionTitle}>Labels</Text>
                <View style={styles.labelsWrap}>
                  {selectedTask.labels.map(label => (
                    <View key={label} style={styles.labelLarge}>
                      <Text style={styles.labelLargeText}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.actionsSection}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: accentHex }]}>
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit Task</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButtonSecondary}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text style={[styles.actionButtonTextSecondary, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    maxHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    textAlign: 'center',
  },
  boardScroll: {
    flex: 1,
  },
  boardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 20,
  },
  column: {
    width: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  columnCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  columnScroll: {
    maxHeight: 600,
  },
  taskCard: {
    backgroundColor: theme.colors.base,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 16,
    marginBottom: 10,
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  label: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 10,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  moreLabels: {
    fontSize: 10,
    color: theme.colors.textSubtle,
    alignSelf: 'center',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assigneeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 10,
    color: theme.colors.textSubtle,
  },
  commentsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentsText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  addTaskText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 15,
    color: theme.colors.textSubtle,
    lineHeight: 22,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  detailValue: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  labelsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  labelsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelLarge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  labelLargeText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  actionsSection: {
    marginTop: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
});

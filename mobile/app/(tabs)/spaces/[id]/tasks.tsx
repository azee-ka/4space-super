import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type ViewType = 'list' | 'board';
type FilterType = 'all' | 'my_tasks' | 'assigned_by_me';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedBy: string;
  dueDate?: string;
  createdAt: string;
  tags: string[];
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create mockups for the new landing page with updated branding',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'John Doe',
    assignedBy: 'Jane Smith',
    dueDate: '2026-01-30',
    createdAt: '2026-01-20',
    tags: ['design', 'ui'],
  },
  {
    id: '2',
    title: 'Fix authentication bug',
    description: 'Users are unable to log in with Google OAuth',
    status: 'todo',
    priority: 'urgent',
    assignedTo: 'Bob Wilson',
    assignedBy: 'Jane Smith',
    dueDate: '2026-01-28',
    createdAt: '2026-01-25',
    tags: ['bug', 'auth'],
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all REST API endpoints with examples',
    status: 'review',
    priority: 'medium',
    assignedTo: 'Alice Brown',
    assignedBy: 'Charlie Davis',
    dueDate: '2026-02-05',
    createdAt: '2026-01-15',
    tags: ['docs', 'api'],
  },
  {
    id: '4',
    title: 'Update dependencies',
    description: 'Update all npm packages to latest versions',
    status: 'done',
    priority: 'low',
    assignedTo: 'David Lee',
    assignedBy: 'Emma White',
    dueDate: '2026-01-25',
    createdAt: '2026-01-10',
    tags: ['maintenance'],
  },
  {
    id: '5',
    title: 'Implement search feature',
    description: 'Add full-text search across all content',
    status: 'todo',
    priority: 'high',
    assignedTo: 'Frank Green',
    assignedBy: 'Jane Smith',
    dueDate: '2026-02-10',
    createdAt: '2026-01-22',
    tags: ['feature', 'search'],
  },
  {
    id: '6',
    title: 'Setup CI/CD pipeline',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'Charlie Davis',
    assignedBy: 'Bob Wilson',
    dueDate: '2026-02-01',
    createdAt: '2026-01-18',
    tags: ['devops', 'ci'],
  },
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  todo: { label: 'To Do', color: '#6b7280', icon: 'radio-button-off-outline' },
  in_progress: { label: 'In Progress', color: '#3b82f6', icon: 'play-circle-outline' },
  review: { label: 'Review', color: '#a855f7', icon: 'checkmark-circle-outline' },
  done: { label: 'Done', color: '#10b981', icon: 'checkmark-done-circle-outline' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: '#10b981', icon: 'arrow-down' },
  medium: { label: 'Medium', color: '#f59e0b', icon: 'remove' },
  high: { label: 'High', color: '#ef4444', icon: 'arrow-up' },
  urgent: { label: 'Urgent', color: '#dc2626', icon: 'warning' },
};

export default function SpaceTasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = useMemo(() => {
    let filtered = MOCK_TASKS;

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    // TODO: Implement actual user filtering
    // if (filterType === 'my_tasks') {
    //   filtered = filtered.filter((task) => task.assignedTo === currentUser.id);
    // }
    // if (filterType === 'assigned_by_me') {
    //   filtered = filtered.filter((task) => task.assignedBy === currentUser.id);
    // }

    return filtered;
  }, [searchQuery, selectedStatus, filterType]);

  const tasksByStatus = useMemo(() => {
    return {
      todo: filteredTasks.filter((t) => t.status === 'todo'),
      in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
      review: filteredTasks.filter((t) => t.status === 'review'),
      done: filteredTasks.filter((t) => t.status === 'done'),
    };
  }, [filteredTasks]);

  const handleCreateTask = () => {
    // TODO: Implement create task modal
    console.log('Create task');
  };

  const handleTaskPress = (task: Task) => {
    // TODO: Open task detail modal
    Alert.alert(
      task.title,
      task.description || 'No description',
      [
        { text: 'Edit', onPress: () => console.log('Edit task:', task.id) },
        { text: 'Change Status', onPress: () => console.log('Change status:', task.id) },
        { text: 'Delete', onPress: () => handleDeleteTask(task), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete task mutation
            console.log('Delete task:', task.id);
          },
        },
      ]
    );
  };

  const renderTaskCard = (task: Task) => {
    const statusConfig = STATUS_CONFIG[task.status];
    const priorityConfig = PRIORITY_CONFIG[task.priority];
    const overdue = isOverdue(task.dueDate);

    return (
      <TouchableOpacity
        key={task.id}
        style={styles.taskCard}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskPriority}>
            <Ionicons
              name={priorityConfig.icon as any}
              size={14}
              color={priorityConfig.color}
            />
            <Text style={[styles.taskPriorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
          <View style={[styles.taskStatus, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.taskStatusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        {task.tags.length > 0 && (
          <View style={styles.taskTags}>
            {task.tags.map((tag) => (
              <View key={tag} style={styles.taskTag}>
                <Text style={styles.taskTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.taskFooter}>
          <View style={styles.taskAssignee}>
            <View style={styles.taskAssigneeAvatar}>
              <Text style={styles.taskAssigneeAvatarText}>
                {task.assignedTo?.split(' ').map(n => n[0]).join('') || '?'}
              </Text>
            </View>
            <Text style={styles.taskAssigneeText}>{task.assignedTo || 'Unassigned'}</Text>
          </View>
          {task.dueDate && (
            <View style={styles.taskDueDate}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={overdue ? '#ef4444' : theme.colors.textSubtle}
              />
              <Text
                style={[
                  styles.taskDueDateText,
                  overdue && { color: '#ef4444', fontWeight: '600' },
                ]}
              >
                {formatDate(task.dueDate)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderBoardColumn = (status: TaskStatus) => {
    const config = STATUS_CONFIG[status];
    const tasks = tasksByStatus[status];

    return (
      <View key={status} style={styles.boardColumn}>
        <View style={styles.boardColumnHeader}>
          <View style={[styles.boardColumnIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={16} color={config.color} />
          </View>
          <Text style={styles.boardColumnTitle}>{config.label}</Text>
          <View style={[styles.boardColumnCount, { backgroundColor: config.color }]}>
            <Text style={styles.boardColumnCountText}>{tasks.length}</Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.boardColumnContent}>
          {tasks.map(renderTaskCard)}
          {tasks.length === 0 && (
            <View style={styles.boardColumnEmpty}>
              <Text style={styles.boardColumnEmptyText}>No tasks</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: accentHex }]}
          onPress={handleCreateTask}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#6b7280' + '15' }]}>
            <Ionicons name="list" size={16} color="#6b7280" />
          </View>
          <Text style={styles.statValue}>{tasksByStatus.todo.length}</Text>
          <Text style={styles.statLabel}>To Do</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#3b82f6' + '15' }]}>
            <Ionicons name="time" size={16} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{tasksByStatus.in_progress.length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#a855f7' + '15' }]}>
            <Ionicons name="eye" size={16} color="#a855f7" />
          </View>
          <Text style={styles.statValue}>{tasksByStatus.review.length}</Text>
          <Text style={styles.statLabel}>Review</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#10b981' + '15' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          </View>
          <Text style={styles.statValue}>{tasksByStatus.done.length}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.viewTypeButton, { borderColor: accentHex }]}
          onPress={() => setViewType(viewType === 'list' ? 'board' : 'list')}
        >
          <Ionicons
            name={viewType === 'list' ? 'grid-outline' : 'list-outline'}
            size={20}
            color={accentHex}
          />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <TouchableOpacity
          style={[styles.filter, filterType === 'all' && { backgroundColor: accentHex }]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
            All Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filter, filterType === 'my_tasks' && { backgroundColor: accentHex }]}
          onPress={() => setFilterType('my_tasks')}
        >
          <Text style={[styles.filterText, filterType === 'my_tasks' && styles.filterTextActive]}>
            My Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filter,
            filterType === 'assigned_by_me' && { backgroundColor: accentHex },
          ]}
          onPress={() => setFilterType('assigned_by_me')}
        >
          <Text
            style={[
              styles.filterText,
              filterType === 'assigned_by_me' && styles.filterTextActive,
            ]}
          >
            Assigned by Me
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {viewType === 'list' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                selectedStatus === 'all' && { backgroundColor: accentHex + '20', borderColor: accentHex },
              ]}
              onPress={() => setSelectedStatus('all')}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === 'all' && { color: accentHex, fontWeight: '600' },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilter,
                  selectedStatus === status && {
                    backgroundColor: config.color + '20',
                    borderColor: config.color,
                  },
                ]}
                onPress={() => setSelectedStatus(status as TaskStatus)}
              >
                <Ionicons
                  name={config.icon as any}
                  size={14}
                  color={selectedStatus === status ? config.color : theme.colors.textSubtle}
                />
                <Text
                  style={[
                    styles.statusFilterText,
                    selectedStatus === status && { color: config.color, fontWeight: '600' },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {filteredTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-outline" size={64} color={theme.colors.textMuted} />
                <Text style={styles.emptyStateTitle}>No tasks found</Text>
                <Text style={styles.emptyStateDescription}>
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Create your first task to get started'}
                </Text>
              </View>
            ) : (
              filteredTasks.map(renderTaskCard)
            )}
          </ScrollView>
        </>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardContainer}
        >
          {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map(renderBoardColumn)}
        </ScrollView>
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
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  viewTypeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
  },
  filters: {
    paddingHorizontal: 16,
    marginBottom: 12,
    maxHeight: 40,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  filterTextActive: {
    color: '#fff',
  },
  statusFilters: {
    paddingHorizontal: 16,
    marginBottom: 12,
    maxHeight: 40,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSubtle,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  taskCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskPriorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
    marginBottom: 10,
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  taskTag: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskTagText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    fontWeight: '500',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskAssigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskAssigneeAvatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  taskAssigneeText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDueDateText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    fontWeight: '500',
  },
  boardContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  boardColumn: {
    width: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
  },
  boardColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  boardColumnIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardColumnTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  boardColumnCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  boardColumnCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  boardColumnContent: {
    paddingBottom: 8,
  },
  boardColumnEmpty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  boardColumnEmptyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    textAlign: 'center',
  },
});

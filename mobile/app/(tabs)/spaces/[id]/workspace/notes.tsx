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

type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';

interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  pinned: boolean;
  tags: string[];
  checklist?: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

const NOTE_COLORS = [
  { id: 'yellow', name: 'Yellow', color: '#fef3c7', darkColor: '#fbbf24' },
  { id: 'pink', name: 'Pink', color: '#fce7f3', darkColor: '#ec4899' },
  { id: 'blue', name: 'Blue', color: '#dbeafe', darkColor: '#3b82f6' },
  { id: 'green', name: 'Green', color: '#d1fae5', darkColor: '#10b981' },
  { id: 'purple', name: 'Purple', color: '#ede9fe', darkColor: '#8b5cf6' },
  { id: 'orange', name: 'Orange', color: '#fed7aa', darkColor: '#f59e0b' },
];

export default function NotesWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Sprint Planning Notes',
      content: 'Key items to discuss:\n- Feature prioritization\n- Resource allocation\n- Timeline adjustments\n- Dependencies and blockers',
      color: 'yellow',
      createdBy: 'Sarah Chen',
      createdAt: '2026-01-25',
      modifiedAt: '2026-01-27',
      pinned: true,
      tags: ['planning', 'sprint'],
    },
    {
      id: '2',
      title: 'Design System Updates',
      content: 'Components to update:\n- Button variants\n- Input fields\n- Modal dialogs\n- Color tokens',
      color: 'pink',
      createdBy: 'Emma Wilson',
      createdAt: '2026-01-24',
      modifiedAt: '2026-01-26',
      pinned: true,
      tags: ['design', 'components'],
      checklist: [
        { id: 'c1', text: 'Button variants', completed: true },
        { id: 'c2', text: 'Input fields', completed: false },
        { id: 'c3', text: 'Modal dialogs', completed: false },
        { id: 'c4', text: 'Color tokens', completed: false },
      ],
    },
    {
      id: '3',
      title: 'API Integration Todo',
      content: 'Endpoints to implement:\n1. User authentication\n2. Data sync\n3. File upload\n4. Notifications',
      color: 'blue',
      createdBy: 'Mike Johnson',
      createdAt: '2026-01-22',
      modifiedAt: '2026-01-25',
      pinned: false,
      tags: ['api', 'development'],
    },
    {
      id: '4',
      title: 'Meeting Action Items',
      content: '- Follow up with client about requirements\n- Update project timeline\n- Schedule design review\n- Send proposal to stakeholders',
      color: 'green',
      createdBy: 'Alex Brown',
      createdAt: '2026-01-20',
      modifiedAt: '2026-01-24',
      pinned: false,
      tags: ['meeting', 'action-items'],
      checklist: [
        { id: 'a1', text: 'Follow up with client', completed: true },
        { id: 'a2', text: 'Update timeline', completed: true },
        { id: 'a3', text: 'Schedule review', completed: false },
        { id: 'a4', text: 'Send proposal', completed: false },
      ],
    },
    {
      id: '5',
      title: 'Research Findings',
      content: 'User feedback highlights:\n- UI is too cluttered\n- Navigation needs improvement\n- Performance is excellent\n- Features are well-received',
      color: 'purple',
      createdBy: 'David Lee',
      createdAt: '2026-01-18',
      modifiedAt: '2026-01-23',
      pinned: true,
      tags: ['research', 'feedback'],
    },
    {
      id: '6',
      title: 'Marketing Ideas',
      content: 'Campaign concepts:\n- Social media blitz\n- Email newsletter series\n- Influencer partnerships\n- Product demo videos',
      color: 'orange',
      createdBy: 'Lisa Martinez',
      createdAt: '2026-01-16',
      modifiedAt: '2026-01-22',
      pinned: false,
      tags: ['marketing', 'ideas'],
    },
    {
      id: '7',
      title: 'Code Review Checklist',
      content: '✓ Code quality\n✓ Test coverage\n✓ Documentation\n✓ Performance\n✓ Security',
      color: 'blue',
      createdBy: 'Mike Johnson',
      createdAt: '2026-01-15',
      modifiedAt: '2026-01-21',
      pinned: false,
      tags: ['code', 'review'],
    },
    {
      id: '8',
      title: 'Team Retrospective',
      content: 'What went well:\n- Great collaboration\n- Hit all deadlines\n- Quality work\n\nWhat to improve:\n- Communication\n- Documentation',
      color: 'green',
      createdBy: 'Sarah Chen',
      createdAt: '2026-01-14',
      modifiedAt: '2026-01-20',
      pinned: false,
      tags: ['retrospective', 'team'],
    },
    {
      id: '9',
      title: 'Feature Ideas',
      content: 'User requested features:\n- Dark mode\n- Offline support\n- Export functionality\n- Keyboard shortcuts\n- Bulk actions',
      color: 'yellow',
      createdBy: 'Emma Wilson',
      createdAt: '2026-01-12',
      modifiedAt: '2026-01-19',
      pinned: false,
      tags: ['features', 'ideas'],
    },
    {
      id: '10',
      title: 'Quick Tips',
      content: 'Productivity tips:\n- Use keyboard shortcuts\n- Organize with tags\n- Pin important notes\n- Search with filters\n- Color code by category',
      color: 'pink',
      createdBy: 'Alex Brown',
      createdAt: '2026-01-10',
      modifiedAt: '2026-01-18',
      pinned: false,
      tags: ['tips', 'productivity'],
    },
  ]);

  const getFilteredNotes = () => {
    if (!searchQuery) return notes;

    return notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const togglePin = (noteId: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === noteId ? { ...note, pinned: !note.pinned } : note
      )
    );
  };

  const toggleChecklistItem = (noteId: string, itemId: string) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id !== noteId || !note.checklist) return note;
        return {
          ...note,
          checklist: note.checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      })
    );
  };

  const getColorInfo = (color: NoteColor) => {
    return NOTE_COLORS.find(c => c.id === color) || NOTE_COLORS[0];
  };

  const pinnedNotes = getFilteredNotes().filter(n => n.pinned);
  const unpinnedNotes = getFilteredNotes().filter(n => !n.pinned);

  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.pinned).length,
    withChecklist: notes.filter(n => n.checklist && n.checklist.length > 0).length,
    tags: new Set(notes.flatMap(n => n.tags)).size,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerButton: {
      padding: 8,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
    notesScroll: {
      flex: 1,
    },
    section: {
      padding: 20,
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    sectionCount: {
      fontSize: 14,
      color: theme.colors.textSubtle,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    noteCardGrid: {
      width: '47%',
      borderRadius: 12,
      padding: 16,
      minHeight: 180,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    listContainer: {
      gap: 12,
    },
    noteCardList: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    noteHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    noteTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#000000',
      flex: 1,
      marginBottom: 8,
    },
    pinButton: {
      padding: 4,
    },
    noteContent: {
      fontSize: 14,
      color: '#000000',
      lineHeight: 20,
      opacity: 0.7,
      marginBottom: 12,
    },
    checklist: {
      gap: 8,
      marginBottom: 12,
    },
    checklistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#000000',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.3,
    },
    checkboxChecked: {
      backgroundColor: '#000000',
      opacity: 0.7,
    },
    checklistText: {
      fontSize: 13,
      color: '#000000',
      flex: 1,
      opacity: 0.7,
    },
    checklistTextCompleted: {
      textDecorationLine: 'line-through',
      opacity: 0.4,
    },
    noteMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.1)',
    },
    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontSize: 11,
      color: '#000000',
      opacity: 0.5,
    },
    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
    },
    tag: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    tagText: {
      fontSize: 10,
      color: '#000000',
      fontWeight: '600',
      opacity: 0.6,
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
    modalSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    contentBox: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    contentText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 22,
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
    colorPicker: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
    },
    colorOption: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'transparent',
    },
    colorOptionSelected: {
      borderColor: accentColorHex,
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
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notes</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setView(view === 'list' ? 'grid' : 'list')}
            >
              <Ionicons
                name={view === 'list' ? 'grid-outline' : 'list-outline'}
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.headerButton}>
            <Ionicons name="add-circle" size={28} color={accentColorHex} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor={theme.colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pinned}</Text>
          <Text style={styles.statLabel}>Pinned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.withChecklist}</Text>
          <Text style={styles.statLabel}>Checklists</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.tags}</Text>
          <Text style={styles.statLabel}>Tags</Text>
        </View>
      </View>

      {/* Notes List */}
      <ScrollView style={styles.notesScroll}>
        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pin" size={20} color={accentColorHex} />
              <Text style={styles.sectionTitle}>Pinned</Text>
              <Text style={styles.sectionCount}>({pinnedNotes.length})</Text>
            </View>
            <View style={view === 'grid' ? styles.gridContainer : styles.listContainer}>
              {pinnedNotes.map(note => {
                const colorInfo = getColorInfo(note.color);
                return (
                  <TouchableOpacity
                    key={note.id}
                    style={[
                      view === 'grid' ? styles.noteCardGrid : styles.noteCardList,
                      { backgroundColor: colorInfo.color },
                    ]}
                    onPress={() => {
                      setSelectedNote(note);
                      setShowNoteModal(true);
                    }}
                  >
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTitle} numberOfLines={2}>
                        {note.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.pinButton}
                        onPress={() => togglePin(note.id)}
                      >
                        <Ionicons name="pin" size={20} color="#000000" style={{ opacity: 0.5 }} />
                      </TouchableOpacity>
                    </View>

                    {note.checklist ? (
                      <View style={styles.checklist}>
                        {note.checklist.slice(0, 3).map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.checklistItem}
                            onPress={() => toggleChecklistItem(note.id, item.id)}
                          >
                            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                              {item.completed && (
                                <Ionicons name="checkmark" size={12} color="#ffffff" />
                              )}
                            </View>
                            <Text style={[
                              styles.checklistText,
                              item.completed && styles.checklistTextCompleted,
                            ]}>
                              {item.text}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {note.checklist.length > 3 && (
                          <Text style={styles.metaText}>
                            +{note.checklist.length - 3} more items
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.noteContent} numberOfLines={4}>
                        {note.content}
                      </Text>
                    )}

                    <View style={styles.noteMeta}>
                      <View style={styles.metaLeft}>
                        <Text style={styles.metaText}>{note.modifiedAt}</Text>
                      </View>
                      {note.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {note.tags.slice(0, 2).map(tag => (
                            <View key={tag} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Other Notes */}
        {unpinnedNotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.sectionCount}>({unpinnedNotes.length})</Text>
            </View>
            <View style={view === 'grid' ? styles.gridContainer : styles.listContainer}>
              {unpinnedNotes.map(note => {
                const colorInfo = getColorInfo(note.color);
                return (
                  <TouchableOpacity
                    key={note.id}
                    style={[
                      view === 'grid' ? styles.noteCardGrid : styles.noteCardList,
                      { backgroundColor: colorInfo.color },
                    ]}
                    onPress={() => {
                      setSelectedNote(note);
                      setShowNoteModal(true);
                    }}
                  >
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTitle} numberOfLines={2}>
                        {note.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.pinButton}
                        onPress={() => togglePin(note.id)}
                      >
                        <Ionicons name="pin-outline" size={20} color="#000000" style={{ opacity: 0.3 }} />
                      </TouchableOpacity>
                    </View>

                    {note.checklist ? (
                      <View style={styles.checklist}>
                        {note.checklist.slice(0, 3).map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.checklistItem}
                            onPress={() => toggleChecklistItem(note.id, item.id)}
                          >
                            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                              {item.completed && (
                                <Ionicons name="checkmark" size={12} color="#ffffff" />
                              )}
                            </View>
                            <Text style={[
                              styles.checklistText,
                              item.completed && styles.checklistTextCompleted,
                            ]}>
                              {item.text}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {note.checklist.length > 3 && (
                          <Text style={styles.metaText}>
                            +{note.checklist.length - 3} more items
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.noteContent} numberOfLines={4}>
                        {note.content}
                      </Text>
                    )}

                    <View style={styles.noteMeta}>
                      <View style={styles.metaLeft}>
                        <Text style={styles.metaText}>{note.modifiedAt}</Text>
                      </View>
                      {note.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {note.tags.slice(0, 2).map(tag => (
                            <View key={tag} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {getFilteredNotes().length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={48} color={theme.colors.textSubtle} />
            <Text style={styles.emptyStateText}>No notes found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try a different search' : 'Create your first note'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Note Detail Modal */}
      <Modal
        visible={showNoteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNoteModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedNote?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedNote && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Content</Text>
                    <View style={styles.contentBox}>
                      <Text style={styles.contentText}>{selectedNote.content}</Text>
                    </View>
                  </View>

                  {selectedNote.checklist && selectedNote.checklist.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>
                        Checklist ({selectedNote.checklist.filter(i => i.completed).length}/{selectedNote.checklist.length})
                      </Text>
                      <View style={styles.checklist}>
                        {selectedNote.checklist.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.checklistItem}
                            onPress={() => toggleChecklistItem(selectedNote.id, item.id)}
                          >
                            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                              {item.completed && (
                                <Ionicons name="checkmark" size={12} color="#ffffff" />
                              )}
                            </View>
                            <Text style={[
                              styles.checklistText,
                              item.completed && styles.checklistTextCompleted,
                            ]}>
                              {item.text}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Details</Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created by {selectedNote.createdBy}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created {selectedNote.createdAt}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Modified {selectedNote.modifiedAt}</Text>
                    </View>
                  </View>

                  {selectedNote.tags.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Tags</Text>
                      <View style={styles.tagsRow}>
                        {selectedNote.tags.map(tag => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Color</Text>
                    <View style={styles.colorPicker}>
                      {NOTE_COLORS.map(color => (
                        <TouchableOpacity
                          key={color.id}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color.color },
                            selectedNote.color === color.id && styles.colorOptionSelected,
                          ]}
                        >
                          {selectedNote.color === color.id && (
                            <Ionicons name="checkmark" size={24} color={color.darkColor} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.footerButton, styles.footerPrimaryButton]}
                  >
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                    <Text style={[styles.footerButtonText, styles.footerPrimaryButtonText]}>
                      Edit Note
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={[styles.footerButton, { flex: 1 }]}
                      onPress={() => togglePin(selectedNote.id)}
                    >
                      <Ionicons
                        name={selectedNote.pinned ? 'pin' : 'pin-outline'}
                        size={20}
                        color={theme.colors.text}
                      />
                      <Text style={styles.footerButtonText}>
                        {selectedNote.pinned ? 'Unpin' : 'Pin'}
                      </Text>
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

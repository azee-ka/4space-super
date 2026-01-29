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

type BoardType = 'brainstorm' | 'flowchart' | 'mindmap' | 'kanban' | 'drawing';

interface StickyNote {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

interface Whiteboard {
  id: string;
  name: string;
  type: BoardType;
  thumbnail: string;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  collaborators: string[];
  stickyNotes: number;
  shapes: number;
  connections: number;
  starred: boolean;
}

const BOARD_TYPES = [
  { id: 'brainstorm', name: 'Brainstorm', icon: 'bulb', color: '#fbbf24', emoji: '💡' },
  { id: 'flowchart', name: 'Flowchart', icon: 'git-network', color: '#3b82f6', emoji: '📊' },
  { id: 'mindmap', name: 'Mind Map', icon: 'git-branch', color: '#8b5cf6', emoji: '🧠' },
  { id: 'kanban', name: 'Kanban', icon: 'grid', color: '#10b981', emoji: '📋' },
  { id: 'drawing', name: 'Drawing', icon: 'brush', color: '#ec4899', emoji: '🎨' },
];

export default function WhiteboardWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [selectedBoard, setSelectedBoard] = useState<Whiteboard | null>(null);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([
    {
      id: '1',
      name: 'Product Roadmap Brainstorm',
      type: 'brainstorm',
      thumbnail: '💡',
      createdBy: 'Sarah Chen',
      createdAt: '2026-01-20',
      modifiedAt: '2026-01-27',
      collaborators: ['Sarah', 'Mike', 'Emma', 'Alex'],
      stickyNotes: 24,
      shapes: 8,
      connections: 12,
      starred: true,
    },
    {
      id: '2',
      name: 'User Journey Flow',
      type: 'flowchart',
      thumbnail: '📊',
      createdBy: 'Emma Wilson',
      createdAt: '2026-01-18',
      modifiedAt: '2026-01-26',
      collaborators: ['Emma', 'David', 'Lisa'],
      stickyNotes: 15,
      shapes: 18,
      connections: 22,
      starred: true,
    },
    {
      id: '3',
      name: 'Feature Planning Mind Map',
      type: 'mindmap',
      thumbnail: '🧠',
      createdBy: 'Mike Johnson',
      createdAt: '2026-01-22',
      modifiedAt: '2026-01-25',
      collaborators: ['Mike', 'Sarah', 'Alex'],
      stickyNotes: 32,
      shapes: 12,
      connections: 28,
      starred: false,
    },
    {
      id: '4',
      name: 'Sprint Planning Board',
      type: 'kanban',
      thumbnail: '📋',
      createdBy: 'Alex Brown',
      createdAt: '2026-01-15',
      modifiedAt: '2026-01-24',
      collaborators: ['Alex', 'Mike', 'Sarah', 'Tom'],
      stickyNotes: 18,
      shapes: 6,
      connections: 8,
      starred: true,
    },
    {
      id: '5',
      name: 'Design Mockup Sketches',
      type: 'drawing',
      thumbnail: '🎨',
      createdBy: 'David Lee',
      createdAt: '2026-01-12',
      modifiedAt: '2026-01-23',
      collaborators: ['David', 'Emma'],
      stickyNotes: 8,
      shapes: 25,
      connections: 4,
      starred: false,
    },
    {
      id: '6',
      name: 'System Architecture',
      type: 'flowchart',
      thumbnail: '📊',
      createdBy: 'Tom Anderson',
      createdAt: '2026-01-10',
      modifiedAt: '2026-01-22',
      collaborators: ['Tom', 'Mike', 'Alex'],
      stickyNotes: 12,
      shapes: 20,
      connections: 35,
      starred: true,
    },
    {
      id: '7',
      name: 'Marketing Strategy',
      type: 'mindmap',
      thumbnail: '🧠',
      createdBy: 'Lisa Martinez',
      createdAt: '2026-01-14',
      modifiedAt: '2026-01-21',
      collaborators: ['Lisa', 'Kate', 'Emma'],
      stickyNotes: 28,
      shapes: 10,
      connections: 24,
      starred: false,
    },
    {
      id: '8',
      name: 'Team Retrospective',
      type: 'brainstorm',
      thumbnail: '💡',
      createdBy: 'Sarah Chen',
      createdAt: '2026-01-16',
      modifiedAt: '2026-01-20',
      collaborators: ['Sarah', 'Mike', 'Emma', 'Alex', 'Tom'],
      stickyNotes: 35,
      shapes: 5,
      connections: 6,
      starred: false,
    },
  ]);

  const toggleStar = (boardId: string) => {
    setWhiteboards(prev =>
      prev.map(board =>
        board.id === boardId ? { ...board, starred: !board.starred } : board
      )
    );
  };

  const stats = {
    total: whiteboards.length,
    starred: whiteboards.filter(b => b.starred).length,
    collaborators: new Set(whiteboards.flatMap(b => b.collaborators)).size,
    types: new Set(whiteboards.map(b => b.type)).size,
  };

  const getTypeInfo = (type: BoardType) => {
    return BOARD_TYPES.find(t => t.id === type) || BOARD_TYPES[0];
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
    boardsScroll: {
      flex: 1,
    },
    boardsContainer: {
      padding: 20,
      gap: 16,
    },
    boardCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    boardThumbnail: {
      height: 160,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    thumbnailEmoji: {
      fontSize: 64,
    },
    starButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8,
    },
    boardInfo: {
      padding: 16,
      gap: 12,
    },
    boardHeader: {
      gap: 8,
    },
    boardName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    boardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    typeText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
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
    boardStats: {
      flexDirection: 'row',
      gap: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statItemText: {
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: '600',
    },
    collaborators: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    collaboratorsList: {
      flexDirection: 'row',
      gap: 4,
    },
    collaboratorBadge: {
      backgroundColor: theme.colors.background,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    collaboratorText: {
      fontSize: 11,
      color: theme.colors.text,
      fontWeight: '600',
    },
    boardActions: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
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
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 12,
    },
    modalHeaderTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    modalClose: {
      padding: 4,
    },
    modalThumbnail: {
      height: 200,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
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
    collaboratorsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
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
        <Text style={styles.headerTitle}>Whiteboard</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={accentColorHex} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Boards</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.starred}</Text>
          <Text style={styles.statLabel}>Starred</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.collaborators}</Text>
          <Text style={styles.statLabel}>Collaborators</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.types}</Text>
          <Text style={styles.statLabel}>Types</Text>
        </View>
      </View>

      {/* Whiteboards List */}
      <ScrollView style={styles.boardsScroll}>
        <View style={styles.boardsContainer}>
          {whiteboards.length > 0 ? (
            whiteboards.map(board => {
              const typeInfo = getTypeInfo(board.type);
              return (
                <TouchableOpacity
                  key={board.id}
                  style={styles.boardCard}
                  onPress={() => {
                    setSelectedBoard(board);
                    setShowBoardModal(true);
                  }}
                >
                  <View style={[styles.boardThumbnail, { backgroundColor: typeInfo.color + '20' }]}>
                    <Text style={styles.thumbnailEmoji}>{board.thumbnail}</Text>
                    <TouchableOpacity
                      style={styles.starButton}
                      onPress={() => toggleStar(board.id)}
                    >
                      <Ionicons
                        name={board.starred ? 'star' : 'star-outline'}
                        size={20}
                        color={board.starred ? '#fbbf24' : '#ffffff'}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.boardInfo}>
                    <View style={styles.boardHeader}>
                      <Text style={styles.boardName}>{board.name}</Text>
                      <View style={styles.boardMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
                          <Ionicons name={typeInfo.icon as any} size={12} color={typeInfo.color} />
                          <Text style={[styles.typeText, { color: typeInfo.color }]}>
                            {typeInfo.name}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="person-outline" size={14} color={theme.colors.textSubtle} />
                          <Text style={styles.metaText}>{board.createdBy}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSubtle} />
                          <Text style={styles.metaText}>{board.modifiedAt}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.boardStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="document-text" size={16} color={theme.colors.textSubtle} />
                        <Text style={styles.statItemText}>{board.stickyNotes}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="shapes" size={16} color={theme.colors.textSubtle} />
                        <Text style={styles.statItemText}>{board.shapes}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="git-branch" size={16} color={theme.colors.textSubtle} />
                        <Text style={styles.statItemText}>{board.connections}</Text>
                      </View>
                    </View>

                    <View style={styles.collaborators}>
                      <Ionicons name="people-outline" size={16} color={theme.colors.textSubtle} />
                      <View style={styles.collaboratorsList}>
                        {board.collaborators.slice(0, 3).map((collab, idx) => (
                          <View key={idx} style={styles.collaboratorBadge}>
                            <Text style={styles.collaboratorText}>{collab}</Text>
                          </View>
                        ))}
                        {board.collaborators.length > 3 && (
                          <View style={styles.collaboratorBadge}>
                            <Text style={styles.collaboratorText}>
                              +{board.collaborators.length - 3}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.boardActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={16} color={theme.colors.text} />
                        <Text style={styles.actionButtonText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                        <Ionicons name="create-outline" size={16} color="#ffffff" />
                        <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Open</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="brush-outline" size={48} color={theme.colors.textSubtle} />
              <Text style={styles.emptyStateText}>No whiteboards yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first whiteboard</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Board Detail Modal */}
      <Modal
        visible={showBoardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBoardModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedBoard?.name}
                </Text>
                <TouchableOpacity onPress={() => setShowBoardModal(false)} style={styles.modalClose}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              {selectedBoard && (
                <View style={[
                  styles.modalThumbnail,
                  { backgroundColor: getTypeInfo(selectedBoard.type).color + '20' }
                ]}>
                  <Text style={styles.thumbnailEmoji}>{selectedBoard.thumbnail}</Text>
                </View>
              )}
            </View>

            {selectedBoard && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Board Statistics</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{selectedBoard.stickyNotes}</Text>
                        <Text style={styles.statBoxLabel}>Sticky Notes</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{selectedBoard.shapes}</Text>
                        <Text style={styles.statBoxLabel}>Shapes</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{selectedBoard.connections}</Text>
                        <Text style={styles.statBoxLabel}>Connections</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name={getTypeInfo(selectedBoard.type).icon as any}
                        size={20}
                        color={getTypeInfo(selectedBoard.type).color}
                      />
                      <Text style={styles.modalInfoText}>
                        {getTypeInfo(selectedBoard.type).name}
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created by {selectedBoard.createdBy}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created {selectedBoard.createdAt}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Modified {selectedBoard.modifiedAt}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>
                      Collaborators ({selectedBoard.collaborators.length})
                    </Text>
                    <View style={styles.collaboratorsGrid}>
                      {selectedBoard.collaborators.map((collab, idx) => (
                        <View key={idx} style={styles.collaboratorBadge}>
                          <Text style={styles.collaboratorText}>{collab}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={[styles.footerButton, styles.footerPrimaryButton]}>
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                    <Text style={[styles.footerButtonText, styles.footerPrimaryButtonText]}>
                      Open Whiteboard
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={[styles.footerButton, { flex: 1 }]}>
                      <Ionicons name="share-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.footerButtonText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.footerButton, { flex: 1 }]}
                      onPress={() => toggleStar(selectedBoard.id)}
                    >
                      <Ionicons
                        name={selectedBoard.starred ? 'star' : 'star-outline'}
                        size={20}
                        color={selectedBoard.starred ? '#fbbf24' : theme.colors.text}
                      />
                      <Text style={styles.footerButtonText}>
                        {selectedBoard.starred ? 'Unstar' : 'Star'}
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

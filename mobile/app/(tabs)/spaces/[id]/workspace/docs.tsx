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

type DocType = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'other';

interface Document {
  id: string;
  name: string;
  type: DocType;
  size: string;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  starred: boolean;
  shared: boolean;
  folder?: string;
  tags: string[];
  comments: number;
  version: string;
}

const DOC_TYPES = [
  { id: 'document', name: 'Documents', icon: 'document-text', color: '#3b82f6' },
  { id: 'spreadsheet', name: 'Spreadsheets', icon: 'grid', color: '#10b981' },
  { id: 'presentation', name: 'Presentations', icon: 'easel', color: '#f59e0b' },
  { id: 'pdf', name: 'PDFs', icon: 'reader', color: '#ef4444' },
  { id: 'image', name: 'Images', icon: 'image', color: '#8b5cf6' },
  { id: 'other', name: 'Other', icon: 'folder', color: '#6b7280' },
];

export default function DocsWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [view, setView] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState<DocType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Product Requirements Document',
      type: 'document',
      size: '2.4 MB',
      createdBy: 'Sarah Chen',
      createdAt: '2026-01-15',
      modifiedAt: '2026-01-26',
      starred: true,
      shared: true,
      folder: 'Product',
      tags: ['requirements', 'planning'],
      comments: 5,
      version: '3.2',
    },
    {
      id: '2',
      name: 'Q1 Analytics Dashboard',
      type: 'spreadsheet',
      size: '1.8 MB',
      createdBy: 'Mike Johnson',
      createdAt: '2026-01-10',
      modifiedAt: '2026-01-27',
      starred: true,
      shared: false,
      folder: 'Analytics',
      tags: ['data', 'reports'],
      comments: 3,
      version: '2.5',
    },
    {
      id: '3',
      name: 'Sprint Review Slides',
      type: 'presentation',
      size: '5.2 MB',
      createdBy: 'Emma Wilson',
      createdAt: '2026-01-20',
      modifiedAt: '2026-01-25',
      starred: false,
      shared: true,
      folder: 'Presentations',
      tags: ['sprint', 'review'],
      comments: 8,
      version: '1.0',
    },
    {
      id: '4',
      name: 'API Documentation',
      type: 'pdf',
      size: '3.1 MB',
      createdBy: 'Alex Brown',
      createdAt: '2026-01-12',
      modifiedAt: '2026-01-24',
      starred: true,
      shared: true,
      folder: 'Documentation',
      tags: ['api', 'reference'],
      comments: 2,
      version: '4.0',
    },
    {
      id: '5',
      name: 'Design Mockups',
      type: 'image',
      size: '8.7 MB',
      createdBy: 'David Lee',
      createdAt: '2026-01-18',
      modifiedAt: '2026-01-26',
      starred: false,
      shared: true,
      folder: 'Design',
      tags: ['ui', 'mockups'],
      comments: 12,
      version: '2.1',
    },
    {
      id: '6',
      name: 'Team Budget 2026',
      type: 'spreadsheet',
      size: '956 KB',
      createdBy: 'Lisa Martinez',
      createdAt: '2026-01-08',
      modifiedAt: '2026-01-22',
      starred: true,
      shared: false,
      folder: 'Finance',
      tags: ['budget', 'finance'],
      comments: 1,
      version: '1.8',
    },
    {
      id: '7',
      name: 'User Research Findings',
      type: 'document',
      size: '1.2 MB',
      createdBy: 'John Smith',
      createdAt: '2026-01-14',
      modifiedAt: '2026-01-23',
      starred: false,
      shared: true,
      folder: 'Research',
      tags: ['research', 'users'],
      comments: 6,
      version: '2.0',
    },
    {
      id: '8',
      name: 'Marketing Campaign Brief',
      type: 'pdf',
      size: '2.8 MB',
      createdBy: 'Kate Wilson',
      createdAt: '2026-01-16',
      modifiedAt: '2026-01-21',
      starred: false,
      shared: true,
      folder: 'Marketing',
      tags: ['campaign', 'marketing'],
      comments: 4,
      version: '1.5',
    },
    {
      id: '9',
      name: 'Technical Architecture',
      type: 'presentation',
      size: '4.5 MB',
      createdBy: 'Tom Anderson',
      createdAt: '2026-01-11',
      modifiedAt: '2026-01-20',
      starred: true,
      shared: false,
      folder: 'Engineering',
      tags: ['architecture', 'technical'],
      comments: 7,
      version: '3.0',
    },
    {
      id: '10',
      name: 'Brand Guidelines',
      type: 'document',
      size: '6.3 MB',
      createdBy: 'Anna Davis',
      createdAt: '2026-01-05',
      modifiedAt: '2026-01-19',
      starred: true,
      shared: true,
      folder: 'Branding',
      tags: ['brand', 'guidelines'],
      comments: 9,
      version: '5.0',
    },
  ]);

  const getFilteredDocs = () => {
    let filtered = documents;

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const toggleStar = (docId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, starred: !doc.starred } : doc
      )
    );
  };

  const stats = {
    total: documents.length,
    starred: documents.filter(d => d.starred).length,
    shared: documents.filter(d => d.shared).length,
    recent: documents.filter(d => {
      const modifiedDate = new Date(d.modifiedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return modifiedDate >= weekAgo;
    }).length,
  };

  const getTypeInfo = (type: DocType) => {
    return DOC_TYPES.find(t => t.id === type) || DOC_TYPES[DOC_TYPES.length - 1];
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
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterScroll: {
      gap: 8,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    filterButtonActive: {
      backgroundColor: accentColorHex + '15',
      borderColor: accentColorHex,
    },
    filterButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSubtle,
    },
    filterButtonTextActive: {
      color: accentColorHex,
    },
    docsScroll: {
      flex: 1,
    },
    docsContainer: {
      padding: 20,
      gap: 12,
    },
    docCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    docHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 12,
    },
    docIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    docInfo: {
      flex: 1,
      gap: 4,
    },
    docName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    docMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSubtle,
    },
    metaSeparator: {
      fontSize: 12,
      color: theme.colors.textSubtle,
    },
    starButton: {
      padding: 4,
    },
    docDetails: {
      gap: 8,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 13,
      color: theme.colors.textSubtle,
      flex: 1,
    },
    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    tag: {
      backgroundColor: theme.colors.background,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagText: {
      fontSize: 11,
      color: theme.colors.text,
      fontWeight: '600',
    },
    docActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
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
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 16,
    },
    gridCard: {
      width: '47%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    gridIcon: {
      width: '100%',
      height: 80,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    gridName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    gridMeta: {
      fontSize: 11,
      color: theme.colors.textSubtle,
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
    versionHistory: {
      gap: 12,
    },
    versionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    versionLeft: {
      gap: 4,
    },
    versionNumber: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    versionDate: {
      fontSize: 12,
      color: theme.colors.textSubtle,
    },
    currentBadge: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: accentColorHex + '20',
      borderRadius: 6,
    },
    currentBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: accentColorHex,
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
          <Text style={styles.headerTitle}>Documents</Text>
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
            placeholder="Search documents..."
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
          <Text style={styles.statNumber}>{stats.starred}</Text>
          <Text style={styles.statLabel}>Starred</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.shared}</Text>
          <Text style={styles.statLabel}>Shared</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.recent}</Text>
          <Text style={styles.statLabel}>Recent</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {DOC_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[styles.filterButton, filterType === type.id && styles.filterButtonActive]}
              onPress={() => setFilterType(type.id as DocType)}
            >
              <Ionicons
                name={type.icon as any}
                size={14}
                color={filterType === type.id ? accentColorHex : theme.colors.textSubtle}
              />
              <Text style={[styles.filterButtonText, filterType === type.id && styles.filterButtonTextActive]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Documents List/Grid */}
      <ScrollView style={styles.docsScroll}>
        {view === 'list' ? (
          <View style={styles.docsContainer}>
            {getFilteredDocs().length > 0 ? (
              getFilteredDocs().map(doc => {
                const typeInfo = getTypeInfo(doc.type);
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={styles.docCard}
                    onPress={() => {
                      setSelectedDoc(doc);
                      setShowDocModal(true);
                    }}
                  >
                    <View style={styles.docHeader}>
                      <View style={[styles.docIcon, { backgroundColor: typeInfo.color + '20' }]}>
                        <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                      </View>
                      <View style={styles.docInfo}>
                        <Text style={styles.docName}>{doc.name}</Text>
                        <View style={styles.docMeta}>
                          <Text style={styles.metaText}>{doc.size}</Text>
                          <Text style={styles.metaSeparator}>•</Text>
                          <Text style={styles.metaText}>v{doc.version}</Text>
                          <Text style={styles.metaSeparator}>•</Text>
                          <Text style={styles.metaText}>{doc.modifiedAt}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.starButton}
                        onPress={() => toggleStar(doc.id)}
                      >
                        <Ionicons
                          name={doc.starred ? 'star' : 'star-outline'}
                          size={24}
                          color={doc.starred ? '#fbbf24' : theme.colors.textSubtle}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.docDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={16} color={theme.colors.textSubtle} />
                        <Text style={styles.detailText}>{doc.createdBy}</Text>
                      </View>
                      {doc.folder && (
                        <View style={styles.detailRow}>
                          <Ionicons name="folder-outline" size={16} color={theme.colors.textSubtle} />
                          <Text style={styles.detailText}>{doc.folder}</Text>
                        </View>
                      )}
                      {doc.tags.length > 0 && (
                        <View style={styles.detailRow}>
                          <Ionicons name="pricetag-outline" size={16} color={theme.colors.textSubtle} />
                          <View style={styles.tagsRow}>
                            {doc.tags.map(tag => (
                              <View key={tag} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        {doc.shared && (
                          <>
                            <Ionicons name="share-social" size={16} color={accentColorHex} />
                            <Text style={[styles.detailText, { color: accentColorHex }]}>Shared</Text>
                          </>
                        )}
                        {doc.comments > 0 && (
                          <>
                            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textSubtle} />
                            <Text style={styles.detailText}>{doc.comments} comments</Text>
                          </>
                        )}
                      </View>
                    </View>

                    <View style={styles.docActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={16} color={theme.colors.text} />
                        <Text style={styles.actionButtonText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                        <Ionicons name="eye-outline" size={16} color="#ffffff" />
                        <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Open</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={theme.colors.textSubtle} />
                <Text style={styles.emptyStateText}>No documents found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery ? 'Try a different search' : 'Upload your first document'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {getFilteredDocs().map(doc => {
              const typeInfo = getTypeInfo(doc.type);
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.gridCard}
                  onPress={() => {
                    setSelectedDoc(doc);
                    setShowDocModal(true);
                  }}
                >
                  <View style={[styles.gridIcon, { backgroundColor: typeInfo.color + '20' }]}>
                    <Ionicons name={typeInfo.icon as any} size={36} color={typeInfo.color} />
                  </View>
                  <Text style={styles.gridName} numberOfLines={2}>{doc.name}</Text>
                  <Text style={styles.gridMeta}>{doc.size} • v{doc.version}</Text>
                  <TouchableOpacity
                    style={styles.starButton}
                    onPress={() => toggleStar(doc.id)}
                  >
                    <Ionicons
                      name={doc.starred ? 'star' : 'star-outline'}
                      size={20}
                      color={doc.starred ? '#fbbf24' : theme.colors.textSubtle}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Document Detail Modal */}
      <Modal
        visible={showDocModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDocModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedDoc?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowDocModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedDoc && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="document-text-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>
                        {getTypeInfo(selectedDoc.type).name}
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="cube-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>{selectedDoc.size}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created by {selectedDoc.createdBy}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>
                        Created {selectedDoc.createdAt}
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>
                        Modified {selectedDoc.modifiedAt}
                      </Text>
                    </View>
                    {selectedDoc.folder && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="folder-outline" size={20} color={theme.colors.textSubtle} />
                        <Text style={styles.modalInfoText}>{selectedDoc.folder}</Text>
                      </View>
                    )}
                  </View>

                  {selectedDoc.tags.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Tags</Text>
                      <View style={styles.tagsRow}>
                        {selectedDoc.tags.map(tag => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Version History</Text>
                    <View style={styles.versionHistory}>
                      {[selectedDoc.version, '3.1', '3.0', '2.5', '2.0'].map((ver, idx) => (
                        <View key={ver} style={styles.versionItem}>
                          <View style={styles.versionLeft}>
                            <Text style={styles.versionNumber}>Version {ver}</Text>
                            <Text style={styles.versionDate}>
                              {idx === 0 ? selectedDoc.modifiedAt : `2026-01-${20 - idx * 2}`}
                            </Text>
                          </View>
                          {idx === 0 && (
                            <View style={styles.currentBadge}>
                              <Text style={styles.currentBadgeText}>CURRENT</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={[styles.footerButton, styles.footerPrimaryButton]}>
                    <Ionicons name="eye-outline" size={20} color="#ffffff" />
                    <Text style={[styles.footerButtonText, styles.footerPrimaryButtonText]}>
                      Open Document
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={[styles.footerButton, { flex: 1 }]}>
                      <Ionicons name="share-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.footerButtonText}>Share</Text>
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

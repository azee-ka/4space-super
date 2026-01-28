import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

type FileType = 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';
type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';

interface File {
  id: string;
  name: string;
  type: FileType;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

const MOCK_FILES: File[] = [
  { id: '1', name: 'Project Proposal.pdf', type: 'document', size: 2457600, uploadedBy: 'John Doe', uploadedAt: '2026-01-27T10:30:00', url: '' },
  { id: '2', name: 'Team Photo.jpg', type: 'image', size: 1048576, uploadedBy: 'Jane Smith', uploadedAt: '2026-01-26T14:20:00', url: '' },
  { id: '3', name: 'Presentation.pptx', type: 'document', size: 5242880, uploadedBy: 'Bob Wilson', uploadedAt: '2026-01-25T09:15:00', url: '' },
  { id: '4', name: 'Demo Video.mp4', type: 'video', size: 15728640, uploadedBy: 'Alice Brown', uploadedAt: '2026-01-24T16:45:00', url: '' },
  { id: '5', name: 'Audio Notes.m4a', type: 'audio', size: 3145728, uploadedBy: 'Charlie Davis', uploadedAt: '2026-01-23T11:30:00', url: '' },
  { id: '6', name: 'Archive.zip', type: 'archive', size: 10485760, uploadedBy: 'David Lee', uploadedAt: '2026-01-22T13:00:00', url: '' },
  { id: '7', name: 'Spreadsheet.xlsx', type: 'document', size: 819200, uploadedBy: 'Emma White', uploadedAt: '2026-01-21T15:20:00', url: '' },
  { id: '8', name: 'Design Mockup.fig', type: 'other', size: 4194304, uploadedBy: 'Frank Green', uploadedAt: '2026-01-20T10:10:00', url: '' },
];

const FILE_TYPE_CONFIG: Record<FileType, { icon: string; color: string; label: string }> = {
  image: { icon: 'image-outline', color: '#3b82f6', label: 'Image' },
  video: { icon: 'videocam-outline', color: '#ef4444', label: 'Video' },
  document: { icon: 'document-text-outline', color: '#10b981', label: 'Document' },
  audio: { icon: 'musical-notes-outline', color: '#a855f7', label: 'Audio' },
  archive: { icon: 'archive-outline', color: '#f59e0b', label: 'Archive' },
  other: { icon: 'document-outline', color: '#6b7280', label: 'Other' },
};

export default function SpaceFilesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [selectedType, setSelectedType] = useState<FileType | 'all'>('all');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalSize = useMemo(() => {
    return MOCK_FILES.reduce((acc, file) => acc + file.size, 0);
  }, []);

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = MOCK_FILES;

    if (searchQuery) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((file) => file.type === selectedType);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, selectedType, sortBy]);

  const handleFileAction = (file: File, action: 'preview' | 'download' | 'share' | 'delete') => {
    switch (action) {
      case 'preview':
        // TODO: Implement file preview
        console.log('Preview file:', file.id);
        break;
      case 'download':
        // TODO: Implement file download
        console.log('Download file:', file.id);
        break;
      case 'share':
        // TODO: Implement file sharing
        console.log('Share file:', file.id);
        break;
      case 'delete':
        Alert.alert(
          'Delete File',
          `Are you sure you want to delete "${file.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                // TODO: Implement delete file mutation
                console.log('Delete file:', file.id);
              },
            },
          ]
        );
        break;
    }
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    console.log('Upload file');
  };

  const renderFileItem = (file: File, index: number) => {
    const config = FILE_TYPE_CONFIG[file.type];
    const isLast = index === filteredAndSortedFiles.length - 1;

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          key={file.id}
          style={styles.gridItem}
          onPress={() => handleFileAction(file, 'preview')}
          onLongPress={() => {
            Alert.alert(
              file.name,
              'Choose an action',
              [
                { text: 'Preview', onPress: () => handleFileAction(file, 'preview') },
                { text: 'Download', onPress: () => handleFileAction(file, 'download') },
                { text: 'Share', onPress: () => handleFileAction(file, 'share') },
                { text: 'Delete', onPress: () => handleFileAction(file, 'delete'), style: 'destructive' },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <View style={[styles.gridIconContainer, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={32} color={config.color} />
          </View>
          <Text style={styles.gridFileName} numberOfLines={2}>
            {file.name}
          </Text>
          <Text style={styles.gridFileSize}>{formatFileSize(file.size)}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={file.id}
        style={[styles.listItem, !isLast && styles.listItemBorder]}
        onPress={() => handleFileAction(file, 'preview')}
        onLongPress={() => {
          Alert.alert(
            file.name,
            'Choose an action',
            [
              { text: 'Preview', onPress: () => handleFileAction(file, 'preview') },
              { text: 'Download', onPress: () => handleFileAction(file, 'download') },
              { text: 'Share', onPress: () => handleFileAction(file, 'share') },
              { text: 'Delete', onPress: () => handleFileAction(file, 'delete'), style: 'destructive' },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      >
        <View style={[styles.listIconContainer, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={24} color={config.color} />
        </View>
        <View style={styles.listFileInfo}>
          <Text style={styles.listFileName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.listFileDetails}>
            {formatFileSize(file.size)} • {formatDate(file.uploadedAt)} • {file.uploadedBy}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              file.name,
              'Choose an action',
              [
                { text: 'Preview', onPress: () => handleFileAction(file, 'preview') },
                { text: 'Download', onPress: () => handleFileAction(file, 'download') },
                { text: 'Share', onPress: () => handleFileAction(file, 'share') },
                { text: 'Delete', onPress: () => handleFileAction(file, 'delete'), style: 'destructive' },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSubtle} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Files</Text>
        <TouchableOpacity style={[styles.uploadButton, { backgroundColor: accentHex }]} onPress={handleUpload}>
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#3b82f6' + '15' }]}>
            <Ionicons name="documents" size={16} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{MOCK_FILES.length}</Text>
          <Text style={styles.statLabel}>Total Files</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#10b981' + '15' }]}>
            <Ionicons name="server" size={16} color="#10b981" />
          </View>
          <Text style={styles.statValue}>{formatFileSize(totalSize)}</Text>
          <Text style={styles.statLabel}>Storage Used</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#8b5cf6' + '15' }]}>
            <Ionicons name="cloud-outline" size={16} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>2.5 GB</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search files..."
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
          style={[styles.viewModeButton, { borderColor: accentHex }]}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
            size={20}
            color={accentHex}
          />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
        <TouchableOpacity
          style={[styles.typeFilter, selectedType === 'all' && { backgroundColor: accentHex }]}
          onPress={() => setSelectedType('all')}
        >
          <Text style={[styles.typeFilterText, selectedType === 'all' && styles.typeFilterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeFilter,
              selectedType === type && { backgroundColor: config.color },
            ]}
            onPress={() => setSelectedType(type as FileType)}
          >
            <Ionicons
              name={config.icon as any}
              size={16}
              color={selectedType === type ? '#fff' : config.color}
            />
            <Text
              style={[
                styles.typeFilterText,
                { color: selectedType === type ? '#fff' : config.color },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
          {(['name', 'date', 'size', 'type'] as SortBy[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortOption, sortBy === option && { backgroundColor: accentHex + '20' }]}
              onPress={() => setSortBy(option)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option && { color: accentHex, fontWeight: '600' },
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {filteredAndSortedFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No files found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Upload files to get started'}
            </Text>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {filteredAndSortedFiles.map((file, index) => renderFileItem(file, index))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredAndSortedFiles.map((file, index) => renderFileItem(file, index))}
          </View>
        )}
      </ScrollView>
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
  uploadButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
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
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
  },
  typeFilters: {
    paddingHorizontal: 16,
    marginBottom: 12,
    maxHeight: 40,
  },
  typeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    gap: 6,
  },
  typeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  typeFilterTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  sortLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '500',
  },
  sortOptions: {
    flex: 1,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  sortOptionText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  gridIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  gridFileSize: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  listContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listFileInfo: {
    flex: 1,
    marginRight: 12,
  },
  listFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  listFileDetails: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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

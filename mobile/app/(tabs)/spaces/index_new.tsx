// This is the new enhanced Spaces page
// Rename this file to index.tsx after reviewing
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Space } from '../../../src/types';
import { useCreateSpace, useSpaces } from '../../../src/hooks/useSpaces';
import { LoadingSpinner } from '../../../src/components/ui';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';

const { width } = Dimensions.get('window');

const ICON_OPTIONS = [
  { value: 'lock', icon: 'lock-closed-outline' },
  { value: 'heart', icon: 'heart-outline' },
  { value: 'users', icon: 'people-outline' },
  { value: 'briefcase', icon: 'briefcase-outline' },
  { value: 'globe', icon: 'globe-outline' },
  { value: 'rocket', icon: 'rocket-outline' },
  { value: 'folder', icon: 'folder-outline' },
  { value: 'star', icon: 'star-outline' },
  { value: 'bulb', icon: 'bulb-outline' },
  { value: 'game', icon: 'game-controller-outline' },
  { value: 'shield', icon: 'shield-outline' },
  { value: 'trophy', icon: 'trophy-outline' },
];

const SPACE_ICON_MAP: Record<string, string> = {
  lock: 'lock-closed-outline',
  heart: 'heart-outline',
  users: 'people-outline',
  briefcase: 'briefcase-outline',
  globe: 'globe-outline',
  rocket: 'rocket-outline',
  folder: 'folder-outline',
  star: 'star-outline',
  bulb: 'bulb-outline',
  game: 'game-controller-outline',
  personal: 'lock-closed-outline',
  couple: 'heart-outline',
  team: 'people-outline',
  portfolio: 'briefcase-outline',
  community: 'globe-outline',
  project: 'rocket-outline',
};

const COLOR_OPTIONS = [
  '#22d3ee', '#f472b6', '#34d399', '#fbbf24', '#a855f7',
  '#f97316', '#3b82f6', '#ef4444', '#10b981', '#ec4899',
  '#14b8a6', '#8b5cf6', '#06b6d4', '#f43f5e'
];

const PRIVACY_OPTIONS: Array<{ value: Space['privacy']; label: string; icon: string; description: string }> = [
  { value: 'private', label: 'Private', icon: 'lock-closed-outline', description: 'Only you can access' },
  { value: 'shared', label: 'Shared', icon: 'people-outline', description: 'Invite specific people' },
  { value: 'team', label: 'Team', icon: 'business-outline', description: 'Organization workspace' },
  { value: 'public', label: 'Public', icon: 'globe-outline', description: 'Anyone can view' },
];

const SPACE_TEMPLATES = [
  {
    id: 'personal',
    name: 'Personal Vault',
    description: 'Private workspace for your notes and files',
    icon: 'lock-closed-outline',
    color: '#3b82f6',
    privacy: 'private' as Space['privacy'],
    features: ['Notes', 'Files', 'Tasks', 'AI Assistant'],
  },
  {
    id: 'team',
    name: 'Team Workspace',
    description: 'Collaborate with your team seamlessly',
    icon: 'people-outline',
    color: '#10b981',
    privacy: 'team' as Space['privacy'],
    features: ['Chat', 'Files', 'Board', 'Analytics'],
  },
  {
    id: 'project',
    name: 'Project Hub',
    description: 'Manage projects end-to-end',
    icon: 'rocket-outline',
    color: '#f59e0b',
    privacy: 'shared' as Space['privacy'],
    features: ['Tasks', 'Timeline', 'Docs', 'Goals'],
  },
  {
    id: 'community',
    name: 'Community Space',
    description: 'Public space for engagement',
    icon: 'globe-outline',
    color: '#ec4899',
    privacy: 'public' as Space['privacy'],
    features: ['Events', 'Forums', 'Live Chat'],
  },
];

type FilterType = 'all' | 'favorites' | 'recent' | 'private' | 'shared' | 'archived';
type ViewMode = 'grid' | 'list' | 'compact';
type SortMode = 'recent' | 'name' | 'members' | 'activity';

const resolveSpaceColor = (space: Space, index: number) => {
  if (space.color) {
    const match = space.color.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
    if (match) return match[0];
  }
  return COLOR_OPTIONS[index % COLOR_OPTIONS.length];
};

export default function SpacesScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { data: spaces = [], isLoading } = useSpaces();
  const createSpaceMutation = useCreateSpace();

  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Create form state
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [spacePrivacy, setSpacePrivacy] = useState<Space['privacy']>('private');
  const [spaceIcon, setSpaceIcon] = useState('rocket');
  const [spaceColor, setSpaceColor] = useState(COLOR_OPTIONS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filteredSpaces = useMemo(() => {
    let filtered = spaces;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((space) =>
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    switch (filterType) {
      case 'favorites':
        filtered = filtered.filter((space) => favorites.includes(space.id));
        break;
      case 'recent':
        filtered = [...filtered]
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 10);
        break;
      case 'private':
        filtered = filtered.filter((space) => space.privacy === 'private');
        break;
      case 'shared':
        filtered = filtered.filter((space) => space.privacy !== 'private');
        break;
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'activity':
        case 'recent':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [spaces, searchQuery, filterType, sortMode, favorites]);

  const stats = useMemo(
    () => ({
      total: spaces.length,
      privateCount: spaces.filter((s) => s.privacy === 'private').length,
      teamCount: spaces.filter((s) => s.privacy === 'team').length,
      publicCount: spaces.filter((s) => s.privacy === 'public').length,
      totalMembers: spaces.reduce((sum, s) => sum + (s.member_count || 0), 0),
      activeToday: Math.floor(spaces.length * 0.6), // Mock data
    }),
    [spaces]
  );

  const handleCreateFromTemplate = (template: typeof SPACE_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setSpaceName(template.name);
    setSpaceDescription(template.description);
    setSpacePrivacy(template.privacy);
    setSpaceIcon(template.id);
    setSpaceColor(template.color);
    setShowTemplates(false);
    setShowCreate(true);
  };

  const handleCreateSpace = async () => {
    if (!spaceName.trim()) {
      Alert.alert('Space name required', 'Please enter a name for your space.');
      return;
    }

    try {
      await createSpaceMutation.mutateAsync({
        name: spaceName.trim(),
        description: spaceDescription.trim() || undefined,
        privacy: spacePrivacy,
        icon: spaceIcon,
        color: spaceColor,
        type: selectedTemplate as any,
      });

      // Reset form
      setShowCreate(false);
      setSpaceName('');
      setSpaceDescription('');
      setSpacePrivacy('private');
      setSpaceIcon('rocket');
      setSpaceColor(COLOR_OPTIONS[0]);
      setSelectedTemplate(null);
    } catch (error: any) {
      Alert.alert('Could not create space', error?.message || 'Try again.');
    }
  };

  const toggleFavorite = (spaceId: string) => {
    setFavorites((prev) =>
      prev.includes(spaceId) ? prev.filter((id) => id !== spaceId) : [...prev, spaceId]
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.glowOrb} />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Spaces</Text>
              <Text style={styles.subtitle}>Workspaces & Collaboration Hubs</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/spaces/insights')}>
                <Ionicons name="analytics" size={18} color="#22d3ee" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: '#22d3ee20' }]}
                onPress={() => setShowTemplates(true)}
              >
                <Ionicons name="add" size={20} color="#22d3ee" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Enhanced Stats Cards */}
        <View style={styles.statsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            <View style={[styles.statCard, { borderLeftColor: '#22d3ee' }]}>
              <Ionicons name="apps" size={24} color="#22d3ee" />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Spaces</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#f472b6' }]}>
              <Ionicons name="people" size={24} color="#f472b6" />
              <Text style={styles.statValue}>{stats.totalMembers}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#34d399' }]}>
              <Ionicons name="pulse" size={24} color="#34d399" />
              <Text style={styles.statValue}>{stats.activeToday}</Text>
              <Text style={styles.statLabel}>Active Today</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#fbbf24' }]}>
              <Ionicons name="star" size={24} color="#fbbf24" />
              <Text style={styles.statValue}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </ScrollView>
        </View>

        {/* Search & Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#22d3ee" />
              <TextInput
                placeholder="Search spaces, teams, projects..."
                placeholderTextColor={theme.colors.textSubtle}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSubtle} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                const modes: ViewMode[] = ['grid', 'list', 'compact'];
                const currentIndex = modes.indexOf(viewMode);
                setViewMode(modes[(currentIndex + 1) % modes.length]);
              }}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'grid' : viewMode === 'list' ? 'list' : 'reorder-three'}
                size={18}
                color={theme.colors.textSubtle}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() =>
                Alert.alert('Sort By', 'Choose sorting method', [
                  { text: 'Recent', onPress: () => setSortMode('recent') },
                  { text: 'Name', onPress: () => setSortMode('name') },
                  { text: 'Members', onPress: () => setSortMode('members') },
                  { text: 'Activity', onPress: () => setSortMode('activity') },
                  { text: 'Cancel', style: 'cancel' },
                ])
              }
            >
              <Ionicons name="swap-vertical" size={18} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {(['all', 'favorites', 'recent', 'private', 'shared'] as FilterType[]).map((filter) => {
              const isActive = filterType === filter;
              const getColor = () => {
                if (filter === 'favorites') return '#fbbf24';
                if (filter === 'private') return '#3b82f6';
                if (filter === 'shared') return '#34d399';
                return '#22d3ee';
              };
              const color = getColor();

              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    isActive && { backgroundColor: color + '20', borderColor: color + '40' },
                  ]}
                  onPress={() => setFilterType(filter)}
                >
                  <Text style={[styles.filterText, isActive && { color }]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Spaces List/Grid */}
        <View style={styles.spacesSection}>
          {filteredSpaces.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="apps-outline" size={64} color={theme.colors.textSubtle} />
              </View>
              <Text style={styles.emptyTitle}>No spaces found</Text>
              <Text style={styles.emptyDescription}>
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first space to get started'}
              </Text>
              {!searchQuery && filterType === 'all' && (
                <TouchableOpacity style={styles.emptyButton} onPress={() => setShowTemplates(true)}>
                  <Ionicons name="add" size={20} color="#000" />
                  <Text style={styles.emptyButtonText}>Create Space</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={viewMode === 'grid' ? styles.spacesGrid : styles.spacesList}>
              {filteredSpaces.map((space, index) => {
                const color = resolveSpaceColor(space, index);
                const iconName = SPACE_ICON_MAP[space.icon || space.type || 'rocket'] || 'rocket-outline';
                const isFavorite = favorites.includes(space.id);

                if (viewMode === 'grid') {
                  return (
                    <TouchableOpacity
                      key={space.id}
                      style={styles.spaceGridCard}
                      onPress={() => router.push(`/spaces/${space.id}` as any)}
                    >
                      <View style={styles.spaceCardHeader}>
                        <View style={[styles.spaceGridIcon, { backgroundColor: color + '20' }]}>
                          <Ionicons name={iconName as any} size={28} color={color} />
                        </View>
                        <TouchableOpacity onPress={() => toggleFavorite(space.id)} style={styles.favoriteButton}>
                          <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={18} color={isFavorite ? '#fbbf24' : theme.colors.textSubtle} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.spaceGridName} numberOfLines={2}>
                        {space.name}
                      </Text>
                      <Text style={styles.spaceGridDesc} numberOfLines={2}>
                        {space.description || 'No description'}
                      </Text>
                      <View style={styles.spaceGridFooter}>
                        <View style={styles.spaceGridMeta}>
                          <Ionicons name="people" size={12} color={theme.colors.textSubtle} />
                          <Text style={styles.spaceGridMetaText}>{space.member_count || 0}</Text>
                        </View>
                        <View style={[styles.privacyBadge, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.privacyBadgeText, { color }]}>{space.privacy}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={space.id}
                    style={styles.spaceListCard}
                    onPress={() => router.push(`/spaces/${space.id}` as any)}
                  >
                    <View style={[styles.spaceListIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={iconName as any} size={24} color={color} />
                    </View>
                    <View style={styles.spaceListContent}>
                      <Text style={styles.spaceListName}>{space.name}</Text>
                      <Text style={styles.spaceListDesc} numberOfLines={1}>
                        {space.description || 'No description'}
                      </Text>
                      <View style={styles.spaceListFooter}>
                        <View style={styles.spaceListMeta}>
                          <Ionicons name="people" size={11} color={theme.colors.textSubtle} />
                          <Text style={styles.spaceListMetaText}>{space.member_count || 0} members</Text>
                        </View>
                        <Text style={styles.spaceListMetaText}>•</Text>
                        <Text style={styles.spaceListMetaText}>{space.privacy}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(space.id)} style={styles.favoriteButtonList}>
                      <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={20} color={isFavorite ? '#fbbf24' : theme.colors.textSubtle} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Templates Modal */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowTemplates(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Create New Space</Text>
            <Text style={styles.modalSubtitle}>Choose a template or start from scratch</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.templatesScroll}>
              {SPACE_TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => handleCreateFromTemplate(template)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: template.color + '20' }]}>
                    <Ionicons name={template.icon as any} size={32} color={template.color} />
                  </View>
                  <View style={styles.templateContent}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDesc}>{template.description}</Text>
                    <View style={styles.templateFeatures}>
                      {template.features.map((feature, idx) => (
                        <View key={idx} style={[styles.featureChip, { backgroundColor: template.color + '15' }]}>
                          <Text style={[styles.featureText, { color: template.color }]}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.customCard} onPress={() => { setShowTemplates(false); setShowCreate(true); }}>
                <Ionicons name="add-circle-outline" size={32} color="#22d3ee" />
                <View style={styles.customContent}>
                  <Text style={styles.customName}>Custom Space</Text>
                  <Text style={styles.customDesc}>Design your own from scratch</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Create Space Modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreate(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedTemplate ? 'Customize Space' : 'Create Space'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Space Name</Text>
              <TextInput
                placeholder="Enter space name"
                placeholderTextColor={theme.colors.textSubtle}
                style={styles.input}
                value={spaceName}
                onChangeText={setSpaceName}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                placeholder="What's this space about?"
                placeholderTextColor={theme.colors.textSubtle}
                style={[styles.input, styles.inputMultiline]}
                value={spaceDescription}
                onChangeText={setSpaceDescription}
                multiline
              />

              <Text style={styles.inputLabel}>Privacy</Text>
              <View style={styles.privacyOptions}>
                {PRIVACY_OPTIONS.map((option) => {
                  const isActive = spacePrivacy === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.privacyOption, isActive && styles.privacyOptionActive]}
                      onPress={() => setSpacePrivacy(option.value)}
                    >
                      <View style={styles.privacyOptionLeft}>
                        <Ionicons name={option.icon as any} size={20} color={isActive ? '#22d3ee' : theme.colors.textSubtle} />
                        <View>
                          <Text style={[styles.privacyOptionLabel, isActive && { color: '#22d3ee' }]}>
                            {option.label}
                          </Text>
                          <Text style={styles.privacyOptionDesc}>{option.description}</Text>
                        </View>
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={24} color="#22d3ee" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Icon</Text>
              <View style={styles.iconOptions}>
                {ICON_OPTIONS.map((option) => {
                  const isActive = spaceIcon === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.iconOption, isActive && { backgroundColor: spaceColor + '30' }]}
                      onPress={() => setSpaceIcon(option.value)}
                    >
                      <Ionicons name={option.icon as any} size={24} color={isActive ? spaceColor : theme.colors.textSubtle} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.colorOptions}>
                {COLOR_OPTIONS.map((color) => {
                  const isActive = spaceColor === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorOption, { backgroundColor: color }, isActive && styles.colorOptionActive]}
                      onPress={() => setSpaceColor(color)}
                    >
                      {isActive && <Ionicons name="checkmark" size={16} color="#000" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateSpace}
                disabled={createSpaceMutation.isPending}
              >
                <Text style={styles.createButtonText}>
                  {createSpaceMutation.isPending ? 'Creating...' : 'Create Space'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  heroHeader: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#34d399',
    opacity: 0.08,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    minWidth: 140,
    borderLeftWidth: 3,
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#22d3ee20',
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersSection: {
    marginBottom: 20,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  spacesSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  spacesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  spaceGridCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  spaceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spaceGridIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceGridName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  spaceGridDesc: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: 18,
    marginBottom: 12,
    minHeight: 36,
  },
  spaceGridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spaceGridMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spaceGridMetaText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  privacyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  privacyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  spacesList: {
    gap: 10,
  },
  spaceListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  spaceListIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceListContent: {
    flex: 1,
  },
  spaceListName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  spaceListDesc: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginBottom: 6,
  },
  spaceListFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spaceListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  spaceListMetaText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  favoriteButtonList: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: theme.colors.textSubtle,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22d3ee',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.divider,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    marginBottom: 20,
  },
  templatesScroll: {
    maxHeight: 500,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  templateIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateContent: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginBottom: 8,
  },
  templateFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
  },
  customCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.base,
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: '#22d3ee40',
    borderStyle: 'dashed',
    gap: 12,
  },
  customContent: {
    flex: 1,
  },
  customName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  customDesc: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 10,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  privacyOptions: {
    gap: 10,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyOptionActive: {
    borderColor: '#22d3ee40',
    backgroundColor: '#22d3ee10',
  },
  privacyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  privacyOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  privacyOptionDesc: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  iconOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  createButton: {
    backgroundColor: '#22d3ee',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

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
  '#f97316', '#3b82f6', '#ef4444', '#10b981', '#ec4899'
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
    description: 'Your private workspace for notes, files, and tasks',
    icon: 'lock-closed-outline',
    color: '#3b82f6',
    privacy: 'private' as Space['privacy'],
    features: ['Notes', 'Files', 'Tasks', 'Calendar'],
  },
  {
    id: 'team',
    name: 'Team Workspace',
    description: 'Collaborate with your team on projects',
    icon: 'people-outline',
    color: '#10b981',
    privacy: 'team' as Space['privacy'],
    features: ['Chat', 'Files', 'Tasks', 'Board'],
  },
  {
    id: 'project',
    name: 'Project Hub',
    description: 'Manage a specific project with all tools',
    icon: 'rocket-outline',
    color: '#f59e0b',
    privacy: 'shared' as Space['privacy'],
    features: ['Chat', 'Files', 'Tasks', 'Calendar', 'Docs'],
  },
  {
    id: 'community',
    name: 'Community',
    description: 'Public space for community engagement',
    icon: 'globe-outline',
    color: '#ec4899',
    privacy: 'public' as Space['privacy'],
    features: ['Chat', 'Files', 'Calendar', 'Events'],
  },
];

type TabType = 'spaces' | 'analytics' | 'settings';
type ViewMode = 'grid' | 'list';
type SortType = 'recent' | 'name' | 'members' | 'activity';

const resolveSpaceColor = (space: Space, index: number) => {
  if (space.color) {
    const match = space.color.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
    if (match) return match[0];
  }
  return COLOR_OPTIONS[index % COLOR_OPTIONS.length];
};

const formatRelativeDate = (dateString?: string) => {
  if (!dateString) return 'No recent activity';
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 1000 * 60 * 60) return 'Updated within the hour';
  if (diff < 1000 * 60 * 60 * 24) return 'Updated today';
  if (diff < 1000 * 60 * 60 * 24 * 3) return 'Updated in the last 3 days';
  return `Updated ${new Date(dateString).toLocaleDateString()}`;
};

export default function SpacesScreen() {
  const router = useRouter();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const { data: spaces = [], isLoading } = useSpaces();
  const createSpaceMutation = useCreateSpace();

  const [activeTab, setActiveTab] = useState<TabType>('spaces');
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortType, setSortType] = useState<SortType>('recent');

  // Create form state
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [spacePrivacy, setSpacePrivacy] = useState<Space['privacy']>('private');
  const [spaceIcon, setSpaceIcon] = useState('rocket');
  const [spaceColor, setSpaceColor] = useState(COLOR_OPTIONS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filteredAndSortedSpaces = useMemo(() => {
    let filtered = spaces;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((space) =>
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortType) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'members':
        sorted.sort((a, b) => (b.members_count || b.member_count || 0) - (a.members_count || a.member_count || 0));
        break;
      case 'activity':
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }

    return sorted;
  }, [spaces, searchQuery, sortType]);

  const stats = useMemo(
    () => ({
      total: spaces.length,
      privateCount: spaces.filter((space) => space.privacy === 'private').length,
      sharedCount: spaces.filter((space) => space.privacy === 'shared').length,
      teamCount: spaces.filter((space) => space.privacy === 'team').length,
      publicCount: spaces.filter((space) => space.privacy === 'public').length,
      totalMembers: spaces.reduce((sum, space) => sum + (space.members_count || space.member_count || 0), 0),
      avgMembers: spaces.length > 0 ? Math.round(spaces.reduce((sum, space) => sum + (space.members_count || space.member_count || 0), 0) / spaces.length) : 0,
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
      Alert.alert('Space name required', 'Add a name to create the space.');
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

  const tabs: Array<{ value: TabType; label: string; icon: string }> = [
    { value: 'spaces', label: 'Spaces', icon: 'apps-outline' },
    { value: 'analytics', label: 'Analytics', icon: 'stats-chart-outline' },
    { value: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  const sortOptions: Array<{ value: SortType; label: string; icon: string }> = [
    { value: 'recent', label: 'Recent', icon: 'time-outline' },
    { value: 'name', label: 'Name', icon: 'text-outline' },
    { value: 'members', label: 'Members', icon: 'people-outline' },
    { value: 'activity', label: 'Activity', icon: 'pulse-outline' },
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Spaces</Text>
            <Text style={styles.subtitle}>{stats.total} workspaces</Text>
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: accentHex }]}
            onPress={() => setShowTemplates(true)}
          >
            <Ionicons name="add" size={20} color={theme.colors.base} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tab, isActive && { backgroundColor: accentHex }]}
                onPress={() => setActiveTab(tab.value)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
                  color={isActive ? theme.colors.base : theme.colors.textSubtle}
                />
                <Text style={[styles.tabText, isActive && { color: theme.colors.base }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'spaces' && (
          <View style={styles.tabPane}>
            {/* Search and Controls */}
            <View style={styles.controlsRow}>
              <View style={styles.searchRow}>
                <Ionicons name="search" size={16} color={theme.colors.textSubtle} />
                <TextInput
                  placeholder="Search spaces..."
                  placeholderTextColor={theme.colors.textSubtle}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={theme.colors.textSubtle} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.viewModeButton}
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                <Ionicons
                  name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
                  size={18}
                  color={theme.colors.textSubtle}
                />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
              <View style={styles.sortRow}>
                {sortOptions.map((option) => {
                  const isActive = sortType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.sortChip, isActive && { backgroundColor: accentHex }]}
                      onPress={() => setSortType(option.value)}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={12}
                        color={isActive ? theme.colors.base : theme.colors.textSubtle}
                      />
                      <Text style={[styles.sortText, isActive && { color: theme.colors.base }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Spaces List */}
            {filteredAndSortedSpaces.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.iconWrap}>
                  <Ionicons name="apps-outline" size={40} color={theme.colors.textSubtle} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No spaces found' : 'No spaces yet'}
                </Text>
                <Text style={styles.emptyDescription}>
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Create your first space to get started'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.emptyButton, { backgroundColor: accentHex }]}
                    onPress={() => setShowTemplates(true)}
                  >
                    <Ionicons name="add" size={18} color={theme.colors.base} />
                    <Text style={styles.emptyButtonText}>Create a space</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={viewMode === 'grid' ? styles.spaceGrid : styles.spaceList}>
                {filteredAndSortedSpaces.map((space, index) => {
                  const color = resolveSpaceColor(space, index);
                  const iconName = SPACE_ICON_MAP[space.icon || space.type || 'rocket'] || 'rocket-outline';
                  const privacyOption = PRIVACY_OPTIONS.find((option) => option.value === space.privacy);

                  if (viewMode === 'grid') {
                    return (
                      <TouchableOpacity
                        key={space.id}
                        style={styles.spaceGridItem}
                        onPress={() => router.push(`/spaces/${space.id}` as any)}
                      >
                        <View style={[styles.spaceGridIcon, { backgroundColor: color }]}>
                          <Ionicons name={iconName as any} size={24} color={theme.colors.base} />
                        </View>
                        <Text style={styles.spaceGridName} numberOfLines={2}>{space.name}</Text>
                        <View style={styles.spaceGridMeta}>
                          <View style={styles.spaceGridMetaItem}>
                            <Ionicons name="people-outline" size={11} color={theme.colors.textSubtle} />
                            <Text style={styles.spaceGridMetaText}>
                              {(space.members_count ?? space.member_count ?? 0)}
                            </Text>
                          </View>
                          {privacyOption && (
                            <View style={styles.spaceGridMetaItem}>
                              <Ionicons name={privacyOption.icon as any} size={11} color={theme.colors.textSubtle} />
                              <Text style={styles.spaceGridMetaText}>{privacyOption.label}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={space.id}
                      style={styles.spaceRow}
                      onPress={() => router.push(`/spaces/${space.id}` as any)}
                    >
                      <View style={[styles.spaceIcon, { backgroundColor: color }]}>
                        <Ionicons name={iconName as any} size={18} color={theme.colors.base} />
                      </View>
                      <View style={styles.spaceContent}>
                        <Text style={styles.spaceName}>{space.name}</Text>
                        <Text style={styles.spaceDescription} numberOfLines={1}>
                          {space.description || 'No description yet'}
                        </Text>
                        <View style={styles.spaceMeta}>
                          <View style={styles.spaceMetaItem}>
                            <Ionicons name="people-outline" size={11} color={theme.colors.textSubtle} />
                            <Text style={styles.spaceMetaText}>
                              {(space.members_count ?? space.member_count ?? 0)} members
                            </Text>
                          </View>
                          {privacyOption && (
                            <View style={styles.spaceMetaItem}>
                              <Ionicons name={privacyOption.icon as any} size={11} color={theme.colors.textSubtle} />
                              <Text style={styles.spaceMetaText}>{privacyOption.label}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {activeTab === 'analytics' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Overview Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: accentHex + '15' }]}>
                  <Ionicons name="apps" size={20} color={accentHex} />
                </View>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Spaces</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#10b981' + '15' }]}>
                  <Ionicons name="people" size={20} color="#10b981" />
                </View>
                <Text style={styles.statValue}>{stats.totalMembers}</Text>
                <Text style={styles.statLabel}>Total Members</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                  <Ionicons name="trending-up" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.statValue}>{stats.avgMembers}</Text>
                <Text style={styles.statLabel}>Avg per Space</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Privacy Distribution</Text>
            <View style={styles.distributionCard}>
              <View style={styles.distributionRow}>
                <View style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <View style={[styles.distributionIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                      <Ionicons name="lock-closed" size={16} color="#3b82f6" />
                    </View>
                    <Text style={styles.distributionValue}>{stats.privateCount}</Text>
                  </View>
                  <Text style={styles.distributionLabel}>Private</Text>
                  <View style={styles.distributionBar}>
                    <View
                      style={[
                        styles.distributionBarFill,
                        {
                          width: stats.total > 0 ? `${(stats.privateCount / stats.total) * 100}%` : '0%',
                          backgroundColor: '#3b82f6',
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <View style={[styles.distributionIcon, { backgroundColor: '#10b981' + '15' }]}>
                      <Ionicons name="people" size={16} color="#10b981" />
                    </View>
                    <Text style={styles.distributionValue}>{stats.sharedCount}</Text>
                  </View>
                  <Text style={styles.distributionLabel}>Shared</Text>
                  <View style={styles.distributionBar}>
                    <View
                      style={[
                        styles.distributionBarFill,
                        {
                          width: stats.total > 0 ? `${(stats.sharedCount / stats.total) * 100}%` : '0%',
                          backgroundColor: '#10b981',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.distributionRow}>
                <View style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <View style={[styles.distributionIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                      <Ionicons name="business" size={16} color="#f59e0b" />
                    </View>
                    <Text style={styles.distributionValue}>{stats.teamCount}</Text>
                  </View>
                  <Text style={styles.distributionLabel}>Team</Text>
                  <View style={styles.distributionBar}>
                    <View
                      style={[
                        styles.distributionBarFill,
                        {
                          width: stats.total > 0 ? `${(stats.teamCount / stats.total) * 100}%` : '0%',
                          backgroundColor: '#f59e0b',
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <View style={[styles.distributionIcon, { backgroundColor: '#ec4899' + '15' }]}>
                      <Ionicons name="globe" size={16} color="#ec4899" />
                    </View>
                    <Text style={styles.distributionValue}>{stats.publicCount}</Text>
                  </View>
                  <Text style={styles.distributionLabel}>Public</Text>
                  <View style={styles.distributionBar}>
                    <View
                      style={[
                        styles.distributionBarFill,
                        {
                          width: stats.total > 0 ? `${(stats.publicCount / stats.total) * 100}%` : '0%',
                          backgroundColor: '#ec4899',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {spaces.slice(0, 5).map((space, index) => {
                const color = resolveSpaceColor(space, index);
                const iconName = SPACE_ICON_MAP[space.icon || space.type || 'rocket'] || 'rocket-outline';
                return (
                  <View key={space.id} style={styles.activityRow}>
                    <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={iconName as any} size={16} color={color} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityName}>{space.name}</Text>
                      <Text style={styles.activityTime}>{formatRelativeDate(space.updated_at)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabPane}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Space Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="eye-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Default View Mode</Text>
                </View>
                <Text style={styles.settingValue}>{viewMode === 'grid' ? 'Grid' : 'List'}</Text>
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="filter-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Default Sort</Text>
                </View>
                <Text style={styles.settingValue}>{sortType.charAt(0).toUpperCase() + sortType.slice(1)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Discovery</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="search-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Discover Public Spaces</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="compass-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Browse Templates</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="download-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Export All Spaces</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="archive-outline" size={18} color={theme.colors.textPrimary} />
                  <Text style={styles.settingLabel}>Archived Spaces</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Templates Modal */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTemplates(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Space</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.templatesSubtitle}>Choose a template or start from scratch</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.templatesScroll}>
              {SPACE_TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => handleCreateFromTemplate(template)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
                    <Ionicons name={template.icon as any} size={24} color={theme.colors.base} />
                  </View>
                  <View style={styles.templateContent}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                    <View style={styles.templateFeatures}>
                      {template.features.map((feature, idx) => (
                        <View key={idx} style={styles.templateFeatureChip}>
                          <Text style={styles.templateFeatureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.customCard}
                onPress={() => {
                  setShowTemplates(false);
                  setShowCreate(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={accentHex} />
                <View style={styles.customContent}>
                  <Text style={styles.customName}>Custom Space</Text>
                  <Text style={styles.customDescription}>Start from scratch with your own setup</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCreate(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTemplate ? 'Customize Space' : 'Create Space'}
              </Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                placeholder="Space name"
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
              <View style={styles.optionColumn}>
                {PRIVACY_OPTIONS.map((option) => {
                  const isActive = spacePrivacy === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.privacyOption, isActive && { backgroundColor: theme.colors.surface, borderColor: accentHex }]}
                      onPress={() => setSpacePrivacy(option.value)}
                    >
                      <View style={styles.privacyLeft}>
                        <View style={[styles.privacyIconWrap, isActive && { backgroundColor: accentHex }]}>
                          <Ionicons
                            name={option.icon as any}
                            size={16}
                            color={isActive ? theme.colors.base : theme.colors.textSubtle}
                          />
                        </View>
                        <View>
                          <Text style={[styles.privacyLabel, isActive && { color: theme.colors.textPrimary }]}>
                            {option.label}
                          </Text>
                          <Text style={styles.privacyDescription}>{option.description}</Text>
                        </View>
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={20} color={accentHex} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Icon</Text>
              <View style={styles.optionRow}>
                {ICON_OPTIONS.map((option) => {
                  const isActive = spaceIcon === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.iconChip, isActive && { backgroundColor: accentHex }]}
                      onPress={() => setSpaceIcon(option.value)}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={18}
                        color={isActive ? theme.colors.base : theme.colors.textSubtle}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.optionRow}>
                {COLOR_OPTIONS.map((color) => {
                  const isActive = spaceColor === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorChip, { backgroundColor: color }, isActive && styles.colorChipActive]}
                      onPress={() => setSpaceColor(color)}
                    >
                      {isActive && <Ionicons name="checkmark" size={14} color={theme.colors.base} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.createSpaceButton, { backgroundColor: accentHex }]}
                onPress={handleCreateSpace}
                disabled={createSpaceMutation.isPending}
              >
                <Text style={styles.createSpaceButtonText}>
                  {createSpaceMutation.isPending ? 'Creating...' : 'Create Space'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  content: {
    flex: 1,
  },
  tabPane: {
    padding: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  sortScroll: {
    marginBottom: 16,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  sortText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  spaceList: {
    gap: 10,
  },
  spaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  spaceGridItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  spaceGridIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  spaceGridName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  spaceGridMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  spaceGridMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  spaceGridMetaText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  spaceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  spaceContent: {
    flex: 1,
  },
  spaceName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  spaceDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginBottom: 6,
  },
  spaceMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  spaceMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spaceMetaText: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    marginBottom: 20,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    maxWidth: 260,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    textAlign: 'center',
  },
  distributionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 20,
  },
  distributionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  distributionItem: {
    flex: 1,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  distributionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distributionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  distributionLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    marginBottom: 8,
    fontWeight: '600',
  },
  distributionBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  settingsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingValue: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  templatesSubtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginBottom: 16,
  },
  templatesScroll: {
    maxHeight: 500,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  templateIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginBottom: 8,
  },
  templateFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  templateFeatureChip: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  templateFeatureText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  customCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  customContent: {
    flex: 1,
    marginLeft: 12,
  },
  customName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  customDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionColumn: {
    gap: 10,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  privacyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  privacyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChipActive: {
    borderWidth: 3,
    borderColor: theme.colors.base,
  },
  createSpaceButton: {
    marginTop: 24,
    marginBottom: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createSpaceButtonText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 15,
  },
});

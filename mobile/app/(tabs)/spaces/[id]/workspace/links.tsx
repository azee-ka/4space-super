import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../../src/utils/themeUtils';
import { theme } from '../../../../../src/styles/theme';

type LinkCategory = 'design' | 'development' | 'marketing' | 'research' | 'tools' | 'other';

interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  category: LinkCategory;
  thumbnail?: string;
  favicon: string;
  addedBy: string;
  addedAt: string;
  clicks: number;
  starred: boolean;
  tags: string[];
  notes?: string;
}

const CATEGORIES = [
  { id: 'design', name: 'Design', icon: 'color-palette', color: '#f472b6' },
  { id: 'development', name: 'Development', icon: 'code-slash', color: '#3b82f6' },
  { id: 'marketing', name: 'Marketing', icon: 'megaphone', color: '#f59e0b' },
  { id: 'research', name: 'Research', icon: 'search', color: '#8b5cf6' },
  { id: 'tools', name: 'Tools', icon: 'construct', color: '#10b981' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

export default function LinksWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<LinkCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [links, setLinks] = useState([
    {
      id: '1',
      title: 'Figma - Collaborative Interface Design',
      url: 'https://figma.com',
      description: 'Design, prototype, and collaborate in the browser',
      category: 'design',
      favicon: '🎨',
      addedBy: 'Sarah Chen',
      addedAt: '2026-01-20',
      clicks: 45,
      starred: true,
      tags: ['design', 'prototyping', 'collaboration'],
      notes: 'Main design tool for our team',
    },
    {
      id: '2',
      title: 'GitHub - Code Collaboration',
      url: 'https://github.com',
      description: 'Where the world builds software',
      category: 'development',
      favicon: '💻',
      addedBy: 'Mike Johnson',
      addedAt: '2026-01-18',
      clicks: 89,
      starred: true,
      tags: ['git', 'code', 'collaboration'],
      notes: 'All our repositories are here',
    },
    {
      id: '3',
      title: 'Analytics Dashboard',
      url: 'https://analytics.example.com',
      description: 'Real-time marketing analytics and insights',
      category: 'marketing',
      favicon: '📊',
      addedBy: 'Emma Wilson',
      addedAt: '2026-01-22',
      clicks: 23,
      starred: false,
      tags: ['analytics', 'metrics', 'reporting'],
    },
    {
      id: '4',
      title: 'User Research Repository',
      url: 'https://research.example.com',
      description: 'Centralized user research findings and insights',
      category: 'research',
      favicon: '🔍',
      addedBy: 'Alex Brown',
      addedAt: '2026-01-15',
      clicks: 34,
      starred: true,
      tags: ['research', 'users', 'insights'],
      notes: 'Check weekly for new studies',
    },
    {
      id: '5',
      title: 'Notion - Team Wiki',
      url: 'https://notion.so',
      description: 'All-in-one workspace for notes and docs',
      category: 'tools',
      favicon: '📝',
      addedBy: 'David Lee',
      addedAt: '2026-01-25',
      clicks: 67,
      starred: true,
      tags: ['wiki', 'docs', 'knowledge'],
      notes: 'Team documentation lives here',
    },
    {
      id: '6',
      title: 'Linear - Issue Tracking',
      url: 'https://linear.app',
      description: "The issue tracking tool you'll enjoy using",
      category: 'development',
      favicon: '🎯',
      addedBy: 'Lisa Martinez',
      addedAt: '2026-01-12',
      clicks: 56,
      starred: false,
      tags: ['issues', 'project', 'tracking'],
    },
    {
      id: '7',
      title: 'Dribbble - Design Inspiration',
      url: 'https://dribbble.com',
      description: 'Discover the world\'s top designers and creative professionals',
      category: 'design',
      favicon: '🎨',
      addedBy: 'Sarah Chen',
      addedAt: '2026-01-10',
      clicks: 28,
      starred: false,
      tags: ['inspiration', 'design', 'portfolio'],
    },
    {
      id: '8',
      title: 'Mailchimp - Email Marketing',
      url: 'https://mailchimp.com',
      description: 'Marketing, automation & email platform',
      category: 'marketing',
      favicon: '📧',
      addedBy: 'Emma Wilson',
      addedAt: '2026-01-08',
      clicks: 19,
      starred: false,
      tags: ['email', 'marketing', 'campaigns'],
    },
    {
      id: '9',
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      description: 'Where developers learn and share knowledge',
      category: 'development',
      favicon: '⚡',
      addedBy: 'Mike Johnson',
      addedAt: '2026-01-24',
      clicks: 42,
      starred: true,
      tags: ['qa', 'coding', 'community'],
    },
    {
      id: '10',
      title: 'Miro - Online Whiteboard',
      url: 'https://miro.com',
      description: 'The online collaborative whiteboard platform',
      category: 'tools',
      favicon: '🖼️',
      addedBy: 'Alex Brown',
      addedAt: '2026-01-16',
      clicks: 31,
      starred: false,
      tags: ['whiteboard', 'brainstorming', 'collaboration'],
    },
    {
      id: '11',
      title: 'Google Analytics',
      url: 'https://analytics.google.com',
      description: 'Measure your advertising ROI and track your sites and apps',
      category: 'marketing',
      favicon: '📈',
      addedBy: 'Emma Wilson',
      addedAt: '2026-01-14',
      clicks: 38,
      starred: true,
      tags: ['analytics', 'tracking', 'metrics'],
    },
    {
      id: '12',
      title: 'UserTesting Platform',
      url: 'https://usertesting.com',
      description: 'Get feedback from real users',
      category: 'research',
      favicon: '👥',
      addedBy: 'David Lee',
      addedAt: '2026-01-11',
      clicks: 15,
      starred: false,
      tags: ['testing', 'feedback', 'users'],
    },
  ] as Link[]);

  const getFilteredLinks = () => {
    let filtered = links;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(link => link.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const toggleStar = (linkId: string) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === linkId ? { ...link, starred: !link.starred } : link
      )
    );
  };

  const incrementClicks = (linkId: string) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === linkId ? { ...link, clicks: link.clicks + 1 } : link
      )
    );
  };

  const stats = {
    total: links.length,
    starred: links.filter(l => l.starred).length,
    clicks: links.reduce((sum, l) => sum + l.clicks, 0),
    categories: new Set(links.map(l => l.category)).size,
  };

  const getCategoryInfo = (category: LinkCategory) => {
    return CATEGORIES.find(c => c.id === category) || CATEGORIES[CATEGORIES.length - 1];
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
    linksScroll: {
      flex: 1,
    },
    gridContainer: {
      padding: 16,
      gap: 16,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 16,
    },
    linkCardGrid: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    linkFavicon: {
      fontSize: 36,
      marginBottom: 8,
    },
    linkTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    linkDescription: {
      fontSize: 12,
      color: theme.colors.textSubtle,
      lineHeight: 16,
      marginBottom: 8,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    linkFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    clicksCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    clicksText: {
      fontSize: 12,
      color: theme.colors.textSubtle,
    },
    starButton: {
      padding: 4,
    },
    listContainer: {
      padding: 20,
      gap: 12,
    },
    linkCardList: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    linkHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    linkFaviconSmall: {
      fontSize: 24,
    },
    linkInfo: {
      flex: 1,
      gap: 4,
    },
    linkUrl: {
      fontSize: 12,
      color: accentColorHex,
      marginBottom: 4,
    },
    linkMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    tag: {
      backgroundColor: theme.colors.background,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagText: {
      fontSize: 10,
      color: theme.colors.text,
      fontWeight: '600',
    },
    linkActions: {
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
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 12,
    },
    modalHeaderTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    modalFavicon: {
      fontSize: 48,
    },
    modalClose: {
      padding: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    modalUrl: {
      fontSize: 14,
      color: accentColorHex,
      marginBottom: 8,
    },
    modalDescription: {
      fontSize: 14,
      color: theme.colors.textSubtle,
      lineHeight: 20,
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
    notesBox: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    notesText: {
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
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Links</Text>
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
            placeholder="Search links..."
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
          <Text style={styles.statNumber}>{stats.clicks}</Text>
          <Text style={styles.statLabel}>Clicks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.categories}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, filterCategory === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={[styles.filterButtonText, filterCategory === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.filterButton, filterCategory === category.id && styles.filterButtonActive]}
              onPress={() => setFilterCategory(category.id as LinkCategory)}
            >
              <Ionicons
                name={category.icon as any}
                size={14}
                color={filterCategory === category.id ? accentColorHex : theme.colors.textSubtle}
              />
              <Text style={[styles.filterButtonText, filterCategory === category.id && styles.filterButtonTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Links Grid/List */}
      <ScrollView style={styles.linksScroll}>
        {view === 'grid' ? (
          <View style={styles.gridContainer}>
            {getFilteredLinks().length > 0 ? (
              Array.from({ length: Math.ceil(getFilteredLinks().length / 2) }, (_, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {getFilteredLinks().slice(rowIndex * 2, rowIndex * 2 + 2).map(link => {
                    const categoryInfo = getCategoryInfo(link.category);
                    return (
                      <TouchableOpacity
                        key={link.id}
                        style={styles.linkCardGrid}
                        onPress={() => {
                          setSelectedLink(link);
                          setShowLinkModal(true);
                        }}
                      >
                        <Text style={styles.linkFavicon}>{link.favicon}</Text>
                        <Text style={styles.linkTitle} numberOfLines={2}>{link.title}</Text>
                        <Text style={styles.linkDescription} numberOfLines={2}>
                          {link.description}
                        </Text>
                        <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                          <Ionicons name={categoryInfo.icon as any} size={10} color={categoryInfo.color} />
                          <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                            {categoryInfo.name}
                          </Text>
                        </View>
                        <View style={styles.linkFooter}>
                          <View style={styles.clicksCount}>
                            <Ionicons name="eye-outline" size={14} color={theme.colors.textSubtle} />
                            <Text style={styles.clicksText}>{link.clicks}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.starButton}
                            onPress={() => toggleStar(link.id)}
                          >
                            <Ionicons
                              name={link.starred ? 'star' : 'star-outline'}
                              size={20}
                              color={link.starred ? '#fbbf24' : theme.colors.textSubtle}
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="link-outline" size={48} color={theme.colors.textSubtle} />
                <Text style={styles.emptyStateText}>No links found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery ? 'Try a different search' : 'Add your first link'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {getFilteredLinks().length > 0 ? (
              getFilteredLinks().map(link => {
                const categoryInfo = getCategoryInfo(link.category);
                return (
                  <TouchableOpacity
                    key={link.id}
                    style={styles.linkCardList}
                    onPress={() => {
                      setSelectedLink(link);
                      setShowLinkModal(true);
                    }}
                  >
                    <View style={styles.linkHeader}>
                      <Text style={styles.linkFaviconSmall}>{link.favicon}</Text>
                      <View style={styles.linkInfo}>
                        <Text style={styles.linkTitle}>{link.title}</Text>
                        <Text style={styles.linkUrl}>{link.url}</Text>
                        <Text style={styles.linkDescription}>{link.description}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.starButton}
                        onPress={() => toggleStar(link.id)}
                      >
                        <Ionicons
                          name={link.starred ? 'star' : 'star-outline'}
                          size={24}
                          color={link.starred ? '#fbbf24' : theme.colors.textSubtle}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.linkMeta}>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                        <Ionicons name={categoryInfo.icon as any} size={10} color={categoryInfo.color} />
                        <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                          {categoryInfo.name}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={14} color={theme.colors.textSubtle} />
                        <Text style={styles.metaText}>{link.addedBy}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="eye-outline" size={14} color={theme.colors.textSubtle} />
                        <Text style={styles.metaText}>{link.clicks} clicks</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSubtle} />
                        <Text style={styles.metaText}>{link.addedAt}</Text>
                      </View>
                    </View>

                    {link.tags.length > 0 && (
                      <View style={styles.tagsRow}>
                        {link.tags.map(tag => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.linkActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={16} color={theme.colors.text} />
                        <Text style={styles.actionButtonText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={() => incrementClicks(link.id)}
                      >
                        <Ionicons name="open-outline" size={16} color="#ffffff" />
                        <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Open</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="link-outline" size={48} color={theme.colors.textSubtle} />
                <Text style={styles.emptyStateText}>No links found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery ? 'Try a different search' : 'Add your first link'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Link Detail Modal */}
      <Modal
        visible={showLinkModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLinkModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedLink && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTop}>
                    <Text style={styles.modalFavicon}>{selectedLink.favicon}</Text>
                    <TouchableOpacity onPress={() => setShowLinkModal(false)} style={styles.modalClose}>
                      <Ionicons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalTitle}>{selectedLink.title}</Text>
                  <Text style={styles.modalUrl}>{selectedLink.url}</Text>
                  <Text style={styles.modalDescription}>{selectedLink.description}</Text>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name={getCategoryInfo(selectedLink.category).icon as any}
                        size={20}
                        color={getCategoryInfo(selectedLink.category).color}
                      />
                      <Text style={styles.modalInfoText}>
                        {getCategoryInfo(selectedLink.category).name}
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Added by {selectedLink.addedBy}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Added on {selectedLink.addedAt}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="eye-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>{selectedLink.clicks} clicks</Text>
                    </View>
                  </View>

                  {selectedLink.tags.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Tags</Text>
                      <View style={styles.tagsRow}>
                        {selectedLink.tags.map(tag => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedLink.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Notes</Text>
                      <View style={styles.notesBox}>
                        <Text style={styles.notesText}>{selectedLink.notes}</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.footerButton, styles.footerPrimaryButton]}
                    onPress={() => incrementClicks(selectedLink.id)}
                  >
                    <Ionicons name="open-outline" size={20} color="#ffffff" />
                    <Text style={[styles.footerButtonText, styles.footerPrimaryButtonText]}>
                      Open Link
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={[styles.footerButton, { flex: 1 }]}>
                      <Ionicons name="share-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.footerButtonText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.footerButton, { flex: 1 }]}
                      onPress={() => toggleStar(selectedLink.id)}
                    >
                      <Ionicons
                        name={selectedLink.starred ? 'star' : 'star-outline'}
                        size={20}
                        color={selectedLink.starred ? '#fbbf24' : theme.colors.text}
                      />
                      <Text style={styles.footerButtonText}>
                        {selectedLink.starred ? 'Unstar' : 'Star'}
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

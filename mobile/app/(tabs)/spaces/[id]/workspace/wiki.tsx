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

type ArticleCategory = 'product' | 'engineering' | 'design' | 'process' | 'onboarding' | 'general';

interface WikiArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  author: string;
  createdAt: string;
  modifiedAt: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  starred: boolean;
}

const CATEGORIES = [
  { id: 'product', name: 'Product', icon: 'rocket', color: '#3b82f6' },
  { id: 'engineering', name: 'Engineering', icon: 'code-slash', color: '#10b981' },
  { id: 'design', name: 'Design', icon: 'color-palette', color: '#ec4899' },
  { id: 'process', name: 'Process', icon: 'git-branch', color: '#f59e0b' },
  { id: 'onboarding', name: 'Onboarding', icon: 'people', color: '#8b5cf6' },
  { id: 'general', name: 'General', icon: 'document-text', color: '#6b7280' },
];

export default function WikiWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [filterCategory, setFilterCategory] = useState<ArticleCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [articles, setArticles] = useState<WikiArticle[]>([
    {
      id: '1',
      title: 'Product Vision and Strategy',
      summary: 'Our long-term product vision and strategic roadmap for 2026',
      content: 'This document outlines our product vision for the next 3 years, including key strategic initiatives, market positioning, and growth objectives.\n\nKey Focus Areas:\n- User experience improvements\n- Platform scalability\n- International expansion\n- AI integration',
      category: 'product',
      author: 'Sarah Chen',
      createdAt: '2026-01-15',
      modifiedAt: '2026-01-27',
      views: 234,
      likes: 45,
      comments: 12,
      tags: ['strategy', 'roadmap', 'vision'],
      starred: true,
    },
    {
      id: '2',
      title: 'API Documentation Guide',
      summary: 'Complete guide to our REST API endpoints and authentication',
      content: 'Comprehensive documentation for all API endpoints, including authentication, rate limiting, and best practices.\n\nEndpoints:\n- /api/v1/auth\n- /api/v1/users\n- /api/v1/data\n- /api/v1/files',
      category: 'engineering',
      author: 'Mike Johnson',
      createdAt: '2026-01-18',
      modifiedAt: '2026-01-26',
      views: 567,
      likes: 89,
      comments: 23,
      tags: ['api', 'documentation', 'backend'],
      starred: true,
    },
    {
      id: '3',
      title: 'Design System Guidelines',
      summary: 'Component library, color palette, and design principles',
      content: 'Our design system provides a consistent visual language across all products.\n\nCore Components:\n- Typography scale\n- Color palette\n- Spacing system\n- Component library\n- Accessibility guidelines',
      category: 'design',
      author: 'Emma Wilson',
      createdAt: '2026-01-12',
      modifiedAt: '2026-01-25',
      views: 445,
      likes: 67,
      comments: 18,
      tags: ['design-system', 'ui', 'components'],
      starred: true,
    },
    {
      id: '4',
      title: 'Sprint Planning Process',
      summary: 'How we plan and execute two-week sprints',
      content: 'Our agile sprint process ensures efficient delivery and continuous improvement.\n\nSprint Cycle:\n1. Sprint planning (Monday)\n2. Daily standups\n3. Mid-sprint check-in\n4. Sprint review\n5. Retrospective',
      category: 'process',
      author: 'Alex Brown',
      createdAt: '2026-01-10',
      modifiedAt: '2026-01-24',
      views: 321,
      likes: 54,
      comments: 15,
      tags: ['agile', 'sprint', 'process'],
      starred: false,
    },
    {
      id: '5',
      title: 'New Employee Onboarding',
      summary: 'Complete onboarding guide for new team members',
      content: 'Welcome to the team! This guide will help you get set up and productive.\n\nFirst Week:\n- Day 1: Equipment setup\n- Day 2: Team introductions\n- Day 3: Product training\n- Day 4: First project assignment\n- Day 5: One-on-one with manager',
      category: 'onboarding',
      author: 'Lisa Martinez',
      createdAt: '2026-01-08',
      modifiedAt: '2026-01-23',
      views: 189,
      likes: 34,
      comments: 8,
      tags: ['onboarding', 'hr', 'training'],
      starred: false,
    },
    {
      id: '6',
      title: 'Code Review Best Practices',
      summary: 'Guidelines for effective code reviews',
      content: 'Code reviews are essential for maintaining quality and knowledge sharing.\n\nBest Practices:\n- Review within 24 hours\n- Be constructive and specific\n- Focus on code, not the person\n- Ask questions, don\'t make demands\n- Test the changes locally',
      category: 'engineering',
      author: 'Tom Anderson',
      createdAt: '2026-01-14',
      modifiedAt: '2026-01-22',
      views: 412,
      likes: 71,
      comments: 19,
      tags: ['code-review', 'best-practices', 'engineering'],
      starred: true,
    },
    {
      id: '7',
      title: 'Product Launch Checklist',
      summary: 'Everything you need to launch a new feature',
      content: 'A comprehensive checklist for successful product launches.\n\nPre-Launch:\n- Marketing materials ready\n- Documentation updated\n- Support team trained\n- Analytics configured\n- Beta testing complete',
      category: 'product',
      author: 'David Lee',
      createdAt: '2026-01-16',
      modifiedAt: '2026-01-21',
      views: 278,
      likes: 48,
      comments: 11,
      tags: ['launch', 'checklist', 'product'],
      starred: false,
    },
    {
      id: '8',
      title: 'Design Workflow and Tools',
      summary: 'Our design process from concept to production',
      content: 'How we take designs from initial concept to shipped product.\n\nTools:\n- Figma for design\n- Miro for ideation\n- Zeplin for handoff\n- Abstract for version control',
      category: 'design',
      author: 'Emma Wilson',
      createdAt: '2026-01-11',
      modifiedAt: '2026-01-20',
      views: 356,
      likes: 62,
      comments: 14,
      tags: ['design', 'workflow', 'tools'],
      starred: false,
    },
    {
      id: '9',
      title: 'Meeting Guidelines',
      summary: 'How to run effective and efficient meetings',
      content: 'Make meetings productive and respectful of everyone\'s time.\n\nGuidelines:\n- Always have an agenda\n- Start and end on time\n- Take notes and action items\n- Invite only necessary participants\n- Follow up within 24 hours',
      category: 'general',
      author: 'Sarah Chen',
      createdAt: '2026-01-09',
      modifiedAt: '2026-01-19',
      views: 298,
      likes: 52,
      comments: 9,
      tags: ['meetings', 'productivity', 'culture'],
      starred: false,
    },
    {
      id: '10',
      title: 'Security Best Practices',
      summary: 'Keep our systems and data secure',
      content: 'Essential security practices every team member should follow.\n\nKey Practices:\n- Use strong passwords\n- Enable 2FA everywhere\n- Never commit secrets\n- Regular security training\n- Report suspicious activity',
      category: 'engineering',
      author: 'Mike Johnson',
      createdAt: '2026-01-13',
      modifiedAt: '2026-01-18',
      views: 523,
      likes: 94,
      comments: 21,
      tags: ['security', 'best-practices', 'safety'],
      starred: true,
    },
  ]);

  const getFilteredArticles = () => {
    let filtered = articles;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(article => article.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const toggleStar = (articleId: string) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === articleId ? { ...article, starred: !article.starred } : article
      )
    );
  };

  const incrementViews = (articleId: string) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === articleId ? { ...article, views: article.views + 1 } : article
      )
    );
  };

  const stats = {
    total: articles.length,
    starred: articles.filter(a => a.starred).length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    categories: new Set(articles.map(a => a.category)).size,
  };

  const getCategoryInfo = (category: ArticleCategory) => {
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
    addButton: {
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
    articlesScroll: {
      flex: 1,
    },
    articlesContainer: {
      padding: 20,
      gap: 12,
    },
    articleCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    articleHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    articleHeaderLeft: {
      flex: 1,
      gap: 8,
    },
    articleTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    starButton: {
      padding: 4,
    },
    articleSummary: {
      fontSize: 13,
      color: theme.colors.textSubtle,
      lineHeight: 18,
    },
    articleMeta: {
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
    articleActions: {
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
    modalTitle: {
      fontSize: 20,
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
    statBoxIcon: {
      marginBottom: 8,
    },
    statBoxNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statBoxLabel: {
      fontSize: 11,
      color: theme.colors.textSubtle,
      textAlign: 'center',
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
          <Text style={styles.headerTitle}>Wiki</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color={accentColorHex} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
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
          <Text style={styles.statLabel}>Articles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.starred}</Text>
          <Text style={styles.statLabel}>Starred</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalViews}</Text>
          <Text style={styles.statLabel}>Total Views</Text>
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
              onPress={() => setFilterCategory(category.id as ArticleCategory)}
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

      {/* Articles List */}
      <ScrollView style={styles.articlesScroll}>
        <View style={styles.articlesContainer}>
          {getFilteredArticles().length > 0 ? (
            getFilteredArticles().map(article => {
              const categoryInfo = getCategoryInfo(article.category);
              return (
                <TouchableOpacity
                  key={article.id}
                  style={styles.articleCard}
                  onPress={() => {
                    setSelectedArticle(article);
                    incrementViews(article.id);
                    setShowArticleModal(true);
                  }}
                >
                  <View style={styles.articleHeader}>
                    <View style={styles.articleHeaderLeft}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                        <Ionicons name={categoryInfo.icon as any} size={10} color={categoryInfo.color} />
                        <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                          {categoryInfo.name}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.starButton}
                      onPress={() => toggleStar(article.id)}
                    >
                      <Ionicons
                        name={article.starred ? 'star' : 'star-outline'}
                        size={24}
                        color={article.starred ? '#fbbf24' : theme.colors.textSubtle}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.articleSummary}>{article.summary}</Text>

                  <View style={styles.articleMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={14} color={theme.colors.textSubtle} />
                      <Text style={styles.metaText}>{article.author}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={theme.colors.textSubtle} />
                      <Text style={styles.metaText}>{article.modifiedAt}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="eye-outline" size={14} color={theme.colors.textSubtle} />
                      <Text style={styles.metaText}>{article.views}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="heart-outline" size={14} color={theme.colors.textSubtle} />
                      <Text style={styles.metaText}>{article.likes}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="chatbubble-outline" size={14} color={theme.colors.textSubtle} />
                      <Text style={styles.metaText}>{article.comments}</Text>
                    </View>
                  </View>

                  {article.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {article.tags.map(tag => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.articleActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-outline" size={16} color={theme.colors.text} />
                      <Text style={styles.actionButtonText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                      <Ionicons name="eye-outline" size={16} color="#ffffff" />
                      <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Read</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={theme.colors.textSubtle} />
              <Text style={styles.emptyStateText}>No articles found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search' : 'Create your first article'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        visible={showArticleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowArticleModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedArticle?.title}
                </Text>
                <TouchableOpacity onPress={() => setShowArticleModal(false)} style={styles.modalClose}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              {selectedArticle && (
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryInfo(selectedArticle.category).color + '20' }
                ]}>
                  <Ionicons
                    name={getCategoryInfo(selectedArticle.category).icon as any}
                    size={12}
                    color={getCategoryInfo(selectedArticle.category).color}
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: getCategoryInfo(selectedArticle.category).color }
                  ]}>
                    {getCategoryInfo(selectedArticle.category).name}
                  </Text>
                </View>
              )}
            </View>

            {selectedArticle && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <Text style={styles.articleSummary}>{selectedArticle.summary}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Content</Text>
                    <View style={styles.contentBox}>
                      <Text style={styles.contentText}>{selectedArticle.content}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Engagement</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statBox}>
                        <Ionicons name="eye" size={24} color={theme.colors.textSubtle} style={styles.statBoxIcon} />
                        <Text style={styles.statBoxNumber}>{selectedArticle.views}</Text>
                        <Text style={styles.statBoxLabel}>Views</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Ionicons name="heart" size={24} color="#ef4444" style={styles.statBoxIcon} />
                        <Text style={styles.statBoxNumber}>{selectedArticle.likes}</Text>
                        <Text style={styles.statBoxLabel}>Likes</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Ionicons name="chatbubble" size={24} color={accentColorHex} style={styles.statBoxIcon} />
                        <Text style={styles.statBoxNumber}>{selectedArticle.comments}</Text>
                        <Text style={styles.statBoxLabel}>Comments</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Author: {selectedArticle.author}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Created {selectedArticle.createdAt}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>Modified {selectedArticle.modifiedAt}</Text>
                    </View>
                  </View>

                  {selectedArticle.tags.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Tags</Text>
                      <View style={styles.tagsRow}>
                        {selectedArticle.tags.map(tag => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={[styles.footerButton, styles.footerPrimaryButton]}>
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                    <Text style={[styles.footerButtonText, styles.footerPrimaryButtonText]}>
                      Edit Article
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={[styles.footerButton, { flex: 1 }]}>
                      <Ionicons name="share-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.footerButtonText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.footerButton, { flex: 1 }]}
                      onPress={() => toggleStar(selectedArticle.id)}
                    >
                      <Ionicons
                        name={selectedArticle.starred ? 'star' : 'star-outline'}
                        size={20}
                        color={selectedArticle.starred ? '#fbbf24' : theme.colors.text}
                      />
                      <Text style={styles.footerButtonText}>
                        {selectedArticle.starred ? 'Unstar' : 'Star'}
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

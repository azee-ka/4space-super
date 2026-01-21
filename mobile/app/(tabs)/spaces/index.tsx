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
];

const SPACE_ICON_MAP: Record<string, string> = {
  lock: 'lock-closed-outline',
  heart: 'heart-outline',
  users: 'people-outline',
  briefcase: 'briefcase-outline',
  globe: 'globe-outline',
  rocket: 'rocket-outline',
  personal: 'lock-closed-outline',
  couple: 'heart-outline',
  team: 'people-outline',
  portfolio: 'briefcase-outline',
  community: 'globe-outline',
  project: 'rocket-outline',
};

const COLOR_OPTIONS = ['#22d3ee', '#f472b6', '#34d399', '#fbbf24', '#a855f7', '#f97316'];

const PRIVACY_OPTIONS: Array<{ value: Space['privacy']; label: string; icon: string }> = [
  { value: 'private', label: 'Private', icon: 'lock-closed-outline' },
  { value: 'shared', label: 'Shared', icon: 'people-outline' },
  { value: 'team', label: 'Team', icon: 'business-outline' },
  { value: 'public', label: 'Public', icon: 'globe-outline' },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [spacePrivacy, setSpacePrivacy] = useState<Space['privacy']>('private');
  const [spaceIcon, setSpaceIcon] = useState('rocket');
  const [spaceColor, setSpaceColor] = useState(COLOR_OPTIONS[0]);

  const filteredSpaces = useMemo(() => {
    if (!searchQuery) return spaces;
    return spaces.filter((space) =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [spaces, searchQuery]);

  const stats = useMemo(
    () => ({
      total: spaces.length,
      privateCount: spaces.filter((space) => space.privacy === 'private').length,
      shared: spaces.filter((space) => space.privacy !== 'private').length,
    }),
    [spaces]
  );

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
      });
      setShowCreate(false);
      setSpaceName('');
      setSpaceDescription('');
      setSpacePrivacy('private');
      setSpaceIcon('rocket');
      setSpaceColor(COLOR_OPTIONS[0]);
    } catch (error: any) {
      Alert.alert('Could not create space', error?.message || 'Try again.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Spaces</Text>
            <Text style={styles.subtitle}>Your workspaces and shared hubs</Text>
          </View>
          <TouchableOpacity style={[styles.createButton, { backgroundColor: accentHex }]} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={20} color={theme.colors.base} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.privateCount}</Text>
            <Text style={styles.statLabel}>Private</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.shared}</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={theme.colors.textSubtle} />
          <TextInput
            placeholder="Search spaces"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {filteredSpaces.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.iconWrap}>
              <Ionicons name="apps-outline" size={40} color={theme.colors.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>No spaces yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first space or join one to get started.
            </Text>
            <TouchableOpacity style={[styles.emptyButton, { backgroundColor: accentHex }]} onPress={() => setShowCreate(true)}>
              <Text style={styles.emptyButtonText}>Create a space</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.spaceList}>
            {filteredSpaces.map((space, index) => {
              const color = resolveSpaceColor(space, index);
              const iconName = SPACE_ICON_MAP[space.icon || space.type || 'rocket'] || 'rocket-outline';
              const privacyOption = PRIVACY_OPTIONS.find((option) => option.value === space.privacy);

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
                        <Ionicons name="people-outline" size={12} color={theme.colors.textSubtle} />
                      <Text style={styles.spaceMetaText}>
                        {(space.members_count ?? space.member_count ?? 0)} members
                      </Text>
                      </View>
                      {privacyOption && (
                        <View style={styles.spaceMetaItem}>
                          <Ionicons name={privacyOption.icon as any} size={12} color={theme.colors.textSubtle} />
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
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCreate(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Space</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

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
              placeholder="Optional description"
              placeholderTextColor={theme.colors.textSubtle}
              style={[styles.input, styles.inputMultiline]}
              value={spaceDescription}
              onChangeText={setSpaceDescription}
              multiline
            />

            <Text style={styles.inputLabel}>Privacy</Text>
            <View style={styles.optionRow}>
              {PRIVACY_OPTIONS.map((option) => {
                const isActive = spacePrivacy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionChip, isActive && { backgroundColor: theme.colors.surface }]}
                    onPress={() => setSpacePrivacy(option.value)}
                  >
                    <Ionicons name={option.icon as any} size={14} color={isActive ? accentHex : theme.colors.textSubtle} />
                    <Text style={[styles.optionText, isActive && { color: theme.colors.textPrimary }]}>
                      {option.label}
                    </Text>
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
                    style={[styles.iconChip, isActive && { backgroundColor: theme.colors.surface }]}
                    onPress={() => setSpaceIcon(option.value)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={16}
                      color={isActive ? accentHex : theme.colors.textSubtle}
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
                  />
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 6,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  spaceList: {
    gap: 12,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  spaceIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  spaceContent: {
    flex: 1,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  spaceDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
  spaceMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
    marginTop: 40,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDescription: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 240,
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: theme.colors.base,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.base,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  optionText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: '600',
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  colorChipActive: {
    borderWidth: 2,
    borderColor: theme.colors.base,
  },
  createSpaceButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createSpaceButtonText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 14,
  },
});

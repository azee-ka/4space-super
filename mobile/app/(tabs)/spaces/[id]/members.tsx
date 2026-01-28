import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSpaceMembers } from '../../../../src/hooks/useSpaces';
import { LoadingSpinner, Avatar } from '../../../../src/components/ui';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

type RoleType = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

const ROLE_OPTIONS: Array<{ value: RoleType; label: string; description: string; icon: string; color: string }> = [
  { value: 'owner', label: 'Owner', description: 'Full control over space', icon: 'shield-checkmark', color: '#ef4444' },
  { value: 'admin', label: 'Admin', description: 'Manage members and settings', icon: 'key', color: '#f59e0b' },
  { value: 'editor', label: 'Editor', description: 'Create and edit content', icon: 'create', color: '#10b981' },
  { value: 'commenter', label: 'Commenter', description: 'View and comment', icon: 'chatbubble', color: '#3b82f6' },
  { value: 'viewer', label: 'Viewer', description: 'View only', icon: 'eye', color: '#6b7280' },
];

export default function SpaceMembersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaceId = Array.isArray(id) ? id[0] : id;
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { data: members = [], isLoading } = useSpaceMembers(spaceId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const filteredMembers = members.filter((member) => {
    const name = member.user?.display_name || member.user?.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRoleInfo = (role: string) => {
    return ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[4];
  };

  const handleChangeMemberRole = (newRole: RoleType) => {
    // TODO: Implement role change mutation
    console.log('Change role to:', newRole, 'for member:', selectedMember?.id);
    setShowRoleModal(false);
    setSelectedMember(null);
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Implement remove member mutation
    console.log('Remove member:', memberId);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Members</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: accentHex }]}
          onPress={() => router.push(`/spaces/${spaceId}/invite` as any)}
        >
          <Ionicons name="person-add" size={18} color={theme.colors.base} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={theme.colors.textSubtle} />
          <TextInput
            placeholder="Search members..."
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSubtle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.length}</Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.filter((m) => m.role === 'admin' || m.role === 'owner').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.filter((m) => m.role === 'editor').length}</Text>
          <Text style={styles.statLabel}>Editors</Text>
        </View>
      </View>

      {/* Members List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>All Members ({filteredMembers.length})</Text>

        {filteredMembers.map((member, index) => {
          const roleInfo = getRoleInfo(member.role);
          const isLastItem = index === filteredMembers.length - 1;

          return (
            <View key={member.id} style={[styles.memberCard, !isLastItem && styles.memberCardBorder]}>
              <Avatar
                uri={member.user?.avatar_url}
                name={member.user?.display_name || member.user?.email || 'User'}
                seed={member.user?.id || member.id}
                size="md"
              />
              <View style={styles.memberContent}>
                <Text style={styles.memberName}>
                  {member.user?.display_name || member.user?.email || 'Unknown User'}
                </Text>
                <View style={styles.memberMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '20' }]}>
                    <Ionicons name={roleInfo.icon as any} size={11} color={roleInfo.color} />
                    <Text style={[styles.roleText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
                  </View>
                  <Text style={styles.memberDate}>
                    Joined {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.memberAction}
                onPress={() => {
                  setSelectedMember(member);
                  setShowRoleModal(true);
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSubtle} />
              </TouchableOpacity>
            </View>
          );
        })}

        {filteredMembers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={theme.colors.textSubtle} />
            <Text style={styles.emptyTitle}>No members found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search' : 'Invite members to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Role Change Modal */}
      <Modal visible={showRoleModal} transparent animationType="slide" onRequestClose={() => setShowRoleModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRoleModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Member</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <View style={styles.modalMemberInfo}>
                <Avatar
                  uri={selectedMember.user?.avatar_url}
                  name={selectedMember.user?.display_name || selectedMember.user?.email || 'User'}
                  seed={selectedMember.user?.id || selectedMember.id}
                  size="lg"
                />
                <View style={styles.modalMemberContent}>
                  <Text style={styles.modalMemberName}>
                    {selectedMember.user?.display_name || selectedMember.user?.email}
                  </Text>
                  <Text style={styles.modalMemberEmail}>{selectedMember.user?.email}</Text>
                </View>
              </View>
            )}

            <Text style={styles.modalSectionTitle}>Change Role</Text>
            <ScrollView style={styles.rolesList} showsVerticalScrollIndicator={false}>
              {ROLE_OPTIONS.map((role) => {
                const isSelected = selectedMember?.role === role.value;
                return (
                  <TouchableOpacity
                    key={role.value}
                    style={[styles.roleOption, isSelected && { backgroundColor: theme.colors.surface }]}
                    onPress={() => handleChangeMemberRole(role.value)}
                  >
                    <View style={[styles.roleIconWrap, { backgroundColor: role.color + '20' }]}>
                      <Ionicons name={role.icon as any} size={18} color={role.color} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleLabel}>{role.label}</Text>
                      <Text style={styles.roleDescription}>{role.description}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={accentHex} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.removeMemberButton}
              onPress={() => {
                if (selectedMember) {
                  handleRemoveMember(selectedMember.id);
                  setShowRoleModal(false);
                }
              }}
            >
              <Ionicons name="person-remove-outline" size={18} color="#ef4444" />
              <Text style={styles.removeMemberText}>Remove from space</Text>
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
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  memberCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  memberContent: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberDate: {
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  memberAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    textAlign: 'center',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  modalMemberContent: {
    flex: 1,
    marginLeft: 12,
  },
  modalMemberName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalMemberEmail: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  rolesList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleContent: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  roleDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  removeMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef444420',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  removeMemberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
});

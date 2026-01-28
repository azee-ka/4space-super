import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSpace } from '../../../../src/hooks/useSpaces';
import { LoadingSpinner } from '../../../../src/components/ui';
import { useThemeStore } from '../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../src/utils/themeUtils';
import { theme } from '../../../../src/styles/theme';

type RoleType = 'admin' | 'editor' | 'commenter' | 'viewer';

const ROLE_OPTIONS: Array<{ value: RoleType; label: string; description: string; icon: string; color: string }> = [
  { value: 'admin', label: 'Admin', description: 'Manage members and settings', icon: 'key-outline', color: '#f59e0b' },
  { value: 'editor', label: 'Editor', description: 'Create and edit content', icon: 'create-outline', color: '#10b981' },
  { value: 'commenter', label: 'Commenter', description: 'View and comment', icon: 'chatbubble-outline', color: '#3b82f6' },
  { value: 'viewer', label: 'Viewer', description: 'View only access', icon: 'eye-outline', color: '#6b7280' },
];

export default function SpaceInviteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const spaceId = Array.isArray(id) ? id[0] : id;
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);

  const { data: space, isLoading } = useSpace(spaceId);

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('editor');
  const [inviteLink] = useState(`https://app.4space.com/invite/${spaceId}`); // Mock link

  const handleSendInvite = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter an email address');
      return;
    }

    // TODO: Implement send invite mutation
    Alert.alert('Invite Sent', `Invitation sent to ${email}`);
    setEmail('');
  };

  const handleCopyLink = async () => {
    // TODO: Implement actual clipboard copy
    Alert.alert('Link Copied', 'Invite link copied to clipboard');
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join ${space?.name || 'our space'} on 4Space!\n\n${inviteLink}`,
        title: `Invite to ${space?.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!space) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Members</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Space Info */}
        <View style={styles.spaceCard}>
          <View style={styles.spaceCardContent}>
            <Text style={styles.spaceCardLabel}>Inviting to</Text>
            <Text style={styles.spaceCardName}>{space.name}</Text>
            <Text style={styles.spaceCardDescription}>{space.description || 'No description'}</Text>
          </View>
        </View>

        {/* Invite by Email */}
        <Text style={styles.sectionTitle}>Invite by Email</Text>
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="colleague@company.com"
            placeholderTextColor={theme.colors.textSubtle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.inputLabel}>Role</Text>
          <View style={styles.rolesList}>
            {ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRole === role.value;
              return (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    isSelected && { backgroundColor: theme.colors.surface, borderColor: accentHex },
                  ]}
                  onPress={() => setSelectedRole(role.value)}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: role.color + '20' }]}>
                    <Ionicons name={role.icon as any} size={18} color={role.color} />
                  </View>
                  <View style={styles.roleContent}>
                    <Text style={[styles.roleLabel, isSelected && { color: theme.colors.textPrimary }]}>
                      {role.label}
                    </Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={accentHex} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: accentHex }]}
            onPress={handleSendInvite}
          >
            <Ionicons name="mail-outline" size={18} color={theme.colors.base} />
            <Text style={styles.sendButtonText}>Send Invitation</Text>
          </TouchableOpacity>
        </View>

        {/* Invite Link */}
        <Text style={styles.sectionTitle}>Invite Link</Text>
        <View style={styles.section}>
          <Text style={styles.linkLabel}>Share this link to invite people</Text>

          <View style={styles.linkContainer}>
            <View style={styles.linkBox}>
              <Ionicons name="link-outline" size={16} color={theme.colors.textSubtle} />
              <Text style={styles.linkText} numberOfLines={1}>{inviteLink}</Text>
            </View>
          </View>

          <View style={styles.linkActions}>
            <TouchableOpacity style={styles.linkAction} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.linkActionText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkAction} onPress={handleShareLink}>
              <Ionicons name="share-outline" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.linkActionText}>Share Link</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={accentHex} />
            <Text style={styles.infoText}>
              Anyone with this link can join the space with the default role
            </Text>
          </View>
        </View>

        {/* Quick Invite Options */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionLeft}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="qr-code-outline" size={20} color="#3b82f6" />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionLabel}>QR Code</Text>
                <Text style={styles.quickActionDescription}>Share via QR code</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.quickActionDivider} />

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push(`/spaces/${spaceId}/members` as any)}
          >
            <View style={styles.quickActionLeft}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="people-outline" size={20} color="#10b981" />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionLabel}>Manage Members</Text>
                <Text style={styles.quickActionDescription}>View and edit member roles</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.quickActionDivider} />

          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionLeft}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="time-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionLabel}>Pending Invites</Text>
                <Text style={styles.quickActionDescription}>View sent invitations</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
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
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  spaceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  spaceCardContent: {
    alignItems: 'center',
  },
  spaceCardLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginBottom: 6,
  },
  spaceCardName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  spaceCardDescription: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSubtle,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  rolesList: {
    gap: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  roleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleContent: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  sendButtonText: {
    color: theme.colors.base,
    fontWeight: '700',
    fontSize: 15,
  },
  linkLabel: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginBottom: 12,
  },
  linkContainer: {
    marginBottom: 16,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 14,
    borderRadius: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  linkAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  linkActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 17,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  quickActionDescription: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  quickActionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

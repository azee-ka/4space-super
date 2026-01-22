import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { Avatar, Button } from '../../../src/components/ui';
import { useThemeStore } from '../../../src/store/themeStore';
import { getAccentColorHex } from '../../../src/utils/themeUtils';
import { theme } from '../../../src/styles/theme';
import { supabase } from '../../../src/lib/supabase';

export default function ProfileSettingsScreen() {
  const { user, setUser } = useAuthStore();
  const { accentColor } = useThemeStore();
  const accentHex = getAccentColorHex(accentColor);
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState((user as any)?.bio || '');
  const [website, setWebsite] = useState((user as any)?.website || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.display_name || '');
    setUsername(user.username || '');
    setBio((user as any)?.bio || '');
    setWebsite((user as any)?.website || '');
  }, [user]);

  const bioLimit = 160;
  const bioCount = bio.length;

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!username.trim()) {
      Alert.alert('Username required', 'Please choose a username to continue.');
      return;
    }
    setSavingProfile(true);
    try {
      const updates = {
        display_name: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        website: website.trim(),
      };
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;
      setUser(data as any);
      Alert.alert('Profile updated', 'Your changes are saved.');
    } catch (error: any) {
      Alert.alert('Update failed', error?.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleReset = () => {
    if (!user) return;
    setDisplayName(user.display_name || '');
    setUsername(user.username || '');
    setBio((user as any)?.bio || '');
    setWebsite((user as any)?.website || '');
  };

  const handleShareProfile = async () => {
    const link = user?.username ? `https://4space.app/u/${user.username}` : 'https://4space.app';
    try {
      await Share.share({ message: `My 4Space profile: ${link}` });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to open the share sheet.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileCard}>
          <Avatar
            uri={user?.avatar_url}
            name={user?.display_name || user?.username}
            seed={user?.id}
            size="xl"
          />
          <Text style={styles.displayName}>{user?.display_name || user?.username}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <View style={styles.profileActions}>
            <Button
              title="Share Profile"
              onPress={handleShareProfile}
              size="sm"
              variant="secondary"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Identity</Text>
        <View style={styles.section}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Display name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor={theme.colors.textSubtle}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={theme.colors.textSubtle}
              autoCapitalize="none"
              style={styles.input}
            />
            <Text style={styles.helperText}>Your profile link: 4space.app/u/{username || 'username'}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Short bio"
              placeholderTextColor={theme.colors.textSubtle}
              style={[styles.input, styles.inputMultiline]}
              multiline
              maxLength={bioLimit}
            />
            <Text style={styles.helperText}>{bioCount}/{bioLimit} characters</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Website</Text>
            <TextInput
              value={website}
              onChangeText={setWebsite}
              placeholder="https://"
              placeholderTextColor={theme.colors.textSubtle}
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Profile Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewAvatar}>
              <Avatar
                uri={user?.avatar_url}
                name={displayName || username}
                seed={user?.id}
                size="md"
              />
            </View>
            <View style={styles.previewMeta}>
              <Text style={styles.previewName}>{displayName || 'Display name'}</Text>
              <Text style={styles.previewHandle}>@{username || 'username'}</Text>
            </View>
            <View style={styles.previewAccent}>
              <View style={[styles.accentDot, { backgroundColor: accentHex }]} />
            </View>
          </View>
          <Text style={styles.previewBio}>{bio || 'Your bio will appear here.'}</Text>
          {website ? <Text style={styles.previewLink}>{website}</Text> : null}
        </View>

        <View style={styles.actionRow}>
          <Button
            title={savingProfile ? 'Saving...' : 'Save Changes'}
            onPress={handleSaveProfile}
            loading={savingProfile}
            fullWidth
          />
        </View>
        <View style={styles.secondaryActions}>
          <Button title="Discard Changes" onPress={handleReset} size="sm" variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 10,
  },
  username: {
    color: theme.colors.textMuted,
    marginTop: 4,
    fontSize: 13,
  },
  profileActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    marginTop: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  helperText: {
    marginTop: 6,
    fontSize: 11,
    color: theme.colors.textSubtle,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewAvatar: {
    marginRight: 10,
  },
  previewMeta: {
    flex: 1,
  },
  previewName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  previewHandle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  previewAccent: {
    width: 28,
    alignItems: 'flex-end',
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  previewBio: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  previewLink: {
    marginTop: 6,
    color: theme.colors.accent,
    fontSize: 12,
  },
  actionRow: {
    marginTop: 20,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
});

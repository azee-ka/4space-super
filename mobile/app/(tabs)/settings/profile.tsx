import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Share, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
  const [location, setLocation] = useState((user as any)?.location || '');
  const [pronoun, setPronoun] = useState((user as any)?.pronoun || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.display_name || '');
    setUsername(user.username || '');
    setBio((user as any)?.bio || '');
    setWebsite((user as any)?.website || '');
    setLocation((user as any)?.location || '');
    setPronoun((user as any)?.pronoun || '');
  }, [user]);

  const bioLimit = 160;
  const bioCount = bio.length;
  const hasChanges =
    displayName !== (user?.display_name || '') ||
    username !== (user?.username || '') ||
    bio !== ((user as any)?.bio || '') ||
    website !== ((user as any)?.website || '') ||
    location !== ((user as any)?.location || '') ||
    pronoun !== ((user as any)?.pronoun || '');

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!username.trim()) {
      // In a real app, show a toast notification
      console.warn('Username required');
      return;
    }
    setSavingProfile(true);
    try {
      const updates = {
        display_name: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        website: website.trim(),
        location: location.trim(),
        pronoun: pronoun.trim(),
      };
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;
      setUser(data as any);
      // In a real app, show a success toast
      console.log('Profile updated successfully');
    } catch (error: any) {
      // In a real app, show an error toast
      console.error('Update failed:', error?.message);
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
    setLocation((user as any)?.location || '');
    setPronoun((user as any)?.pronoun || '');
  };

  const handleShareProfile = async () => {
    const link = user?.username ? `https://4space.app/u/${user.username}` : 'https://4space.app';
    try {
      await Share.share({ message: `Check out my 4Space profile: ${link}` });
    } catch (error) {
      // In a real app, show an error toast
      console.error('Share failed');
    }
  };

  const handleCopyProfileLink = () => {
    // In a real app, you'd use Clipboard.setString(link) and show a toast
    console.log('Profile link copied');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Identity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.profileCard}>
              <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.7}>
                <Avatar
                  uri={user?.avatar_url}
                  name={user?.display_name || user?.username}
                  seed={user?.id}
                  size="xl"
                />
                <View style={[styles.avatarBadge, { backgroundColor: accentHex }]}>
                  <Ionicons name="camera" size={16} color={theme.colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.cardDisplayName}>{user?.display_name || user?.username}</Text>
              <Text style={styles.cardUsername}>@{user?.username}</Text>
              <View style={styles.profileActions}>
                <Button
                  title="Share"
                  onPress={handleShareProfile}
                  size="sm"
                  variant="secondary"
                />
                <Button
                  title="Copy Link"
                  onPress={handleCopyProfileLink}
                  size="sm"
                  variant="secondary"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.section}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Display Name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your display name"
                  placeholderTextColor={theme.colors.textSubtle}
                  style={styles.input}
                  returnKeyType="next"
                />
                <Text style={styles.helperText}>This is how others will see you</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Username</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputPrefixContainer}>
                    <Text style={styles.inputPrefix}>@</Text>
                  </View>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="username"
                    placeholderTextColor={theme.colors.textSubtle}
                    autoCapitalize="none"
                    style={[styles.input, styles.inputWithPrefix]}
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.linkPreview}>
                  <Ionicons name="link-outline" size={14} color={accentHex} />
                  <Text style={[styles.helperText, { color: accentHex, marginLeft: 4, marginTop: 0 }]}>
                    4space.app/u/{username || 'username'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>Bio</Text>
                  <Text style={[
                    styles.charCount,
                    bioCount > bioLimit - 20 && bioCount < bioLimit && { color: accentHex },
                    bioCount >= bioLimit && { color: '#ef4444' }
                  ]}>
                    {bioCount}/{bioLimit}
                  </Text>
                </View>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell people a bit about yourself"
                  placeholderTextColor={theme.colors.textSubtle}
                  style={[styles.input, styles.inputMultiline]}
                  multiline
                  maxLength={bioLimit}
                  textAlignVertical="top"
                  returnKeyType="default"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Pronouns</Text>
                <TextInput
                  value={pronoun}
                  onChangeText={setPronoun}
                  placeholder="e.g., they/them, she/her, he/him"
                  placeholderTextColor={theme.colors.textSubtle}
                  autoCapitalize="none"
                  style={styles.input}
                  returnKeyType="next"
                />
                <Text style={styles.helperText}>Optional, helps people address you correctly</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Location</Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, Country"
                  placeholderTextColor={theme.colors.textSubtle}
                  style={styles.input}
                  returnKeyType="next"
                />
                <Text style={styles.helperText}>Where you're based</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Website</Text>
                <TextInput
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor={theme.colors.textSubtle}
                  autoCapitalize="none"
                  keyboardType="url"
                  style={styles.input}
                  returnKeyType="done"
                />
                <Text style={styles.helperText}>Link to your website or portfolio</Text>
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
                  <Text style={styles.previewHandle}>
                    @{username || 'username'}
                    {pronoun && <Text style={styles.previewPronoun}> • {pronoun}</Text>}
                  </Text>
                </View>
                <View style={styles.previewAccent}>
                  <View style={[styles.accentDot, { backgroundColor: accentHex }]} />
                </View>
              </View>
              {bio && <Text style={styles.previewBio}>{bio}</Text>}
              <View style={styles.previewMetaRow}>
                {location && (
                  <View style={styles.previewMetaItem}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.textSubtle} />
                    <Text style={styles.previewMetaText}>{location}</Text>
                  </View>
                )}
                {website && (
                  <View style={styles.previewMetaItem}>
                    <Ionicons name="link-outline" size={14} color={accentHex} />
                    <Text style={[styles.previewMetaText, { color: accentHex }]}>{website}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              <Button
                title={savingProfile ? 'Saving...' : 'Save Changes'}
                onPress={handleSaveProfile}
                loading={savingProfile}
                disabled={!hasChanges}
                fullWidth
              />
            </View>
            {hasChanges && (
              <View style={styles.secondaryActions}>
                <Button title="Discard Changes" onPress={handleReset} size="sm" variant="secondary" />
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.base,
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
  headerSpacer: {
    width: 36,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  cardDisplayName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 14,
  },
  cardUsername: {
    color: theme.colors.textMuted,
    marginTop: 4,
    fontSize: 14,
  },
  profileActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSubtle,
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  field: {
    marginBottom: 0,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    color: theme.colors.textSubtle,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSubtle,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPrefixContainer: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputWithPrefix: {
    paddingLeft: 28,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.textSubtle,
    lineHeight: 16,
  },
  linkPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewAvatar: {
    marginRight: 12,
  },
  previewMeta: {
    flex: 1,
  },
  previewName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  previewHandle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  previewPronoun: {
    color: theme.colors.textSubtle,
    fontSize: 12,
  },
  previewAccent: {
    width: 28,
    alignItems: 'flex-end',
  },
  accentDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  previewBio: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewMetaText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
  },
  actionRow: {
    marginTop: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
});

// services/spaces.service.ts
import { supabase } from '../lib/supabase';
import type { Space } from '@4space/shared';

export interface CreateSpaceInput {
  name: string;
  description?: string;
  type?: 'personal' | 'couple' | 'team' | 'portfolio' | 'community' | 'custom';
  privacy?: 'private' | 'shared' | 'team' | 'public' | 'unlisted';
  icon?: string;
  color?: string;
}

export interface UpdateSpaceInput extends Partial<CreateSpaceInput> {
  id: string;
}

export interface SpaceStats {
  messages: number;
  files: number;
  tasks: number;
  members: number;
  activeToday: number;
  storageUsed: number;
}

/**
 * Ensure user has a profile before creating a space
 */
async function ensureProfileExists() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  // If no profile, create one
  if (!profile) {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0] || 'user',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      });

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  return user;
}

/**
 * Get all user's spaces
 */
export async function getUserSpaces(): Promise<Space[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_user_spaces');

  if (error) throw error;
  return data || [];
}

/**
 * Get a single space by ID
 */
export async function getSpaceById(spaceId: string): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      space_members!inner(user_id, role)
    `)
    .eq('id', spaceId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Space not found');

  return data as Space;
}

/**
 * Create a new space
 */
export async function createSpace(input: CreateSpaceInput): Promise<Space> {
  // Ensure profile exists before creating space
  const user = await ensureProfileExists();

  const { data, error } = await supabase
    .from('spaces')
    .insert({
      name: input.name,
      description: input.description,
      type: input.type || 'custom',
      privacy: input.privacy || 'private',
      icon: input.icon,
      color: input.color,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating space:', error);
    throw error;
  }

  return data;
}

/**
 * Update a space
 */
export async function updateSpace(input: UpdateSpaceInput): Promise<Space> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from('spaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a space
 */
export async function deleteSpace(spaceId: string): Promise<void> {
  const { error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', spaceId);

  if (error) throw error;
}

/**
 * Get space statistics
 */
export async function getSpaceStats(spaceId: string): Promise<SpaceStats> {
  const [messagesResult, membersResult] = await Promise.all([
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('space_id', spaceId),
    supabase
      .from('space_members')
      .select('id', { count: 'exact', head: true })
      .eq('space_id', spaceId),
  ]);

  return {
    messages: messagesResult.count || 0,
    files: 0, // TODO: Add files table query
    tasks: 0, // TODO: Add tasks table query
    members: membersResult.count || 1,
    activeToday: 0, // TODO: Calculate from activity
    storageUsed: 0, // TODO: Calculate from files
  };
}

/**
 * Convert space privacy
 */
export async function convertSpacePrivacy(
  spaceId: string,
  targetPrivacy: 'private' | 'shared' | 'team' | 'public'
): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .update({ privacy: targetPrivacy })
    .eq('id', spaceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if user is space member
 */
export async function checkSpaceMembership(spaceId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('space_members')
    .select('id')
    .eq('space_id', spaceId)
    .eq('user_id', user.id)
    .single();

  return !!data && !error;
}

/**
 * Get space members
 */
export async function getSpaceMembers(spaceId: string) {
  const { data, error } = await supabase
    .from('space_members')
    .select(`
      id,
      role,
      joined_at,
      user:profiles(id, email, username, display_name, avatar_url)
    `)
    .eq('space_id', spaceId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
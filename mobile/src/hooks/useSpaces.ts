import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Space } from '../types';

export interface CreateSpaceInput {
  name: string;
  description?: string;
  type?: 'personal' | 'couple' | 'team' | 'portfolio' | 'community' | 'custom' | 'project';
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

export interface SpaceMember {
  id: string;
  role: 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';
  joined_at: string;
  user: {
    id: string;
    email: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: (filters?: string) => [...spaceKeys.lists(), { filters }] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...spaceKeys.details(), id] as const,
  stats: (id: string) => [...spaceKeys.detail(id), 'stats'] as const,
  members: (id: string) => [...spaceKeys.detail(id), 'members'] as const,
};

const ensureProfileExists = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

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
};

const getUserSpaces = async (): Promise<Space[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_user_spaces');
  if (error) throw error;
  return data || [];
};

const getSpaceById = async (spaceId: string): Promise<Space> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: membership } = await supabase
    .from('space_members')
    .select('id')
    .eq('space_id', spaceId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    throw new Error('Access denied: You are not a member of this space');
  }

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
};

const getSpaceStats = async (spaceId: string): Promise<SpaceStats> => {
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
    files: 0,
    tasks: 0,
    members: membersResult.count || 1,
    activeToday: 0,
    storageUsed: 0,
  };
};

const getSpaceMembers = async (spaceId: string): Promise<SpaceMember[]> => {
  const { data, error } = await supabase
    .from('space_members')
    .select(`
      id,
      role,
      joined_at,
      user:profiles(id, email, username, display_name, avatar_url)
    `)
    .eq('space_id', spaceId);

  if (error) throw error;
  return (data as SpaceMember[]) || [];
};

export const useSpaces = () =>
  useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: getUserSpaces,
    staleTime: 1000 * 60 * 5,
  });

export const useSpace = (spaceId: string | undefined) =>
  useQuery({
    queryKey: spaceKeys.detail(spaceId || ''),
    queryFn: () => getSpaceById(spaceId || ''),
    enabled: !!spaceId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Access denied')) {
        return false;
      }
      return failureCount < 2;
    },
  });

export const useSpaceStats = (spaceId: string | undefined) =>
  useQuery({
    queryKey: spaceKeys.stats(spaceId || ''),
    queryFn: () => getSpaceStats(spaceId || ''),
    enabled: !!spaceId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

export const useSpaceMembers = (spaceId: string | undefined) =>
  useQuery({
    queryKey: spaceKeys.members(spaceId || ''),
    queryFn: () => getSpaceMembers(spaceId || ''),
    enabled: !!spaceId,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSpaceInput) => {
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

      if (error) throw error;
      return data as Space;
    },
    onSuccess: (newSpace) => {
      queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) => [
        newSpace,
        ...old,
      ]);
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
    },
  });
};

export const useUpdateSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSpaceInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('spaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Space;
    },
    onSuccess: (updatedSpace) => {
      queryClient.setQueryData(spaceKeys.detail(updatedSpace.id), updatedSpace);
      queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) =>
        old.map((space) => (space.id === updatedSpace.id ? updatedSpace : space))
      );
      queryClient.invalidateQueries({ queryKey: spaceKeys.detail(updatedSpace.id) });
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
    },
  });
};

export const useDeleteSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spaceId: string) => {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', spaceId);

      if (error) throw error;
    },
    onSuccess: (_, spaceId) => {
      queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) =>
        old.filter((space) => space.id !== spaceId)
      );
      queryClient.removeQueries({ queryKey: spaceKeys.detail(spaceId) });
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
    },
  });
};

export const useConvertSpacePrivacy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spaceId,
      targetPrivacy,
    }: {
      spaceId: string;
      targetPrivacy: 'private' | 'shared' | 'team' | 'public';
    }) => {
      const { data, error } = await supabase
        .from('spaces')
        .update({ privacy: targetPrivacy })
        .eq('id', spaceId)
        .select()
        .single();

      if (error) throw error;
      return data as Space;
    },
    onSuccess: (updatedSpace) => {
      queryClient.setQueryData(spaceKeys.detail(updatedSpace.id), updatedSpace);
      queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) =>
        old.map((space) => (space.id === updatedSpace.id ? updatedSpace : space))
      );
      queryClient.invalidateQueries({ queryKey: spaceKeys.detail(updatedSpace.id) });
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
    },
  });
};

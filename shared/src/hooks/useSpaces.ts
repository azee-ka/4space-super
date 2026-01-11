// shared/src/hooks/useSpaces.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SpacesService, type CreateSpaceInput, type UpdateSpaceInput, type SpaceStats } from '../services/spaces.service';
import type { Space } from '../types';

// Query keys factory
export const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: (filters?: string) => [...spaceKeys.lists(), { filters }] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...spaceKeys.details(), id] as const,
  stats: (id: string) => [...spaceKeys.detail(id), 'stats'] as const,
  members: (id: string) => [...spaceKeys.detail(id), 'members'] as const,
};

/**
 * Factory function to create hooks with supabase client
 */
export function createSpaceHooks(supabase: SupabaseClient) {
  const spacesService = new SpacesService(supabase);

  /**
   * Get all user's spaces
   */
  function useSpaces() {
    return useQuery({
      queryKey: spaceKeys.lists(),
      queryFn: () => spacesService.getUserSpaces(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }

  /**
   * Get a single space by ID
   */
  function useSpace(spaceId: string | undefined) {
    return useQuery({
      queryKey: spaceKeys.detail(spaceId!),
      queryFn: () => spacesService.getSpaceById(spaceId!),
      enabled: !!spaceId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on access denied errors
        if (error?.message?.includes('Access denied')) {
          return false;
        }
        return failureCount < 2;
      },
    });
  }

  /**
   * Get space statistics
   */
  function useSpaceStats(spaceId: string | undefined) {
    return useQuery({
      queryKey: spaceKeys.stats(spaceId!),
      queryFn: () => spacesService.getSpaceStats(spaceId!),
      enabled: !!spaceId,
      staleTime: 1000 * 30, // 30 seconds
      refetchInterval: 1000 * 60, // Refetch every minute
    });
  }

  /**
   * Get space members
   */
  function useSpaceMembers(spaceId: string | undefined) {
    return useQuery({
      queryKey: spaceKeys.members(spaceId!),
      queryFn: () => spacesService.getSpaceMembers(spaceId!),
      enabled: !!spaceId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  }

  /**
   * Create a new space
   */
  function useCreateSpace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (input: CreateSpaceInput) => spacesService.createSpace(input),
      onSuccess: (newSpace) => {
        // Add to cached list
        queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) => [
          newSpace,
          ...old,
        ]);

        // Invalidate to refetch
        queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      },
    });
  }

  /**
   * Update a space
   */
  function useUpdateSpace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (input: UpdateSpaceInput) => spacesService.updateSpace(input),
      onSuccess: (updatedSpace) => {
        // Update detail cache
        queryClient.setQueryData(
          spaceKeys.detail(updatedSpace.id),
          updatedSpace
        );

        // Update in list
        queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) =>
          old.map((space) =>
            space.id === updatedSpace.id ? updatedSpace : space
          )
        );

        // Invalidate to ensure consistency
        queryClient.invalidateQueries({ queryKey: spaceKeys.detail(updatedSpace.id) });
        queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      },
    });
  }

  /**
   * Delete a space
   */
  function useDeleteSpace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (spaceId: string) => spacesService.deleteSpace(spaceId),
      onSuccess: (_, spaceId) => {
        // Remove from list
        queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) =>
          old.filter((space) => space.id !== spaceId)
        );

        // Remove detail cache
        queryClient.removeQueries({ queryKey: spaceKeys.detail(spaceId) });

        // Invalidate
        queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      },
    });
  }

  /**
   * Convert space privacy
   */
  function useConvertSpacePrivacy() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        spaceId,
        targetPrivacy,
      }: {
        spaceId: string;
        targetPrivacy: 'private' | 'shared' | 'team' | 'public';
      }) => spacesService.convertSpacePrivacy(spaceId, targetPrivacy),
      onSuccess: (updatedSpace) => {
        // Update caches
        queryClient.setQueryData(
          spaceKeys.detail(updatedSpace.id),
          updatedSpace
        );

        queryClient.setQueryData<Space[]>(spaceKeys.lists(), (old = []) =>
          old.map((space) =>
            space.id === updatedSpace.id ? updatedSpace : space
          )
        );

        // Invalidate
        queryClient.invalidateQueries({ queryKey: spaceKeys.detail(updatedSpace.id) });
        queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      },
    });
  }

  return {
    useSpaces,
    useSpace,
    useSpaceStats,
    useSpaceMembers,
    useCreateSpace,
    useUpdateSpace,
    useDeleteSpace,
    useConvertSpacePrivacy,
  };
}
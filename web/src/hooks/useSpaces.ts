// hooks/useSpaces.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpaceStats,
  convertSpacePrivacy,
  getSpaceMembers,
  type CreateSpaceInput,
  type UpdateSpaceInput,
  type SpaceStats,
} from '../services/spaces.service';
import type { Space } from '@4space/shared';

// Query keys
export const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: (filters: string) => [...spaceKeys.lists(), { filters }] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...spaceKeys.details(), id] as const,
  stats: (id: string) => [...spaceKeys.detail(id), 'stats'] as const,
  members: (id: string) => [...spaceKeys.detail(id), 'members'] as const,
};

/**
 * Get all user's spaces
 */
export function useSpaces() {
  return useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: getUserSpaces,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single space by ID
 */
export function useSpace(spaceId: string | undefined) {
  return useQuery({
    queryKey: spaceKeys.detail(spaceId!),
    queryFn: () => getSpaceById(spaceId!),
    enabled: !!spaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get space statistics
 */
export function useSpaceStats(spaceId: string | undefined) {
  return useQuery({
    queryKey: spaceKeys.stats(spaceId!),
    queryFn: () => getSpaceStats(spaceId!),
    enabled: !!spaceId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Get space members
 */
export function useSpaceMembers(spaceId: string | undefined) {
  return useQuery({
    queryKey: spaceKeys.members(spaceId!),
    queryFn: () => getSpaceMembers(spaceId!),
    enabled: !!spaceId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Create a new space
 */
export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSpaceInput) => createSpace(input),
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
export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSpaceInput) => updateSpace(input),
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
export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (spaceId: string) => deleteSpace(spaceId),
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
export function useConvertSpacePrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      spaceId,
      targetPrivacy,
    }: {
      spaceId: string;
      targetPrivacy: 'private' | 'shared' | 'team' | 'public';
    }) => convertSpacePrivacy(spaceId, targetPrivacy),
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
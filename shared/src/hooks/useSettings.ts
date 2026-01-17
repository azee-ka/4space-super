// shared/src/hooks/useSettings.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type RoomMemberSettings,
  type RoomSettings,
  type SpaceSettings,
  type UserChatSettings,
} from '../types/chatSettings';
import { SettingsService } from '../services/settings.service';

export const settingsKeys = {
  all: ['settings'] as const,
  user: () => [...settingsKeys.all, 'user'] as const,
  spaces: () => [...settingsKeys.all, 'spaces'] as const,
  space: (spaceId: string) => [...settingsKeys.spaces(), spaceId] as const,
  rooms: () => [...settingsKeys.all, 'rooms'] as const,
  room: (roomId: string) => [...settingsKeys.rooms(), roomId] as const,
  roomMember: (roomId: string) => [...settingsKeys.rooms(), roomId, 'member'] as const,
};

export function createSettingsHooks(supabase: SupabaseClient) {
  const settingsService = new SettingsService(supabase);

  function useUserChatSettings() {
    return useQuery({
      queryKey: settingsKeys.user(),
      queryFn: () => settingsService.getUserChatSettings(),
      staleTime: 1000 * 60 * 5,
    });
  }

  function useUpdateUserChatSettings() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (updates: Partial<UserChatSettings>) =>
        settingsService.updateUserChatSettings(updates),
      onSuccess: (settings) => {
        queryClient.setQueryData(settingsKeys.user(), settings);
      },
    });
  }

  function useSpaceSettings(spaceId: string | undefined) {
    return useQuery({
      queryKey: settingsKeys.space(spaceId || 'unknown'),
      queryFn: () => settingsService.getSpaceSettings(spaceId!),
      enabled: !!spaceId,
      staleTime: 1000 * 60 * 5,
    });
  }

  function useUpdateSpaceSettings() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        spaceId,
        updates,
      }: {
        spaceId: string;
        updates: Partial<SpaceSettings>;
      }) => settingsService.updateSpaceSettings(spaceId, updates),
      onSuccess: (settings, variables) => {
        queryClient.setQueryData(settingsKeys.space(variables.spaceId), settings);
      },
    });
  }

  function useRoomSettings(roomId: string | undefined) {
    return useQuery({
      queryKey: settingsKeys.room(roomId || 'unknown'),
      queryFn: () => settingsService.getRoomSettings(roomId!),
      enabled: !!roomId,
      staleTime: 1000 * 60 * 5,
    });
  }

  function useUpdateRoomSettings() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        roomId,
        updates,
      }: {
        roomId: string;
        updates: Partial<RoomSettings>;
      }) => settingsService.updateRoomSettings(roomId, updates),
      onSuccess: (settings, variables) => {
        queryClient.setQueryData(settingsKeys.room(variables.roomId), settings);
      },
    });
  }

  function useUpdateRoomMessageRetention() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        roomId,
        retention,
      }: {
        roomId: string;
        retention: RoomSettings['messageRetention'];
      }) => settingsService.updateRoomMessageRetention(roomId, retention),
      onSuccess: (settings, variables) => {
        queryClient.setQueryData(settingsKeys.room(variables.roomId), settings);
      },
    });
  }

  function useRoomMemberSettings(roomId: string | undefined) {
    return useQuery({
      queryKey: settingsKeys.roomMember(roomId || 'unknown'),
      queryFn: () => settingsService.getRoomMemberSettings(roomId!),
      enabled: !!roomId,
      staleTime: 1000 * 60,
    });
  }

  function useUpdateRoomMemberSettings() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        roomId,
        updates,
      }: {
        roomId: string;
        updates: Partial<RoomMemberSettings>;
      }) => settingsService.updateRoomMemberSettings(roomId, updates),
      onSuccess: (settings, variables) => {
        queryClient.setQueryData(settingsKeys.roomMember(variables.roomId), settings);
      },
    });
  }

  return {
    useUserChatSettings,
    useUpdateUserChatSettings,
    useSpaceSettings,
    useUpdateSpaceSettings,
    useRoomSettings,
    useUpdateRoomSettings,
    useUpdateRoomMessageRetention,
    useRoomMemberSettings,
    useUpdateRoomMemberSettings,
  };
}

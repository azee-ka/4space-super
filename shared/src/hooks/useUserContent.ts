// shared/src/hooks/useUserContent.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

type Tables = Database['public']['Tables'];
type UserNotes = Tables['user_notes']['Row'];
type UserReminders = Tables['user_reminders']['Row'];
type UserSavedMessages = Tables['user_saved_messages']['Row'];
type UserKeptMessages = Tables['user_kept_messages']['Row'];

export function createUserContentHooks(supabase: SupabaseClient) {
  // =====================================================
  // NOTES HOOKS
  // =====================================================

  function useUserNotes() {
    return useQuery({
      queryKey: ['user-notes'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_notes')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
      },
    });
  }

  function useCreateUserNote() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (note: Omit<UserNotes, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        const { data, error } = await supabase
          .from('user_notes')
          .insert([note])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-notes'] });
      },
    });
  }

  function useUpdateUserNote() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<UserNotes, 'id' | 'user_id' | 'created_at'>> }) => {
        const { data, error } = await supabase
          .from('user_notes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-notes'] });
      },
    });
  }

  function useDeleteUserNote() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('user_notes')
          .delete()
          .eq('id', id);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-notes'] });
      },
    });
  }

  // =====================================================
  // REMINDERS HOOKS
  // =====================================================

  function useUserReminders() {
    return useQuery({
      queryKey: ['user-reminders'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_reminders')
          .select('*')
          .order('reminder_time', { ascending: true });

        if (error) throw error;
        return data;
      },
    });
  }

  function useCreateUserReminder() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (reminder: Omit<UserReminders, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        const { data, error } = await supabase
          .from('user_reminders')
          .insert([reminder])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-reminders'] });
      },
    });
  }

  function useUpdateUserReminder() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<UserReminders, 'id' | 'user_id' | 'created_at'>> }) => {
        const { data, error } = await supabase
          .from('user_reminders')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-reminders'] });
      },
    });
  }

  function useDeleteUserReminder() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('user_reminders')
          .delete()
          .eq('id', id);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-reminders'] });
      },
    });
  }

  // =====================================================
  // SAVED MESSAGES HOOKS
  // =====================================================

  function useUserSavedMessages() {
    return useQuery({
      queryKey: ['user-saved-messages'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_saved_messages')
          .select(`
            *,
            message:messages(
              id,
              content,
              created_at,
              conversation:conversations(name, is_group),
              sender:profiles(display_name, username)
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
    });
  }

  function useSaveMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ messageId, note }: { messageId: string; note?: string }) => {
        const { data, error } = await supabase
          .from('user_saved_messages')
          .insert([{ message_id: messageId, note }])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-saved-messages'] });
      },
    });
  }

  function useUnsaveMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (messageId: string) => {
        const { error } = await supabase
          .from('user_saved_messages')
          .delete()
          .eq('message_id', messageId);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-saved-messages'] });
      },
    });
  }

  // =====================================================
  // KEPT MESSAGES HOOKS
  // =====================================================

  function useUserKeptMessages() {
    return useQuery({
      queryKey: ['user-kept-messages'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_kept_messages')
          .select(`
            *,
            message:messages(
              id,
              content,
              created_at,
              conversation:conversations(name, is_group),
              sender:profiles(display_name, username)
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
    });
  }

  function useKeepMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ messageId, note }: { messageId: string; note?: string }) => {
        const { data, error } = await supabase
          .from('user_kept_messages')
          .insert([{ message_id: messageId, note }])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-kept-messages'] });
      },
    });
  }

  function useUnkeepMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (messageId: string) => {
        const { error } = await supabase
          .from('user_kept_messages')
          .delete()
          .eq('message_id', messageId);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-kept-messages'] });
      },
    });
  }

  return {
    // Notes
    useUserNotes,
    useCreateUserNote,
    useUpdateUserNote,
    useDeleteUserNote,

    // Reminders
    useUserReminders,
    useCreateUserReminder,
    useUpdateUserReminder,
    useDeleteUserReminder,

    // Saved Messages
    useUserSavedMessages,
    useSaveMessage,
    useUnsaveMessage,

    // Kept Messages
    useUserKeptMessages,
    useKeepMessage,
    useUnkeepMessage,
  };
}
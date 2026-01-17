// SIMPLIFIED Message Sending - Instant optimistic updates with read receipts
// shared/src/hooks/useSendMessage.ts

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../../web/src/lib/supabase';


interface SendMessageInput {
  room_id: string;
  space_id: string;
  content: string;
  message_type?: string;
  reply_to_id?: string;
  attachments?: any[];
  metadata?: any;
  ttl?: number;
  expires_at?: string;
}

interface Message {
  id: string;
  room_id: string;
  space_id: string;
  sender_id: string;
  content: string;
  reply_to_id?: string;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  read_receipts?: any[];
}

// COMPLETE useSendMessage - Replace this function in shared/src/hooks/useMessages.ts
// This is just the useSendMessage function - keep everything else in the file

/**
 * Send a message with proper optimistic updates and read receipt status
 */
export function useSendMessage() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (input: SendMessageInput) => {
        console.log('[Send] Sending message...');
  
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
  
        const { data, error } = await supabase
          .from('messages')
          .insert({
            room_id: input.room_id,
            space_id: input.space_id,
            sender_id: user.id,
            content: input.content,
          message_type: input.message_type || 'text',
          reply_to_id: input.reply_to_id,
          attachments: input.attachments || [],
          metadata: input.metadata || {},
          is_pinned: false,
          is_system: false,
          ttl: input.ttl,
          expires_at: input.expires_at || null,
          })
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
          `)
          .single();
  
        if (error) {
          console.error('[Send] Error:', error);
          throw error;
        }
  
        console.log('[Send] Success:', data.id);
        return data as Message;
      },
  
      // INSTANT OPTIMISTIC UPDATE
      onMutate: async (variables) => {
        // Get current user and profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
  
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', user.id)
          .single();
  
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: ['messages', 'roomMessages', variables.room_id],
        });
  
        // Snapshot previous state
        const previousMessages = queryClient.getQueryData([
          'messages',
          'roomMessages',
          variables.room_id,
        ]);
  
        // Create optimistic message with SINGLE TICK (empty read_receipts)
        const optimisticMessage: Message = {
          id: `optimistic-${Date.now()}-${Math.random()}`,
          room_id: variables.room_id,
          space_id: variables.space_id,
          sender_id: user.id,
          content: variables.content,
          message_type: variables.message_type,
          reply_to_id: variables.reply_to_id,
          is_pinned: false,
          is_system: false,
          ttl: variables.ttl,
          expires_at: variables.expires_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          attachments: variables.attachments || [],
          sender: profile || undefined,
          read_receipts: [], // EMPTY = SINGLE TICK (sending)
          reactions: [],
        };
  
        console.log('[Send] Adding optimistic message:', optimisticMessage.id);
  
        // Add optimistic message to cache
        queryClient.setQueryData(
          ['messages', 'roomMessages', variables.room_id],
          (old: any) => {
            if (!old?.pages) return old;
  
            const newPages = [...old.pages];
            newPages[0] = [...(newPages[0] || []), optimisticMessage];
  
            return {
              ...old,
              pages: newPages,
            };
          }
        );
  
        return { previousMessages };
      },
  
      // SUCCESS: Replace with real message (DOUBLE TICK)
      onSuccess: (realMessage, variables) => {
        console.log('[Send] Replacing optimistic with real:', realMessage.id);
  
        queryClient.setQueryData(
          ['messages', 'roomMessages', variables.room_id],
          (old: any) => {
            if (!old?.pages) return old;
  
            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map(msg =>
                  msg.id.startsWith('optimistic-') &&
                  msg.content === realMessage.content &&
                  msg.sender_id === realMessage.sender_id
                    ? realMessage // Real message has proper read_receipts = DOUBLE TICK
                    : msg
                )
              ),
            };
          }
        );
  
        // Also scroll to bottom after successful send
        setTimeout(() => {
          const messagesContainer = document.querySelector('[data-messages-container]') as HTMLElement;
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      },
  
      // ERROR: Rollback optimistic update
      onError: (error, variables, context) => {
        console.error('[Send] Failed, rolling back:', error);
  
        if (context?.previousMessages) {
          queryClient.setQueryData(
            ['messages', 'roomMessages', variables.room_id],
            context.previousMessages
          );
        }
  
        // Show error to user (you can customize this)
        alert('Failed to send message. Please try again.');
      },
    });
  }

// SIMPLIFIED QUERY
export function useRoomMessages(
  supabase: SupabaseClient,
  roomId: string | undefined
) {
  return useInfiniteQuery({
    queryKey: ['messages', 'roomMessages', roomId],
    queryFn: async ({ pageParam }) => {
      if (!roomId) return [];

      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url),
          reactions:message_reactions(id, emoji, user_id, created_at)
        `)
        .eq('room_id', roomId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Return in ascending order (oldest to newest)
      return (data || []).reverse();
    },
    enabled: !!roomId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[0]?.created_at;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

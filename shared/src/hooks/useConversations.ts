// shared/src/hooks/useConversations.ts
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ConversationsService,
  type Conversation,
  type ConversationMessage,
  type CreateGroupConversationInput,
  type SendConversationMessageInput,
  type SearchUserResult,
} from '../services/conversations.service';

export const conversationKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationKeys.all, 'list'] as const,
  conversation: (conversationId: string) => [...conversationKeys.all, 'detail', conversationId] as const,
  participants: (conversationId: string) => [...conversationKeys.conversation(conversationId), 'participants'] as const,
  messages: (conversationId: string) => [...conversationKeys.conversation(conversationId), 'messages'] as const,
  pinned: (conversationId: string) => [...conversationKeys.conversation(conversationId), 'pinned'] as const,
  searchUsers: (query: string) => [...conversationKeys.all, 'search-users', query] as const,
};

export function createConversationHooks(supabase: SupabaseClient) {
  const conversationsService = new ConversationsService(supabase);

  function useConversations() {
    return useQuery({
      queryKey: conversationKeys.list(),
      queryFn: () => conversationsService.getConversations(),
      staleTime: 1000 * 30,
    });
  }

  function useConversation(conversationId: string | undefined) {
    return useQuery({
      queryKey: conversationKeys.conversation(conversationId || 'unknown'),
      queryFn: () => conversationsService.getConversation(conversationId!),
      enabled: !!conversationId,
      staleTime: 1000 * 60,
    });
  }

  function useConversationParticipants(conversationId: string | undefined) {
    return useQuery({
      queryKey: conversationKeys.participants(conversationId || 'unknown'),
      queryFn: () => conversationsService.getConversationParticipants(conversationId!),
      enabled: !!conversationId,
      staleTime: 1000 * 60 * 2,
    });
  }

  function useConversationMessages(conversationId: string | undefined) {
    return useInfiniteQuery({
      queryKey: conversationKeys.messages(conversationId || 'unknown'),
      queryFn: ({ pageParam }) =>
        conversationsService.getConversationMessages(conversationId!, 50, pageParam),
      enabled: !!conversationId,
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        if (lastPage.length === 0) return undefined;
        return lastPage[0]?.created_at;
      },
      staleTime: 1000 * 30,
    });
  }

  function usePinnedConversationMessages(conversationId: string | undefined) {
    return useQuery({
      queryKey: conversationKeys.pinned(conversationId || 'unknown'),
      queryFn: () => conversationsService.getPinnedMessages(conversationId!),
      enabled: !!conversationId,
      staleTime: 1000 * 60,
    });
  }

  function useSearchUsers(query: string) {
    return useQuery<SearchUserResult[]>({
      queryKey: conversationKeys.searchUsers(query),
      queryFn: () => conversationsService.searchUsers(query),
      enabled: query.trim().length > 0,
      staleTime: 1000 * 60,
    });
  }

  function useCreateDirectConversation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (otherUserId: string) =>
        conversationsService.getOrCreateDirectConversation(otherUserId),
      onSuccess: (conversation) => {
        queryClient.setQueryData<Conversation>(conversationKeys.conversation(conversation.id), conversation);
        queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
      },
    });
  }

  function useCreateGroupConversation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (input: CreateGroupConversationInput) =>
        conversationsService.createGroupConversation(input),
      onSuccess: (conversation) => {
        queryClient.setQueryData<Conversation>(conversationKeys.conversation(conversation.id), conversation);
        queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
      },
    });
  }

  function useSendConversationMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (input: SendConversationMessageInput) =>
        conversationsService.sendConversationMessage(input),
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: conversationKeys.messages(variables.conversation_id),
        });

        const previousMessages = queryClient.getQueryData(
          conversationKeys.messages(variables.conversation_id)
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { previousMessages };

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', user.id)
          .single();

        let reply_to: ConversationMessage | null = null;
        if (variables.reply_to_id) {
          const { data: replyMsg } = await supabase
            .from('messages')
            .select('id, content, sender_id')
            .eq('id', variables.reply_to_id)
            .single();

          if (replyMsg) {
            const { data: replySender } = await supabase
              .from('profiles')
              .select('id, username, display_name, avatar_url')
              .eq('id', replyMsg.sender_id)
              .single();

            reply_to = { ...replyMsg, sender: replySender || null } as ConversationMessage;
          }
        }

        const optimisticMessage: ConversationMessage = {
          id: `optimistic-${Date.now()}`,
          conversation_id: variables.conversation_id,
          sender_id: user.id,
          content: variables.content,
          message_type: variables.message_type || 'text',
          reply_to_id: variables.reply_to_id,
          attachments: variables.attachments || [],
          metadata: variables.metadata || {},
          is_pinned: false,
          is_system: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: profile || null,
          reactions: [],
          read_receipts: [],
          reply_to,
        };

        queryClient.setQueryData(
          conversationKeys.messages(variables.conversation_id),
          (old: any) => {
            if (!old?.pages) return old;
            const newPages = [...old.pages];
            if (newPages[0]) {
              newPages[0] = [...newPages[0], optimisticMessage];
            } else {
              newPages[0] = [optimisticMessage];
            }
            return { ...old, pages: newPages };
          }
        );

        return { previousMessages, optimisticId: optimisticMessage.id };
      },
      onSuccess: (realMessage, variables) => {
        queryClient.setQueryData(
          conversationKeys.messages(variables.conversation_id),
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: ConversationMessage[]) =>
                page.map((msg) =>
                  msg.id.startsWith('optimistic-') &&
                  msg.content === realMessage.content &&
                  msg.sender_id === realMessage.sender_id &&
                  msg.conversation_id === realMessage.conversation_id
                    // Keep optimistic ID to prevent flickering, store real ID for reference
                    ? { ...realMessage, id: msg.id, _realId: realMessage.id }
                    : msg
                )
              ),
            };
          }
        );

        queryClient.setQueryData<Conversation[]>(
          conversationKeys.list(),
          (old = []) =>
            old.map((conversation) =>
              conversation.id === variables.conversation_id
                ? {
                    ...conversation,
                    last_message: realMessage,
                    last_message_at: realMessage.created_at,
                  }
                : conversation
            )
        );
      },
      onError: (error, variables) => {
        console.error('Send message error:', error);

        // Mark the optimistic message as failed (don't rollback - let user retry)
        queryClient.setQueryData(
          conversationKeys.messages(variables.conversation_id),
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: ConversationMessage[]) =>
                page.map((msg) =>
                  msg.id.startsWith('optimistic-') &&
                  msg.content === variables.content &&
                  msg.sender_id === msg.sender_id
                    ? { ...msg, _failed: true, _error: (error as Error).message }
                    : msg
                )
              ),
            };
          }
        );
      },
    });
  }

  function useUpdateConversationMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
        conversationsService.updateMessage(messageId, content),
      onSuccess: (updatedMessage) => {
        queryClient.setQueryData(
          conversationKeys.messages(updatedMessage.conversation_id),
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: ConversationMessage[]) =>
                page.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
              ),
            };
          }
        );

        queryClient.setQueryData<Conversation[]>(
          conversationKeys.list(),
          (old = []) =>
            old.map((conversation) =>
              conversation.last_message?.id === updatedMessage.id
                ? { ...conversation, last_message: updatedMessage }
                : conversation
            )
        );
      },
    });
  }

  function useDeleteConversationMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (messageId: string) => conversationsService.deleteMessage(messageId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      },
    });
  }

  function usePinConversationMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        messageId,
        pin,
        pinnedUntil,
        keep,
      }: {
        messageId: string;
        pin: boolean;
        pinnedUntil?: string | null;
        keep?: boolean;
      }) =>
        pin
          ? conversationsService.pinMessage(messageId, pinnedUntil, keep)
          : conversationsService.unpinMessage(messageId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      },
    });
  }

  function useAddConversationReaction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, reaction }: { messageId: string; reaction: string }) =>
        conversationsService.addReaction(messageId, reaction),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: conversationKeys.all,
        });
      },
    });
  }

  function useRemoveConversationReaction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, reaction }: { messageId: string; reaction: string }) =>
        conversationsService.removeReaction(messageId, reaction),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: conversationKeys.all,
        });
      },
    });
  }

  function useMarkConversationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (conversationId: string) =>
        conversationsService.markConversationAsRead(conversationId),
      onSuccess: (_data, conversationId) => {
        queryClient.setQueryData<Conversation[]>(
          conversationKeys.list(),
          (old = []) =>
            old.map((conversation) =>
              conversation.id === conversationId
                ? { ...conversation, unread_count: 0 }
                : conversation
            )
        );
      },
    });
  }

  return {
    useConversations,
    useConversation,
    useConversationParticipants,
    useConversationMessages,
    usePinnedConversationMessages,
    useSearchUsers,
    useCreateDirectConversation,
    useCreateGroupConversation,
    useSendConversationMessage,
    useUpdateConversationMessage,
    useDeleteConversationMessage,
    usePinConversationMessage,
    useAddConversationReaction,
    useRemoveConversationReaction,
    useMarkConversationAsRead,
  };
}

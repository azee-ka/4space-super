// shared/src/hooks/useMessages.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MessagesService, type Room, type Message, type RoomMember, type SendMessageInput, type CreateRoomInput } from '../services/messages.service';

// Query keys factory
export const messageKeys = {
  all: ['messages'] as const,
  rooms: (spaceId: string) => [...messageKeys.all, 'rooms', spaceId] as const,
  room: (roomId: string) => [...messageKeys.all, 'room', roomId] as const,
  roomMessages: (roomId: string) => [...messageKeys.room(roomId), 'messages'] as const,
  roomMembers: (roomId: string) => [...messageKeys.room(roomId), 'members'] as const,
  pinnedMessages: (roomId: string) => [...messageKeys.room(roomId), 'pinned'] as const,
  bookmarks: (spaceId: string) => [...messageKeys.all, 'bookmarks', spaceId] as const,
  search: (roomId: string, query: string) => [...messageKeys.room(roomId), 'search', query] as const,
  unreadCount: (roomId: string) => [...messageKeys.room(roomId), 'unread'] as const,
};

/**
 * Factory function to create message hooks with supabase client
 */
export function createMessageHooks(supabase: SupabaseClient) {
  const messagesService = new MessagesService(supabase);

  /**
   * Get all rooms for a space
   */
  function useSpaceRooms(spaceId: string | undefined) {
    return useQuery({
      queryKey: messageKeys.rooms(spaceId!),
      queryFn: () => messagesService.getSpaceRooms(spaceId!),
      enabled: !!spaceId,
      staleTime: 1000 * 60, // 1 minute
      refetchInterval: false, // Disable auto-refetch - causing lag
    });
  }

  /**
   * Get a single room
   */
  function useRoom(roomId: string | undefined) {
    return useQuery({
      queryKey: messageKeys.room(roomId!),
      queryFn: () => messagesService.getRoom(roomId!),
      enabled: !!roomId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }

  /**
   * Get messages for a room with infinite scroll
   */
  function useRoomMessages(roomId: string | undefined) {
    return useInfiniteQuery({
      queryKey: messageKeys.roomMessages(roomId!),
      queryFn: ({ pageParam }) => 
        messagesService.getRoomMessages(roomId!, 50, pageParam),
      enabled: !!roomId,
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        // Return the oldest message's created_at for pagination
        if (lastPage.length === 0) return undefined;
        return lastPage[0]?.created_at;
      },
      staleTime: 1000 * 30, // 30 seconds
    });
  }

  /**
   * Get room members
   */
  function useRoomMembers(roomId: string | undefined) {
    return useQuery({
      queryKey: messageKeys.roomMembers(roomId!),
      queryFn: () => messagesService.getRoomMembers(roomId!),
      enabled: !!roomId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  }

  /**
   * Get pinned messages
   */
  function usePinnedMessages(roomId: string | undefined) {
    return useQuery({
      queryKey: messageKeys.pinnedMessages(roomId!),
      queryFn: () => messagesService.getPinnedMessages(roomId!),
      enabled: !!roomId,
      staleTime: 1000 * 60, // 1 minute
    });
  }

  /**
   * Get bookmarked messages
   */
  function useBookmarkedMessages(spaceId: string | undefined) {
    return useQuery({
      queryKey: messageKeys.bookmarks(spaceId!),
      queryFn: () => messagesService.getBookmarkedMessages(spaceId!),
      enabled: !!spaceId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }

  /**
   * Search messages
   */
  function useSearchMessages(roomId: string | undefined, query: string) {
    return useQuery({
      queryKey: messageKeys.search(roomId!, query),
      queryFn: () => messagesService.searchMessages(roomId!, query),
      enabled: !!roomId && query.length > 0,
      staleTime: 1000 * 60, // 1 minute
    });
  }

  /**
   * Get unread count for a room
   */
  function useUnreadCount(roomId: string | undefined) {
    return useQuery({
      queryKey: messageKeys.unreadCount(roomId!),
      queryFn: () => messagesService.getUnreadCount(roomId!),
      enabled: !!roomId,
      staleTime: 1000 * 10, // 10 seconds
      refetchInterval: 1000 * 15, // Refetch every 15 seconds
    });
  }

  /**
   * Create a new room
   */
  function useCreateRoom() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (input: CreateRoomInput) => messagesService.createRoom(input),
      onSuccess: (newRoom) => {
        // Add to cached rooms list
        queryClient.setQueryData<Room[]>(
          messageKeys.rooms(newRoom.space_id),
          (old = []) => [...old, newRoom]
        );

        // Invalidate to refetch
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.rooms(newRoom.space_id) 
        });
      },
    });
  }

  /**
   * Update a room
   */
  function useUpdateRoom() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ roomId, updates }: { roomId: string; updates: Partial<CreateRoomInput> }) =>
        messagesService.updateRoom(roomId, updates),
      onSuccess: (updatedRoom) => {
        // Update room cache
        queryClient.setQueryData(
          messageKeys.room(updatedRoom.id),
          updatedRoom
        );

        // Update in rooms list
        queryClient.setQueryData<Room[]>(
          messageKeys.rooms(updatedRoom.space_id),
          (old = []) => old.map(room => room.id === updatedRoom.id ? updatedRoom : room)
        );

        // Invalidate
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.room(updatedRoom.id) 
        });
      },
    });
  }

  /**
   * Delete a room
   */
  function useDeleteRoom() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (roomId: string) => messagesService.deleteRoom(roomId),
      onMutate: async (roomId) => {
        // Get the room to know which space it belongs to
        const room = queryClient.getQueryData<Room>(messageKeys.room(roomId));
        return { spaceId: room?.space_id };
      },
      onSuccess: (_, roomId, context) => {
        if (context?.spaceId) {
          // Remove from rooms list
          queryClient.setQueryData<Room[]>(
            messageKeys.rooms(context.spaceId),
            (old = []) => old.filter(room => room.id !== roomId)
          );
        }

        // Remove room cache
        queryClient.removeQueries({ queryKey: messageKeys.room(roomId) });
      },
    });
  }

  /**
   * Send a message
   */
  function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (input: SendMessageInput) => messagesService.sendMessage(input),
      onMutate: async (newMessage) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ 
          queryKey: messageKeys.roomMessages(newMessage.room_id) 
        });

        // Snapshot previous value
        const previousMessages = queryClient.getQueryData(
          messageKeys.roomMessages(newMessage.room_id)
        );

        // Optimistically update
        queryClient.setQueryData(
          messageKeys.roomMessages(newMessage.room_id),
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: Message[], index: number) => 
                index === old.pages.length - 1
                  ? [...page, {
                      id: 'temp-' + Date.now(),
                      ...newMessage,
                      sender_id: newMessage.room_id, // Will be replaced by real data
                      encrypted_content: newMessage.content,
                      created_at: new Date().toISOString(),
                      message_type: newMessage.message_type || 'text',
                    } as Message]
                  : page
              ),
            };
          }
        );

        return { previousMessages };
      },
      onError: (err, newMessage, context) => {
        // Rollback on error
        if (context?.previousMessages) {
          queryClient.setQueryData(
            messageKeys.roomMessages(newMessage.room_id),
            context.previousMessages
          );
        }
      },
      onSuccess: (message) => {
        // Invalidate to get real data
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMessages(message.room_id) 
        });
      },
    });
  }

  /**
   * Update a message
   */
  function useUpdateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
        messagesService.updateMessage(messageId, content),
      onSuccess: (updatedMessage) => {
        // Update in messages list
        queryClient.setQueryData(
          messageKeys.roomMessages(updatedMessage.room_id),
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
              ),
            };
          }
        );

        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMessages(updatedMessage.room_id) 
        });
      },
    });
  }

  /**
   * Delete a message
   */
  function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (messageId: string) => messagesService.deleteMessage(messageId),
      onMutate: async (messageId) => {
        // We need to find which room this message belongs to
        // This is a limitation - we should pass roomId as well
        return { messageId };
      },
      onSuccess: (_, messageId) => {
        // Invalidate all message queries to refetch
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.all 
        });
      },
    });
  }

  /**
   * Pin/Unpin message
   */
  function usePinMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, pin }: { messageId: string; pin: boolean }) =>
        pin ? messagesService.pinMessage(messageId) : messagesService.unpinMessage(messageId),
      onSuccess: (_, { messageId }) => {
        // Invalidate to refetch pinned messages
        queryClient.invalidateQueries({ queryKey: messageKeys.all });
      },
    });
  }

  /**
   * Add reaction
   */
  function useAddReaction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, reaction }: { messageId: string; reaction: string }) =>
        messagesService.addReaction(messageId, reaction),
      onSuccess: () => {
        // Invalidate to refetch messages with updated reactions
        queryClient.invalidateQueries({ queryKey: messageKeys.all });
      },
    });
  }

  /**
   * Remove reaction
   */
  function useRemoveReaction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, reaction }: { messageId: string; reaction: string }) =>
        messagesService.removeReaction(messageId, reaction),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: messageKeys.all });
      },
    });
  }

  /**
   * Mark message as read
   */
  function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (messageId: string) => messagesService.markAsRead(messageId),
      onSuccess: () => {
        // Invalidate unread counts
        queryClient.invalidateQueries({ 
          queryKey: [...messageKeys.all, 'unread'] 
        });
      },
    });
  }

  /**
   * Mark room as read
   */
  function useMarkRoomAsRead() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (roomId: string) => messagesService.markRoomAsRead(roomId),
      // Don't block on this mutation
      retry: 0, // Don't retry if it fails
      onError: (error) => {
        console.error('Failed to mark room as read (non-critical):', error);
        // Don't throw - this is non-critical
      },
      onSuccess: (_, roomId) => {
        // Invalidate unread count for this room
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.unreadCount(roomId) 
        });
        
        // Also invalidate rooms to update unread counts in list
        queryClient.invalidateQueries({ 
          queryKey: [...messageKeys.all, 'rooms'] 
        });
      },
    });
  }

  /**
   * Bookmark message
   */
  function useBookmarkMessage() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ messageId, note }: { messageId: string; note?: string }) =>
        messagesService.bookmarkMessage(messageId, note),
      onSuccess: () => {
        queryClient.invalidateQueries({ 
          queryKey: [...messageKeys.all, 'bookmarks'] 
        });
      },
    });
  }

  /**
   * Remove bookmark
   */
  function useRemoveBookmark() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (messageId: string) => messagesService.removeBookmark(messageId),
      onSuccess: () => {
        queryClient.invalidateQueries({ 
          queryKey: [...messageKeys.all, 'bookmarks'] 
        });
      },
    });
  }

  /**
   * Add room member
   */
  function useAddRoomMember() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ roomId, userId, role }: { roomId: string; userId: string; role?: 'admin' | 'moderator' | 'member' }) =>
        messagesService.addRoomMember(roomId, userId, role),
      onSuccess: (_, { roomId }) => {
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMembers(roomId) 
        });
      },
    });
  }

  /**
   * Remove room member
   */
  function useRemoveRoomMember() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
        messagesService.removeRoomMember(roomId, userId),
      onSuccess: (_, { roomId }) => {
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMembers(roomId) 
        });
      },
    });
  }

  /**
   * Update room member role
   */
  function useUpdateRoomMemberRole() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ roomId, userId, role }: { roomId: string; userId: string; role: 'admin' | 'moderator' | 'member' }) =>
        messagesService.updateRoomMemberRole(roomId, userId, role),
      onSuccess: (_, { roomId }) => {
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMembers(roomId) 
        });
      },
    });
  }

  return {
    useSpaceRooms,
    useRoom,
    useRoomMessages,
    useRoomMembers,
    usePinnedMessages,
    useBookmarkedMessages,
    useSearchMessages,
    useUnreadCount,
    useCreateRoom,
    useUpdateRoom,
    useDeleteRoom,
    useSendMessage,
    useUpdateMessage,
    useDeleteMessage,
    usePinMessage,
    useAddReaction,
    useRemoveReaction,
    useMarkAsRead,
    useMarkRoomAsRead,
    useBookmarkMessage,
    useRemoveBookmark,
    useAddRoomMember,
    useRemoveRoomMember,
    useUpdateRoomMemberRole,
  };
}
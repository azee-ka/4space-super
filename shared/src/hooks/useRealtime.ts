// shared/src/hooks/useRealtime.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { RealtimeService, type Message, type TypingIndicator, type OnlineStatus } from '../services/realtime.service';
import { messageKeys } from './useMessages';

/**
 * Hook for real-time message subscriptions
 */
export function useRealtimeMessages(
  supabase: SupabaseClient,
  spaceId: string | undefined,
  roomId: string | undefined,
  enabled = true
) {
  const queryClient = useQueryClient();
  const realtimeService = useRef(new RealtimeService(supabase));
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    if (!enabled || !spaceId || !roomId) return;

    const service = realtimeService.current;

    // Subscribe to room
    service.subscribeToRoom(roomId, spaceId, {
      // New message
      onMessage: (message: Message) => {
        queryClient.setQueryData(
          messageKeys.roomMessages(roomId),
          (old: any) => {
            if (!old?.pages) return old;
            
            // Add to the last page
            return {
              ...old,
              pages: old.pages.map((page: Message[], index: number) =>
                index === old.pages.length - 1
                  ? [...page, message]
                  : page
              ),
            };
          }
        );

        // Invalidate to ensure fresh data
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMessages(roomId) 
        });
      },

      // Message updated (edit)
      onMessageUpdate: (message: Message) => {
        queryClient.setQueryData(
          messageKeys.roomMessages(roomId),
          (old: any) => {
            if (!old?.pages) return old;

            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map(msg => msg.id === message.id ? message : msg)
              ),
            };
          }
        );
      },

      // Message deleted
      onMessageDelete: (message: Message) => {
        queryClient.setQueryData(
          messageKeys.roomMessages(roomId),
          (old: any) => {
            if (!old?.pages) return old;

            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map(msg => 
                  msg.id === message.id 
                    ? { ...msg, deleted_at: new Date().toISOString() }
                    : msg
                )
              ),
            };
          }
        );
      },

      // Typing indicators
      onTyping: (indicators: TypingIndicator[]) => {
        setTypingUsers(indicators);
      },

      // Reactions
      onReaction: () => {
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMessages(roomId) 
        });
      },

      // Read receipts
      onReadReceipt: () => {
        queryClient.invalidateQueries({ 
          queryKey: messageKeys.roomMessages(roomId) 
        });
      },
    });

    return () => {
      service.unsubscribeFromRoom(roomId);
    };
  }, [enabled, spaceId, roomId, queryClient]);

  return { typingUsers };
}

/**
 * Hook for online presence
 */
export function usePresence(
  supabase: SupabaseClient,
  spaceId: string | undefined,
  userId: string | undefined,
  enabled = true
) {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineStatus>>(new Map());
  const realtimeService = useRef(new RealtimeService(supabase));

  useEffect(() => {
    if (!enabled || !spaceId || !userId) return;

    const service = realtimeService.current;

    service.subscribeToPresence(
      spaceId,
      userId,
      (status: OnlineStatus) => {
        setOnlineUsers((prev: Map<string, OnlineStatus>) => {
          const next = new Map(prev);
          next.set(status.user_id, status);
          return next;
        });
      }
    );

    return () => {
      service.unsubscribeFromSpace(spaceId);
    };
  }, [enabled, spaceId, userId]);

  return { onlineUsers };
}

/**
 * Hook for typing indicator
 */
export function useTypingIndicator(
  supabase: SupabaseClient,
  roomId: string | undefined,
  spaceId: string | undefined,
  userId: string | undefined
) {
  const realtimeService = useRef(new RealtimeService(supabase));
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const sendTypingIndicator = useCallback(() => {
    if (!roomId || !spaceId || !userId) return;

    const service = realtimeService.current;
    service.sendTypingIndicator(roomId, spaceId, userId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-remove after 5 seconds
    typingTimeoutRef.current = setTimeout(() => {
      service.removeTypingIndicator(roomId, userId);
    }, 5000);
  }, [roomId, spaceId, userId]);

  const stopTyping = useCallback(() => {
    if (!roomId || !userId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    realtimeService.current.removeTypingIndicator(roomId, userId);
  }, [roomId, userId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { sendTypingIndicator, stopTyping };
}

/**
 * Hook for online status updates
 */
export function useOnlineStatus(
  supabase: SupabaseClient,
  userId: string | undefined
) {
  const realtimeService = useRef(new RealtimeService(supabase));

  const updateStatus = useCallback(
    (status: 'online' | 'offline' | 'away') => {
      if (!userId) return;
      realtimeService.current.updateOnlineStatus(userId, status);
    },
    [userId]
  );

  // Set online on mount, offline on unmount
  useEffect(() => {
    if (!userId) return;

    updateStatus('online');

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away');
      } else {
        updateStatus('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      updateStatus('offline');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, updateStatus]);

  return { updateStatus };
}

/**
 * Combined hook for all realtime features
 */
export function useRealtimeChat(
  supabase: SupabaseClient,
  spaceId: string | undefined,
  roomId: string | undefined,
  userId: string | undefined,
  enabled = true
) {
  const { typingUsers } = useRealtimeMessages(supabase, spaceId, roomId, enabled);
  const { onlineUsers } = usePresence(supabase, spaceId, userId, enabled);
  const { sendTypingIndicator, stopTyping } = useTypingIndicator(supabase, roomId, spaceId, userId);
  const { updateStatus } = useOnlineStatus(supabase, userId);

  return {
    typingUsers,
    onlineUsers,
    sendTypingIndicator,
    stopTyping,
    updateStatus,
  };
}
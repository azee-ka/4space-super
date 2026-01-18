// COMPLETE Real-time Hook - Simple WebSocket, no DB overhead
// shared/src/hooks/useRealtime.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { messageKeys } from './useMessages';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: any;
  read_receipts?: any[];
  reactions?: any[];
  reply_to?: any;
}

export function useRealtimeChat(
  supabase: SupabaseClient,
  spaceId: string | undefined,
  roomId: string | undefined,
  userId: string | undefined,
  enabled = true
) {
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Map<string, any>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !roomId || !spaceId || !userId) return;

    console.log('[Realtime] Subscribing to room:', roomId);

    const channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: userId },
        },
      })
      
      // ============================================
      // MESSAGES (postgres_changes)
      // ============================================
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log('[Realtime] New message received:', payload.new.id);
          
          // Enrich with sender
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          // Fetch reply_to if exists
          let reply_to = null;
          if (payload.new.reply_to_id) {
            const { data: replyMsg } = await supabase
              .from('messages')
              .select('id, content, sender_id')
              .eq('id', payload.new.reply_to_id)
              .single();

            if (replyMsg) {
              const { data: replySender } = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .eq('id', replyMsg.sender_id)
                .single();
              
              reply_to = { ...replyMsg, sender: replySender || null };
            }
          }

          const enrichedMessage: Message = {
            ...payload.new as any,
            sender,
            reply_to,
            read_receipts: [],
            reactions: [],
          };

          // Update cache - use correct query key structure
          queryClient.setQueryData(messageKeys.roomMessages(roomId), (old: any) => {
            if (!old?.pages) return old;
            
            // Check if message already exists by ID (real message already in cache)
            const existsById = old.pages.some((page: Message[]) =>
              page.some(msg => msg.id === enrichedMessage.id)
            );
            
            if (existsById) {
              console.log('[Realtime] Message already exists, updating');
              return {
                ...old,
                pages: old.pages.map((page: Message[]) =>
                  page.map(msg => 
                    msg.id === enrichedMessage.id ? enrichedMessage : msg
                  )
                ),
              };
            }

            // Check if this is an optimistic message that needs updating
            // Match by content and sender (for rapid sends, multiple optimistic messages)
            const optimisticMatch = old.pages
              .flatMap((page: Message[]) => page)
              .find((msg: Message) =>
                (msg.id.startsWith('optimistic-') || msg.id.startsWith('temp-')) &&
                msg.content === enrichedMessage.content &&
                msg.sender_id === enrichedMessage.sender_id
              );

            if (optimisticMatch) {
              console.log('[Realtime] Updating optimistic message with server data (keeping ID for smooth transition)');
              // Keep the optimistic ID to prevent React key change and flickering
              // Just update the message data (read_receipts, reactions, etc.)
              return {
                ...old,
                pages: old.pages.map((page: Message[]) =>
                  page.map(msg =>
                    msg.id === optimisticMatch.id
                      ? { ...enrichedMessage, id: optimisticMatch.id, _realId: enrichedMessage.id }
                      : msg
                  )
                ),
              };
            }

            // Add as new message - simple append, database order is correct
            // getRoomMessages returns messages in descending order (newest first)
            // Pages are reversed then flattened, so page[0] messages appear LAST (at bottom)
            // To add new message at bottom, append to page[0] (which will be last after reverse/flatten)
            const newPages = [...old.pages];
            if (newPages[0]) {
              newPages[0] = [...newPages[0], enrichedMessage];
            } else {
              newPages[0] = [enrichedMessage];
            }
            return { ...old, pages: newPages };
          });
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log('[Realtime] Message updated:', payload.new.id);
          
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          // Fetch reply_to if exists
          let reply_to = null;
          if (payload.new.reply_to_id) {
            const { data: replyMsg } = await supabase
              .from('messages')
              .select('id, content, sender_id')
              .eq('id', payload.new.reply_to_id)
              .single();

            if (replyMsg) {
              const { data: replySender } = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .eq('id', replyMsg.sender_id)
                .single();
              
              reply_to = { ...replyMsg, sender: replySender || null };
            }
          }

          const updatedMessage = { ...payload.new as any, sender, reply_to };

          queryClient.setQueryData(messageKeys.roomMessages(roomId), (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
              ),
            };
          });

          queryClient.invalidateQueries({ queryKey: messageKeys.pinnedMessages(roomId) });
          if (spaceId) {
            queryClient.invalidateQueries({ queryKey: messageKeys.bookmarks(spaceId) });
          }
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[Realtime] Message deleted:', payload.old.id);
          queryClient.setQueryData(messageKeys.roomMessages(roomId), (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: Message[]) =>
                page.filter(msg => msg.id !== payload.old.id)
              ),
            };
          });

          queryClient.invalidateQueries({ queryKey: messageKeys.pinnedMessages(roomId) });
          if (spaceId) {
            queryClient.invalidateQueries({ queryKey: messageKeys.bookmarks(spaceId) });
          }
        }
      )

      // ============================================
      // REACTIONS (postgres_changes)
      // ============================================
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          // Just invalidate to refetch - simple and reliable
          queryClient.invalidateQueries({
            queryKey: messageKeys.roomMessages(roomId),
          });
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: messageKeys.roomMessages(roomId),
          });
        }
      )

      // ============================================
      // TYPING INDICATORS (broadcast - WebSocket only)
      // ============================================
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, username, display_name, typing } = payload.payload;
        
        if (user_id === userId) return; // Ignore self
        
        setTypingUsers((prev: Map<string, any>) => {
          const next = new Map(prev);
          if (typing) {
            next.set(user_id, { user_id, username, display_name, user: { username, display_name } });
          } else {
            next.delete(user_id);
          }
          return next;
        });
      })

      // ============================================
      // PRESENCE (online status)
      // ============================================
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = new Map();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            users.set(presence.user_id, {
              user_id: presence.user_id,
              username: presence.username,
              status: 'online',
            });
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers((prev: Map<string, any>) => {
          const next = new Map(prev);
          newPresences.forEach((presence: any) => {
            next.set(presence.user_id, {
              user_id: presence.user_id,
              username: presence.username,
              status: 'online',
            });
          });
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setOnlineUsers((prev: Map<string, any>) => {
          const next = new Map(prev);
          leftPresences.forEach((presence: any) => {
            next.delete(presence.user_id);
          });
          return next;
        });
      })
      .subscribe(async (status, err) => {
        console.log('[Realtime] Subscription status:', status, err);
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Successfully subscribed to room:', roomId);
          
          // Track presence
          const { data: user } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', userId)
            .single();

          await channel.track({
            user_id: userId,
            username: user?.username || 'User',
            display_name: user?.display_name || user?.username || 'User',
            status: 'online',
          });
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Channel closed');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[Realtime] Unsubscribing from room:', roomId);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [enabled, roomId, spaceId, userId, supabase, queryClient]);

  // ============================================
  // TYPING INDICATOR FUNCTIONS
  // ============================================
  const stopTyping = useCallback(async () => {
    if (!channelRef.current || !userId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', userId)
      .single();

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userId,
          username: user?.username || 'User',
          display_name: user?.display_name || user?.username || 'User',
          typing: false,
        },
      });
    }
  }, [userId, supabase]);

  const sendTypingIndicator = useCallback(async () => {
    if (!channelRef.current || !userId) return;

    const { data: user } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', userId)
      .single();

    // Broadcast typing (WebSocket only - instant!)
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userId,
          username: user?.username || 'User',
          display_name: user?.display_name || user?.username || 'User',
          typing: true,
        },
      });
    }

    // Auto-stop after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [userId, supabase, stopTyping]);

  return {
    typingUsers,
    onlineUsers,
    sendTypingIndicator,
    stopTyping,
  };
}

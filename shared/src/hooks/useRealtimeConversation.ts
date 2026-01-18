// shared/src/hooks/useRealtimeConversation.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { conversationKeys } from './useConversations';
import type { ConversationMessage } from '../services/conversations.service';

export function useRealtimeConversation(
  supabase: SupabaseClient,
  conversationId: string | undefined,
  userId: string | undefined,
  enabled = true
) {
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Map<string, any>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !conversationId || !userId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: userId },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

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

          const enrichedMessage: ConversationMessage = {
            ...(payload.new as any),
            sender,
            reply_to,
            read_receipts: [],
            reactions: [],
          };

          queryClient.setQueryData(conversationKeys.messages(conversationId), (old: any) => {
            if (!old?.pages) return old;

            const existsById = old.pages.some((page: ConversationMessage[]) =>
              page.some((msg) => msg.id === enrichedMessage.id)
            );

            if (existsById) {
              return {
                ...old,
                pages: old.pages.map((page: ConversationMessage[]) =>
                  page.map((msg) => (msg.id === enrichedMessage.id ? enrichedMessage : msg))
                ),
              };
            }

            const optimisticMatch = old.pages
              .flatMap((page: ConversationMessage[]) => page)
              .find((msg: ConversationMessage) =>
                (msg.id.startsWith('optimistic-') || msg.id.startsWith('temp-')) &&
                msg.content === enrichedMessage.content &&
                msg.sender_id === enrichedMessage.sender_id
              );

            if (optimisticMatch) {
              // Keep the optimistic ID to prevent React key change and flickering
              // Just update the message data (read_receipts, reactions, etc.)
              return {
                ...old,
                pages: old.pages.map((page: ConversationMessage[]) =>
                  page.map((msg) =>
                    msg.id === optimisticMatch.id
                      ? { ...enrichedMessage, id: optimisticMatch.id, _realId: enrichedMessage.id }
                      : msg
                  )
                ),
              };
            }

            const newPages = [...old.pages];
            if (newPages[0]) {
              newPages[0] = [...newPages[0], enrichedMessage];
            } else {
              newPages[0] = [enrichedMessage];
            }
            return { ...old, pages: newPages };
          });

          queryClient.setQueryData(
            conversationKeys.list(),
            (old: any) =>
              (old || []).map((conversation: any) => {
                if (conversation.id !== conversationId) return conversation;
                const increment = enrichedMessage.sender_id === userId ? 0 : 1;
                return {
                  ...conversation,
                  last_message: enrichedMessage,
                  last_message_at: enrichedMessage.created_at,
                  unread_count: Math.max(0, (conversation.unread_count || 0) + increment),
                };
              })
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

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

          const updatedMessage: ConversationMessage = {
            ...(payload.new as any),
            sender,
            reply_to,
          };

          queryClient.setQueryData(conversationKeys.messages(conversationId), (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: ConversationMessage[]) =>
                page.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
              ),
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(conversationKeys.messages(conversationId), (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: ConversationMessage[]) =>
                page.filter((msg) => msg.id !== payload.old.id)
              ),
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: conversationKeys.messages(conversationId),
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
            queryKey: conversationKeys.messages(conversationId),
          });
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, username, display_name, typing } = payload.payload;
        if (user_id === userId) return;

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
        if (status === 'SUBSCRIBED') {
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
          console.error('[Realtime] Conversation channel error:', err);
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, enabled, queryClient, supabase, userId]);

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
  }, [supabase, userId]);

  const sendTypingIndicator = useCallback(async () => {
    if (!channelRef.current || !userId) return;

    const { data: user } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', userId)
      .single();

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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [stopTyping, supabase, userId]);

  return {
    typingUsers,
    onlineUsers,
    sendTypingIndicator,
    stopTyping,
  };
}

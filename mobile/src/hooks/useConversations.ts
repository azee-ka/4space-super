import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Conversation, Message, User } from '../types';

const normalizeUser = (profile: any, fallbackId?: string): User => ({
  id: profile?.id || fallbackId || '',
  username: profile?.username || profile?.display_name || 'User',
  display_name: profile?.display_name || profile?.username || 'User',
  avatar_url: profile?.avatar_url || undefined,
  email: profile?.email || undefined,
  created_at: profile?.created_at || undefined,
});

const extractText = (value: any): string => {
  if (value == null) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return extractText(JSON.parse(trimmed));
      } catch {
        return value;
      }
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(extractText).filter(Boolean).join('');
  }
  if (typeof value === 'object') {
    return (
      extractText(value.content) ||
      extractText(value.text) ||
      extractText(value.body) ||
      extractText(value.message) ||
      extractText(value.value) ||
      extractText(value.caption)
    );
  }
  return '';
};

const resolveContent = (msg: any) =>
  extractText(msg?.content) ||
  extractText(msg?.encrypted_content) ||
  extractText(msg?.metadata) ||
  extractText(msg?.text) ||
  extractText(msg?.body) ||
  '';

const normalizeMessage = (msg: any): Message => {
  const type = msg.message_type || msg.type || 'text';
  const content = resolveContent(msg);

  if (type === 'text' && !content) {
    console.warn('[Messages] Empty content for text message', {
      id: msg.id,
      sender_id: msg.sender_id,
      content: msg.content,
      encrypted_content: msg.encrypted_content,
      metadata: msg.metadata,
    });
  }

  return {
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    sender: normalizeUser(msg.sender, msg.sender_id),
    content,
    type,
    metadata: msg.metadata ?? null,
    encrypted_content: msg.encrypted_content ?? null,
    reply_to: msg.reply_to
      ? {
          id: msg.reply_to.id,
          conversation_id: msg.reply_to.conversation_id || msg.conversation_id,
          sender_id: msg.reply_to.sender_id,
          sender: normalizeUser(msg.reply_to.sender, msg.reply_to.sender_id),
          content: resolveContent(msg.reply_to),
          type: msg.reply_to.message_type || msg.reply_to.type || 'text',
          reply_to: undefined,
          reactions: [],
          read_by: [],
          created_at: msg.reply_to.created_at,
          updated_at: msg.reply_to.updated_at || msg.reply_to.created_at,
          is_edited: Boolean(msg.reply_to.is_edited || msg.reply_to.edited_at),
          is_deleted: Boolean(msg.reply_to.is_deleted || msg.reply_to.deleted_at),
          file_url: msg.reply_to.file_url,
          file_name: msg.reply_to.file_name,
          file_size: msg.reply_to.file_size,
        }
      : undefined,
    reactions: (msg.reactions || []).map((reaction: any) => ({
      id: reaction.id,
      message_id: reaction.message_id || msg.id,
      user_id: reaction.user_id,
      user: reaction.user ? normalizeUser(reaction.user, reaction.user_id) : undefined,
      emoji: reaction.emoji,
      created_at: reaction.created_at,
    })),
    read_by: msg.read_by || (msg.read_receipts || []).map((receipt: any) => receipt.user_id) || [],
    created_at: msg.created_at,
    updated_at: msg.updated_at || msg.created_at,
    is_edited: Boolean(msg.is_edited || msg.edited_at),
    is_deleted: Boolean(msg.is_deleted || msg.deleted_at),
    file_url: msg.file_url,
    file_name: msg.file_name,
    file_size: msg.file_size,
  };
};

export const useConversations = (userId: string) => {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const { data: memberships, error: membershipError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      const conversationIds = (memberships || [])
        .map((row: any) => row.conversation_id)
        .filter(Boolean);

      if (conversationIds.length === 0) return [];

      const membershipMap = new Map(
        (memberships || []).map((row: any) => [row.conversation_id, row])
      );

      const { data: conversations, error: conversationError } = await supabase
        .from('conversations')
        .select('id, name, is_group, created_at, updated_at, last_message_at')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (conversationError) throw conversationError;

      const { data: participants, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, user:profiles(id, username, display_name, avatar_url)')
        .in('conversation_id', conversationIds);

      if (participantError) throw participantError;

      const participantsByConversation = new Map<string, User[]>();
      (participants || []).forEach((participant: any) => {
        const existing = participantsByConversation.get(participant.conversation_id) || [];
        const normalized = normalizeUser(participant.user, participant.user_id);
        participantsByConversation.set(participant.conversation_id, [...existing, normalized]);
      });

      const lastMessageByConversation = new Map<string, Message | null>();
      await Promise.all(
        conversationIds.map(async (conversationId) => {
          const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles(id, username, display_name, avatar_url)')
            .eq('conversation_id', conversationId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) throw error;

          const message = data && data[0] ? normalizeMessage(data[0]) : null;
          lastMessageByConversation.set(conversationId, message);
        })
      );

      const unreadCounts = new Map<string, number>();
      await Promise.all(
        conversationIds.map(async (conversationId) => {
          const membership = membershipMap.get(conversationId);
          let query = supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .is('deleted_at', null);

          if (membership?.last_read_at) {
            query = query.gt('created_at', membership.last_read_at);
          }

          const { count, error } = await query;
          if (error) throw error;
          unreadCounts.set(conversationId, count || 0);
        })
      );

      return (conversations || []).map((conversation: any) => {
        const participantsForConversation = participantsByConversation.get(conversation.id) || [];
        return {
          id: conversation.id,
          type: conversation.is_group ? 'group' : 'dm',
          name: conversation.name,
          avatar_url: conversation.avatar_url,
          last_message: lastMessageByConversation.get(conversation.id) || undefined,
          unread_count: unreadCounts.get(conversation.id) || 0,
          participants: participantsForConversation.filter((participant) => participant.id !== userId),
          created_at: conversation.created_at,
          updated_at: conversation.updated_at || conversation.created_at,
        } as Conversation;
      });
    },
    enabled: !!userId,
  });
};

export const useConversation = (conversationId: string, userId: string) => {
  return useQuery({
    queryKey: ['conversation', conversationId, userId],
    queryFn: async () => {
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id, name, is_group, created_at, updated_at, last_message_at')
        .eq('id', conversationId)
        .single();

      if (conversationError) throw conversationError;

      const { data: participants, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, user:profiles(id, username, display_name, avatar_url)')
        .eq('conversation_id', conversationId);

      if (participantError) throw participantError;

      const { data: lastMessage, error: messageError } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, username, display_name, avatar_url)')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (messageError) throw messageError;

      let unreadCount = 0;
      const { data: membership, error: membershipError } = await supabase
        .from('conversation_participants')
        .select('last_read_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (membershipError) throw membershipError;

      let unreadQuery = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('deleted_at', null);

      if (membership?.last_read_at) {
        unreadQuery = unreadQuery.gt('created_at', membership.last_read_at);
      }

      const { count, error: unreadError } = await unreadQuery;
      if (unreadError) throw unreadError;
      unreadCount = count || 0;

      const normalizedParticipants = (participants || []).map((participant: any) =>
        normalizeUser(participant.user, participant.user_id)
      );

      return {
        id: conversation.id,
        type: conversation.is_group ? 'group' : 'dm',
        name: conversation.name,
        avatar_url: conversation.avatar_url,
        last_message: lastMessage && lastMessage[0] ? normalizeMessage(lastMessage[0]) : undefined,
        unread_count: unreadCount,
        participants: normalizedParticipants.filter((participant) => participant.id !== userId),
        created_at: conversation.created_at,
        updated_at: conversation.updated_at || conversation.created_at,
      } as Conversation;
    },
    enabled: !!conversationId && !!userId,
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          '*, sender:profiles(id, username, display_name, avatar_url), reactions:message_reactions(id, message_id, emoji, user_id, created_at)'
        )
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      return (data || []).map((msg: any) => normalizeMessage(msg)) as Message[];
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      senderId,
      replyToId,
      fileUrl,
      fileName,
      fileType,
    }: {
      conversationId: string;
      content: string;
      senderId: string;
      replyToId?: string;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
    }) => {
      const metadata = content ? { content, text: content } : undefined;
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          reply_to_id: replyToId,
          message_type: fileType || 'text',
          ...(metadata ? { metadata } : {}),
        })
        .select(
          '*, sender:profiles(id, username, display_name, avatar_url), reactions:message_reactions(id, message_id, emoji, user_id, created_at)'
        )
        .single();

      if (error) throw error;
      if (!data?.content && content) {
        console.warn('[SendMessage] Insert returned empty content', {
          conversationId,
          content,
          response: data,
        });
      }

      const now = new Date().toISOString();
      await supabase
        .from('conversations')
        .update({ updated_at: now, last_message_at: now })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });
    },
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      userId,
      emoji,
    }: {
      messageId: string;
      userId: string;
      emoji: string;
    }) => {
      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          emoji,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

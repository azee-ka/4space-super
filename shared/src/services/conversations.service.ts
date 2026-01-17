// shared/src/services/conversations.service.ts
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string | null;
  user?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: string | null;
  reply_to_id?: string | null;
  forward_from_id?: string | null;
  thread_id?: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  is_pinned: boolean | null;
  pinned_at?: string | null;
  pinned_until?: string | null;
  is_kept?: boolean | null;
  is_system: boolean | null;
  ttl?: number | null;
  expires_at?: string | null;
  attachments?: any[] | null;
  metadata?: any;
  created_at: string;
  updated_at: string | null;
  sender?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url?: string | null;
  } | null;
  reactions?: Array<{
    id: string;
    message_id: string;
    user_id: string;
    reaction: string;
    created_at: string;
  }>;
  read_receipts?: Array<{
    id: string;
    message_id: string;
    user_id: string;
    read_at: string;
  }>;
  reply_to?: ConversationMessage | null;
  thread_messages_count?: number;
}

export interface Conversation {
  id: string;
  name?: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  last_message_at?: string | null;
  participants?: ConversationParticipant[];
  last_message?: ConversationMessage | null;
  unread_count?: number;
}

export interface SendConversationMessageInput {
  conversation_id: string;
  content: string;
  message_type?: string;
  reply_to_id?: string | null;
  attachments?: any[];
  metadata?: any;
  ttl?: number;
  expires_at?: string | null;
}

export interface CreateGroupConversationInput {
  name: string;
  participant_ids: string[];
}

export interface SearchUserResult {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url?: string | null;
  relevance_score: number;
}

export class ConversationsService {
  constructor(private readonly supabase: SupabaseClient<any>) {}

  private async requireUserId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id;
  }

  private async getUnreadCount(conversationId: string, lastReadAt: string | null | undefined, userId: string) {
    let query = this.supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (lastReadAt) {
      query = query.gt('created_at', lastReadAt);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async getConversations(): Promise<Conversation[]> {
    const userId = await this.requireUserId();

    const { data: memberships, error: membershipError } = await this.supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);

    if (membershipError) throw membershipError;

    const membershipRows = memberships || [];
    const conversationIds = membershipRows.map((row) => row.conversation_id).filter(Boolean);
    if (conversationIds.length === 0) return [];

    const membershipMap = new Map(
      membershipRows.map((row) => [row.conversation_id, row])
    );

    const { data: conversations, error: conversationsError } = await this.supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });

    if (conversationsError) throw conversationsError;

    const { data: participants, error: participantsError } = await this.supabase
      .from('conversation_participants')
      .select('id, conversation_id, user_id, joined_at, last_read_at, user:profiles(id, username, display_name, avatar_url)')
      .in('conversation_id', conversationIds);

    if (participantsError) throw participantsError;

    const conversationMap = new Map<string, Conversation>();
    (conversations || []).forEach((conversation) => {
      conversationMap.set(conversation.id, {
        ...conversation,
        participants: [],
        last_message: null,
        unread_count: 0,
      });
    });

    (participants || []).forEach((participant) => {
      const conv = conversationMap.get(participant.conversation_id);
      if (!conv) return;
      conv.participants = [...(conv.participants || []), participant as ConversationParticipant];
    });

    const lastMessages = await Promise.all(
      conversationIds.map(async (conversationId) => {
        const { data, error } = await this.supabase
          .from('messages')
          .select('id, conversation_id, content, sender_id, message_type, created_at, metadata, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
          .eq('conversation_id', conversationId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        return { conversationId, message: (data && data[0]) || null };
      })
    );

    lastMessages.forEach(({ conversationId, message }) => {
      const conv = conversationMap.get(conversationId);
      if (conv) {
        conv.last_message = message as ConversationMessage | null;
      }
    });

    const unreadCounts = await Promise.all(
      conversationIds.map(async (conversationId) => {
        const membership = membershipMap.get(conversationId);
        const unread = await this.getUnreadCount(conversationId, membership?.last_read_at, userId);
        return { conversationId, unread };
      })
    );

    unreadCounts.forEach(({ conversationId, unread }) => {
      const conv = conversationMap.get(conversationId);
      if (conv) {
        conv.unread_count = unread;
      }
    });

    return (conversations || [])
      .map((conversation) => conversationMap.get(conversation.id))
      .filter(Boolean) as Conversation[];
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const userId = await this.requireUserId();

    const { data: conversation, error: conversationError } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (conversationError) throw conversationError;

    const { data: participants, error: participantsError } = await this.supabase
      .from('conversation_participants')
      .select('id, conversation_id, user_id, joined_at, last_read_at, user:profiles(id, username, display_name, avatar_url)')
      .eq('conversation_id', conversationId);

    if (participantsError) throw participantsError;

    const { data: lastMessage, error: lastMessageError } = await this.supabase
      .from('messages')
      .select('id, conversation_id, content, sender_id, message_type, created_at, metadata, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastMessageError) throw lastMessageError;

    const selfParticipant = (participants || []).find((participant) => participant.user_id === userId);
    const unreadCount = await this.getUnreadCount(conversationId, selfParticipant?.last_read_at, userId);

    return {
      ...conversation,
      participants: (participants || []) as ConversationParticipant[],
      last_message: (lastMessage && lastMessage[0]) || null,
      unread_count: unreadCount,
    };
  }

  async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const { data, error } = await this.supabase
      .from('conversation_participants')
      .select('id, conversation_id, user_id, joined_at, last_read_at, user:profiles(id, username, display_name, avatar_url)')
      .eq('conversation_id', conversationId);

    if (error) throw error;
    return (data || []) as ConversationParticipant[];
  }

  async getConversationMessages(conversationId: string, limit = 50, before?: string): Promise<ConversationMessage[]> {
    const now = new Date().toISOString();
    let query = this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .or(`expires_at.is.null,expires_at.gt.${now},is_pinned.eq.true`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;
    if (error) throw error;

    const nowMs = Date.now();
    const visibleMessages = (messages || []).filter((msg: any) => {
      if (!msg.expires_at) return true;
      const expiresAt = new Date(msg.expires_at).getTime();
      if (expiresAt > nowMs) return true;
      if (msg.is_pinned) {
        if (!msg.pinned_until) return true;
        return new Date(msg.pinned_until).getTime() > nowMs;
      }
      return false;
    });

    const enrichedMessages = await Promise.all(
      visibleMessages.map(async (msg: any) => {
        const { data: sender } = await this.supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();

        const { data: reactions } = await this.supabase
          .from('message_reactions')
          .select('id, emoji, user_id, created_at')
          .eq('message_id', msg.id);

        let reply_to: ConversationMessage | null = null;
        if (msg.reply_to_id) {
          const { data: replyMsg } = await this.supabase
            .from('messages')
            .select('id, content, sender_id')
            .eq('id', msg.reply_to_id)
            .single();

          if (replyMsg) {
            const { data: replySender } = await this.supabase
              .from('profiles')
              .select('id, username, display_name, avatar_url')
              .eq('id', replyMsg.sender_id)
              .single();

            reply_to = { ...replyMsg, sender: replySender || null } as ConversationMessage;
          }
        }

        let thread_messages_count = 0;
        if (msg.thread_id) {
          const { count } = await this.supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', msg.thread_id);
          thread_messages_count = count || 0;
        }

        return {
          ...msg,
          sender,
          reactions: reactions || [],
          reply_to,
          thread_messages_count,
        } as ConversationMessage;
      })
    );

    return enrichedMessages.reverse();
  }

  async sendConversationMessage(input: SendConversationMessageInput): Promise<ConversationMessage> {
    const userId = await this.requireUserId();

    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: input.conversation_id,
        sender_id: userId,
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
      .select('*, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
      .single();

    if (error) throw error;
    return data as ConversationMessage;
  }

  async updateMessage(messageId: string, content: string): Promise<ConversationMessage> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({
        content,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select('*, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
      .single();

    if (error) throw error;
    return data as ConversationMessage;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  }

  async pinMessage(messageId: string, pinnedUntil?: string | null, keep?: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({
        is_pinned: true,
        pinned_at: new Date().toISOString(),
        pinned_until: pinnedUntil || null,
        is_kept: keep || false,
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  async unpinMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({
        is_pinned: false,
        pinned_at: null,
        pinned_until: null,
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  async getPinnedMessages(conversationId: string): Promise<ConversationMessage[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
      .eq('conversation_id', conversationId)
      .eq('is_pinned', true)
      .is('deleted_at', null)
      .or(`pinned_until.is.null,pinned_until.gt.${now}`)
      .order('pinned_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ConversationMessage[];
  }

  async addReaction(messageId: string, reaction: string): Promise<void> {
    const userId = await this.requireUserId();

    const { data: existingReaction } = await this.supabase
      .from('message_reactions')
      .select('emoji')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingReaction) {
      if ((existingReaction as any).emoji !== reaction) {
        await this.supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', userId);
      } else {
        await this.supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', userId)
          .eq('emoji', reaction);
        return;
      }
    }

    const { error } = await this.supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji: reaction,
      });

    if (error) throw error;
  }

  async removeReaction(messageId: string, reaction: string): Promise<void> {
    const userId = await this.requireUserId();

    const { error } = await this.supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', reaction);

    if (error) throw error;
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    const userId = await this.requireUserId();

    const { error } = await this.supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getOrCreateDirectConversation(otherUserId: string): Promise<Conversation> {
    const { data, error } = await this.supabase
      .rpc('get_or_create_direct_conversation', { other_user_id: otherUserId });

    if (error) throw error;
    const conversationId = data as string;
    return this.getConversation(conversationId);
  }

  async createGroupConversation(input: CreateGroupConversationInput): Promise<Conversation> {
    const userId = await this.requireUserId();
    const uniqueParticipantIds = Array.from(new Set([userId, ...input.participant_ids]));

    const { data: conversation, error: conversationError } = await this.supabase
      .from('conversations')
      .insert({
        name: input.name,
        is_group: true,
        created_by: userId,
      })
      .select('*')
      .single();

    if (conversationError) throw conversationError;

    const { error: participantError } = await this.supabase
      .from('conversation_participants')
      .insert(
        uniqueParticipantIds.map((participantId) => ({
          conversation_id: conversation.id,
          user_id: participantId,
        }))
      );

    if (participantError) throw participantError;

    return this.getConversation(conversation.id);
  }

  async searchUsers(query: string, limit = 10): Promise<SearchUserResult[]> {
    if (!query.trim()) return [];

    const { data, error } = await this.supabase
      .rpc('search_users', { p_query: query, p_limit: limit });

    if (error) throw error;
    return (data || []) as SearchUserResult[];
  }
}

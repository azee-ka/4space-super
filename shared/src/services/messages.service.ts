// shared/src/services/messages.service.ts
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Room {
  id: string;
  space_id: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'video' | 'thread' | 'announcement';
  category?: string;
  icon?: string;
  color?: string;
  is_private: boolean;
  is_archived: boolean;
  parent_room_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  message_count: number;
  metadata?: any;
  unread_count?: number;
}

export interface Message {
  id: string;
  room_id: string;
  space_id: string;
  sender_id: string;
  encrypted_content: string;
  content?: string;
  message_type: 'text' | 'image' | 'file' | 'code' | 'poll' | 'voice' | 'video' | 'ai_response';
  reply_to_id?: string;
  forward_from_id?: string;
  thread_id?: string;
  edited_at?: string;
  deleted_at?: string;
  is_pinned: boolean;
  is_system: boolean;
  ttl?: number;
  expires_at?: string;
  attachments?: any[];
  ai_context?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Relations
  sender?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    status?: string;
  };
  reactions?: MessageReaction[];
  read_receipts?: ReadReceipt[];
  reply_to?: Message;
  thread_messages_count?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
  user?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface ReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
  user?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at?: string;
  notification_preference: 'all' | 'mentions' | 'none';
  is_muted: boolean;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    status?: string;
  };
}

export interface Poll {
  id: string;
  message_id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: string[]; // user IDs
  }>;
  allows_multiple: boolean;
  expires_at?: string;
  created_at: string;
}

export interface SendMessageInput {
  room_id: string;
  space_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'code' | 'poll' | 'voice' | 'video';
  reply_to_id?: string;
  attachments?: any[];
  metadata?: any;
}

export interface CreateRoomInput {
  space_id: string;
  name: string;
  description?: string;
  type?: 'text' | 'voice' | 'video' | 'thread' | 'announcement';
  category?: string;
  icon?: string;
  color?: string;
  is_private?: boolean;
}

export class MessagesService {
  constructor(private supabase: SupabaseClient) {}

  // ============================================
  // ROOMS
  // ============================================

  async getSpaceRooms(spaceId: string): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('space_id', spaceId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get unread counts for each room
    const roomsWithUnread = await Promise.all(
      (data || []).map(async (room) => {
        const unread = await this.getUnreadCount(room.id);
        return { ...room, unread_count: unread };
      })
    );

    return roomsWithUnread;
  }

  async getRoom(roomId: string): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return data;
  }

  async createRoom(input: CreateRoomInput): Promise<Room> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        ...input,
        created_by: user.id,
        type: input.type || 'text',
        is_private: input.is_private || false,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin
    await this.supabase
      .from('room_members')
      .insert({
        room_id: data.id,
        user_id: user.id,
        role: 'admin',
      });

    return data;
  }

  async updateRoom(roomId: string, updates: Partial<CreateRoomInput>): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRoom(roomId: string): Promise<void> {
    const { error } = await this.supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;
  }

  // ============================================
  // MESSAGES
  // ============================================

  async getRoomMessages(roomId: string, limit = 50, before?: string): Promise<Message[]> {
    let query = this.supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url, status),
        reactions:message_reactions(
          id,
          reaction,
          user:profiles(username, display_name, avatar_url)
        ),
        reply_to:messages!messages_reply_to_id_fkey(
          id,
          content,
          sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url)
        )
      `)
      .eq('room_id', roomId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get thread message counts
    const messagesWithThreadCount = await Promise.all(
      (data || []).map(async (msg) => {
        if (msg.thread_id) {
          const { count } = await this.supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', msg.thread_id);
          return { ...msg, thread_messages_count: count || 0 };
        }
        return msg;
      })
    );

    return messagesWithThreadCount.reverse();
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // For now, we'll store content as both encrypted and plain
    // In production, encrypt the content properly
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        room_id: input.room_id,
        space_id: input.space_id,
        sender_id: user.id,
        encrypted_content: input.content, // TODO: Encrypt properly
        content: input.content,
        message_type: input.message_type || 'text',
        reply_to_id: input.reply_to_id,
        attachments: input.attachments || [],
        metadata: input.metadata || {},
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url, status)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateMessage(messageId: string, content: string): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({
        content,
        encrypted_content: content, // TODO: Encrypt properly
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url, status)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  }

  async pinMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({ is_pinned: true })
      .eq('id', messageId);

    if (error) throw error;
  }

  async unpinMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({ is_pinned: false })
      .eq('id', messageId);

    if (error) throw error;
  }

  async getPinnedMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('room_id', roomId)
      .eq('is_pinned', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // REACTIONS
  // ============================================

  async addReaction(messageId: string, reaction: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: user.id,
        reaction,
      });

    if (error) throw error;
  }

  async removeReaction(messageId: string, reaction: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('reaction', reaction);

    if (error) throw error;
  }

  // ============================================
  // READ RECEIPTS
  // ============================================

  async markAsRead(messageId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await this.supabase
      .from('message_read_receipts')
      .upsert({
        message_id: messageId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      });
  }

  async markRoomAsRead(roomId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update last_read_at in room_members
    await this.supabase
      .from('room_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id);
  }

  async getUnreadCount(roomId: string): Promise<number> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return 0;

    // Get last read time
    const { data: membership } = await this.supabase
      .from('room_members')
      .select('last_read_at')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!membership) return 0;

    // Count messages after last read
    const { count } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .neq('sender_id', user.id)
      .is('deleted_at', null);

    if (membership.last_read_at) {
      const { count: unreadCount } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .neq('sender_id', user.id)
        .is('deleted_at', null)
        .gt('created_at', membership.last_read_at);
      
      return unreadCount || 0;
    }

    return count || 0;
  }

  // ============================================
  // BOOKMARKS
  // ============================================

  async bookmarkMessage(messageId: string, note?: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from('message_bookmarks')
      .insert({
        message_id: messageId,
        user_id: user.id,
        note,
      });

    if (error) throw error;
  }

  async removeBookmark(messageId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from('message_bookmarks')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async getBookmarkedMessages(spaceId: string): Promise<Message[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('message_bookmarks')
      .select(`
        note,
        message:messages(
          *,
          sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .eq('message.space_id', spaceId);

    if (error) throw error;
    return (data || []).map(b => b.message as any);
  }

  // ============================================
  // SEARCH
  // ============================================

  async searchMessages(roomId: string, query: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('room_id', roomId)
      .is('deleted_at', null)
      .textSearch('content', query)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // ROOM MEMBERS
  // ============================================

  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    const { data, error } = await this.supabase
      .from('room_members')
      .select(`
        *,
        user:profiles(id, username, display_name, avatar_url, status)
      `)
      .eq('room_id', roomId);

    if (error) throw error;
    return data || [];
  }

  async addRoomMember(roomId: string, userId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<void> {
    const { error } = await this.supabase
      .from('room_members')
      .insert({
        room_id: roomId,
        user_id: userId,
        role,
      });

    if (error) throw error;
  }

  async removeRoomMember(roomId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async updateRoomMemberRole(roomId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<void> {
    const { error } = await this.supabase
      .from('room_members')
      .update({ role })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
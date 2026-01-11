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
  content: string; // Using content, not encrypted_content
  message_type?: string;
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
  role: string; // Using string instead of enum
  joined_at: string;
  last_read_at?: string;
  notification_preference: string;
  is_muted: boolean;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface SendMessageInput {
  room_id: string;
  space_id: string;
  content: string;
  message_type?: string;
  reply_to_id?: string;
  attachments?: any[];
  metadata?: any;
}

export interface CreateRoomInput {
  space_id: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  icon?: string;
  color?: string;
  is_private?: boolean;
}

export class MessagesService {
  constructor(private readonly supabase: SupabaseClient<any>) {}

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
  
    // Don't fetch unread counts here - too slow
    // Let the UI fetch them separately if needed
    return (data || []).map(room => ({ ...room, unread_count: 0 }));
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
  
    // Verify user is a member of the space
    const { data: spaceMember } = await this.supabase
      .from('space_members')
      .select('id')
      .eq('space_id', input.space_id)
      .eq('user_id', user.id)
      .maybeSingle();
  
    if (!spaceMember) {
      throw new Error('You must be a member of the space to create rooms');
    }
  
    // Create the room
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        space_id: input.space_id,
        name: input.name,
        description: input.description,
        type: input.type || 'text',
        category: input.category,
        icon: input.icon,
        color: input.color,
        is_private: input.is_private || false,
        is_archived: false,
        message_count: 0,
        created_by: user.id,
      })
      .select()
      .single();
  
    if (error) {
      console.error('[MessagesService] Failed to create room:', error);
      throw error;
    }
  
    console.log('[MessagesService] Room created:', data.id);
  
    // Add creator as admin member - THIS IS CRITICAL
    const { error: memberError } = await this.supabase
      .from('room_members')
      .insert({
        room_id: data.id,
        user_id: user.id,
        role: 'admin',
        notification_preference: 'all',
        is_muted: false,
      });
  
    if (memberError) {
      console.error('[MessagesService] Failed to add creator as room member:', memberError);
      // This is critical - if this fails, the user won't be able to use the room
      // Consider deleting the room if member creation fails
      throw new Error('Failed to join room after creation');
    }
  
    console.log('[MessagesService] Creator added as admin member');
  
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
      .select('*')  // Just get messages, no joins
      .eq('room_id', roomId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
  
    if (before) {
      query = query.lt('created_at', before);
    }
  
    const { data: messages, error } = await query;
  
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  
    // Enrich each message separately
    const enrichedMessages = await Promise.all(
      (messages || []).map(async (msg) => {
        // Fetch sender
        const { data: sender } = await this.supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();
  
        // Fetch reactions
        const { data: reactions } = await this.supabase
          .from('message_reactions')
          .select('id, emoji, user_id, created_at')
          .eq('message_id', msg.id);
  
        // Fetch reply_to if exists
        let reply_to = null;
        if (msg.reply_to_id) {
          const { data: replyMsg } = await this.supabase
            .from('messages')
            .select('id, content')
            .eq('id', msg.reply_to_id)
            .single();
  
          if (replyMsg) {
            const { data: replySender } = await this.supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', replyMsg.sender_id)
              .single();
            
            reply_to = { ...replyMsg, sender: replySender };
          }
        }
  
        // Thread count
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
          reply_to,  // Will be null if no reply, not an empty array
          thread_messages_count,
        };
      })
    );
  
    return enrichedMessages.reverse();
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
  
    console.log('Sending message:', { input, user: user.id }); // Debug log
  
    const { data, error } = await this.supabase
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
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .single();
  
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  
    console.log('Message sent successfully:', data); // Debug log
    return data;
  }

  async updateMessage(messageId: string, content: string): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({
        content,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)
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
        emoji: reaction,
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
      .eq('emoji', reaction);

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

    await this.supabase
      .from('room_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id);
  }

  async getUnreadCount(roomId: string): Promise<number> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return 0;

    const { data: membership } = await this.supabase
      .from('room_members')
      .select('last_read_at')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!membership) return 0;

    if (membership.last_read_at) {
      const { count } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .neq('sender_id', user.id)
        .is('deleted_at', null)
        .gt('created_at', membership.last_read_at);
      
      return count || 0;
    }

    const { count } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .neq('sender_id', user.id)
      .is('deleted_at', null);

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
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  // ============================================
  // ROOM MEMBERS
  // ============================================

  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    // First get room members
    const { data: members, error: membersError } = await this.supabase
      .from('room_members')
      .select('*')
      .eq('room_id', roomId);
  
    if (membersError) {
      console.error('Error fetching room members:', membersError);
      throw membersError;
    }
  
    if (!members || members.length === 0) return [];
  
    // Then get user data separately - WITHOUT status field
    const userIds = members.map(m => m.user_id);
    const { data: users } = await this.supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url') // REMOVED status
      .in('id', userIds);
  
    // Combine them
    return members.map(member => ({
      ...member,
      user: users?.find(u => u.id === member.user_id),
    }));
  }

  async addRoomMember(roomId: string, userId: string, role: string = 'member'): Promise<void> {
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

  async updateRoomMemberRole(roomId: string, userId: string, role: string): Promise<void> {
    const { error } = await this.supabase
      .from('room_members')
      .update({ role })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
// Real-time Messaging Service with Advanced Features
// web/src/services/realtime.service.ts

import { supabase } from '../lib/supabase';
import { type RealtimeChannel, type RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface Message {
  id: string;
  space_id: string;
  sender_id: string;
  encrypted_content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'poll' | 'sticker' | 'voice' | 'contact';
  reply_to_id?: string;
  forward_from_id?: string;
  edited_at?: string;
  deleted_at?: string;
  is_pinned: boolean;
  ttl?: number;
  expires_at?: string;
  metadata?: any;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    status: string;
  };
  reactions?: MessageReaction[];
  read_receipts?: ReadReceipt[];
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
  };
}

export interface TypingIndicator {
  space_id: string;
  user_id: string;
  user?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  started_at: string;
}

export interface OnlineStatus {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen: string;
}

type MessageCallback = (message: Message) => void;
type TypingCallback = (indicators: TypingIndicator[]) => void;
type StatusCallback = (status: OnlineStatus) => void;
type ReactionCallback = (reaction: MessageReaction) => void;
type ReadReceiptCallback = (receipt: ReadReceipt) => void;

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceChannels: Map<string, RealtimeChannel> = new Map();
  private typingTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Subscribe to a space for real-time messages
   */
  subscribeToSpace(
    spaceId: string,
    callbacks: {
      onMessage?: MessageCallback;
      onMessageUpdate?: MessageCallback;
      onMessageDelete?: MessageCallback;
      onTyping?: TypingCallback;
      onReaction?: ReactionCallback;
      onReadReceipt?: ReadReceiptCallback;
    }
  ): RealtimeChannel {
    const channelId = `space:${spaceId}`;
    
    // Check if already subscribed
    if (this.channels.has(channelId)) {
      return this.channels.get(channelId)!;
    }

    const channel = supabase
      .channel(channelId, {
        config: {
          broadcast: { self: true },
          presence: { key: 'user_id' },
        },
      })
      // Listen for new messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `space_id=eq.${spaceId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          if (callbacks.onMessage && payload.new) {
            // Fetch sender details
            const messageWithSender = await this.enrichMessage(payload.new as Message);
            callbacks.onMessage(messageWithSender);
          }
        }
      )
      // Listen for message updates (edits)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `space_id=eq.${spaceId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          if (callbacks.onMessageUpdate && payload.new) {
            const messageWithSender = await this.enrichMessage(payload.new as Message);
            callbacks.onMessageUpdate(messageWithSender);
          }
        }
      )
      // Listen for message deletes
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          if (callbacks.onMessageDelete && payload.old) {
            callbacks.onMessageDelete(payload.old as Message);
          }
        }
      )
      // Listen for typing indicators
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `space_id=eq.${spaceId}`,
        },
        async () => {
          if (callbacks.onTyping) {
            const indicators = await this.getTypingIndicators(spaceId);
            callbacks.onTyping(indicators);
          }
        }
      )
      // Listen for reactions
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        async (payload: RealtimePostgresChangesPayload<MessageReaction>) => {
          if (callbacks.onReaction && payload.new) {
            const reaction = await this.enrichReaction(payload.new as MessageReaction);
            callbacks.onReaction(reaction);
          }
        }
      )
      // Listen for read receipts
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts',
        },
        async (payload: RealtimePostgresChangesPayload<ReadReceipt>) => {
          if (callbacks.onReadReceipt && payload.new) {
            const receipt = await this.enrichReadReceipt(payload.new as ReadReceipt);
            callbacks.onReadReceipt(receipt);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Space ${spaceId} subscription status:`, status);
      });

    this.channels.set(channelId, channel);
    return channel;
  }

  /**
   * Subscribe to user presence/online status
   */
  subscribeToPresence(
    spaceId: string,
    userId: string,
    onStatusChange: StatusCallback
  ): RealtimeChannel {
    const channelId = `presence:${spaceId}`;

    if (this.presenceChannels.has(channelId)) {
      return this.presenceChannels.get(channelId)!;
    }

    const channel = supabase
      .channel(channelId, {
        config: {
          presence: { key: userId },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            onStatusChange({
              user_id: presence.user_id,
              status: presence.status || 'online',
              last_seen: new Date().toISOString(),
            });
          });
        });
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          onStatusChange({
            user_id: presence.user_id,
            status: 'online',
            last_seen: new Date().toISOString(),
          });
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          onStatusChange({
            user_id: presence.user_id,
            status: 'offline',
            last_seen: new Date().toISOString(),
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            status: 'online',
            online_at: new Date().toISOString(),
          });
        }
      });

    this.presenceChannels.set(channelId, channel);
    return channel;
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(spaceId: string, userId: string): Promise<void> {
    const key = `${spaceId}:${userId}`;
    
    // Clear existing timeout
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
    }

    // Insert/update typing indicator
    await supabase
      .from('typing_indicators')
      .upsert({
        space_id: spaceId,
        user_id: userId,
        started_at: new Date().toISOString(),
      });

    // Auto-remove after 5 seconds of inactivity
    const timeout = setTimeout(async () => {
      await this.removeTypingIndicator(spaceId, userId);
    }, 5000);

    this.typingTimeouts.set(key, timeout);
  }

  /**
   * Remove typing indicator
   */
  async removeTypingIndicator(spaceId: string, userId: string): Promise<void> {
    const key = `${spaceId}:${userId}`;
    
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
      this.typingTimeouts.delete(key);
    }

    await supabase
      .from('typing_indicators')
      .delete()
      .eq('space_id', spaceId)
      .eq('user_id', userId);
  }

  /**
   * Get current typing indicators
   */
  private async getTypingIndicators(spaceId: string): Promise<TypingIndicator[]> {
    const { data, error } = await supabase
      .from('typing_indicators')
      .select(`
        *,
        user:profiles(username, display_name, avatar_url)
      `)
      .eq('space_id', spaceId)
      .gte('started_at', new Date(Date.now() - 30000).toISOString()); // Last 30 seconds

    if (error) {
      console.error('Error fetching typing indicators:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Mark messages as read
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    await supabase
      .from('message_read_receipts')
      .upsert({
        message_id: messageId,
        user_id: userId,
        read_at: new Date().toISOString(),
      });
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, userId: string, reaction: string): Promise<void> {
    await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: userId,
        reaction,
        created_at: new Date().toISOString(),
      });
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: string, userId: string, reaction: string): Promise<void> {
    await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction', reaction);
  }

  /**
   * Enrich message with sender details
   */
  private async enrichMessage(message: Message): Promise<Message> {
    const { data: sender } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, status')
      .eq('id', message.sender_id)
      .single();

    return {
      ...message,
      sender: sender || undefined,
    };
  }

  /**
   * Enrich reaction with user details
   */
  private async enrichReaction(reaction: MessageReaction): Promise<MessageReaction> {
    const { data: user } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', reaction.user_id)
      .single();

    return {
      ...reaction,
      user: user || undefined,
    };
  }

  /**
   * Enrich read receipt with user details
   */
  private async enrichReadReceipt(receipt: ReadReceipt): Promise<ReadReceipt> {
    const { data: user } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', receipt.user_id)
      .single();

    return {
      ...receipt,
      user: user || undefined,
    };
  }

  /**
   * Update user online status
   */
  async updateOnlineStatus(userId: string, status: 'online' | 'offline' | 'away'): Promise<void> {
    await supabase
      .from('profiles')
      .update({
        status,
        last_seen: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  /**
   * Unsubscribe from a space
   */
  unsubscribeFromSpace(spaceId: string): void {
    const channelId = `space:${spaceId}`;
    const channel = this.channels.get(channelId);

    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }

    // Also unsubscribe from presence
    const presenceChannelId = `presence:${spaceId}`;
    const presenceChannel = this.presenceChannels.get(presenceChannelId);

    if (presenceChannel) {
      supabase.removeChannel(presenceChannel);
      this.presenceChannels.delete(presenceChannelId);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.presenceChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.presenceChannels.clear();
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  /**
   * Broadcast custom event to space
   */
  async broadcastEvent(
    spaceId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    const channelId = `space:${spaceId}`;
    const channel = this.channels.get(channelId);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: eventType,
        payload,
      });
    }
  }
}

export const realtimeService = new RealtimeService();
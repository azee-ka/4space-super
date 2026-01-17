// shared/src/services/settings.service.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_ROOM_MEMBER_SETTINGS,
  DEFAULT_ROOM_SETTINGS,
  DEFAULT_SPACE_SETTINGS,
  DEFAULT_USER_CHAT_SETTINGS,
  type MessageRetention,
  type RoomMemberSettings,
  type RoomSettings,
  type SpaceSettings,
  type UserChatSettings,
} from '../types/chatSettings';
import { formatMessageRetention } from '../utils/messageRetention';

function mergeRoomOverrides(
  base: Record<string, any>,
  updates?: Record<string, any>
) {
  if (!updates) return base;
  const merged = { ...base };
  Object.entries(updates).forEach(([key, value]) => {
    const existing = merged[key] || {};
    const next = { ...existing, ...value };
    if ((value as any)?.theme) {
      next.theme = { ...(existing.theme || {}), ...(value as any).theme };
    }
    merged[key] = next;
  });
  return merged;
}

function mergeUserChatSettings(
  base: UserChatSettings,
  updates?: Partial<UserChatSettings>
): UserChatSettings {
  if (!updates) return base;

  return {
    ...base,
    ...updates,
    theme: updates.theme ? { ...base.theme, ...updates.theme } : base.theme,
    roomSettings: mergeRoomOverrides(base.roomSettings, updates.roomSettings),
    categorySettings: mergeRoomOverrides(base.categorySettings, updates.categorySettings),
  };
}

function mergeRoomSettings(
  base: RoomSettings,
  updates?: Partial<RoomSettings>
): RoomSettings {
  if (!updates) return base;

  return {
    ...base,
    ...updates,
    autoModeration: updates.autoModeration
      ? { ...base.autoModeration, ...updates.autoModeration }
      : base.autoModeration,
  };
}

function mergeSpaceSettings(
  base: SpaceSettings,
  updates?: Partial<SpaceSettings>
): SpaceSettings {
  if (!updates) return base;
  return { ...base, ...updates };
}

export class SettingsService {
  constructor(private readonly supabase: SupabaseClient<any>) {}

  private async requireUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user;
  }

  private async getUserLabel(userId: string) {
    const { data } = await this.supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', userId)
      .single();
    return data?.display_name || data?.username || 'Someone';
  }

  private async logMessageRetentionChange(
    roomId: string,
    previous: MessageRetention,
    next: MessageRetention
  ) {
    if (previous === next) return;

    const user = await this.requireUser();
    const userLabel = await this.getUserLabel(user.id);
    const label = formatMessageRetention(next);
    const content =
      next === 'forever'
        ? `${userLabel} turned off disappearing messages.`
        : `${userLabel} set disappearing messages to ${label}.`;

    const { data: room } = await this.supabase
      .from('rooms')
      .select('space_id')
      .eq('id', roomId)
      .single();

    if (!room?.space_id) return;

    const { error } = await this.supabase.from('messages').insert({
      room_id: roomId,
      space_id: room.space_id,
      sender_id: user.id,
      content,
      message_type: 'system',
      is_pinned: false,
      is_system: true,
      metadata: {
        event: 'message_retention_changed',
        previous,
        next,
      },
    });
    if (error) {
      console.error('[SettingsService] Failed to log retention change:', error);
    }
  }

  async getUserChatSettings(): Promise<UserChatSettings> {
    const user = await this.requireUser();

    const { data, error } = await this.supabase
      .from('user_chat_settings')
      .select('settings')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data?.settings) {
      await this.supabase
        .from('user_chat_settings')
        .insert({ user_id: user.id, settings: DEFAULT_USER_CHAT_SETTINGS });
      return DEFAULT_USER_CHAT_SETTINGS;
    }

    return mergeUserChatSettings(DEFAULT_USER_CHAT_SETTINGS, data.settings as Partial<UserChatSettings>);
  }

  async updateUserChatSettings(updates: Partial<UserChatSettings>): Promise<UserChatSettings> {
    const user = await this.requireUser();
    const current = await this.getUserChatSettings();
    const next = mergeUserChatSettings(current, updates);

    const { data, error } = await this.supabase
      .from('user_chat_settings')
      .upsert({ user_id: user.id, settings: next })
      .select('settings')
      .single();

    if (error) throw error;

    return mergeUserChatSettings(DEFAULT_USER_CHAT_SETTINGS, data.settings as Partial<UserChatSettings>);
  }

  async getSpaceSettings(spaceId: string): Promise<SpaceSettings> {
    const { data, error } = await this.supabase
      .from('space_settings')
      .select('settings')
      .eq('space_id', spaceId)
      .maybeSingle();

    if (error) throw error;

    if (!data?.settings) {
      await this.supabase
        .from('space_settings')
        .insert({ space_id: spaceId, settings: DEFAULT_SPACE_SETTINGS });
      return DEFAULT_SPACE_SETTINGS;
    }

    return mergeSpaceSettings(DEFAULT_SPACE_SETTINGS, data.settings as Partial<SpaceSettings>);
  }

  async updateSpaceSettings(spaceId: string, updates: Partial<SpaceSettings>): Promise<SpaceSettings> {
    const current = await this.getSpaceSettings(spaceId);
    const next = mergeSpaceSettings(current, updates);

    const { data, error } = await this.supabase
      .from('space_settings')
      .upsert({ space_id: spaceId, settings: next })
      .select('settings')
      .single();

    if (error) throw error;

    return mergeSpaceSettings(DEFAULT_SPACE_SETTINGS, data.settings as Partial<SpaceSettings>);
  }

  async getRoomSettings(roomId: string): Promise<RoomSettings> {
    const { data, error } = await this.supabase
      .from('room_settings')
      .select('settings')
      .eq('room_id', roomId)
      .maybeSingle();

    if (error) throw error;

    if (!data?.settings) {
      await this.supabase
        .from('room_settings')
        .insert({ room_id: roomId, settings: DEFAULT_ROOM_SETTINGS });
      return DEFAULT_ROOM_SETTINGS;
    }

    return mergeRoomSettings(DEFAULT_ROOM_SETTINGS, data.settings as Partial<RoomSettings>);
  }

  async updateRoomSettings(roomId: string, updates: Partial<RoomSettings>): Promise<RoomSettings> {
    const current = await this.getRoomSettings(roomId);
    const previousRetention = current.messageRetention;
    const next = mergeRoomSettings(current, updates);

    const { data, error } = await this.supabase
      .from('room_settings')
      .upsert({ room_id: roomId, settings: next })
      .select('settings')
      .single();

    if (error) throw error;

    const merged = mergeRoomSettings(DEFAULT_ROOM_SETTINGS, data.settings as Partial<RoomSettings>);
    if (updates.messageRetention && updates.messageRetention !== previousRetention) {
      await this.logMessageRetentionChange(roomId, previousRetention, updates.messageRetention);
    }
    return merged;
  }

  async updateRoomMessageRetention(
    roomId: string,
    retention: MessageRetention
  ): Promise<RoomSettings> {
    // Ensure user is authenticated
    const user = await this.requireUser();

    const current = await this.getRoomSettings(roomId);
    const { data, error } = await this.supabase.rpc('set_room_message_retention', {
      room_id_input: roomId,
      retention_input: retention,
    });

    if (error) throw error;

    const merged = mergeRoomSettings(DEFAULT_ROOM_SETTINGS, (data || {}) as Partial<RoomSettings>);
    await this.logMessageRetentionChange(roomId, current.messageRetention, retention);
    return merged;
  }

  async getRoomMemberSettings(roomId: string): Promise<RoomMemberSettings> {
    const user = await this.requireUser();

    const { data, error } = await this.supabase
      .from('room_members')
      .select('notification_preference, is_muted')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return DEFAULT_ROOM_MEMBER_SETTINGS;
    }

    return {
      notificationPreference: (data.notification_preference as RoomMemberSettings['notificationPreference']) || 'all',
      isMuted: data.is_muted ?? false,
    };
  }

  async updateRoomMemberSettings(
    roomId: string,
    updates: Partial<RoomMemberSettings>
  ): Promise<RoomMemberSettings> {
    const user = await this.requireUser();
    const current = await this.getRoomMemberSettings(roomId);
    const next = { ...current, ...updates };

    const { data, error } = await this.supabase
      .from('room_members')
      .upsert({
        room_id: roomId,
        user_id: user.id,
        notification_preference: next.notificationPreference,
        is_muted: next.isMuted,
      })
      .select('notification_preference, is_muted')
      .single();

    if (error) throw error;

    return {
      notificationPreference: (data.notification_preference as RoomMemberSettings['notificationPreference']) || 'all',
      isMuted: data.is_muted ?? false,
    };
  }
}

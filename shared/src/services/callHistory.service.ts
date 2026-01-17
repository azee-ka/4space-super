// Call History Service
import { SupabaseClient } from '@supabase/supabase-js';
import type { CallHistoryEntry } from '../types/callSession.types';

export class CallHistoryService {
  private supabase: any;
  private userId: string;

  constructor(supabase: any, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
  }

  async saveCallHistory(entry: Omit<CallHistoryEntry, 'id'>): Promise<void> {
    try {
      console.log('[CallHistory] Saving call history entry:', {
        sessionId: entry.sessionId,
        roomId: entry.roomId,
        userId: this.userId,
        type: entry.type,
        duration: entry.duration,
        participants: entry.participants.length
      });

      const { data, error } = await this.supabase
        .from('call_history')
        .insert({
          id: `call_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          session_id: entry.sessionId,
          room_id: entry.roomId,
          room_name: entry.roomName,
          user_id: this.userId,
          type: entry.type,
          started_at: entry.startedAt.toISOString(),
          ended_at: entry.endedAt.toISOString(),
          duration: entry.duration,
          participants: JSON.stringify(entry.participants),
          was_host: entry.wasHost,
          quality: entry.quality || 'good',
        })
        .select();

      if (error) {
        console.error('[CallHistory] Failed to save call history:', error);
        throw error;
      }

      console.log('[CallHistory] Successfully saved call history:', data);
    } catch (err) {
      console.error('[CallHistory] Error saving call history:', err);
      // Fallback to localStorage
      this.saveToLocalStorage({
        id: `call_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...entry
      });
      throw err;
    }
  }

  async getCallHistory(limit: number = 50): Promise<CallHistoryEntry[]> {
    try {
      // Get call history from all rooms the user is a member of
      // First get the room IDs the user is a member of
      const { data: roomData, error: roomError } = await this.supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', this.userId);

      if (roomError) {
        console.error('[CallHistory] Failed to fetch user rooms:', roomError);
        return [];
      }

      const roomIds = (roomData || []).map(r => r.room_id);

      if (roomIds.length === 0) {
        return [];
      }

      const { data, error } = await this.supabase
        .from('call_history')
        .select('*')
        .in('room_id', roomIds)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[CallHistory] Failed to fetch:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        sessionId: row.session_id,
        roomId: row.room_id,
        roomName: row.room_name,
        type: row.type,
        startedAt: new Date(row.started_at),
        endedAt: new Date(row.ended_at),
        duration: row.duration,
        participants: JSON.parse(row.participants || '[]'),
        wasHost: row.was_host,
        quality: row.quality,
      }));
    } catch (err) {
      console.error('[CallHistory] Error fetching:', err);
      return [];
    }
  }

  async getRecentCalls(roomId: string, limit: number = 10): Promise<CallHistoryEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('call_history')
        .select('*')
        .eq('room_id', roomId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[CallHistory] Failed to fetch recent calls:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        sessionId: row.session_id,
        roomId: row.room_id,
        roomName: row.room_name,
        type: row.type,
        startedAt: new Date(row.started_at),
        endedAt: new Date(row.ended_at),
        duration: row.duration,
        participants: JSON.parse(row.participants || '[]'),
        wasHost: row.was_host,
        quality: row.quality,
      }));
    } catch (err) {
      console.error('[CallHistory] Error fetching recent calls:', err);
      return [];
    }
  }

  // Store in localStorage as fallback
  saveToLocalStorage(entry: CallHistoryEntry): void {
    try {
      const history = this.getFromLocalStorage();
      history.unshift(entry);
      localStorage.setItem(`call_history_${this.userId}`, JSON.stringify(history.slice(0, 100)));
    } catch (err) {
      console.error('[CallHistory] LocalStorage save failed:', err);
    }
  }

  getFromLocalStorage(): CallHistoryEntry[] {
    try {
      const stored = localStorage.getItem(`call_history_${this.userId}`);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((entry: any) => ({
        ...entry,
        startedAt: new Date(entry.startedAt),
        endedAt: new Date(entry.endedAt),
        participants: entry.participants.map((p: any) => ({
          ...p,
          joinedAt: new Date(p.joinedAt),
          leftAt: new Date(p.leftAt),
        })),
      }));
    } catch (err) {
      console.error('[CallHistory] LocalStorage read failed:', err);
      return [];
    }
  }
}

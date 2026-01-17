// Call History Service
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CallHistoryEntry, CallSession } from '../types/callSession.types';

export class CallHistoryService {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(supabaseUrl: string, supabaseKey: string, userId: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.userId = userId;
  }

  async saveCallHistory(entry: Omit<CallHistoryEntry, 'id'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('call_history')
        .insert({
          ...entry,
          user_id: this.userId,
          started_at: entry.startedAt.toISOString(),
          ended_at: entry.endedAt.toISOString(),
          participants: JSON.stringify(entry.participants),
        });

      if (error) {
        console.error('[CallHistory] Failed to save:', error);
      }
    } catch (err) {
      console.error('[CallHistory] Error saving:', err);
    }
  }

  async getCallHistory(limit: number = 50): Promise<CallHistoryEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('call_history')
        .select('*')
        .eq('user_id', this.userId)
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
        .eq('user_id', this.userId)
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

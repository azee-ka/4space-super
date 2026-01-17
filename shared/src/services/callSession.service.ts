// Call Session Management Service
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { CallSession, ScreenShareSession, InCallMessage, Reaction, RaisedHand } from '../types/callSession.types';

export class CallSessionService {
  private supabase: any;
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private userId: string;
  private sessionId: string;

  // Callbacks
  public onSessionCreated?: (session: CallSession) => void;
  public onSessionUpdated?: (session: CallSession) => void;
  public onSessionEnded?: (sessionId: string) => void;
  public onParticipantJoined?: (userId: string, userName: string) => void;
  public onParticipantLeft?: (userId: string) => void;
  public onMessageReceived?: (message: InCallMessage) => void;
  public onReactionReceived?: (reaction: Reaction) => void;
  public onHandRaised?: (hand: RaisedHand) => void;
  public onHandLowered?: (userId: string) => void;
  public onScreenShareStarted?: (session: ScreenShareSession) => void;
  public onScreenShareEnded?: (sessionId: string) => void;

  constructor(supabase: any, roomId: string, userId: string) {
    this.supabase = supabase;
    this.roomId = roomId;
    this.userId = userId;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private static parseJsonArray<T>(value: unknown): T[] {
    if (value == null) return [];
    if (Array.isArray(value)) return value as T[];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
      } catch (err) {
        console.warn('[CallSession] Failed to parse JSON array field:', err);
        return [];
      }
    }
    return [];
  }

  static normalizeSessionRow(row: any): CallSession {
    return {
      id: row.id,
      roomId: row.room_id,
      roomName: row.room_name,
      hostId: row.host_id,
      hostName: row.host_name,
      title: row.title,
      description: row.description,
      purpose: row.purpose,
      guidelines: CallSessionService.parseJsonArray<string>(row.guidelines),
      type: row.type,
      startedAt: row.started_at ? new Date(row.started_at) : new Date(),
      endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
      participantCount: row.participant_count,
      participants: CallSessionService.parseJsonArray<string>(row.participants),
      isRecording: row.is_recording,
      isActive: row.is_active,
      maxParticipants: row.max_participants,
      requiresApproval: row.requires_approval,
    };
  }

  async createSession(data: {
    roomName: string;
    hostName: string;
    title: string;
    description?: string;
    purpose?: string;
    guidelines?: string[];
    type: 'voice' | 'video' | 'screen-share';
    maxParticipants?: number;
    requiresApproval?: boolean;
  }): Promise<CallSession> {
    const session: CallSession = {
      id: this.sessionId,
      roomId: this.roomId,
      roomName: data.roomName,
      hostId: this.userId,
      hostName: data.hostName,
      title: data.title,
      description: data.description,
      purpose: data.purpose,
      guidelines: data.guidelines,
      type: data.type,
      startedAt: new Date(),
      participantCount: 1,
      participants: [this.userId],
      isRecording: false,
      isActive: true,
      maxParticipants: data.maxParticipants,
      requiresApproval: data.requiresApproval || false,
    };

    // Setup realtime channel
    this.channel = this.supabase.channel(`call-session-${this.roomId}`, {
      config: { broadcast: { self: false } },
    });

    this.setupSessionListeners();

    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel!.send({
          type: 'broadcast',
          event: 'session-created',
          payload: session,
        });
      }
    });

    // Store in database
    try {
      await this.supabase.from('call_sessions').insert({
        id: session.id,
        room_id: session.roomId,
        room_name: session.roomName,
        host_id: session.hostId,
        host_name: session.hostName,
        title: session.title,
        description: session.description,
        purpose: session.purpose,
        guidelines: session.guidelines || [],
        type: session.type,
        started_at: session.startedAt.toISOString(),
        participant_count: session.participantCount,
        participants: session.participants,
        is_recording: session.isRecording,
        is_active: session.isActive,
        max_participants: session.maxParticipants,
        requires_approval: session.requiresApproval,
      });
    } catch (err) {
      console.error('[CallSession] Failed to store session:', err);
    }

    return session;
  }

  private setupSessionListeners() {
    if (!this.channel) return;

    this.channel
      .on('broadcast', { event: 'session-created' }, ({ payload }) => {
        this.onSessionCreated?.(payload);
      })
      .on('broadcast', { event: 'session-updated' }, ({ payload }) => {
        this.onSessionUpdated?.(payload);
      })
      .on('broadcast', { event: 'session-ended' }, ({ payload }) => {
        this.onSessionEnded?.(payload.sessionId);
      })
      .on('broadcast', { event: 'participant-joined' }, ({ payload }) => {
        this.onParticipantJoined?.(payload.userId, payload.userName);
      })
      .on('broadcast', { event: 'participant-left' }, ({ payload }) => {
        this.onParticipantLeft?.(payload.userId);
      })
      .on('broadcast', { event: 'chat-message' }, ({ payload }) => {
        this.onMessageReceived?.(payload);
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        this.onReactionReceived?.(payload);
      })
      .on('broadcast', { event: 'hand-raised' }, ({ payload }) => {
        this.onHandRaised?.(payload);
      })
      .on('broadcast', { event: 'hand-lowered' }, ({ payload }) => {
        this.onHandLowered?.(payload.userId);
      })
      .on('broadcast', { event: 'screen-share-started' }, ({ payload }) => {
        this.onScreenShareStarted?.(payload);
      })
      .on('broadcast', { event: 'screen-share-ended' }, ({ payload }) => {
        this.onScreenShareEnded?.(payload.sessionId);
      });
  }

  async sendChatMessage(message: string) {
    if (!this.channel) return;

    const msg: InCallMessage = {
      id: `msg_${Date.now()}`,
      userId: this.userId,
      userName: 'You', // Will be replaced with actual name
      message,
      timestamp: new Date(),
      type: 'text',
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: msg,
    });
  }

  async sendReaction(emoji: string) {
    if (!this.channel) return;

    const reaction: Reaction = {
      id: `reaction_${Date.now()}`,
      userId: this.userId,
      userName: 'You',
      emoji,
      timestamp: new Date(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: reaction,
    });
  }

  async raiseHand() {
    if (!this.channel) return;

    const hand: RaisedHand = {
      userId: this.userId,
      userName: 'You',
      raisedAt: new Date(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'hand-raised',
      payload: hand,
    });
  }

  async lowerHand() {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'hand-lowered',
      payload: { userId: this.userId },
    });
  }

  async startScreenShare(title: string, description?: string): Promise<ScreenShareSession> {
    const session: ScreenShareSession = {
      id: `screen_${Date.now()}`,
      presenterId: this.userId,
      presenterName: 'You',
      title,
      description,
      startedAt: new Date(),
      viewerIds: [],
      stream: null,
      isActive: true,
    };

    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'screen-share-started',
        payload: session,
      });
    }

    return session;
  }

  async endScreenShare(sessionId: string) {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'screen-share-ended',
      payload: { sessionId },
    });
  }

  async getActiveSessions(): Promise<CallSession[]> {
    try {
      console.log('[CallSession] Fetching active sessions for room:', this.roomId);
      const { data, error } = await this.supabase
        .from('call_sessions')
        .select('*')
        .eq('room_id', this.roomId)
        .eq('is_active', true)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('[CallSession] Failed to fetch active sessions:', error, 'for room:', this.roomId);
        return [];
      }

      console.log('[CallSession] Found active sessions:', data?.length || 0, data);
      return (data || []).map(CallSessionService.normalizeSessionRow);
    } catch (err) {
      console.error('[CallSession] Error fetching active sessions:', err);
      return [];
    }
  }

  async endSession() {
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'session-ended',
        payload: { sessionId: this.sessionId },
      });

      await this.channel.unsubscribe();
      this.channel = null;
    }

    // Update database
    try {
      await this.supabase
        .from('call_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', this.sessionId);
    } catch (err) {
      console.error('[CallSession] Failed to end session:', err);
    }
  }

  cleanup() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}

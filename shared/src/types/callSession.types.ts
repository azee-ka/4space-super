// Call Session Types
export interface CallSession {
  id: string;
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  title: string;
  description?: string;
  purpose?: string;
  guidelines?: string[];
  type: 'voice' | 'video' | 'screen-share';
  startedAt: Date;
  endedAt?: Date;
  participantCount: number;
  participants: string[]; // User IDs
  isRecording: boolean;
  isActive: boolean;
  maxParticipants?: number;
  requiresApproval: boolean;
}

export interface CallHistoryEntry {
  id: string;
  sessionId: string;
  roomId: string;
  roomName: string;
  type: 'voice' | 'video' | 'screen-share';
  startedAt: Date;
  endedAt: Date;
  duration: number; // in seconds
  participants: Array<{
    userId: string;
    displayName: string;
    joinedAt: Date;
    leftAt: Date;
  }>;
  wasHost: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ScreenShareSession {
  id: string;
  presenterId: string;
  presenterName: string;
  title: string;
  description?: string;
  startedAt: Date;
  viewerIds: string[];
  stream: MediaStream | null;
  isActive: boolean;
}

export interface InCallMessage {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'reaction';
}

export interface Reaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface RaisedHand {
  userId: string;
  userName: string;
  raisedAt: Date;
}

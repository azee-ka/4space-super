export interface User {
  id: string;
  email?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  type: 'dm' | 'group';
  name?: string;
  avatar_url?: string;
  last_message?: Message;
  unread_count: number;
  participants: User[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  metadata?: Record<string, any> | string | null;
  encrypted_content?: string | null;
  reply_to?: Message;
  reactions: Reaction[];
  read_by: string[];
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  user?: User;
  emoji: string;
  created_at: string;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  user: User;
  timestamp: number;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  type?: 'personal' | 'couple' | 'team' | 'portfolio' | 'community' | 'custom' | 'project';
  privacy: 'private' | 'shared' | 'team' | 'public' | 'unlisted';
  owner_id: string;
  icon?: string;
  color?: string;
  avatar_url?: string;
  members_count?: number;
  member_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Room {
  id: string;
  space_id: string;
  name: string;
  type: 'text' | 'voice' | 'video';
  category?: string;
  is_private: boolean;
  unread_count?: number;
  created_at: string;
}

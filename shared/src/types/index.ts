export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  public_key: string;
  created_at: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  privacy: 'private' | 'shared' | 'public';
  owner_id: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  space_id: string;
  sender_id: string;
  encrypted_content: string;
  created_at: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
}

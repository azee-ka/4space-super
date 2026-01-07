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
  privacy: 'private' | 'shared' | 'team' | 'public';
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
  content?: string;
  created_at: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
}

// Space Templates
export type SpaceType = 
  | 'personal'
  | 'couple'
  | 'team'
  | 'portfolio'
  | 'community'
  | 'project'
  | 'custom';

export type SpaceFeature = 
  | 'chat'
  | 'files'
  | 'notes'
  | 'tasks'
  | 'calendar'
  | 'board'
  | 'docs';

export interface SpaceTemplate {
  type: SpaceType;
  name: string;
  description: string;
  icon: string; // FontAwesome icon name
  color: string;
  features: SpaceFeature[];
  defaultPrivacy: 'private' | 'shared' | 'team' | 'public';
}

export const SPACE_TEMPLATES: SpaceTemplate[] = [
  {
    type: 'personal',
    name: 'Personal Vault',
    description: 'Your private space for thoughts, files, and planning',
    icon: 'lock',
    color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    features: ['notes', 'files', 'tasks', 'calendar'],
    defaultPrivacy: 'private',
  },
  {
    type: 'couple',
    name: 'Couple Space',
    description: 'Shared space for two - plans, memories, and more',
    icon: 'heart',
    color: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    features: ['chat', 'files', 'calendar', 'tasks'],
    defaultPrivacy: 'shared',
  },
  {
    type: 'team',
    name: 'Team Workspace',
    description: 'Collaborate with your team on projects',
    icon: 'users',
    color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    features: ['chat', 'files', 'tasks', 'board', 'docs'],
    defaultPrivacy: 'team',
  },
  {
    type: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase your work to the world',
    icon: 'briefcase',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    features: ['files', 'docs'],
    defaultPrivacy: 'public',
  },
  {
    type: 'community',
    name: 'Community',
    description: 'Public space for group discussions',
    icon: 'globe',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    features: ['chat', 'files', 'board'],
    defaultPrivacy: 'public',
  },
  {
    type: 'project',
    name: 'Project',
    description: 'Manage a specific project from start to finish',
    icon: 'rocket',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    features: ['chat', 'tasks', 'files', 'board', 'calendar'],
    defaultPrivacy: 'team',
  },
];
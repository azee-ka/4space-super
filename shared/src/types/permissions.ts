// shared/src/types/permissions.ts

export type MemberRole = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

export interface RolePermissions {
  // Space Management
  canDeleteSpace: boolean;
  canUpdateSpaceSettings: boolean;
  canChangePrivacy: boolean;
  
  // Member Management
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateMemberRoles: boolean;
  
  // Content Creation
  canCreateContent: boolean;
  canEditOwnContent: boolean;
  canEditOthersContent: boolean;
  canDeleteOwnContent: boolean;
  canDeleteOthersContent: boolean;
  
  // Files
  canUploadFiles: boolean;
  canDeleteOwnFiles: boolean;
  canDeleteOthersFiles: boolean;
  
  // Communication
  canSendMessages: boolean;
  canDeleteOwnMessages: boolean;
  canDeleteOthersMessages: boolean;
  canAddComments: boolean;
  
  // Viewing
  canViewContent: boolean;
  canViewMembers: boolean;
  canViewAnalytics: boolean;
}

export const ROLE_PERMISSIONS: Record<MemberRole, RolePermissions> = {
  owner: {
    // Space Management - Full control
    canDeleteSpace: true,
    canUpdateSpaceSettings: true,
    canChangePrivacy: true,
    
    // Member Management - Full control
    canInviteMembers: true,
    canRemoveMembers: true,
    canUpdateMemberRoles: true,
    
    // Content Creation - Full control
    canCreateContent: true,
    canEditOwnContent: true,
    canEditOthersContent: true,
    canDeleteOwnContent: true,
    canDeleteOthersContent: true,
    
    // Files - Full control
    canUploadFiles: true,
    canDeleteOwnFiles: true,
    canDeleteOthersFiles: true,
    
    // Communication - Full control
    canSendMessages: true,
    canDeleteOwnMessages: true,
    canDeleteOthersMessages: true,
    canAddComments: true,
    
    // Viewing - Full access
    canViewContent: true,
    canViewMembers: true,
    canViewAnalytics: true,
  },
  
  admin: {
    // Space Management - Can update settings but not delete
    canDeleteSpace: false,
    canUpdateSpaceSettings: true,
    canChangePrivacy: false, // Only owner can change privacy
    
    // Member Management - Can manage members
    canInviteMembers: true,
    canRemoveMembers: true,
    canUpdateMemberRoles: true,
    
    // Content Creation - Full editing rights
    canCreateContent: true,
    canEditOwnContent: true,
    canEditOthersContent: true,
    canDeleteOwnContent: true,
    canDeleteOthersContent: true,
    
    // Files - Full file management
    canUploadFiles: true,
    canDeleteOwnFiles: true,
    canDeleteOthersFiles: true,
    
    // Communication - Full communication rights
    canSendMessages: true,
    canDeleteOwnMessages: true,
    canDeleteOthersMessages: true,
    canAddComments: true,
    
    // Viewing - Full access
    canViewContent: true,
    canViewMembers: true,
    canViewAnalytics: true,
  },
  
  editor: {
    // Space Management - No access
    canDeleteSpace: false,
    canUpdateSpaceSettings: false,
    canChangePrivacy: false,
    
    // Member Management - Can only invite
    canInviteMembers: true,
    canRemoveMembers: false,
    canUpdateMemberRoles: false,
    
    // Content Creation - Can create and edit
    canCreateContent: true,
    canEditOwnContent: true,
    canEditOthersContent: false, // Can't edit others' content
    canDeleteOwnContent: true,
    canDeleteOthersContent: false,
    
    // Files - Can upload and manage own files
    canUploadFiles: true,
    canDeleteOwnFiles: true,
    canDeleteOthersFiles: false,
    
    // Communication - Full communication
    canSendMessages: true,
    canDeleteOwnMessages: true,
    canDeleteOthersMessages: false,
    canAddComments: true,
    
    // Viewing - Can view most things
    canViewContent: true,
    canViewMembers: true,
    canViewAnalytics: false, // No analytics access
  },
  
  commenter: {
    // Space Management - No access
    canDeleteSpace: false,
    canUpdateSpaceSettings: false,
    canChangePrivacy: false,
    
    // Member Management - No access
    canInviteMembers: false,
    canRemoveMembers: false,
    canUpdateMemberRoles: false,
    
    // Content Creation - No content creation
    canCreateContent: false,
    canEditOwnContent: false,
    canEditOthersContent: false,
    canDeleteOwnContent: false,
    canDeleteOthersContent: false,
    
    // Files - No file management
    canUploadFiles: false,
    canDeleteOwnFiles: false,
    canDeleteOthersFiles: false,
    
    // Communication - Can comment and message
    canSendMessages: true,
    canDeleteOwnMessages: true,
    canDeleteOthersMessages: false,
    canAddComments: true,
    
    // Viewing - Can view content
    canViewContent: true,
    canViewMembers: true,
    canViewAnalytics: false,
  },
  
  viewer: {
    // Space Management - No access
    canDeleteSpace: false,
    canUpdateSpaceSettings: false,
    canChangePrivacy: false,
    
    // Member Management - No access
    canInviteMembers: false,
    canRemoveMembers: false,
    canUpdateMemberRoles: false,
    
    // Content Creation - No access
    canCreateContent: false,
    canEditOwnContent: false,
    canEditOthersContent: false,
    canDeleteOwnContent: false,
    canDeleteOthersContent: false,
    
    // Files - No access
    canUploadFiles: false,
    canDeleteOwnFiles: false,
    canDeleteOthersFiles: false,
    
    // Communication - No communication (read-only)
    canSendMessages: false,
    canDeleteOwnMessages: false,
    canDeleteOthersMessages: false,
    canAddComments: false,
    
    // Viewing - Read-only access
    canViewContent: true,
    canViewMembers: true,
    canViewAnalytics: false,
  },
};

export const ROLE_DISPLAY_INFO = {
  owner: {
    label: 'Owner',
    description: 'Full control over space and all content',
    color: 'from-yellow-500 to-amber-600',
    icon: 'faCrown',
  },
  admin: {
    label: 'Admin',
    description: 'Manage members, settings & content',
    color: 'from-purple-500 to-fuchsia-600',
    icon: 'faShieldAlt',
  },
  editor: {
    label: 'Editor',
    description: 'Create & edit content',
    color: 'from-blue-500 to-cyan-600',
    icon: 'faEdit',
  },
  commenter: {
    label: 'Commenter',
    description: 'View & comment on content',
    color: 'from-green-500 to-emerald-600',
    icon: 'faComment',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access',
    color: 'from-gray-600 to-gray-700',
    icon: 'faEye',
  },
} as const;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: MemberRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Check if user can perform action on another member
 */
export function canManageMember(
  currentUserRole: MemberRole,
  targetMemberRole: MemberRole,
  action: 'remove' | 'changeRole'
): boolean {
  // Owner can manage everyone except themselves
  if (currentUserRole === 'owner') {
    return targetMemberRole !== 'owner';
  }
  
  // Admin can manage editors, commenters, and viewers
  if (currentUserRole === 'admin' && action === 'remove') {
    return ['editor', 'commenter', 'viewer'].includes(targetMemberRole);
  }
  
  if (currentUserRole === 'admin' && action === 'changeRole') {
    return ['editor', 'commenter', 'viewer'].includes(targetMemberRole);
  }
  
  // Others can't manage anyone
  return false;
}

/**
 * Get available roles that a user can assign
 */
export function getAssignableRoles(currentUserRole: MemberRole): MemberRole[] {
  if (currentUserRole === 'owner') {
    return ['admin', 'editor', 'commenter', 'viewer'];
  }
  
  if (currentUserRole === 'admin') {
    return ['editor', 'commenter', 'viewer'];
  }
  
  return [];
}
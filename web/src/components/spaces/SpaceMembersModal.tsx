// web/src/components/spaces/SpaceMembersModal.tsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faUsers, faSpinner, faTrash, faCrown, faShieldAlt,
  faEdit, faComment, faEye, faUserPlus, faSearch, faEllipsisV,
  faSignOutAlt, faInfoCircle, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useSpaceMembers, spaceKeys } from '../../hooks/useSpaces';
import { logger } from '@4space/shared/src/utils/logger';

interface SpaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  currentUserRole: 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';
  onInviteClick: () => void;
}

type MemberRole = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    icon: faCrown,
    description: 'Full control over space',
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    textColor: 'text-yellow-400',
  },
  admin: {
    label: 'Admin',
    icon: faShieldAlt,
    description: 'Manage members & settings',
    color: 'from-purple-500 to-fuchsia-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
  },
  editor: {
    label: 'Editor',
    icon: faEdit,
    description: 'Create & edit content',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
  },
  commenter: {
    label: 'Commenter',
    icon: faComment,
    description: 'View & comment',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-400',
  },
  viewer: {
    label: 'Viewer',
    icon: faEye,
    description: 'Read-only access',
    color: 'from-gray-600 to-gray-700',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    textColor: 'text-gray-400',
  }
} as const;

// Permission helper functions
function canManageMember(
  currentUserRole: MemberRole,
  targetMemberRole: MemberRole
): boolean {
  if (currentUserRole === 'owner') return targetMemberRole !== 'owner';
  if (currentUserRole === 'admin') {
    return ['editor', 'commenter', 'viewer'].includes(targetMemberRole);
  }
  return false;
}

function getAssignableRoles(currentUserRole: MemberRole): MemberRole[] {
  if (currentUserRole === 'owner') {
    return ['admin', 'editor', 'commenter', 'viewer'];
  }
  if (currentUserRole === 'admin') {
    return ['editor', 'commenter', 'viewer'];
  }
  return [];
}

export function SpaceMembersModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  currentUserRole,
  onInviteClick
}: SpaceMembersModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: members = [], isLoading: membersLoading } = useSpaceMembers(
    isOpen ? spaceId : undefined
  );

  const filteredMembers = members.filter(member =>
    member.user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeMember = async (memberId: string, memberRole: MemberRole) => {
    if (!canManageMember(currentUserRole, memberRole)) {
      setError("You don't have permission to remove this member");
      return;
    }

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const { error } = await supabase
        .from('space_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: spaceKeys.members(spaceId) });
      setSuccess('Member removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      logger.error('Failed to remove member', err);
      setError('Failed to remove member');
    }
  };

  const updateMemberRole = async (memberId: string, currentRole: MemberRole, newRole: MemberRole) => {
    if (!canManageMember(currentUserRole, currentRole)) {
      setError("You don't have permission to change this member's role");
      return;
    }

    try {
      const { error } = await supabase
        .from('space_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: spaceKeys.members(spaceId) });
      setSuccess('Member role updated');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedMember(null);
    } catch (err: any) {
      logger.error('Failed to update role', err);
      setError('Failed to update role');
    }
  };

  const leaveSpace = async () => {
    if (currentUserRole === 'owner') {
      setError('Owner cannot leave the space. Transfer ownership or delete the space instead.');
      return;
    }

    if (!confirm('Are you sure you want to leave this space?')) return;

    try {
      const myMembership = members.find(m => m.user.id === user?.id);
      if (!myMembership) return;

      const { error } = await supabase
        .from('space_members')
        .delete()
        .eq('id', myMembership.id);

      if (error) throw error;
      
      onClose();
      // Navigate away or refresh
      window.location.href = '/dashboard';
    } catch (err: any) {
      logger.error('Failed to leave space', err);
      setError('Failed to leave space');
    }
  };

  if (!isOpen) return null;

  const canInvite = ['owner', 'admin', 'editor'].includes(currentUserRole);
  const assignableRoles = getAssignableRoles(currentUserRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-black rounded-2xl border border-purple-500/20 shadow-2xl animate-scale-in max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {spaceName} Members
                </h2>
                <p className="text-xs text-gray-400">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
            </button>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FontAwesomeIcon icon={faSearch} className="text-sm" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white placeholder-gray-600 text-sm"
              />
            </div>
            {canInvite && (
              <button
                onClick={() => {
                  onClose();
                  onInviteClick();
                }}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-sm"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Invite
              </button>
            )}
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/50">
              <p className="text-green-400 text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faCheck} />
                {success}
              </p>
            </div>
          )}

          {membersLoading ? (
            <div className="text-center py-10">
              <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 text-2xl animate-spin mb-3" />
              <p className="text-gray-400 text-sm">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'No members found' : 'No members yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map(member => {
                const roleConfig = ROLE_CONFIG[member.role as MemberRole];
                const isCurrentUser = member.user.id === user?.id;
                const canManage = canManageMember(currentUserRole, member.role as MemberRole);

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-all border border-purple-500/20"
                  >
                    {/* Avatar */}
                    {member.user.avatar_url ? (
                      <img
                        src={member.user.avatar_url}
                        alt={member.user.display_name || member.user.email}
                        className="w-10 h-10 rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                        {(member.user.display_name || member.user.email)[0].toUpperCase()}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm truncate">
                          {member.user.display_name || 'User'}
                        </p>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-2">
                      {member.role === 'owner' ? (
                        <span className={`px-3 py-1.5 rounded-lg ${roleConfig.bgColor} ${roleConfig.textColor} text-xs font-semibold border ${roleConfig.borderColor} flex items-center gap-1.5`}>
                          <FontAwesomeIcon icon={roleConfig.icon} className="text-xs" />
                          {roleConfig.label}
                        </span>
                      ) : canManage && assignableRoles.length > 0 ? (
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.id, member.role as MemberRole, e.target.value as MemberRole)}
                          className="px-2.5 py-1.5 rounded-lg bg-black border border-purple-500/20 text-white text-xs outline-none focus:border-purple-500 hover:bg-gray-900 transition-all"
                        >
                          <option value={member.role}>{roleConfig.label}</option>
                          {assignableRoles
                            .filter(role => role !== member.role)
                            .map(role => (
                              <option key={role} value={role}>
                                {ROLE_CONFIG[role].label}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-lg ${roleConfig.bgColor} ${roleConfig.textColor} text-xs font-semibold border ${roleConfig.borderColor}`}>
                          {roleConfig.label}
                        </span>
                      )}

                      {/* Actions */}
                      {isCurrentUser && member.role !== 'owner' ? (
                        <button
                          onClick={leaveSpace}
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-all"
                          title="Leave space"
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                        </button>
                      ) : canManage && member.role !== 'owner' ? (
                        <button
                          onClick={() => removeMember(member.id, member.role as MemberRole)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-all"
                          title="Remove member"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Role Info */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-400">Your role: </span>
              <span className={ROLE_CONFIG[currentUserRole].textColor}>
                {ROLE_CONFIG[currentUserRole].label}
              </span>
              <span className="mx-1">—</span>
              <span>{ROLE_CONFIG[currentUserRole].description}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
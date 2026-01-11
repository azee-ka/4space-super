// web/src/components/modals/InviteToSpaceModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faUserPlus, faSearch, faCheck, faCrown, faShieldAlt,
  faLink, faCopy, faUsers, faSpinner, faTrash, faEdit, faComment, 
  faEye, faPaperPlane, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useSpaceMembers, spaceKeys } from '../../hooks/useSpaces';
import { logger } from '@4space/shared/src/utils/logger';

interface InviteToSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  spacePrivacy: 'private' | 'shared' | 'team' | 'public';
}

interface SearchUser {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

interface SelectedUser extends SearchUser {
  role: 'admin' | 'editor' | 'commenter' | 'viewer';
}

type MemberRole = 'admin' | 'editor' | 'commenter' | 'viewer';

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    icon: faShieldAlt,
    description: 'Manage members & settings',
    color: 'from-purple-500 to-fuchsia-600'
  },
  editor: {
    label: 'Editor',
    icon: faEdit,
    description: 'Create & edit content',
    color: 'from-blue-500 to-cyan-600'
  },
  commenter: {
    label: 'Commenter',
    icon: faComment,
    description: 'View & comment',
    color: 'from-green-500 to-emerald-600'
  },
  viewer: {
    label: 'Viewer',
    icon: faEye,
    description: 'Read-only access',
    color: 'from-gray-600 to-gray-700'
  }
} as const;

export function InviteToSpaceModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  spacePrivacy
}: InviteToSpaceModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: members = [], isLoading: membersLoading } = useSpaceMembers(
    isOpen ? spaceId : undefined
  );

  useEffect(() => {
    if (isOpen) {
      generateInviteLink();
    }
  }, [isOpen, spaceId]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const generateInviteLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/invite/${spaceId}/${token}`;
    setInviteLink(link);
  };

  const searchUsers = async (query: string) => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url')
        .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      
      const memberIds = members.map(m => m.user_id);
      const selectedIds = selectedUsers.map(u => u.id);
      const filteredResults = (data || []).filter(
        u => !memberIds.includes(u.id) && !selectedIds.includes(u.id)
      );
      setSearchResults(filteredResults);
    } catch (err: any) {
      logger.error('Failed to search users', err, { 
        component: 'InviteToSpaceModal',
        spaceId,
        query,
      });
    } finally {
      setSearching(false);
    }
  };

  const addUserToSelection = (user: SearchUser) => {
    setSelectedUsers([...selectedUsers, { ...user, role: 'editor' }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeUserFromSelection = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const updateUserRole = (userId: string, role: MemberRole) => {
    setSelectedUsers(selectedUsers.map(u => 
      u.id === userId ? { ...u, role } : u
    ));
  };

  const sendInvitations = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const invitations = selectedUsers.map(selectedUser => ({
        space_id: spaceId,
        invited_user_id: selectedUser.id,
        invited_by_user_id: user?.id,
        role: selectedUser.role,
        status: 'pending' as const,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const { error: inviteError } = await supabase
        .from('space_invitations')
        .insert(invitations);

      if (inviteError) throw inviteError;

      // Create notifications
      for (const selectedUser of selectedUsers) {
        try {
          await supabase.rpc('create_notification', {
            p_user_id: selectedUser.id,
            p_type: 'space_invitation',
            p_title: `Invited to ${spaceName}`,
            p_message: `You've been invited as ${ROLE_CONFIG[selectedUser.role].label}`,
            p_icon: 'faUserPlus',
            p_color: 'from-blue-500 to-cyan-600',
            p_link: `/spaces`,
            p_action_required: true,
            p_metadata: JSON.stringify({
              space_id: spaceId,
              space_name: spaceName,
              role: selectedUser.role,
              invited_by: user?.id
            })
          });
        } catch (notifError) {
          logger.warn('Failed to create notification', { error: notifError as Error });
        }
      }

      setSuccess(`${selectedUsers.length} invitation(s) sent successfully!`);
      setSelectedUsers([]);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      logger.error('Failed to send invitations', err);
      setError(err.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const { error } = await supabase
        .from('space_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: spaceKeys.members(spaceId) });
    } catch (err: any) {
      logger.error('Failed to remove member', err);
      setError('Failed to remove member');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('space_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: spaceKeys.members(spaceId) });
    } catch (err: any) {
      logger.error('Failed to update role', err);
      setError('Failed to update role');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setSuccess('Link copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-black rounded-2xl border border-purple-500/20 shadow-2xl animate-scale-in max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header - Compact */}
        <div className="p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserPlus} className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Invite to {spaceName}
                </h2>
                <p className="text-xs text-gray-400">Collaborate with your team</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
            </button>
          </div>

          {/* Tabs - Compact */}
          <div className="flex gap-2">
            {[
              { id: 'invite' as const, label: 'Invite', icon: faUserPlus },
              { id: 'members' as const, label: 'Members', icon: faUsers, badge: members.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-black/20' : 'bg-white/10'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {activeTab === 'invite' ? (
            <div className="space-y-4">
              {/* Invite Link - Compact */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FontAwesomeIcon icon={faLink} className="mr-2 text-cyan-400" />
                  Share Invite Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-mono overflow-x-auto whitespace-nowrap custom-scrollbar">
                    {inviteLink}
                  </div>
                  <button
                    onClick={copyInviteLink}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Anyone with this link can request to join this space
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-black text-gray-500">or invite by email</span>
                </div>
              </div>

              {/* Search - Compact */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FontAwesomeIcon icon={faSearch} className="mr-2 text-cyan-400" />
                  Search Users
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FontAwesomeIcon icon={faSearch} className="text-sm" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all disabled:opacity-50 text-white placeholder-gray-600 text-sm"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 animate-spin text-sm" />
                    </div>
                  )}
                </div>

                {/* Search Results - Scrollable */}
                {searchResults.length > 0 && (
                  <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5 p-2 rounded-lg bg-white/5 border border-white/10">
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => addUserToSelection(result)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-purple-500/10 transition-all text-left border border-transparent hover:border-purple-500/20"
                      >
                        {result.avatar_url ? (
                          <img
                            src={result.avatar_url}
                            alt={result.display_name || result.email}
                            className="w-9 h-9 rounded-lg"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                            {(result.display_name || result.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {result.display_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{result.email}</p>
                        </div>
                        <FontAwesomeIcon icon={faUserPlus} className="text-cyan-400 text-sm" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Users - Better Layout */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Selected ({selectedUsers.length})
                    </label>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 p-3 rounded-lg bg-gradient-to-br from-purple-900/10 to-fuchsia-900/10 border border-purple-500/20">
                    {selectedUsers.map(selectedUser => (
                      <div
                        key={selectedUser.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-black/40 border border-purple-500/10 hover:border-purple-500/30 transition-all"
                      >
                        {selectedUser.avatar_url ? (
                          <img
                            src={selectedUser.avatar_url}
                            alt={selectedUser.display_name || selectedUser.email}
                            className="w-9 h-9 rounded-lg"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                            {(selectedUser.display_name || selectedUser.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {selectedUser.display_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
                        </div>
                        <select
                          value={selectedUser.role}
                          onChange={(e) => updateUserRole(selectedUser.id, e.target.value as MemberRole)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-purple-500/20 text-white text-xs outline-none focus:border-purple-500 hover:bg-white/20 transition-all"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="commenter">Commenter</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() => removeUserFromSelection(selectedUser.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-all"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={sendInvitations}
                    disabled={loading || selectedUsers.length === 0}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} />
                        <span>Send {selectedUsers.length} Invitation{selectedUsers.length > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {success}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Members Tab - Compact & Scrollable
            <div className="space-y-2">
              {membersLoading ? (
                <div className="text-center py-10">
                  <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 text-2xl animate-spin mb-3" />
                  <p className="text-gray-400 text-sm">Loading members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon icon={faUsers} className="text-gray-600 text-xl" />
                  </div>
                  <p className="text-gray-500 text-sm">No members yet</p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2">
                  {members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-all border border-purple-500/20"
                    >
                      {member.user.avatar_url ? (
                        <img
                          src={member.user.avatar_url}
                          alt={member.user.display_name || member.user.email}
                          className="w-10 h-10 rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {(member.user.display_name || member.user.email)[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm flex items-center gap-2">
                          <span className="truncate">{member.user.display_name || 'User'}</span>
                          {member.role === 'owner' && (
                            <FontAwesomeIcon icon={faCrown} className="text-yellow-400 text-xs" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.role !== 'owner' ? (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => updateMemberRole(member.id, e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg bg-black border border-purple-500/20 text-white text-xs outline-none focus:border-purple-500"
                            >
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="commenter">Commenter</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => removeMember(member.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-all"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-semibold border border-yellow-500/20">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
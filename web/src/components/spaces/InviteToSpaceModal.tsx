// web/src/components/modals/InviteToSpaceModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faUserPlus, faSearch, faCheck, faCrown, faShieldAlt,
  faUser, faEnvelope, faLink, faCopy, faUsers, faSpinner,
  faTrash, faEllipsisV, faEye, faEdit
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';

interface InviteToSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  spacePrivacy: 'private' | 'shared' | 'team' | 'public';
}

interface SpaceMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  user: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const ROLE_OPTIONS = [
  {
    value: 'admin',
    label: 'Admin',
    icon: faShieldAlt,
    description: 'Can manage members and settings',
    color: 'from-purple-500 to-pink-600'
  },
  {
    value: 'member',
    label: 'Member',
    icon: faUser,
    description: 'Can view and edit content',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    value: 'viewer',
    label: 'Viewer',
    icon: faEye,
    description: 'Can only view content',
    color: 'from-gray-500 to-gray-600'
  }
];

export function InviteToSpaceModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  spacePrivacy
}: InviteToSpaceModalProps) {
  const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateInviteLink();
      loadMembers();
    }
  }, [isOpen, spaceId]);

  useEffect(() => {
    if (searchEmail.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchEmail);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchEmail]);

  const generateInviteLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/invite/${spaceId}/${token}`;
    setInviteLink(link);
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('space_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          user:profiles(id, email, display_name, avatar_url)
        `)
        .eq('space_id', spaceId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data as any || []);
    } catch (err: any) {
      console.error('Error loading members:', err);
    }
  };

  const searchUsers = async (query: string) => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url')
        .ilike('email', `%${query}%`)
        .limit(5);

      if (error) throw error;
      
      // Filter out users already in the space
      const memberIds = members.map(m => m.user_id);
      const filteredResults = (data || []).filter(u => !memberIds.includes(u.id));
      setSearchResults(filteredResults);
    } catch (err: any) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  const inviteUser = async (userId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('space_members')
        .insert({
          space_id: spaceId,
          user_id: userId,
          role: selectedRole,
          joined_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuccess('User invited successfully!');
      setSearchEmail('');
      setSearchResults([]);
      loadMembers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error inviting user:', err);
      setError(err.message || 'Failed to invite user');
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
      loadMembers();
    } catch (err: any) {
      console.error('Error removing member:', err);
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
      loadMembers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setSuccess('Invite link copied!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-gray-900/95 via-gray-950/95 to-black/95 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl shadow-cyan-500/10 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50" />
        
        {/* Content */}
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <FontAwesomeIcon icon={faUserPlus} className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Invite to {spaceName}
                  </h2>
                  <p className="text-sm text-gray-400">Add members to collaborate</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-all border border-gray-700/50 hover:border-gray-600/50"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6">
              {[
                { id: 'invite' as const, label: 'Invite Members', icon: faUserPlus },
                { id: 'members' as const, label: 'Current Members', icon: faUsers, badge: members.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20'
                        : 'bg-gray-700/50'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'invite' ? (
              <div className="space-y-6">
                {/* Invite Link */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    <FontAwesomeIcon icon={faLink} className="mr-2" />
                    Share Invite Link
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 text-gray-300 text-sm font-mono overflow-x-auto whitespace-nowrap custom-scrollbar">
                      {inviteLink}
                    </div>
                    <button
                      onClick={copyInviteLink}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Anyone with this link can join this space as a {selectedRole}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-400">or invite by email</span>
                  </div>
                </div>

                {/* Email Search */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    Search by Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FontAwesomeIcon icon={faSearch} />
                    </div>
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="user@example.com"
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all disabled:opacity-50 text-white placeholder-gray-500"
                    />
                    {searching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <FontAwesomeIcon icon={faSpinner} className="text-cyan-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 p-2 rounded-xl bg-gray-800/20 border border-gray-700/50">
                      {searchResults.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.display_name || user.email}
                                className="w-10 h-10 rounded-xl ring-2 ring-gray-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {(user.display_name || user.email)[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {user.display_name || 'User'}
                              </p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => inviteUser(user.id)}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Invite as
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {ROLE_OPTIONS.map(role => (
                      <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value as any)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedRole === role.value
                            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50'
                            : 'bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                            <FontAwesomeIcon icon={role.icon} className="text-white" />
                          </div>
                          {selectedRole === role.value && (
                            <FontAwesomeIcon icon={faCheck} className="text-cyan-400 ml-auto" />
                          )}
                        </div>
                        <h4 className={`font-semibold mb-1 ${
                          selectedRole === role.value ? 'text-cyan-400' : 'text-white'
                        }`}>
                          {role.label}
                        </h4>
                        <p className="text-xs text-gray-400">{role.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheck} />
                      {success}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Members Tab
              <div className="space-y-3">
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faUsers} className="text-gray-600 text-2xl" />
                    </div>
                    <p className="text-gray-400">No members yet</p>
                  </div>
                ) : (
                  members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all border border-gray-700/50"
                    >
                      <div className="flex items-center gap-4">
                        {member.user.avatar_url ? (
                          <img
                            src={member.user.avatar_url}
                            alt={member.user.display_name || member.user.email}
                            className="w-12 h-12 rounded-xl ring-2 ring-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                            {(member.user.display_name || member.user.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">
                            {member.user.display_name || 'User'}
                            {member.role === 'owner' && (
                              <FontAwesomeIcon icon={faCrown} className="ml-2 text-yellow-400" />
                            )}
                          </p>
                          <p className="text-sm text-gray-400">{member.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {member.role !== 'owner' && (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => updateMemberRole(member.id, e.target.value)}
                              className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-sm outline-none focus:border-cyan-500/50"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => removeMember(member.id)}
                              className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            </button>
                          </>
                        )}
                        {member.role === 'owner' && (
                          <span className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm font-semibold">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
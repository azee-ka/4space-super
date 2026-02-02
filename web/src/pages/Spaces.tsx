// web/src/pages/Spaces.tsx
// Sophisticated Spaces page with rich visual hierarchy and premium design

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaces, useCreateSpace } from '../hooks/useSpaces';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { CreateSpaceModal } from '../components/spaces/spaceModals/CreateSpaceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faGlobe, faLock, faUsers, faHeart, faBriefcase, faRocket,
  faChevronRight, faBolt, faSearch,
  faEnvelope, faCheck, faXmark, faSpinner, faChevronDown,
  faStar, faHistory, faFolder, faCompass,
  faArrowRight, faCircle, faLayerGroup, faArrowTrendUp,
  faCode, faImage, faMicrophone, faPaperPlane,
  faMessage, faFile, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import type { Space } from '@4space/shared';
import { supabase } from '../lib/supabase';
import { logger } from '@4space/shared/src/utils/logger';
import { useQueryClient } from '@tanstack/react-query';

const iconMap: { [key: string]: any } = {
  'lock': faLock,
  'heart': faHeart,
  'users': faUsers,
  'briefcase': faBriefcase,
  'globe': faGlobe,
  'rocket': faRocket,
};

interface SpaceInvitation {
  id: string;
  space_id: string;
  invited_by_user_id: string;
  role: string;
  message?: string;
  created_at: string;
  expires_at: string;
  space: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    privacy: string;
  };
  invited_by: {
    id: string;
    display_name?: string;
    email: string;
    avatar_url?: string;
  };
}

interface SpaceTemplate {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const SPACE_TEMPLATES: SpaceTemplate[] = [
  { id: 'startup', name: 'Startup', icon: faRocket, color: 'from-blue-500 to-cyan-600', description: 'Launch your next big idea' },
  { id: 'design', name: 'Design', icon: faImage, color: 'from-purple-500 to-pink-600', description: 'Creative collaboration' },
  { id: 'personal', name: 'Personal', icon: faLock, color: 'from-gray-600 to-slate-700', description: 'Private workspace' },
  { id: 'podcast', name: 'Podcast', icon: faMicrophone, color: 'from-orange-500 to-red-600', description: 'Audio content creation' },
  { id: 'dev', name: 'Development', icon: faCode, color: 'from-green-500 to-emerald-600', description: 'Code & ship together' },
  { id: 'marketing', name: 'Marketing', icon: faPaperPlane, color: 'from-pink-500 to-rose-600', description: 'Campaigns & growth' },
];

export function Spaces() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const { data: spaces = [], isLoading, error } = useSpaces();
  const createSpaceMutation = useCreateSpace();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-spaces' | 'shared'>('my-spaces');
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [invitations, setInvitations] = useState<SpaceInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    if (!user) return;
    setLoadingInvitations(true);

    try {
      const { data, error } = await supabase
        .from('space_invitations')
        .select(`
          *,
          space:spaces(id, name, description, icon, color, privacy),
          invited_by:profiles!space_invitations_invited_by_user_id_fkey(id, display_name, email, avatar_url)
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data as any || []);
    } catch (err: any) {
      logger.error('Error loading invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'shared') {
      loadInvitations();
    }
  }, [activeTab, user]);

  const acceptInvitation = async (invitationId: string) => {
    setProcessingInvitation(invitationId);
    try {
      const { data, error } = await supabase.rpc('accept_space_invitation', {
        p_invitation_id: invitationId
      });

      if (error) throw error;

      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      queryClient.invalidateQueries({ queryKey: ['spaces'] });

      if (data && data.length > 0 && data[0]?.space_id) {
        const spaceId = data[0].space_id;
        queryClient.invalidateQueries({ queryKey: ['space_members', spaceId] });
        navigate(`/spaces/${spaceId}`);
      }
    } catch (err: any) {
      logger.error('Error accepting invitation:', err);
      alert(err.message || 'Failed to accept invitation');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    if (!confirm('Decline this invitation?')) return;

    setProcessingInvitation(invitationId);
    try {
      const { error } = await supabase.rpc('reject_space_invitation', {
        p_invitation_id: invitationId
      });

      if (error) throw error;
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err: any) {
      logger.error('Error rejecting invitation:', err);
      alert(err.message || 'Failed to reject invitation');
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleSpaceClick = (space: Space) => {
    navigate(`/spaces/${space.id}`);
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-cyan-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-amber-600',
      'from-rose-500 to-pink-600',
      'from-indigo-500 to-violet-600',
    ];
    return gradients[index % gradients.length];
  };

  const filteredSpaces = spaces.filter(space => {
    if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: spaces.length,
    pending: invitations.length,
    private: spaces.filter(s => s.privacy === 'private').length,
    shared: spaces.filter(s => s.privacy === 'shared' || s.privacy === 'team').length,
  };

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 animate-pulse" />
            <div className="absolute inset-[3px] rounded-xl bg-black/90 flex items-center justify-center">
              <FontAwesomeIcon icon={faCompass} className="text-2xl text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading spaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">Failed to load spaces</p>
          <p className="text-sm text-gray-500 mb-6">{(error as Error)?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 text-white font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1800px] mx-auto p-6 space-y-6">

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Workspace Hub</span>
              </div>
              <h1 className="text-4xl font-bold text-white">
                Your <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Spaces</span>
              </h1>
              <p className="text-gray-400 text-lg">Organize projects, collaborate with teams, and build together</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border border-white/10 flex items-center gap-3`}>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-cyan-400 text-sm" />
                  <span className="text-sm text-gray-400">{stats.total} spaces</span>
                </div>
                {stats.pending > 0 && (
                  <>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-purple-400 text-sm" />
                      <span className="text-sm text-purple-400">{stats.pending} pending</span>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                disabled={createSpaceMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={createSpaceMutation.isPending ? faSpinner : faPlus} className={`text-xs ${createSpaceMutation.isPending ? 'animate-spin' : ''}`} />
                New Space
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Spaces', value: stats.total, icon: faLayerGroup, color: 'cyan', change: 12 },
              { label: 'Private', value: stats.private, icon: faLock, color: 'purple', change: 0 },
              { label: 'Collaborative', value: stats.shared, icon: faUsers, color: 'emerald', change: 8 },
              { label: 'Invitations', value: stats.pending, icon: faEnvelope, color: 'amber', change: stats.pending > 0 ? stats.pending : 0 }
            ].map((stat, index) => (
              <div
                key={index}
                className={`group relative p-4 rounded-2xl ${isDark ? 'bg-white/[0.03]' : 'bg-white'} border border-white/[0.06] hover:border-white/10 transition-all duration-300 hover:bg-white/[0.05]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <FontAwesomeIcon icon={stat.icon} className={`text-${stat.color}-400`} />
                  </div>
                  {stat.change > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <FontAwesomeIcon icon={faArrowTrendUp} className="text-[10px]" />
                      {stat.change}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tab Navigation & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              {[
                { id: 'my-spaces', label: 'My Spaces', count: stats.total, icon: faLayerGroup },
                { id: 'shared', label: 'Invitations', count: stats.pending, icon: faEnvelope }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-cyan-400/20 text-cyan-300'
                        : 'bg-white/5 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]
                    text-white placeholder-gray-500 text-sm outline-none
                    focus:border-cyan-500/30 focus:bg-white/[0.05] transition-all duration-300`}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
                />
              </div>

              {/* Filter Dropdown */}
              {activeTab === 'my-spaces' && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]
                      hover:bg-white/[0.05] transition-all duration-300
                      flex items-center gap-2.5 text-sm`}
                  >
                    <FontAwesomeIcon
                      icon={viewMode === 'favorites' ? faStar : viewMode === 'recent' ? faHistory : faFolder}
                      className="text-xs text-cyan-400"
                    />
                    <span className="text-white font-medium">
                      {viewMode === 'all' ? 'All' : viewMode === 'recent' ? 'Recent' : 'Favorites'}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-xs text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-black/90 backdrop-blur-xl border border-white/[0.06] overflow-hidden z-20 shadow-2xl">
                        {[
                          { id: 'all', label: 'All Spaces', icon: faFolder },
                          { id: 'recent', label: 'Recent', icon: faHistory },
                          { id: 'favorites', label: 'Favorites', icon: faStar }
                        ].map(option => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setViewMode(option.id as any);
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                              viewMode === option.id
                                ? 'bg-cyan-500/10 text-cyan-300'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <FontAwesomeIcon icon={option.icon} className="text-xs" />
                            <span className="text-sm font-medium flex-1">{option.label}</span>
                            {viewMode === option.id && (
                              <FontAwesomeIcon icon={faCheck} className="text-xs" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Spaces Grid - Main Area */}
            <div className="lg:col-span-9">
              {activeTab === 'my-spaces' ? (
                filteredSpaces.length === 0 ? (
                  <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-12`}>
                    <div className="text-center max-w-md mx-auto">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon
                          icon={searchQuery ? faSearch : faRocket}
                          className="text-4xl text-gray-500"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-white">
                        {searchQuery ? 'No spaces found' : 'Create your first space'}
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">
                        {searchQuery
                          ? 'Try adjusting your search query'
                          : 'Spaces help you organize your projects, teams, and ideas in one place'
                        }
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => setModalOpen(true)}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 text-white font-semibold"
                        >
                          Create Space
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSpaces.map((space, index) => (
                      <button
                        key={space.id}
                        onClick={() => handleSpaceClick(space)}
                        className={`group relative text-left p-5 rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(index)} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                            <FontAwesomeIcon
                              icon={space.icon && iconMap[space.icon] ? iconMap[space.icon] : faRocket}
                              className="text-white text-xl"
                            />
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg ${
                            space.privacy === 'private' ? 'bg-gray-500/10 text-gray-400' :
                            space.privacy === 'shared' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            <FontAwesomeIcon
                              icon={space.privacy === 'private' ? faLock : space.privacy === 'shared' ? faUsers : faGlobe}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-base font-bold mb-1 text-white group-hover:text-cyan-300 transition-colors duration-300 line-clamp-1">
                          {space.name}
                        </h3>

                        {space.description && (
                          <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                            {space.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faMessage} className="text-[10px]" />
                              {Math.floor(Math.random() * 50) + 5}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faFile} className="text-[10px]" />
                              {Math.floor(Math.random() * 20) + 1}
                            </span>
                          </div>
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-xs text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* Invitations Tab */
                loadingInvitations ? (
                  <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-12`}>
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-12`}>
                    <div className="text-center max-w-md mx-auto">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-gray-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-white">No pending invitations</h3>
                      <p className="text-sm text-gray-400">
                        When someone invites you to collaborate on a space, it will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {invitations.map((invitation, index) => (
                      <div
                        key={invitation.id}
                        className={`relative p-5 rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] hover:border-purple-500/20 transition-all duration-300`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(index)} flex items-center justify-center shadow-lg`}>
                            <FontAwesomeIcon
                              icon={invitation.space?.icon && iconMap[invitation.space?.icon] ? iconMap[invitation.space?.icon] : faRocket}
                              className="text-white text-xl"
                            />
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg ${
                            invitation.space?.privacy === 'private' ? 'bg-gray-500/10 text-gray-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            <FontAwesomeIcon
                              icon={invitation.space?.privacy === 'private' ? faLock : faUsers}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        {/* Space Name */}
                        <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
                          {invitation.space?.name}
                        </h3>

                        {invitation.space?.description && (
                          <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                            {invitation.space?.description}
                          </p>
                        )}

                        {/* Inviter */}
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          {invitation.invited_by.avatar_url ? (
                            <img
                              src={invitation.invited_by.avatar_url}
                              alt={invitation.invited_by.display_name || invitation.invited_by.email}
                              className="w-10 h-10 rounded-xl"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                              {(invitation.invited_by.display_name || invitation.invited_by.email)[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {invitation.invited_by.display_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">invited you as {invitation.role}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptInvitation(invitation.id)}
                            disabled={processingInvitation === invitation.id}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/20 text-cyan-300 font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {processingInvitation === invitation.id ? (
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                Accept
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => rejectInvitation(invitation.id)}
                            disabled={processingInvitation === invitation.id}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-300 disabled:opacity-50"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>

                        {/* Expiry */}
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          Expires {new Date(invitation.expires_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Right Sidebar - Templates & Quick Actions */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Create */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBolt} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Quick Create</h3>
                    <p className="text-xs text-gray-500">Start with a template</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {SPACE_TEMPLATES.slice(0, 4).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setModalOpen(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-300 group text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <FontAwesomeIcon icon={template.icon} className="text-white text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{template.name}</p>
                        <p className="text-xs text-gray-500 truncate">{template.description}</p>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all text-xs" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips Card */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Pro Tips</h3>
                    <p className="text-xs text-gray-500">Get more from spaces</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: faCheckCircle, text: 'Add widgets to customize your workflow', color: 'emerald' },
                    { icon: faUsers, text: 'Invite team members to collaborate', color: 'blue' },
                    { icon: faLock, text: 'Keep sensitive projects private', color: 'purple' }
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                      <FontAwesomeIcon icon={tip.icon} className={`text-${tip.color}-400 mt-0.5`} />
                      <p className="text-xs text-gray-400 leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateSpaceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
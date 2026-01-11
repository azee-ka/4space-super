// web/src/pages/Spaces.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaces, useCreateSpace } from '../hooks/useSpaces';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { CreateSpaceModal } from '../components/spaces/CreateSpaceModal';
import { Navbar } from '../components/navbar/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faGlobe, faLock, faUsers, faHeart, faBriefcase, faRocket,
  faChevronRight, faClock, faBolt, faComments, faFolder, faCheckCircle,
  faArrowTrendUp, faChartLine, faUserPlus, faArchive, faSearch, 
  faBell, faHistory, faLayerGroup, faWandMagicSparkles, faCircleNodes, 
  faBrain, faCode, faImage, faMicrophone, faInbox, faPaperPlane,
  faEnvelope, faCheck, faXmark, faSpinner, faChevronDown, faStar
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
  space: {  // Changed from 'spaces' to 'space' to match the alias
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

interface SpaceActivity {
  spaceId: string;
  spaceName: string;
  lastActive: Date;
  unreadCount: number;
  type: 'message' | 'file' | 'task' | 'mention';
  preview?: string;
}

interface CollaborationInsight {
  spaceId: string;
  spaceName: string;
  members: number;
  messagesLast24h: number;
  trend: 'up' | 'down' | 'stable';
}

interface SpaceTemplate {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const SPACE_TEMPLATES: SpaceTemplate[] = [
  { id: 'startup', name: 'Startup', icon: faRocket, color: 'from-blue-500 to-cyan-600' },
  { id: 'design', name: 'Design', icon: faImage, color: 'from-purple-500 to-pink-600' },
  { id: 'personal', name: 'Personal', icon: faLock, color: 'from-gray-600 to-slate-700' },
  { id: 'podcast', name: 'Podcast', icon: faMicrophone, color: 'from-orange-500 to-red-600' },
  { id: 'dev', name: 'Dev', icon: faCode, color: 'from-green-500 to-emerald-600' },
  { id: 'marketing', name: 'Marketing', icon: faPaperPlane, color: 'from-pink-500 to-rose-600' },
];

export function Spaces() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  
  // Use React Query hooks
  const { data: spaces = [], isLoading, error } = useSpaces();
  const createSpaceMutation = useCreateSpace();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-spaces' | 'shared'>('my-spaces');
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Invitations state
  const [invitations, setInvitations] = useState<SpaceInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const [recentActivity] = useState<SpaceActivity[]>([
    { spaceId: '1', spaceName: 'Product Design', lastActive: new Date(), unreadCount: 5, type: 'message', preview: 'Sarah: The new mockups...' },
    { spaceId: '2', spaceName: 'Marketing', lastActive: new Date(Date.now() - 3600000), unreadCount: 2, type: 'mention', preview: '@you in Q4 Campaign' },
    { spaceId: '3', spaceName: 'Personal Vault', lastActive: new Date(Date.now() - 7200000), unreadCount: 0, type: 'file', preview: 'Doc uploaded' },
  ]);

  const [collaborationInsights] = useState<CollaborationInsight[]>([
    { spaceId: '1', spaceName: 'Product Design', members: 8, messagesLast24h: 47, trend: 'up' },
    { spaceId: '2', spaceName: 'Marketing', members: 5, messagesLast24h: 23, trend: 'stable' },
    { spaceId: '3', spaceName: 'Engineering', members: 12, messagesLast24h: 89, trend: 'up' },
  ]);

  useEffect(() => {
    loadInvitations();
  }, []);



const loadInvitations = async () => {
  if (!user) {
    logger.warn('No user found');
    return;
  }

  logger.info('Starting invitation load for user:', user.id);
  setLoadingInvitations(true);
  
  try {
    logger.info('Making Supabase query...');
    
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

    if (error) {
      logger.error('Supabase error:', error);
      throw error;
    }

    logger.info('Query successful');
    logger.info('Raw data received:', data);
    logger.info('Number of invitations:', { count: data?.length || 0 });
    
    if (data && data.length > 0) {
      logger.info('First invitation structure:', { structure: JSON.stringify(data[0], null, 2) });
      
      // Check if space data exists
      data.forEach((inv, index) => {
        logger.info(`Invitation ${index}:`, {
          id: inv.id,
          space_id: inv.space_id,
          has_space_object: !!inv.space,
          space_name: inv.space?.name,
          invited_by_name: inv.invited_by?.display_name || inv.invited_by?.email
        });
      });
    } else {
      logger.warn('No invitations found in database');
    }
    
    setInvitations(data as any || []);
    logger.info('Invitations set in state');
    
  } catch (err: any) {
    logger.error('Error loading invitations:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
      full_error: err
    });
  } finally {
    setLoadingInvitations(false);
    logger.info('Loading complete');
  }
};

// Also add logging when tab changes
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
    
    // Invalidate spaces query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['spaces'] });
    
    // Function returns array with single row containing space_id column
    if (data && data.length > 0 && data[0]?.space_id) {
      const spaceId = data[0].space_id;
      
      // Invalidate the specific space's members
      queryClient.invalidateQueries({ 
        queryKey: ['space_members', spaceId] 
      });
      
      // Navigate to the space
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
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-pink-500 to-rose-600',
      'from-orange-500 to-red-600',
      'from-green-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
    ];
    return gradients[index % gradients.length];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return faComments;
      case 'file': return faFolder;
      case 'task': return faCheckCircle;
      case 'mention': return faBell;
      default: return faInbox;
    }
  };

  const filteredSpaces = spaces.filter(space => {
    if (searchQuery && !space.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (viewMode === 'recent') {
      const recentIds = recentActivity.map(a => a.spaceId);
      return recentIds.includes(space.id);
    }
    return true;
  });

  const isDark = theme === 'dark';

  const stats = {
    total: spaces.length,
    pending: invitations.length,
    activeToday: Math.min(spaces.length, recentActivity.length),
    unreadTotal: recentActivity.reduce((sum, a) => sum + a.unreadCount, 0),
    private: spaces.filter(s => s.privacy === 'private').length,
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`h-screen flex flex-col ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading spaces...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`h-screen flex flex-col ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
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
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <Navbar />

      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Floating Sidebar Islands */}
        <div className="w-80 flex-shrink-0 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Stats Island */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-purple-500/20 to-cyan-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-cyan-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <h3 className="text-sm font-bold text-white mb-4">Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total', value: stats.total, icon: faLayerGroup, color: 'from-cyan-400 to-blue-500' },
                  { label: 'Active', value: stats.activeToday, icon: faBolt, color: 'from-yellow-400 to-orange-500' },
                  { label: 'Unread', value: stats.unreadTotal, icon: faBell, color: 'from-pink-400 to-rose-500' },
                  { label: 'Invites', value: stats.pending, icon: faEnvelope, color: 'from-purple-400 to-fuchsia-500' },
                ].map((stat, i) => (
                  <div key={i} className="relative group/stat">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover/stat:opacity-10 rounded-lg transition-opacity duration-300`} />
                    <div className="relative p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <FontAwesomeIcon icon={stat.icon} className={`text-xs bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                        <span className="text-xs text-gray-400">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Templates Island */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-purple-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-purple-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="text-purple-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Quick Create</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SPACE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setModalOpen(true)}
                    className="group/temp p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-1 mx-auto group-hover/temp:scale-110 transition-transform duration-300`}>
                      <FontAwesomeIcon icon={template.icon} className="text-white text-sm" />
                    </div>
                    <p className="text-xs text-gray-400 group-hover/temp:text-cyan-300 transition-colors duration-300 truncate">
                      {template.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Island */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-blue-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faHistory} className="text-cyan-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Recent</h3>
              </div>
              <div className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const space = spaces.find(s => s.id === activity.spaceId);
                      if (space) handleSpaceClick(space);
                    }}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group/item"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={getActivityIcon(activity.type)} className="text-xs text-gray-400 group-hover/item:text-cyan-300 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-white truncate group-hover/item:text-cyan-100 transition-colors">
                            {activity.spaceName}
                          </p>
                          {activity.unreadCount > 0 && (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">{activity.unreadCount}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{activity.preview}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insights Island */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500/25 via-emerald-500/20 to-green-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-green-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faChartLine} className="text-green-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Insights</h3>
              </div>
              <div className="space-y-2">
                {collaborationInsights.map((insight, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{insight.spaceName}</span>
                      {insight.trend === 'up' && (
                        <FontAwesomeIcon icon={faArrowTrendUp} className="text-green-400 text-xs" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{insight.members} members</span>
                      <span className="text-cyan-400 font-semibold">{insight.messagesLast24h}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-6">
          
          {/* New Minimal Header */}
          <div className="flex items-center justify-between">
            {/* Left: Segmented Control for Tabs */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm">
              {[
                { id: 'my-spaces', label: 'Spaces', count: stats.total },
                { id: 'shared', label: 'Invites', count: stats.pending }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-2">
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
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Search Bar - Clean Version */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-64 pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm
                    text-white placeholder-gray-500 text-sm outline-none
                    focus:bg-zinc-900/70 transition-all duration-300`}
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" 
                />
              </div>

              {/* Filter Dropdown - My Spaces only */}
              {activeTab === 'my-spaces' && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`px-4 py-2.5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm
                      hover:bg-zinc-900/70 transition-all duration-300 
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
                      
                      <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-zinc-900/90 backdrop-blur-xl overflow-hidden z-20 shadow-2xl">
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
                                ? 'bg-white/10 text-cyan-300'
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

              {/* Create Button - Prominent */}
              <button
                onClick={() => setModalOpen(true)}
                disabled={createSpaceMutation.isPending}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 
                  hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 
                  text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 
                  hover:shadow-cyan-500/40 hover:scale-105 flex items-center gap-2 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={createSpaceMutation.isPending ? faSpinner : faPlus} className={`text-sm ${createSpaceMutation.isPending ? 'animate-spin' : ''}`} />
                <span>New Space</span>
              </button>
            </div>
          </div>

          {/* Spaces Grid / Invitations */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'my-spaces' ? (
              filteredSpaces.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 
                      flex items-center justify-center mx-auto mb-6">
                      <FontAwesomeIcon 
                        icon={searchQuery ? faSearch : faRocket} 
                        className="text-4xl text-gray-600" 
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      {searchQuery ? 'No spaces found' : 'Create your first space'}
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      {searchQuery 
                        ? 'Try adjusting your search query' 
                        : 'Spaces help you organize your projects, teams, and ideas'
                      }
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setModalOpen(true)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 
                          hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 
                          text-white font-semibold shadow-lg shadow-cyan-500/25"
                      >
                        Create Space
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {filteredSpaces.map((space, index) => {
                    const activity = recentActivity.find(a => a.spaceId === space.id);
                    return (
                      <button
                        key={space.id}
                        onClick={() => handleSpaceClick(space)}
                        className={`group relative text-left p-5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm
                          hover:bg-zinc-900/70 transition-all duration-300 
                          hover:-translate-y-1`}
                      >
                        {/* Icon & Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(index)} 
                            flex items-center justify-center shadow-lg 
                            group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                            <FontAwesomeIcon 
                              icon={space.icon && iconMap[space.icon] ? iconMap[space.icon] : faRocket} 
                              className="text-white text-xl" 
                            />
                          </div>
                          
                          {activity && activity.unreadCount > 0 && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 
                              flex items-center justify-center shadow-lg">
                              <span className="text-xs font-bold text-white">{activity.unreadCount}</span>
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <h3 className="text-sm font-bold mb-1 text-white group-hover:text-cyan-300 
                          transition-colors duration-300 line-clamp-1">
                          {space.name}
                        </h3>
                        
                        {/* Description */}
                        {space.description && (
                          <p className="text-xs mb-4 line-clamp-2 text-gray-400">
                            {space.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon 
                              icon={space.privacy === 'private' ? faLock : space.privacy === 'shared' ? faUsers : faGlobe} 
                              className="text-xs text-gray-500" 
                            />
                            <span className="text-xs text-gray-500">
                              {new Date(space.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <FontAwesomeIcon 
                            icon={faChevronRight} 
                            className="text-xs text-gray-500 group-hover:text-cyan-400 
                              group-hover:translate-x-1 transition-all duration-300" 
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              loadingInvitations ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 
                      flex items-center justify-center mx-auto mb-6">
                      <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">No pending invitations</h3>
                    <p className="text-sm text-gray-400">
                      When someone invites you to a space, it will appear here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {invitations.map((invitation, index) => (
                    <div 
                      key={invitation.id}
                      className="relative p-5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm
                        hover:bg-zinc-900/70 transition-all duration-300"
                    >
                      {/* Icon & Privacy */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(index)} 
                          flex items-center justify-center shadow-lg`}>
                          <FontAwesomeIcon
                            icon={invitation.space?.icon && iconMap[invitation.space?.icon] ? iconMap[invitation.space?.icon] : faRocket}
                            className="text-white text-xl"
                          />
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-white/5">
                          <FontAwesomeIcon
                            icon={invitation.space?.privacy === 'private' ? faLock : faUsers}
                            className="text-xs text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Space Name */}
                      <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
                        {invitation.space?.name}
                      </h3>
                      
                      {/* Description */}
                      {invitation.space?.description && (
                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                          {invitation.space?.description}
                        </p>
                      )}

                      {/* Inviter */}
                      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/[0.03]">
                        {invitation.invited_by.avatar_url ? (
                          <img
                            src={invitation.invited_by.avatar_url}
                            alt={invitation.invited_by.display_name || invitation.invited_by.email}
                            className="w-8 h-8 rounded-xl"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 
                            flex items-center justify-center text-white text-xs font-bold">
                            {(invitation.invited_by.display_name || invitation.invited_by.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {invitation.invited_by.display_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{invitation.role}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptInvitation(invitation.id)}
                          disabled={processingInvitation === invitation.id}
                          className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                            hover:from-cyan-500/30 hover:to-purple-500/30 
                            text-cyan-300 font-medium text-xs transition-all duration-300 
                            flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingInvitation === invitation.id ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCheck} className="text-xs" />
                              <span>Accept</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => rejectInvitation(invitation.id)}
                          disabled={processingInvitation === invitation.id}
                          className="px-3 py-2.5 rounded-xl bg-white/5 
                            hover:bg-white/10 
                            text-gray-400 hover:text-red-400 transition-all duration-300 
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-sm" />
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
        </div>
      </div>

      <CreateSpaceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
// web/src/pages/SpaceView.tsx
// Sophisticated SpaceView with rich visual hierarchy and premium design

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpace, useSpaceStats, useSpaceMembers } from '../hooks/useSpaces';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { InviteToSpaceModal } from '../components/spaces/spaceModals/InviteToSpaceModal';
import { SpaceMembersModal } from '../components/spaces/spaceModals/SpaceMembersModal';
import { WidgetLibraryModal } from '../components/spaces/spaceModals/WidgetLibraryModal';
import { ConvertSpaceModal } from '../components/spaces/spaceModals/ConvertSpaceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faComments, faFolder, faFileAlt, faCheckCircle,
  faUsers, faCalendar, faChartBar, faLock, faHeart, faBriefcase,
  faGlobe, faRocket, faPlus, faEllipsisV, faCode, faImage,
  faLink, faVideo, faMicrophone, faPoll, faUserPlus, faBuilding,
  faBell, faArrowTrendUp, faClock, faFire, faBolt,
  faBrain, faLayerGroup,
  faStar, faWandMagicSparkles, faShieldAlt,
  faBookmark, faShare, faChevronRight,
  faPalette, faCog, faTrash,
  faSearch, faCompass,
  faDatabase, faKey,
  faExclamationTriangle, faArrowRight,
  faMessage, faFile
} from '@fortawesome/free-solid-svg-icons';

const iconMap: { [key: string]: any } = {
  'lock': faLock, 'heart': faHeart, 'users': faUsers,
  'briefcase': faBriefcase, 'globe': faGlobe, 'rocket': faRocket,
};

interface Widget {
  id: string; name: string; icon: any; color: string;
  description: string; category: 'communication' | 'productivity' | 'content' | 'collaboration';
}

const AVAILABLE_WIDGETS: Widget[] = [
  { id: 'chat', name: 'Chat', icon: faComments, color: 'from-blue-500 to-cyan-600', description: 'Real-time messaging', category: 'communication' },
  { id: 'files', name: 'Files', icon: faFolder, color: 'from-purple-500 to-pink-600', description: 'File storage & sharing', category: 'content' },
  { id: 'notes', name: 'Notes', icon: faFileAlt, color: 'from-green-500 to-teal-600', description: 'Documents & notes', category: 'content' },
  { id: 'tasks', name: 'Tasks', icon: faCheckCircle, color: 'from-orange-500 to-red-600', description: 'Task management', category: 'productivity' },
  { id: 'calendar', name: 'Calendar', icon: faCalendar, color: 'from-pink-500 to-rose-600', description: 'Events & scheduling', category: 'productivity' },
  { id: 'board', name: 'Board', icon: faChartBar, color: 'from-indigo-500 to-purple-600', description: 'Kanban boards', category: 'productivity' },
  { id: 'whiteboard', name: 'Whiteboard', icon: faImage, color: 'from-amber-500 to-orange-600', description: 'Visual collaboration', category: 'collaboration' },
  { id: 'video', name: 'Video', icon: faVideo, color: 'from-red-500 to-pink-600', description: 'Video calls', category: 'communication' },
  { id: 'voice', name: 'Voice', icon: faMicrophone, color: 'from-blue-500 to-indigo-600', description: 'Audio channels', category: 'communication' },
  { id: 'polls', name: 'Polls', icon: faPoll, color: 'from-teal-500 to-cyan-600', description: 'Surveys & voting', category: 'collaboration' },
  { id: 'links', name: 'Links', icon: faLink, color: 'from-violet-500 to-purple-600', description: 'Bookmarks', category: 'content' },
  { id: 'code', name: 'Code', icon: faCode, color: 'from-slate-500 to-gray-600', description: 'Code snippets', category: 'productivity' },
];

const PRIVACY_OPTIONS = [
  { value: 'private', label: 'Private', icon: faLock, color: 'from-gray-500 to-gray-700', desc: 'Only you can access' },
  { value: 'shared', label: 'Shared', icon: faUsers, color: 'from-blue-500 to-cyan-600', desc: 'Invite specific people' },
  { value: 'team', label: 'Team', icon: faBuilding, color: 'from-purple-500 to-pink-600', desc: 'Organization workspace' },
  { value: 'public', label: 'Public', icon: faGlobe, color: 'from-green-500 to-emerald-600', desc: 'Anyone can view' },
];

interface ActivityItem {
  id: string; type: 'message' | 'file' | 'task' | 'member' | 'edit';
  user: string; action: string; time: Date;
}

export function SpaceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  const { data: space, isLoading: loadingSpace, error: spaceError } = useSpace(id);
  const { data: stats } = useSpaceStats(id);
  const { data: members = [] } = useSpaceMembers(id);

  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [targetPrivacy, setTargetPrivacy] = useState<'private' | 'shared' | 'team' | 'public'>('shared');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['chat', 'files', 'tasks']);
  const [filterCategory, setFilterCategory] = useState<'all' | 'communication' | 'productivity' | 'content' | 'collaboration'>('all');
  const [widgetSearchQuery, setWidgetSearchQuery] = useState('');

  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const [recentActivity] = useState<ActivityItem[]>([
    { id: '1', type: 'message', user: 'Sarah Chen', action: 'New design iteration ready for review', time: new Date(Date.now() - 180000) },
    { id: '2', type: 'file', user: 'Alex Kumar', action: 'Uploaded wireframes_v3.fig', time: new Date(Date.now() - 420000) },
    { id: '3', type: 'task', user: 'You', action: 'Completed "API Integration"', time: new Date(Date.now() - 720000) },
    { id: '4', type: 'edit', user: 'Jamie Lee', action: 'Updated project roadmap', time: new Date(Date.now() - 1200000) },
    { id: '5', type: 'member', user: 'Chris Park', action: 'Joined the space', time: new Date(Date.now() - 1800000) },
  ]);

  const [teamMembers] = useState([
    { name: 'Sarah Chen', role: 'Designer', status: 'online', avatar: 'S' },
    { name: 'Alex Kumar', role: 'Developer', status: 'online', avatar: 'A' },
    { name: 'You', role: 'Owner', status: 'online', avatar: 'Y' },
    { name: 'Jamie Lee', role: 'PM', status: 'away', avatar: 'J' },
    { name: 'Chris Park', role: 'Engineer', status: 'offline', avatar: 'C' },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleWidget = (widgetId: string) => {
    setActiveWidgets(prev => prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]);
  };

  const handleInviteClick = () => {
    if (space?.privacy === 'private') {
      setTargetPrivacy('shared');
      setShowConvertModal(true);
    } else {
      setShowInviteModal(true);
    }
  };

  const handleConvertSuccess = () => {
    if (targetPrivacy === 'shared' || targetPrivacy === 'team') setShowInviteModal(true);
  };

  const handlePrivacyChange = (privacy: 'private' | 'shared' | 'team' | 'public') => {
    setTargetPrivacy(privacy);
    setShowConvertModal(true);
    setShowSettingsMenu(false);
  };

  const filteredWidgets = AVAILABLE_WIDGETS.filter(w => {
    const matchesCategory = filterCategory === 'all' || w.category === filterCategory;
    const matchesSearch = widgetSearchQuery === '' || w.name.toLowerCase().includes(widgetSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).filter(w => activeWidgets.includes(w.id));

  const isDark = theme === 'dark';
  const currentPrivacy = PRIVACY_OPTIONS.find(p => p.value === space?.privacy);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return faComments;
      case 'file': return faFolder;
      case 'task': return faCheckCircle;
      case 'member': return faUserPlus;
      case 'edit': return faFileAlt;
      default: return faBell;
    }
  };

  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'message': return { bg: 'from-blue-500 to-cyan-500', color: 'text-blue-400' };
      case 'file': return { bg: 'from-purple-500 to-pink-500', color: 'text-purple-400' };
      case 'task': return { bg: 'from-emerald-500 to-teal-500', color: 'text-emerald-400' };
      case 'member': return { bg: 'from-orange-500 to-amber-500', color: 'text-orange-400' };
      case 'edit': return { bg: 'from-indigo-500 to-violet-500', color: 'text-indigo-400' };
      default: return { bg: 'from-gray-500 to-slate-500', color: 'text-gray-400' };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const currentUserRole = (members.find(m => m.user.id === user?.id)?.role as 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer') || 'viewer';

  if (loadingSpace) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 animate-pulse" />
            <div className="absolute inset-[3px] rounded-xl bg-black/90 flex items-center justify-center">
              <FontAwesomeIcon icon={faCompass} className="text-2xl text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading space...</p>
        </div>
      </div>
    );
  }

  if (spaceError) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Cannot Load Space</h2>
          <p className="text-sm text-gray-400 mb-6">
            {(spaceError as Error)?.message || 'Failed to load space'}
          </p>
          <button
            onClick={() => navigate('/spaces')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 text-white font-semibold"
          >
            Back to Spaces
          </button>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
        <div className="text-center">
          <p className="text-gray-400">Space not found</p>
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
            <div className="space-y-3">
              {/* Back button */}
              <button
                onClick={() => navigate('/spaces')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Spaces</span>
              </button>

              {/* Space Info */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentPrivacy?.color || 'from-purple-500 to-purple-600'} flex items-center justify-center shadow-lg`}>
                  <FontAwesomeIcon icon={space?.icon && iconMap[space.icon] ? iconMap[space.icon] : faRocket} className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{space?.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={currentPrivacy?.icon || faLock} className="text-xs text-cyan-400" />
                      <span className="text-sm text-gray-400">{currentPrivacy?.label}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="text-sm text-gray-400">{stats?.members || members.length} members</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMembersModal(true)}
                className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-sm text-white`}
              >
                <FontAwesomeIcon icon={faUsers} className="text-xs text-cyan-400" />
                <span className="font-medium">{stats?.members || members.length} Members</span>
              </button>
              <button
                onClick={handleInviteClick}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                Invite
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faBookmark} className="text-sm" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faShare} className="text-sm" />
              </button>

              {/* Settings Menu */}
              <div className="relative" ref={settingsMenuRef}>
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-black/90 backdrop-blur-xl border border-white/[0.06] overflow-hidden z-50 shadow-2xl">
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-semibold px-3 py-1 text-gray-400">Privacy</p>
                      {PRIVACY_OPTIONS.map((privacy) => (
                        <button
                          key={privacy.value}
                          onClick={() => handlePrivacyChange(privacy.value as any)}
                          disabled={space?.privacy === privacy.value}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                            space?.privacy === privacy.value ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                          } disabled:cursor-default`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${privacy.color} flex items-center justify-center flex-shrink-0`}>
                            <FontAwesomeIcon icon={privacy.icon} className="text-white text-xs" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${space?.privacy === privacy.value ? 'text-cyan-400' : 'text-white'}`}>{privacy.label}</p>
                            <p className="text-xs text-gray-500">{privacy.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <FontAwesomeIcon icon={faPalette} className="text-purple-400 text-xs" />
                        </div>
                        <span className="text-sm text-white">Customize</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                          <FontAwesomeIcon icon={faCog} className="text-gray-400 text-xs" />
                        </div>
                        <span className="text-sm text-white">Settings</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-500/10 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <FontAwesomeIcon icon={faTrash} className="text-red-400 text-xs" />
                        </div>
                        <span className="text-sm text-red-400">Delete Space</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Messages', value: stats?.messages || 147, icon: faMessage, change: 23, color: 'cyan' },
              { label: 'Files', value: stats?.files || 23, icon: faFile, change: 5, color: 'purple' },
              { label: 'Tasks Done', value: 8, icon: faCheckCircle, change: 2, color: 'emerald' },
              { label: 'Active Now', value: teamMembers.filter(m => m.status === 'online').length, icon: faBolt, change: 0, color: 'amber' },
              { label: 'Storage', value: `${stats?.storageUsed || 3.7}GB`, icon: faDatabase, change: 0, color: 'rose' },
              { label: 'Engagement', value: '87%', icon: faArrowTrendUp, change: 12, color: 'indigo' }
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
                      {stat.change}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column - Activity & Team */}
            <div className="lg:col-span-3 space-y-6">
              {/* Activity Feed */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] overflow-hidden`}>
                <div className="p-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Activity</h3>
                      <p className="text-xs text-gray-500">Recent updates</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="relative">
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent" />
                    <div className="space-y-1">
                      {recentActivity.slice(0, 5).map((activity) => {
                        const style = getActivityStyle(activity.type);
                        return (
                          <div
                            key={activity.id}
                            className="relative pl-10 py-3 group cursor-pointer hover:bg-white/[0.02] rounded-xl transition-colors -ml-2 pr-2"
                          >
                            <div className={`absolute left-0 top-4 w-5 h-5 rounded-md bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-lg`}>
                              <FontAwesomeIcon icon={getActivityIcon(activity.type)} className="text-white text-[8px]" />
                            </div>
                            <div>
                              <p className="text-xs text-white line-clamp-1">
                                <span className="font-semibold">{activity.user}</span>
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1">{activity.action}</p>
                              <p className="text-[10px] text-gray-600 mt-0.5">{formatTimeAgo(activity.time)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUsers} className="text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Team</h3>
                      <p className="text-xs text-gray-500">{teamMembers.filter(m => m.status === 'online').length} online</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {teamMembers.slice(0, 5).map((member, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                          {member.avatar}
                        </div>
                        {member.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                        )}
                        {member.status === 'away' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-black" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowMembersModal(true)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  View all members
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
              </div>

              {/* AI Insights */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBrain} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">AI Insights</h3>
                    <p className="text-xs text-gray-500">Recommendations</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faFire, text: 'Peak activity 2-4 PM', color: 'orange' },
                    { icon: faArrowTrendUp, text: 'Collaboration up 34%', color: 'emerald' },
                    { icon: faWandMagicSparkles, text: 'Suggest weekly sync', color: 'purple' }
                  ].map((insight, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer">
                      <FontAwesomeIcon icon={insight.icon} className={`text-${insight.color}-400 text-sm`} />
                      <p className="text-xs text-gray-400">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Column - Widgets */}
            <div className="lg:col-span-6 space-y-6">
              {/* Widget Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Category Filter */}
                <div className="inline-flex items-center p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {['all', 'communication', 'productivity', 'content'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        filterCategory === cat
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Search & Add Widget */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search widgets..."
                      value={widgetSearchQuery}
                      onChange={(e) => setWidgetSearchQuery(e.target.value)}
                      className="w-48 pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-500 text-xs outline-none focus:border-cyan-500/30 transition-all"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                  </div>
                  <button
                    onClick={() => setShowWidgetLibrary(true)}
                    className="px-2 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all flex items-center gap-[4px] text-[11px] text-white"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs text-cyan-400" />
                    Add Widget
                  </button>
                </div>
              </div>

              {/* Widgets Grid */}
              {filteredWidgets.length === 0 ? (
                <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-12`}>
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6">
                      <FontAwesomeIcon icon={widgetSearchQuery ? faSearch : faLayerGroup} className="text-4xl text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      {widgetSearchQuery ? 'No widgets found' : 'Add your first widget'}
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      {widgetSearchQuery ? 'Try a different search' : 'Widgets help you collaborate effectively'}
                    </p>
                    {!widgetSearchQuery && (
                      <button
                        onClick={() => setShowWidgetLibrary(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 text-white font-semibold"
                      >
                        Browse Widgets
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWidgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => navigate(`/spaces/${id}/${widget.id}`)}
                      className={`group relative text-left p-5 rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1`}
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${widget.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                        <FontAwesomeIcon icon={widget.icon} className="text-white text-xl" />
                      </div>

                      <h3 className="text-base font-bold mb-1 text-white group-hover:text-cyan-300 transition-colors duration-300">
                        {widget.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">
                        {widget.description}
                      </p>

                      {widget.id === 'chat' && (stats?.messages || 0) > 0 && (
                        <div className="absolute top-4 right-4">
                          <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg">
                            <span className="text-xs font-bold text-white">{stats?.messages}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                        <span className="text-xs text-gray-500 capitalize">{widget.category}</span>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="text-xs text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Quick Actions & Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Actions */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBolt} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Quick Actions</h3>
                    <p className="text-xs text-gray-500">Common tasks</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faMessage, label: 'New Message', desc: 'Start a conversation', action: () => navigate(`/spaces/${id}/chat`), gradient: 'from-blue-500 to-cyan-600' },
                    { icon: faFile, label: 'Upload File', desc: 'Share a document', action: () => navigate(`/spaces/${id}/files`), gradient: 'from-purple-500 to-pink-600' },
                    { icon: faCheckCircle, label: 'Create Task', desc: 'Add a new task', action: () => navigate(`/spaces/${id}/tasks`), gradient: 'from-emerald-500 to-teal-600' },
                    { icon: faUserPlus, label: 'Invite People', desc: 'Grow your team', action: handleInviteClick, gradient: 'from-orange-500 to-amber-600' }
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-300 group text-left"
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <FontAwesomeIcon icon={action.icon} className="text-white text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.desc}</p>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all text-xs" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Space Info */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Space Info</h3>
                    <p className="text-xs text-gray-500">Details & settings</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                    <span className="text-xs text-gray-400">Privacy</span>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={currentPrivacy?.icon || faLock} className="text-xs text-cyan-400" />
                      <span className="text-xs text-white font-medium">{currentPrivacy?.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                    <span className="text-xs text-gray-400">Your Role</span>
                    <span className="text-xs text-white font-medium capitalize">{currentUserRole}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                    <span className="text-xs text-gray-400">Created</span>
                    <span className="text-xs text-white font-medium">
                      {space?.created_at ? new Date(space.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faDatabase} className="text-rose-400" />
                    <span className="text-sm font-semibold text-white">Storage</span>
                  </div>
                  <span className="text-xs text-gray-400">{stats?.storageUsed || 3.7}GB / 10GB</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600"
                    style={{ width: `${((stats?.storageUsed || 3.7) / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round(((stats?.storageUsed || 3.7) / 10) * 100)}% used
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WidgetLibraryModal
        isOpen={showWidgetLibrary}
        onClose={() => setShowWidgetLibrary(false)}
        activeWidgets={activeWidgets}
        onToggleWidget={toggleWidget}
        availableWidgets={AVAILABLE_WIDGETS}
      />
      {showConvertModal && id && space && (
        <ConvertSpaceModal
          isOpen={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          spaceId={id}
          spaceName={space.name}
          currentPrivacy={space.privacy as 'public' | 'private' | 'shared' | 'team'}
          targetPrivacy={targetPrivacy}
          onSuccess={handleConvertSuccess}
        />
      )}
      {showInviteModal && id && space && (
        <InviteToSpaceModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          spaceId={id}
          spaceName={space.name}
          spacePrivacy={space.privacy as 'public' | 'private' | 'shared' | 'team'}
        />
      )}
      {showMembersModal && id && space && (
        <SpaceMembersModal
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          spaceId={id}
          spaceName={space.name}
          currentUserRole={currentUserRole}
          onInviteClick={() => {
            setShowMembersModal(false);
            handleInviteClick();
          }}
        />
      )}
    </div>
  );
}

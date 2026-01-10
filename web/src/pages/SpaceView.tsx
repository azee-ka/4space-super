import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpacesStore } from '../store/spacesStore';
import { useThemeStore } from '../store/themeStore';
import { Navbar } from '../components/navbar/Navbar';
import { InviteToSpaceModal } from '../components/spaces/InviteToSpaceModal';
import { WidgetLibraryModal } from '../components/spaces/WidgetLibraryModal';
import { ConvertSpaceModal } from '../components/spaces/ConvertSpaceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faComments, faFolder, faFileAlt, faCheckCircle, 
  faUsers, faCalendar, faChartBar, faLock, faHeart, faBriefcase, 
  faGlobe, faRocket, faPlus, faEllipsisV, faCode, faImage, 
  faLink, faVideo, faMicrophone, faPoll, faUserPlus, faBuilding,
  faBell, faHistory, faArrowTrendUp, faClock, faFire, faBolt,
  faBrain, faChartLine, faCircleNodes, faLayerGroup, faEye,
  faStar, faCrown, faAtom, faWandMagicSparkles, faShieldAlt,
  faInbox, faPaperPlane, faBookmark, faDownload, faShare, faChevronRight,
  faPalette, faCog, faTrash, faArchive, faCopy, faExternalLinkAlt,
  faUserShield, faBan, faFileExport, faCloudUploadAlt, faChartPie,
  faTags, faFilter, faSearch, faSliders, faMoon, faSun, faExpand,
  faCompress, faVolumeUp, faVolumeMute, faInfoCircle, faQuestionCircle,
  faDatabase, faServer, faNetworkWired, faKey, faFingerprint, faQrcode,
  faRobot, faLightbulb, faFlag, faHeartbeat, faChevronDown, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';

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
  { id: 'files', name: 'Files', icon: faFolder, color: 'from-purple-500 to-pink-600', description: 'File storage', category: 'content' },
  { id: 'notes', name: 'Notes', icon: faFileAlt, color: 'from-green-500 to-teal-600', description: 'Docs & notes', category: 'content' },
  { id: 'tasks', name: 'Tasks', icon: faCheckCircle, color: 'from-orange-500 to-red-600', description: 'Task management', category: 'productivity' },
  { id: 'calendar', name: 'Calendar', icon: faCalendar, color: 'from-pink-500 to-rose-600', description: 'Events', category: 'productivity' },
  { id: 'board', name: 'Board', icon: faChartBar, color: 'from-indigo-500 to-purple-600', description: 'Kanban', category: 'productivity' },
  { id: 'whiteboard', name: 'Whiteboard', icon: faImage, color: 'from-amber-500 to-orange-600', description: 'Visual collab', category: 'collaboration' },
  { id: 'video', name: 'Video', icon: faVideo, color: 'from-red-500 to-pink-600', description: 'Video calls', category: 'communication' },
  { id: 'voice', name: 'Voice', icon: faMicrophone, color: 'from-blue-500 to-indigo-600', description: 'Audio', category: 'communication' },
  { id: 'polls', name: 'Polls', icon: faPoll, color: 'from-teal-500 to-cyan-600', description: 'Surveys', category: 'collaboration' },
  { id: 'links', name: 'Links', icon: faLink, color: 'from-violet-500 to-purple-600', description: 'Bookmarks', category: 'content' },
  { id: 'code', name: 'Code', icon: faCode, color: 'from-slate-500 to-gray-600', description: 'Coding', category: 'productivity' },
];

const PRIVACY_OPTIONS = [
  { value: 'private', label: 'Private', icon: faLock, color: 'from-gray-500 to-gray-700', desc: 'Only you can access' },
  { value: 'shared', label: 'Shared', icon: faUsers, color: 'from-blue-500 to-cyan-600', desc: 'Invite specific people' },
  { value: 'team', label: 'Team', icon: faBuilding, color: 'from-purple-500 to-pink-600', desc: 'Organization workspace' },
  { value: 'public', label: 'Public', icon: faGlobe, color: 'from-green-500 to-emerald-600', desc: 'Anyone can view' },
];

interface ActivityItem {
  id: string; type: 'message' | 'file' | 'task' | 'member' | 'edit';
  user: string; action: string; time: Date; metadata?: any;
}

interface CollaborationMetric {
  label: string; value: number; change: number; trend: 'up' | 'down' | 'stable';
  icon: any; color: string;
}

export function SpaceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { selectedSpace, fetchSpaces } = useSpacesStore();
  const [loading, setLoading] = useState(true);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [targetPrivacy, setTargetPrivacy] = useState<'private' | 'shared' | 'team' | 'public'>('shared');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['chat', 'files', 'tasks']);
  const [filterCategory, setFilterCategory] = useState<'all' | 'communication' | 'productivity' | 'content' | 'collaboration'>('all');
  const [widgetSearchQuery, setWidgetSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const [stats, setStats] = useState({ 
    messages: 147, files: 23, tasks: 12, members: 5, activeToday: 3, 
    storageUsed: 3.7, tasksCompleted: 8, responseTime: 12, engagement: 87,
    totalStorage: 10, completionRate: 67, averageResponseTime: 12
  });
  
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const [recentActivity] = useState<ActivityItem[]>([
    { id: '1', type: 'message', user: 'Sarah Chen', action: 'New design iteration ready for review', time: new Date(Date.now() - 180000) },
    { id: '2', type: 'file', user: 'Alex Kumar', action: 'Uploaded wireframes_v3.fig', time: new Date(Date.now() - 420000) },
    { id: '3', type: 'task', user: 'You', action: 'Completed "API Integration"', time: new Date(Date.now() - 720000) },
    { id: '4', type: 'edit', user: 'Jamie Lee', action: 'Updated project roadmap', time: new Date(Date.now() - 1200000) },
    { id: '5', type: 'member', user: 'Chris Park', action: 'Joined the space', time: new Date(Date.now() - 1800000) },
  ]);

  const [metrics] = useState<CollaborationMetric[]>([
    { label: 'Messages', value: 147, change: 23, trend: 'up', icon: faComments, color: 'cyan' },
    { label: 'Active Users', value: 3, change: 1, trend: 'up', icon: faBolt, color: 'orange' },
    { label: 'Files Shared', value: 23, change: 5, trend: 'up', icon: faFolder, color: 'purple' },
    { label: 'Tasks Done', value: 8, change: -2, trend: 'down', icon: faCheckCircle, color: 'green' },
  ]);

  const [teamMembers] = useState([
    { name: 'Sarah Chen', role: 'Designer', status: 'online', avatar: 'S' },
    { name: 'Alex Kumar', role: 'Developer', status: 'online', avatar: 'A' },
    { name: 'You', role: 'Owner', status: 'online', avatar: 'Y' },
    { name: 'Jamie Lee', role: 'PM', status: 'away', avatar: 'J' },
    { name: 'Chris Park', role: 'Engineer', status: 'offline', avatar: 'C' },
  ]);

  useEffect(() => {
    if (id && !selectedSpace) fetchSpaces();
    if (id) loadSpaceData();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSpaceData = async () => {
    try {
      const { data: messages } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('space_id', id);
      const { data: members } = await supabase.from('space_members').select('id', { count: 'exact', head: true }).eq('space_id', id);
      setStats(prev => ({ ...prev, messages: messages?.length || 0, members: members?.length || 1 }));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setActiveWidgets(prev => prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]);
  };

  const handleInviteClick = () => {
    if (selectedSpace?.privacy === 'private') {
      setTargetPrivacy('shared');
      setShowConvertModal(true);
    } else {
      setShowInviteModal(true);
    }
  };

  const handleConvertSuccess = () => {
    fetchSpaces();
    loadSpaceData();
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
  const currentPrivacy = PRIVACY_OPTIONS.find(p => p.value === selectedSpace?.privacy);

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

  const formatTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <Navbar />

      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Left Sidebar - Insights with Glowing Cards */}
        <div className="w-80 flex-shrink-0 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Back Button & Space Header */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-purple-500/20 to-cyan-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-cyan-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="mb-4 px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition-all hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                <span className="font-medium">Back</span>
              </button>

              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentPrivacy?.color || 'from-purple-500 to-purple-600'} flex items-center justify-center shadow-lg`}>
                  <FontAwesomeIcon icon={selectedSpace?.icon && iconMap[selectedSpace.icon] ? iconMap[selectedSpace.icon] : faRocket} className="text-white text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold truncate text-white">
                    {selectedSpace?.name || 'Space'}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <FontAwesomeIcon icon={currentPrivacy?.icon || faLock} className="text-xs text-cyan-400" />
                    <span className="text-xs text-gray-400">{currentPrivacy?.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-purple-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-purple-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <h3 className="text-sm font-bold text-white mb-4">Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((metric, i) => (
                  <div key={i} className="relative group/stat">
                    <div className={`absolute inset-0 bg-gradient-to-br ${metric.color === 'cyan' ? 'from-cyan-400 to-blue-500' : metric.color === 'orange' ? 'from-yellow-400 to-orange-500' : metric.color === 'purple' ? 'from-pink-400 to-rose-500' : 'from-purple-400 to-fuchsia-500'} opacity-0 group-hover/stat:opacity-10 rounded-lg transition-opacity duration-300`} />
                    <div className="relative p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-lg bg-${metric.color}-500/20 flex items-center justify-center`}>
                          <FontAwesomeIcon icon={metric.icon} className={`text-${metric.color}-400 text-xs`} />
                        </div>
                        {metric.change !== 0 && (
                          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                            metric.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <FontAwesomeIcon 
                              icon={faArrowTrendUp} 
                              className={`text-xs ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} 
                              style={{ transform: metric.trend === 'down' ? 'rotate(180deg)' : 'none' }} 
                            />
                            <span className={`text-xs font-semibold ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                              {Math.abs(metric.change)}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-white mb-0.5">{metric.value}</p>
                      <p className="text-xs text-gray-400">{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Space DNA */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/25 via-fuchsia-500/20 to-purple-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-purple-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faAtom} className="text-purple-400 text-sm" />
                </div>
                <h3 className="text-sm font-bold text-white">Space DNA</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">Engagement Score</span>
                    <span className="text-sm font-bold text-purple-400">{stats.engagement}%</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="absolute h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 shadow-lg shadow-purple-500/50 transition-all duration-500" 
                      style={{ width: `${stats.engagement}%` }} 
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-purple-400 text-xs" />
                    <span className="text-xs text-gray-400">Response Time</span>
                  </div>
                  <span className="text-sm font-bold text-cyan-400">{stats.responseTime}min</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500/25 via-emerald-500/20 to-green-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-green-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBrain} className="text-green-400 text-sm" />
                </div>
                <h3 className="text-sm font-bold text-white">AI Insights</h3>
              </div>
              <div className="space-y-2">
                {[
                  { icon: faFire, color: 'orange', text: 'Peak activity 2-4 PM', subtext: 'Schedule meetings then' },
                  { icon: faArrowTrendUp, color: 'green', text: 'Collaboration up 34%', subtext: 'Great team synergy' },
                  { icon: faWandMagicSparkles, color: 'purple', text: 'Suggest weekly sync', subtext: 'Based on patterns' },
                ].map((insight, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-md bg-${insight.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                        <FontAwesomeIcon icon={insight.icon} className={`text-${insight.color}-400 text-xs`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{insight.text}</p>
                        <p className="text-xs text-gray-500">{insight.subtext}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-blue-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faHistory} className="text-cyan-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Live Feed</h3>
              </div>
              <div className="space-y-2">
                {recentActivity.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={getActivityIcon(item.type)} className="text-xs text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white line-clamp-1">
                          <span className="font-semibold">{item.user}</span>
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.action}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{formatTimeAgo(item.time)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-orange-500/25 via-red-500/20 to-orange-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-orange-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faBolt} className="text-orange-400 text-sm" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Team</h3>
                </div>
                <span className="text-xs text-gray-400">{teamMembers.filter(m => m.status === 'online').length} online</span>
              </div>
              <div className="space-y-2">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white">
                        {member.avatar}
                      </div>
                      {member.status === 'online' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black animate-pulse" />
                      )}
                      {member.status === 'away' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-black" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-white">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Storage */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-pink-500/25 via-rose-500/20 to-pink-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-pink-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            
            <div className={`relative p-5 rounded-xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faDatabase} className="text-pink-400 text-sm" />
                  <h3 className="text-sm font-bold text-white">Storage</h3>
                </div>
                <span className="text-xs text-gray-400">{stats.storageUsed}GB / {stats.totalStorage}GB</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-600" 
                  style={{ width: `${(stats.storageUsed / stats.totalStorage) * 100}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{Math.round((stats.storageUsed / stats.totalStorage) * 100)}% used</span>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors">Upgrade</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-6">
          
          {/* Enhanced Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(`/spaces/${id}/chat`)} 
                className="px-4 py-2.5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-all duration-300 flex items-center gap-2 text-sm text-white"
              >
                <FontAwesomeIcon icon={faUsers} className="text-xs text-cyan-400" />
                <span className="font-medium">{stats.members} Members</span>
              </button>

              <button 
                onClick={handleInviteClick} 
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <FontAwesomeIcon icon={faUserPlus} className="text-sm" />
                Invite
              </button>
              
              <button 
                onClick={() => setShowWidgetLibrary(true)} 
                className="px-4 py-2.5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-all duration-300 flex items-center gap-2 text-sm text-white"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                Widget
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions Menu */}
              <div className="relative" ref={quickActionsRef}>
                <button 
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="w-9 h-9 rounded-xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 flex items-center justify-center transition-all text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faBolt} className="text-xs" />
                </button>

                {showQuickActions && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900/90 backdrop-blur-xl overflow-hidden z-50 shadow-2xl border border-white/[0.05]">
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-semibold px-2 text-gray-400">Quick Actions</p>
                    </div>
                    <div className="p-2">
                      {[
                        { icon: faSearch, label: 'Search Space', color: 'cyan' },
                        { icon: faFileExport, label: 'Export Data', color: 'purple' },
                        { icon: faCopy, label: 'Duplicate Space', color: 'blue' },
                        { icon: faArchive, label: 'Archive Space', color: 'yellow' },
                        { icon: faChartPie, label: 'View Analytics', color: 'green' },
                        { icon: faQrcode, label: 'Share QR Code', color: 'pink' },
                      ].map((action, i) => (
                        <button
                          key={i}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5 text-white"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-${action.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                            <FontAwesomeIcon icon={action.icon} className={`text-${action.color}-400 text-xs`} />
                          </div>
                          <span className="text-sm font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="w-9 h-9 rounded-xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 flex items-center justify-center transition-all text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faShare} className="text-xs" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 flex items-center justify-center transition-all text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faBookmark} className="text-xs" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 flex items-center justify-center transition-all text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faStar} className="text-xs" />
              </button>

              {/* Enhanced Settings Menu */}
              <div className="relative" ref={settingsMenuRef}>
                <button 
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)} 
                  className="w-9 h-9 rounded-xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 flex items-center justify-center transition-all text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900/90 backdrop-blur-xl overflow-hidden z-50 shadow-2xl border border-white/[0.05]">
                    {/* Privacy Section */}
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-semibold px-2 text-gray-400 mb-2">Privacy</p>
                      <div className="space-y-1">
                        {PRIVACY_OPTIONS.map((privacy) => (
                          <button
                            key={privacy.value}
                            onClick={() => handlePrivacyChange(privacy.value as any)}
                            disabled={selectedSpace?.privacy === privacy.value}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                              selectedSpace?.privacy === privacy.value
                                ? 'bg-cyan-500/10 border border-cyan-500/20'
                                : 'hover:bg-white/5'
                            } disabled:cursor-default`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${privacy.color} flex items-center justify-center flex-shrink-0`}>
                              <FontAwesomeIcon icon={privacy.icon} className="text-white text-xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${selectedSpace?.privacy === privacy.value ? 'text-cyan-400' : 'text-white'}`}>
                                {privacy.label}
                              </p>
                              <p className="text-xs text-gray-500">{privacy.desc}</p>
                            </div>
                            {selectedSpace?.privacy === privacy.value && (
                              <FontAwesomeIcon icon={faCheck} className="text-cyan-400 text-xs" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-semibold px-2 text-gray-400 mb-2">Appearance</p>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faPalette} className="text-purple-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-white">Customize Theme</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faImage} className="text-blue-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-white">Change Cover</span>
                        </button>
                      </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-semibold px-2 text-gray-400 mb-2">Notifications</p>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faBell} className="text-orange-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-white">Notification Settings</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faVolumeMute} className="text-red-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-white">Mute Space</span>
                        </button>
                      </div>
                    </div>

                    {/* Security Section */}
                    <div className="p-2 border-b border-white/10">
                      <p className="text-xs font-semibold px-2 text-gray-400 mb-2">Security</p>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-green-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-white">Encryption Settings</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faKey} className="text-cyan-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-white">Access Keys</span>
                        </button>
                      </div>
                    </div>

                    {/* Advanced Section */}
                    <div className="p-2">
                      <p className="text-xs font-semibold px-2 text-gray-400 mb-2">Advanced</p>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5">
                          <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faCog} className="text-gray-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium text-white">Space Settings</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5 text-red-400">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <FontAwesomeIcon icon={faTrash} className="text-red-400 text-xs" />
                          </div>
                          <span className="text-sm font-medium">Delete Space</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Widget Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-900/50 backdrop-blur-sm">
                {['all', 'communication', 'productivity', 'content', 'collaboration'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      filterCategory === cat
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Search Widgets */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search widgets..."
                  value={widgetSearchQuery}
                  onChange={(e) => setWidgetSearchQuery(e.target.value)}
                  className="w-48 pl-9 pr-3 py-2 rounded-2xl bg-zinc-900/50 backdrop-blur-sm text-white placeholder-gray-500 text-xs outline-none focus:bg-zinc-900/70 transition-all"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-zinc-900/50 text-gray-400 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  viewMode === 'list'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-zinc-900/50 text-gray-400 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
              </button>
            </div>
          </div>

          {/* Widgets Display */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredWidgets.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon icon={widgetSearchQuery ? faSearch : faLayerGroup} className="text-4xl text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {widgetSearchQuery ? 'No widgets found' : 'No widgets yet'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {widgetSearchQuery ? 'Try a different search' : 'Add widgets to start collaborating'}
                  </p>
                  {!widgetSearchQuery && (
                    <button 
                      onClick={() => setShowWidgetLibrary(true)} 
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 text-white font-semibold shadow-lg shadow-cyan-500/25"
                    >
                      Browse Widgets
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredWidgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => navigate(`/spaces/${id}/${widget.id}`)}
                    className="group relative text-left p-5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${widget.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <FontAwesomeIcon icon={widget.icon} className="text-white text-xl" />
                    </div>

                    <h3 className="text-sm font-bold mb-1 text-white group-hover:text-cyan-300 transition-colors duration-300 line-clamp-1">
                      {widget.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {widget.description}
                    </p>

                    {widget.id === 'chat' && stats.messages > 0 && (
                      <div className="absolute top-3 right-3">
                        <div className="px-2 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg">
                          <span className="text-xs font-bold text-white">{stats.messages}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-500 capitalize">{widget.category}</span>
                      <FontAwesomeIcon 
                        icon={faChevronRight} 
                        className="text-xs text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" 
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWidgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => navigate(`/spaces/${id}/${widget.id}`)}
                    className="w-full group relative text-left p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/70 transition-all duration-300 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${widget.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 flex-shrink-0`}>
                      <FontAwesomeIcon icon={widget.icon} className="text-white text-lg" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold mb-1 text-white group-hover:text-cyan-300 transition-colors duration-300">
                        {widget.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {widget.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {widget.id === 'chat' && stats.messages > 0 && (
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg">
                          <span className="text-xs font-bold text-white">{stats.messages}</span>
                        </div>
                      )}
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
        </div>
      </div>

      <WidgetLibraryModal 
        isOpen={showWidgetLibrary} 
        onClose={() => setShowWidgetLibrary(false)} 
        activeWidgets={activeWidgets} 
        onToggleWidget={toggleWidget} 
        availableWidgets={AVAILABLE_WIDGETS} 
      />
      {showConvertModal && id && selectedSpace && (
        <ConvertSpaceModal 
          isOpen={showConvertModal} 
          onClose={() => setShowConvertModal(false)} 
          spaceId={id} 
          spaceName={selectedSpace.name} 
          currentPrivacy={selectedSpace.privacy} 
          targetPrivacy={targetPrivacy} 
          onSuccess={handleConvertSuccess} 
        />
      )}
      {showInviteModal && id && selectedSpace && (
        <InviteToSpaceModal 
          isOpen={showInviteModal} 
          onClose={() => setShowInviteModal(false)} 
          spaceId={id} 
          spaceName={selectedSpace.name} 
          spacePrivacy={selectedSpace.privacy} 
        />
      )}
    </div>
  );
}
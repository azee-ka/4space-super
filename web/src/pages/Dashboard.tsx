// web/src/pages/Dashboard.tsx
// Sophisticated Dashboard with rich visual hierarchy and premium design

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '../hooks/useSpaces';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRocket, faUsers, faMessage, faFile, faCheckCircle,
  faArrowTrendUp, faArrowTrendDown, faShield, faZap, faCode,
  faCalendar, faBell, faSearch,
  faPlus, faWandMagicSparkles, faBrain,
  faNetworkWired, faGaugeHigh,
  faCloud, faGear, faCompass,
  faLayerGroup, faClock, faCircle, faArrowRight,
  faLightbulb, faFire, faBolt,
  faEye, faBookmark,
  faCubes, faDatabase, faMicrochip, faWifi
} from '@fortawesome/free-solid-svg-icons';

interface ActivityItem {
  id: string;
  type: 'message' | 'file' | 'task' | 'space' | 'member';
  title: string;
  description: string;
  timestamp: string;
  spaceId?: string;
  spaceName?: string;
  user?: string;
  avatar?: string;
}


export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { data: spaces = [], isLoading } = useSpaces();

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [greeting, setGreeting] = useState('');

  const isDark = theme === 'dark';

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Generate mock recent activity - only run once on mount
  useEffect(() => {
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'message',
        title: 'New discussion started',
        description: 'Sarah shared the latest design mockups for review',
        timestamp: '2 min ago',
        spaceName: 'Design Team',
        user: 'Sarah Chen'
      },
      {
        id: '2',
        type: 'file',
        title: 'Document uploaded',
        description: 'Final_Report_Q4.pdf added to shared files',
        timestamp: '15 min ago',
        spaceName: 'Project Alpha',
        user: 'Mike Johnson'
      },
      {
        id: '3',
        type: 'task',
        title: 'Task completed',
        description: 'API integration milestone reached',
        timestamp: '1 hr ago',
        spaceName: 'Development',
        user: 'Alex Rivera'
      },
      {
        id: '4',
        type: 'member',
        title: 'Team expanded',
        description: 'Jordan joined the Marketing space',
        timestamp: '3 hrs ago',
        spaceName: 'Marketing',
        user: 'Jordan Lee'
      },
      {
        id: '5',
        type: 'space',
        title: 'New space created',
        description: 'Product Launch 2024 workspace is ready',
        timestamp: '5 hrs ago',
        spaceName: 'Product Launch',
        user: 'You'
      }
    ];
    setRecentActivity(activities);
  }, []);

  // Stats data
  const stats = {
    spaces: spaces.length || 0,
    messages: '2.4k',
    files: 156,
    tasks: { completed: 89, total: 112 },
    members: 24,
    activeNow: 8
  };

  // Get activity icon and color
  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'message':
        return { icon: faMessage, bg: 'from-blue-500 to-cyan-500', color: 'text-blue-400' };
      case 'file':
        return { icon: faFile, bg: 'from-emerald-500 to-teal-500', color: 'text-emerald-400' };
      case 'task':
        return { icon: faCheckCircle, bg: 'from-purple-500 to-pink-500', color: 'text-purple-400' };
      case 'member':
        return { icon: faUsers, bg: 'from-orange-500 to-amber-500', color: 'text-orange-400' };
      case 'space':
        return { icon: faRocket, bg: 'from-indigo-500 to-violet-500', color: 'text-indigo-400' };
      default:
        return { icon: faCircle, bg: 'from-gray-500 to-slate-500', color: 'text-gray-400' };
    }
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
          <p className="text-sm text-gray-400 font-medium">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1800px] mx-auto p-6 space-y-6">

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">All systems operational</span>
              </div>
              <h1 className="text-4xl font-bold text-white">
                {greeting}, <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.email?.split('@')[0]}</span>
              </h1>
              <p className="text-gray-400 text-lg">Here's what's happening across your workspace</p>
            </div>

            {/* Quick Stats Row */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'} border border-white/10 flex items-center gap-3`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-400">{stats.activeNow} online</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <button
                onClick={() => navigate('/spaces')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                New Space
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Active Spaces', value: stats.spaces, icon: faRocket, change: 12, color: 'cyan' },
              { label: 'Messages', value: stats.messages, icon: faMessage, change: 8, color: 'purple' },
              { label: 'Files Shared', value: stats.files, icon: faFile, change: 24, color: 'emerald' },
              { label: 'Tasks Done', value: `${stats.tasks.completed}/${stats.tasks.total}`, icon: faCheckCircle, change: 15, color: 'amber' },
              { label: 'Team Size', value: stats.members, icon: faUsers, change: 5, color: 'rose' },
              { label: 'AI Actions', value: 47, icon: faBrain, change: -3, color: 'indigo' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`group relative p-4 rounded-2xl ${isDark ? 'bg-white/[0.03]' : 'bg-white'} border border-white/[0.06] hover:border-${stat.color}-500/30 transition-all duration-300 hover:bg-white/[0.05]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <FontAwesomeIcon icon={stat.icon} className={`text-${stat.color}-400`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <FontAwesomeIcon icon={stat.change > 0 ? faArrowTrendUp : faArrowTrendDown} className="text-[10px]" />
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Grid - 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column - Activity Timeline */}
            <div className="lg:col-span-4 space-y-6">
              {/* Activity Feed */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] overflow-hidden`}>
                <div className="p-5 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <FontAwesomeIcon icon={faClock} className="text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">Activity Feed</h3>
                        <p className="text-xs text-gray-500">Recent updates</p>
                      </div>
                    </div>
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent" />

                    {/* Activity items */}
                    <div className="space-y-1">
                      {recentActivity.map((activity) => {
                        const style = getActivityStyle(activity.type);
                        return (
                          <div
                            key={activity.id}
                            className="relative pl-12 py-3 group cursor-pointer hover:bg-white/[0.02] rounded-xl transition-colors -ml-2 pr-2"
                          >
                            {/* Timeline dot */}
                            <div className={`absolute left-2 top-4 w-6 h-6 rounded-lg bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-lg`}>
                              <FontAwesomeIcon icon={style.icon} className="text-white text-[10px]" />
                            </div>

                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {activity.spaceName && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                      {activity.spaceName}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-500">{activity.timestamp}</span>
                                </div>
                              </div>
                              <FontAwesomeIcon
                                icon={faArrowRight}
                                className="text-xs text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all mt-1"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faZap} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Quick Actions</h3>
                    <p className="text-xs text-gray-500">Frequent tasks</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faPlus, label: 'Create New Space', desc: 'Start a new workspace', action: () => navigate('/spaces'), gradient: 'from-cyan-500 to-blue-600' },
                    { icon: faMessage, label: 'Open Messages', desc: 'Check conversations', action: () => navigate('/messages'), gradient: 'from-purple-500 to-pink-600' },
                    { icon: faSearch, label: 'Search Everything', desc: 'Find files & messages', action: () => {}, gradient: 'from-emerald-500 to-teal-600' },
                    { icon: faGear, label: 'Settings', desc: 'Manage preferences', action: () => navigate('/settings'), gradient: 'from-slate-500 to-gray-600' }
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
                      <FontAwesomeIcon icon={faArrowRight} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Column - Spaces & Insights */}
            <div className="lg:col-span-5 space-y-6">
              {/* Your Spaces */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] overflow-hidden`}>
                <div className="p-5 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">Your Spaces</h3>
                        <p className="text-xs text-gray-500">{spaces.length} active workspaces</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/spaces')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      View all <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {spaces.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faRocket} className="text-2xl text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-400 mb-4">No spaces yet. Create your first workspace to get started.</p>
                      <button
                        onClick={() => navigate('/spaces')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                      >
                        Create Space
                      </button>
                    </div>
                  ) : (
                    spaces.slice(0, 4).map((space: any, index: number) => {
                      const colors = ['from-cyan-500 to-blue-600', 'from-purple-500 to-pink-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600'];
                      return (
                        <div
                          key={space.id}
                          onClick={() => navigate(`/spaces/${space.id}`)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/10 transition-all cursor-pointer group"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {space.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{space.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                                {space.member_count || 1} members
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faMessage} className="text-[10px]" />
                                {Math.floor(Math.random() * 100) + 10} messages
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <FontAwesomeIcon icon={faArrowRight} className="text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] overflow-hidden`}>
                <div className="p-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faLightbulb} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">AI Insights</h3>
                      <p className="text-xs text-gray-500">Smart recommendations</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {[
                    {
                      icon: faFire,
                      title: 'Productivity Peak',
                      desc: 'Your team is 23% more productive this week. Most active between 10 AM - 2 PM.',
                      gradient: 'from-orange-500/10 to-red-500/10',
                      border: 'border-orange-500/20',
                      iconColor: 'text-orange-400'
                    },
                    {
                      icon: faNetworkWired,
                      title: 'Collaboration Trend',
                      desc: 'Cross-team communication increased. Design & Dev teams collaborating more.',
                      gradient: 'from-cyan-500/10 to-blue-500/10',
                      border: 'border-cyan-500/20',
                      iconColor: 'text-cyan-400'
                    },
                    {
                      icon: faBolt,
                      title: 'Quick Win',
                      desc: '3 tasks are close to completion. A quick review session could close them out.',
                      gradient: 'from-emerald-500/10 to-teal-500/10',
                      border: 'border-emerald-500/20',
                      iconColor: 'text-emerald-400'
                    }
                  ].map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl bg-gradient-to-r ${insight.gradient} border ${insight.border} hover:scale-[1.01] transition-transform cursor-pointer`}
                    >
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={insight.icon} className={`${insight.iconColor} mt-0.5`} />
                        <div>
                          <p className="text-sm font-semibold text-white">{insight.title}</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{insight.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - System & Schedule */}
            <div className="lg:col-span-3 space-y-6">
              {/* System Health */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faGaugeHigh} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">System Health</h3>
                    <p className="text-xs text-gray-500">All services running</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'API Response', value: '142ms', percent: 85, color: 'emerald' },
                    { label: 'Uptime', value: '99.9%', percent: 99, color: 'cyan' },
                    { label: 'Storage', value: '67%', percent: 67, color: 'amber' }
                  ].map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">{metric.label}</span>
                        <span className={`text-xs font-mono text-${metric.color}-400`}>{metric.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400 rounded-full transition-all duration-1000`}
                          style={{ width: `${metric.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: faDatabase, label: 'Database', status: 'Healthy' },
                      { icon: faMicrochip, label: 'AI Engine', status: 'Active' },
                      { icon: faShield, label: 'Security', status: 'Secure' },
                      { icon: faWifi, label: 'Network', status: 'Optimal' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                        <FontAwesomeIcon icon={item.icon} className="text-[10px] text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-500 truncate">{item.label}</p>
                          <p className="text-[10px] text-emerald-400 font-medium">{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendar} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Upcoming</h3>
                    <p className="text-xs text-gray-500">Today's schedule</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { time: '2:00 PM', title: 'Team Standup', type: 'meeting', color: 'blue' },
                    { time: '4:30 PM', title: 'Design Review', type: 'review', color: 'purple' },
                    { time: 'Tomorrow', title: 'Sprint Deadline', type: 'deadline', color: 'red' }
                  ].map((event, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-${event.color}-500/5 border border-${event.color}-500/10 hover:border-${event.color}-500/20 transition-colors cursor-pointer`}
                    >
                      <div className={`w-1 h-8 rounded-full bg-${event.color}-500`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                      <FontAwesomeIcon
                        icon={event.type === 'meeting' ? faUsers : event.type === 'review' ? faEye : faBell}
                        className={`text-${event.color}-400 text-sm`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className={`rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} border border-white/[0.06] p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCubes} className="text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Resources</h3>
                    <p className="text-xs text-gray-500">Quick access</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: faWandMagicSparkles, label: 'Templates', color: 'purple' },
                    { icon: faCloud, label: 'Backups', color: 'blue' },
                    { icon: faCode, label: 'API Docs', color: 'emerald' },
                    { icon: faBookmark, label: 'Saved', color: 'amber' }
                  ].map((item, index) => (
                    <button
                      key={index}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] hover:bg-${item.color}-500/10 border border-transparent hover:border-${item.color}-500/20 transition-all group`}
                    >
                      <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 group-hover:scale-110 transition-transform`} />
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

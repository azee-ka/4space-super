// web/src/pages/Dashboard.tsx
// Futuristic Dashboard with comprehensive overview and insights

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '../hooks/useSpaces';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRocket, faUsers, faMessage, faFile, faCheckCircle,
  faChartLine, faStar, faGlobe,
  faArrowTrendUp, faShield, faZap, faCode,
  faCalendar, faBell, faSearch,
  faPlus, faWandMagicSparkles, faBrain,
  faRobot, faSatellite, faNetworkWired, faGaugeHigh,
  faCloud, faTerminal, faGear
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';

interface ActivityItem {
  id: string;
  type: 'message' | 'file' | 'task' | 'space' | 'member';
  title: string;
  description: string;
  timestamp: string;
  spaceId?: string;
  spaceName?: string;
}

interface MetricCard {
  title: string;
  value: number | string;
  change: number;
  icon: any;
  color: string;
  gradient: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { data: spaces = [], isLoading } = useSpaces();

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  const isDark = theme === 'dark';

  // Generate metrics based on real data
  useEffect(() => {
    if (spaces.length > 0) {
      const newMetrics: MetricCard[] = [
        {
          title: 'Active Spaces',
          value: spaces.length,
          change: 12,
          icon: faRocket,
          color: 'text-cyan-400',
          gradient: 'from-cyan-500/20 to-blue-500/20'
        },
        {
          title: 'Total Messages',
          value: '2.4k',
          change: 8,
          icon: faMessage,
          color: 'text-purple-400',
          gradient: 'from-purple-500/20 to-pink-500/20'
        },
        {
          title: 'Files Shared',
          value: 156,
          change: 24,
          icon: faFile,
          color: 'text-emerald-400',
          gradient: 'from-emerald-500/20 to-teal-500/20'
        },
        {
          title: 'Tasks Completed',
          value: 89,
          change: 15,
          icon: faCheckCircle,
          color: 'text-yellow-400',
          gradient: 'from-yellow-500/20 to-orange-500/20'
        },
        {
          title: 'Team Members',
          value: 24,
          change: 5,
          icon: faUsers,
          color: 'text-rose-400',
          gradient: 'from-rose-500/20 to-red-500/20'
        },
        {
          title: 'AI Insights',
          value: '12',
          change: -3,
          icon: faBrain,
          color: 'text-indigo-400',
          gradient: 'from-indigo-500/20 to-violet-500/20'
        }
      ];
      setMetrics(newMetrics);
    }
  }, [spaces]);

  // Generate mock recent activity
  useEffect(() => {
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'message',
        title: 'New message in Design Team',
        description: 'Sarah shared the latest mockups',
        timestamp: '2 minutes ago',
        spaceId: spaces[0]?.id,
        spaceName: spaces[0]?.name
      },
      {
        id: '2',
        type: 'file',
        title: 'File uploaded to Project Alpha',
        description: 'Final_report.pdf (2.3 MB)',
        timestamp: '15 minutes ago',
        spaceId: spaces[1]?.id,
        spaceName: spaces[1]?.name
      },
      {
        id: '3',
        type: 'task',
        title: 'Task completed in Development',
        description: 'API integration finished',
        timestamp: '1 hour ago',
        spaceId: spaces[2]?.id,
        spaceName: spaces[2]?.name
      },
      {
        id: '4',
        type: 'member',
        title: 'New member joined',
        description: 'Alex joined the Marketing space',
        timestamp: '3 hours ago',
        spaceId: spaces[0]?.id,
        spaceName: spaces[0]?.name
      }
    ];
    setRecentActivity(activities);
  }, [spaces]);

  const quickActions = [
    { icon: faPlus, label: 'New Space', action: () => navigate('/spaces'), color: 'from-cyan-500 to-purple-600' },
    { icon: faMessage, label: 'Messages', action: () => navigate('/messages'), color: 'from-purple-500 to-pink-600' },
    { icon: faSearch, label: 'Search', action: () => {}, color: 'from-emerald-500 to-teal-600' },
    { icon: faCalendar, label: 'Schedule', action: () => {}, color: 'from-orange-500 to-red-600' },
    { icon: faBrain, label: 'AI Assistant', action: () => {}, color: 'from-indigo-500 to-violet-600' },
                  { icon: faGear, label: 'Settings', action: () => navigate('/settings'), color: 'from-slate-500 to-gray-600' }
  ];

  if (isLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}>
      <div className="flex-1 flex overflow-hidden">
        {/* Futuristic Left Sidebar - Compact */}
        <div className="w-64 flex-shrink-0 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* AI Status Card */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/30 via-purple-500/20 to-cyan-500/30 rounded-2xl blur-sm" />
            <div className="absolute inset-0 rounded-2xl border border-cyan-500/40" />
            <div className="absolute -inset-2 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />

            <div className={`relative p-4 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/80' : 'bg-white/80'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faRobot} className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-xs text-cyan-400 font-semibold">AI Status</p>
                  <p className="text-xs text-gray-400">Online & Learning</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Activity Level</span>
                  <span className="text-xs text-cyan-400 font-mono">87%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-600 h-1 rounded-full w-[87%] animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-purple-500/25 rounded-2xl blur-sm" />
            <div className="absolute inset-0 rounded-2xl border border-purple-500/30" />

            <div className={`relative p-4 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faZap} className="text-purple-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Quick Actions</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="group/action p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 mx-auto group-hover/action:scale-110 transition-transform`}>
                      <FontAwesomeIcon icon={action.icon} className="text-white text-sm" />
                    </div>
                    <p className="text-xs text-gray-400 group-hover/action:text-white transition-colors text-center">
                      {action.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-500/25 rounded-2xl blur-sm" />
            <div className="absolute inset-0 rounded-2xl border border-emerald-500/30" />

            <div className={`relative p-4 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faSatellite} className="text-emerald-400 text-sm" />
                <h3 className="text-sm font-bold text-white">System Status</h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'API Response', status: 'optimal', color: 'emerald' },
                  { label: 'Database', status: 'healthy', color: 'blue' },
                  { label: 'AI Models', status: 'active', color: 'purple' },
                  { label: 'Security', status: 'secure', color: 'green' }
                ].map((system, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{system.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${system.color}-500 animate-pulse`} />
                      <span className={`text-xs text-${system.color}-400 capitalize`}>{system.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Neural Dashboard
                </h1>
                <p className="text-gray-400">Welcome back, {user?.email?.split('@')[0]}. Here's your workspace intelligence.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="text-sm text-white font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <FontAwesomeIcon icon={faBrain} className="text-white text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <div key={index} className="relative group">
                  <div className={`absolute -inset-[1px] bg-gradient-to-r ${metric.gradient} rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className={`relative p-6 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/60' : 'bg-white/60'} border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center`}>
                        <FontAwesomeIcon icon={metric.icon} className={`${metric.color} text-lg`} />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        metric.change > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                        metric.change < 0 ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        <FontAwesomeIcon icon={metric.change > 0 ? faArrowTrendUp : faArrowTrendUp} className="text-xs" />
                        {Math.abs(metric.change)}%
                      </div>
                    </div>

                    <div>
                      <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                      <p className="text-sm text-gray-400">{metric.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Feed & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/25 via-cyan-500/20 to-blue-500/25 rounded-2xl blur-sm" />
                <div className={`relative p-6 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/60' : 'bg-white/60'} border border-white/10`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faMessage} className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                      <p className="text-sm text-gray-400">Latest updates across your spaces</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={
                            activity.type === 'message' ? faMessage :
                            activity.type === 'file' ? faFile :
                            activity.type === 'task' ? faCheckCircle :
                            faUsers
                          } className="text-white text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                          <p className="text-xs text-gray-400 mb-1">{activity.description}</p>
                          <div className="flex items-center gap-2">
                            {activity.spaceName && (
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                                {activity.spaceName}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{activity.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-purple-500/25 rounded-2xl blur-sm" />
                <div className={`relative p-6 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/60' : 'bg-white/60'} border border-white/10`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faBrain} className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Insights</h3>
                      <p className="text-sm text-gray-400">Intelligent recommendations</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <FontAwesomeIcon icon={faRocket} className="text-purple-400" />
                        <span className="text-sm font-semibold text-white">Productivity Boost</span>
                      </div>
                      <p className="text-sm text-gray-300">Your team completed 23% more tasks this week. Consider scheduling more focused work sessions.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <FontAwesomeIcon icon={faNetworkWired} className="text-cyan-400" />
                        <span className="text-sm font-semibold text-white">Collaboration Peak</span>
                      </div>
                      <p className="text-sm text-gray-300">Message activity is highest between 10 AM - 2 PM. Consider scheduling important meetings during this window.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <FontAwesomeIcon icon={faGaugeHigh} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-white">System Performance</span>
                      </div>
                      <p className="text-sm text-gray-300">All systems operating optimally. AI response time improved by 15% this month.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Analytics & Tools */}
        <div className="w-80 flex-shrink-0 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Performance Metrics */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-orange-500/25 via-red-500/20 to-orange-500/25 rounded-2xl blur-sm" />
            <div className="absolute inset-0 rounded-2xl border border-orange-500/30" />

            <div className={`relative p-5 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faChartLine} className="text-orange-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Performance</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Response Time</span>
                    <span className="text-xs text-orange-400 font-mono">142ms</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full w-[75%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Uptime</span>
                    <span className="text-xs text-emerald-400 font-mono">99.9%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full w-[99%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Storage Used</span>
                    <span className="text-xs text-blue-400 font-mono">67%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full w-[67%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-teal-500/25 via-cyan-500/20 to-teal-500/25 rounded-2xl blur-sm" />
            <div className="absolute inset-0 rounded-2xl border border-teal-500/30" />

            <div className={`relative p-5 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faTerminal} className="text-teal-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Quick Tools</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: faWandMagicSparkles, label: 'Templates', color: 'from-purple-500 to-pink-600' },
                  { icon: faCloud, label: 'Backup', color: 'from-blue-500 to-cyan-600' },
                  { icon: faShield, label: 'Security', color: 'from-green-500 to-emerald-600' },
                  { icon: faCode, label: 'API', color: 'from-orange-500 to-red-600' }
                ].map((tool, index) => (
                  <button
                    key={index}
                    className="group/tool p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 mx-auto group-hover/tool:scale-110 transition-transform`}>
                      <FontAwesomeIcon icon={tool.icon} className="text-white text-sm" />
                    </div>
                    <p className="text-xs text-gray-400 group-hover/tool:text-white transition-colors text-center">
                      {tool.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-indigo-500/25 rounded-2xl blur-sm" />
            <div className="absolute inset-0 rounded-2xl border border-indigo-500/30" />

            <div className={`relative p-5 rounded-2xl backdrop-blur-xl ${isDark ? 'bg-black/70' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faCalendar} className="text-indigo-400 text-sm" />
                <h3 className="text-sm font-bold text-white">Upcoming</h3>
              </div>

              <div className="space-y-3">
                {[
                  { time: '2:00 PM', title: 'Team Standup', type: 'meeting' },
                  { time: '4:30 PM', title: 'Client Review', type: 'review' },
                  { time: 'Tomorrow', title: 'Project Deadline', type: 'deadline' }
                ].map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      event.type === 'meeting' ? 'bg-blue-500/20 text-blue-400' :
                      event.type === 'review' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      <FontAwesomeIcon icon={
                        event.type === 'meeting' ? faUsers :
                        event.type === 'review' ? faChartLine :
                        faBell
                      } className="text-xs" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-gray-400">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
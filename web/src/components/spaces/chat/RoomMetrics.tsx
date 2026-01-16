// Enhanced Room Metrics - Real-time insights with comprehensive analytics
import { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFire, faClock, faBolt, faChartLine, faUsers, faBrain,
  faRocket, faHeart, faStar, faCalendar,
  faCrown, faZap, faUserFriends,
  faMessage, faPaperPlane, faExclamationTriangle, faArrowUp, faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, RoomMember, Room } from '@4space/shared/src/services/messages.service';

interface RoomMetricsProps {
  messageCount: number;
  memberCount: number;
  onlineCount: number;
  messages: Message[];
  roomMembers: RoomMember[];
  onlineUsers: Map<string, any>;
  selectedRoom?: Room;
}

interface MetricCard {
  icon: any;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

export function RoomMetrics({
  messageCount,
  memberCount,
  onlineCount,
  messages,
  roomMembers,
  selectedRoom
}: RoomMetricsProps) {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  // Calculate real metrics from data
  const metricsData = useMemo(() => {
    // Message statistics
    const totalMessages = messageCount;

    // Time-based message counts (based on loaded messages)
    const now = new Date();
    const messagesToday = messages.filter(msg => {
      const msgDate = new Date(msg.created_at);
      return msgDate.toDateString() === now.toDateString();
    }).length;

    const messagesThisWeek = messages.filter(msg => {
      const msgDate = new Date(msg.created_at);
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return msgDate >= weekAgo;
    }).length;

    const messagesThisHour = messages.filter(msg => {
      const msgDate = new Date(msg.created_at);
      const hourAgo = new Date(now);
      hourAgo.setHours(now.getHours() - 1);
      return msgDate >= hourAgo;
    }).length;

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.round(
      (totalMessages / Math.max(memberCount, 1)) * 5 +
      (onlineCount / Math.max(memberCount, 1)) * 30 +
      (messagesToday / Math.max(totalMessages, 1)) * 20 +
      (messagesThisWeek / Math.max(totalMessages, 1)) * 15
    ));

    // Response time calculation (average time between messages)
    const avgResponseTime = messages.length > 1 ? (() => {
      const intervals: number[] = [];
      for (let i = 1; i < messages.length; i++) {
        const time1 = new Date(messages[i-1].created_at).getTime();
        const time2 = new Date(messages[i].created_at).getTime();
        intervals.push(Math.abs(time2 - time1));
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      return Math.round(avgMs / 60000); // Convert to minutes
    })() : 0;

    // Activity level based on real data
    const activityRatio = onlineCount / Math.max(memberCount, 1);
    const activityLevel = activityRatio > 0.7 ? 'Very High' :
                         activityRatio > 0.4 ? 'High' :
                         activityRatio > 0.2 ? 'Medium' : 'Low';

    // Top contributors (users with most messages)
    const contributorStats = messages.reduce((acc, msg) => {
      acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topContributors = Object.entries(contributorStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([userId, count]) => ({ userId, count }));

    // Peak activity hours
    const hourlyActivity = messages.reduce((acc, msg) => {
      const hour = new Date(msg.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Message types distribution
    const messageTypes = messages.reduce((acc, msg) => {
      const type = msg.message_type || 'text';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Room health score
    const roomHealth = Math.min(100, Math.round(
      (engagementScore * 0.4) +
      (activityRatio * 100 * 0.3) +
      (messagesToday > 0 ? 30 : 0) +
      (roomMembers.length > 0 ? 20 : 0)
    ));

    return {
      totalMessages,
      messagesToday,
      messagesThisWeek,
      messagesThisHour,
      engagementScore,
      avgResponseTime,
      activityLevel,
      activityRatio,
      topContributors,
      peakHour: peakHour ? `${peakHour}:00` : 'N/A',
      messageTypes,
      roomHealth,
      roomAge: selectedRoom ? Math.floor((Date.now() - new Date(selectedRoom.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
    };
  }, [messages, messageCount, memberCount, onlineCount, selectedRoom]);

  // Get activity level styling
  const getActivityStyle = (level: string) => {
    switch (level) {
      case 'Very High': return { color: 'emerald', icon: faRocket };
      case 'High': return { color: 'green', icon: faFire };
      case 'Medium': return { color: 'yellow', icon: faBolt };
      default: return { color: 'gray', icon: faClock };
    }
  };

  // Get trend based on recent activity
  const getTrend = (current: number, previous: number) => {
    if (current > previous * 1.1) return 'up';
    if (current < previous * 0.9) return 'down';
    return 'neutral';
  };

  const activityStyle = getActivityStyle(metricsData.activityLevel);

  const metrics: MetricCard[] = [
    {
      icon: faChartLine,
      label: 'Room Health',
      value: metricsData.roomHealth,
      subtext: metricsData.roomHealth > 80 ? 'Excellent' : metricsData.roomHealth > 60 ? 'Good' : 'Needs Attention',
      color: metricsData.roomHealth > 80 ? 'emerald' : metricsData.roomHealth > 60 ? 'blue' : 'orange',
      trend: getTrend(metricsData.messagesToday, metricsData.messagesThisWeek / 7),
      highlight: metricsData.roomHealth > 90
    },
    {
      icon: activityStyle.icon,
      label: 'Activity Level',
      value: metricsData.activityLevel,
      subtext: `${onlineCount}/${memberCount} online (${Math.round(metricsData.activityRatio * 100)}%)`,
      color: activityStyle.color,
      trend: getTrend(onlineCount, memberCount / 2),
      highlight: metricsData.activityRatio > 0.5
    },
    {
      icon: faClock,
      label: 'Avg Response',
      value: `${metricsData.avgResponseTime}min`,
      subtext: metricsData.avgResponseTime < 5 ? 'Very Fast' : metricsData.avgResponseTime < 15 ? 'Good' : 'Slow',
      color: metricsData.avgResponseTime < 5 ? 'green' : metricsData.avgResponseTime < 15 ? 'blue' : 'red',
      trend: metricsData.avgResponseTime < 10 ? 'up' : 'down'
    },
    {
      icon: faFire,
      label: 'Peak Hour',
      value: metricsData.peakHour,
      subtext: 'Most active time',
      color: 'orange',
      trend: 'neutral'
    },
    {
      icon: faUsers,
      label: 'Top Contributor',
      value: metricsData.topContributors[0]?.count || 0,
      subtext: 'Messages this week',
      color: 'purple',
      trend: getTrend(metricsData.messagesThisWeek, metricsData.totalMessages / 7),
      highlight: metricsData.topContributors[0]?.count > 10
    },
    {
      icon: faCalendar,
      label: 'Room Age',
      value: `${metricsData.roomAge}d`,
      subtext: 'Days active',
      color: 'cyan',
      trend: 'neutral'
    },
  ];

  // Rotate through metrics every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetricIndex((prev) => (prev + 1) % metrics.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [metrics.length]);

  const currentMetric = metrics[currentMetricIndex];

  return (
    <div className="px-4 py-3 space-y-4 overflow-y-auto h-full">
      {/* Main Metric Card - Rotating */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMetricIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-br from-${currentMetric.color}-500/10 to-${currentMetric.color}-600/5 border border-${currentMetric.color}-500/20 rounded-xl p-4 backdrop-blur-sm ${
            currentMetric.highlight ? 'ring-2 ring-white/20' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${currentMetric.color}-500/20 flex items-center justify-center`}>
                <FontAwesomeIcon icon={currentMetric.icon} className={`text-${currentMetric.color}-400 text-lg`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">{currentMetric.label}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold text-${currentMetric.color}-400`}>
                    {currentMetric.value}
                    {typeof currentMetric.value === 'number' && currentMetric.value > 100 && '%'}
                  </p>
                  {currentMetric.trend && currentMetric.trend !== 'neutral' && (
                    <FontAwesomeIcon
                      icon={currentMetric.trend === 'up' ? faArrowUp : faArrowDown}
                      className={`text-sm ${currentMetric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">{currentMetric.subtext}</p>
        </motion.div>
      </AnimatePresence>

      {/* Metric Navigation Dots */}
      <div className="flex justify-center gap-2">
        {metrics.map((metric, index) => (
          <button
            key={index}
            onClick={() => setCurrentMetricIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentMetricIndex
                ? `bg-${metric.color}-500 scale-125`
                : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
          />
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex justify-center gap-2">
          {(['1h', '24h', '7d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTimeframe === timeframe
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-700/50'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-gray-600 text-center">Timeframes based on loaded messages</p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-lg p-3 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faMessage} className="text-cyan-400 text-xs" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium truncate">Messages</p>
              <p className="text-lg font-bold text-white leading-tight">{messageCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-[9px] text-gray-500">
            {selectedTimeframe === '1h' && `Last hr: ${metricsData.messagesThisHour} | Total: ${metricsData.totalMessages.toLocaleString()}`}
            {selectedTimeframe === '24h' && `Today: ${metricsData.messagesToday} | Total: ${metricsData.totalMessages.toLocaleString()}`}
            {selectedTimeframe === '7d' && `Week: ${metricsData.messagesThisWeek} | Total: ${metricsData.totalMessages.toLocaleString()}`}
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-lg p-3 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faUserFriends} className="text-purple-400 text-xs" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium truncate">Community</p>
              <p className="text-lg font-bold text-white leading-tight">{memberCount}</p>
            </div>
          </div>
          <div className="text-[9px] text-gray-500">
            {onlineCount} online | {Math.round((onlineCount / Math.max(memberCount, 1)) * 100)}% active
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-lg p-3 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faHeart} className="text-emerald-400 text-xs" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium truncate">Engagement</p>
              <p className="text-lg font-bold text-white leading-tight">{metricsData.engagementScore}%</p>
            </div>
          </div>
          <div className="text-[9px] text-emerald-400 truncate">
            {metricsData.engagementScore > 70 ? 'Highly engaged' :
             metricsData.engagementScore > 40 ? 'Moderately engaged' : 'Low engagement'}
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-lg p-3 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faZap} className="text-orange-400 text-xs" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium truncate">Response Time</p>
              <p className="text-lg font-bold text-white leading-tight">{metricsData.avgResponseTime}m</p>
            </div>
          </div>
          <div className="text-[9px] text-orange-400 truncate">
            {metricsData.avgResponseTime < 5 ? 'Very responsive' :
             metricsData.avgResponseTime < 15 ? 'Good response time' : 'Slow responses'}
          </div>
        </motion.div>
      </div>

      {/* Top Contributors */}
      {metricsData.topContributors.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faCrown} className="text-amber-400 text-sm" />
            </div>
            <h3 className="text-sm font-semibold text-white">Top Contributors</h3>
          </div>
          <div className="space-y-2">
            {metricsData.topContributors.slice(0, 3).map((contributor, index) => (
              <div key={contributor.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-500/20 text-gray-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {index === 0 ? '🏆' :
                     index === 1 ? '🥈' :
                     '🥉'}
                  </div>
                  <span className="text-sm text-gray-300">User {contributor.userId.slice(-4)}</span>
                </div>
                <span className="text-sm font-medium text-white">{contributor.count} msgs</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Message Types Breakdown */}
      {Object.keys(metricsData.messageTypes).length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faPaperPlane} className="text-indigo-400 text-sm" />
            </div>
            <h3 className="text-sm font-semibold text-white">Message Types</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(metricsData.messageTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 4)
              .map(([type, count]) => {
                const percentage = Math.round((count / messageCount) * 100);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      <span className="text-sm text-gray-300 capitalize">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} className="text-purple-400 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-2">AI Insights</p>
            <div className="space-y-2">
              {metricsData.roomHealth < 50 && (
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-xs mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">Room activity is low. Consider posting more frequently to increase engagement.</p>
                </div>
              )}
              {metricsData.avgResponseTime > 20 && (
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-yellow-400 text-xs mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">Response times are slow. Faster replies could improve engagement.</p>
                </div>
              )}
              {metricsData.activityRatio > 0.6 && (
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faRocket} className="text-green-400 text-xs mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">Room is highly active! Great momentum - keep it going.</p>
                </div>
              )}
              {metricsData.topContributors.length > 0 && (
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faStar} className="text-blue-400 text-xs mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {metricsData.topContributors[0].count > 20 ? 'Super active contributors!' : 'Good participation levels.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

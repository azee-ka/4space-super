// Room Metrics - Innovative real-time insights
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFire, faClock, faBolt, faChartLine, faComments, faSmile,
  faLightbulb, faArrowUp, faUsers, faBrain
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface RoomMetricsProps {
  roomId?: string;
  messageCount: number;
  memberCount: number;
  onlineCount: number;
}

interface MetricCard {
  icon: any;
  label: string;
  value: string;
  subtext: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function RoomMetrics({ roomId, messageCount, memberCount, onlineCount }: RoomMetricsProps) {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);

  // Calculate engagement score (0-100)
  const calculateEngagementScore = () => {
    if (!messageCount || !memberCount) return 0;
    const messagesPerMember = messageCount / memberCount;
    const onlineRatio = onlineCount / memberCount;
    const score = Math.min(100, Math.round((messagesPerMember * 10 + onlineRatio * 50)));
    return score;
  };

  // Get peak hours based on current time (mock for now)
  const getPeakHours = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 12) return '9 AM - 12 PM';
    if (hour >= 14 && hour < 17) return '2 PM - 5 PM';
    if (hour >= 19 && hour < 22) return '7 PM - 10 PM';
    return '9 AM - 12 PM';
  };

  // Calculate avg response time (mock)
  const getAvgResponseTime = () => {
    const minutes = Math.floor(Math.random() * 5) + 1;
    return `${minutes}min`;
  };

  // Get activity level
  const getActivityLevel = () => {
    const ratio = onlineCount / Math.max(memberCount, 1);
    if (ratio > 0.5) return { level: 'High', color: 'text-green-400', icon: faFire };
    if (ratio > 0.2) return { level: 'Medium', color: 'text-yellow-400', icon: faBolt };
    return { level: 'Low', color: 'text-gray-400', icon: faClock };
  };

  // Get collaboration index (mock)
  const getCollaborationIndex = () => {
    const score = Math.floor(Math.random() * 30) + 70;
    return `${score}%`;
  };

  // Get sentiment (mock)
  const getSentiment = () => {
    const sentiments = [
      { mood: 'Positive', emoji: '😊', color: 'text-green-400' },
      { mood: 'Focused', emoji: '🎯', color: 'text-blue-400' },
      { mood: 'Energetic', emoji: '⚡', color: 'text-yellow-400' },
      { mood: 'Productive', emoji: '💪', color: 'text-purple-400' },
    ];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  };

  const engagementScore = calculateEngagementScore();
  const activityLevel = getActivityLevel();
  const sentiment = getSentiment();

  const metrics: MetricCard[] = [
    {
      icon: faChartLine,
      label: 'Engagement Score',
      value: `${engagementScore}`,
      subtext: engagementScore > 70 ? 'Very Active' : engagementScore > 40 ? 'Active' : 'Quiet',
      color: 'purple',
      trend: 'up'
    },
    {
      icon: activityLevel.icon,
      label: 'Activity Level',
      value: activityLevel.level,
      subtext: `${onlineCount}/${memberCount} online`,
      color: activityLevel.color.replace('text-', '').replace('-400', ''),
      trend: 'neutral'
    },
    {
      icon: faClock,
      label: 'Avg Response',
      value: getAvgResponseTime(),
      subtext: 'Fast replies',
      color: 'cyan',
      trend: 'down'
    },
    {
      icon: faFire,
      label: 'Peak Hours',
      value: getPeakHours(),
      subtext: 'Most active time',
      color: 'orange',
      trend: 'neutral'
    },
    {
      icon: faUsers,
      label: 'Collaboration',
      value: getCollaborationIndex(),
      subtext: 'Team synergy',
      color: 'blue',
      trend: 'up'
    },
    {
      icon: faSmile,
      label: 'Room Mood',
      value: sentiment.emoji,
      subtext: sentiment.mood,
      color: sentiment.color.replace('text-', '').replace('-400', ''),
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
    <div className="px-4 py-3 space-y-3">
      {/* Main Metric Card - Rotating */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMetricIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-br from-${currentMetric.color}-500/10 to-${currentMetric.color}-600/5 border border-${currentMetric.color}-500/20 rounded-xl p-4 backdrop-blur-sm`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-${currentMetric.color}-500/20 flex items-center justify-center`}>
                <FontAwesomeIcon icon={currentMetric.icon} className={`text-${currentMetric.color}-400 text-sm`} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{currentMetric.label}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold text-${currentMetric.color}-400`}>
                    {currentMetric.value}
                  </p>
                  {currentMetric.trend && currentMetric.trend !== 'neutral' && (
                    <FontAwesomeIcon
                      icon={faArrowUp}
                      className={`text-xs ${currentMetric.trend === 'up' ? 'text-green-400' : 'text-red-400 rotate-180'}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">{currentMetric.subtext}</p>
        </motion.div>
      </AnimatePresence>

      {/* Metric Dots Indicator */}
      <div className="flex justify-center gap-1.5">
        {metrics.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentMetricIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentMetricIndex
                ? 'bg-purple-500 w-4'
                : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
          />
        ))}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FontAwesomeIcon icon={faComments} className="text-cyan-400 text-xs" />
            <span className="text-xs text-gray-400">Messages</span>
          </div>
          <p className="text-lg font-bold text-white">{messageCount}</p>
          <p className="text-[10px] text-gray-500">Total sent</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FontAwesomeIcon icon={faUsers} className="text-purple-400 text-xs" />
            <span className="text-xs text-gray-400">Members</span>
          </div>
          <p className="text-lg font-bold text-white">{memberCount}</p>
          <p className="text-[10px] text-gray-500">{onlineCount} online</p>
        </div>
      </div>

      {/* Trending Topics (Mock) */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <FontAwesomeIcon icon={faBrain} className="text-pink-400 text-xs" />
          <span className="text-xs font-medium text-white">Trending Topics</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Design', 'Features', 'Bug fixes'].map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-[10px] text-pink-400"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-3"
      >
        <div className="flex items-start gap-2">
          <FontAwesomeIcon icon={faLightbulb} className="text-yellow-400 text-sm mt-0.5" />
          <div>
            <p className="text-xs font-medium text-white mb-1">AI Insight</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Room activity peaks during afternoon hours. Consider scheduling important discussions around 2-5 PM for maximum engagement.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

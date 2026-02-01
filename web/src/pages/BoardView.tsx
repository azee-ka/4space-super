import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlus,
  faGripVertical,
  faCalendarDays,
  faComments,
  faPaperclip,
  faCheckCircle,
  faClock,
  faFlag,
  faBolt,
  faFire,
  faUsers,
  faListCheck,
  faArrowTrendUp,
  faEllipsisV,
  faSearch,
  faEye,
  faEdit,
  faTrash,
  faCircle,
  faSquareCheck,
  faSpinner,
  faCircleCheck,
  faBan,
  faArchive,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpace } from '../hooks/useSpaces';
import { useThemeStore } from '../store/themeStore';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

interface BoardTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignees: string[];
  dueDate?: string;
  comments: number;
  attachments: number;
  subtasks: { completed: number; total: number };
  labels: string[];
  progress: number;
  createdAt: Date;
}

interface Column {
  id: Status;
  title: string;
  color: string;
  icon: any;
}

const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'from-slate-500 to-gray-600', icon: faArchive },
  { id: 'todo', title: 'To Do', color: 'from-blue-500 to-indigo-600', icon: faCircle },
  { id: 'in_progress', title: 'In Progress', color: 'from-amber-500 to-orange-600', icon: faSpinner },
  { id: 'review', title: 'Review', color: 'from-purple-500 to-violet-600', icon: faEye },
  { id: 'done', title: 'Done', color: 'from-emerald-500 to-teal-600', icon: faCircleCheck },
];

const MOCK_TASKS: BoardTask[] = [
  {
    id: '1',
    title: 'Design System Overhaul',
    description: 'Redesign the entire component library with new brand colors',
    priority: 'urgent',
    status: 'in_progress',
    assignees: ['SC', 'AK'],
    dueDate: '2026-02-05',
    comments: 8,
    attachments: 3,
    subtasks: { completed: 4, total: 7 },
    labels: ['Design', 'Frontend'],
    progress: 60,
    createdAt: new Date('2026-01-20'),
  },
  {
    id: '2',
    title: 'API Rate Limiting',
    description: 'Implement Redis-based rate limiting for all endpoints',
    priority: 'high',
    status: 'todo',
    assignees: ['JL'],
    dueDate: '2026-02-08',
    comments: 3,
    attachments: 1,
    subtasks: { completed: 0, total: 5 },
    labels: ['Backend', 'Security'],
    progress: 0,
    createdAt: new Date('2026-01-25'),
  },
  {
    id: '3',
    title: 'Mobile Responsive Fix',
    description: 'Fix layout issues on iPad and tablet devices',
    priority: 'high',
    status: 'in_progress',
    assignees: ['CP'],
    dueDate: '2026-02-02',
    comments: 12,
    attachments: 5,
    subtasks: { completed: 3, total: 4 },
    labels: ['Frontend', 'Bug'],
    progress: 75,
    createdAt: new Date('2026-01-22'),
  },
  {
    id: '4',
    title: 'Database Optimization',
    description: 'Add indexes and optimize slow queries',
    priority: 'medium',
    status: 'review',
    assignees: ['RJ', 'MK'],
    dueDate: '2026-02-10',
    comments: 5,
    attachments: 2,
    subtasks: { completed: 6, total: 6 },
    labels: ['Backend', 'Performance'],
    progress: 100,
    createdAt: new Date('2026-01-18'),
  },
  {
    id: '5',
    title: 'User Onboarding Flow',
    description: 'Create interactive tutorial for new users',
    priority: 'medium',
    status: 'todo',
    assignees: ['SC'],
    dueDate: '2026-02-12',
    comments: 2,
    attachments: 0,
    subtasks: { completed: 1, total: 8 },
    labels: ['Design', 'UX'],
    progress: 12,
    createdAt: new Date('2026-01-26'),
  },
  {
    id: '6',
    title: 'CI/CD Pipeline Setup',
    description: 'Configure GitHub Actions for automated deployments',
    priority: 'high',
    status: 'done',
    assignees: ['TK'],
    comments: 4,
    attachments: 1,
    subtasks: { completed: 8, total: 8 },
    labels: ['DevOps'],
    progress: 100,
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '7',
    title: 'Analytics Dashboard',
    description: 'Build real-time analytics with charts and metrics',
    priority: 'medium',
    status: 'in_progress',
    assignees: ['AK', 'JL'],
    dueDate: '2026-02-15',
    comments: 6,
    attachments: 4,
    subtasks: { completed: 5, total: 10 },
    labels: ['Frontend', 'Analytics'],
    progress: 50,
    createdAt: new Date('2026-01-23'),
  },
  {
    id: '8',
    title: 'Documentation Update',
    description: 'Update API docs with new endpoints',
    priority: 'low',
    status: 'backlog',
    assignees: ['MK'],
    comments: 0,
    attachments: 0,
    subtasks: { completed: 0, total: 3 },
    labels: ['Docs'],
    progress: 0,
    createdAt: new Date('2026-01-28'),
  },
  {
    id: '9',
    title: 'Payment Integration',
    description: 'Integrate Stripe for subscription payments',
    priority: 'urgent',
    status: 'review',
    assignees: ['RJ', 'CP'],
    dueDate: '2026-02-03',
    comments: 15,
    attachments: 6,
    subtasks: { completed: 9, total: 9 },
    labels: ['Backend', 'Payment'],
    progress: 100,
    createdAt: new Date('2026-01-19'),
  },
  {
    id: '10',
    title: 'Email Notifications',
    description: 'Set up transactional email service',
    priority: 'low',
    status: 'todo',
    assignees: ['SC'],
    dueDate: '2026-02-20',
    comments: 1,
    attachments: 0,
    subtasks: { completed: 0, total: 4 },
    labels: ['Backend', 'Email'],
    progress: 0,
    createdAt: new Date('2026-01-27'),
  },
];

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'urgent': return 'from-red-500 to-rose-600';
    case 'high': return 'from-orange-500 to-amber-600';
    case 'medium': return 'from-blue-500 to-cyan-600';
    case 'low': return 'from-slate-500 to-gray-600';
    default: return 'from-gray-500 to-slate-600';
  }
};

const getPriorityIcon = (priority: Priority) => {
  switch (priority) {
    case 'urgent': return faFlag;
    case 'high': return faArrowTrendUp;
    case 'medium': return faBolt;
    case 'low': return faClock;
    default: return faFlag;
  }
};

export function BoardView() {
  const { id: spaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { data: space, isLoading: loadingSpace } = useSpace(spaceId);

  const [tasks] = useState<BoardTask[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const isDark = theme === 'dark';

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, selectedPriority]);

  const getTasksByStatus = (status: Status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'done').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
    const urgent = filteredTasks.filter(t => t.priority === 'urgent').length;
    return { total, completed, inProgress, urgent, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [filteredTasks]);

  if (loadingSpace) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <div className="text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Space not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${isDark ? 'bg-black' : 'bg-slate-50'} transition-colors duration-300 overflow-y-auto`}>
      {/* Ambient Background */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/5 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-purple-500/5 via-transparent to-transparent blur-3xl" />
        </div>
      )}

      <div className="relative z-10 max-w-[2000px] mx-auto px-6 py-6 space-y-6 pb-12 min-h-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/spaces/${spaceId}`)}
              className={`w-11 h-11 rounded-xl ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                  : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
              } flex items-center justify-center transition-all group`}
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className={`text-sm ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'} group-hover:-translate-x-0.5 transition-all`}
              />
            </motion.button>

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <FontAwesomeIcon icon={faListCheck} className="text-white text-xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Project Board
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {space.name} • Task management
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              New Task
            </motion.button>

            <button className={`w-11 h-11 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200'} flex items-center justify-center transition-all`}>
              <FontAwesomeIcon icon={faEllipsisV} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Tasks', value: stats.total, icon: faListCheck, color: 'indigo', subtext: 'Across all columns' },
            { label: 'In Progress', value: stats.inProgress, icon: faSpinner, color: 'amber', subtext: 'Active tasks' },
            { label: 'Completed', value: stats.completed, icon: faCheckCircle, color: 'emerald', subtext: `${stats.completionRate}% done` },
            { label: 'Urgent', value: stats.urgent, icon: faFire, color: 'red', subtext: 'High priority' },
            { label: 'Team Members', value: 8, icon: faUsers, color: 'purple', subtext: '5 active now' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative group p-5 rounded-2xl ${
                isDark
                  ? 'bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/10'
                  : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
              } transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <FontAwesomeIcon icon={stat.icon} className={`text-${stat.color}-400 text-lg`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{stat.value}</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-1`}>{stat.label}</p>
              <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>{stat.subtext}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className={`rounded-2xl ${
          isDark
            ? 'bg-white/[0.02] border border-white/[0.06]'
            : 'bg-white border border-gray-200 shadow-sm'
        } p-4`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${
                  isDark
                    ? 'bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-500 focus:border-indigo-500/30'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                } text-sm outline-none transition-all`}
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Priority:</span>
              <div className="flex items-center gap-2">
                {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedPriority === priority
                        ? isDark
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : isDark
                          ? 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.05] border border-white/[0.06]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('board')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'board'
                    ? isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900 shadow-sm'
                    : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900 shadow-sm'
                    : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Board View */}
        {viewMode === 'board' ? (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1400px] grid grid-cols-5 gap-4">
              {COLUMNS.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <div
                    key={column.id}
                    className={`rounded-2xl ${
                      isDark
                        ? 'bg-white/[0.02] border border-white/[0.06]'
                        : 'bg-white border border-gray-200 shadow-sm'
                    } p-4 min-h-[600px]`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${column.color} flex items-center justify-center shadow-lg`}>
                          <FontAwesomeIcon icon={column.icon} className="text-white text-sm" />
                        </div>
                        <div>
                          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {column.title}
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            {columnTasks.length} tasks
                          </p>
                        </div>
                      </div>
                      <button className={`w-8 h-8 rounded-lg ${
                        isDark
                          ? 'bg-white/[0.05] hover:bg-white/[0.1]'
                          : 'bg-gray-100 hover:bg-gray-200'
                      } flex items-center justify-center transition-all`}>
                        <FontAwesomeIcon icon={faPlus} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3">
                      <AnimatePresence>
                        {columnTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            onClick={() => setSelectedTask(task)}
                            className={`group p-4 rounded-xl ${
                              isDark
                                ? 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10'
                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                            } cursor-pointer transition-all`}
                          >
                            {/* Priority Badge */}
                            <div className="flex items-start justify-between mb-3">
                              <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${getPriorityColor(task.priority)} flex items-center gap-1.5 shadow-sm`}>
                                <FontAwesomeIcon icon={getPriorityIcon(task.priority)} className="text-white text-[10px]" />
                                <span className="text-[10px] font-bold text-white uppercase">{task.priority}</span>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <FontAwesomeIcon icon={faGripVertical} className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                              </button>
                            </div>

                            {/* Task Title */}
                            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 line-clamp-2`}>
                              {task.title}
                            </h4>

                            {/* Progress Bar */}
                            {task.progress > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Progress</span>
                                  <span className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{task.progress}%</span>
                                </div>
                                <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-200'} overflow-hidden`}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${task.progress}%` }}
                                    className={`h-full rounded-full bg-gradient-to-r ${column.color}`}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Labels */}
                            {task.labels.length > 0 && (
                              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                                {task.labels.slice(0, 2).map((label, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                      isDark
                                        ? 'bg-indigo-500/10 text-indigo-400'
                                        : 'bg-indigo-100 text-indigo-700'
                                    }`}
                                  >
                                    {label}
                                  </span>
                                ))}
                                {task.labels.length > 2 && (
                                  <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    +{task.labels.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                              <div className="flex items-center gap-3">
                                {/* Subtasks */}
                                {task.subtasks.total > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faSquareCheck} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                      {task.subtasks.completed}/{task.subtasks.total}
                                    </span>
                                  </div>
                                )}

                                {/* Comments */}
                                {task.comments > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faComments} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{task.comments}</span>
                                  </div>
                                )}

                                {/* Attachments */}
                                {task.attachments > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faPaperclip} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{task.attachments}</span>
                                  </div>
                                )}
                              </div>

                              {/* Assignees */}
                              <div className="flex items-center -space-x-2">
                                {task.assignees.map((assignee, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${column.color} flex items-center justify-center text-[9px] font-bold text-white border-2 ${
                                      isDark ? 'border-gray-900' : 'border-white'
                                    } shadow-sm`}
                                  >
                                    {assignee}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Due Date */}
                            {task.dueDate && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                                <FontAwesomeIcon icon={faCalendarDays} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className={`rounded-2xl ${
            isDark
              ? 'bg-white/[0.02] border border-white/[0.06]'
              : 'bg-white border border-gray-200 shadow-sm'
          } overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'} border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Task</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Priority</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Assignees</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Progress</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Due Date</th>
                    <th className={`px-6 py-4 text-right text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredTasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                      className="cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{task.title}</p>
                          <div className="flex items-center gap-2">
                            {task.labels.slice(0, 2).map((label, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                  isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${COLUMNS.find(c => c.id === task.status)?.color} shadow-sm`}>
                          <FontAwesomeIcon icon={COLUMNS.find(c => c.id === task.status)?.icon || faCircle} className="text-white text-xs" />
                          <span className="text-xs font-semibold text-white">{COLUMNS.find(c => c.id === task.status)?.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${getPriorityColor(task.priority)} shadow-sm`}>
                          <FontAwesomeIcon icon={getPriorityIcon(task.priority)} className="text-white text-[10px]" />
                          <span className="text-[10px] font-bold text-white uppercase">{task.priority}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center -space-x-2">
                          {task.assignees.map((assignee, idx) => (
                            <div
                              key={idx}
                              className={`w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white border-2 ${
                                isDark ? 'border-gray-900' : 'border-white'
                              } shadow-sm`}
                            >
                              {assignee}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-200'} overflow-hidden max-w-[120px]`}>
                            <div
                              className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'} min-w-[40px]`}>
                            {task.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {task.dueDate ? (
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarDays} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <span className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className={`w-8 h-8 rounded-lg ${
                            isDark ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-gray-100 hover:bg-gray-200'
                          } flex items-center justify-center transition-all`}>
                            <FontAwesomeIcon icon={faEdit} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button className={`w-8 h-8 rounded-lg ${
                            isDark ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-100 hover:bg-red-200'
                          } flex items-center justify-center transition-all`}>
                            <FontAwesomeIcon icon={faTrash} className="text-xs text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTask(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-2xl ${
                isDark
                  ? 'bg-gray-900 border border-white/10'
                  : 'bg-white border border-gray-200'
              } p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${getPriorityColor(selectedTask.priority)} shadow-sm mb-3`}>
                    <FontAwesomeIcon icon={getPriorityIcon(selectedTask.priority)} className="text-white text-xs" />
                    <span className="text-xs font-bold text-white uppercase">{selectedTask.priority}</span>
                  </div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{selectedTask.title}</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedTask.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className={`w-10 h-10 rounded-xl ${
                    isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                  } flex items-center justify-center transition-all`}
                >
                  <FontAwesomeIcon icon={faBan} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Status</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${COLUMNS.find(c => c.id === selectedTask.status)?.color}`}>
                    <FontAwesomeIcon icon={COLUMNS.find(c => c.id === selectedTask.status)?.icon || faCircle} className="text-white text-sm" />
                    <span className="text-sm font-semibold text-white">{COLUMNS.find(c => c.id === selectedTask.status)?.title}</span>
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Progress</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 h-3 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-200'} overflow-hidden`}>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600`}
                        style={{ width: `${selectedTask.progress}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedTask.progress}%</span>
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Assignees</p>
                  <div className="flex items-center gap-2">
                    {selectedTask.assignees.map((assignee, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                      >
                        {assignee}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Due Date</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No due date'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-3`}>Labels</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.labels.map((label, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faSquareCheck} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Subtasks</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTask.subtasks.completed}/{selectedTask.subtasks.total}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faComments} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Comments</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTask.comments}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faPaperclip} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Attachments</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTask.attachments}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

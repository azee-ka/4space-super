import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faArrowLeft,
  faCheckCircle,
  faCircle,
  faClock,
  faFire,
  faUsers,
  faListCheck,
  faTh,
  faThList,
  faCalendarDay,
  faUser,
  faComment,
  faTimes,
  faEdit,
  faTrash,
  faCircleNotch,
  faCircleCheck,
  faCircleExclamation,
  faCirclePause,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useSpace } from '../hooks/useSpaces';

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
type Status = 'todo' | 'in_progress' | 'review' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  status: Status;
  comments: number;
  labels: string[];
  dueDate?: string;
  progress?: number;
  subtasks?: number;
  completedSubtasks?: number;
}

const TASKS: Task[] = [
  { id: '1', title: 'Design new landing page', description: 'Create mockups for homepage redesign with modern aesthetics', priority: 'High', assignee: 'John Doe', status: 'todo', comments: 3, dueDate: 'Jan 30, 2026', labels: ['Design', 'UI'], progress: 0, subtasks: 5, completedSubtasks: 0 },
  { id: '2', title: 'Update API documentation', description: 'Add comprehensive examples for all endpoints', priority: 'Medium', assignee: 'Sarah Miller', status: 'todo', comments: 1, labels: ['Docs', 'Backend'], progress: 0, subtasks: 3, completedSubtasks: 0 },
  { id: '3', title: 'Fix navigation bug', description: 'Navigation breaks on mobile devices in certain scenarios', priority: 'Urgent', assignee: 'Tom Kelly', status: 'todo', comments: 5, dueDate: 'Jan 28, 2026', labels: ['Bug', 'Mobile'], progress: 0, subtasks: 2, completedSubtasks: 0 },
  { id: '4', title: 'Implement dark mode', description: 'Add theme switcher to settings panel with persistence', priority: 'Medium', assignee: 'Alex Lee', status: 'in_progress', comments: 2, labels: ['Feature', 'UI'], progress: 60, subtasks: 4, completedSubtasks: 2 },
  { id: '5', title: 'Optimize images', description: 'Reduce bundle size by compressing assets', priority: 'Low', assignee: 'Rachel Johnson', status: 'in_progress', comments: 0, labels: ['Performance'], progress: 40, subtasks: 6, completedSubtasks: 2 },
  { id: '6', title: 'Add global search', description: 'Implement workspace-wide search functionality', priority: 'High', assignee: 'Mike Kim', status: 'in_progress', comments: 7, dueDate: 'Feb 2, 2026', labels: ['Feature'], progress: 75, subtasks: 8, completedSubtasks: 6 },
  { id: '7', title: 'User authentication', description: 'OAuth integration complete with multiple providers', priority: 'Urgent', assignee: 'John Doe', status: 'review', comments: 4, labels: ['Backend', 'Security'], progress: 100, subtasks: 5, completedSubtasks: 5 },
  { id: '8', title: 'Performance audit', description: 'Lighthouse score improvements and optimization', priority: 'Medium', assignee: 'Sarah Miller', status: 'review', comments: 2, labels: ['Performance'], progress: 100, subtasks: 3, completedSubtasks: 3 },
  { id: '9', title: 'Setup CI/CD pipeline', description: 'Automated deployments configured with GitHub Actions', priority: 'High', assignee: 'Tom Kelly', status: 'done', comments: 1, labels: ['DevOps'], progress: 100, subtasks: 4, completedSubtasks: 4 },
  { id: '10', title: 'Database migration', description: 'Successfully migrated to PostgreSQL', priority: 'High', assignee: 'Rachel Johnson', status: 'done', comments: 3, labels: ['Backend'], progress: 100, subtasks: 6, completedSubtasks: 6 },
  { id: '11', title: 'Email notifications', description: 'Implement notification system for task updates', priority: 'Medium', assignee: 'Mike Kim', status: 'done', comments: 0, labels: ['Feature'], progress: 100, subtasks: 3, completedSubtasks: 3 },
];

const PRIORITY_META: Record<Priority, { gradient: string; icon: any }> = {
  'Urgent': { gradient: 'from-rose-500 via-red-500 to-pink-500', icon: faFire },
  'High': { gradient: 'from-orange-500 via-amber-500 to-yellow-500', icon: faCircleExclamation },
  'Medium': { gradient: 'from-blue-500 via-cyan-500 to-teal-500', icon: faCircle },
  'Low': { gradient: 'from-slate-500 via-gray-500 to-zinc-500', icon: faCircle },
};

const STATUS_META: Record<Status, { label: string; gradient: string; color: string; icon: any }> = {
  'todo': { label: 'To Do', gradient: 'from-slate-400 to-gray-500', color: 'text-slate-400', icon: faCircleNotch },
  'in_progress': { label: 'In Progress', gradient: 'from-emerald-400 to-teal-500', color: 'text-emerald-400', icon: faCirclePause },
  'review': { label: 'Review', gradient: 'from-violet-400 to-purple-500', color: 'text-violet-400', icon: faClock },
  'done': { label: 'Done', gradient: 'from-cyan-400 to-blue-500', color: 'text-cyan-400', icon: faCircleCheck },
};

export function TasksView() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { data: space } = useSpace(spaceId || '');

  const isDark = theme === 'dark';

  const [viewMode, setViewMode] = useState<'board' | 'list' | 'compact'>('board');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('view');

  const filteredTasks = useMemo(() => {
    return TASKS.filter((task) => {
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesSearch =
        task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        task.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchValue.toLowerCase()) ||
        task.labels.some(label => label.toLowerCase().includes(searchValue.toLowerCase()));
      return matchesPriority && matchesStatus && matchesSearch;
    });
  }, [filterPriority, filterStatus, searchValue]);

  const stats = useMemo(() => ({
    total: filteredTasks.length,
    todo: filteredTasks.filter(t => t.status === 'todo').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    review: filteredTasks.filter(t => t.status === 'review').length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    urgent: filteredTasks.filter(t => t.priority === 'Urgent').length,
    high: filteredTasks.filter(t => t.priority === 'High').length,
  }), [filteredTasks]);

  const recentActivity = useMemo(() => {
    return [...TASKS]
      .sort((a, b) => (b.comments || 0) - (a.comments || 0))
      .slice(0, 5);
  }, []);

  const upcomingDeadlines = useMemo(() => {
    return TASKS
      .filter(t => t.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 4);
  }, []);

  const popularLabels = useMemo(() => {
    const labelCount: Record<string, number> = {};
    TASKS.forEach(task => {
      task.labels.forEach(label => {
        labelCount[label] = (labelCount[label] || 0) + 1;
      });
    });
    return Object.entries(labelCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }));
  }, []);

  const getTasksByStatus = (status: Status) => filteredTasks.filter(t => t.status === status);

  const openTaskModal = (task: Task | null, mode: 'create' | 'view' | 'edit') => {
    setSelectedTask(task);
    setModalMode(mode);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setTimeout(() => {
      setSelectedTask(null);
      setModalMode('view');
    }, 200);
  };

  return (
    <div className={`h-full ${isDark ? 'bg-transparent' : 'bg-white'} overflow-hidden flex`}>

      {/* Left Sidebar */}
      <div className={`w-64 flex-shrink-0 ${isDark ? 'border-white/[0.06] backdrop-blur-xl' : 'border-gray-200 bg-gray-50/50'} border-r relative z-10 overflow-y-auto`}>
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/spaces/${spaceId}`)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isDark
                  ? 'bg-white/[0.03] hover:bg-white/[0.06] text-gray-300'
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
              }`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              Back
            </button>
            <div>
              <h2 className={`text-lg font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent`}>
                Tasks
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                {space?.name || 'Workspace'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-gradient-to-br from-emerald-500/[0.15] to-teal-500/[0.1]' : 'bg-gradient-to-br from-emerald-50 to-teal-50'} shadow-lg ${isDark ? 'shadow-emerald-500/[0.2]' : 'shadow-emerald-200/50'}`}>
                <div className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Active</div>
                <div className={`text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent`}>
                  {stats.inProgress}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Review</div>
                <div className={`text-xl font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{stats.review}</div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Done</div>
                <div className={`text-xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.done}</div>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Filter by Status
            </p>
            <div className="space-y-1">
              {(['all', 'todo', 'in_progress', 'review', 'done'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status === 'all' ? 'all' : status)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    filterStatus === status
                      ? isDark
                        ? 'bg-emerald-500/[0.15] text-emerald-300'
                        : 'bg-emerald-50 text-emerald-700'
                      : isDark
                        ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-400 hover:bg-white/[0.04]'
                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {status !== 'all' && (
                      <FontAwesomeIcon icon={STATUS_META[status].icon} className="text-xs" />
                    )}
                    {status === 'all' ? 'All' : STATUS_META[status].label}
                  </span>
                  <span className={`text-[10px] ${filterStatus === status ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-gray-600' : 'text-gray-500')}`}>
                    {status === 'all' ? stats.total : stats[status === 'in_progress' ? 'inProgress' : status]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Filter by Priority
            </p>
            <div className="space-y-1">
              {(['all', 'Urgent', 'High', 'Medium', 'Low'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFilterPriority(priority === 'all' ? 'all' : priority)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    filterPriority === priority
                      ? isDark
                        ? 'bg-emerald-500/[0.15] text-emerald-300'
                        : 'bg-emerald-50 text-emerald-700'
                      : isDark
                        ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-400 hover:bg-white/[0.04]'
                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {priority !== 'all' && (
                    <FontAwesomeIcon
                      icon={PRIORITY_META[priority].icon}
                      className={`text-xs bg-gradient-to-r ${PRIORITY_META[priority].gradient} bg-clip-text text-transparent`}
                    />
                  )}
                  <span className="flex-1 text-left">{priority}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Toolbar */}
        <div className={`flex-shrink-0 p-4 ${isDark ? 'border-white/[0.06]' : 'border-gray-200'} border-b`}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <FontAwesomeIcon
                icon={faSearch}
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm ${
                  isDark
                    ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white placeholder-gray-600 focus:bg-white/[0.04] focus:ring-2 focus:ring-emerald-500/30'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 shadow-sm'
                } transition-all outline-none`}
              />
            </div>

            {/* View Mode Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'board'
                    ? isDark
                      ? 'bg-gradient-to-r from-emerald-500/[0.2] to-teal-500/[0.2] text-emerald-300 shadow-lg shadow-emerald-500/[0.2]'
                      : 'bg-white text-emerald-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faTh} className="mr-1.5" />
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? isDark
                      ? 'bg-gradient-to-r from-emerald-500/[0.2] to-teal-500/[0.2] text-emerald-300 shadow-lg shadow-emerald-500/[0.2]'
                      : 'bg-white text-emerald-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faListCheck} className="mr-1.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'compact'
                    ? isDark
                      ? 'bg-gradient-to-r from-emerald-500/[0.2] to-teal-500/[0.2] text-emerald-300 shadow-lg shadow-emerald-500/[0.2]'
                      : 'bg-white text-emerald-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faThList} className="mr-1.5" />
                Compact
              </button>
            </div>

            {/* New Task Button */}
            <button
              onClick={() => openTaskModal(null, 'create')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-500/[0.2] to-teal-500/[0.2] text-emerald-300 shadow-emerald-500/[0.2] hover:from-emerald-500/[0.3] hover:to-teal-500/[0.3]'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/50'
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              New Task
            </button>
          </div>

          {/* Results Count */}
          <div className={`mt-2 text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            Showing {filteredTasks.length} of {TASKS.length} tasks
          </div>
        </div>

        {/* Tasks Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['todo', 'in_progress', 'review', 'done'] as Status[]).map((status) => {
                const statusTasks = getTasksByStatus(status);
                return (
                  <div key={status} className="space-y-3">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-50 shadow-sm'}`}>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={STATUS_META[status].icon} className={`text-xs ${STATUS_META[status].color}`} />
                        <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {STATUS_META[status].label}
                        </span>
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                        {statusTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {statusTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => openTaskModal(task, 'view')}
                          className={`w-full p-3 rounded-lg text-left transition-all shadow-lg ${
                            isDark
                              ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-emerald-500/[0.2] shadow-black/20 hover:shadow-emerald-500/10'
                              : 'bg-white hover:bg-gray-50 shadow-gray-200/50 hover:shadow-emerald-200/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                              {task.title}
                            </h3>
                            <FontAwesomeIcon
                              icon={PRIORITY_META[task.priority].icon}
                              className={`text-xs bg-gradient-to-r ${PRIORITY_META[task.priority].gradient} bg-clip-text text-transparent flex-shrink-0 mt-0.5`}
                            />
                          </div>

                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} line-clamp-2 mb-3`}>
                            {task.description}
                          </p>

                          {/* Progress Bar */}
                          {task.progress !== undefined && task.progress > 0 && (
                            <div className="mb-3">
                              <div className={`h-1 rounded-full ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-200'} overflow-hidden`}>
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <div className={`flex items-center justify-between mt-1 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                                <span>{task.progress}% complete</span>
                                {task.subtasks && (
                                  <span>{task.completedSubtasks}/{task.subtasks} subtasks</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between gap-2 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${PRIORITY_META[task.priority].gradient} flex items-center justify-center text-[8px] font-semibold text-white`}>
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>
                                {task.assignee.split(' ')[0]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.comments > 0 && (
                                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                                  <FontAwesomeIcon icon={faComment} />
                                  {task.comments}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className={`${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                  {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => openTaskModal(task, 'view')}
                  className={`w-full p-4 rounded-lg text-left transition-all shadow-lg ${
                    isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-emerald-500/[0.2] shadow-black/20 hover:shadow-emerald-500/10'
                      : 'bg-white hover:bg-gray-50 shadow-gray-200/50 hover:shadow-emerald-200/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${PRIORITY_META[task.priority].gradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                      {task.assignee.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded text-[10px] font-medium ${STATUS_META[task.status].color} ${
                            isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-100'
                          }`}>
                            {STATUS_META[task.status].label}
                          </span>
                          <FontAwesomeIcon
                            icon={PRIORITY_META[task.priority].icon}
                            className={`text-xs bg-gradient-to-r ${PRIORITY_META[task.priority].gradient} bg-clip-text text-transparent`}
                          />
                        </div>
                      </div>

                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                        {task.description}
                      </p>

                      {/* Progress */}
                      {task.progress !== undefined && task.progress > 0 && (
                        <div className="mb-2">
                          <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-200'} overflow-hidden`}>
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                          <FontAwesomeIcon icon={faUser} />
                          {task.assignee}
                        </span>
                        {task.comments > 0 && (
                          <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faComment} />
                            {task.comments}
                          </span>
                        )}
                        {task.subtasks && (
                          <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faListCheck} />
                            {task.completedSubtasks}/{task.subtasks}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            <FontAwesomeIcon icon={faCalendarDay} />
                            {task.dueDate}
                          </span>
                        )}
                        <div className="flex items-center gap-1 flex-wrap ml-auto">
                          {task.labels.map((label, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                                isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-1">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => openTaskModal(task, 'view')}
                  className={`w-full p-2.5 rounded-lg text-left transition-all shadow ${
                    isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-emerald-500/[0.2] shadow-black/20 hover:shadow-emerald-500/10'
                      : 'bg-white hover:bg-gray-50 shadow-gray-200/50 hover:shadow-emerald-200/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${STATUS_META[task.status].gradient}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                          {task.title}
                        </h3>
                        {task.progress !== undefined && task.progress > 0 && (
                          <span className={`text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0`}>
                            {task.progress}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>
                          {task.assignee.split(' ')[0]}
                        </span>
                        <span className={STATUS_META[task.status].color}>
                          {STATUS_META[task.status].label}
                        </span>
                        {task.dueDate && (
                          <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <FontAwesomeIcon
                      icon={PRIORITY_META[task.priority].icon}
                      className={`text-xs bg-gradient-to-r ${PRIORITY_META[task.priority].gradient} bg-clip-text text-transparent flex-shrink-0`}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`w-64 flex-shrink-0 ${isDark ? 'border-white/[0.06] backdrop-blur-xl' : 'border-gray-200 bg-gray-50/50'} border-l relative z-10 overflow-y-auto`}>
        <div className="p-4 space-y-6">
          {/* Upcoming Deadlines */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Upcoming Deadlines
            </p>
            <div className="space-y-1.5">
              {upcomingDeadlines.map((task) => (
                <button
                  key={task.id}
                  onClick={() => openTaskModal(task, 'view')}
                  className={`w-full p-2 rounded-lg text-left transition-all shadow ${
                    isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-emerald-500/[0.2] shadow-black/20'
                      : 'bg-white hover:bg-gray-50 shadow-gray-200/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FontAwesomeIcon
                      icon={faCalendarDay}
                      className={`text-[10px] ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
                    />
                    <span className={`text-[10px] font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      {task.dueDate}
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                    {task.title}
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'} mt-0.5`}>
                    {task.assignee.split(' ')[0]} · {STATUS_META[task.status].label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Recent Activity
            </p>
            <div className="space-y-1.5">
              {recentActivity.map((task) => (
                <button
                  key={task.id}
                  onClick={() => openTaskModal(task, 'view')}
                  className={`w-full p-2 rounded-lg text-left transition-all shadow ${
                    isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-emerald-500/[0.2] shadow-black/20'
                      : 'bg-white hover:bg-gray-50 shadow-gray-200/50'
                  }`}
                >
                  <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-1 mb-1`}>
                    {task.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                      {task.assignee.split(' ')[0]}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <FontAwesomeIcon icon={faComment} />
                      {task.comments}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Labels */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Popular Labels
            </p>
            <div className="flex flex-wrap gap-1.5">
              {popularLabels.map(({ label, count }) => (
                <button
                  key={label}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all shadow ${
                    isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-400 hover:bg-emerald-500/[0.1] hover:text-emerald-300 shadow-black/20'
                      : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 shadow-gray-200/50'
                  }`}
                >
                  {label} <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>({count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-black/50'} backdrop-blur-sm`}
            onClick={closeTaskModal}
          />

          {/* Modal */}
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            isDark
              ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] shadow-black/50'
              : 'bg-white shadow-gray-300'
          }`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {modalMode === 'create' ? (
                    <input
                      type="text"
                      placeholder="Task title..."
                      className={`w-full text-xl font-bold bg-transparent outline-none ${
                        isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  ) : (
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTask?.title}
                    </h2>
                  )}
                </div>
                <button
                  onClick={closeTaskModal}
                  className={`p-2 rounded-lg transition-all ${
                    isDark
                      ? 'hover:bg-white/[0.05] text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {modalMode === 'create' ? (
                  <>
                    <div>
                      <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                        Description
                      </label>
                      <textarea
                        placeholder="Add a description..."
                        rows={4}
                        className={`w-full p-3 rounded-lg text-sm ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white placeholder-gray-600'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                        } outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Priority
                        </label>
                        <select className={`w-full p-2 rounded-lg text-sm ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white'
                            : 'bg-gray-50 text-gray-900 border border-gray-200'
                        } outline-none`}>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Status
                        </label>
                        <select className={`w-full p-2 rounded-lg text-sm ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white'
                            : 'bg-gray-50 text-gray-900 border border-gray-200'
                        } outline-none`}>
                          <option>To Do</option>
                          <option>In Progress</option>
                          <option>Review</option>
                          <option>Done</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                        Assignee
                      </label>
                      <input
                        type="text"
                        placeholder="Enter assignee name..."
                        className={`w-full p-2 rounded-lg text-sm ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white placeholder-gray-600'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                        } outline-none`}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={closeTaskModal}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-300 hover:bg-zinc-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg ${
                          isDark
                            ? 'bg-gradient-to-r from-emerald-500/[0.2] to-teal-500/[0.2] text-emerald-300 shadow-emerald-500/[0.2] hover:from-emerald-500/[0.3] hover:to-teal-500/[0.3]'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/50'
                        }`}
                      >
                        Create Task
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                        Description
                      </label>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedTask?.description}
                      </p>
                    </div>

                    {selectedTask?.progress !== undefined && selectedTask.progress > 0 && (
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Progress
                        </label>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-200'} overflow-hidden mb-2`}>
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                            style={{ width: `${selectedTask.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                            {selectedTask.progress}% complete
                          </span>
                          {selectedTask.subtasks && (
                            <span className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                              {selectedTask.completedSubtasks}/{selectedTask.subtasks} subtasks
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Priority
                        </label>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={PRIORITY_META[selectedTask?.priority || 'Low'].icon}
                            className={`text-sm bg-gradient-to-r ${PRIORITY_META[selectedTask?.priority || 'Low'].gradient} bg-clip-text text-transparent`}
                          />
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTask?.priority}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Status
                        </label>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={STATUS_META[selectedTask?.status || 'todo'].icon}
                            className={`text-sm ${STATUS_META[selectedTask?.status || 'todo'].color}`}
                          />
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {STATUS_META[selectedTask?.status || 'todo'].label}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Assignee
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedTask?.assignee}
                        </span>
                      </div>

                      {selectedTask?.dueDate && (
                        <div>
                          <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                            Due Date
                          </label>
                          <span className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            {selectedTask.dueDate}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedTask?.labels && selectedTask.labels.length > 0 && (
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Labels
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTask.labels.map((label, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}">
                      <button
                        onClick={() => setModalMode('edit')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-300 hover:bg-zinc-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                      </button>
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          isDark
                            ? 'bg-red-500/[0.2] text-red-300 hover:bg-red-500/[0.3]'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

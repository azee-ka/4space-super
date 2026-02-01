import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
  faCalendarDays,
  faList,
  faArrowLeft,
  faClock,
  faLocationDot,
  faUsers,
  faTimes,
  faEdit,
  faTrash,
  faBriefcase,
  faHourglassHalf,
  faBell,
  faHeart,
  faUserGroup,
  faTh,
  faThList,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';
import { useSpace } from '../hooks/useSpace';

type EventCategory = 'meeting' | 'deadline' | 'reminder' | 'personal' | 'team';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location?: string;
  category: EventCategory;
  attendees: string[];
  reminder: boolean;
  color: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_META: Record<EventCategory, { label: string; gradient: string; icon: any }> = {
  meeting: { label: 'Meeting', gradient: 'from-blue-500 via-cyan-500 to-teal-500', icon: faBriefcase },
  deadline: { label: 'Deadline', gradient: 'from-rose-500 via-red-500 to-pink-500', icon: faHourglassHalf },
  reminder: { label: 'Reminder', gradient: 'from-amber-500 via-yellow-500 to-orange-500', icon: faBell },
  personal: { label: 'Personal', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', icon: faHeart },
  team: { label: 'Team', gradient: 'from-emerald-500 via-green-500 to-teal-500', icon: faUserGroup },
};

const EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily sync with the product and engineering pods.',
    date: '2026-01-27',
    time: '09:00 AM',
    duration: '30 min',
    location: 'Virtual HQ',
    category: 'meeting',
    attendees: ['Sarah', 'Mike', 'Alex'],
    reminder: true,
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Project Deadline',
    description: 'Submit Q1 launch assets.',
    date: '2026-01-28',
    time: '05:00 PM',
    duration: 'All day',
    category: 'deadline',
    attendees: [],
    reminder: true,
    color: '#ef4444',
  },
  {
    id: '3',
    title: 'Design Review',
    description: 'Stakeholder feedback on UI/UX.',
    date: '2026-01-29',
    time: '02:00 PM',
    duration: '1 hour',
    location: 'Studio B',
    category: 'meeting',
    attendees: ['Emma', 'David', 'Lisa'],
    reminder: true,
    color: '#3b82f6',
  },
  {
    id: '4',
    title: 'Client Presentation',
    description: 'Walkthrough of the new integration.',
    date: '2026-01-30',
    time: '11:00 AM',
    duration: '45 min',
    location: 'Client HQ',
    category: 'meeting',
    attendees: ['John', 'Sarah'],
    reminder: true,
    color: '#3b82f6',
  },
  {
    id: '5',
    title: 'Gym Session',
    description: 'Recharge and reset.',
    date: '2026-01-27',
    time: '06:00 PM',
    duration: '1 hour',
    location: 'City Gym',
    category: 'personal',
    attendees: [],
    reminder: true,
    color: '#8b5cf6',
  },
  {
    id: '6',
    title: 'Code Review',
    description: 'Review PRs before merge.',
    date: '2026-01-28',
    time: '03:00 PM',
    duration: '1 hour',
    category: 'team',
    attendees: ['Mike', 'Alex', 'Sarah'],
    reminder: false,
    color: '#10b981',
  },
  {
    id: '7',
    title: 'Sprint Planning',
    description: 'Plan next 10-day sprint.',
    date: '2026-02-03',
    time: '10:00 AM',
    duration: '2 hours',
    location: 'Townhall',
    category: 'team',
    attendees: ['Sarah', 'Mike', 'Alex', 'Emma'],
    reminder: true,
    color: '#10b981',
  },
  {
    id: '8',
    title: 'Doctor Appointment',
    description: 'Annual checkup.',
    date: '2026-02-05',
    time: '02:30 PM',
    duration: '30 min',
    location: 'Medical Center',
    category: 'personal',
    attendees: [],
    reminder: true,
    color: '#8b5cf6',
  },
];

const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

export function CalendarView() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const { space } = useSpace(spaceId || '');

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'compact'>('calendar');
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('view');

  const filteredEvents = useMemo(() => {
    const base = EVENTS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return base.filter((event) => (filterCategory === 'all' ? true : event.category === filterCategory));
  }, [filterCategory]);

  const stats = useMemo(() => {
    const monthCount = filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    }).length;
    const upcoming = filteredEvents.filter((event) => new Date(event.date) >= today).length;
    const next7 = filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= weekAhead;
    }).length;
    const withReminders = filteredEvents.filter(e => e.reminder).length;
    return { monthCount, upcoming, next7, withReminders };
  }, [filteredEvents, currentMonth, currentYear, today]);

  const nextHighlights = useMemo(() => {
    return [...filteredEvents]
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [filteredEvents, today]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const startPadding = getFirstDayOfMonth(currentMonth, currentYear);
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPadding; i += 1) cells.push(null);
    for (let i = 1; i <= daysInMonth; i += 1) cells.push(i);
    return cells;
  }, [currentMonth, currentYear]);

  const getEventsForDay = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter((event) => event.date === dateKey);
  };

  const goPrevious = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const goNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const openEventModal = (event: CalendarEvent | null, mode: 'create' | 'view' | 'edit') => {
    setSelectedEvent(event);
    setModalMode(mode);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setTimeout(() => {
      setSelectedEvent(null);
      setModalMode('view');
    }, 200);
  };

  return (
    <div className={`h-full ${isDark ? 'bg-black' : 'bg-white'} overflow-hidden flex`}>
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 right-1/4 w-[800px] h-[800px] ${isDark ? 'bg-orange-500/[0.03]' : 'bg-orange-500/[0.08]'} rounded-full blur-[120px]`} />
        <div className={`absolute bottom-0 left-1/3 w-[600px] h-[600px] ${isDark ? 'bg-amber-500/[0.02]' : 'bg-amber-500/[0.06]'} rounded-full blur-[100px]`} />
      </div>

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
              <h2 className={`text-lg font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent`}>
                Calendar
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
              <div className={`p-2 rounded-lg ${isDark ? 'bg-zinc-900/50' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>This Month</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.monthCount}</div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-gradient-to-br from-orange-500/[0.15] to-amber-500/[0.1]' : 'bg-gradient-to-br from-orange-50 to-amber-50'} shadow-lg ${isDark ? 'shadow-orange-500/[0.2]' : 'shadow-orange-200/50'}`}>
                <div className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>Next 7 Days</div>
                <div className={`text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent`}>
                  {stats.next7}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-zinc-900/50' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Upcoming</div>
                <div className={`text-xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.upcoming}</div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-zinc-900/50' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Reminders</div>
                <div className={`text-xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.withReminders}</div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Filter by Category
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setFilterCategory('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === 'all'
                    ? isDark
                      ? 'bg-orange-500/[0.15] text-orange-300'
                      : 'bg-orange-50 text-orange-700'
                    : isDark
                      ? 'bg-zinc-900/30 text-gray-400 hover:bg-zinc-900/50'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <span>All</span>
                <span className={`text-[10px] ${filterCategory === 'all' ? (isDark ? 'text-orange-400' : 'text-orange-600') : (isDark ? 'text-gray-600' : 'text-gray-500')}`}>
                  {filteredEvents.length}
                </span>
              </button>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key as EventCategory)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === key
                      ? isDark
                        ? 'bg-orange-500/[0.15] text-orange-300'
                        : 'bg-orange-50 text-orange-700'
                      : isDark
                        ? 'bg-zinc-900/30 text-gray-400 hover:bg-zinc-900/50'
                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={meta.icon}
                    className={`text-xs bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}
                  />
                  <span className="flex-1 text-left">{meta.label}</span>
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
            {/* Month Navigation */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-zinc-900/50' : 'bg-gray-100'}`}>
              <button
                onClick={goPrevious}
                className={`p-1 rounded hover:bg-white/[0.05] transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>
              <span className={`text-sm font-semibold min-w-[140px] text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <button
                onClick={goNext}
                className={`p-1 rounded hover:bg-white/[0.05] transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-zinc-900/50' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'calendar'
                    ? isDark
                      ? 'bg-gradient-to-r from-orange-500/[0.2] to-amber-500/[0.2] text-orange-300 shadow-lg shadow-orange-500/[0.2]'
                      : 'bg-white text-orange-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faTh} className="mr-1.5" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? isDark
                      ? 'bg-gradient-to-r from-orange-500/[0.2] to-amber-500/[0.2] text-orange-300 shadow-lg shadow-orange-500/[0.2]'
                      : 'bg-white text-orange-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faList} className="mr-1.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'compact'
                    ? isDark
                      ? 'bg-gradient-to-r from-orange-500/[0.2] to-amber-500/[0.2] text-orange-300 shadow-lg shadow-orange-500/[0.2]'
                      : 'bg-white text-orange-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faThList} className="mr-1.5" />
                Compact
              </button>
            </div>

            {/* New Event Button */}
            <button
              onClick={() => openEventModal(null, 'create')}
              className={`ml-auto px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-orange-500/[0.2] to-amber-500/[0.2] text-orange-300 shadow-orange-500/[0.2] hover:from-orange-500/[0.3] hover:to-amber-500/[0.3]'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-500/50'
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              New Event
            </button>
          </div>

          {/* Results Count */}
          <div className={`mt-2 text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            Showing {filteredEvents.length} events
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'calendar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-[10px] uppercase tracking-wider font-semibold">
                {DAYS.map((day) => (
                  <div key={day} className={`text-center py-2 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday =
                    day !== null &&
                    day === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear();
                  return (
                    <div
                      key={`${day}-${index}`}
                      className={`min-h-[100px] rounded-lg p-2 transition-all shadow ${
                        isToday
                          ? isDark
                            ? 'bg-gradient-to-br from-orange-500/[0.15] to-amber-500/[0.1] shadow-orange-500/[0.2]'
                            : 'bg-gradient-to-br from-orange-50 to-amber-50 shadow-orange-200/50'
                          : isDark
                            ? 'bg-zinc-900/80 shadow-black/20'
                            : 'bg-white shadow-gray-200/50'
                      } flex flex-col justify-between`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isToday ? (isDark ? 'text-orange-300' : 'text-orange-600') : (isDark ? 'text-white' : 'text-gray-900')}`}>
                          {day ?? ''}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            onClick={() => openEventModal(event, 'view')}
                            className={`w-full rounded text-left px-1.5 py-1 text-[9px] transition-all shadow ${
                              isDark
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300 shadow-black/20'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-gray-200/50'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon
                                icon={CATEGORY_META[event.category].icon}
                                className={`text-[8px] bg-gradient-to-r ${CATEGORY_META[event.category].gradient} bg-clip-text text-transparent flex-shrink-0`}
                              />
                              <span className="truncate">{event.title}</span>
                            </div>
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className={`text-[8px] ${isDark ? 'text-gray-600' : 'text-gray-500'} text-center`}>
                            +{dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-2">
              {filteredEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => openEventModal(event, 'view')}
                  className={`w-full p-4 rounded-lg text-left transition-all shadow-lg ${
                    isDark
                      ? 'bg-zinc-900/80 hover:bg-zinc-800/80 shadow-black/20 hover:shadow-orange-500/10'
                      : 'bg-white hover:bg-gray-50 shadow-gray-200/50 hover:shadow-orange-200/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${CATEGORY_META[event.category].gradient} flex items-center justify-center flex-shrink-0`}>
                      <FontAwesomeIcon icon={CATEGORY_META[event.category].icon} className="text-white text-sm" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {event.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                          isDark ? 'bg-zinc-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {CATEGORY_META[event.category].label}
                        </span>
                      </div>

                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                        {event.description}
                      </p>

                      <div className="flex items-center gap-4 text-[10px]">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                          <FontAwesomeIcon icon={faCalendarDays} />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                          <FontAwesomeIcon icon={faClock} />
                          {event.time}
                        </span>
                        {event.location && (
                          <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            {event.location}
                          </span>
                        )}
                        {event.attendees.length > 0 && (
                          <span className={`flex items-center gap-1 ml-auto ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faUsers} />
                            {event.attendees.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-1">
              {filteredEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => openEventModal(event, 'view')}
                  className={`w-full p-2.5 rounded-lg text-left transition-all shadow ${
                    isDark
                      ? 'bg-zinc-900/80 hover:bg-zinc-800/80 shadow-black/20 hover:shadow-orange-500/10'
                      : 'bg-white hover:bg-gray-50 shadow-gray-200/50 hover:shadow-orange-200/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${CATEGORY_META[event.category].gradient}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                          {event.title}
                        </h3>
                        <span className={`text-[10px] ${isDark ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0`}>
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className={`bg-gradient-to-r ${CATEGORY_META[event.category].gradient} bg-clip-text text-transparent`}>
                          {CATEGORY_META[event.category].label}
                        </span>
                      </div>
                    </div>

                    <FontAwesomeIcon
                      icon={CATEGORY_META[event.category].icon}
                      className={`text-xs bg-gradient-to-r ${CATEGORY_META[event.category].gradient} bg-clip-text text-transparent flex-shrink-0`}
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
          {/* Next Highlights */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Upcoming Events
            </p>
            <div className="space-y-1.5">
              {nextHighlights.map((event) => (
                <button
                  key={event.id}
                  onClick={() => openEventModal(event, 'view')}
                  className={`w-full p-2 rounded-lg text-left transition-all shadow ${
                    isDark
                      ? 'bg-zinc-900/80 hover:bg-zinc-800/80 shadow-black/20'
                      : 'bg-white hover:bg-gray-50 shadow-gray-200/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FontAwesomeIcon
                      icon={CATEGORY_META[event.category].icon}
                      className={`text-[10px] bg-gradient-to-r ${CATEGORY_META[event.category].gradient} bg-clip-text text-transparent`}
                    />
                    <span className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-1 mb-0.5`}>
                    {event.title}
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                    {event.time} · {event.duration}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-black/50'} backdrop-blur-sm`}
            onClick={closeEventModal}
          />

          {/* Modal */}
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            isDark
              ? 'bg-zinc-900 shadow-black/50'
              : 'bg-white shadow-gray-300'
          }`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {modalMode === 'create' ? (
                    <input
                      type="text"
                      placeholder="Event title..."
                      className={`w-full text-xl font-bold bg-transparent outline-none ${
                        isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  ) : (
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEvent?.title}
                    </h2>
                  )}
                </div>
                <button
                  onClick={closeEventModal}
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
                        rows={3}
                        className={`w-full p-3 rounded-lg text-sm ${
                          isDark
                            ? 'bg-zinc-800 text-white placeholder-gray-600'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                        } outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Date
                        </label>
                        <input
                          type="date"
                          className={`w-full p-2 rounded-lg text-sm ${
                            isDark
                              ? 'bg-zinc-800 text-white'
                              : 'bg-gray-50 text-gray-900 border border-gray-200'
                          } outline-none`}
                        />
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Time
                        </label>
                        <input
                          type="time"
                          className={`w-full p-2 rounded-lg text-sm ${
                            isDark
                              ? 'bg-zinc-800 text-white'
                              : 'bg-gray-50 text-gray-900 border border-gray-200'
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Category
                        </label>
                        <select className={`w-full p-2 rounded-lg text-sm ${
                          isDark
                            ? 'bg-zinc-800 text-white'
                            : 'bg-gray-50 text-gray-900 border border-gray-200'
                        } outline-none`}>
                          <option>Meeting</option>
                          <option>Deadline</option>
                          <option>Reminder</option>
                          <option>Personal</option>
                          <option>Team</option>
                        </select>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Duration
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 1 hour"
                          className={`w-full p-2 rounded-lg text-sm ${
                            isDark
                              ? 'bg-zinc-800 text-white placeholder-gray-600'
                              : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter location..."
                        className={`w-full p-2 rounded-lg text-sm ${
                          isDark
                            ? 'bg-zinc-800 text-white placeholder-gray-600'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                        } outline-none`}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={closeEventModal}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          isDark
                            ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg ${
                          isDark
                            ? 'bg-gradient-to-r from-orange-500/[0.2] to-amber-500/[0.2] text-orange-300 shadow-orange-500/[0.2] hover:from-orange-500/[0.3] hover:to-amber-500/[0.3]'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-500/50'
                        }`}
                      >
                        Create Event
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
                        {selectedEvent?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Date & Time
                        </label>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendarDays} className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedEvent && new Date(selectedEvent.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <FontAwesomeIcon icon={faClock} className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedEvent?.time}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Category
                        </label>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={CATEGORY_META[selectedEvent?.category || 'meeting'].icon}
                            className={`text-sm bg-gradient-to-r ${CATEGORY_META[selectedEvent?.category || 'meeting'].gradient} bg-clip-text text-transparent`}
                          />
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {CATEGORY_META[selectedEvent?.category || 'meeting'].label}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Duration
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedEvent?.duration}
                        </span>
                      </div>

                      {selectedEvent?.location && (
                        <div>
                          <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                            Location
                          </label>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faLocationDot} className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {selectedEvent.location}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedEvent?.attendees && selectedEvent.attendees.length > 0 && (
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Attendees
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.attendees.map((attendee, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isDark ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {attendee}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                      <button
                        onClick={() => setModalMode('edit')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          isDark
                            ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../../../src/store/themeStore';
import { getAccentColorHex } from '../../../../../src/utils/themeUtils';
import { theme } from '../../../../../src/styles/theme';

type EventCategory = 'meeting' | 'deadline' | 'reminder' | 'personal' | 'team';

interface Event {
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORIES = [
  { id: 'meeting', name: 'Meeting', color: '#3b82f6', icon: 'people' },
  { id: 'deadline', name: 'Deadline', color: '#ef4444', icon: 'flag' },
  { id: 'reminder', name: 'Reminder', color: '#f59e0b', icon: 'notifications' },
  { id: 'personal', name: 'Personal', color: '#8b5cf6', icon: 'person' },
  { id: 'team', name: 'Team', color: '#10b981', icon: 'people-circle' },
];

export default function CalendarWorkspace() {
  const router = useRouter();
  const { id: spaceId } = useLocalSearchParams();
  const { accentHex } = useThemeStore();
  const accentColorHex = getAccentColorHex(accentHex);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily sync with development team',
      date: '2026-01-27',
      time: '09:00 AM',
      duration: '30 min',
      location: 'Video Call',
      category: 'meeting',
      attendees: ['Sarah', 'Mike', 'Alex'],
      reminder: true,
      color: '#3b82f6',
    },
    {
      id: '2',
      title: 'Project Deadline',
      description: 'Submit final deliverables for Q1 project',
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
      description: 'Review new UI/UX designs with stakeholders',
      date: '2026-01-29',
      time: '02:00 PM',
      duration: '1 hour',
      location: 'Conference Room B',
      category: 'meeting',
      attendees: ['Emma', 'David', 'Lisa'],
      reminder: true,
      color: '#3b82f6',
    },
    {
      id: '4',
      title: 'Client Presentation',
      description: 'Present project progress to client',
      date: '2026-01-30',
      time: '11:00 AM',
      duration: '45 min',
      location: 'Client Office',
      category: 'meeting',
      attendees: ['John', 'Sarah'],
      reminder: true,
      color: '#3b82f6',
    },
    {
      id: '5',
      title: 'Gym Session',
      description: 'Weekly workout routine',
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
      description: 'Review pull requests from team members',
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
      description: 'Plan tasks for the next sprint',
      date: '2026-02-03',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Video Call',
      category: 'team',
      attendees: ['Sarah', 'Mike', 'Alex', 'Emma'],
      reminder: true,
      color: '#10b981',
    },
    {
      id: '8',
      title: 'Doctor Appointment',
      description: 'Annual checkup',
      date: '2026-02-05',
      time: '02:30 PM',
      duration: '30 min',
      location: 'Medical Center',
      category: 'personal',
      attendees: [],
      reminder: true,
      color: '#8b5cf6',
    },
    {
      id: '9',
      title: 'Pay Bills',
      description: 'Monthly utility bills payment reminder',
      date: '2026-02-01',
      time: '09:00 AM',
      duration: '15 min',
      category: 'reminder',
      attendees: [],
      reminder: true,
      color: '#f59e0b',
    },
    {
      id: '10',
      title: 'Product Launch',
      description: 'Official product release to market',
      date: '2026-02-15',
      time: '09:00 AM',
      duration: 'All day',
      category: 'deadline',
      attendees: ['All Team'],
      reminder: true,
      color: '#ef4444',
    },
  ]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getFilteredEvents = () => {
    if (filterCategory === 'all') return events;
    return events.filter(event => event.category === filterCategory);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events.filter(event => new Date(event.date) >= today).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const stats = {
    thisWeek: events.filter(e => {
      const eventDate = new Date(e.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= weekFromNow;
    }).length,
    thisMonth: events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    }).length,
    upcoming: getUpcomingEvents().length,
  };

  const calendarDays = generateCalendarDays();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 160,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 0,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    addButton: {
      padding: 8,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 0,
      marginBottom: 4,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      paddingVertical: 6,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSubtle,
      letterSpacing: 0.2,
    },
    viewToggle: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 6,
      gap: 8,
      backgroundColor: theme.colors.background,
    },
    viewButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.colors.panel,
      alignItems: 'center',
      borderWidth: 0,
    },
    viewButtonActive: {
      backgroundColor: accentColorHex + '20',
    },
    viewButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSubtle,
    },
    viewButtonTextActive: {
      color: accentColorHex,
    },
    calendarContainer: {
      backgroundColor: theme.colors.background,
      borderBottomWidth: 0,
    },
      monthNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    navButton: {
      padding: 8,
    },
    monthTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    daysHeader: {
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    dayHeaderCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    dayHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSubtle,
    },
    calendarGrid: {
      paddingHorizontal: 12,
      paddingBottom: 16,
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      padding: 4,
    },
      dayCellButton: {
        flex: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      },
    dayCellSelected: {
      backgroundColor: accentColorHex + '20',
      borderWidth: 2,
      borderColor: accentColorHex,
    },
    dayCellToday: {
      borderWidth: 1,
      borderColor: accentColorHex,
    },
    dayNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    eventDots: {
      flexDirection: 'row',
      gap: 2,
      marginTop: 2,
    },
    eventDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: 'transparent',
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    filterButtonActive: {
      backgroundColor: accentColorHex + '20',
    },
    filterButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSubtle,
    },
    filterButtonTextActive: {
      color: accentColorHex,
    },
    eventsContainer: {
      padding: 20,
      gap: 12,
    },
    eventCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 16,
      borderLeftWidth: 4,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    eventHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    eventHeaderLeft: {
      flex: 1,
      gap: 4,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    eventDescription: {
      fontSize: 13,
      color: theme.colors.textSubtle,
      lineHeight: 18,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '600',
    },
    eventDetails: {
      gap: 8,
    },
    eventDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    eventDetailText: {
      fontSize: 13,
      color: theme.colors.textSubtle,
      flex: 1,
    },
    attendeesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    attendeeBadge: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 0,
    },
    attendeeText: {
      fontSize: 11,
      color: theme.colors.text,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    modalClose: {
      padding: 4,
    },
    modalBody: {
      padding: 20,
      gap: 20,
    },
    modalSection: {
      gap: 12,
    },
    modalSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    modalInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalInfoText: {
      fontSize: 15,
      color: theme.colors.text,
      flex: 1,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    deleteButton: {
      backgroundColor: '#ef444415',
      borderColor: '#ef4444',
    },
    editButton: {
      backgroundColor: accentColorHex + '15',
      borderColor: accentColorHex,
    },
    actionButtonText: {
      fontSize: 15,
      fontWeight: '700',
    },
    deleteButtonText: {
      color: '#ef4444',
    },
    editButtonText: {
      color: accentColorHex,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    emptyStateText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSubtle,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.colors.textSubtle,
      opacity: 0.7,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={accentColorHex} />
        </TouchableOpacity>
      </View>

    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.upcoming}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, view === 'calendar' && styles.viewButtonActive]}
          onPress={() => setView('calendar')}
        >
          <Text style={[styles.viewButtonText, view === 'calendar' && styles.viewButtonTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, view === 'list' && styles.viewButtonActive]}
          onPress={() => setView('list')}
        >
          <Text style={[styles.viewButtonText, view === 'list' && styles.viewButtonTextActive]}>
            List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar View */}
      {view === 'calendar' && (
        <>
          <View style={styles.calendarContainer}>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Days Header */}
            <View style={styles.daysHeader}>
              {DAYS.map(day => (
                <View key={day} style={styles.dayHeaderCell}>
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                <View key={weekIndex} style={styles.weekRow}>
                  {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                    const isToday = day === new Date().getDate() &&
                                   currentMonth === new Date().getMonth() &&
                                   currentYear === new Date().getFullYear();
                    const isSelected = day === selectedDate;
                    const dayEvents = day ? getEventsForDate(day) : [];

                    return (
                      <View key={dayIndex} style={styles.dayCell}>
                        {day ? (
                          <TouchableOpacity
                            style={[
                              styles.dayCellButton,
                              isSelected && styles.dayCellSelected,
                              isToday && styles.dayCellToday,
                            ]}
                            onPress={() => setSelectedDate(day)}
                          >
                            <Text style={styles.dayNumber}>{day}</Text>
                            {dayEvents.length > 0 && (
                              <View style={styles.eventDots}>
                                {dayEvents.slice(0, 3).map((event, idx) => (
                                  <View
                                    key={idx}
                                    style={[styles.eventDot, { backgroundColor: event.color }]}
                                  />
                                ))}
                              </View>
                            )}
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Events for Selected Date */}
          <View style={styles.eventsContainer}>
            <Text style={styles.modalSectionTitle}>
              Events on {MONTHS[currentMonth]} {selectedDate}, {currentYear}
            </Text>
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, { borderLeftColor: event.color }]}
                  onPress={() => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                >
                  <View style={styles.eventHeader}>
                    <View style={styles.eventHeaderLeft}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDescription}>{event.description}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: event.color + '20' }]}>
                      <Ionicons
                        name={CATEGORIES.find(c => c.id === event.category)?.icon as any || 'calendar'}
                        size={12}
                        color={event.color}
                      />
                      <Text style={[styles.categoryText, { color: event.color }]}>
                        {CATEGORIES.find(c => c.id === event.category)?.name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="time-outline" size={16} color={theme.colors.textSubtle} />
                      <Text style={styles.eventDetailText}>
                        {event.time} · {event.duration}
                      </Text>
                    </View>
                    {event.location && (
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="location-outline" size={16} color={theme.colors.textSubtle} />
                        <Text style={styles.eventDetailText}>{event.location}</Text>
                      </View>
                    )}
                    {event.attendees.length > 0 && (
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="people-outline" size={16} color={theme.colors.textSubtle} />
                        <View style={styles.attendeesRow}>
                          {event.attendees.map((attendee, idx) => (
                            <View key={idx} style={styles.attendeeBadge}>
                              <Text style={styles.attendeeText}>{attendee}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.textSubtle} />
                <Text style={styles.emptyStateText}>No events scheduled</Text>
                <Text style={styles.emptyStateSubtext}>Tap + to add an event</Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* List View */}
      {view === 'list' && (
        <>
          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, filterCategory === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterCategory('all')}
            >
              <Text style={[styles.filterButtonText, filterCategory === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.filterButton, filterCategory === category.id && styles.filterButtonActive]}
                onPress={() => setFilterCategory(category.id as EventCategory)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={14}
                  color={filterCategory === category.id ? accentColorHex : theme.colors.textSubtle}
                />
                <Text style={[styles.filterButtonText, filterCategory === category.id && styles.filterButtonTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Events List */}
          <View style={styles.eventsContainer}>
            {getFilteredEvents().length > 0 ? (
              getFilteredEvents().map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, { borderLeftColor: event.color }]}
                  onPress={() => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                >
                  <View style={styles.eventHeader}>
                    <View style={styles.eventHeaderLeft}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDescription}>{event.description}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: event.color + '20' }]}>
                      <Ionicons
                        name={CATEGORIES.find(c => c.id === event.category)?.icon as any || 'calendar'}
                        size={12}
                        color={event.color}
                      />
                      <Text style={[styles.categoryText, { color: event.color }]}>
                        {CATEGORIES.find(c => c.id === event.category)?.name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color={theme.colors.textSubtle} />
                      <Text style={styles.eventDetailText}>{event.date}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="time-outline" size={16} color={theme.colors.textSubtle} />
                      <Text style={styles.eventDetailText}>
                        {event.time} · {event.duration}
                      </Text>
                    </View>
                    {event.location && (
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="location-outline" size={16} color={theme.colors.textSubtle} />
                        <Text style={styles.eventDetailText}>{event.location}</Text>
                      </View>
                    )}
                    {event.attendees.length > 0 && (
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="people-outline" size={16} color={theme.colors.textSubtle} />
                        <View style={styles.attendeesRow}>
                          {event.attendees.map((attendee, idx) => (
                            <View key={idx} style={styles.attendeeBadge}>
                              <Text style={styles.attendeeText}>{attendee}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    {event.reminder && (
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="notifications" size={16} color={accentColorHex} />
                        <Text style={[styles.eventDetailText, { color: accentColorHex }]}>
                          Reminder set
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.textSubtle} />
                <Text style={styles.emptyStateText}>No events found</Text>
                <Text style={styles.emptyStateSubtext}>Try a different filter</Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>

      {/* Event Detail Modal */}
      <Modal
        visible={showEventModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEventModal(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedEvent && (
              <>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>{selectedEvent.title}</Text>
                    <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>{selectedEvent.date}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={20} color={theme.colors.textSubtle} />
                      <Text style={styles.modalInfoText}>
                        {selectedEvent.time} · {selectedEvent.duration}
                      </Text>
                    </View>
                    {selectedEvent.location && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="location-outline" size={20} color={theme.colors.textSubtle} />
                        <Text style={styles.modalInfoText}>{selectedEvent.location}</Text>
                      </View>
                    )}
                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name={CATEGORIES.find(c => c.id === selectedEvent.category)?.icon as any}
                        size={20}
                        color={selectedEvent.color}
                      />
                      <Text style={styles.modalInfoText}>
                        {CATEGORIES.find(c => c.id === selectedEvent.category)?.name}
                      </Text>
                    </View>
                    {selectedEvent.reminder && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="notifications" size={20} color={accentColorHex} />
                        <Text style={[styles.modalInfoText, { color: accentColorHex }]}>
                          Reminder enabled
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedEvent.attendees.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Attendees</Text>
                      <View style={styles.attendeesRow}>
                        {selectedEvent.attendees.map((attendee, idx) => (
                          <View key={idx} style={styles.attendeeBadge}>
                            <Text style={styles.attendeeText}>{attendee}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
                    <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

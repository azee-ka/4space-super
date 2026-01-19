// web/src/components/notifications/NotificationsMenu.tsx
// Compact notifications dropdown menu with expand to full modal

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell, faCheck, faTrash, faExpand, faCheckDouble,
  faUserPlus, faUsers, faShieldAlt, faFile, faComment,
  faHeart, faClock, faSpinner, faInbox, faArrowRight,
  faCircle, faStar, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  icon?: string;
  color?: string;
  link?: string;
  read: boolean;
  action_required: boolean;
  metadata: any;
  created_at: string;
}

const NOTIFICATION_ICONS: { [key: string]: any } = {
  space_invitation: faUserPlus,
  member_added: faUsers,
  member_removed: faUsers,
  role_changed: faShieldAlt,
  space_updated: faUsers,
  message_mention: faComment,
  task_assigned: faCheckDouble,
  file_uploaded: faFile,
  comment_added: faComment,
  reaction_added: faHeart,
};

const NOTIFICATION_COLORS: { [key: string]: string } = {
  space_invitation: 'blue',
  member_added: 'emerald',
  member_removed: 'red',
  role_changed: 'purple',
  space_updated: 'cyan',
  message_mention: 'cyan',
  task_assigned: 'orange',
  file_uploaded: 'violet',
  comment_added: 'blue',
  reaction_added: 'pink',
};

interface NotificationsMenuProps {
  onClose: () => void;
  onExpandToModal: () => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function NotificationsMenuPanel({ onClose, onExpandToModal }: NotificationsMenuProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getIcon = (type: string) => NOTIFICATION_ICONS[type] || faBell;
  const getColor = (type: string) => NOTIFICATION_COLORS[type] || 'gray';

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionCount = notifications.filter(n => n.action_required && !n.read).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div
      className="w-80 max-w-full p-4 bg-zinc-900 rounded-2xl shadow-2xl text-white max-h-[70vh] flex flex-col overflow-hidden box-border"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faBell} className="text-cyan-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Notifications</h3>
        </div>
        <button
          onClick={() => { onExpandToModal(); onClose(); }}
          className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center justify-center"
          title="Expand to full view"
        >
          <FontAwesomeIcon icon={faExpand} className="text-violet-400 text-sm" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faInbox} className="text-emerald-400 text-xs" />
        </div>
        <span className="text-xs font-semibold text-white">Overview</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="px-3 py-2.5 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faCircle} className="text-cyan-400 text-xs" />
            </div>
            <div>
              <span className="text-lg font-bold text-cyan-400 block leading-tight">{unreadCount}</span>
              <span className="text-xs text-zinc-500">Unread</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2.5 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-orange-400 text-xs" />
            </div>
            <div>
              <span className="text-lg font-bold text-orange-400 block leading-tight">{actionCount}</span>
              <span className="text-xs text-zinc-500">Actions</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2.5 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faInbox} className="text-violet-400 text-xs" />
            </div>
            <div>
              <span className="text-lg font-bold text-white block leading-tight">{notifications.length}</span>
              <span className="text-xs text-zinc-500">Total</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2.5 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-emerald-400 text-xs" />
            </div>
            <div>
              <span className="text-lg font-bold text-emerald-400 block leading-tight">{notifications.length - unreadCount}</span>
              <span className="text-xs text-zinc-500">Read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-3">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-zinc-800/50 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
            <span>All</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-2.5 py-6 bg-zinc-800/50 rounded-lg text-center">
            <FontAwesomeIcon icon={faStar} className="text-emerald-400 text-lg mb-2" />
            <p className="text-sm text-white font-medium">
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {filter === 'unread' ? 'Check back later' : 'They\'ll appear here'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const color = getColor(notification.type);
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="group px-2.5 py-2 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800/70 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  {/* Icon */}
                  <div className={`w-7 h-7 rounded-lg bg-${color}-500/10 flex items-center justify-center flex-shrink-0`}>
                    <FontAwesomeIcon icon={getIcon(notification.type)} className={`text-${color}-400 text-xs`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium leading-tight ${
                        notification.read ? 'text-zinc-400' : 'text-white'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                      )}
                    </div>

                    {notification.message && (
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                        {notification.message}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-1">
                      <FontAwesomeIcon icon={faClock} className="text-zinc-600 text-[9px]" />
                      <span className="text-[10px] text-zinc-500">
                        {formatRelativeTime(new Date(notification.created_at))}
                      </span>
                      {notification.action_required && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="text-[10px] text-orange-400 font-medium">Action</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={(e) => markAsRead(notification.id, e)}
                        className="w-6 h-6 rounded-md bg-zinc-700/50 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                        title="Mark as read"
                      >
                        <FontAwesomeIcon icon={faCheck} className="text-[9px] text-emerald-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(notification.id, e)}
                      className="w-6 h-6 rounded-md bg-zinc-700/50 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-[9px] text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="pt-3 mt-3 border-t border-zinc-800/50">
          <button
            onClick={() => { onExpandToModal(); onClose(); }}
            className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>View all notifications</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}

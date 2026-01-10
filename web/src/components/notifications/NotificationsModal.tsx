// web/src/components/modals/NotificationsModal.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faBell, faCheck, faXmark, faTrash, faCircle,
  faUserPlus, faUsers, faShieldAlt, faFile, faComment,
  faHeart, faClock, faCheckDouble, faFilter
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

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
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

  const deleteNotification = async (notificationId: string) => {
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
      await markAsRead(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon && notification.icon.startsWith('fa')) {
      return NOTIFICATION_ICONS[notification.type] || faBell;
    }
    return NOTIFICATION_ICONS[notification.type] || faBell;
  };

  const getNotificationColor = (notification: Notification) => {
    if (notification.color) return notification.color;
    
    const colors: { [key: string]: string } = {
      space_invitation: 'from-blue-500 to-cyan-600',
      member_added: 'from-green-500 to-emerald-600',
      member_removed: 'from-red-500 to-rose-600',
      role_changed: 'from-purple-500 to-fuchsia-600',
      message_mention: 'from-cyan-500 to-blue-600',
      task_assigned: 'from-orange-500 to-amber-600',
      file_uploaded: 'from-violet-500 to-purple-600',
    };
    
    return colors[notification.type] || 'from-gray-500 to-slate-600';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'action') return n.action_required;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionCount = notifications.filter(n => n.action_required && !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-black rounded-2xl border border-purple-500/20 shadow-2xl animate-slide-down max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faBell} className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                <p className="text-sm text-gray-400">
                  {unreadCount} unread {actionCount > 0 && `• ${actionCount} action required`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all duration-500"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-500"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'action', label: 'Action Required', count: actionCount }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-500 ${
                  filter === f.id
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10'
                }`}
              >
                {f.label}
                {f.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === f.id ? 'bg-black/20' : 'bg-white/10'
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faBell} className="text-3xl text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No notifications</h3>
              <p className="text-sm text-gray-400 text-center">
                {filter === 'unread' && 'You\'re all caught up!'}
                {filter === 'action' && 'No actions required'}
                {filter === 'all' && 'You don\'t have any notifications yet'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group relative"
                >
                  {/* Gradient glow on hover */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${getNotificationColor(notification)} rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`} />
                  
                  {/* Notification Card */}
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative w-full text-left p-4 rounded-xl border transition-all duration-500 ${
                      notification.read
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/20 hover:from-cyan-500/15 hover:to-purple-500/15'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getNotificationColor(notification)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <FontAwesomeIcon icon={getNotificationIcon(notification)} className="text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${
                            notification.read ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600" />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                        
                        {notification.message && (
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FontAwesomeIcon icon={faClock} className="text-xs" />
                          <span>{new Date(notification.created_at).toRelativeTimeString()}</span>
                          {notification.action_required && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400 font-semibold">Action required</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for relative time
declare global {
  interface Date {
    toRelativeTimeString(): string;
  }
}

Date.prototype.toRelativeTimeString = function() {
  const now = new Date();
  const diff = now.getTime() - this.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
// web/src/components/navbar/Navbar.tsx
// Clean, modern navbar with centered search and right-aligned profile

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useConversations } from '../../hooks/useConversations';
import { NotificationsModal } from '../notifications/NotificationsModal';
import { NotificationsMenuPanel } from '../notifications/NotificationsMenu';
import { DisplayMenuPanel } from './DisplayMenu';
import { ProfileMenuPanel } from './ProfileMenu';
import DropdownButton from '../ui/DropdownButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faBell, faChevronDown, faPalette, faMoon, faSun,
  faComments, faHome, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/logo.png';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  // Get conversations to calculate unread messages count
  const { data: conversations = [] } = useConversations();


  useEffect(() => {
    if (user) {
      loadUnreadCount();
      subscribeToNotifications();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const isDark = theme === 'dark';
  const isOnMessagesPage = location.pathname.startsWith('/messages');
  const isOnSpacesPage = location.pathname === '/spaces';
  const isOnDashboardPage = location.pathname === '/dashboard';

  // Calculate total unread messages count
  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce((total, conversation) => {
      return total + (conversation.unread_count || 0);
    }, 0);
  }, [conversations]);

  // Navigation items
  const navItems = [
    { path: '/dashboard', icon: faHome, label: 'Home', isActive: isOnDashboardPage },
    {
      path: '/messages',
      icon: faComments,
      label: 'Messages',
      isActive: isOnMessagesPage,
      badge: totalUnreadMessages > 9 ? '9+' : totalUnreadMessages > 0 ? totalUnreadMessages : null
    },
    { path: '/spaces', icon: faLayerGroup, label: 'Spaces', isActive: isOnSpacesPage },
  ];

  return (
    <>
      <nav className="px-6 py-3">
        <div className="flex items-center">
          {/* LEFT: Logo + Navigation */}
          <div className="flex items-center gap-3">
            {/* Logo Island */}
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-cyan-500/20 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-cyan-500/30 transition-colors" />

              <div className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-xl ${
                isDark ? 'bg-black/70' : 'bg-white/70'
              }`}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 group/logo"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover/logo:scale-105 transition-transform">
                    <img src={logo} alt="Logo" className="w-auto h-full" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hidden sm:inline">
                    4Space
                  </span>
                </button>
              </div>
            </div>

            {/* Navigation Island */}
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-blue-500/20 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-blue-500/30 transition-colors" />

              <div className={`relative flex items-center gap-1 px-2 py-2 rounded-2xl backdrop-blur-xl ${
                isDark ? 'bg-black/70' : 'bg-white/70'
              }`}>
                {navItems.map(({ path, icon, label, isActive, badge }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`relative px-4 py-2 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FontAwesomeIcon icon={icon} className="text-sm" />
                    <span className="hidden md:inline">{label}</span>
                    {badge && badge !== null && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">{badge}</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: Search */}
          <div className="flex-1 flex justify-center px-12">
            <div className={`relative w-full max-w-xl transition-all duration-200 ${
              searchFocused ? 'max-w-2xl' : ''
            }`}>
              <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all duration-200 ${
                searchFocused
                  ? 'bg-zinc-800/80'
                  : 'bg-zinc-900/50 hover:bg-zinc-800/60'
              }`}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={`text-sm transition-colors duration-200 ${
                    searchFocused ? 'text-cyan-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search anything..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-transparent text-sm outline-none focus:outline-none focus:border-none focus:ring-0 focus:ring-offset-0 placeholder-gray-500 text-white"
                />
                <kbd className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-opacity duration-200 ${
                  searchFocused ? 'opacity-0' : 'opacity-100'
                } bg-zinc-700/50 text-gray-400 hidden xl:inline`}>
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* RIGHT: Quick Actions + Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Action Buttons Island */}
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-purple-500/20 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-purple-500/30 transition-colors" />

              <div className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-2xl backdrop-blur-xl ${
                isDark ? 'bg-black/70' : 'bg-white/70'
              }`}>
                {/* Display Settings */}
                <DropdownButton
                  placement="bottom-end"
                  toggleContent={
                    <button
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-zinc-800/50 text-gray-400 hover:text-purple-300"
                      title="Display Settings"
                    >
                      <FontAwesomeIcon icon={faPalette} className="text-sm" />
                    </button>
                  }
                >
                  {({ closeDropdown }) => (
                    <DisplayMenuPanel onClose={closeDropdown} />
                  )}
                </DropdownButton>

                {/* Notifications */}
                <DropdownButton
                  placement="bottom-end"
                  toggleContent={
                    <button
                      className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-zinc-800/50 transition-colors"
                      title="Notifications"
                    >
                      <FontAwesomeIcon
                        icon={faBell}
                        className={`text-sm ${unreadCount > 0 ? 'text-cyan-300' : 'text-gray-400'}`}
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        </span>
                      )}
                    </button>
                  }
                >
                  {({ closeDropdown }) => (
                    <NotificationsMenuPanel
                      onClose={closeDropdown}
                      onExpandToModal={() => setNotificationsOpen(true)}
                    />
                  )}
                </DropdownButton>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-zinc-800/50 transition-colors group/theme"
                >
                  <FontAwesomeIcon
                    icon={isDark ? faSun : faMoon}
                    className={`text-sm transition-all duration-300 group-hover/theme:rotate-180 ${
                      isDark ? 'text-amber-400' : 'text-indigo-400'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Profile Button */}
            <DropdownButton
              placement="bottom-end"
              toggleContent={
                <button className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-zinc-800/50 transition-all">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-zinc-900" />
                  </div>

                  <span className="hidden lg:block text-sm font-medium text-white max-w-[100px] truncate">
                    {user?.email?.split('@')[0]}
                  </span>

                  <FontAwesomeIcon icon={faChevronDown} className="text-xs text-gray-400" />
                </button>
              }
            >
              {({ closeDropdown }) => (
                <ProfileMenuPanel onClose={closeDropdown} />
              )}
            </DropdownButton>
          </div>
        </div>
      </nav>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => {
          setNotificationsOpen(false);
          loadUnreadCount();
        }}
      />
    </>
  );
}

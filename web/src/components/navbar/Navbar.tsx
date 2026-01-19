// web/src/components/navbar/Navbar.tsx
// Clean, modern navbar with centered search and right-aligned profile

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { NotificationsModal } from '../notifications/NotificationsModal';
import { DisplayMenu } from './DisplayMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faBell, faChevronDown, faPalette, faMoon, faSun,
  faComments, faHome, faLayerGroup, faGear, faCircleUser,
  faArrowRightFromBracket, faShieldHalved, faChartLine,
  faSliders, faCircleQuestion, faBookmark, faStar, faCloud,
  faKey, faClock, faFileAlt, faUsers, faTrophy, faCalendar,
  faMessage, faBug, faLightbulb, faCode, faHeart
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/logo.png';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [displayMenuOpen, setDisplayMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'account' | 'settings' | 'activity' | 'support'>('account');
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  // Navigation items
  const navItems = [
    { path: '/dashboard', icon: faHome, label: 'Home', isActive: isOnDashboardPage },
    { path: '/messages', icon: faComments, label: 'Messages', isActive: isOnMessagesPage, badge: 3 },
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
                    {badge && badge > 0 && (
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
                <div className="relative">
                  <button
                    onClick={() => setDisplayMenuOpen(!displayMenuOpen)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      displayMenuOpen
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'hover:bg-zinc-800/50 text-gray-400 hover:text-purple-300'
                    }`}
                    title="Display Settings"
                  >
                    <FontAwesomeIcon icon={faPalette} className="text-sm" />
                  </button>
                  <DisplayMenu
                    isOpen={displayMenuOpen}
                    onClose={() => setDisplayMenuOpen(false)}
                  />
                </div>

                {/* Notifications */}
                <button
                  onClick={() => setNotificationsOpen(true)}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-zinc-800/50 transition-colors"
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
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-200 ${
                  profileOpen
                    ? 'bg-zinc-800/80'
                    : 'hover:bg-zinc-800/50'
                }`}
              >
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

                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-xs text-gray-400 transition-transform duration-200 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Advanced Compact Profile Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl overflow-hidden shadow-2xl border border-slate-700/50 shadow-slate-900/20 bg-black/70">
                    {/* Compact User Header */}
                    <div className="px-4 py-3 border-b border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-purple-500/30">
                            {user?.email?.[0].toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate">
                            {user?.email?.split('@')[0]}
                          </h4>
                          <p className="text-slate-400 text-xs truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pill Tabs */}
                    <div className="px-4 py-3 border-b border-slate-700/20">
                      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
                        {[
                          { id: 'account', label: 'Account', icon: faCircleUser },
                          { id: 'settings', label: 'Settings', icon: faGear },
                          { id: 'activity', label: 'Activity', icon: faChartLine },
                          { id: 'support', label: 'Support', icon: faCircleQuestion }
                        ].map(({ id, label, icon }) => (
                          <button
                            key={id}
                            onClick={() => setActiveProfileTab(id as any)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                              activeProfileTab === id
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                            }`}
                          >
                            <FontAwesomeIcon icon={icon} className="text-xs" />
                            <span className="hidden sm:inline">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="px-3 py-2 max-h-64 overflow-y-auto">
                      <AnimatePresence mode="wait">
                        {activeProfileTab === 'account' && (
                          <motion.div
                            key="account"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-1"
                          >
                            {[
                              { icon: faCircleUser, label: 'My Profile', desc: 'View & edit profile', color: 'cyan', onClick: () => navigate('/profile') },
                              { icon: faChartLine, label: 'Analytics', desc: 'Usage insights', color: 'emerald', onClick: () => navigate('/analytics') },
                              { icon: faBookmark, label: 'Saved Items', desc: 'Your bookmarks', color: 'violet', onClick: () => {} },
                              { icon: faStar, label: 'Favorites', desc: 'Starred content', color: 'amber', onClick: () => {} }
                            ].map(({ icon, label, desc, color, onClick }) => (
                              <button
                                key={label}
                                onClick={() => { onClick(); setProfileOpen(false); }}
                                className="group w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/30 transition-all duration-150 hover:translate-x-0.5"
                              >
                                <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                  <FontAwesomeIcon icon={icon} className={`text-${color}-400 text-xs`} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{label}</p>
                                  <p className="text-slate-400 text-xs">{desc}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}

                        {activeProfileTab === 'settings' && (
                          <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-1"
                          >
                            {[
                              { icon: faSliders, label: 'Preferences', desc: 'App settings', color: 'violet', onClick: () => navigate('/settings') },
                              { icon: faShieldHalved, label: 'Security', desc: 'Privacy & security', color: 'orange', onClick: () => navigate('/settings/security') },
                              { icon: faPalette, label: 'Appearance', desc: 'Themes & display', color: 'pink', onClick: () => setDisplayMenuOpen(true) },
                              { icon: faBell, label: 'Notifications', desc: 'Alert preferences', color: 'blue', onClick: () => {} },
                              { icon: faCloud, label: 'Storage', desc: 'Cloud sync', color: 'cyan', onClick: () => {} },
                              { icon: faKey, label: 'API Keys', desc: 'Developer access', color: 'slate', onClick: () => {} }
                            ].map(({ icon, label, desc, color, onClick }) => (
                              <button
                                key={label}
                                onClick={() => { onClick(); setProfileOpen(false); }}
                                className="group w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/30 transition-all duration-150 hover:translate-x-0.5"
                              >
                                <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                  <FontAwesomeIcon icon={icon} className={`text-${color}-400 text-xs`} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{label}</p>
                                  <p className="text-slate-400 text-xs">{desc}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}

                        {activeProfileTab === 'activity' && (
                          <motion.div
                            key="activity"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-1"
                          >
                            {[
                              { icon: faClock, label: 'Recent Activity', desc: 'Your last actions', color: 'blue', onClick: () => {} },
                              { icon: faComments, label: 'Message History', desc: 'Chat logs', color: 'green', onClick: () => {} },
                              { icon: faFileAlt, label: 'Recent Files', desc: 'File activity', color: 'orange', onClick: () => {} },
                              { icon: faUsers, label: 'Team Activity', desc: 'Collaborations', color: 'purple', onClick: () => {} },
                              { icon: faTrophy, label: 'Achievements', desc: 'Your badges', color: 'yellow', onClick: () => {} },
                              { icon: faCalendar, label: 'Schedule', desc: 'Upcoming events', color: 'red', onClick: () => {} }
                            ].map(({ icon, label, desc, color, onClick }) => (
                              <button
                                key={label}
                                onClick={() => { onClick(); setProfileOpen(false); }}
                                className="group w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/30 transition-all duration-150 hover:translate-x-0.5"
                              >
                                <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                  <FontAwesomeIcon icon={icon} className={`text-${color}-400 text-xs`} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{label}</p>
                                  <p className="text-slate-400 text-xs">{desc}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}

                        {activeProfileTab === 'support' && (
                          <motion.div
                            key="support"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-1"
                          >
                            {[
                              { icon: faCircleQuestion, label: 'Help Center', desc: 'FAQs & guides', color: 'blue', onClick: () => {} },
                              { icon: faMessage, label: 'Contact Support', desc: 'Get help', color: 'green', onClick: () => {} },
                              { icon: faBug, label: 'Report Issue', desc: 'Bug reports', color: 'red', onClick: () => {} },
                              { icon: faLightbulb, label: 'Feature Request', desc: 'Suggest improvements', color: 'yellow', onClick: () => {} },
                              { icon: faCode, label: 'Developer Docs', desc: 'API documentation', color: 'slate', onClick: () => {} },
                              { icon: faHeart, label: 'Donate', desc: 'Support development', color: 'pink', onClick: () => {} }
                            ].map(({ icon, label, desc, color, onClick }) => (
                              <button
                                key={label}
                                onClick={() => { onClick(); setProfileOpen(false); }}
                                className="group w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/30 transition-all duration-150 hover:translate-x-0.5"
                              >
                                <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                  <FontAwesomeIcon icon={icon} className={`text-${color}-400 text-xs`} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{label}</p>
                                  <p className="text-slate-400 text-xs">{desc}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Compact Sign Out */}
                    <div className="px-3 pb-3 border-t border-slate-700/20">
                      <button
                        onClick={() => signOut()}
                        className="group w-full flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-all duration-150 hover:translate-x-0.5 border border-red-500/20 hover:border-red-500/40 mt-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-red-400 text-xs" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-red-400 font-medium text-sm">Sign Out</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

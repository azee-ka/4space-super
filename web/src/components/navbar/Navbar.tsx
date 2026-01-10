// web/src/components/navbar/Navbar.tsx - FIXED & CLEAN

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { NotificationsModal } from '../notifications/NotificationsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faSearch, faBell, faCog, faUser, faSignOutAlt,
  faChevronDown, faPalette, faKeyboard, faMoon, faSun, faShieldAlt,
  faCreditCard, faChartLine, faComments
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
  const [unreadCount, setUnreadCount] = useState(0);
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
        (payload) => {
          console.log('Notification update:', payload);
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const isDark = theme === 'dark';
  const isOnMessagesPage = location.pathname === '/messages';

  return (
    <>
      {/* Clean Navbar with Visible Islands */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-2.5">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3">
          
          {/* Island 1: Logo + Search */}
          <div className="relative group">
            {/* Always visible glow - more prominent */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-purple-500/20 to-cyan-500/25 rounded-xl blur-sm" />
            
            {/* Defined border - more visible */}
            <div className="absolute inset-0 rounded-xl border border-cyan-500/30" />
            
            {/* Hover: sleek shadow depth */}
            <div className="absolute -inset-1 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            
            {/* Hover: clean integrated glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className={`relative flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-xl ${
              isDark ? 'bg-black/70' : 'bg-white/70'
            }`}>
              
              {/* Logo */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-0 group/logo"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover/logo:scale-105 transition-transform duration-300">
                  <img src={logo} alt="Logo" className="w-auto h-full" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  4Space
                </span>
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />

              {/* Search */}
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300">
                <FontAwesomeIcon icon={faSearch} className="text-cyan-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`w-40 bg-transparent text-sm outline-none focus:outline-none focus:border-0 focus:shadow-none focus:ring-0 focus:ring-offset-0 ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'
                  }`}
                />
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono text-cyan-400">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Island 2: Actions */}
          <div className="relative group">
            {/* Always visible glow - more prominent */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-purple-500/25 rounded-xl blur-sm" />
            
            {/* Defined border - more visible */}
            <div className="absolute inset-0 rounded-xl border border-blue-500/30" />
            
            {/* Hover: sleek shadow depth */}
            <div className="absolute -inset-1 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            
            {/* Hover: clean integrated glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className={`relative flex items-center gap-1.5 px-2 py-2 rounded-xl backdrop-blur-xl ${
              isDark ? 'bg-black/70' : 'bg-white/70'
            }`}>
              
              {/* Messages */}
              <button
                onClick={() => navigate('/messages')}
                className="relative"
              >
                <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 ${
                  isOnMessagesPage
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'hover:bg-white/10 text-gray-400 hover:text-cyan-300'
                }`}>
                  <FontAwesomeIcon icon={faComments} className="text-sm" />
                  <span className="hidden md:inline text-sm font-medium">Messages</span>
                  
                  {/* Badge */}
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">3</span>
                  </div>
                </div>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  unreadCount > 0 ? 'bg-cyan-500/20' : 'hover:bg-white/10'
                }`}>
                  <FontAwesomeIcon 
                    icon={faBell} 
                    className={`text-sm ${unreadCount > 0 ? 'text-cyan-300' : 'text-gray-400'}`}
                  />
                  
                  {/* Badge */}
                  {unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-gradient-to-b from-transparent via-purple-400/40 to-transparent mx-0.5" />

              {/* Theme Toggle - Fixed animation */}
              <button onClick={toggleTheme} className="group/theme">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors duration-300">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <FontAwesomeIcon 
                      icon={isDark ? faSun : faMoon} 
                      className={`text-sm ${
                        isDark ? 'text-orange-400' : 'text-indigo-500'
                      } group-hover/theme:rotate-180 transition-transform duration-500 origin-center`}
                    />
                  </div>
                </div>
              </button>

              {/* Settings - Fixed animation */}
              <button className="group/settings">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors duration-300">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <FontAwesomeIcon 
                      icon={faCog} 
                      className="text-sm text-gray-400 group-hover/settings:text-purple-400 group-hover/settings:rotate-90 transition-all duration-500 origin-center"
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Island 3: Profile */}
          <div className="relative" ref={profileRef}>
            <div className="relative group">
              {/* Always visible glow - more prominent */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/25 via-blue-500/20 to-purple-500/25 rounded-xl blur-sm" />
              
              {/* Defined border - more visible */}
              <div className="absolute inset-0 rounded-xl border border-purple-500/30" />
              
              {/* Hover: sleek shadow depth */}
              <div className="absolute -inset-1 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              
              {/* Hover: clean integrated glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl ${
                  isDark ? 'bg-black/70' : 'bg-white/70'
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-50 blur-sm" />
                  <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                </div>
                
                <span className={`hidden md:block text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {user?.email?.split('@')[0]}
                </span>
                
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-xs text-gray-400 transition-transform duration-300 ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 animate-dropdown">
                <div className="relative group">
                  {/* Always visible glow */}
                  <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-blue-500/25 rounded-xl blur-sm" />
                  
                  {/* Defined border */}
                  <div className="absolute inset-0 rounded-xl border border-blue-500/30" />
                  
                  {/* Hover: sleek shadow depth */}
                  <div className="absolute -inset-1 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  
                  {/* Hover: clean glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`relative rounded-xl backdrop-blur-xl overflow-hidden ${
                    isDark ? 'bg-black/80' : 'bg-white/80'
                  }`}>
                    
                    {/* Header */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-50 blur-sm" />
                          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user?.email?.[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {user?.email?.split('@')[0]}
                          </p>
                          <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      
                      {/* Premium Badge */}
                      <div className={`px-3 py-1.5 rounded-lg flex items-center justify-between ${
                        isDark 
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                          : 'bg-gradient-to-r from-blue-50 to-purple-50'
                      }`}>
                        <span className={`text-xs font-semibold ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          Premium Member
                        </span>
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-0.5">
                      {[
                        { icon: faUser, label: 'My Profile', color: 'from-blue-500 to-cyan-500' },
                        { icon: faChartLine, label: 'Analytics', color: 'from-green-500 to-teal-500' },
                        { icon: faPalette, label: 'Appearance', color: 'from-purple-500 to-pink-500' },
                        { icon: faShieldAlt, label: 'Privacy & Security', color: 'from-orange-500 to-red-500' },
                        { icon: faCreditCard, label: 'Billing', color: 'from-pink-500 to-rose-500' },
                        { icon: faKeyboard, label: 'Shortcuts', color: 'from-indigo-500 to-purple-500' },
                      ].map((item, i) => (
                        <button
                          key={i}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-300 ${
                            isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                            <FontAwesomeIcon icon={item.icon} className="text-white text-xs" />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-white/10">
                      <button
                        onClick={() => signOut()}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left font-medium transition-all duration-300 ${
                          isDark 
                            ? 'text-red-400 hover:bg-red-500/10' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
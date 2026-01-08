import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faSearch, faBell, faCog, faUser, faSignOutAlt,
  faChevronDown, faPalette, faKeyboard, faMoon, faSun, faShieldAlt,
  faCreditCard, faChartLine
} from '@fortawesome/free-solid-svg-icons';

export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isDark = theme === 'dark';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-2xl ${
      isDark 
        ? 'bg-black/70 border-white/10' 
        : 'bg-white/70 border-slate-200'
    }`}>
      {/* Subtle gradient line at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-px ${
        isDark 
          ? 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent'
          : 'bg-gradient-to-r from-transparent via-blue-500/20 to-transparent'
      }`} />

      <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between relative">
        
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className={`absolute -inset-1 rounded-xl blur-md transition-all ${
                isDark
                  ? 'bg-gradient-to-br from-blue-500/50 to-purple-600/50 group-hover:from-blue-500/70 group-hover:to-purple-600/70'
                  : 'bg-gradient-to-br from-blue-500/30 to-purple-600/30 group-hover:from-blue-500/50 group-hover:to-purple-600/50'
              }`} />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-transform group-hover:scale-105">
                <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
              </div>
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${
              isDark
                ? 'from-blue-400 via-purple-400 to-pink-400'
                : 'from-blue-600 via-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}>
              4SPACE
            </span>
          </button>

          {/* Search */}
          <div className="hidden lg:block">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
              isDark
                ? 'glass hover:bg-white/10 border-white/10 hover:border-blue-500/50'
                : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-sm'
            }`}>
              <FontAwesomeIcon icon={faSearch} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <input
                type="text"
                placeholder="Search spaces..."
                className={`w-72 bg-transparent text-sm outline-none ${
                  isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />
              <kbd className={`px-2 py-1 rounded-lg text-xs font-mono ${
                isDark ? 'bg-white/10 text-blue-400' : 'bg-slate-100 text-slate-600'
              }`}>
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isDark 
                  ? 'glass hover:bg-white/10 border border-white/10' 
                  : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              <FontAwesomeIcon icon={faBell} className={isDark ? 'text-white' : 'text-slate-700'} />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
              </div>
            </button>

            {notificationsOpen && (
              <div className={`absolute right-0 mt-3 w-96 rounded-2xl border shadow-2xl overflow-hidden animate-dropdown ${
                isDark
                  ? 'glass-strong border-white/10 backdrop-blur-2xl'
                  : 'bg-white border-slate-200'
              }`}>
                <div className={`p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Notifications
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        You have 2 unread notifications
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 max-h-96 overflow-y-auto">
                  {[
                    { title: 'New message', text: 'Sarah sent you a message', color: 'from-blue-500 to-cyan-500', time: '2m ago' },
                    { title: 'File uploaded', text: 'Project.pdf was added', color: 'from-purple-500 to-pink-500', time: '1h ago' },
                  ].map((notif, i) => (
                    <button
                      key={i}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${notif.color} flex items-center justify-center flex-shrink-0`}>
                          <FontAwesomeIcon icon={faBell} className="text-white text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {notif.text}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all group ${
              isDark 
                ? 'glass hover:bg-white/10 border border-white/10' 
                : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
            }`}
          >
            {isDark ? (
              <>
                <FontAwesomeIcon icon={faSun} className="text-orange-400 text-lg" />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faMoon} className="text-indigo-600 text-lg" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </>
            )}
          </button>

          {/* Settings */}
          <button className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            isDark 
              ? 'glass hover:bg-white/10 border border-white/10' 
              : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
          }`}>
            <FontAwesomeIcon icon={faCog} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
          </button>

          {/* Divider */}
          <div className={`w-px h-8 mx-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isDark 
                  ? 'glass hover:bg-white/10 border border-white/10' 
                  : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              <div className="relative">
                <div className={`absolute -inset-0.5 rounded-lg blur-sm transition-all ${
                  isDark
                    ? 'bg-gradient-to-br from-blue-500/50 to-purple-600/50'
                    : 'bg-gradient-to-br from-blue-500/30 to-purple-600/30'
                }`} />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
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
                className={`text-xs transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                } ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              />
            </button>

            {profileOpen && (
              <div className={`absolute right-0 mt-3 w-72 rounded-2xl border shadow-2xl overflow-hidden animate-dropdown ${
                isDark
                  ? 'glass-strong border-white/10 backdrop-blur-2xl'
                  : 'bg-white border-slate-200'
              }`}>
                {/* Profile Header */}
                <div className={`p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className={`absolute -inset-1 rounded-xl blur-md ${
                        isDark
                          ? 'bg-gradient-to-br from-blue-500/50 to-purple-600/50'
                          : 'bg-gradient-to-br from-blue-500/30 to-purple-600/30'
                      }`} />
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {user?.email?.[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {user?.email?.split('@')[0]}
                      </p>
                      <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Premium Member
                    </span>
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {[
                    { icon: faUser, label: 'My Profile', color: 'from-blue-500 to-cyan-500' },
                    { icon: faChartLine, label: 'Analytics', color: 'from-green-500 to-teal-500' },
                    { icon: faPalette, label: 'Appearance', color: 'from-purple-500 to-pink-500' },
                    { icon: faShieldAlt, label: 'Privacy & Security', color: 'from-orange-500 to-red-500' },
                    { icon: faCreditCard, label: 'Billing', color: 'from-pink-500 to-rose-500' },
                    { icon: faKeyboard, label: 'Keyboard Shortcuts', color: 'from-indigo-500 to-purple-500' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <FontAwesomeIcon icon={item.icon} className="text-white text-sm" />
                      </div>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sign Out */}
                <div className={`p-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <button
                    onClick={() => signOut()}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                      isDark 
                        ? 'text-red-400 hover:bg-red-500/10' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
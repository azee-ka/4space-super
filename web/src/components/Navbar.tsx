import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faSearch, faBell, faCog, faSignOutAlt, 
  faCircle, faUser, faShieldAlt, faPalette, faKeyboard,
  faQuestionCircle, faComments, faFolder, faCheckCircle,
  faChartLine, faBolt, faCrown, faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Command palette (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const notifications = [
    { id: 1, type: 'message', text: 'New message in Team Chat', time: '2m ago', unread: true },
    { id: 2, type: 'mention', text: 'You were mentioned in Design', time: '1h ago', unread: true },
    { id: 3, type: 'file', text: 'Project.pdf was uploaded', time: '3h ago', unread: false },
  ];

  const quickActions = [
    { icon: faComments, label: 'New Chat', action: () => navigate('/dashboard') },
    { icon: faFolder, label: 'Upload File', action: () => {} },
    { icon: faCheckCircle, label: 'Create Task', action: () => {} },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-black/95 backdrop-blur-2xl">
        <div className="max-w-[2000px] mx-auto px-6 h-16">
          <div className="flex items-center justify-between h-full">
            
            {/* Left: Logo + Search */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="group flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-opacity" />
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <FontAwesomeIcon icon={faRocket} className="text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    4SPACE
                  </div>
                  <div className="text-xs text-slate-500 -mt-1">Digital Universe</div>
                </div>
              </button>

              {/* Search Bar */}
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden md:flex items-center gap-3 w-96 px-4 py-2.5 bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/30 rounded-xl transition-all group"
              >
                <FontAwesomeIcon icon={faSearch} className="text-slate-500 group-hover:text-cyan-400 transition-all" />
                <span className="flex-1 text-left text-sm text-slate-500">Search or jump to...</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-xs text-slate-500">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-xs text-slate-500">K</kbd>
                </div>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="hidden lg:flex items-center gap-4 mr-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-400">All systems operational</span>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative w-10 h-10 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/30 hover:bg-slate-900/70 flex items-center justify-center transition-all group"
                >
                  <FontAwesomeIcon icon={faBell} className="text-slate-400 group-hover:text-cyan-400 transition-all" />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                  </div>
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="bg-black absolute right-0 mt-2 w-96 rounded-2xl bg-slate-900/95 border border-slate-800/50 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <button className="text-xs text-cyan-400 hover:text-cyan-300">Mark all read</button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className="w-full p-4 hover:bg-slate-800/30 transition-all flex items-start gap-3 border-b border-slate-800/30"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                          <div className="flex-1 text-left">
                            <p className="text-sm text-white mb-1">{notif.text}</p>
                            <p className="text-xs text-slate-500">{notif.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-800/50">
                      <button className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-all">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button className="w-10 h-10 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/30 hover:bg-slate-900/70 flex items-center justify-center transition-all group">
                <FontAwesomeIcon icon={faCog} className="text-slate-400 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-slate-800/50" />

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{user?.email?.split('@')[0]}</span>
                      <FontAwesomeIcon icon={faCrown} className="text-yellow-400 text-xs" />
                    </div>
                    <span className="text-xs text-slate-500">Premium</span>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="bg-black absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800/50 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
                    {/* Profile Header */}
                    <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-b border-slate-800/50">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-2xl shadow-xl">
                            {user?.email?.[0].toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-slate-900" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white mb-1">{user?.email?.split('@')[0]}</h3>
                          <p className="text-sm text-slate-400">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-cyan-400">Premium</span>
                            <FontAwesomeIcon icon={faCrown} className="text-yellow-400" />
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-xs text-white transition-all">
                          Upgrade
                        </button>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="w-full px-4 py-3 rounded-xl hover:bg-slate-800/50 flex items-center gap-3 transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-all">
                          <FontAwesomeIcon icon={faUser} className="text-cyan-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">Profile</p>
                          <p className="text-xs text-slate-500">Manage your account</p>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} className="text-slate-600 group-hover:text-cyan-400" />
                      </button>

                      <button className="w-full px-4 py-3 rounded-xl hover:bg-slate-800/50 flex items-center gap-3 transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-all">
                          <FontAwesomeIcon icon={faPalette} className="text-purple-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">Appearance</p>
                          <p className="text-xs text-slate-500">Customize your experience</p>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} className="text-slate-600 group-hover:text-cyan-400" />
                      </button>

                      <button className="w-full px-4 py-3 rounded-xl hover:bg-slate-800/50 flex items-center gap-3 transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-all">
                          <FontAwesomeIcon icon={faKeyboard} className="text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">Shortcuts</p>
                          <p className="text-xs text-slate-500">Keyboard shortcuts</p>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} className="text-slate-600 group-hover:text-cyan-400" />
                      </button>

                      <button className="w-full px-4 py-3 rounded-xl hover:bg-slate-800/50 flex items-center gap-3 transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-all">
                          <FontAwesomeIcon icon={faQuestionCircle} className="text-green-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">Help & Support</p>
                          <p className="text-xs text-slate-500">Get help or feedback</p>
                        </div>
                        <FontAwesomeIcon icon={faArrowRight} className="text-slate-600 group-hover:text-cyan-400" />
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-slate-800/50">
                      <button
                        onClick={() => signOut()}
                        className="w-full px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-3 transition-all group"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-red-400" />
                        <span className="text-sm font-medium text-red-400">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </nav>

      {/* Command Palette */}
      {commandOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900/95 border border-slate-800/50 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Search Input */}
            <div className="p-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faSearch} className="text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search spaces, files, commands..."
                  autoFocus
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
                />
                <button
                  onClick={() => setCommandOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-400"
                >
                  ESC
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3 px-2">Quick Actions</p>
              <div className="space-y-1">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className="w-full px-4 py-3 rounded-xl hover:bg-slate-800/50 flex items-center gap-3 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                      <FontAwesomeIcon icon={action.icon} className="text-slate-400 group-hover:text-cyan-400" />
                    </div>
                    <span className="text-sm text-white">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
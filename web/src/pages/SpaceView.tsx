import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpacesStore } from '../store/spacesStore';
import { useThemeStore } from '../store/themeStore';
import { Navbar } from '../components/navbar/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faComments, faFolder, faFileAlt, faCheckCircle, 
  faUsers, faCalendar, faChartBar, faLock, faHeart, faBriefcase, 
  faGlobe, faRocket, faPlus, faEllipsisV, faGripVertical,
  faTimes, faCode, faImage, faLink, faVideo, faMicrophone, faPoll,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';

const iconMap: { [key: string]: any } = {
  'lock': faLock,
  'heart': faHeart,
  'users': faUsers,
  'briefcase': faBriefcase,
  'globe': faGlobe,
  'rocket': faRocket,
};

interface Widget {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  category: 'communication' | 'productivity' | 'content' | 'collaboration';
}

const AVAILABLE_WIDGETS: Widget[] = [
  { id: 'chat', name: 'Chat', icon: faComments, color: 'from-blue-500 to-cyan-600', description: 'Real-time messaging', category: 'communication' },
  { id: 'files', name: 'Files', icon: faFolder, color: 'from-purple-500 to-pink-600', description: 'File storage & sharing', category: 'content' },
  { id: 'notes', name: 'Notes', icon: faFileAlt, color: 'from-green-500 to-teal-600', description: 'Collaborative docs', category: 'content' },
  { id: 'tasks', name: 'Tasks', icon: faCheckCircle, color: 'from-orange-500 to-red-600', description: 'Task management', category: 'productivity' },
  { id: 'calendar', name: 'Calendar', icon: faCalendar, color: 'from-pink-500 to-rose-600', description: 'Events & scheduling', category: 'productivity' },
  { id: 'board', name: 'Board', icon: faChartBar, color: 'from-indigo-500 to-purple-600', description: 'Kanban boards', category: 'productivity' },
  { id: 'whiteboard', name: 'Whiteboard', icon: faImage, color: 'from-amber-500 to-orange-600', description: 'Visual collaboration', category: 'collaboration' },
  { id: 'video', name: 'Video Call', icon: faVideo, color: 'from-red-500 to-pink-600', description: 'Video conferencing', category: 'communication' },
  { id: 'voice', name: 'Voice Rooms', icon: faMicrophone, color: 'from-blue-500 to-indigo-600', description: 'Audio channels', category: 'communication' },
  { id: 'polls', name: 'Polls', icon: faPoll, color: 'from-teal-500 to-cyan-600', description: 'Create polls & surveys', category: 'collaboration' },
  { id: 'links', name: 'Links', icon: faLink, color: 'from-violet-500 to-purple-600', description: 'Bookmark manager', category: 'content' },
  { id: 'code', name: 'Code Editor', icon: faCode, color: 'from-slate-500 to-gray-600', description: 'Collaborative coding', category: 'productivity' },
];

export function SpaceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { selectedSpace, fetchSpaces } = useSpacesStore();
  const [loading, setLoading] = useState(true);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['chat']);
  const [stats, setStats] = useState({ messages: 0, files: 0, tasks: 0, members: 1 });

  useEffect(() => {
    if (id && !selectedSpace) {
      fetchSpaces();
    }
    if (id) {
      loadSpaceData();
    }
  }, [id]);

  const loadSpaceData = async () => {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('space_id', id);

      setStats({
        messages: messages?.length || 0,
        files: 0,
        tasks: 0,
        members: 1,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setActiveWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const activeWidgetsList = AVAILABLE_WIDGETS.filter(w => activeWidgets.includes(w.id));
  const categories = ['communication', 'productivity', 'content', 'collaboration'] as const;
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <Navbar />

      {/* Space Header */}
      <div className={`pt-20 px-6 pb-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
                  isDark 
                    ? 'glass hover:bg-white/10 border-white/10' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                }`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              </button>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-xl blur-lg" />
                <div
                  className="relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: selectedSpace?.color || 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)'
                  }}
                >
                  <FontAwesomeIcon 
                    icon={selectedSpace?.icon && iconMap[selectedSpace.icon] ? iconMap[selectedSpace.icon] : faRocket} 
                    className="text-white text-xl" 
                  />
                </div>
              </div>

              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedSpace?.name || 'Space'}
                </h1>
                {selectedSpace?.description && (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedSpace.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 border ${
                isDark 
                  ? 'glass hover:bg-white/10 border-white/10' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <FontAwesomeIcon icon={faUsers} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
                <span className={`hidden md:inline text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stats.members} members
                </span>
              </button>
              
              <button 
                onClick={() => setShowWidgetLibrary(true)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Widget
              </button>

              <button className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
                isDark 
                  ? 'glass hover:bg-white/10 border-white/10' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <FontAwesomeIcon icon={faEllipsisV} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <main className="px-6 py-12">
        <div className="max-w-[1600px] mx-auto">
          {activeWidgetsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                isDark ? 'glass-strong' : 'bg-white border border-slate-200'
              }`}>
                <FontAwesomeIcon icon={faPlus} className={`text-3xl ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No widgets added yet
              </h3>
              <p className={`mb-8 max-w-md text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Add widgets to customize this space and unlock powerful features
              </p>
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all"
              >
                Browse Widget Library
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeWidgetsList.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => navigate(`/spaces/${id}/${widget.id}`)}
                  className={`group relative p-6 rounded-2xl transition-all text-left border overflow-hidden ${
                    isDark
                      ? 'glass hover:bg-white/10 border-white/10 hover:border-blue-500/50'
                      : 'bg-white hover:shadow-xl border-slate-200 hover:border-blue-500/50'
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all" />
                  
                  <div className="relative">
                    {/* Drag Handle */}
                    <button className={`absolute -top-2 -right-2 w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10 ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    }`}>
                      <FontAwesomeIcon icon={faGripVertical} className={`text-sm ${
                        isDark ? 'text-slate-600' : 'text-slate-400'
                      }`} />
                    </button>

                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${widget.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <FontAwesomeIcon icon={widget.icon} className="text-white text-xl" />
                    </div>

                    <h3 className={`text-lg font-bold mb-2 group-hover:text-gradient transition-all ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {widget.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {widget.description}
                    </p>

                    {/* Stats badge */}
                    {widget.id === 'chat' && stats.messages > 0 && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                        <span className="text-xs font-bold text-blue-400">{stats.messages}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg ${
          isDark ? 'bg-black/90' : 'bg-slate-900/50'
        }`}>
          <div className={`w-full max-w-5xl max-h-[85vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
            isDark
              ? 'glass-strong border-white/10'
              : 'bg-white border-slate-200'
          }`}>
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isDark ? 'border-white/10' : 'border-slate-200'
            }`}>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Widget Library
                </h2>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                  Add widgets to customize your space
                </p>
              </div>
              <button
                onClick={() => setShowWidgetLibrary(false)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
                  isDark 
                    ? 'glass hover:bg-white/10 border-white/10' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={faTimes} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              </button>
            </div>

            {/* Categories & Widgets */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {categories.map((category) => {
                const categoryWidgets = AVAILABLE_WIDGETS.filter(w => w.category === category);
                return (
                  <div key={category} className="mb-8 last:mb-0">
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryWidgets.map((widget) => {
                        const isActive = activeWidgets.includes(widget.id);
                        return (
                          <button
                            key={widget.id}
                            onClick={() => toggleWidget(widget.id)}
                            className={`p-5 rounded-xl border transition-all text-left ${
                              isActive
                                ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                : isDark
                                  ? 'glass hover:bg-white/10 border-white/10 hover:border-white/20'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${widget.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                <FontAwesomeIcon icon={widget.icon} className="text-white text-lg" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className={`text-sm font-bold ${
                                    isActive 
                                      ? 'text-blue-400' 
                                      : isDark ? 'text-white' : 'text-slate-900'
                                  }`}>
                                    {widget.name}
                                  </h4>
                                  {isActive && (
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-blue-400" />
                                  )}
                                </div>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {widget.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t flex items-center justify-between ${
              isDark ? 'border-white/10' : 'border-slate-200'
            }`}>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {activeWidgets.length}
                </span> widget{activeWidgets.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setShowWidgetLibrary(false)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
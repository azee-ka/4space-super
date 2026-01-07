import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpacesStore } from '../store/spacesStore';
import { Navbar } from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faComments, faFolder, faFileAlt, faCheckCircle, 
  faUsers, faCalendar, faChartBar, faLock, faHeart, faBriefcase, 
  faGlobe, faRocket, faChevronRight, faPlus, faCog
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

interface SpaceStats {
  messages: number;
  files: number;
  tasks: number;
  members: number;
}

export function SpaceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedSpace, fetchSpaces } = useSpacesStore();
  const [stats, setStats] = useState<SpaceStats>({ messages: 0, files: 0, tasks: 0, members: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && !selectedSpace) {
      fetchSpaces();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSpaceStats();
    }
  }, [id]);

  const loadSpaceStats = async () => {
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
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: 'chat',
      name: 'Chat',
      icon: faComments,
      color: 'from-cyan-500 to-blue-600',
      route: `/spaces/${id}/chat`,
      enabled: true,
    },
    {
      id: 'files',
      name: 'Files',
      icon: faFolder,
      color: 'from-purple-500 to-pink-600',
      route: `/spaces/${id}/files`,
      enabled: false,
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: faFileAlt,
      color: 'from-green-500 to-teal-600',
      route: `/spaces/${id}/notes`,
      enabled: false,
    },
    {
      id: 'tasks',
      name: 'Tasks',
      icon: faCheckCircle,
      color: 'from-orange-500 to-red-600',
      route: `/spaces/${id}/tasks`,
      enabled: false,
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: faCalendar,
      color: 'from-pink-500 to-rose-600',
      route: `/spaces/${id}/calendar`,
      enabled: false,
    },
    {
      id: 'board',
      name: 'Board',
      icon: faChartBar,
      color: 'from-indigo-500 to-purple-600',
      route: `/spaces/${id}/board`,
      enabled: false,
    },
  ];

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-cyan-500/20 rounded-lg" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-cyan-500 rounded-lg animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Space Header */}
      <div className="pt-20 px-6 pb-6 border-b border-slate-800/50">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-9 h-9 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/50 flex items-center justify-center transition-all"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-slate-400 text-sm" />
              </button>

              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
                style={{
                  background: selectedSpace?.color || 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                }}
              >
                <FontAwesomeIcon 
                  icon={selectedSpace?.icon && iconMap[selectedSpace.icon] ? iconMap[selectedSpace.icon] : faRocket} 
                  className="text-white" 
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">{selectedSpace?.name || 'Space'}</h1>
                {selectedSpace?.description && (
                  <p className="text-sm text-slate-400">{selectedSpace.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/50 text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center gap-2">
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                Invite
              </button>
              <button className="w-9 h-9 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/50 flex items-center justify-center transition-all">
                <FontAwesomeIcon icon={faCog} className="text-slate-400 text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon icon={faComments} className="text-cyan-400" />
                <span className="text-2xl font-bold text-white">{stats.messages}</span>
              </div>
              <p className="text-xs text-slate-500">Messages</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon icon={faFolder} className="text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.files}</span>
              </div>
              <p className="text-xs text-slate-500">Files</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.tasks}</span>
              </div>
              <p className="text-xs text-slate-500">Tasks</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon icon={faUsers} className="text-orange-400" />
                <span className="text-2xl font-bold text-white">{stats.members}</span>
              </div>
              <p className="text-xs text-slate-500">Members</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Features</h2>
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-all">
                Configure
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => feature.enabled && navigate(feature.route)}
                  disabled={!feature.enabled}
                  className={`group text-left p-5 rounded-xl border transition-all ${
                    feature.enabled
                      ? 'bg-slate-900/30 border-slate-800/50 hover:border-cyan-500/30 hover:bg-slate-900/50 cursor-pointer'
                      : 'bg-slate-900/20 border-slate-800/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center ${
                        feature.enabled ? 'group-hover:scale-105' : ''
                      } transition-transform`}
                    >
                      <FontAwesomeIcon icon={feature.icon} className="text-white text-sm" />
                    </div>
                    {!feature.enabled && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-800/50 text-slate-500">
                        Soon
                      </span>
                    )}
                    {feature.enabled && (
                      <FontAwesomeIcon 
                        icon={faChevronRight} 
                        className="text-slate-600 group-hover:text-cyan-400 transition-all text-sm" 
                      />
                    )}
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${
                    feature.enabled ? 'text-white group-hover:text-cyan-400' : 'text-slate-500'
                  } transition-all`}>
                    {feature.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
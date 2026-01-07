import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSpacesStore } from '../store/spacesStore';
import { CreateSpaceModal } from '../components/spaces/CreateSpaceModal';
import { Navbar } from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faGlobe, faLock, faUsers, faHeart, faBriefcase, faRocket,
  faChevronRight, faClock, faFire, faBolt
} from '@fortawesome/free-solid-svg-icons';
import type { Space } from '@4space/shared';

const iconMap: { [key: string]: any } = {
  'lock': faLock,
  'heart': faHeart,
  'users': faUsers,
  'briefcase': faBriefcase,
  'globe': faGlobe,
  'rocket': faRocket,
};

export function Spaces() {
  const navigate = useNavigate();
  const { spaces, loading, fetchSpaces, selectSpace } = useSpacesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'pinned'>('all');

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleSpaceClick = (space: Space) => {
    selectSpace(space);
    navigate(`/spaces/${space.id}`);
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-cyan-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-purple-600',
      'from-yellow-500 to-orange-600',
    ];
    return gradients[index % gradients.length];
  };

  const recentSpaces = spaces.slice(0, 3);
  const activeToday = Math.ceil(spaces.length * 0.7);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Main */}
      <main className="pt-20 px-6 pb-12">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm text-slate-400">{spaces.length} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBolt} className="text-yellow-400 text-xs" />
                <span className="text-sm text-slate-400">{activeToday} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFire} className="text-orange-400 text-xs" />
                <span className="text-sm text-slate-400">2.4K Messages</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              New Space
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-slate-700/50'
              }`}
            >
              All Spaces
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'recent'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-slate-700/50'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setFilter('pinned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'pinned'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-slate-700/50'
              }`}
            >
              Pinned
            </button>
          </div>

          {/* Spaces Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-cyan-500/20 rounded-lg" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-cyan-500 rounded-lg animate-spin" />
              </div>
            </div>
          ) : spaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 rounded-xl bg-slate-900/50 border border-slate-800/50 flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faRocket} className="text-slate-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No spaces yet</h3>
              <p className="text-slate-400 mb-6">Create your first space to get started</p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all"
              >
                Create Space
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {spaces.map((space, index) => (
                <button
                  key={space.id}
                  onClick={() => handleSpaceClick(space)}
                  className="group text-left p-5 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGradient(index)} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                    >
                      <FontAwesomeIcon 
                        icon={space.icon && iconMap[space.icon] ? iconMap[space.icon] : faRocket} 
                        className="text-white" 
                      />
                    </div>
                    <div className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
                      <FontAwesomeIcon 
                        icon={
                          space.privacy === 'private' ? faLock :
                          space.privacy === 'shared' ? faUsers :
                          space.privacy === 'team' ? faUsers : faGlobe
                        } 
                        className="text-slate-400 text-xs" 
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-all">
                    {space.name}
                  </h4>
                  {space.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                      {space.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} />
                      {new Date(space.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <FontAwesomeIcon 
                      icon={faChevronRight} 
                      className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" 
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateSpaceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
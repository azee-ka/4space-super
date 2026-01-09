import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpacesStore } from '../store/spacesStore';
import { useThemeStore } from '../store/themeStore';
import { CreateSpaceModal } from '../components/spaces/CreateSpaceModal';
import { Navbar } from '../components/navbar/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faGlobe, faLock, faUsers, faHeart, faBriefcase, faRocket,
  faChevronRight, faClock, faBolt
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
  const { theme } = useThemeStore();
  const { spaces, loading, fetchSpaces, selectSpace } = useSpacesStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleSpaceClick = (space: Space) => {
    selectSpace(space);
    navigate(`/spaces/${space.id}`);
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-pink-500 to-rose-600',
      'from-orange-500 to-red-600',
      'from-green-500 to-teal-600',
    ];
    return gradients[index % gradients.length];
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <Navbar />

      {/* Hero Section */}
      <div className={`pt-24 pb-12 px-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Your Spaces
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Organize your digital space
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Space
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-xl p-6 ${
              isDark ? 'glass-strong' : 'bg-white border border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Total Spaces
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {spaces.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faRocket} className="text-white text-xl" />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-6 ${
              isDark ? 'glass-strong' : 'bg-white border border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Active Today
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    {Math.min(spaces.length, 3)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faBolt} className="text-white text-xl" />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-6 ${
              isDark ? 'glass-strong' : 'bg-white border border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Messages
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                    2.4K
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spaces Grid */}
      <main className="px-6 py-12">
        <div className="max-w-[1600px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : spaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                isDark ? 'glass-strong' : 'bg-white border border-slate-200'
              }`}>
                <FontAwesomeIcon icon={faRocket} className={`text-3xl ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Create your first space
              </h3>
              <p className={`mb-8 max-w-md text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Spaces help you organize projects, teams, or personal work in one place
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all"
              >
                Create Your First Space
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {spaces.map((space, index) => (
                <button
                  key={space.id}
                  onClick={() => handleSpaceClick(space)}
                  className={`group text-left p-6 rounded-2xl transition-all border relative overflow-hidden ${
                    isDark
                      ? 'glass hover:bg-white/10 border-white/10 hover:border-blue-500/50'
                      : 'bg-white hover:shadow-xl border-slate-200 hover:border-blue-500/50'
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all" />
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient(index)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <FontAwesomeIcon 
                          icon={space.icon && iconMap[space.icon] ? iconMap[space.icon] : faRocket} 
                          className="text-white text-xl" 
                        />
                      </div>
                      
                      <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${
                        isDark ? 'glass-strong' : 'bg-slate-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={
                            space.privacy === 'private' ? faLock :
                            space.privacy === 'shared' ? faUsers :
                            space.privacy === 'team' ? faUsers : faGlobe
                          } 
                          className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className={`text-lg font-bold mb-2 group-hover:text-gradient transition-all ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {space.name}
                    </h3>
                    {space.description && (
                      <p className={`text-sm mb-4 line-clamp-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {space.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className={`flex items-center justify-between pt-4 border-t ${
                      isDark ? 'border-white/10' : 'border-slate-200'
                    }`}>
                      <div className={`flex items-center gap-2 text-xs ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <FontAwesomeIcon icon={faClock} />
                        {new Date(space.updated_at).toLocaleDateString()}
                      </div>
                      <FontAwesomeIcon 
                        icon={faChevronRight} 
                        className={`group-hover:text-blue-400 group-hover:translate-x-1 transition-all ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateSpaceModal
  isOpen={modalOpen} 
  onClose={() => setModalOpen(false)} 
/>
    </div>
  );
}
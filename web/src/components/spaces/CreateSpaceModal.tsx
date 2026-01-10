import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faSpinner, faRocket, faLock, faUsers, 
  faBriefcase, faGlobe, faShieldAlt, faUserFriends, faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { useSpacesStore } from '../../store/spacesStore';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPACE_COLORS = [
  { gradient: 'from-blue-500 to-cyan-600', hex: '#3b82f6' },
  { gradient: 'from-purple-500 to-pink-600', hex: '#8b5cf6' },
  { gradient: 'from-rose-500 to-orange-600', hex: '#f43f5e' },
  { gradient: 'from-emerald-500 to-teal-600', hex: '#10b981' },
  { gradient: 'from-amber-500 to-orange-600', hex: '#f59e0b' },
  { gradient: 'from-cyan-500 to-blue-600', hex: '#06b6d4' },
];

const PRIVACY_OPTIONS = [
  { 
    value: 'private', 
    label: 'Private', 
    description: 'Only you can access',
    icon: faLock,
    gradient: 'from-gray-700 to-gray-800'
  },
  { 
    value: 'shared', 
    label: 'Shared', 
    description: 'Invite specific people',
    icon: faUserFriends,
    gradient: 'from-blue-900/50 to-cyan-900/50'
  },
  { 
    value: 'team', 
    label: 'Team', 
    description: 'For team collaboration',
    icon: faBuilding,
    gradient: 'from-purple-900/50 to-pink-900/50'
  },
  { 
    value: 'public', 
    label: 'Public', 
    description: 'Anyone can view',
    icon: faGlobe,
    gradient: 'from-green-900/50 to-emerald-900/50'
  },
];

export function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(SPACE_COLORS[0]);
  const [privacy, setPrivacy] = useState('private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createSpace = useSpacesStore((state) => state.createSpace);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a space name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createSpace({
        name: name.trim(),
        description: description.trim() || undefined,
        privacy: privacy as any,
        color: `linear-gradient(135deg, ${selectedColor.hex} 0%, ${selectedColor.hex}dd 100%)`,
      });

      // Reset and close
      setName('');
      setDescription('');
      setSelectedColor(SPACE_COLORS[0]);
      setPrivacy('private');
      onClose();
    } catch (err: any) {
      console.error('Space creation error:', err);
      setError(err.message || 'Failed to create space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-0.1">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative h-full w-full overflow-y-auto max-w-2xl bg-gradient-to-br from-gray-900/95 via-gray-950/95 to-black/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl shadow-cyan-500/10 animate-scale-in">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-700/10 via-purple-500/20 to-fuchsia-500/20 rounded-3xl blur-xl opacity-30" />
        
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <FontAwesomeIcon icon={faRocket} className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Create New Space
                </h2>
                <p className="text-sm text-gray-400">Your personal digital universe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-all border border-gray-700/50 hover:border-gray-600/50"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Space Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Space"
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all disabled:opacity-50 text-white placeholder-gray-500 group-hover:border-gray-600/50"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Description <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this space for?"
                  rows={3}
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none disabled:opacity-50 text-white placeholder-gray-500 group-hover:border-gray-600/50"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>

            {/* Color Theme */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Color Theme
              </label>
              <div className="grid grid-cols-6 gap-3">
                {SPACE_COLORS.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`relative w-full h-10 aspect-square rounded-xl transition-all ${
                      selectedColor.hex === color.hex 
                        ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-gray-900 scale-110' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${color.gradient} shadow-lg`} />
                    {selectedColor.hex === color.hex && (
                      <div className="absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Privacy Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-30">
                {PRIVACY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacy(option.value)}
                    className={`relative p-4 rounded-xl text-left transition-all overflow-hidden ${
                      privacy === option.value
                        ? 'border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10'
                        : 'border border-gray-700/50 bg-gray-800/20 hover:bg-gray-800/40 hover:border-gray-600/50'
                    }`}
                  >
                    {/* Background gradient on select */}
                    {privacy === option.value && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
                    )}
                    
                    <div className="relative flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center text-white mt-0.5`}>
                        <FontAwesomeIcon icon={option.icon} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold mb-1 ${
                          privacy === option.value ? 'text-cyan-400' : 'text-white'
                        }`}>
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-400">
                          {option.description}
                        </div>
                      </div>
                      {privacy === option.value && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="relative rounded-xl p-4 bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-xl" />
                <p className="relative text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl font-semibold bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600/50 transition-all disabled:opacity-50 text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faRocket} />
                    Create Space
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
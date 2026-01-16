// Create Room Modal - Full-featured room creation with categories
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faHashtag, faLock, faGlobe, faUsers,
  faFileAlt, faPalette, faCog, faStar, faRocket,
  faBriefcase, faLightbulb, faGamepad, faMusic, faCamera,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useCreateRoom } from '../../../hooks/useMessages';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string | undefined;
  categories: Array<{ id: string; name: string; icon: string; color: string; description: string }>;
}

interface RoomFormData {
  name: string;
  description: string;
  category: { id: string; name: string; icon: string; color: string; description: string } | null;
  type: 'text' | 'voice' | 'video';
  isPrivate: boolean;
  isDefault: boolean;
  guidelines: string;
}

const roomTypeIcons = {
  text: faHashtag,
  voice: faUsers,
  video: faCamera
};

const categoryIcons = {
  'General': faHashtag,
  'Meetings': faBriefcase,
  'Projects': faRocket,
  'Ideas': faLightbulb,
  'Gaming': faGamepad,
  'Music': faMusic,
  'Resources': faFileAlt,
  'Announcements': faStar,
  'Custom': faPalette
};

export function CreateRoomModal({ isOpen, onClose, spaceId, categories }: CreateRoomModalProps) {
  const createRoomMutation = useCreateRoom();

  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    description: '',
    category: categories.length > 0 ? categories[0] : null,
    type: 'text',
    isPrivate: false,
    isDefault: false,
    guidelines: ''
  });


  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        category: categories.length > 0 ? categories[0] : null,
        type: 'text',
        isPrivate: false,
        isDefault: false,
        guidelines: ''
      });
    }
  }, [isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId) {
      alert('No space selected. Please navigate to a space first.');
      return;
    }
    if (!formData.name.trim()) return;

    try {
      await createRoomMutation.mutateAsync({
        space_id: spaceId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        category: formData.category?.name || 'General',
        is_private: formData.isPrivate
      });

      onClose();
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faHashtag} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create Room</h2>
                  <p className="text-sm text-gray-400">Set up a new room for your space</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Room Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Room Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/70 focus:ring-1 focus:ring-purple-400/30"
                  placeholder="Enter room name..."
                  required
                />
              </div>

              {/* Room Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/70 focus:ring-1 focus:ring-purple-400/30 min-h-[80px] resize-none"
                  placeholder="Describe what this room is for..."
                  rows={3}
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Category</label>
                <select
                  value={formData.category?.id || ''}
                  onChange={(e) => {
                    const selectedCategory = categories.find(cat => cat.id === e.target.value);
                    setFormData(prev => ({ ...prev, category: selectedCategory || null }));
                  }}
                  className="w-full px-3 py-2 bg-zinc-800/70 border border-zinc-600/50 rounded-lg text-white focus:outline-none focus:border-purple-400/70 focus:ring-1 focus:ring-purple-400/30 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Select a category for this room. Categories help organize your space.
                </p>
              </div>

              {/* Room Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Room Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['text', 'voice', 'video'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.type === type
                          ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                          : 'bg-zinc-800/50 border-zinc-600/50 text-gray-300 hover:bg-zinc-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={roomTypeIcons[type]}
                          className="text-xs"
                        />
                        <span className="text-xs font-medium capitalize">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-white">Settings</label>

                <div className="space-y-3">
                  {/* Private Room */}
                  <label className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faLock} className="text-orange-400 text-sm" />
                      <div>
                        <span className="text-sm text-white font-medium">Private Room</span>
                        <p className="text-xs text-gray-400">Only invited members can access</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500"
                    />
                  </label>

                  {/* Default Room */}
                  <label className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                      <div>
                        <span className="text-sm text-white font-medium">Default Room</span>
                        <p className="text-xs text-gray-400">New members land here first</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-zinc-700/70 hover:bg-zinc-600/70 rounded-lg text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || createRoomMutation.isPending}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors font-medium shadow-lg"
                >
                  {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
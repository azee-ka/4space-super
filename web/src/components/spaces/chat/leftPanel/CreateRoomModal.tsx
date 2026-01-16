// Create Room Modal - Full-featured room creation with categories
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faHashtag, faLock, faUsers,
  faFileAlt, faStar, faRocket,
  faBriefcase, faLightbulb, faCamera, faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useCreateRoom } from '../../../../hooks/useMessages';

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

const categoryTemplates = [
  {
    id: 'meetings',
    name: 'Meetings',
    description: 'Agenda-driven syncs and decision logs.',
    color: 'blue',
    icon: faBriefcase,
    defaults: {
      name: 'Weekly Sync',
      description: 'Weekly team sync and outcomes.',
      type: 'voice' as const,
      guidelines: 'Start on time. Capture decisions.'
    }
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Milestones, blockers, and shipping.',
    color: 'purple',
    icon: faRocket,
    defaults: {
      name: 'Project HQ',
      description: 'Planning, status, and delivery updates.',
      type: 'text' as const,
      guidelines: 'Post updates with owner and next step.'
    }
  },
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'Brainstorms, pitches, and experiments.',
    color: 'teal',
    icon: faLightbulb,
    defaults: {
      name: 'Ideas Vault',
      description: 'Collect, debate, and refine ideas.',
      type: 'text' as const,
      guidelines: 'Add context, then propose next action.'
    }
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Major updates and releases.',
    color: 'amber',
    icon: faStar,
    defaults: {
      name: 'Launch Updates',
      description: 'Key announcements and timelines.',
      type: 'text' as const,
      guidelines: 'Keep updates short and link details.'
    }
  },
  {
    id: 'resources',
    name: 'Resources',
    description: 'Docs, links, and references.',
    color: 'cyan',
    icon: faFileAlt,
    defaults: {
      name: 'Resource Hub',
      description: 'Pinned docs, links, and assets.',
      type: 'text' as const,
      guidelines: 'Organize links with short labels.'
    }
  }
];

export function CreateRoomModal({ isOpen, onClose, spaceId, categories }: CreateRoomModalProps) {
  const createRoomMutation = useCreateRoom();
  const [localCategories, setLocalCategories] = useState(categories);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

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
      setLocalCategories(categories);
      setCustomCategoryName('');
      setSelectedTemplateId(null);
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

  const upsertCategory = (category: { id: string; name: string; icon: string; color: string; description: string }) => {
    setLocalCategories((prev) => {
      const exists = prev.some((item) => item.name === category.name);
      return exists ? prev : [...prev, category];
    });
  };

  const applyTemplate = (template: typeof categoryTemplates[number]) => {
    const existing = localCategories.find((item) => item.name === template.name);
    const category = existing || {
      id: `template-${template.id}`,
      name: template.name,
      icon: 'faHashtag',
      color: template.color,
      description: template.description,
    };

    if (!existing) {
      upsertCategory(category);
    }

    setSelectedTemplateId(template.id);
    setFormData((prev) => ({
      ...prev,
      category,
      name: template.defaults.name,
      description: template.defaults.description,
      type: template.defaults.type,
      guidelines: template.defaults.guidelines,
    }));
  };

  const handleSelectCustomCategory = () => {
    setSelectedTemplateId('custom');
    setFormData((prev) => ({
      ...prev,
      category: null,
      name: prev.name || 'Untitled Room',
    }));
  };

  const handleCreateCustomCategory = () => {
    const name = customCategoryName.trim() || 'Custom';
    const category = {
      id: `custom-${Date.now()}`,
      name,
      icon: 'faHashtag',
      color: 'slate',
      description: 'Custom category.',
    };
    upsertCategory(category);
    setFormData((prev) => ({
      ...prev,
      category,
      name: 'Untitled Room',
    }));
    setCustomCategoryName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId) {
      console.error('No space selected. Please navigate to a space first.');
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
    }
  };


  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-zinc-950/95 via-zinc-900/95 to-black/95 backdrop-blur-xl border border-zinc-700/60 rounded-2xl shadow-2xl shadow-cyan-500/10 max-h-[calc(100vh-6rem)] overflow-y-auto"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-fuchsia-500/15 blur-xl opacity-30" />
              <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <FontAwesomeIcon icon={faHashtag} className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    Create Room
                  </h2>
                  <p className="text-sm text-gray-400">Set up a new room for your space</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 flex items-center justify-center transition-all border border-zinc-700/60 hover:border-zinc-600/60"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
              </button>
            </div>

            {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Room Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Room Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/70 border border-zinc-700/60 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Enter room name..."
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* Room Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Description</label>
                <div className="relative group">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-700/60 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 min-h-[72px] resize-none transition-all"
                    placeholder="Describe what this room is for..."
                    rows={3}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* Category Templates */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Category Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className={`group p-2 rounded-xl border transition-all text-left ${
                        selectedTemplateId === template.id
                          ? 'border-cyan-400/50 bg-cyan-500/10'
                          : 'border-zinc-800/60 bg-zinc-900/70 hover:bg-zinc-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg bg-${template.color}-500/10 flex items-center justify-center`}>
                          <FontAwesomeIcon icon={template.icon} className={`text-${template.color}-400 text-sm`} />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSelectCustomCategory}
                    className={`group p-2 rounded-xl border transition-all text-left ${
                      selectedTemplateId === 'custom'
                        ? 'border-cyan-400/50 bg-cyan-500/10'
                        : 'border-dashed border-zinc-700/70 bg-zinc-900/60 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-zinc-800/70 flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} className="text-gray-300 text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Custom Category</p>
                        <p className="text-xs text-gray-500">Start with an untitled room.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {selectedTemplateId === 'custom' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Custom Category</label>
                  <div className="flex gap-2.5">
                    <div className="relative group flex-1">
                      <input
                        type="text"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-700/60 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
                        placeholder="Custom category name"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateCustomCategory}
                      className="px-4 py-3 rounded-xl border border-zinc-700/60 bg-zinc-900/70 hover:bg-zinc-800/70 text-gray-200 text-sm font-medium transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Creates a category and starts with an untitled room.</p>
                </div>
              )}

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
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                          : 'bg-zinc-900/70 border-zinc-700/60 text-gray-300 hover:bg-zinc-800/60'
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
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Settings</label>

                <div className="space-y-2.5">
                  {/* Private Room */}
                  <label className="flex items-center justify-between p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800/60 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faLock} className="text-orange-400 text-sm" />
                      <div>
                        <span className="text-sm text-white font-medium">Private Room</span>
                        <p className="text-xs text-gray-400">Only invited members can access</p>
                      </div>
                    </div>
                    <span className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPrivate}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <span className="h-5 w-9 rounded-full border border-zinc-700/70 bg-zinc-800/70 transition-all duration-200 ease-out peer-checked:bg-cyan-500/25 peer-checked:border-cyan-400/60 overflow-hidden" />
                      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-zinc-500/80 transition-transform duration-200 ease-out peer-checked:translate-x-4 peer-checked:bg-cyan-400" />
                    </span>
                  </label>

                  {/* Default Room */}
                  <label className="flex items-center justify-between p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800/60 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                      <div>
                        <span className="text-sm text-white font-medium">Default Room</span>
                        <p className="text-xs text-gray-400">New members land here first</p>
                      </div>
                    </div>
                    <span className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <span className="h-5 w-9 rounded-full border border-zinc-700/70 bg-zinc-800/70 transition-all duration-200 ease-out peer-checked:bg-cyan-500/25 peer-checked:border-cyan-400/60 overflow-hidden" />
                      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-zinc-500/80 transition-transform duration-200 ease-out peer-checked:translate-x-4 peer-checked:bg-cyan-400" />
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-zinc-800/70">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 text-gray-300 hover:text-white transition-colors font-medium border border-zinc-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || createRoomMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:from-cyan-500/40 disabled:to-blue-600/40 disabled:cursor-not-allowed transition-all"
                >
                  {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

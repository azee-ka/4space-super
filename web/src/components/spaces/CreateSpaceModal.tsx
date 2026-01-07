import React, { useState } from 'react';
import { useSpacesStore } from '../../store/spacesStore';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPACE_COLORS = [
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be123c 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
];

const PRIVACY_OPTIONS = [
  { value: 'private', label: 'Private', description: 'Only you can access' },
  { value: 'shared', label: 'Shared', description: 'Invite specific people' },
  { value: 'team', label: 'Team', description: 'For team collaboration' },
  { value: 'public', label: 'Public', description: 'Anyone can view' },
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
        type: 'custom',
        privacy: privacy as any,
        color: selectedColor,
      });

      // Reset and close
      setName('');
      setDescription('');
      setSelectedColor(SPACE_COLORS[0]);
      setPrivacy('private');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create space');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-strong rounded-2xl p-8 border border-white/20 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Space</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Space Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Space"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this space for?"
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-3">Color Theme</label>
            <div className="grid grid-cols-6 gap-3">
              {SPACE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-xl transition-all ${
                    selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium mb-3">Privacy</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRIVACY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrivacy(option.value)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    privacy === option.value
                      ? 'glass-strong border-2 border-blue-500'
                      : 'glass border border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className="text-sm text-slate-400">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="glass-strong rounded-xl p-4 border border-red-500/20 bg-red-500/10">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 glass-strong py-3 rounded-xl font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 gradient-primary py-3 rounded-xl font-semibold text-white glow hover:glow-strong transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Space'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
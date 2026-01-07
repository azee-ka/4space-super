import React, { useState } from 'react';
import { useSpacesStore } from '../../store/spacesStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPACE_TEMPLATES = [
  { type: 'personal', icon: '🔒', name: 'Personal', color: '#6366f1', description: 'Private notes and thoughts' },
  { type: 'couple', icon: '❤️', name: 'Couple', color: '#ec4899', description: 'Share with your partner' },
  { type: 'team', icon: '👔', name: 'Team', color: '#8b5cf6', description: 'Collaborate with colleagues' },
  { type: 'portfolio', icon: '💼', name: 'Portfolio', color: '#06b6d4', description: 'Showcase your work' },
  { type: 'community', icon: '🌍', name: 'Community', color: '#10b981', description: 'Public community space' },
  { type: 'custom', icon: '✨', name: 'Custom', color: '#f59e0b', description: 'Build from scratch' },
];

const PRIVACY_OPTIONS = [
  { value: 'private', label: 'Private', icon: '🔒', description: 'Only you can access' },
  { value: 'shared', label: 'Shared', icon: '👥', description: 'Invite specific people' },
  { value: 'team', label: 'Team', icon: '👔', description: 'For your team members' },
  { value: 'public', label: 'Public', icon: '🌍', description: 'Anyone can view' },
];

export function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(SPACE_TEMPLATES[5]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createSpace } = useSpacesStore();

  const handleReset = () => {
    setStep(1);
    setSelectedTemplate(SPACE_TEMPLATES[5]);
    setName('');
    setDescription('');
    setPrivacy('private');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCreate = async () => {
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
        type: selectedTemplate.type as any,
        privacy: privacy as any,
        icon: selectedTemplate.icon,
        color: selectedTemplate.color,
      });

      handleClose();
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
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass rounded-3xl shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Space
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Step {step} of 3
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Choose Template */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose a template
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPACE_TEMPLATES.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => setSelectedTemplate(template)}
                    className={`
                      p-4 rounded-2xl text-left transition-all duration-200
                      ${selectedTemplate.type === template.type
                        ? 'ring-2 ring-primary-500 shadow-lg scale-105'
                        : 'glass hover:shadow-lg hover:scale-105'
                      }
                    `}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 shadow-lg"
                      style={{ background: template.color }}
                    >
                      {template.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="animate-fade-in space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Space details
              </h3>
              
              <Input
                label="Space Name"
                placeholder="My Awesome Space"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={error && !name.trim() ? error : undefined}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
              />

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this space for?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl glass text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                />
              </div>

              {/* Icon & Color Preview */}
              <div className="glass rounded-2xl p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Preview
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ background: selectedTemplate.color }}
                  >
                    {selectedTemplate.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {name || 'Space Name'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {description || 'No description'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Privacy */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Who can access this space?
              </h3>
              <div className="space-y-3">
                {PRIVACY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPrivacy(option.value)}
                    className={`
                      w-full p-4 rounded-2xl text-left transition-all duration-200 flex items-start gap-4
                      ${privacy === option.value
                        ? 'ring-2 ring-primary-500 shadow-lg'
                        : 'glass hover:shadow-lg'
                      }
                    `}
                  >
                    <div className="text-3xl flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </h4>
                        {privacy === option.value && (
                          <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && step === 3 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && !name.trim()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                loading={loading}
                disabled={!name.trim()}
              >
                Create Space
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
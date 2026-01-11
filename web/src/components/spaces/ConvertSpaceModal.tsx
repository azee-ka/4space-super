// web/src/components/spaces/ConvertSpaceModal.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faExclamationTriangle, faLock, faUsers, faBuilding,
  faArrowRight, faCheck, faSpinner, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { useConvertSpacePrivacy } from '../../hooks/useSpaces';

interface ConvertSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  currentPrivacy: 'private' | 'shared' | 'team' | 'public';
  targetPrivacy: 'private' | 'shared' | 'team' | 'public';
  onSuccess: () => void;
}

const PRIVACY_INFO = {
  private: {
    icon: faLock,
    color: 'from-gray-500 to-gray-700',
    title: 'Private',
    description: 'Only you can access this space',
    warning: 'All invited members will lose access'
  },
  shared: {
    icon: faUsers,
    color: 'from-blue-500 to-cyan-600',
    title: 'Shared',
    description: 'Invite specific people to collaborate',
    warning: 'You will be able to invite members'
  },
  team: {
    icon: faBuilding,
    color: 'from-purple-500 to-pink-600',
    title: 'Team',
    description: 'For team collaboration with multiple members',
    warning: 'Team members can invite others'
  },
  public: {
    icon: faShieldAlt,
    color: 'from-green-500 to-emerald-600',
    title: 'Public',
    description: 'Anyone can view this space',
    warning: 'Space will be visible to everyone'
  }
};

export function ConvertSpaceModal({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  currentPrivacy,
  targetPrivacy,
  onSuccess
}: ConvertSpaceModalProps) {
  const convertMutation = useConvertSpacePrivacy();

  const currentInfo = PRIVACY_INFO[currentPrivacy];
  const targetInfo = PRIVACY_INFO[targetPrivacy];
  const isConvertingToPrivate = targetPrivacy === 'private';

  const handleConvert = async () => {
    try {
      await convertMutation.mutateAsync({
        spaceId,
        targetPrivacy
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error converting space:', err);
      // Error is already handled by mutation state
    }
  };

  if (!isOpen) return null;

  const isLoading = convertMutation.isPending;
  const error = convertMutation.error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900/95 via-gray-950/95 to-black/95 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl animate-scale-in overflow-hidden">
        {/* Glow effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${
          isConvertingToPrivate 
            ? 'from-red-500/20 via-orange-500/20 to-yellow-500/20'
            : 'from-cyan-500/20 via-blue-500/20 to-purple-500/20'
        } rounded-3xl blur-xl opacity-50`} />
        
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                  isConvertingToPrivate ? 'from-orange-500 to-red-600' : 'from-cyan-500 to-blue-600'
                } flex items-center justify-center shadow-lg`}>
                  <FontAwesomeIcon 
                    icon={faExclamationTriangle} 
                    className="text-white text-xl" 
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Convert Space
                  </h2>
                  <p className="text-sm text-gray-400">Change privacy settings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-all border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Space Name */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">
                {spaceName}
              </h3>
              <p className="text-sm text-gray-400">
                You're about to change the privacy of this space
              </p>
            </div>

            {/* Conversion Visualization */}
            <div className="flex items-center justify-center gap-4">
              {/* Current Privacy */}
              <div className="flex-1 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-center">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentInfo.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <FontAwesomeIcon icon={currentInfo.icon} className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-white mb-1">{currentInfo.title}</h4>
                <p className="text-xs text-gray-400">{currentInfo.description}</p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <FontAwesomeIcon 
                  icon={faArrowRight} 
                  className="text-cyan-400 text-2xl" 
                />
              </div>

              {/* Target Privacy */}
              <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/50 text-center">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${targetInfo.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <FontAwesomeIcon icon={targetInfo.icon} className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-cyan-400 mb-1">{targetInfo.title}</h4>
                <p className="text-xs text-gray-400">{targetInfo.description}</p>
              </div>
            </div>

            {/* Warning */}
            <div className={`p-4 rounded-xl border ${
              isConvertingToPrivate
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className="flex items-start gap-3">
                <FontAwesomeIcon 
                  icon={faExclamationTriangle} 
                  className={`${
                    isConvertingToPrivate ? 'text-red-400' : 'text-blue-400'
                  } text-lg mt-0.5 flex-shrink-0`}
                />
                <div>
                  <h4 className={`font-bold mb-1 ${
                    isConvertingToPrivate ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {isConvertingToPrivate ? 'Warning' : 'Important'}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {targetInfo.warning}
                  </p>
                  {isConvertingToPrivate && (
                    <p className="text-sm text-red-400 mt-2 font-semibold">
                      This action will remove all members except you!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">
                  {error instanceof Error ? error.message : 'Failed to convert space'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700/50 flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-xl font-semibold bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600/50 transition-all disabled:opacity-50 text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isConvertingToPrivate
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-red-500/30 hover:shadow-red-500/50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:shadow-cyan-500/50'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Converting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCheck} />
                  Convert to {targetInfo.title}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
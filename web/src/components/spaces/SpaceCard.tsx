import React from 'react';
import type { Space } from '@4space/shared';

interface SpaceCardProps {
  space: Space;
  onClick: () => void;
}

export function SpaceCard({ space, onClick }: SpaceCardProps) {
  const getSpaceIcon = () => {
    if (space.icon) return space.icon;
    
    switch (space.privacy) {
      case 'public':
        return '🌍';
      case 'shared':
        return '👥';
      case 'team':
        return '👔';
      default:
        return '🔒';
    }
  };

  const getPrivacyBadge = () => {
    const badges = {
      private: { label: 'Private', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
      shared: { label: 'Shared', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      team: { label: 'Team', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
      public: { label: 'Public', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      unlisted: { label: 'Unlisted', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    };

    const badge = badges[space.privacy as keyof typeof badges] || badges.private;
    
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className="w-full group relative overflow-hidden rounded-2xl glass hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/10 group-hover:to-primary-600/10 transition-all duration-300" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ring-2 ring-white/20 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300"
            style={{
              background: space.color || 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)'
            }}
          >
            {getSpaceIcon()}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {getPrivacyBadge()}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(space.updated_at || space.created_at)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
            {space.name}
          </h3>
          
          {space.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
              {space.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-white/5">
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>{Math.floor(Math.random() * 50)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>{Math.floor(Math.random() * 20)}</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </button>
  );
}
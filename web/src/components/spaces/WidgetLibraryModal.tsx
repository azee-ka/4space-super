// web/src/components/modals/WidgetLibraryModal.tsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faCheckCircle, faComments, faFolder, faFileAlt,
  faCalendar, faChartBar, faImage, faVideo, faMicrophone,
  faPoll, faLink, faCode, faSearch, faFilter, faCircle,
  faLayerGroup, faStar, faPlus, faMinus
} from '@fortawesome/free-solid-svg-icons';

interface Widget {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  category: 'communication' | 'productivity' | 'content' | 'collaboration';
}

interface WidgetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: string[];
  onToggleWidget: (widgetId: string) => void;
  availableWidgets: Widget[];
}

const CATEGORIES = [
  { id: 'all' as const, label: 'All Widgets', color: 'from-white to-gray-300', icon: faLayerGroup },
  { id: 'communication' as const, label: 'Communication', color: 'from-blue-500 to-cyan-600', icon: faComments },
  { id: 'productivity' as const, label: 'Productivity', color: 'from-purple-500 to-fuchsia-600', icon: faCheckCircle },
  { id: 'content' as const, label: 'Content', color: 'from-green-500 to-emerald-600', icon: faFolder },
  { id: 'collaboration' as const, label: 'Collaboration', color: 'from-orange-500 to-red-600', icon: faLayerGroup },
];

export function WidgetLibraryModal({
  isOpen,
  onClose,
  activeWidgets,
  onToggleWidget,
  availableWidgets,
}: WidgetLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'communication' | 'productivity' | 'content' | 'collaboration'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  if (!isOpen) return null;

  const filteredWidgets = availableWidgets.filter(widget => {
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesSearch = searchQuery === '' || widget.name.toLowerCase().includes(searchQuery.toLowerCase()) || widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl bg-black rounded-3xl border border-white/[0.05] shadow-2xl animate-scale-in overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
          
          <div className="relative p-6 border-b border-white/[0.05]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Widget Library</h2>
                  <p className="text-sm text-gray-400">Customize your space with powerful widgets</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/70 border border-white/[0.05] flex items-center justify-center transition-all text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900/50 backdrop-blur-sm text-white placeholder-gray-500 text-sm outline-none focus:bg-zinc-900/70 transition-all border border-white/[0.05]"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" 
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-white/10 text-white border border-cyan-500/30'
                        : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-900/70 border border-white/[0.05]'
                    }`}
                  >
                    <FontAwesomeIcon icon={cat.icon} className="text-xs" />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {filteredWidgets.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900/50 flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faSearch} className="text-3xl text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No widgets found</h3>
                <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWidgets.map((widget) => {
                const isActive = activeWidgets.includes(widget.id);
                return (
                  <button
                    key={widget.id}
                    onClick={() => onToggleWidget(widget.id)}
                    className={`group relative text-left p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30'
                        : 'bg-zinc-900/50 hover:bg-zinc-900/70 border border-white/[0.05]'
                    }`}
                  >
                    {/* Widget Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${widget.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                        <FontAwesomeIcon icon={widget.icon} className="text-white text-xl" />
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30' 
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <FontAwesomeIcon 
                          icon={isActive ? faCheckCircle : faPlus} 
                          className={`text-xs ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
                        />
                      </div>
                    </div>

                    {/* Widget Info */}
                    <h3 className={`text-sm font-bold mb-1.5 transition-colors duration-300 ${
                      isActive ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'
                    }`}>
                      {widget.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                      {widget.description}
                    </p>

                    {/* Category Tag */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-500 capitalize">{widget.category}</span>
                      {isActive && (
                        <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className={`absolute inset-0 bg-gradient-to-br ${isActive ? 'from-cyan-500/5 to-purple-500/5' : 'from-white/5 to-white/0'} rounded-2xl`} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWidgets.map((widget) => {
                const isActive = activeWidgets.includes(widget.id);
                return (
                  <button
                    key={widget.id}
                    onClick={() => onToggleWidget(widget.id)}
                    className={`group w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30'
                        : 'bg-zinc-900/50 hover:bg-zinc-900/70 border border-white/[0.05]'
                    }`}
                  >
                    {/* Widget Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${widget.color} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <FontAwesomeIcon icon={widget.icon} className="text-white text-lg" />
                    </div>

                    {/* Widget Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-bold mb-1 ${
                        isActive ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'
                      } transition-colors duration-300`}>
                        {widget.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {widget.description}
                      </p>
                    </div>

                    {/* Category & Status */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 capitalize">{widget.category}</span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive 
                          ? 'bg-gradient-to-br from-cyan-500 to-purple-600' 
                          : 'bg-white/5 group-hover:bg-white/10'
                      } transition-all duration-300`}>
                        <FontAwesomeIcon 
                          icon={isActive ? faCheckCircle : faPlus} 
                          className={`text-xs ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent" />
          
          <div className="relative p-6 border-t border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Selected Count */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 border border-white/[0.05]">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse" />
                <p className="text-sm">
                  <span className="font-bold text-white">{activeWidgets.length}</span>
                  <span className="text-gray-400"> widget{activeWidgets.length !== 1 ? 's' : ''} selected</span>
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/50 border border-white/[0.05]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'compact'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/70 border border-white/[0.05] text-white font-medium transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold transition-all text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
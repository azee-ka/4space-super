// Borderless Shadow-Based Room List - Matching Spaces/SpaceView Design
// web/src/components/spaces/chat/RoomList.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHashtag, faLock, faPlus, faSearch, faFilter,
  faChevronDown, faVolumeUp, faVideo, faCog
} from '@fortawesome/free-solid-svg-icons';
import type { Room } from '@4space/shared/src/services/messages.service';

interface RoomsListProps {
  rooms: Room[];
  selectedRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom?: () => void;
  isLoading?: boolean;
  onlineUsers?: Map<string, any>;
  filterUnread?: boolean; 
  onFilterChange?: (value: boolean) => void;
}

export function RoomsList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onCreateRoom,
  isLoading,
  onlineUsers = new Map(),
  filterUnread = false, // Add this with default
  onFilterChange, // Add this
}: RoomsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Group rooms by category
  const groupedRooms = rooms.reduce((acc, room) => {
    const category = room.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
      expandedCategories[category] = true;
    }
    acc[category].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  // Filter rooms
  const filteredRooms = (categoryRooms: Room[]) => 
    categoryRooms.filter(room => {
      const matchesSearch = !searchQuery || 
        room.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnread = !filterUnread || (room.unread_count && room.unread_count > 0);
      return matchesSearch && matchesUnread;
    });

  const getRoomIcon = (room: Room) => {
    if (room.type === 'voice') return faVolumeUp;
    if (room.type === 'video') return faVideo;
    if (room.is_private) return faLock;
    return faHashtag;
  };

  const getRoomColor = (room: Room) => {
    if (room.type === 'voice') return 'blue';
    if (room.type === 'video') return 'red';
    if (room.is_private) return 'purple';
    return 'cyan';
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-4">
          <FontAwesomeIcon icon={faHashtag} className="text-2xl text-cyan-400" />
        </div>
        <p className="text-gray-400 text-sm mb-4">No rooms yet</p>
        {onCreateRoom && (
          <button
            onClick={onCreateRoom}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium transition-colors"
          >
            Create Room
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search & Create */}
      <div className="flex-shrink-0 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-sm pointer-events-none" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/50 focus:bg-zinc-800/70 outline-none transition-colors text-white placeholder-gray-500 text-sm"
            />
          </div>
          
          {onCreateRoom && (
            <button
              onClick={onCreateRoom}
              className="w-10 h-10 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="text-cyan-400 text-sm" />
            </button>
          )}
        </div>

      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        {Object.entries(groupedRooms).map(([category, categoryRooms]) => {
          const filtered = filteredRooms(categoryRooms);
          const isExpanded = expandedCategories[category] !== false;
          
          if (filtered.length === 0) return null;

          return (
            <div key={category} className="mb-4">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-300 uppercase tracking-wider transition-colors mb-2"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                </motion.div>
                <span className="flex-1 text-left">{category}</span>
                <span className="px-2 py-0.5 rounded-lg bg-zinc-700/50 text-gray-400 text-[10px] font-bold">
                  {filtered.length}
                </span>
              </button>

              {/* Room Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {filtered.map((room) => {
                      const isSelected = selectedRoomId === room.id;
                      const color = getRoomColor(room);
                      
                      return (
                        <motion.button
                          key={room.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelectRoom(room.id)}
                          className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                            isSelected 
                              ? `bg-${color}-500/10` 
                              : 'bg-zinc-800/30 hover:bg-zinc-800/50'
                          }`}
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center flex-shrink-0`}>
                            <FontAwesomeIcon 
                              icon={getRoomIcon(room)} 
                              className={`text-sm text-${color}-400`} 
                            />
                          </div>
                          
                          {/* Room Info */}
                          <div className="flex-1 min-w-0 flex flex-col items-start justify-flex-start">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-sm font-medium truncate ${
                                isSelected ? 'text-white' : 'text-gray-300'
                              }`}>
                                {room.name}
                              </span>
                              
                              {room.unread_count && room.unread_count > 0 && (
                                <span className="px-1.5 py-0.5 rounded-lg bg-cyan-500 text-white text-[10px] font-bold min-w-[20px] text-center">
                                  {room.unread_count > 99 ? '99+' : room.unread_count}
                                </span>
                              )}
                            </div>
                            
                            {room.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {room.description}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
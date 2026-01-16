// Room Metadata Tab - Complete room information and management
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar, faUsers, faHashtag, faEdit,
  faShieldAlt, faFileAlt, faLink, faChartLine, faComments
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import type { Room } from '@4space/shared/src/services/messages.service';

interface RoomMetadataTabProps {
  room: Room | undefined;
  memberCount: number;
  messageCount: number;
  onUpdateRoom: (updates: Partial<Room>) => void;
}

export function RoomMetadataTab({ room, memberCount, messageCount, onUpdateRoom }: RoomMetadataTabProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState(room?.name || '');
  const [editedDescription, setEditedDescription] = useState(room?.description || '');

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No room selected</p>
      </div>
    );
  }

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateRoom({ name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSaveDescription = () => {
    onUpdateRoom({ description: editedDescription.trim() });
    setIsEditingDescription(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Room Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faHashtag} className="text-purple-400 text-sm" />
              </div>
              <h3 className="text-sm font-bold text-white">Room Name</h3>
            </div>
            {!isEditingName && (
              <button
                onClick={() => {
                  setEditedName(room.name);
                  setIsEditingName(true);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            )}
          </div>
          {isEditingName ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/70 focus:ring-1 focus:ring-purple-400/30 placeholder-gray-500"
                placeholder="Enter room name..."
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2 bg-zinc-700/70 hover:bg-zinc-600/70 rounded-lg transition-colors text-gray-300 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors text-white text-sm font-medium shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
              <p className="text-white font-medium text-lg">{room.name}</p>
            </div>
          )}
        </motion.div>

        {/* Room Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faFileAlt} className="text-cyan-400 text-sm" />
              </div>
              <h3 className="text-sm font-bold text-white">Description</h3>
            </div>
            {!isEditingDescription && (
              <button
                onClick={() => {
                  setEditedDescription(room.description || '');
                  setIsEditingDescription(true);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            )}
          </div>
          {isEditingDescription ? (
            <div className="space-y-3">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/30 placeholder-gray-500 min-h-[100px] resize-none"
                placeholder="Describe what this room is about..."
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditingDescription(false)}
                  className="px-4 py-2 bg-zinc-700/70 hover:bg-zinc-600/70 rounded-lg transition-colors text-gray-300 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors text-white text-sm font-medium shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
              <p className="text-gray-300 text-sm leading-relaxed">
                {room.description || 'No description set. Click the edit button to add one.'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Room Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-green-400 text-sm" />
            </div>
            <h3 className="text-sm font-bold text-white">Room Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-purple-400 text-xs" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Members</span>
              </div>
              <p className="text-2xl font-bold text-white">{memberCount}</p>
              <p className="text-xs text-purple-400 mt-1">Active participants</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faComments} className="text-cyan-400 text-xs" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Messages</span>
              </div>
              <p className="text-2xl font-bold text-white">{messageCount.toLocaleString()}</p>
              <p className="text-xs text-cyan-400 mt-1">Total conversations</p>
            </div>
          </div>
        </motion.div>

        {/* Room Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendar} className="text-yellow-400 text-sm" />
            </div>
            <h3 className="text-sm font-bold text-white">Room Information</h3>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="text-yellow-400 text-xs" />
                <div>
                  <span className="text-gray-400 block">Created</span>
                  <span className="text-white font-medium">{formatDate(room.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHashtag} className="text-blue-400 text-xs" />
                <div>
                  <span className="text-gray-400 block">Type</span>
                  <span className="text-white font-medium capitalize">{room.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldAlt} className="text-purple-400 text-xs" />
                <div>
                  <span className="text-gray-400 block">Privacy</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${room.is_private ? 'text-red-400' : 'text-green-400'}`}>
                      {room.is_private ? 'Private' : 'Public'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-cyan-400 text-xs" />
                <div>
                  <span className="text-gray-400 block">Category</span>
                  <span className="text-white font-medium">{room.category || 'General'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Room Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldAlt} className="text-orange-400 text-sm" />
            </div>
            <h3 className="text-sm font-bold text-white">Room Guidelines</h3>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-orange-400 text-xs mt-0.5">•</span>
                <span>Be respectful to all members</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 text-xs mt-0.5">•</span>
                <span>Stay on topic with discussions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 text-xs mt-0.5">•</span>
                <span>No spam or self-promotion</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 text-xs mt-0.5">•</span>
                <span>Use appropriate language</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-600/30">
              <p className="text-xs text-gray-500 text-center">Default community guidelines</p>
            </div>
          </div>
        </motion.div>

        {/* Room Resources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faLink} className="text-blue-400 text-sm" />
            </div>
            <h3 className="text-sm font-bold text-white">Room Resources</h3>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30 text-center">
            <FontAwesomeIcon icon={faLink} className="text-gray-600 text-lg mb-2" />
            <p className="text-gray-500 text-sm mb-1">No resources added yet</p>
            <p className="text-gray-600 text-xs">Pinned links and important files will appear here</p>
            <button className="mt-3 w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors font-medium">
              + Add Resource
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

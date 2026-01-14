// Room Metadata Tab - Complete room information and management
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar, faUser, faUsers, faHashtag, faEdit, faCheck, faTimes,
  faShieldAlt, faFileAlt, faLink, faChartLine, faClock, faComments
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
  const [isEditingGuidelines, setIsEditingGuidelines] = useState(false);
  const [editedName, setEditedName] = useState(room?.name || '');
  const [editedDescription, setEditedDescription] = useState(room?.description || '');
  const [editedGuidelines, setEditedGuidelines] = useState('');

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faHashtag} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Room Name</h3>
            </div>
            {!isEditingName && (
              <button
                onClick={() => {
                  setEditedName(room.name);
                  setIsEditingName(true);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            )}
          </div>
          {isEditingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
              </button>
            </div>
          ) : (
            <p className="text-white font-medium">{room.name}</p>
          )}
        </motion.div>

        {/* Room Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} className="text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Description</h3>
            </div>
            {!isEditingDescription && (
              <button
                onClick={() => {
                  setEditedDescription(room.description || '');
                  setIsEditingDescription(true);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            )}
          </div>
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 min-h-[80px]"
                placeholder="Add a description..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors text-white text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDescription(false)}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm">
              {room.description || 'No description set'}
            </p>
          )}
        </motion.div>

        {/* Room Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
            <h3 className="text-sm font-bold text-white">Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUsers} className="text-purple-400 text-xs" />
                <span className="text-xs text-gray-400">Members</span>
              </div>
              <p className="text-xl font-bold text-white">{memberCount}</p>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faComments} className="text-cyan-400 text-xs" />
                <span className="text-xs text-gray-400">Messages</span>
              </div>
              <p className="text-xl font-bold text-white">{messageCount}</p>
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
            <FontAwesomeIcon icon={faCalendar} className="text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Room Information</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">Created</span>
              <span className="text-xs text-white text-right">{formatDate(room.created_at)}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">Type</span>
              <span className="text-xs text-white capitalize">{room.type}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">Category</span>
              <span className="text-xs text-white">{room.category || 'General'}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">Privacy</span>
              <span className={`text-xs ${room.is_private ? 'text-red-400' : 'text-green-400'}`}>
                {room.is_private ? 'Private' : 'Public'}
              </span>
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} className="text-orange-400" />
              <h3 className="text-sm font-bold text-white">Room Guidelines</h3>
            </div>
            {!isEditingGuidelines && (
              <button
                onClick={() => setIsEditingGuidelines(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            )}
          </div>
          {isEditingGuidelines ? (
            <div className="space-y-2">
              <textarea
                value={editedGuidelines}
                onChange={(e) => setEditedGuidelines(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 min-h-[120px]"
                placeholder="Add room guidelines (Markdown supported)..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingGuidelines(false)}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors text-white text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingGuidelines(false)}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 text-sm">
              <p>• Be respectful to all members</p>
              <p>• Stay on topic</p>
              <p>• No spam or self-promotion</p>
              <p className="text-xs text-gray-500 mt-2">Click edit to customize guidelines</p>
            </div>
          )}
        </motion.div>

        {/* Room Resources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faLink} className="text-blue-400" />
            <h3 className="text-sm font-bold text-white">Room Resources</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">Pinned links and important files</p>
          <button className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors">
            + Add Resource
          </button>
        </motion.div>
      </div>
    </div>
  );
}

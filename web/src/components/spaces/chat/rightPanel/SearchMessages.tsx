// Search Messages Component
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faFilter, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchMessagesProps {
  roomId?: string;
  onClose: () => void;
}

export function SearchMessages({ roomId, onClose }: SearchMessagesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [senderFilter, setSenderFilter] = useState('all');

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching for:', searchQuery);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
          </button>
          <h2 className="text-lg font-bold text-white">Search Messages</h2>
        </div>

        {/* Search Input */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            autoFocus
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showFilters
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800'
          }`}
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2" />
          Filters
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-zinc-800/50 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Date Filter */}
              <div>
                <label className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} />
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Sender Filter */}
              <div>
                <label className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} />
                  From User
                </label>
                <select
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                >
                  <option value="all">All Users</option>
                  {/* Add user options dynamically */}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          <div className="space-y-2">
            {/* Mock search results */}
            <div className="text-center text-gray-400 text-sm py-8">
              Search results will appear here
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FontAwesomeIcon icon={faSearch} className="text-6xl text-gray-700 mb-4" />
            <p className="text-gray-400">Type to search messages</p>
            <p className="text-xs text-gray-600 mt-2">Search by keywords, user, or date</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

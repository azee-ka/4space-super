import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { useSearchMessages } from '../../../../hooks/useMessages';
import type { Message } from '@4space/shared/src/services/messages.service';

interface RoomSearchPanelProps {
  roomId?: string;
  onScrollToMessage?: (messageId: string) => void;
}

export function RoomSearchPanel({ roomId, onScrollToMessage }: RoomSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [senderFilter, setSenderFilter] = useState('all');
  const { data: results = [], isLoading } = useSearchMessages(roomId, query.trim());

  const filteredResults = results.filter((message: Message) => {
    if (senderFilter !== 'all' && message.sender_id !== senderFilter) return false;
    if (dateFilter === 'today') {
      const messageDate = new Date(message.created_at);
      const today = new Date();
      return messageDate.toDateString() === today.toDateString();
    }
    if (dateFilter === 'week') {
      const messageDate = new Date(message.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return messageDate >= weekAgo;
    }
    if (dateFilter === 'month') {
      const messageDate = new Date(message.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return messageDate >= monthAgo;
    }
    return true;
  });

  const uniqueSenders = Array.from(
    new Map(results.map((message) => [message.sender_id, message.sender])).values()
  ).filter(Boolean);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faSearch} className="text-cyan-400 text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Search Messages</h3>
          <p className="text-xs text-gray-500">Find anything inside this room</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-800/70 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            showFilters
              ? 'bg-cyan-600 text-white'
              : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-800'
          }`}
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2" />
          Filters
        </button>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} />
                Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/70 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} />
                Sender
              </label>
              <select
                value={senderFilter}
                onChange={(e) => setSenderFilter(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800/70 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
              >
                <option value="all">All users</option>
                {uniqueSenders.map((sender: any) => (
                  <option key={sender.id} value={sender.id}>
                    {sender.display_name || sender.username || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {isLoading && (
          <div className="text-xs text-gray-500 text-center py-6">Searching…</div>
        )}

        {!isLoading && query.trim().length === 0 && (
          <div className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-xs text-gray-500">
            Start typing to search in this room.
          </div>
        )}

        {!isLoading && query.trim().length > 0 && filteredResults.length === 0 && (
          <div className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-xs text-gray-500">
            No matches found. Try a different keyword.
          </div>
        )}

        {!isLoading && filteredResults.length > 0 && (
          <div className="space-y-2">
            {filteredResults.map((message) => (
              <button
                key={message.id}
                onClick={() => onScrollToMessage?.(message.id)}
                className="w-full text-left p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {message.sender?.avatar_url ? (
                    <img
                      src={message.sender.avatar_url}
                      alt={message.sender.display_name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-700/80 flex items-center justify-center text-xs font-semibold text-gray-300">
                      {(message.sender?.display_name || message.sender?.username || 'U')[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-medium truncate">
                        {message.sender?.display_name || message.sender?.username || 'Unknown'}
                      </p>
                      <span className="text-[11px] text-gray-500">{formatDate(message.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

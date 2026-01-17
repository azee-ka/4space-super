import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faUser, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import type { Message } from '@4space/shared/src/services/messages.service';

interface PinnedMessagesPanelProps {
  pinnedMessages: Message[];
  onUnpin: (messageId: string) => void;
  onScrollToMessage: (messageId: string) => void;
}

export function PinnedMessagesPanel({
  pinnedMessages,
  onUnpin,
  onScrollToMessage,
}: PinnedMessagesPanelProps) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const pinnedDate = new Date(date);
    const diffMs = now.getTime() - pinnedDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatPinDuration = (pinnedUntil?: string | null) => {
    if (!pinnedUntil) return 'Permanent';
    const now = new Date();
    const untilDate = new Date(pinnedUntil);
    const diffMs = untilDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m left`;
    if (diffHours < 24) return `${diffHours}h left`;
    return `${diffDays}d left`;
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faThumbtack} className="text-yellow-400 text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Pinned Messages</h3>
          <p className="text-xs text-gray-500">{pinnedMessages.length} pinned in this room</p>
        </div>
      </div>

      {pinnedMessages.length > 0 ? (
        <div className="space-y-2">
          {pinnedMessages.map((message) => (
            <div
              key={message.id}
              className="p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => onScrollToMessage(message.id)}
                  className="flex items-start gap-3 text-left flex-1"
                >
                  {message.sender?.avatar_url ? (
                    <img
                      src={message.sender.avatar_url}
                      alt={message.sender.display_name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-700/80 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {message.sender?.display_name || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-yellow-400/80 flex-shrink-0">
                        <FontAwesomeIcon icon={faThumbtack} className="text-xs" />
                        <span className="whitespace-nowrap">{formatPinDuration(message.pinned_until)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-2 mb-1">
                      {message.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="whitespace-nowrap">{formatDate(message.created_at)}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{formatTimeAgo(message.pinned_at || message.created_at)}</span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => onUnpin(message.id)}
                  className="px-2 py-1 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-[11px] transition-all"
                >
                  Unpin
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-xs text-gray-500">
          Pin messages to keep important details here.
        </div>
      )}
    </div>
  );
}

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import type { Message } from '@4space/shared/src/services/messages.service';

interface KeptMessagesPanelProps {
  keptMessages: Message[];
  onUnkeep: (messageId: string) => void;
  onScrollToMessage: (messageId: string) => void;
}

export function KeptMessagesPanel({
  keptMessages,
  onUnkeep,
  onScrollToMessage,
}: KeptMessagesPanelProps) {
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
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faBookmark} className="text-emerald-400 text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Kept Messages</h3>
          <p className="text-xs text-gray-500">{keptMessages.length} kept in this room</p>
        </div>
      </div>

      {keptMessages.length > 0 ? (
        <div className="space-y-2">
          {keptMessages.map((message) => (
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
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-700/80 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white text-xs" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {message.sender?.display_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendar} />
                      {formatDate(message.created_at)}
                    </p>
                    <p className="text-xs text-gray-300 mt-2 line-clamp-3">
                      {message.content}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => onUnkeep(message.id)}
                  className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] transition-all"
                >
                  Unkeep
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-xs text-gray-500">
          Keep messages to remember important details here.
        </div>
      )}
    </div>
  );
}
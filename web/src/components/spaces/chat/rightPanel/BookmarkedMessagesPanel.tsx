import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { useBookmarkedMessages, useRemoveBookmark } from '../../../../hooks/useMessages';
import type { Message } from '@4space/shared/src/services/messages.service';

interface BookmarkedMessagesPanelProps {
  spaceId?: string;
  roomId?: string;
  onScrollToMessage?: (messageId: string) => void;
}

export function BookmarkedMessagesPanel({
  spaceId,
  roomId,
  onScrollToMessage,
}: BookmarkedMessagesPanelProps) {
  const { data: bookmarkedMessages = [] } = useBookmarkedMessages(spaceId);
  const removeBookmark = useRemoveBookmark();

  const roomBookmarks = roomId
    ? bookmarkedMessages.filter((message: Message) => message.room_id === roomId)
    : [];

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
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faBookmark} className="text-amber-400 text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Saved Messages</h3>
          <p className="text-xs text-gray-500">Your personal highlights</p>
        </div>
      </div>

      {roomBookmarks.length > 0 ? (
        <div className="space-y-2">
          {roomBookmarks.map((message) => (
            <div
              key={message.id}
              className="p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => onScrollToMessage?.(message.id)}
                  className="flex-1 text-left"
                >
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
                </button>
                <button
                  onClick={() => removeBookmark.mutate(message.id)}
                  className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-[11px] transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-xs text-gray-500">
          Save messages to keep personal notes here.
        </div>
      )}
    </div>
  );
}

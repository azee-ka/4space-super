// RightSidebarSavedTab Component - Saved messages tab
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { formatRelativeTime } from './utils/formatDate';
import { useUserSavedMessages, useUnsaveMessage } from '../../hooks/useUserContent';

export function RightSidebarSavedTab() {
  const { data: savedMessages = [] } = useUserSavedMessages();
  const unsaveMessage = useUnsaveMessage();

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-bold text-white mb-3">Saved Messages</h3>
      {savedMessages.length === 0 ? (
        <div className="text-center py-8">
          <FontAwesomeIcon icon={faSave} className="text-amber-400 text-3xl mb-3" />
          <p className="text-zinc-400">No saved messages yet</p>
          <p className="text-sm text-zinc-500 mt-1">Right-click messages to save them</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {savedMessages.map((item: any) => (
            <div key={item.id} className="p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium line-clamp-2">
                    {item.message?.content || 'Message content'}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {item.message?.conversation?.name || 'Unknown conversation'} • {formatRelativeTime(item.created_at)}
                  </div>
                  {item.note && (
                    <div className="text-xs text-amber-300 mt-1 bg-amber-500/10 p-2 rounded">
                      Note: {item.note}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Remove from saved messages?')) {
                      unsaveMessage.mutate(item.message_id);
                    }
                  }}
                  className="text-zinc-400 hover:text-red-400 p-1 ml-2"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import type { Message } from '@4space/shared/src/services/messages.service';

interface PinnedBannerProps {
  pinnedMessages: Message[];
  onScrollToMessage: (messageId: string) => void;
}

export function PinnedBanner({ pinnedMessages, onScrollToMessage }: PinnedBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [pinnedMessages.length]);

  if (pinnedMessages.length === 0) return null;

  const activeMessage = pinnedMessages[activeIndex];
  const previewText = typeof activeMessage.content === 'string'
    ? activeMessage.content.replace(/<[^>]*>/g, '')
    : '';

  return (
    <div className="px-4 py-2 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faThumbtack} className="text-yellow-400 text-xs" />
        </div>
        <button
          onClick={() => onScrollToMessage(activeMessage.id)}
          className="flex-1 min-w-0 text-left"
          title="Jump to pinned message"
        >
          <p className="text-xs text-yellow-300 font-semibold tracking-wide uppercase">Pinned</p>
          <p className="text-sm text-white truncate">
            {previewText || 'Pinned message'}
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {activeMessage.sender?.display_name || activeMessage.sender?.username || 'Unknown'}
          </p>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              setActiveIndex((prev) =>
                prev === 0 ? pinnedMessages.length - 1 : prev - 1
              )
            }
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center"
            title="Previous pinned"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % pinnedMessages.length)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center"
            title="Next pinned"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
          <div className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-gray-300">
            {activeIndex + 1}/{pinnedMessages.length}
          </div>
        </div>
      </div>
    </div>
  );
}

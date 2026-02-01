import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

type BoardType = 'brainstorm' | 'flowchart' | 'mindmap' | 'kanban' | 'drawing';

interface WhiteboardItem {
  id: string;
  name: string;
  type: BoardType;
  thumbnail: string;
  createdBy: string;
  modifiedAt: string;
  collaborators: string[];
  stickyNotes: number;
  shapes: number;
  connections: number;
  starred: boolean;
}

const WHITEBOARDS: WhiteboardItem[] = [
  { id: '1', name: 'Product Roadmap Brainstorm', type: 'brainstorm', thumbnail: '💡', createdBy: 'Sarah Chen', modifiedAt: 'Jan 27, 2026', collaborators: ['Sarah', 'Mike', 'Emma', 'Alex'], stickyNotes: 24, shapes: 8, connections: 12, starred: true },
  { id: '2', name: 'User Journey Flow', type: 'flowchart', thumbnail: '📊', createdBy: 'Emma Wilson', modifiedAt: 'Jan 26, 2026', collaborators: ['Emma', 'David', 'Lisa'], stickyNotes: 15, shapes: 18, connections: 22, starred: true },
  { id: '3', name: 'Feature Planning Mind Map', type: 'mindmap', thumbnail: '🧠', createdBy: 'Mike Johnson', modifiedAt: 'Jan 25, 2026', collaborators: ['Mike', 'Sarah', 'Alex'], stickyNotes: 32, shapes: 12, connections: 28, starred: false },
  { id: '4', name: 'Sprint Planning Board', type: 'kanban', thumbnail: '📋', createdBy: 'Alex Brown', modifiedAt: 'Jan 24, 2026', collaborators: ['Alex', 'Mike', 'Sarah', 'Tom'], stickyNotes: 18, shapes: 6, connections: 8, starred: true },
  { id: '5', name: 'Design Sketches', type: 'drawing', thumbnail: '🎨', createdBy: 'David Lee', modifiedAt: 'Jan 23, 2026', collaborators: ['David', 'Emma'], stickyNotes: 8, shapes: 25, connections: 4, starred: false },
];

export function WhiteboardView() {
  const [filter, setFilter] = useState<BoardType | 'all'>('all');

  const filteredBoards = useMemo(() => {
    if (filter === 'all') return WHITEBOARDS;
    return WHITEBOARDS.filter((board) => board.type === filter);
  }, [filter]);

  const stats = useMemo(() => ({
    total: WHITEBOARDS.length,
    starred: WHITEBOARDS.filter((board) => board.starred).length,
    collaborators: new Set(WHITEBOARDS.flatMap((board) => board.collaborators)).size,
    latest: WHITEBOARDS[0]?.modifiedAt,
  }), []);

  return (
    <div className="min-h-screen bg-[#00040d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-[40px] border border-white/[0.05] bg-gradient-to-b from-white/5 to-black/60 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.5em] text-gray-400">Whiteboard</p>
            <h1 className="text-4xl font-bold">Canvas glow</h1>
            <p className="text-sm text-gray-400">Sticky glowing cards, neon gradients, and collaborative insights straight from chat.</p>
            <button className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em]">
              <FontAwesomeIcon icon={faPlus} />
              New board
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Boards</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Starred</p>
            <p className="text-3xl font-bold text-amber-300">{stats.starred}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Collaborators</p>
            <p className="text-3xl font-bold text-cyan-300">{stats.collaborators}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Latest edit</p>
            <p className="text-3xl font-bold text-white">{stats.latest}</p>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/[0.05] bg-black/50 p-6">
          <div className="flex flex-wrap items-center gap-3">
            {(['all', 'brainstorm', 'flowchart', 'mindmap', 'kanban', 'drawing'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                  filter === type ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                {type === 'all' ? 'All boards' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredBoards.map((board) => (
              <div key={board.id} className="rounded-[30px] border border-white/[0.05] bg-gradient-to-br from-white/5 to-black/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{board.thumbnail}</span>
                    <h3 className="text-lg font-semibold">{board.name}</h3>
                  </div>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400">{board.createdBy} • {board.modifiedAt}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                  <span>Sticky {board.stickyNotes}</span>
                  <span>Shapes {board.shapes}</span>
                  <span>Connections {board.connections}</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-gray-400">
                  {board.collaborators.length} collaborators
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

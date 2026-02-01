import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPoll, faCheck } from '@fortawesome/free-solid-svg-icons';

type PollStatus = 'active' | 'closed' | 'scheduled';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollItem {
  id: string;
  title: string;
  description: string;
  status: PollStatus;
  createdBy: string;
  createdAt: string;
  endsAt?: string;
  options: PollOption[];
  totalVotes: number;
}

const POLLS: PollItem[] = [
  {
    id: '1',
    title: 'Sprint focus',
    description: 'Which area gets the next sprint allocation?',
    status: 'active',
    createdBy: 'Sarah Chen',
    createdAt: 'Jan 25, 2026',
    endsAt: 'Jan 30, 2026',
    totalVotes: 12,
    options: [
      { id: 'opt1', text: 'Performance optimization', votes: 5 },
      { id: 'opt2', text: 'New feature development', votes: 4 },
      { id: 'opt3', text: 'Bug fixes', votes: 3 },
    ],
  },
  {
    id: '2',
    title: 'Team lunch',
    description: 'Where does the crew dine on Friday?',
    status: 'active',
    createdBy: 'Mike Johnson',
    createdAt: 'Jan 26, 2026',
    endsAt: 'Jan 28, 2026',
    totalVotes: 8,
    options: [
      { id: 'opt1', text: 'Italian', votes: 3 },
      { id: 'opt2', text: 'Sushi', votes: 2 },
      { id: 'opt3', text: 'Mexican', votes: 2 },
      { id: 'opt4', text: 'Burgers', votes: 1 },
    ],
  },
  {
    id: '3',
    title: 'Design priority',
    description: 'Which component should we refresh?',
    status: 'closed',
    createdBy: 'Emma Wilson',
    createdAt: 'Jan 24, 2026',
    endsAt: 'Jan 27, 2026',
    totalVotes: 15,
    options: [
      { id: 'opt1', text: 'Buttons', votes: 8 },
      { id: 'opt2', text: 'Forms', votes: 5 },
      { id: 'opt3', text: 'Navigation', votes: 2 },
    ],
  },
];

export function PollsView() {
  const [filter, setFilter] = useState<PollStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return POLLS;
    return POLLS.filter((poll) => poll.status === filter);
  }, [filter]);

  const stats = useMemo(() => ({
    total: POLLS.length,
    active: POLLS.filter((poll) => poll.status === 'active').length,
    participated: POLLS.filter((poll) => poll.status !== 'scheduled').length,
  }), []);

  return (
    <div className="min-h-screen bg-[#030310] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-[40px] border border-white/[0.05] bg-gradient-to-b from-white/5 to-black/60 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.5em] text-gray-400">Polls</p>
            <h1 className="text-4xl font-bold">Signal votes</h1>
            <p className="text-sm text-gray-400">Bright bars, glowy buttons, and the momentum of chat.</p>
            <button className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em]">
              <FontAwesomeIcon icon={faPlus} />
              Launch poll
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Polls</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Active</p>
            <p className="text-3xl font-bold text-cyan-300">{stats.active}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Engaged</p>
            <p className="text-3xl font-bold text-white">{stats.participated}</p>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/[0.05] bg-black/50 p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {(['all', 'active', 'closed', 'scheduled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-[11px] font-semibold transition ${
                  filter === status ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {filtered.map((poll) => (
              <div key={poll.id} className="rounded-[30px] border border-white/[0.05] bg-gradient-to-br from-white/5 to-black/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">{poll.status}</p>
                    <h3 className="text-xl font-semibold">{poll.title}</h3>
                  </div>
                  <div className="text-[10px] text-gray-400">Ends {poll.endsAt || '—'}</div>
                </div>
                <p className="text-sm text-gray-300">{poll.description}</p>
                <div className="space-y-2">
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes === 0 ? 0 : Math.round((option.votes / poll.totalVotes) * 100);
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-white">{option.text}</p>
                          <span className="text-[10px] text-gray-400">{percentage}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

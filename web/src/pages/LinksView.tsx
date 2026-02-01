import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLink, faArrowUpRightFromSquare, faStar, faSearch } from '@fortawesome/free-solid-svg-icons';

type LinkCategory = 'design' | 'development' | 'marketing' | 'research' | 'tools' | 'other';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  category: LinkCategory;
  favicon: string;
  addedBy: string;
  addedAt: string;
  clicks: number;
  starred: boolean;
  tags: string[];
}

const LINKS: LinkItem[] = [
  { id: '1', title: 'Figma — Collaborative Interface Design', url: 'https://figma.com', description: 'Design, prototype, and collaborate in-br browser.', category: 'design', favicon: '🎨', addedBy: 'Sarah Chen', addedAt: 'Jan 20, 2026', clicks: 45, starred: true, tags: ['design', 'prototype'] },
  { id: '2', title: 'GitHub — Code Collaboration', url: 'https://github.com', description: 'Where the world builds software.', category: 'development', favicon: '💻', addedBy: 'Mike Johnson', addedAt: 'Jan 18, 2026', clicks: 89, starred: true, tags: ['code', 'git'] },
  { id: '3', title: 'Analytics Dashboard', url: 'https://analytics.example.com', description: 'Real-time marketing insights.', category: 'marketing', favicon: '📊', addedBy: 'Emma Wilson', addedAt: 'Jan 22, 2026', clicks: 23, starred: false, tags: ['analytics'] },
  { id: '4', title: 'Notion — Team Wiki', url: 'https://notion.so', description: 'All-in-one workspace for docs.', category: 'tools', favicon: '📝', addedBy: 'David Lee', addedAt: 'Jan 25, 2026', clicks: 67, starred: true, tags: ['docs', 'knowledge'] },
  { id: '5', title: 'Linear — Issue Tracking', url: 'https://linear.app', description: 'Issue tracking you will love.', category: 'development', favicon: '🎯', addedBy: 'Lisa Martinez', addedAt: 'Jan 12, 2026', clicks: 56, starred: false, tags: ['tickets'] },
];

const CATEGORIES: { id: LinkCategory; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'development', label: 'Development' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'research', label: 'Research' },
  { id: 'tools', label: 'Tools' },
  { id: 'other', label: 'Other' },
];

export function LinksView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<LinkCategory | 'all'>('all');
  const [searchValue, setSearchValue] = useState('');

  const filteredLinks = useMemo(() => {
    return LINKS.filter((link) => {
      const matchesCategory = filterCategory === 'all' || link.category === filterCategory;
      const matchesSearch =
        link.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        link.description.toLowerCase().includes(searchValue.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchValue]);

  return (
    <div className="min-h-screen bg-[#00070c] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-[40px] border border-white/[0.05] bg-gradient-to-b from-white/5 to-black/60 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.5em] text-gray-500">Links</p>
            <h1 className="text-4xl font-bold">Neon bookmarks</h1>
            <p className="text-sm text-gray-400">Icons glow, edges shimmer, and each card pulses with the chat-inspired contrast.</p>
            <div className="mt-4 flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em]">
                <FontAwesomeIcon icon={faPlus} />
                Save link
              </button>
              <button className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[11px] text-gray-300 uppercase tracking-[0.4em]">
                <FontAwesomeIcon icon={faLink} />
                Stack
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/[0.05] bg-black/50 p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {(['all', ...CATEGORIES.map((cat) => cat.id)] as const).map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category === 'all' ? 'all' : category)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                  filterCategory === category ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                {category === 'all' ? 'All categories' : CATEGORIES.find((cat) => cat.id === category)?.label}
              </button>
            ))}
            <div className="ml-auto relative flex-1 min-w-[200px]">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search links"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full rounded-2xl bg-black/50 px-10 py-2 text-xs text-white placeholder:text-gray-500 border border-white/[0.08]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-full text-[11px] font-semibold ${
                  viewMode === 'grid' ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-full text-[11px] font-semibold ${
                  viewMode === 'list' ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2' : ''}`}>
            {filteredLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[32px] border border-white/[0.05] bg-gradient-to-br from-white/5 to-black/30 p-5 space-y-3 transition hover:border-white/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{link.favicon}</span>
                    <h3 className="text-lg font-semibold">{link.title}</h3>
                  </div>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400">{link.description}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{link.addedAt}</span>
                  <span>{link.clicks} clicks</span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                    {link.starred ? 'Starred' : 'Open'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-300">
                  {link.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

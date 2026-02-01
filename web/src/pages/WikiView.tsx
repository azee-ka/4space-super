import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faBookOpen,
  faThumbtack,
  faStar,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';

type ArticleCategory = 'product' | 'engineering' | 'design' | 'process' | 'onboarding' | 'general';

interface WikiArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  author: string;
  createdAt: string;
  modifiedAt: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  starred: boolean;
}

const ARTICLES: WikiArticle[] = [
  {
    id: '1',
    title: 'Product Vision & Strategy',
    summary: 'Long-term roadmap and strategic initiatives.',
    content: 'Eyes ahead: expand internationally, fortify AI, and elevate UX.',
    category: 'product',
    author: 'Sarah Chen',
    createdAt: 'Jan 15, 2026',
    modifiedAt: 'Jan 27, 2026',
    views: 234,
    likes: 45,
    comments: 12,
    tags: ['strategy', 'roadmap'],
    starred: true,
  },
  {
    id: '2',
    title: 'API Documentation Guide',
    summary: 'REST endpoints, auth, and best practices.',
    content: 'Auth flows, rate limiting, and code snippets for every SDK.',
    category: 'engineering',
    author: 'Mike Johnson',
    createdAt: 'Jan 18, 2026',
    modifiedAt: 'Jan 26, 2026',
    views: 567,
    likes: 89,
    comments: 23,
    tags: ['api', 'backend'],
    starred: true,
  },
  {
    id: '3',
    title: 'Design System Guidelines',
    summary: 'Component library and principles.',
    content: 'Tokens, spacing systems, and motion cues for consistency.',
    category: 'design',
    author: 'Emma Wilson',
    createdAt: 'Jan 12, 2026',
    modifiedAt: 'Jan 25, 2026',
    views: 445,
    likes: 67,
    comments: 18,
    tags: ['design-system', 'ui'],
    starred: true,
  },
  {
    id: '4',
    title: 'Sprint Planning Process',
    summary: 'How we orchestrate two-week sprints.',
    content: 'Plan, sync, demo, and retro with clarity.',
    category: 'process',
    author: 'Alex Brown',
    createdAt: 'Jan 10, 2026',
    modifiedAt: 'Jan 24, 2026',
    views: 321,
    likes: 54,
    comments: 15,
    tags: ['agile', 'process'],
    starred: false,
  },
  {
    id: '5',
    title: 'Onboarding playbook',
    summary: 'Complete guide for new hires.',
    content: 'Equipment setup, introductions, first deliverables.',
    category: 'onboarding',
    author: 'Lisa Martinez',
    createdAt: 'Jan 8, 2026',
    modifiedAt: 'Jan 23, 2026',
    views: 189,
    likes: 34,
    comments: 8,
    tags: ['onboarding', 'hr'],
    starred: false,
  },
];

const CATEGORIES: { id: ArticleCategory; label: string }[] = [
  { id: 'product', label: 'Product' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'design', label: 'Design' },
  { id: 'process', label: 'Process' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'general', label: 'General' },
];

export function WikiView() {
  const [filterCategory, setFilterCategory] = useState<ArticleCategory | 'all'>('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchValue.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchValue.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchValue]);

  const stats = useMemo(() => ({
    total: ARTICLES.length,
    views: ARTICLES.reduce((sum, article) => sum + article.views, 0),
    likes: ARTICLES.reduce((sum, article) => sum + article.likes, 0),
    updated: ARTICLES[0]?.modifiedAt,
  }), []);

  return (
    <div className="min-h-screen bg-[#00030c] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-[40px] border border-white/[0.05] bg-gradient-to-b from-white/5 to-black/60 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.5em] text-gray-400">Wiki</p>
            <h1 className="text-4xl font-bold">Knowledge nebula</h1>
            <p className="text-sm text-gray-400">Bright categories, glowing cards, and quick exploration buttons.</p>
            <button className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em]">
              <FontAwesomeIcon icon={faPlus} />
              New article
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Articles</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Views</p>
            <p className="text-3xl font-bold text-cyan-300">{stats.views}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Likes</p>
            <p className="text-3xl font-bold text-amber-300">{stats.likes}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Last updated</p>
            <p className="text-3xl font-bold text-white">{stats.updated}</p>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/[0.05] bg-black/50 p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {(['all', ...CATEGORIES.map((cat) => cat.id)] as const).map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category === 'all' ? 'all' : category)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                  filterCategory === category ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                {category === 'all' ? 'All categories' : CATEGORIES.find((entry) => entry.id === category)?.label}
              </button>
            ))}
            <div className="ml-auto relative flex-1 min-w-[220px]">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search wiki"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full rounded-2xl bg-black/50 px-10 py-2 text-xs text-white placeholder:text-gray-500 border border-white/[0.08]"
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="rounded-[32px] border border-white/[0.05] bg-gradient-to-br from-white/5 to-black/30 p-5 text-left transition hover:border-white/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">{article.category}</p>
                    <h3 className="text-xl font-semibold">{article.title}</h3>
                  </div>
                  <FontAwesomeIcon icon={faBookOpen} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-300 mt-2">{article.summary}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3">
                  <span>{article.author}</span>
                  <span>{article.views} views</span>
                  <span>{article.likes} likes</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-[10px] text-gray-300">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
                      {tag}
                    </span>
                  ))}
                  {article.starred && (
                    <span className="flex items-center gap-1 text-amber-300">
                      <FontAwesomeIcon icon={faStar} />
                      Starred
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {selectedArticle && (
          <section className="rounded-[36px] border border-white/[0.08] bg-gradient-to-br from-white/10 to-black/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Article detail</p>
              <FontAwesomeIcon icon={faThumbtack} className="text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold">{selectedArticle.title}</h2>
            <p className="text-sm text-gray-300">{selectedArticle.content}</p>
            <div className="grid md:grid-cols-3 gap-4 text-[11px] text-gray-400">
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Category</span>
                {selectedArticle.category}
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Modified</span>
                {selectedArticle.modifiedAt}
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Comments</span>
                {selectedArticle.comments}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faChevronRight,
  faDownload,
  faEye,
  faFilter,
  faPlus,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { useSpace } from '../hooks/useSpaces';
import { useThemeStore } from '../store/themeStore';

type DocType = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'other';
type DocStatus = 'draft' | 'in_review' | 'published' | 'archived';

interface DocumentItem {
  id: string;
  name: string;
  type: DocType;
  description: string;
  folder: string;
  size: string;
  updatedAt: string;
  version: string;
  comments: number;
  status: DocStatus;
  pinned: boolean;
  shared: boolean;
  tags: string[];
  owner: string;
}

const DOCUMENTS: DocumentItem[] = [
  {
    id: '1',
    name: 'Research Playbook',
    type: 'document',
    description:
      'Living guide to the hypotheses, experiments, and go-to-market wins the product team keeps iterating on.',
    folder: 'Research',
    size: '2.8 MB',
    updatedAt: 'Jan 30, 2026',
    version: '4.2.1',
    comments: 12,
    status: 'draft',
    pinned: true,
    shared: true,
    tags: ['strategy', 'playbook'],
    owner: 'Maya Patel',
  },
  {
    id: '2',
    name: 'Launch Briefing',
    type: 'presentation',
    description: 'Story-led deck for the next sprint review with customer anecdotes.',
    folder: 'Stories',
    size: '5.1 MB',
    updatedAt: 'Jan 28, 2026',
    version: '1.7',
    comments: 8,
    status: 'in_review',
    pinned: true,
    shared: true,
    tags: ['deck', 'presentation'],
    owner: 'Diego Rivera',
  },
  {
    id: '3',
    name: 'Q1 Financial Pulse',
    type: 'spreadsheet',
    description: 'Living metrics workbook with burn forecasts, ARR, and KPI callouts.',
    folder: 'Finance',
    size: '1.9 MB',
    updatedAt: 'Jan 26, 2026',
    version: '3.0',
    comments: 5,
    status: 'published',
    pinned: false,
    shared: false,
    tags: ['finance', 'kpi'],
    owner: 'Casey White',
  },
  {
    id: '4',
    name: 'Product Requirements',
    type: 'pdf',
    description: 'Delivery-ready spec with wireframes, flows, and success metrics for next release.',
    folder: 'Product',
    size: '3.4 MB',
    updatedAt: 'Jan 24, 2026',
    version: '5.1',
    comments: 8,
    status: 'in_review',
    pinned: false,
    shared: true,
    tags: ['spec', 'delivery'],
    owner: 'Selena Brooks',
  },
  {
    id: '5',
    name: 'Brand Mood Board',
    type: 'image',
    description: 'Curated visual palette and iconography snapshots used across campaigns.',
    folder: 'Marketing',
    size: '6.2 MB',
    updatedAt: 'Jan 29, 2026',
    version: '2.4',
    comments: 2,
    status: 'published',
    pinned: false,
    shared: true,
    tags: ['brand', 'design'],
    owner: 'Kai Liao',
  },
  {
    id: '6',
    name: 'API Reference',
    type: 'document',
    description: 'Tempo-tracked reference for every public endpoint plus quickstart snippets.',
    folder: 'Engineering',
    size: '4.1 MB',
    updatedAt: 'Jan 22, 2026',
    version: '4.6',
    comments: 7,
    status: 'published',
    pinned: false,
    shared: false,
    tags: ['api', 'reference'],
    owner: 'Nina Flores',
  },
  {
    id: '7',
    name: 'Content Calendar',
    type: 'spreadsheet',
    description: 'Editorial grid with launch dates, themes, and responsible owners for Q2.',
    folder: 'Marketing',
    size: '1.2 MB',
    updatedAt: 'Jan 25, 2026',
    version: '2.0',
    comments: 4,
    status: 'archived',
    pinned: false,
    shared: true,
    tags: ['planning', 'content'],
    owner: 'Sofia Kim',
  },
];

const STATUS_ORDER: DocStatus[] = ['draft', 'in_review', 'published', 'archived'];
const TYPE_OPTIONS: { id: DocType; label: string }[] = [
  { id: 'document', label: 'Docs' },
  { id: 'spreadsheet', label: 'Sheets' },
  { id: 'presentation', label: 'Slides' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'image', label: 'Images' },
  { id: 'other', label: 'Other' },
];

export function DocsView() {
  const { id: spaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: space } = useSpace(spaceId || '');
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [filterStatus, setFilterStatus] = useState<DocStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DocType | 'all'>('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(DOCUMENTS[0]?.id ?? '');
  const [sortOrder, setSortOrder] = useState<'recent' | 'name'>('recent');

  const glassLight = 'bg-white/5 border border-white/10 backdrop-blur-xl';
  const glassDark = 'bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl';

  const filteredDocs = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    return DOCUMENTS.filter((doc) => {
      if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
      if (filterType !== 'all' && doc.type !== filterType) return false;
      if (!term) return true;
      return (
        doc.name.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }).sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filterStatus, filterType, searchValue, sortOrder]);

  const selectedDoc = useMemo(
    () => filteredDocs.find((doc) => doc.id === selectedDocId) || filteredDocs[0] || null,
    [filteredDocs, selectedDocId]
  );

  const stats = useMemo(
    () => ({
      total: filteredDocs.length,
      drafts: filteredDocs.filter((doc) => doc.status === 'draft').length,
      inReview: filteredDocs.filter((doc) => doc.status === 'in_review').length,
      published: filteredDocs.filter((doc) => doc.status === 'published').length,
    }),
    [filteredDocs]
  );

  return (
    <div className={`flex h-screen overflow-hidden h-full`}>
      <aside className={`w-72 flex-shrink-0 px-5 py-6 h-[80vh] overflow-y-auto ${isDark ? glassDark : glassLight}`}>
          <div className="flex h-full min-h-0 flex-col gap-6 pr-1">
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/spaces/${spaceId}`)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.4em]"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              Workspace
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Docs</p>
              <h2 className="text-2xl font-bold">Knowledge Index</h2>
              <p className="text-sm text-slate-500">{space?.name || 'Workspace'}</p>
            </div>
          </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Quick stats</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                { label: 'Total', value: stats.total },
                { label: 'Drafts', value: stats.drafts },
                { label: 'In review', value: stats.inReview },
                { label: 'Published', value: stats.published },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`rounded-2xl border p-3 text-center shadow-sm ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-slate-200 bg-white/60'}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                  <p className="text-2xl font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Status</p>
            <div className="space-y-2">
              {(['all', ...STATUS_ORDER] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status === 'all' ? 'all' : status)}
                  className={`w-full rounded-xl px-3 py-2 text-[11px] uppercase tracking-[0.3em] transition border ${
                    filterStatus === status
                      ? 'bg-slate-900 text-white border-transparent shadow-[0_10px_25px_rgba(15,23,42,0.25)]'
                      : isDark
                        ? 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]'
                        : 'bg-white/60 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {status === 'all' ? 'All statuses' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Types</p>
            <div className="flex flex-wrap gap-2">
              {(['all', ...TYPE_OPTIONS.map((type) => type.id)] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type === 'all' ? 'all' : (type as DocType))}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.3em] border transition ${
                    filterType === type
                      ? 'bg-slate-900 text-white shadow-[0_10px_25px_rgba(15,23,42,0.2)] border-transparent'
                      : isDark
                        ? 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]'
                        : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {type === 'all' ? 'All types' : TYPE_OPTIONS.find((entry) => entry.id === type)?.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col min-h-0 overflow-y-auto">
        <section className={`flex-shrink-0 border-b px-6 py-5 ${isDark ? 'border-white/[0.05]' : 'border-gray-200'} bg-transparent`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <FontAwesomeIcon
                  icon={faSearch}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                />
                <input
                  type="text"
                  placeholder="Search docs, folders or tags"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  className={`w-full rounded-full border px-10 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                    isDark
                      ? 'border-white/[0.08] bg-white/[0.04] text-white placeholder:text-slate-500'
                      : 'border-gray-300 bg-white text-slate-900 placeholder:text-gray-500'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder('recent')}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${
                    sortOrder === 'recent' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSortOrder('name')}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${
                    sortOrder === 'name' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  Name
                </button>
              </div>
              <button
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] transition ${
                  isDark ? 'border-white/[0.2] text-white' : 'border-slate-200 text-slate-900'
                }`}
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                New doc
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">
              <FontAwesomeIcon icon={faFilter} className="text-[11px]" />
              Showing {filteredDocs.length} / {DOCUMENTS.length}
            </div>
          </div>
        </section>

        <div className="flex flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
              {filteredDocs.map((doc) => (
                <article
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`flex min-h-[140px] flex-col justify-between gap-3 rounded-3xl border p-5 shadow-sm transition hover:border-slate-400 ${
                    selectedDoc?.id === doc.id
                      ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-200'
                      : isDark
                        ? 'border-white/[0.08] bg-white/[0.02]'
                        : 'border-slate-200 bg-white/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                      <span>{doc.folder}</span>
                      <span>{doc.status.replace('_', ' ')}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{doc.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{doc.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Updated {doc.updatedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                      {doc.owner}
                    </span>
                  </div>
                </article>
              ))}
              {!filteredDocs.length && (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                  Nothing matches those filters yet.
                </div>
              )}
            </div>
          </div>

          <aside className={`w-80 flex-shrink-0 border-l px-5 py-6 ${isDark ? glassDark : glassLight}`}>
            <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto pr-1">
              <div className={`rounded-2xl p-4 text-sm text-slate-600 shadow-sm ${isDark ? 'border border-white/[0.05] bg-white/[0.02]' : 'border border-slate-200 bg-white/60'}`}>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Spotlight</p>
                {selectedDoc ? (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{selectedDoc.name}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{selectedDoc.folder}</p>
                    <p className="mt-2 text-sm text-slate-500">{selectedDoc.description}</p>
                    <div className="mt-4 flex flex-col gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      <span>Updated {selectedDoc.updatedAt}</span>
                      <span>Version {selectedDoc.version}</span>
                      <span>{selectedDoc.comments} comments</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                        <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                        Preview
                      </button>
                      <button className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                        <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                        Download
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Select a document to get details.</p>
                )}
              </div>
              <div className={`rounded-2xl p-4 shadow-sm ${isDark ? 'border border-white/[0.05] bg-white/[0.02]' : 'border border-slate-200 bg-white/60'}`}>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">Pinned Docs</p>
                <div className="space-y-2 text-sm text-slate-600">
                  {DOCUMENTS.filter((doc) => doc.pinned).map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 ${isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-slate-100 bg-white/40'}`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{doc.folder}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{doc.type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-2xl p-4 shadow-sm ${isDark ? 'border border-white/[0.05] bg-white/[0.02]' : 'border border-slate-200 bg-white/60'}`}>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3">Tag focus</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                  {['strategy', 'api', 'design', 'planning'].map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-2xl border px-3 py-1 ${isDark ? 'border-white/[0.1] bg-white/[0.02]' : 'border-slate-200 bg-white/20'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

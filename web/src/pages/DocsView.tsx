import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faFolderOpen,
  faStar,
  faFileLines,
  faShare,
} from '@fortawesome/free-solid-svg-icons';

type DocType = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'other';

interface DocumentItem {
  id: string;
  name: string;
  type: DocType;
  size: string;
  createdBy: string;
  modifiedAt: string;
  starred: boolean;
  shared: boolean;
  folder: string;
  tags: string[];
  comments: number;
  version: string;
}

const DOCUMENTS: DocumentItem[] = [
  { id: '1', name: 'Product Requirements Document', type: 'document', size: '2.4 MB', createdBy: 'Sarah Chen', modifiedAt: 'Jan 26, 2026', starred: true, shared: true, folder: 'Product', tags: ['requirements', 'planning'], comments: 5, version: '3.2' },
  { id: '2', name: 'Q1 Analytics Dashboard', type: 'spreadsheet', size: '1.8 MB', createdBy: 'Mike Johnson', modifiedAt: 'Jan 27, 2026', starred: true, shared: false, folder: 'Analytics', tags: ['data', 'reports'], comments: 3, version: '2.5' },
  { id: '3', name: 'Sprint Review Slides', type: 'presentation', size: '5.2 MB', createdBy: 'Emma Wilson', modifiedAt: 'Jan 25, 2026', starred: false, shared: true, folder: 'Presentations', tags: ['sprint', 'review'], comments: 8, version: '1.0' },
  { id: '4', name: 'API Documentation', type: 'pdf', size: '3.1 MB', createdBy: 'Alex Brown', modifiedAt: 'Jan 24, 2026', starred: true, shared: true, folder: 'Documentation', tags: ['api', 'reference'], comments: 2, version: '4.0' },
  { id: '5', name: 'Design Mockups', type: 'image', size: '8.7 MB', createdBy: 'David Lee', modifiedAt: 'Jan 26, 2026', starred: false, shared: true, folder: 'Design', tags: ['ui', 'mockups'], comments: 12, version: '2.1' },
];

const TYPES: { id: DocType; label: string }[] = [
  { id: 'document', label: 'Docs' },
  { id: 'spreadsheet', label: 'Sheets' },
  { id: 'presentation', label: 'Slides' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'image', label: 'Images' },
  { id: 'other', label: 'Other' },
];

export function DocsView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<DocType | 'all'>('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesSearch =
        doc.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        doc.folder.toLowerCase().includes(searchValue.toLowerCase()) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(searchValue.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [filterType, searchValue]);

  const stats = useMemo(() => ({
    total: DOCUMENTS.length,
    starred: DOCUMENTS.filter((doc) => doc.starred).length,
    shared: DOCUMENTS.filter((doc) => doc.shared).length,
  }), []);

  return (
    <div className="min-h-screen bg-[#010208] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-[40px] border border-white/[0.05] bg-gradient-to-b from-white/5 to-black/60 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-[0.5em] text-gray-500">Docs</p>
            <h1 className="text-4xl font-bold">Living vault</h1>
            <p className="text-sm text-gray-400">Pulsing neon channels, icons, and modular cards highlight each doc’s status.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em]">
                <FontAwesomeIcon icon={faPlus} />
                New doc
              </button>
              <button className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[11px] text-gray-300 uppercase tracking-[0.4em]">
                <FontAwesomeIcon icon={faShare} />
                Broadcast
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5 flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Total docs</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-[11px] text-gray-500">Ready for the crew</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Starred</p>
            <p className="text-3xl font-bold text-amber-400">{stats.starred}</p>
          </div>
          <div className="rounded-[32px] border border-white/[0.05] bg-black/60 p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Shared</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.shared}</p>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/[0.05] bg-black/50 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-gray-400">
              <FontAwesomeIcon icon={faFolderOpen} />
              Filter
            </div>
            {(['all', ...TYPES.map((type) => type.id)] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type === 'all' ? 'all' : type)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                  filterType === type ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                }`}
              >
                {type === 'all' ? 'All types' : TYPES.find((entry) => entry.id === type)?.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <input
                type="text"
                placeholder="Search docs..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="rounded-2xl bg-black/50 px-4 py-2 text-xs text-white placeholder:text-gray-500 border border-white/[0.08]"
              />
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-full text-[11px] font-semibold ${
                    viewMode === mode ? 'bg-white/20 text-white' : 'bg-black/30 text-gray-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className={`${viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}`}>
          {filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`flex flex-col rounded-[32px] border border-white/[0.05] bg-gradient-to-br ${
                doc.starred ? 'from-cyan-500/10 to-purple-500/10' : 'from-white/5 to-black/30'
              } p-6 text-left hover:border-white/30 transition`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{doc.name}</p>
                <FontAwesomeIcon icon={faFileLines} className="text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">{doc.folder}</p>
              <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-gray-300">
                {doc.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-[10px] text-gray-400">
                <span>{doc.size}</span>
                <span>{doc.modifiedAt}</span>
                <span>{doc.version}</span>
              </div>
            </button>
          ))}
        </section>

        {selectedDoc && (
          <section className="rounded-[36px] border border-white/[0.08] bg-black/40 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400">Document preview</p>
              <FontAwesomeIcon icon={faShare} className="text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold">{selectedDoc.name}</h2>
            <p className="text-sm text-gray-300">Type: {selectedDoc.type.toUpperCase()}</p>
            <p className="text-sm text-gray-300">Created by: {selectedDoc.createdBy}</p>
            <div className="grid md:grid-cols-3 gap-4 text-[11px] text-gray-400">
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Size</span>
                {selectedDoc.size}
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Comments</span>
                {selectedDoc.comments}
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500">Folder</span>
                {selectedDoc.folder}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px]">
                Version {selectedDoc.version}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px]">
                {selectedDoc.starred ? 'Starred' : 'Unstarred'}
              </span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlus,
  faSearch,
  faTh,
  faList,
  faThumbtack,
  faStar,
  faTag,
  faCalendarDays,
  faUser,
  faClock,
  faEdit,
  faTrash,
  faCheckCircle,
  faTimes,
  faListCheck,
  faBrain,
  faBriefcase,
  faGraduationCap,
  faLightbulb,
  faLayerGroup,
  faThList,
} from '@fortawesome/free-solid-svg-icons';
import { useSpace } from '../hooks/useSpaces';
import { useThemeStore } from '../store/themeStore';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  type NoteCategory,
  type Note as NoteType,
} from '../hooks/useNotes';

type ViewMode = 'grid' | 'list' | 'compact';

const CATEGORIES = [
  { id: 'personal' as NoteCategory, label: 'Personal', icon: faUser, gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
  { id: 'work' as NoteCategory, label: 'Work', icon: faBriefcase, gradient: 'from-blue-500 via-cyan-500 to-teal-500' },
  { id: 'ideas' as NoteCategory, label: 'Ideas', icon: faLightbulb, gradient: 'from-amber-500 via-yellow-500 to-orange-500' },
  { id: 'todo' as NoteCategory, label: 'To-Do', icon: faListCheck, gradient: 'from-emerald-500 via-green-500 to-teal-500' },
  { id: 'meeting' as NoteCategory, label: 'Meeting', icon: faCalendarDays, gradient: 'from-rose-500 via-pink-500 to-red-500' },
  { id: 'project' as NoteCategory, label: 'Project', icon: faLayerGroup, gradient: 'from-indigo-500 via-blue-500 to-cyan-500' },
  { id: 'learning' as NoteCategory, label: 'Learning', icon: faGraduationCap, gradient: 'from-sky-500 via-blue-500 to-indigo-500' },
  { id: 'creative' as NoteCategory, label: 'Creative', icon: faBrain, gradient: 'from-fuchsia-500 via-purple-500 to-pink-500' },
];

export function NotesView() {
  const { id: spaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { data: space } = useSpace(spaceId);

  // API hooks
  const { data: notesData = [], isLoading } = useNotes(spaceId);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const isDark = theme === 'dark';

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('view');

  // Form state for creating/editing
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<NoteCategory>('personal');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagsInput, setFormTagsInput] = useState('');

  // Use notes data directly
  const NOTES = notesData;

  const filteredNotes = useMemo(() => {
    return NOTES.filter((note) => {
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [NOTES, selectedCategory, searchQuery]);

  const stats = useMemo(() => ({
    total: NOTES.length,
    pinned: NOTES.filter((n) => n.pinned).length,
    starred: NOTES.filter((n) => n.starred).length,
    today: NOTES.filter((n) => {
      const today = new Date();
      return new Date(n.updated_at).toDateString() === today.toDateString();
    }).length,
  }), [NOTES]);

  const recentActivity = useMemo(() => {
    return [...NOTES]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [NOTES]);

  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    NOTES.forEach((note) => {
      note.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [NOTES]);

  const categoryCount = (category: NoteCategory) => {
    return NOTES.filter((n) => n.category === category).length;
  };

  const openNoteModal = (note: NoteType | null, mode: 'create' | 'view' | 'edit') => {
    if (note) {
      setSelectedNote(note);
      setFormTitle(note.title);
      setFormContent(note.content);
      setFormCategory(note.category);
      setFormTags(note.tags);
      setFormTagsInput(note.tags.join(', '));
    } else {
      setSelectedNote(null);
      setFormTitle('');
      setFormContent('');
      setFormCategory('personal');
      setFormTags([]);
      setFormTagsInput('');
    }
    setModalMode(mode);
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setTimeout(() => {
      setSelectedNote(null);
      setModalMode('view');
      setFormTitle('');
      setFormContent('');
      setFormCategory('personal');
      setFormTags([]);
      setFormTagsInput('');
    }, 200);
  };

  const handleCreateNote = async () => {
    if (!spaceId || !formTitle.trim()) return;

    try {
      const categoryMeta = CATEGORIES.find((c) => c.id === formCategory);
      await createNoteMutation.mutateAsync({
        space_id: spaceId,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        color: categoryMeta?.gradient || 'from-violet-500 via-purple-500 to-fuchsia-500',
        tags: formTags,
        pinned: false,
        starred: false,
        shared: false,
      });
      closeNoteModal();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    try {
      const categoryMeta = CATEGORIES.find((c) => c.id === formCategory);
      await updateNoteMutation.mutateAsync({
        noteId: selectedNote.id,
        input: {
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory,
          color: categoryMeta?.gradient || selectedNote.color,
          tags: formTags,
        },
      });
      setModalMode('view');
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      await deleteNoteMutation.mutateAsync(selectedNote.id);
      closeNoteModal();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleTogglePinned = async (note: NoteType) => {
    try {
      await updateNoteMutation.mutateAsync({
        noteId: note.id,
        input: { pinned: !note.pinned },
      });
    } catch (error) {
      console.error('Failed to toggle pinned:', error);
    }
  };

  const handleToggleStarred = async (note: NoteType) => {
    try {
      await updateNoteMutation.mutateAsync({
        noteId: note.id,
        input: { starred: !note.starred },
      });
    } catch (error) {
      console.error('Failed to toggle starred:', error);
    }
  };

  const getCategoryMeta = (category: NoteCategory) => {
    return CATEGORIES.find((c) => c.id === category);
  };

  return (
    <div className={`h-full ${isDark ? 'bg-transparent' : 'bg-white'} overflow-hidden flex`}>
      {/* Left Sidebar */}
      <div className={`w-64 flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-gray-200 bg-gray-50/50'} border-r relative z-10 overflow-y-auto`}>
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/spaces/${spaceId}`)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isDark
                  ? 'bg-white/[0.03] hover:bg-white/[0.06] text-gray-300'
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
              }`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              Back
            </button>
            <div>
              <h2 className={`text-lg font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent`}>
                Notes
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                {space?.name || 'Workspace'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Total</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-gradient-to-br from-violet-500/[0.15] to-fuchsia-500/[0.1] backdrop-blur-xl border border-violet-500/[0.2] shadow-lg shadow-violet-500/[0.15]' : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>Pinned</div>
                <div className={`text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent`}>
                  {stats.pinned}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Starred</div>
                <div className={`text-xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.starred}</div>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-white shadow-sm'}`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Today</div>
                <div className={`text-xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.today}</div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Categories
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'all'
                    ? isDark
                      ? 'bg-violet-500/[0.15] text-violet-300 shadow-lg shadow-violet-500/[0.2]'
                      : 'bg-violet-50 text-violet-700 shadow-sm'
                    : isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-400 hover:bg-white/[0.05]'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <span>All Notes</span>
                <span className={`text-[10px] ${selectedCategory === 'all' ? (isDark ? 'text-violet-400' : 'text-violet-600') : (isDark ? 'text-gray-600' : 'text-gray-500')}`}>
                  {NOTES.length}
                </span>
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === category.id
                      ? isDark
                        ? 'bg-violet-500/[0.15] text-violet-300 shadow-lg shadow-violet-500/[0.2]'
                        : 'bg-violet-50 text-violet-700 shadow-sm'
                      : isDark
                        ? 'bg-zinc-900/50 text-gray-400 hover:bg-zinc-900/80 shadow shadow-black/10'
                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={category.icon}
                    className={`text-xs bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}
                  />
                  <span className="flex-1 text-left">{category.label}</span>
                  <span className={`text-[10px] ${selectedCategory === category.id ? (isDark ? 'text-violet-400' : 'text-violet-600') : (isDark ? 'text-gray-600' : 'text-gray-500')}`}>
                    {categoryCount(category.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Toolbar */}
        <div className={`flex-shrink-0 p-4 ${isDark ? 'border-white/[0.06]' : 'border-gray-200'} border-b`}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <FontAwesomeIcon
                icon={faSearch}
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm transition-all outline-none ${
                  isDark
                    ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white placeholder-gray-600 focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-500/30'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 shadow-sm'
                }`}
              />
            </div>

            {/* View Mode Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-100 shadow-sm'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? isDark
                      ? 'bg-gradient-to-r from-violet-500/[0.2] to-fuchsia-500/[0.2] text-violet-300 shadow-lg shadow-violet-500/[0.2]'
                      : 'bg-white text-violet-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faTh} className="mr-1.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? isDark
                      ? 'bg-gradient-to-r from-violet-500/[0.2] to-fuchsia-500/[0.2] text-violet-300 shadow-lg shadow-violet-500/[0.2]'
                      : 'bg-white text-violet-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faList} className="mr-1.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'compact'
                    ? isDark
                      ? 'bg-gradient-to-r from-violet-500/[0.2] to-fuchsia-500/[0.2] text-violet-300 shadow-lg shadow-violet-500/[0.2]'
                      : 'bg-white text-violet-600 shadow-sm'
                    : isDark
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FontAwesomeIcon icon={faThList} className="mr-1.5" />
                Compact
              </button>
            </div>

            {/* New Note Button */}
            <button
              onClick={() => openNoteModal(null, 'create')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-violet-500/[0.2] to-fuchsia-500/[0.2] text-violet-300 shadow-violet-500/[0.2] hover:from-violet-500/[0.3] hover:to-fuchsia-500/[0.3]'
                  : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-violet-500/50'
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              New Note
            </button>
          </div>

          {/* Results Count */}
          <div className={`mt-2 text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            Showing {filteredNotes.length} of {NOTES.length} notes
          </div>
        </div>

        {/* Notes Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNotes.map((note) => {
                const categoryMeta = getCategoryMeta(note.category);
                const checklistProgress = note.checklist
                  ? (note.checklist.filter((c) => c.completed).length / note.checklist.length) * 100
                  : 0;

                return (
                  <button
                    key={note.id}
                    onClick={() => openNoteModal(note, 'view')}
                    className={`p-4 rounded-lg text-left transition-all ${
                      isDark
                        ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-violet-500/[0.2] hover:shadow-lg hover:shadow-violet-500/[0.1]'
                        : 'bg-white hover:bg-gray-50 shadow-lg shadow-gray-200/50 hover:shadow-violet-200/50'
                    }`}
                  >
                    {/* Color Bar */}
                    <div className={`h-1 w-full rounded-full bg-gradient-to-r ${note.color} mb-3`} />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-2 flex-1`}>
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {note.pinned && (
                          <FontAwesomeIcon icon={faThumbtack} className={`text-xs ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                        )}
                        {note.starred && (
                          <FontAwesomeIcon icon={faStar} className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} line-clamp-3 mb-3`}>
                      {note.content}
                    </p>

                    {/* Checklist Progress */}
                    {note.checklist && note.checklist.length > 0 && (
                      <div className="mb-3">
                        <div className={`h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} overflow-hidden mb-1`}>
                          <div
                            className={`h-full bg-gradient-to-r ${note.color}`}
                            style={{ width: `${checklistProgress}%` }}
                          />
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                          {note.checklist.filter((c) => c.completed).length}/{note.checklist.length} tasks completed
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${note.color} flex items-center justify-center text-[8px] font-semibold text-white`}>
                          {note.author?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                          {note.author?.name?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {categoryMeta && (
                          <FontAwesomeIcon
                            icon={categoryMeta.icon}
                            className={`text-[10px] bg-gradient-to-r ${categoryMeta.gradient} bg-clip-text text-transparent`}
                          />
                        )}
                        <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                              isDark ? 'bg-zinc-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-2">
              {filteredNotes.map((note) => {
                const categoryMeta = getCategoryMeta(note.category);
                const checklistProgress = note.checklist
                  ? (note.checklist.filter((c) => c.completed).length / note.checklist.length) * 100
                  : 0;

                return (
                  <button
                    key={note.id}
                    onClick={() => openNoteModal(note, 'view')}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      isDark
                        ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-violet-500/[0.2] hover:shadow-lg hover:shadow-violet-500/[0.1]'
                        : 'bg-white hover:bg-gray-50 shadow-lg shadow-gray-200/50 hover:shadow-violet-200/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-1 h-full min-h-[60px] rounded-full bg-gradient-to-b ${note.color}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {note.pinned && (
                              <FontAwesomeIcon icon={faThumbtack} className={`text-xs ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                            )}
                            {note.starred && (
                              <FontAwesomeIcon icon={faStar} className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            )}
                            {categoryMeta && (
                              <span className={`px-2 py-1 rounded text-[10px] font-medium ${isDark ? 'bg-zinc-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                {categoryMeta.label}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                          {note.content}
                        </p>

                        {/* Checklist Progress */}
                        {note.checklist && note.checklist.length > 0 && (
                          <div className="mb-2">
                            <div className={`h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} overflow-hidden`}>
                              <div
                                className={`h-full bg-gradient-to-r ${note.color}`}
                                style={{ width: `${checklistProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-[10px]">
                          <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faUser} />
                            {note.author?.name || 'Unknown'}
                          </span>
                          <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faClock} />
                            {new Date(note.updated_at).toLocaleDateString()}
                          </span>
                          {note.checklist && (
                            <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                              <FontAwesomeIcon icon={faListCheck} />
                              {note.checklist.filter((c) => c.completed).length}/{note.checklist.length}
                            </span>
                          )}
                          <div className="flex items-center gap-1 flex-wrap ml-auto">
                            {note.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                                  isDark ? 'bg-zinc-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-1">
              {filteredNotes.map((note) => {
                const categoryMeta = getCategoryMeta(note.category);

                return (
                  <button
                    key={note.id}
                    onClick={() => openNoteModal(note, 'view')}
                    className={`w-full p-2.5 rounded-lg text-left transition-all ${
                      isDark
                        ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-violet-500/[0.2]'
                        : 'bg-white hover:bg-gray-50 shadow shadow-gray-200/50 hover:shadow-violet-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${note.color}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                            {note.title}
                          </h3>
                          {note.pinned && (
                            <FontAwesomeIcon icon={faThumbtack} className={`text-[10px] ${isDark ? 'text-violet-400' : 'text-violet-600'} flex-shrink-0`} />
                          )}
                          {note.starred && (
                            <FontAwesomeIcon icon={faStar} className={`text-[10px] ${isDark ? 'text-yellow-400' : 'text-yellow-600'} flex-shrink-0`} />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>
                            {note.author?.name?.split(' ')[0] || 'Unknown'}
                          </span>
                          {categoryMeta && (
                            <span className={`bg-gradient-to-r ${categoryMeta.gradient} bg-clip-text text-transparent`}>
                              {categoryMeta.label}
                            </span>
                          )}
                          <span className={`${isDark ? 'text-gray-600' : 'text-gray-500'} ml-auto`}>
                            {new Date(note.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {categoryMeta && (
                        <FontAwesomeIcon
                          icon={categoryMeta.icon}
                          className={`text-xs bg-gradient-to-r ${categoryMeta.gradient} bg-clip-text text-transparent flex-shrink-0`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`w-64 flex-shrink-0 ${isDark ? 'border-white/[0.06] backdrop-blur-xl' : 'border-gray-200 bg-gray-50/50'} border-l relative z-10 overflow-y-auto`}>
        <div className="p-4 space-y-6">
          {/* Recent Activity */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Recent Activity
            </p>
            <div className="space-y-1.5">
              {recentActivity.map((note) => {
                const categoryMeta = getCategoryMeta(note.category);
                return (
                  <button
                    key={note.id}
                    onClick={() => openNoteModal(note, 'view')}
                    className={`w-full p-2 rounded-lg text-left transition-all ${
                      isDark
                        ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04]'
                        : 'bg-white hover:bg-gray-50 shadow shadow-gray-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {categoryMeta && (
                        <FontAwesomeIcon
                          icon={categoryMeta.icon}
                          className={`text-[10px] bg-gradient-to-r ${categoryMeta.gradient} bg-clip-text text-transparent`}
                        />
                      )}
                      <span className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'} line-clamp-1 mb-0.5`}>
                      {note.title}
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                      {note.author?.name?.split(' ')[0] || 'Unknown'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Popular Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-400 hover:bg-violet-500/[0.1] hover:text-violet-300 hover:border-violet-500/[0.2]'
                      : 'bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-700 shadow-sm'
                  }`}
                >
                  {tag} <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>({count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-black/50'} backdrop-blur-sm`}
            onClick={closeNoteModal}
          />

          {/* Modal */}
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            isDark
              ? 'bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08]'
              : 'bg-white shadow-gray-300'
          }`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {modalMode === 'create' || modalMode === 'edit' ? (
                    <input
                      type="text"
                      placeholder="Note title..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className={`w-full text-xl font-bold bg-transparent outline-none ${
                        isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  ) : (
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedNote?.title}
                    </h2>
                  )}
                </div>
                <button
                  onClick={closeNoteModal}
                  className={`p-2 rounded-lg transition-all ${
                    isDark
                      ? 'hover:bg-white/[0.05] text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {modalMode === 'create' || modalMode === 'edit' ? (
                  <>
                    <div>
                      <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                        Content
                      </label>
                      <textarea
                        placeholder="Start writing your note..."
                        rows={6}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className={`w-full p-3 rounded-lg text-sm ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white placeholder-gray-600 focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-500/30'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                        } outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Category
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as NoteCategory)}
                          className={`w-full p-2 rounded-lg text-sm ${
                            isDark
                              ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-500/30'
                              : 'bg-gray-50 text-gray-900 border border-gray-200'
                          } outline-none`}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Tags
                        </label>
                        <input
                          type="text"
                          placeholder="Comma separated tags..."
                          value={formTagsInput}
                          onChange={(e) => {
                            setFormTagsInput(e.target.value);
                            setFormTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean));
                          }}
                          className={`w-full p-2 rounded-lg text-sm ${
                            isDark
                              ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-white placeholder-gray-600 focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-500/30'
                              : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={closeNoteModal}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          isDark
                            ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] text-gray-300 hover:bg-white/[0.04]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={modalMode === 'create' ? handleCreateNote : handleUpdateNote}
                        disabled={!formTitle.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark
                            ? 'bg-gradient-to-r from-violet-500/[0.2] to-fuchsia-500/[0.2] text-violet-300 shadow-violet-500/[0.2] hover:from-violet-500/[0.3] hover:to-fuchsia-500/[0.3]'
                            : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-violet-500/50'
                        }`}
                      >
                        {modalMode === 'create' ? 'Create Note' : 'Save Changes'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                        Content
                      </label>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedNote?.content}
                      </p>
                    </div>

                    {selectedNote?.checklist && selectedNote.checklist.length > 0 && (
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Checklist
                        </label>
                        <div className="space-y-2">
                          {selectedNote.checklist.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]' : 'bg-gray-50'
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className={`text-sm ${
                                  item.completed
                                    ? isDark
                                      ? 'text-violet-400'
                                      : 'text-violet-600'
                                    : isDark
                                      ? 'text-gray-700'
                                      : 'text-gray-300'
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  item.completed
                                    ? isDark
                                      ? 'text-gray-500 line-through'
                                      : 'text-gray-500 line-through'
                                    : isDark
                                      ? 'text-white'
                                      : 'text-gray-900'
                                }`}
                              >
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Category
                        </label>
                        <div className="flex items-center gap-2">
                          {selectedNote && getCategoryMeta(selectedNote.category) && (
                            <>
                              <FontAwesomeIcon
                                icon={getCategoryMeta(selectedNote.category)!.icon}
                                className={`text-sm bg-gradient-to-r ${getCategoryMeta(selectedNote.category)!.gradient} bg-clip-text text-transparent`}
                              />
                              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {getCategoryMeta(selectedNote.category)!.label}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Author
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedNote?.author?.name || 'Unknown'}
                        </span>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Created
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedNote && new Date(selectedNote.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>
                          Updated
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedNote && new Date(selectedNote.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {selectedNote?.tags && selectedNote.tags.length > 0 && (
                      <div>
                        <label className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedNote.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isDark ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-white/[0.1]' : 'border-gray-200'}`}>
                      <button
                        onClick={() => setModalMode('edit')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          isDark
                            ? 'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] text-gray-300 hover:bg-white/[0.08]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteNote}
                        disabled={deleteNoteMutation.isPending}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark
                            ? 'bg-red-500/[0.2] text-red-300 hover:bg-red-500/[0.3]'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

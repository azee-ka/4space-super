import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCloudArrowUp,
  faFile,
  faFileImage,
  faFileVideo,
  faFileAudio,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileCode,
  faFileArchive,
  faFolder,
  faFolderOpen,
  faSearch,
  faFilter,
  faThLarge,
  faList,
  faDownload,
  faTrash,
  faShare,
  faStar,
  faEye,
  faClock,
  faDatabase,
  faChartPie,
  faUsers,
  faArrowTrendUp,
  faEllipsisV,
  faSort,
  faChevronRight,
  faHome,
  faPlus,
  faTimes,
  faCheck,
  faCircle,
  faLayerGroup,
  faGripVertical,
  faCopy,
  faEdit,
  faLock,
  faGlobe,
  faCalendarDays,
  faBolt,
  faFire,
  faHardDrive,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpace } from '../hooks/useSpaces';
import { useThemeStore } from '../store/themeStore';

type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'spreadsheet' | 'code' | 'archive' | 'folder' | 'other';
type ViewMode = 'grid' | 'list' | 'compact';
type SortBy = 'name' | 'date' | 'size' | 'type';

interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  owner: {
    name: string;
    avatar: string;
  };
  modifiedAt: Date;
  starred: boolean;
  shared: boolean;
  tags: string[];
  path: string[];
  preview?: string;
  isFolder?: boolean;
  itemCount?: number;
}

interface StorageStats {
  total: number;
  used: number;
  images: number;
  videos: number;
  documents: number;
  other: number;
}

const MOCK_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Q1 Marketing Campaign',
    type: 'folder',
    size: 0,
    owner: { name: 'Sarah Chen', avatar: 'SC' },
    modifiedAt: new Date('2026-01-28'),
    starred: true,
    shared: true,
    tags: ['Marketing', 'Q1'],
    path: [],
    isFolder: true,
    itemCount: 24,
  },
  {
    id: '2',
    name: 'Product Wireframes v3.fig',
    type: 'image',
    size: 24500000,
    owner: { name: 'Alex Kumar', avatar: 'AK' },
    modifiedAt: new Date('2026-01-30'),
    starred: true,
    shared: false,
    tags: ['Design', 'Wireframes'],
    path: ['Design Assets'],
  },
  {
    id: '3',
    name: 'Demo Video Final.mp4',
    type: 'video',
    size: 128000000,
    owner: { name: 'Jamie Lee', avatar: 'JL' },
    modifiedAt: new Date('2026-01-29'),
    starred: false,
    shared: true,
    tags: ['Demo', 'Product'],
    path: ['Marketing'],
  },
  {
    id: '4',
    name: 'API Documentation.pdf',
    type: 'pdf',
    size: 3200000,
    owner: { name: 'Chris Park', avatar: 'CP' },
    modifiedAt: new Date('2026-01-27'),
    starred: false,
    shared: true,
    tags: ['Docs', 'API'],
    path: ['Documentation'],
  },
  {
    id: '5',
    name: 'Budget Spreadsheet.xlsx',
    type: 'spreadsheet',
    size: 1800000,
    owner: { name: 'Morgan Taylor', avatar: 'MT' },
    modifiedAt: new Date('2026-01-26'),
    starred: false,
    shared: false,
    tags: ['Finance', 'Budget'],
    path: ['Finance'],
  },
  {
    id: '6',
    name: 'main.tsx',
    type: 'code',
    size: 45000,
    owner: { name: 'Riley Johnson', avatar: 'RJ' },
    modifiedAt: new Date('2026-01-31'),
    starred: true,
    shared: false,
    tags: ['Code', 'Frontend'],
    path: ['Source Code'],
  },
  {
    id: '7',
    name: 'Assets Archive.zip',
    type: 'archive',
    size: 85000000,
    owner: { name: 'Taylor Swift', avatar: 'TS' },
    modifiedAt: new Date('2026-01-25'),
    starred: false,
    shared: true,
    tags: ['Archive', 'Assets'],
    path: [],
  },
  {
    id: '8',
    name: 'Meeting Notes.docx',
    type: 'document',
    size: 240000,
    owner: { name: 'Jordan Kim', avatar: 'JK' },
    modifiedAt: new Date('2026-01-30'),
    starred: false,
    shared: true,
    tags: ['Notes', 'Meeting'],
    path: ['Documents'],
  },
  {
    id: '9',
    name: 'Engineering Specs',
    type: 'folder',
    size: 0,
    owner: { name: 'Casey Brown', avatar: 'CB' },
    modifiedAt: new Date('2026-01-24'),
    starred: false,
    shared: true,
    tags: ['Engineering'],
    path: [],
    isFolder: true,
    itemCount: 12,
  },
  {
    id: '10',
    name: 'Brand Guidelines.pdf',
    type: 'pdf',
    size: 15600000,
    owner: { name: 'Sarah Chen', avatar: 'SC' },
    modifiedAt: new Date('2026-01-23'),
    starred: true,
    shared: true,
    tags: ['Brand', 'Design'],
    path: ['Marketing'],
  },
];

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'image': return faFileImage;
    case 'video': return faFileVideo;
    case 'audio': return faFileAudio;
    case 'pdf': return faFilePdf;
    case 'document': return faFileWord;
    case 'spreadsheet': return faFileExcel;
    case 'code': return faFileCode;
    case 'archive': return faFileArchive;
    case 'folder': return faFolder;
    default: return faFile;
  }
};

const getFileColor = (type: FileType) => {
  switch (type) {
    case 'image': return 'from-pink-500 to-rose-600';
    case 'video': return 'from-purple-500 to-indigo-600';
    case 'audio': return 'from-green-500 to-emerald-600';
    case 'pdf': return 'from-red-500 to-orange-600';
    case 'document': return 'from-blue-500 to-cyan-600';
    case 'spreadsheet': return 'from-emerald-500 to-teal-600';
    case 'code': return 'from-slate-500 to-gray-600';
    case 'archive': return 'from-amber-500 to-yellow-600';
    case 'folder': return 'from-indigo-500 to-purple-600';
    default: return 'from-gray-500 to-slate-600';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '—';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function FilesView() {
  const { id: spaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { data: space, isLoading: loadingSpace } = useSpace(spaceId);

  const [files] = useState<FileItem[]>(MOCK_FILES);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FileType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const isDark = theme === 'dark';

  const storageStats: StorageStats = {
    total: 10737418240, // 10 GB
    used: 7516192768, // 7 GB
    images: 2684354560,
    videos: 3221225472,
    documents: 1073741824,
    other: 536870912,
  };

  const filteredFiles = useMemo(() => {
    let result = files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || file.type === selectedType;
      return matchesSearch && matchesType;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.modifiedAt.getTime() - a.modifiedAt.getTime();
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return result;
  }, [files, searchQuery, selectedType, sortBy]);

  const stats = useMemo(() => {
    const totalFiles = filteredFiles.filter(f => !f.isFolder).length;
    const totalFolders = filteredFiles.filter(f => f.isFolder).length;
    const sharedFiles = filteredFiles.filter(f => f.shared).length;
    const starredFiles = filteredFiles.filter(f => f.starred).length;
    return { totalFiles, totalFolders, sharedFiles, starredFiles };
  }, [filteredFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', droppedFiles);
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  if (loadingSpace) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading files...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className={`h-full flex items-center justify-center ${isDark ? 'bg-transparent' : 'bg-white'}`}>
        <div className="text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Space not found</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full ${isDark ? 'bg-transparent' : 'bg-white'} overflow-hidden flex flex-col lg:flex-row gap-4`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <div className="text-center">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/50 animate-pulse">
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-white text-6xl" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Drop files to upload</h3>
              <p className="text-gray-400">Release to add files to this space</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <div className={`lg:w-64 w-full flex-shrink-0 ${isDark ? 'border-white/[0.06]' : 'border-gray-200 bg-gray-50/50'} border-r relative z-10 overflow-y-auto`}>
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
              <h2 className={`text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent`}>
                Files
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                {space?.name || 'Workspace'}
              </p>
            </div>
            <button
              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/35'
                  : 'bg-cyan-600 text-white hover:bg-cyan-700'
              }`}
            >
              <FontAwesomeIcon icon={faCloudArrowUp} className="mr-2" />
              Upload
            </button>
          </div>

          {/* Storage Stats */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Storage
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-2 rounded-lg border ${
                isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Used</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {((storageStats.used / storageStats.total) * 100).toFixed(0)}%
                </div>
              </div>
              <div className={`p-2 rounded-lg border ${
                isDark ? 'bg-white/[0.03] border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
              }`}>
                <div className={`text-xs ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>Files</div>
                <div className={`text-xl font-bold ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  {stats.totalFiles}
                </div>
              </div>
              <div className={`p-2 rounded-lg border ${
                isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Starred</div>
                <div className={`text-xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.starredFiles}</div>
              </div>
              <div className={`p-2 rounded-lg border ${
                isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Shared</div>
                <div className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.sharedFiles}</div>
              </div>
            </div>
            {/* Storage Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                  {formatFileSize(storageStats.used)}
                </span>
                <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                  {formatFileSize(storageStats.total)}
                </span>
              </div>
              <div className={`h-2 rounded-full ${isDark ? 'bg-white/[0.05]' : 'bg-gray-200'} overflow-hidden`}>
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* File Type Filter */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              File Types
            </p>
            <div className="space-y-1">
              {[
                { id: 'all' as const, label: 'All Files', icon: faFile, gradient: 'from-gray-500 to-slate-500', count: stats.totalFiles + stats.totalFolders },
                { id: 'folder' as const, label: 'Folders', icon: faFolder, gradient: 'from-yellow-500 to-orange-500', count: stats.totalFolders },
                { id: 'image' as const, label: 'Images', icon: faFileImage, gradient: 'from-pink-500 to-rose-500', count: Math.floor(stats.totalFiles * 0.4) },
                { id: 'document' as const, label: 'Documents', icon: faFileWord, gradient: 'from-blue-500 to-cyan-500', count: Math.floor(stats.totalFiles * 0.3) },
                { id: 'video' as const, label: 'Videos', icon: faFileVideo, gradient: 'from-purple-500 to-indigo-500', count: Math.floor(stats.totalFiles * 0.2) },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    selectedType === type.id
                      ? isDark
                        ? 'bg-cyan-500/[0.15] border-cyan-500/40 text-cyan-200'
                        : 'bg-cyan-50 border-cyan-200 text-cyan-700'
                      : isDark
                        ? 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={type.icon} className="text-xs text-gray-400" />
                  <span className="flex-1 text-left">{type.label}</span>
                  <span className={`text-[10px] ${selectedType === type.id ? (isDark ? 'text-cyan-300' : 'text-cyan-600') : (isDark ? 'text-gray-600' : 'text-gray-500')}`}>
                    {type.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Files */}
          <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-500'} font-semibold`}>
              Recent
            </p>
            <div className="space-y-1.5">
              {filteredFiles.slice(0, 5).map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full p-2 rounded-lg text-left transition-all ${
                    isDark
                      ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04]'
                      : 'bg-white hover:bg-gray-50 shadow shadow-gray-200/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded bg-gradient-to-br ${getFileColor(file.type)} flex items-center justify-center`}>
                      <FontAwesomeIcon icon={getFileIcon(file.type)} className="text-white text-[10px]" />
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate flex-1`}>
                      {file.name}
                    </span>
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
                    {file.isFolder ? `${file.itemCount} items` : formatFileSize(file.size)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">

        {/* Toolbar */}
        <div className={`rounded-2xl ${
          isDark
            ? 'bg-white/[0.02] border border-white/[0.06]'
            : 'bg-white border border-gray-200 shadow-sm'
        } p-4`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}
              />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${
                  isDark
                    ? 'bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-500 focus:border-cyan-500/30'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-cyan-500'
                } text-sm outline-none transition-all`}
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['all', 'folder', 'image', 'video', 'pdf', 'document'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedType === type
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      : isDark
                        ? 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.05] border border-white/[0.06]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort & View */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold ${
                  isDark
                    ? 'bg-white/[0.03] text-white border border-white/[0.06] hover:bg-white/[0.05]'
                    : 'bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200'
                } outline-none transition-all cursor-pointer`}
              >
                <option value="date">Sort: Date</option>
                <option value="name">Sort: Name</option>
                <option value="size">Sort: Size</option>
                <option value="type">Sort: Type</option>
              </select>

              <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900 shadow-sm'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faThLarge} className="text-sm" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900 shadow-sm'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faList} className="text-sm" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'compact'
                      ? isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900 shadow-sm'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Files Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedFile(file)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  selectedFiles.has(file.id)
                    ? isDark
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-cyan-50 border-cyan-200'
                    : isDark
                      ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file.id);
                    }}
                    className={`w-6 h-6 rounded-lg border transition-all ${
                      selectedFiles.has(file.id)
                        ? 'bg-cyan-500 border-cyan-400'
                        : isDark
                          ? 'border-white/30 bg-white/5 opacity-0 group-hover:opacity-100'
                          : 'border-gray-300 bg-white opacity-0 group-hover:opacity-100'
                    } flex items-center justify-center`}
                  >
                    {selectedFiles.has(file.id) && (
                      <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                    )}
                  </button>
                </div>

                {/* File Icon */}
                <div className={`w-full aspect-square rounded-xl ${
                  isDark ? 'bg-white/[0.02] border border-white/[0.06]' : 'bg-gray-100'
                } flex items-center justify-center mb-3 overflow-hidden transition-transform group-hover:scale-105`}>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getFileColor(file.type)} flex items-center justify-center shadow-sm`}>
                    <FontAwesomeIcon
                      icon={getFileIcon(file.type)}
                      className="text-white text-3xl"
                    />
                  </div>
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate flex-1 leading-tight`}>
                      {file.name}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {file.starred && (
                        <FontAwesomeIcon icon={faStar} className="text-amber-400 text-xs" />
                      )}
                      {file.shared && (
                        <FontAwesomeIcon icon={faUsers} className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getFileColor(file.type)} flex items-center justify-center text-[9px] font-bold text-white`}>
                      {file.owner.avatar}
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} truncate`}>{file.owner.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>
                      {file.isFolder ? `${file.itemCount} items` : formatFileSize(file.size)}
                    </span>
                    <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>{formatDate(file.modifiedAt)}</span>
                  </div>

                  {/* Tags */}
                  {file.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {file.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            isDark
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'bg-cyan-100 text-cyan-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {file.tags.length > 2 && (
                        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          +{file.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className={`flex-1 py-1.5 rounded-lg ${
                      isDark
                        ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } text-xs font-medium transition-all flex items-center justify-center gap-1`}>
                      <FontAwesomeIcon icon={faEye} />
                      View
                    </button>
                    <button className={`flex-1 py-1.5 rounded-lg ${
                      isDark
                        ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400'
                        : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700'
                    } text-xs font-medium transition-all flex items-center justify-center gap-1`}>
                      <FontAwesomeIcon icon={faDownload} />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className={`rounded-2xl ${
            isDark
              ? 'bg-white/[0.02] border border-white/[0.06]'
              : 'bg-white border border-gray-200 shadow-sm'
          } overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'} border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider w-8`}>
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Name</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Owner</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Modified</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Size</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Type</th>
                    <th className={`px-6 py-4 text-right text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredFiles.map((file) => (
                    <motion.tr
                      key={file.id}
                      whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                      className="cursor-pointer"
                      onClick={() => setSelectedFile(file)}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleFileSelection(file.id);
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getFileColor(file.type)} flex items-center justify-center shadow-sm flex-shrink-0`}>
                            <FontAwesomeIcon icon={getFileIcon(file.type)} className="text-white text-sm" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {file.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                    isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getFileColor(file.type)} flex items-center justify-center text-xs font-bold text-white`}>
                            {file.owner.avatar}
                          </div>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{file.owner.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faClock} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(file.modifiedAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {file.isFolder ? `${file.itemCount} items` : formatFileSize(file.size)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          isDark ? 'bg-white/[0.05] text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <FontAwesomeIcon icon={getFileIcon(file.type)} className="text-[10px]" />
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className={`w-8 h-8 rounded-lg ${
                            isDark ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-gray-100 hover:bg-gray-200'
                          } flex items-center justify-center transition-all`}>
                            <FontAwesomeIcon icon={faDownload} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button className={`w-8 h-8 rounded-lg ${
                            isDark ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-gray-100 hover:bg-gray-200'
                          } flex items-center justify-center transition-all`}>
                            <FontAwesomeIcon icon={faShare} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button className={`w-8 h-8 rounded-lg ${
                            isDark ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-100 hover:bg-red-200'
                          } flex items-center justify-center transition-all`}>
                            <FontAwesomeIcon icon={faTrash} className="text-xs text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl ${
            isDark
              ? 'bg-white/[0.02] border border-white/[0.06]'
              : 'bg-white border border-gray-200 shadow-sm'
          } p-4 space-y-2`}>
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedFile(file)}
                className={`group flex items-center gap-3 p-3 rounded-xl ${
                  selectedFiles.has(file.id)
                    ? isDark
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : 'bg-cyan-50 border border-cyan-200'
                    : isDark
                      ? 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04]'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                } cursor-pointer transition-all`}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleFileSelection(file.id);
                  }}
                  className="rounded"
                />
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getFileColor(file.type)} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <FontAwesomeIcon icon={getFileIcon(file.type)} className="text-white text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{file.name}</p>
                    {file.starred && <FontAwesomeIcon icon={faStar} className="text-amber-400 text-xs" />}
                    {file.shared && <FontAwesomeIcon icon={faUsers} className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={isDark ? 'text-gray-500' : 'text-gray-600'}>{file.owner.name}</span>
                    <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>
                      {file.isFolder ? `${file.itemCount} items` : formatFileSize(file.size)}
                    </span>
                    <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>{formatDate(file.modifiedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className={`w-8 h-8 rounded-lg ${
                    isDark ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-gray-100 hover:bg-gray-200'
                  } flex items-center justify-center transition-all`}>
                    <FontAwesomeIcon icon={faDownload} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                  <button className={`w-8 h-8 rounded-lg ${
                    isDark ? 'bg-cyan-500/10 hover:bg-cyan-500/20' : 'bg-cyan-100 hover:bg-cyan-200'
                  } flex items-center justify-center transition-all`}>
                    <FontAwesomeIcon icon={faShare} className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* File Detail Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFile(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-2xl ${
                isDark
                  ? 'bg-gray-900 border border-white/10'
                  : 'bg-white border border-gray-200'
              } p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getFileColor(selectedFile.type)} flex items-center justify-center shadow-lg`}>
                    <FontAwesomeIcon icon={getFileIcon(selectedFile.type)} className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{selectedFile.name}</h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedFile.isFolder ? `Folder • ${selectedFile.itemCount} items` : `${selectedFile.type} • ${formatFileSize(selectedFile.size)}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className={`w-10 h-10 rounded-xl ${
                    isDark ? 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                  } flex items-center justify-center transition-all`}
                >
                  <FontAwesomeIcon icon={faTimes} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Owner</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getFileColor(selectedFile.type)} flex items-center justify-center text-xs font-bold text-white`}>
                      {selectedFile.owner.avatar}
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedFile.owner.name}</span>
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Modified</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedFile.modifiedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Sharing</p>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={selectedFile.shared ? faGlobe : faLock}
                      className={`text-sm ${selectedFile.shared ? 'text-emerald-400' : 'text-amber-400'}`}
                    />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedFile.shared ? 'Shared' : 'Private'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-2`}>Path</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    /{selectedFile.path.join('/') || 'Root'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-600'} uppercase mb-3`}>Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className={`flex-1 py-3 rounded-xl ${
                  isDark
                    ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } font-semibold transition-all flex items-center justify-center gap-2`}>
                  <FontAwesomeIcon icon={faEye} />
                  Preview
                </button>
                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold transition-all flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </button>
                <button className={`flex-1 py-3 rounded-xl ${
                  isDark
                    ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } font-semibold transition-all flex items-center justify-center gap-2`}>
                  <FontAwesomeIcon icon={faShare} />
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

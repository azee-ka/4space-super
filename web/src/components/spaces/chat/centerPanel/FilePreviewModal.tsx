// File Preview Modal with Editing Capabilities
// web/src/components/spaces/chat/FilePreviewModal.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faDownload, faTrash, faEdit, faCrop, faRotate,
  faExpand, faCompress, faSearch, faSearchMinus, faSearchPlus,
  faPalette, faAdjust, faBrush, faFont, faHighlighter, faEraser,
  faMusic, faFile
} from '@fortawesome/free-solid-svg-icons';

interface FilePreviewModalProps {
  file: File;
  preview?: string;
  onClose: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

export function FilePreviewModal({
  file,
  preview,
  onClose,
  onDelete,
  onDownload,
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editMode, setEditMode] = useState<'none' | 'crop' | 'draw' | 'text'>('none');

  const fileType = file.type.startsWith('image/') ? 'image' :
                   file.type.startsWith('video/') ? 'video' :
                   file.type.startsWith('audio/') ? 'audio' :
                   file.type.includes('pdf') ? 'pdf' :
                   'document';

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleResetZoom = () => setZoom(100);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative ${
            isFullscreen ? 'w-full h-full' : 'max-w-6xl max-h-[90vh] w-[90vw]'
          } bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{file.name}</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {formatFileSize(file.size)} • {file.type || 'Unknown type'}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {/* Zoom Controls - Only for images */}
              {fileType === 'image' && (
                <>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 25}
                    className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    title="Zoom out"
                  >
                    <FontAwesomeIcon icon={faSearchMinus} className="text-gray-400 text-sm" />
                  </button>

                  <button
                    onClick={handleResetZoom}
                    className="px-3 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                    title="Reset zoom"
                  >
                    <span className="text-sm text-gray-400 font-medium">{zoom}%</span>
                  </button>

                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    title="Zoom in"
                  >
                    <FontAwesomeIcon icon={faSearchPlus} className="text-gray-400 text-sm" />
                  </button>

                  <div className="w-px h-6 bg-zinc-700/50 mx-1" />

                  {/* Rotate */}
                  <button
                    onClick={handleRotate}
                    className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                    title="Rotate"
                  >
                    <FontAwesomeIcon icon={faRotate} className="text-gray-400 text-sm" />
                  </button>

                  <div className="w-px h-6 bg-zinc-700/50 mx-1" />
                </>
              )}

              {/* Fullscreen */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <FontAwesomeIcon 
                  icon={isFullscreen ? faCompress : faExpand} 
                  className="text-gray-400 text-sm" 
                />
              </button>

              {/* Download */}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="w-9 h-9 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center transition-colors"
                  title="Download"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-cyan-400 text-sm" />
                </button>
              )}

              {/* Delete */}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-red-400 text-sm" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                title="Close"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-400 text-sm" />
              </button>
            </div>
          </div>

          {/* Edit Toolbar - Only for images */}
          {fileType === 'image' && (
            <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <button
                onClick={() => setEditMode(editMode === 'crop' ? 'none' : 'crop')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  editMode === 'crop'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800'
                }`}
              >
                <FontAwesomeIcon icon={faCrop} className="text-sm" />
                <span className="text-sm font-medium">Crop</span>
              </button>

              <button
                onClick={() => setEditMode(editMode === 'draw' ? 'none' : 'draw')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  editMode === 'draw'
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                    : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800'
                }`}
              >
                <FontAwesomeIcon icon={faBrush} className="text-sm" />
                <span className="text-sm font-medium">Draw</span>
              </button>

              <button
                onClick={() => setEditMode(editMode === 'text' ? 'none' : 'text')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  editMode === 'text'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800'
                }`}
              >
                <FontAwesomeIcon icon={faFont} className="text-sm" />
                <span className="text-sm font-medium">Text</span>
              </button>

              <div className="w-px h-6 bg-zinc-700/50 mx-2" />

              <button className="px-4 py-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:bg-zinc-800 flex items-center gap-2 transition-colors">
                <FontAwesomeIcon icon={faAdjust} className="text-sm" />
                <span className="text-sm font-medium">Filters</span>
              </button>

              <div className="flex-1" />

              {editMode !== 'none' && (
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:bg-zinc-800 transition-colors">
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors">
                    <span className="text-sm font-medium">Apply</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-auto custom-scrollbar bg-zinc-950/50">
            <div className="min-h-full flex items-center justify-center p-6">
              {/* Image */}
              {fileType === 'image' && preview && (
                <motion.img
                  src={preview}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                  drag
                  dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  dragElastic={0.1}
                />
              )}

              {/* Video */}
              {fileType === 'video' && preview && (
                <video
                  src={preview}
                  controls
                  className="max-w-full max-h-full rounded-lg"
                  style={{ maxHeight: '70vh' }}
                />
              )}

              {/* Audio */}
              {fileType === 'audio' && preview && (
                <div className="w-full max-w-2xl">
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <FontAwesomeIcon icon={faMusic} className="text-white text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{file.name}</h4>
                        <p className="text-sm text-gray-400">Audio File</p>
                      </div>
                    </div>
                    <audio src={preview} controls className="w-full" />
                  </div>
                </div>
              )}

              {/* Document/Other */}
              {!['image', 'video', 'audio'].includes(fileType) && (
                <div className="text-center p-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faFile} className="text-5xl text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{file.name}</h4>
                  <p className="text-gray-400 mb-6">{formatFileSize(file.size)}</p>
                  <div className="flex items-center justify-center gap-3">
                    {onDownload && (
                      <button
                        onClick={onDownload}
                        className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-zinc-800/50 bg-zinc-900/30">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created: {new Date(file.lastModified).toLocaleString()}</span>
              {fileType === 'image' && preview && (
                <span>Click and drag to pan • Scroll to zoom</span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
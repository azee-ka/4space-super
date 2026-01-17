// Create Session Modal - Configure session before starting
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faTrash, faVideo, faPhone, faDesktop, faCog } from '@fortawesome/free-solid-svg-icons';
import './futuristic-styles.css';

interface CreateSessionModalProps {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description?: string;
    purpose?: string;
    guidelines?: string[];
    type: 'voice' | 'video' | 'screen-share';
    maxParticipants?: number;
    requiresApproval: boolean;
  }) => void;
  defaultType: 'voice' | 'video';
}

export function CreateSessionModal({ onClose, onCreate, defaultType }: CreateSessionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [newGuideline, setNewGuideline] = useState('');
  const [type, setType] = useState<'voice' | 'video' | 'screen-share'>(defaultType);
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(undefined);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const addGuideline = () => {
    if (newGuideline.trim()) {
      setGuidelines([...guidelines, newGuideline.trim()]);
      setNewGuideline('');
    }
  };

  const removeGuideline = (index: number) => {
    setGuidelines(guidelines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: title || `${type === 'video' ? 'Video' : type === 'voice' ? 'Voice' : 'Screen'} Call`,
      description: description || undefined,
      purpose: purpose || undefined,
      guidelines: guidelines.length > 0 ? guidelines : undefined,
      type,
      maxParticipants,
      requiresApproval,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="call-window-border call-window-neon rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 call-title-bar">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-cyan-500/30">
              <FontAwesomeIcon icon={faCog} className="text-cyan-400 text-lg" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold glow-text-cyan">Start a Session</h2>
              <p className="text-cyan-500/70 text-xs">Configure your call settings</p>
            </div>
          </div>
          <button onClick={onClose} className="control-btn w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-black/50 to-zinc-950/50">
          {/* Type Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-cyan-400 mb-3">
              <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full" />
              Session Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('voice')}
                className={`px-4 py-4 rounded-xl text-sm font-bold transition flex flex-col items-center gap-2 ${
                  type === 'voice' ? 'btn-active-green text-white' : 'control-btn text-gray-400 hover:text-green-400'
                }`}
              >
                <FontAwesomeIcon icon={faPhone} className="text-lg" />
                Voice
              </button>
              <button
                type="button"
                onClick={() => setType('video')}
                className={`px-4 py-4 rounded-xl text-sm font-bold transition flex flex-col items-center gap-2 ${
                  type === 'video' ? 'btn-active-red text-white' : 'control-btn text-gray-400 hover:text-red-400'
                }`}
              >
                <FontAwesomeIcon icon={faVideo} className="text-lg" />
                Video
              </button>
              <button
                type="button"
                onClick={() => setType('screen-share')}
                className={`px-4 py-4 rounded-xl text-sm font-bold transition flex flex-col items-center gap-2 ${
                  type === 'screen-share' ? 'btn-active-cyan text-white' : 'control-btn text-gray-400 hover:text-cyan-400'
                }`}
              >
                <FontAwesomeIcon icon={faDesktop} className="text-lg" />
                Screen
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${type === 'video' ? 'Video' : type === 'voice' ? 'Voice' : 'Screen'} Call`}
              className="w-full bg-zinc-800 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this session about?"
              rows={3}
              className="w-full bg-zinc-800 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Purpose (Optional)</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Team Standup, Planning, Review"
              className="w-full bg-zinc-800 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Guidelines */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Guidelines (Optional)</label>
            <div className="space-y-2">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg">
                  <span className="flex-1 text-sm text-white">{guideline}</span>
                  <button
                    type="button"
                    onClick={() => removeGuideline(index)}
                    className="w-6 h-6 rounded hover:bg-zinc-700 flex items-center justify-center text-red-400 hover:text-red-300"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 box-border">
                <input
                  type="text"
                  value={newGuideline}
                  onChange={(e) => setNewGuideline(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGuideline())}
                  placeholder="Add a guideline..."
                  className="flex-1 bg-zinc-800 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 box-border"
                />
                <button
                  type="button"
                  onClick={addGuideline}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-300">Max Participants</p>
                <p className="text-xs text-gray-500">Leave empty for unlimited</p>
              </div>
              <input
                type="number"
                value={maxParticipants || ''}
                onChange={(e) => setMaxParticipants(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="∞"
                min="2"
                max="100"
                className="w-20 bg-zinc-800 text-white text-center px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-gray-300">Require Approval</p>
                <p className="text-xs text-gray-500">Manually approve participants</p>
              </div>
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
              />
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition">
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faClock, faBolt } from '@fortawesome/free-solid-svg-icons';

interface RoomCallPanelProps {
  roomName?: string;
  mode: 'voice' | 'video';
  onModeChange: (mode: 'voice' | 'video') => void;
}

export function RoomCallPanel({ roomName, mode, onModeChange }: RoomCallPanelProps) {
  const isVoice = mode === 'voice';

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isVoice ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <FontAwesomeIcon icon={isVoice ? faPhone : faVideo} className={isVoice ? 'text-green-400 text-sm' : 'text-red-400 text-sm'} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Call Center</h3>
          <p className="text-xs text-gray-500">{roomName ? `Room #${roomName}` : 'Start a room call'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onModeChange('voice')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            isVoice ? 'bg-green-500/20 text-green-300' : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-800'
          }`}
        >
          <FontAwesomeIcon icon={faPhone} className="mr-2" />
          Voice
        </button>
        <button
          onClick={() => onModeChange('video')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            !isVoice ? 'bg-red-500/20 text-red-300' : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-800'
          }`}
        >
          <FontAwesomeIcon icon={faVideo} className="mr-2" />
          Video
        </button>
      </div>

      <div className="rounded-xl bg-zinc-800/60 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBolt} className="text-amber-400 text-xs" />
          <p className="text-xs font-semibold text-gray-300">Ready to start</p>
        </div>
        <p className="text-xs text-gray-500">
          Start a {isVoice ? 'voice' : 'video'} call with members in this room.
        </p>
        <button
          className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            isVoice ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          Start {isVoice ? 'Voice' : 'Video'} Call
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Recent Calls</h4>
            <p className="text-xs text-gray-500">History will appear here</p>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-xs text-gray-500">
          No call history yet.
        </div>
      </div>
    </div>
  );
}

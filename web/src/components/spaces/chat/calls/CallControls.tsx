// Advanced Call Controls - Professional Feature-Rich Control Panel
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faDesktop,
  faPhoneSlash,
  faHandPaper,
  faSmile,
  faComment,
  faRecordVinyl,
  faClosedCaptioning,
  faUserPlus,
  faCog,
  faChevronUp,
  faWaveSquare,
  faFilter,
  faAdjust,
} from '@fortawesome/free-solid-svg-icons';

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isVideo: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
  onEndCall: () => void;
}

export function CallControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isVideo,
  onToggleMute,
  onToggleVideo,
  onScreenShare,
  onEndCall,
}: CallControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  return (
    <div className="flex-shrink-0 bg-zinc-800 border-t border-zinc-700">
      {/* Advanced Settings Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-4 gap-3 bg-zinc-900">
              {/* Audio Effects */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faWaveSquare} />
                <span className="text-xs">Noise Cancellation</span>
              </button>

              {/* Background Blur */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faFilter} />
                <span className="text-xs">Background Blur</span>
              </button>

              {/* Beauty Filter */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faAdjust} />
                <span className="text-xs">Beauty Filter</span>
              </button>

              {/* Recording */}
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition ${
                  isRecording
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faRecordVinyl} className={isRecording ? 'animate-pulse' : ''} />
                <span className="text-xs">{isRecording ? 'Recording...' : 'Record'}</span>
              </button>

              {/* Captions */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition ${
                  showCaptions
                    ? 'bg-cyan-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faClosedCaptioning} />
                <span className="text-xs">Captions</span>
              </button>

              {/* Invite */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faUserPlus} />
                <span className="text-xs">Invite</span>
              </button>

              {/* Reactions */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faSmile} />
                <span className="text-xs">Reactions</span>
              </button>

              {/* Chat */}
              <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faComment} />
                <span className="text-xs">Chat</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Audio Control with Dropdown */}
          <div className="relative group">
            <button
              onClick={onToggleMute}
              className={`relative h-12 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                isMuted
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-white'
              }`}
            >
              <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} className="text-lg" />
              <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {/* Audio Settings Dropdown */}
            <button
              onClick={() => setShowAudioSettings(!showAudioSettings)}
              className={`absolute right-0 top-0 bottom-0 w-8 rounded-r-xl transition-all border-l border-black/20 ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
            >
              <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
            </button>

            {showAudioSettings && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 p-3">
                <p className="text-white text-sm font-semibold mb-2">Audio Settings</p>
                <div className="space-y-2 text-gray-400 text-xs">
                  <div className="p-2 hover:bg-zinc-700 rounded cursor-pointer">Default Microphone</div>
                  <div className="p-2 hover:bg-zinc-700 rounded cursor-pointer">External Microphone</div>
                  <div className="border-t border-zinc-700 my-2" />
                  <div className="p-2 hover:bg-zinc-700 rounded cursor-pointer">Test Audio</div>
                </div>
              </div>
            )}
          </div>

          {/* Video Control */}
          {isVideo && (
            <div className="relative group">
              <button
                onClick={onToggleVideo}
                className={`relative h-12 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  isVideoOff
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
                <FontAwesomeIcon icon={isVideoOff ? faVideoSlash : faVideo} className="text-lg" />
                <span className="text-sm">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
              </button>

              <button
                onClick={() => setShowVideoSettings(!showVideoSettings)}
                className={`absolute right-0 top-0 bottom-0 w-8 rounded-r-xl transition-all border-l border-black/20 ${
                  isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
              >
                <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
              </button>

              {showVideoSettings && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 p-3">
                  <p className="text-white text-sm font-semibold mb-2">Video Settings</p>
                  <div className="space-y-2 text-gray-400 text-xs">
                    <div className="p-2 hover:bg-zinc-700 rounded cursor-pointer">Built-in Camera</div>
                    <div className="p-2 hover:bg-zinc-700 rounded cursor-pointer">External Webcam</div>
                    <div className="border-t border-zinc-700 my-2" />
                    <div className="p-2 hover:bg-zinc-700 rounded cursor-pointer">Virtual Background</div>
                    <div className="p-2 hover:bg-zinc-700 rounded cursor-pointer">Touch Up Appearance</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screen Share */}
          {isVideo && (
            <button
              onClick={onScreenShare}
              className={`h-12 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                isScreenSharing
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-white'
              }`}
            >
              <FontAwesomeIcon icon={faDesktop} className="text-lg" />
              <span className="text-sm">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
            </button>
          )}

          {/* Raise Hand */}
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`h-12 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              handRaised
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-white'
            }`}
          >
            <FontAwesomeIcon icon={faHandPaper} className="text-lg" />
            <span className="text-sm">{handRaised ? 'Lower Hand' : 'Raise Hand'}</span>
          </button>

          {/* More Options */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-12 px-5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              showAdvanced
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-white'
            }`}
          >
            <FontAwesomeIcon icon={faCog} className="text-lg" />
            <span className="text-sm">More</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="h-12 px-6 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPhoneSlash} className="text-lg" />
            <span className="text-sm">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}

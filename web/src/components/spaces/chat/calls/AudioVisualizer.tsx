// Revolutionary Audio Visualizer - Beautiful 3D Avatars with Sound Waves
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import type { CallParticipant } from '@4space/shared/src/services/webrtc.service';

interface AudioVisualizerProps {
  participants: CallParticipant[];
  localStream: MediaStream | null;
}

export function AudioVisualizer({ participants, localStream }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevels, setAudioLevels] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!localStream) return;

    // Set up audio analysis
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(localStream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalized = average / 255;

      // Update audio level for current user
      const currentUser = participants.find(p => !p.userId.startsWith('remote-'));
      if (currentUser) {
        setAudioLevels(prev => new Map(prev.set(currentUser.userId, normalized)));
      }

      requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();

    return () => {
      audioContext.close();
    };
  }, [localStream, participants]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-8">
          {participants.map((participant) => {
            const audioLevel = audioLevels.get(participant.userId) || 0;
            const isSpeaking = audioLevel > 0.1 && !participant.isMuted;

            return (
              <motion.div
                key={participant.userId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                {/* Avatar with Audio Rings */}
                <div className="relative mb-4">
                  {/* Animated Audio Rings */}
                  {isSpeaking && (
                    <>
                      <motion.div
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                        className="absolute inset-0 -m-8 rounded-full border-4 border-cyan-500"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 0, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.3,
                        }}
                        className="absolute inset-0 -m-6 rounded-full border-4 border-purple-500"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 0, 0.8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.6,
                        }}
                        className="absolute inset-0 -m-4 rounded-full border-4 border-cyan-400"
                      />
                    </>
                  )}

                  {/* Glow Effect */}
                  <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-300 ${
                    isSpeaking
                      ? 'bg-gradient-to-br from-cyan-500/50 via-purple-500/50 to-cyan-500/50 scale-110'
                      : 'bg-gradient-to-br from-gray-500/20 to-gray-600/20'
                  }`} />

                  {/* Avatar Circle */}
                  <motion.div
                    animate={{
                      scale: isSpeaking ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: isSpeaking ? Infinity : 0,
                    }}
                    className={`relative w-32 h-32 rounded-full overflow-hidden border-4 transition-all ${
                      isSpeaking
                        ? 'border-cyan-400 shadow-2xl shadow-cyan-500/50'
                        : 'border-gray-700'
                    }`}
                  >
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isSpeaking
                          ? 'bg-gradient-to-br from-cyan-500 to-purple-600'
                          : 'bg-gradient-to-br from-gray-700 to-gray-800'
                      }`}>
                        <FontAwesomeIcon icon={faUser} className="text-white text-4xl" />
                      </div>
                    )}

                    {/* Muted Overlay */}
                    {participant.isMuted && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                          <FontAwesomeIcon icon={faMicrophoneSlash} className="text-white text-lg" />
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Audio Level Indicator */}
                  {isSpeaking && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24">
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${audioLevel * 100}%` }}
                          transition={{ duration: 0.1 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="text-center">
                  <p className="text-white font-semibold text-lg mb-1">
                    {participant.displayName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {participant.isMuted ? 'Muted' : isSpeaking ? 'Speaking...' : 'Listening'}
                  </p>
                </div>

                {/* Decorative Sound Bars */}
                {isSpeaking && (
                  <div className="flex items-end justify-center gap-1 mt-4 h-12">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [
                            `${20 + Math.random() * 60}%`,
                            `${20 + Math.random() * 60}%`,
                            `${20 + Math.random() * 60}%`,
                          ],
                        }}
                        transition={{
                          duration: 0.3 + i * 0.1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="w-1.5 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* No Participants Message */}
        {participants.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-gray-400 text-5xl" />
            </div>
            <p className="text-gray-400 text-lg">Waiting for participants to join...</p>
          </div>
        )}
      </div>

      {/* Animated Background Waves */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}

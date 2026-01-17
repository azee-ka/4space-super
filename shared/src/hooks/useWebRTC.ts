// Simple WebRTC Call Hook for Professional Calling
// Like Telegram/Instagram - clean and reliable

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SimpleWebRTCCall, type CallParticipant } from '../services/webrtc.service';

export interface UseWebRTCHookReturn {
  // Call state
  isInCall: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: CallParticipant[];

  // Call actions
  startCall: (isVideo: boolean) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;

  // Call status
  isMuted: boolean;
  isVideoOff: boolean;
  error: string | null;
}

export function createWebRTCHooks(supabase: SupabaseClient) {
  return function useWebRTC(roomId: string, userId: string, userName: string = 'You'): UseWebRTCHookReturn {
    const [isInCall, setIsInCall] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [participants, setParticipants] = useState<CallParticipant[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callRef = useRef<SimpleWebRTCCall | null>(null);

    const startCall = useCallback(async (isVideo: boolean = false) => {
      if (!roomId || !userId) {
        setError('Room and user information required');
        return;
      }

      try {
        console.log('[useWebRTC] Starting call, isVideo:', isVideo);
        setIsConnecting(true);
        setError(null);
        setIsVideoOff(!isVideo);

        // Initialize call
        callRef.current = new SimpleWebRTCCall(
          supabase,
          roomId,
          userId,
          userName,
          (updatedParticipants) => {
            console.log('[useWebRTC] Participants updated:', updatedParticipants.length);
            setParticipants(updatedParticipants);
          },
          (userId, stream) => {
            console.log('[useWebRTC] Remote stream added for user:', userId);
            setRemoteStreams(prev => new Map(prev.set(userId, stream)));
          }
        );

        // Start the call
        const stream = await callRef.current.startCall(isVideo);
        console.log('[useWebRTC] Call started successfully, stream:', stream);

        setLocalStream(stream);
        setIsInCall(true);

        // Update mute status
        const audioTracks = stream.getAudioTracks();
        setIsMuted(audioTracks.length === 0 || !audioTracks[0].enabled);

        setIsConnecting(false);
        console.log('[useWebRTC] Call setup complete, isInCall:', true);

      } catch (err) {
        console.error('[useWebRTC] Failed to start call:', err);
        setError(err instanceof Error ? err.message : 'Failed to start call');
        setIsConnecting(false);
        setIsInCall(false);
      }
    }, [roomId, userId, userName, supabase]);

    const endCall = useCallback(() => {
      if (callRef.current) {
        callRef.current.endCall();
        callRef.current = null;
      }

      // Clean up streams
      if (localStream) {
        localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }

      setIsInCall(false);
      setIsConnecting(false);
      setLocalStream(null);
      setRemoteStreams(new Map());
      setParticipants([]);
      setIsMuted(false);
      setIsVideoOff(false);
      setError(null);
    }, [localStream]);

    const toggleMute = useCallback(() => {
      if (callRef.current) {
        callRef.current.toggleMute();
        setIsMuted(!isMuted);
      }
    }, [isMuted]);

    const toggleVideo = useCallback(() => {
      if (callRef.current) {
        callRef.current.toggleVideo();
        setIsVideoOff(!isVideoOff);
      }
    }, [isVideoOff]);

    // Cleanup on unmount only
    useEffect(() => {
      return () => {
        // Only cleanup when component unmounts, not on every render
        if (callRef.current) {
          callRef.current.endCall();
          callRef.current = null;
        }
        if (localStream) {
          localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
      };
    }, []); // Empty dependency array - only run on mount/unmount

    return {
      isInCall,
      isConnecting,
      localStream,
      remoteStreams,
      participants,
      startCall,
      endCall,
      toggleMute,
      toggleVideo,
      isMuted,
      isVideoOff,
      error
    };
  };
}
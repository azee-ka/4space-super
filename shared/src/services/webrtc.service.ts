// Simple WebRTC Service for Group Calls
// Uses Supabase Realtime for signaling - works reliably

import type { SupabaseClient } from '@supabase/supabase-js';

export interface CallParticipant {
  userId: string;
  displayName: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  joinedAt: number;
  handRaised?: boolean;
  isSpeaking?: boolean;
}

export class SimpleWebRTCCall {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private signalingChannel: any = null;
  private participants: Map<string, CallParticipant> = new Map();
  private callId: string;

  constructor(
    private supabase: SupabaseClient,
    private roomId: string,
    private userId: string,
    private userName: string,
    private onParticipantUpdate: (participants: CallParticipant[]) => void,
    private onRemoteStream: (userId: string, stream: MediaStream) => void
  ) {
    this.callId = `call-${roomId}-${Date.now()}`;
  }

  async startCall(isVideo: boolean = false): Promise<MediaStream> {
    try {
      console.log('[WebRTC] Starting call, isVideo:', isVideo);

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo ? { width: 640, height: 480 } : false
      });

      console.log('[WebRTC] Got local stream:', this.localStream.getTracks().map(t => `${t.kind}: ${t.label}`));

      // Set up signaling
      this.setupSignaling();

      // Add ourselves as participant
      this.participants.set(this.userId, {
        userId: this.userId,
        displayName: this.userName,
        isMuted: false,
        isVideoOff: !isVideo,
        joinedAt: Date.now()
      });

      console.log('[WebRTC] Added self as participant, total participants:', this.participants.size);

      this.notifyParticipantsUpdate();

      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Failed to start call:', error);
      throw error;
    }
  }

  private setupSignaling() {
    const channel = this.supabase.channel(`webrtc-${this.roomId}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel.on('broadcast', { event: 'webrtc-signal' }, ({ payload }) => {
      this.handleSignalingMessage(payload);
    });

    channel.on('broadcast', { event: 'participant-joined' }, ({ payload }) => {
      if (payload.userId !== this.userId) {
        this.handleParticipantJoined(payload);
      }
    });

    channel.on('broadcast', { event: 'participant-left' }, ({ payload }) => {
      this.handleParticipantLeft(payload.userId);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Announce our presence after subscription is confirmed
        await channel.send({
          type: 'broadcast',
          event: 'participant-joined',
          payload: {
            userId: this.userId,
            displayName: this.userName,
            callId: this.callId
          }
        });
      }
    });

    this.signalingChannel = channel;
  }

  private handleParticipantJoined(participant: any) {
    if (participant.callId !== this.callId) return; // Different call

    this.participants.set(participant.userId, {
      userId: participant.userId,
      displayName: participant.displayName,
      isMuted: false,
      isVideoOff: false,
      joinedAt: Date.now()
    });

    this.notifyParticipantsUpdate();

    // Create peer connection for new participant
    this.createPeerConnection(participant.userId, true);
  }

  private handleParticipantLeft(userId: string) {
    this.participants.delete(userId);
    this.notifyParticipantsUpdate();

    // Clean up peer connection
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
  }

  private createPeerConnection(targetUserId: string, isInitiator: boolean) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnections.set(targetUserId, pc);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      this.onRemoteStream(targetUserId, event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: {
            type: 'ice-candidate',
            fromUserId: this.userId,
            toUserId: targetUserId,
            candidate: event.candidate,
            callId: this.callId
          }
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${targetUserId}:`, pc.connectionState);
    };

    // Start negotiation if we're the initiator
    if (isInitiator) {
      this.initiateCall(targetUserId, pc);
    }
  }

  private async initiateCall(targetUserId: string, pc: RTCPeerConnection) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.signalingChannel.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          type: 'offer',
          fromUserId: this.userId,
          toUserId: targetUserId,
          offer: offer,
          callId: this.callId
        }
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }

  private async handleSignalingMessage(message: any) {
    if (message.callId !== this.callId || message.toUserId !== this.userId) return;

    const pc = this.peerConnections.get(message.fromUserId);
    if (!pc) return;

    try {
      switch (message.type) {
        case 'offer':
          await pc.setRemoteDescription(new RTCSessionDescription(message.offer));

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          this.signalingChannel.send({
            type: 'broadcast',
            event: 'webrtc-signal',
            payload: {
              type: 'answer',
              fromUserId: this.userId,
              toUserId: message.fromUserId,
              answer: answer,
              callId: this.callId
            }
          });
          break;

        case 'answer':
          await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
          break;

        case 'ice-candidate':
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
      }
    } catch (error) {
      console.error('Signaling error:', error);
    }
  }

  toggleMute() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });

      // Update our participant status
      const participant = this.participants.get(this.userId);
      if (participant) {
        participant.isMuted = !participant.isMuted;
        this.notifyParticipantsUpdate();
      }
    }
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });

      // Update our participant status
      const participant = this.participants.get(this.userId);
      if (participant) {
        participant.isVideoOff = !participant.isVideoOff;
        this.notifyParticipantsUpdate();
      }
    }
  }

  raiseHand(raised: boolean) {
    const participant = this.participants.get(this.userId);
    if (participant) {
      participant.handRaised = raised;
      this.notifyParticipantsUpdate();

      // Broadcast hand raise status
      if (this.signalingChannel) {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'hand-raised',
          payload: {
            userId: this.userId,
            userName: this.userName,
            raised,
            callId: this.callId
          }
        });
      }
    }
  }

  async startScreenShare(): Promise<MediaStream | null> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Broadcast screen share start
      if (this.signalingChannel) {
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'screen-share-started',
          payload: {
            userId: this.userId,
            userName: this.userName,
            callId: this.callId
          }
        });
      }

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      return screenStream;
    } catch (err) {
      console.error('[WebRTC] Screen share failed:', err);
      return null;
    }
  }

  stopScreenShare() {
    // Broadcast screen share end
    if (this.signalingChannel) {
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'screen-share-ended',
        payload: {
          userId: this.userId,
          callId: this.callId
        }
      });
    }

    // Restore camera video if available
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        this.peerConnections.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
    }
  }

  endCall() {
    // Leave the call
    if (this.signalingChannel) {
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'participant-left',
        payload: {
          userId: this.userId,
          callId: this.callId
        }
      });
    }

    // Clean up
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    if (this.signalingChannel) {
      this.signalingChannel.unsubscribe();
    }

    this.participants.clear();
  }

  getParticipants(): CallParticipant[] {
    return Array.from(this.participants.values());
  }

  private notifyParticipantsUpdate() {
    this.onParticipantUpdate(this.getParticipants());
  }
}

// WebRTC Peer Connection Manager
export class WebRTCCallManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private signalingService: WebRTCSignalingService;
  private roomId: string;
  private userId: string;
  private signalingChannel: any = null;

  constructor(
    supabase: SupabaseClient,
    roomId: string,
    userId: string
  ) {
    this.signalingService = new WebRTCSignalingService(supabase);
    this.roomId = roomId;
    this.userId = userId;

    // Initialize with free STUN servers
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
  }

  async startCall(isVideo: boolean = false) {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });

      // Add tracks to peer connection
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Set up signaling
      this.signalingChannel = this.signalingService.onSignal(
        this.roomId,
        this.handleSignalingMessage.bind(this)
      );

      // Create offer if we're the caller
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // Send offer via signaling
      await this.signalingService.sendSignal({
        type: 'offer',
        fromUserId: this.userId,
        toUserId: 'all', // Broadcast to room
        roomId: this.roomId,
        data: offer
      });

      return this.localStream;
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }

  private async handleSignalingMessage(message: SignalingMessage) {
    if (message.fromUserId === this.userId) return; // Ignore our own messages

    try {
      switch (message.type) {
        case 'offer':
          // Received call offer
          await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await this.peerConnection!.createAnswer();
          await this.peerConnection!.setLocalDescription(answer);

          await this.signalingService.sendSignal({
            type: 'answer',
            fromUserId: this.userId,
            toUserId: message.fromUserId,
            roomId: this.roomId,
            data: answer
          });
          break;

        case 'answer':
          // Received call answer
          await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(message.data));
          break;

        case 'ice-candidate':
          // Received ICE candidate
          await this.peerConnection!.addIceCandidate(new RTCIceCandidate(message.data));
          break;
      }
    } catch (error) {
      console.error('Signaling error:', error);
    }
  }

  // Handle incoming ICE candidates
  setupIceHandling() {
    this.peerConnection!.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingService.sendSignal({
          type: 'ice-candidate',
          fromUserId: this.userId,
          toUserId: 'all',
          roomId: this.roomId,
          data: event.candidate
        });
      }
    };
  }

  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    if (this.signalingChannel) {
      this.signalingService.unsubscribe(this.signalingChannel);
    }
  }

  getRemoteStream(): Promise<MediaStream> {
    return new Promise((resolve) => {
      this.peerConnection!.ontrack = (event) => {
        resolve(event.streams[0]);
      };
    });
  }
}
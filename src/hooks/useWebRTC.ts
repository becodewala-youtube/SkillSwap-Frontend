import { useRef, useState, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const useWebRTC = () => {
  const { socket } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const currentCallId = useRef<string | null>(null);

  const initializePeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_ice_candidate', {
          candidate: event.candidate,
          callId: currentCallId.current
        });
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [socket]);

  const startCall = useCallback(async (targetUserId: string, type: 'audio' | 'video') => {
    try {
      setCallType(type);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      
      setLocalStream(stream);
      setIsCallActive(true);

      const peerConnection = initializePeerConnection();
      
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      if (socket) {
        socket.emit('call_user', {
          targetUserId,
          callType: type
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }, [socket, initializePeerConnection]);

  const answerCall = useCallback(async (callId: string, type: 'audio' | 'video') => {
    try {
      setCallType(type);
      currentCallId.current = callId;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      
      setLocalStream(stream);
      setIsCallActive(true);

      const peerConnection = initializePeerConnection();
      
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      if (socket) {
        socket.emit('answer_call', {
          callId,
          accepted: true
        });
      }
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }, [socket, initializePeerConnection]);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    setIsCallActive(false);

    if (socket && currentCallId.current) {
      socket.emit('end_call', {
        callId: currentCallId.current
      });
    }

    currentCallId.current = null;
  }, [socket, localStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);

    if (socket) {
      socket.emit('webrtc_answer', {
        answer,
        callId: currentCallId.current
      });
    }
  }, [socket]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(answer);
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.addIceCandidate(candidate);
  }, []);

  return {
    localStream,
    remoteStream,
    isCallActive,
    callType,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    handleOffer,
    handleAnswer,
    handleIceCandidate
  };
};
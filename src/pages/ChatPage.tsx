import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile, 
  Paperclip, 
  Image as ImageIcon,
  Mic,
  MicOff,
  VideoOff,
  X,
  Download,
  FileText,
  PhoneCall,
  PhoneOff,
  User,
  UserX,
  Flag
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { getMessages, markMessagesAsRead, clearCurrentMessages } from '../store/slices/messagesSlice';
import { getRequestById } from '../store/slices/requestsSlice';
import { useSocket } from '../contexts/SocketContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { formatMessageTime, getInitials } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

// WebRTC Configuration
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const ChatPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentMessages, isLoading } = useSelector((state: RootState) => state.messages);
  const { currentRequest } = useSelector((state: RootState) => state.requests);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { socket, joinChat, leaveChat, sendMessage } = useSocket();
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Call states
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  
  // WebRTC refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const otherUser = currentRequest?.senderId._id === user?._id 
    ? currentRequest?.receiverId 
    : currentRequest?.senderId;

  useEffect(() => {
    if (requestId) {
      dispatch(getRequestById(requestId));
      dispatch(getMessages({ requestId }));
      joinChat(requestId);
    }

    return () => {
      if (requestId) {
        leaveChat(requestId);
      }
      dispatch(clearCurrentMessages());
      cleanupCall();
    };
  }, [requestId, dispatch, joinChat, leaveChat]);

  useEffect(() => {
    if (requestId && currentMessages.length > 0) {
      dispatch(markMessagesAsRead(requestId));
    }
  }, [requestId, currentMessages.length, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('user_typing', (data) => {
        if (data.userId !== user?._id) {
          setTypingUser(data.name);
          setIsTyping(true);
        }
      });

      socket.on('user_stop_typing', (data) => {
        if (data.userId !== user?._id) {
          setIsTyping(false);
          setTypingUser(null);
        }
      });

      // WebRTC call events
    socket.on('incoming_call', (data) => {
      const { callId, callerName, callType: incomingCallType } = data;
      setCurrentCallId(callId);
      setCallType(incomingCallType);
      setCallStatus('ringing');
      setIsInCall(true);

      toast.success(`Incoming ${incomingCallType} call from ${callerName}`, {
        duration: 10000,
      });
    });

       socket.on('call_answered', (data) => {
      const { accepted } = data;
      if (accepted) {
        setCallStatus('connected');
        initializeWebRTC(true); // Caller creates offer
      } else {
        endCall();
        toast.error('Call was declined');
      }
    });

      socket.on('call_ended', () => {
        endCall();
        toast.success('Call ended');
      });

     // Update the socket event listeners section:
// Update the socket event listeners in useEffect:
socket.on('webrtc_offer', async (data) => {
  const { offer, callId, senderId } = data;
  if (callId === currentCallId) {
    console.log('Received WebRTC offer from:', senderId);
    await handleWebRTCOffer(offer);
  }
});

socket.on('webrtc_answer', async (data) => {
  const { answer, senderId } = data;
  console.log('Received WebRTC answer from:', senderId);
  if (peerConnectionRef.current) {
    await peerConnectionRef.current.setRemoteDescription(answer);
    
    // Flush queued ICE candidates
    for (const c of pendingCandidatesRef.current) {
      await peerConnectionRef.current.addIceCandidate(c);
    }
    pendingCandidatesRef.current = [];
  }
});

 

 socket.on('webrtc_ice_candidate', async (data) => {
      const { candidate } = data;
      if (!candidate) return;

      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.remoteDescription &&
        peerConnectionRef.current.remoteDescription.type
      ) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    });



      return () => {
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('incoming_call');
        socket.off('call_answered');
        socket.off('call_ended');
        socket.off('webrtc_offer');
        socket.off('webrtc_answer');
        socket.off('webrtc_ice_candidate');
      };
    }
  }, [socket, user?._id, currentCallId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !requestId || !otherUser) return;

    sendMessage(requestId, otherUser._id, message.trim());
    setMessage('');
    
    if (socket) {
      socket.emit('stop_typing', { requestId });
    }
  };

  const handleTyping = () => {
    if (socket && requestId) {
      socket.emit('typing', { requestId });
      
      setTimeout(() => {
        socket.emit('stop_typing', { requestId });
      }, 3000);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      setShowFilePreview(true);
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !requestId || !otherUser) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/upload/chat-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileData = response.data.file;
      const messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
      
      // Send message with file attachment
      if (socket) {
        socket.emit('send_message', {
          requestId,
          receiverId: otherUser._id,
          content: messageType === 'image' ? '📷 Image' : `📎 ${fileData.name}`,
          messageType,
          attachment: fileData
        });
      }

      setSelectedFile(null);
      setPreviewUrl('');
      setShowFilePreview(false);
      toast.success('File sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  // WebRTC Functions
const initializeWebRTC = async (isInitiator: boolean) => {
  try {
    console.log('Initializing WebRTC as', isInitiator ? 'initiator' : 'receiver');
    
    // Get user media first
    const constraints = {
      audio: true,
      video: callType === 'video'
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;

    console.log('Got local stream:', stream.getTracks().map(t => t.kind));

    // Set local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // Create peer connection
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks to peer connection
    stream.getTracks().forEach(track => {
      console.log('Adding track:', track.kind);
      peerConnection.addTrack(track, stream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      console.log('Remote streams:', event.streams);
      
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('Set remote video source');
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && otherUser) {
        console.log('Sending ICE candidate');
        socket.emit('webrtc_ice_candidate', {
          targetUserId: otherUser._id,
          candidate: event.candidate,
          callId: currentCallId
        });
      }
    };

    // Connection state logging
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    // Create offer if initiator
    if (isInitiator) {
      console.log('Creating offer as initiator');
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (socket && otherUser) {
        socket.emit('webrtc_offer', {
          targetUserId: otherUser._id,
          offer,
          callId: currentCallId
        });
      }
    }
  } catch (error) {
    console.error('Error initializing WebRTC:', error);
    toast.error('Failed to access camera/microphone');
    endCall();
  }
};



const handleWebRTCOffer = async (offer: RTCSessionDescriptionInit) => {
  try {
    console.log('Handling WebRTC offer');
    
    // Initialize WebRTC if not already done
    if (!peerConnectionRef.current) {
      await initializeWebRTC(false);
    }

    const peerConnection = peerConnectionRef.current!;
    await peerConnection.setRemoteDescription(offer);

    // Create and send answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    console.log('Sending WebRTC answer');
    if (socket && otherUser) {
      socket.emit('webrtc_answer', {
        targetUserId: otherUser._id,
        answer,
        callId: currentCallId
      });
    }
  } catch (error) {
    console.error('Error handling WebRTC offer:', error);
    toast.error('Failed to establish video connection');
  }
};



  const startCall = (type: 'audio' | 'video') => {
    if (!socket || !otherUser) return;

    setCallType(type);
    setCallStatus('calling');
    setIsInCall(true);

    socket.emit('call_user', {
      targetUserId: otherUser._id,
      callType: type,
      requestId
    });
  };

const answerCall = async (callId: string) => {
  if (!socket) return;

  setCurrentCallId(callId); // Set call ID first
  
  socket.emit('answer_call', {
    callId,
    accepted: true
  });

  setCallStatus('connected');
  // Initialize WebRTC as receiver - will wait for offer
  await initializeWebRTC(false);
};

  const declineCall = () => {
    if (!socket || !currentCallId) return;

    socket.emit('answer_call', {
      callId: currentCallId,
      accepted: false
    });

    endCall();
  };

  const endCall = () => {
    if (socket && currentCallId) {
      socket.emit('end_call', { callId: currentCallId });
    }

    cleanupCall();
  };

  const cleanupCall = () => {
    setIsInCall(false);
    setCallStatus('idle');
    setCurrentCallId(null);
    setIsMuted(false);
    setIsVideoOff(false);

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleViewProfile = () => {
    if (otherUser) {
      navigate(`/profile/${otherUser._id}`);
    }
    setShowMoreMenu(false);
  };

  const handleBlockUser = async () => {
    if (!otherUser) return;
    
    try {
      await api.post(`/users/${otherUser._id}/block`);
      toast.success(`${otherUser.name} has been blocked`);
      setShowMoreMenu(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to block user');
    }
  };

  const handleReportUser = async () => {
    if (!otherUser) return;
    
    try {
      await api.post(`/users/${otherUser._id}/report`, {
        reason: 'Inappropriate behavior in chat'
      });
      toast.success('User reported successfully');
      setShowMoreMenu(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report user');
    }
  };

  const renderMessage = (msg: any, index: number) => {
    const isOwn = msg.senderId._id === user?._id;
    const showAvatar = index === 0 || 
      currentMessages[index - 1].senderId._id !== msg.senderId._id;


      const handleDownload = async (fileUrl: string | URL | Request, fileName: string) => {
  try {
    const response = await fetch(fileUrl, { mode: 'cors' });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};


    return (
      <motion.div
        key={msg._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-end space-x-3 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!isOwn && showAvatar && (
            <div className="flex-shrink-0">
              {msg.senderId.avatar ? (
                <img
                  src={msg.senderId.avatar}
                  alt={msg.senderId.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(msg.senderId.name)}
                </div>
              )}
            </div>
          )}
          
          <div className={`${!isOwn && !showAvatar ? "ml-11" : ""}`}>
      <div
        className={`px-4 py-3 rounded-2xl backdrop-blur-sm ${
          isOwn
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            : "bg-slate-700/50 text-white border border-slate-600/50"
        } shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        {msg.messageType === "image" && msg.attachment ? (
          <div className="space-y-2">
            <img
              src={msg.attachment.url}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(msg.attachment!.url, "_blank")}
            />
            {msg.content !== "📷 Image" && (
              <p className="text-sm">{msg.content}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs opacity-75">{msg.attachment.name}</span>
              <button
                onClick={() =>
                  handleDownload(msg.attachment!.url, msg.attachment!.name)
                }
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : msg.messageType === "file" && msg.attachment ? (
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium">{msg.attachment.name}</p>
              <p className="text-xs opacity-75">
                {(msg.attachment.size! / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() =>
                handleDownload(msg.attachment!.url, msg.attachment!.name)
              }
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{msg.content}</p>
        )}
      </div>
      <p
        className={`text-xs text-slate-400 mt-1 ${
          isOwn ? "text-right" : "text-left"
        }`}
      >
        {formatMessageTime(msg.timestamp)}
      </p>
    </div>
  
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!currentRequest || !otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Chat not found
          </h2>
          <Button onClick={() => navigate('/messages')} className="bg-gradient-to-r from-blue-500 to-purple-500">
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col font-poppins">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                {otherUser.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(otherUser.name)}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
              </div>
              
              <div>
                <h2 className="font-bold text-white text-lg">
                  {otherUser.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                    {currentRequest.senderSkillId.title}
                  </span>
                  <span className="text-slate-400">↔</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30">
                    {currentRequest.receiverSkillId.title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => startCall('audio')}
              className="text-slate-400 hover:text-green-400 hover:bg-slate-700/50"
              disabled={isInCall}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => startCall('video')}
              className="text-slate-400 hover:text-blue-400 hover:bg-slate-700/50"
              disabled={isInCall}
            >
              <Video className="w-4 h-4" />
            </Button>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-xl shadow-xl border border-slate-600 py-2 z-50"
                  >
                    <button 
                      onClick={handleViewProfile}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-600 transition-colors flex items-center"
                    >
                      <User className="w-4 h-4 mr-3" />
                      View Profile
                    </button>
                    <button 
                      onClick={handleBlockUser}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-600 transition-colors flex items-center"
                    >
                      <UserX className="w-4 h-4 mr-3" />
                      Block User
                    </button>
                    <button 
                      onClick={handleReportUser}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 transition-colors flex items-center"
                    >
                      <Flag className="w-4 h-4 mr-3" />
                      Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Call Interface */}
      <AnimatePresence>
        {isInCall && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center"
          >
            <div className="max-w-4xl w-full mx-auto p-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {getInitials(otherUser.name)}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{otherUser.name}</h3>
                <p className="text-slate-400 capitalize">
                  {callStatus === 'calling' && 'Calling...'}
                  {callStatus === 'ringing' && 'Incoming call'}
                  {callStatus === 'connected' && 'Connected'}
                </p>
              </div>

              {/* Video containers */}
              {callType === 'video' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                      {otherUser.name}
                    </div>
                  </div>
                  <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                      You
                    </div>
                  </div>
                </div>
              )}

              {/* Call controls */}
              <div className="flex justify-center space-x-4">
                {callStatus === 'ringing' ? (
                  <>
                    <Button
                      onClick={() => answerCall(currentCallId!)}
                      className="bg-green-500 hover:bg-green-600 px-8 py-3"
                    >
                      <PhoneCall className="w-5 h-5 mr-2" />
                      Answer
                    </Button>
                    <Button
                      onClick={declineCall}
                      variant="danger"
                      className="px-8 py-3"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      Decline
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={toggleMute}
                      className={`${isMuted ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    
                    {callType === 'video' && (
                      <Button
                        variant="outline"
                        onClick={toggleVideo}
                        className={`${isVideoOff ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
                      >
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </Button>
                    )}
                    
                    <Button
                      variant="danger"
                      onClick={endCall}
                      className="bg-red-500 hover:bg-red-600 px-8 py-3"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Call
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {currentMessages.length > 0 ? (
            <div className="space-y-4">
              {currentMessages.map(renderMessage)}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && typingUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-slate-700/50 rounded-2xl px-4 py-3 border border-slate-600/50">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Start the conversation
              </h3>
              <p className="text-slate-400">
                Send your first message to begin chatting with {otherUser.name}
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl border-t border-slate-700/50 p-6"
      >
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
            {/* Attachment Menu */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 bg-slate-700 rounded-xl shadow-xl border border-slate-600 p-2 min-w-[150px]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>File</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                disabled={currentRequest.status !== 'accepted' && currentRequest.status !== 'completed'}
              />
              
              {/* Emoji Button */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 z-50"
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        
                        width={300}
                        height={400}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Send Button */}
            <Button
              type="submit"
              disabled={!message.trim() || (currentRequest.status !== 'accepted' && currentRequest.status !== 'completed')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {currentRequest.status !== 'accepted' && currentRequest.status !== 'completed' && (
            <p className="text-sm text-slate-400 mt-3 text-center">
              Messaging is only available for accepted exchanges
            </p>
          )}
        </div>
      </motion.div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* File Preview Modal */}
      <Modal
        isOpen={showFilePreview}
        onClose={() => {
          setShowFilePreview(false);
          setSelectedFile(null);
          setPreviewUrl('');
        }}
        title="Send File"
      >
        {selectedFile && (
          <div className="space-y-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg"
              />
            )}
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-slate-400 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFilePreview(false);
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendFile} 
                isLoading={isUploading}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                Send File
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatPage;
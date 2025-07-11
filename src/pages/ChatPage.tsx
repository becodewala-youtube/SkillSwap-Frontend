import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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
  Play,
  Pause
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { getMessages, markMessagesAsRead, clearCurrentMessages } from '../store/slices/messagesSlice';
import { getRequestById } from '../store/slices/requestsSlice';
import { useSocket } from '../contexts/SocketContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { formatMessageTime, getInitials } from '../utils/helpers';

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
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showFilePreview, setShowFilePreview] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const otherUser = currentRequest?.senderId._id === user?._id 
    ? currentRequest?.receiverId 
    : currentRequest?.senderId;

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '😎', '🤝', '👏', '🙌', '💪', '🎯'];

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

      return () => {
        socket.off('user_typing');
        socket.off('user_stop_typing');
      };
    }
  }, [socket, user?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
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

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
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

  const handleSendFile = () => {
    if (selectedFile && requestId && otherUser) {
      // In a real implementation, you would upload the file first
      const fileMessage = `📎 ${selectedFile.name}`;
      sendMessage(requestId, otherUser._id, fileMessage);
      setSelectedFile(null);
      setPreviewUrl('');
      setShowFilePreview(false);
    }
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setShowCallModal(true);
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setShowCallModal(false);
    setIsMuted(false);
    setIsVideoOff(false);
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
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => startCall('video')}
              className="text-slate-400 hover:text-blue-400 hover:bg-slate-700/50"
            >
              <Video className="w-4 h-4" />
            </Button>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {currentMessages.length > 0 ? (
            <div className="space-y-4">
              {currentMessages.map((msg, index) => {
                const isOwn = msg.senderId._id === user?._id;
                const showAvatar = index === 0 || 
                  currentMessages[index - 1].senderId._id !== msg.senderId._id;

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
                      
                      <div className={`${!isOwn && !showAvatar ? 'ml-11' : ''}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl backdrop-blur-sm ${
                            isOwn
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-slate-700/50 text-white border border-slate-600/50'
                          } shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
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
                      <Paperclip className="w-4 h-4" />
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
                      className="absolute bottom-full right-0 mb-2 bg-slate-700 rounded-xl shadow-xl border border-slate-600 p-4 grid grid-cols-8 gap-2"
                    >
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-600 rounded-lg transition-colors text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
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
              <Button onClick={handleSendFile} className="bg-gradient-to-r from-blue-500 to-purple-500">
                Send File
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Call Modal */}
      <Modal
        isOpen={showCallModal}
        onClose={endCall}
        title={`${callType === 'video' ? 'Video' : 'Audio'} Call`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
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
            <h3 className="text-xl font-bold text-white mb-2">{otherUser.name}</h3>
            <p className="text-slate-400">
              {isInCall ? 'Connected' : 'Calling...'}
            </p>
          </div>

          {callType === 'video' && (
            <div className="bg-slate-800 rounded-lg aspect-video flex items-center justify-center">
              <p className="text-slate-400">Video feed would appear here</p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsMuted(!isMuted)}
              className={`${isMuted ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            {callType === 'video' && (
              <Button
                variant="outline"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`${isVideoOff ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </Button>
            )}
            
            <Button
              variant="danger"
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600"
            >
              End Call
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage;
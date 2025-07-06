import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical, Phone, Video, Smile, Paperclip, Image as ImageIcon } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { getMessages, markMessagesAsRead, clearCurrentMessages } from '../store/slices/messagesSlice';
import { getRequestById } from '../store/slices/requestsSlice';
import { useSocket } from '../contexts/SocketContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    };
  }, [requestId, dispatch, joinChat, leaveChat]);

  useEffect(() => {
    // Mark messages as read when component mounts or messages change
    if (requestId && currentMessages.length > 0) {
      dispatch(markMessagesAsRead(requestId));
    }
  }, [requestId, currentMessages.length, dispatch]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    // Socket event listeners
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
    
    // Stop typing indicator
    if (socket) {
      socket.emit('stop_typing', { requestId });
    }
  };

  const handleTyping = () => {
    if (socket && requestId) {
      socket.emit('typing', { requestId });
      
      // Stop typing after 3 seconds of inactivity
      setTimeout(() => {
        socket.emit('stop_typing', { requestId });
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!currentRequest || !otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Chat not found
          </h2>
          <Button onClick={() => navigate('/messages')}>
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card m-4 mb-0 p-6 rounded-b-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials(otherUser.name)}
                </div>
              )}
              
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                  {otherUser.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                    {currentRequest.senderSkillId.title}
                  </span>
                  <span className="text-gray-400">↔</span>
                  <span className="px-2 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded-full text-xs font-medium">
                    {currentRequest.receiverSkillId.title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
              <MoreVertical className="w-4 h-4" />
            </Button>
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
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(msg.senderId.name)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`${!isOwn && !showAvatar ? 'ml-11' : ''}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                          } shadow-sm hover:shadow-md transition-shadow duration-300`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
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
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Start the conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
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
        className="card m-4 mt-0 p-6 rounded-t-none"
      >
        <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:scale-110 transition-transform"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:scale-110 transition-transform"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
          
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
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              disabled={currentRequest.status !== 'accepted' && currentRequest.status !== 'completed'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!message.trim() || (currentRequest.status !== 'accepted' && currentRequest.status !== 'completed')}
            className="hover:scale-110 transition-transform"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {currentRequest.status !== 'accepted' && currentRequest.status !== 'completed' && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
            Messaging is only available for accepted exchanges
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ChatPage;
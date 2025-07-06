import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, User, Search, Filter } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { getConversations } from '../store/slices/messagesSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { formatMessageTime, getInitials } from '../utils/helpers';

const MessagesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, isLoading } = useSelector((state: RootState) => state.messages);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your <span className="text-gradient">Messages</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Chat with your skill exchange partners
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Conversations List */}
        {conversations.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card overflow-hidden"
          >
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/chat/${conversation.request._id}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                          {conversation.otherUser.avatar ? (
                            <img
                              src={conversation.otherUser.avatar}
                              alt={conversation.otherUser.name}
                              className="w-14 h-14 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                              {getInitials(conversation.otherUser.name)}
                            </div>
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {conversation.otherUser.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {conversation.lastMessage && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatMessageTime(conversation.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Skills Exchange Info */}
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full font-medium">
                                {conversation.request.senderSkillId.title}
                              </span>
                              <span className="text-gray-400">↔</span>
                              <span className="px-2 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded-full font-medium">
                                {conversation.request.receiverSkillId.title}
                              </span>
                            </div>
                          </div>

                          {/* Last Message */}
                          {conversation.lastMessage ? (
                            <p className="text-gray-600 dark:text-gray-400 truncate">
                              {conversation.lastMessage.senderId._id === user?._id ? (
                                <span className="text-primary-600 dark:text-primary-400 font-medium">You: </span>
                              ) : null}
                              {conversation.lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                              No messages yet
                            </p>
                          )}

                          {/* Status */}
                          <div className="mt-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              conversation.request.status === 'accepted' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : conversation.request.status === 'completed'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {conversation.request.status === 'accepted' ? 'Active Exchange' :
                               conversation.request.status === 'completed' ? 'Completed' :
                               conversation.request.status}
                            </span>
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No conversations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start exchanging skills to begin conversations with other users. 
              Messages will appear here once your requests are accepted.
            </p>
            <div className="space-y-4">
              <Link to="/skills">
                <Button className="hover:scale-105 transition-transform">
                  Browse Skills
                </Button>
              </Link>
              <div>
                <Link to="/requests" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  View your requests
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
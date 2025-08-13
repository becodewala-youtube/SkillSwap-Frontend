import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Filter, Phone, Video, MoreHorizontal, Star, Clock } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { getConversations } from '../store/slices/messagesSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { formatMessageTime, getInitials } from '../utils/helpers';

const MessagesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, isLoading } = useSelector((state: RootState) => state.messages);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    // Filter conversations based on search query
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conversation => 
        conversation.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.request.senderSkillId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.request.receiverSkillId.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-poppins">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-2xl font-bold text-slate-700 dark:text-white mb-2 md:mb-4">
            Your <span className="bg-gradient-to-r from-rose-600 dark:from-rose-400 to-fuchsia-600 dark:to-fuchsia-400 bg-clip-text text-transparent">Messages</span>
          </h1>
          <p className="text-xs md:text-md text-slate-600 dark:text-slate-400">
            Chat with your skill exchange partners
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-slate-300 dark:border-slate-600/50"
        >
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <Button variant="outline" size="sm" className="border-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Conversations List */}
        {filteredConversations.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Link
                    to={`/chat/${conversation.request._id}`}
                    className="block"
                  >
                    <div className="dark:bg-slate-800/50 backdrop-blur-xl border  dark:border-slate-700/50 rounded-2xl px-6 py-4 dark:hover:bg-slate-700/50 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {conversation.otherUser.avatar ? (
                            <img
                              src={conversation.otherUser.avatar}
                              alt={conversation.otherUser.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
                              {getInitials(conversation.otherUser.name)}
                            </div>
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-md font-semibold dark:text-white truncate group-hover:text-blue-400 transition-colors">
                              {conversation.otherUser.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {conversation.lastMessage && (
                                <span className="text-sm text-slate-400">
                                  {formatMessageTime(conversation.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Skills Exchange Info */}
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="px-3 py-1 bg-blue-300/20 dark:bg-blue-500/20 text-blue-500  dark:text-blue-300 rounded-full font-medium border border-blue-500/30">
                                {conversation.request.senderSkillId.title}
                              </span>
                              <span className="text-slate-400">↔</span>
                              <span className="px-3 py-1 bg-purple-500/20 dark:text-purple-300 text-purple-500 rounded-full font-medium border border-purple-500/30">
                                {conversation.request.receiverSkillId.title}
                              </span>
                            </div>
                          </div>

                          {/* Last Message */}
                          {conversation.lastMessage ? (
                            <p className="text-slate-400 truncate text-xs">
                              {conversation.lastMessage.senderId._id === user?._id ? (
                                <span className="text-blue-400 font-medium">You: </span>
                              ) : null}
                              <span className=' text-slate-700 dark:text-slate-400'>{conversation.lastMessage.content}</span>
                            </p>
                          ) : (
                            <p className="text-slate-500 text-sm italic">
                              No messages yet
                            </p>
                          )}

                          {/* Status */}
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              conversation.request.status === 'accepted' 
                                ? 'bg-green-500/20 text-green-500 dark:text-green-300 border border-green-500/30'
                                : conversation.request.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border border-blue-500/30'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}>
                              {conversation.request.status === 'accepted' ? 'Active Exchange' :
                               conversation.request.status === 'completed' ? 'Completed' :
                               conversation.request.status}
                            </span>
                            
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-green-400 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <Phone className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <Video className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="w-12 md:w-24 h-12 md:h-24 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 border border-blue-500/30">
              <MessageSquare className="w-6 md:w-12 h-6 md:h-12 text-white" />
            </div>
            <h3 className="md:text-2xl font-bold text-white mb-2 md:mb-4">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm md:text-md">
              {searchQuery 
                ? `No conversations match "${searchQuery}". Try a different search term.`
                : 'Start exchanging skills to begin conversations with other users. Messages will appear here once your requests are accepted.'
              }
            </p>
            <div className="space-y-4">
              {searchQuery ? (
                <Button onClick={() => setSearchQuery('')} className="bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600">
                  Clear Search
                </Button>
              ) : (
                <Link to="/skills">
                  <Button className=" bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600">
                    Browse Skills
                  </Button>
                </Link>
              )}
              <div>
                <Link to="/requests" className="text-rose-400 hover:text-rose-300 hover:underline font-medium">
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
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Zap,
  Target,
  Clock,
  Activity,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { getMySkills } from '../store/slices/skillsSlice';
import { getSentRequests, getReceivedRequests } from '../store/slices/requestsSlice';
import { getConversations } from '../store/slices/messagesSlice';
import { getNotifications } from '../store/slices/notificationsSlice';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatRelativeTime, getStatusColor, getInitials, getProficiencyColor, getCategoryIcon } from '../utils/helpers';
import api from '../utils/api';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mySkills, isLoading: skillsLoading } = useSelector((state: RootState) => state.skills);
  const { sentRequests, receivedRequests } = useSelector((state: RootState) => state.requests);
  const { conversations } = useSelector((state: RootState) => state.messages);
  const { notifications } = useSelector((state: RootState) => state.notifications);

  const [dashboardStats, setDashboardStats] = React.useState({
    skillsCount: 0,
    sentRequests: 0,
    receivedRequests: 0,
    completedExchanges: 0,
    unreadNotifications: 0,
    rating: { average: 0, count: 0 }
  });
  const [recentReviews, setRecentReviews] = React.useState([]);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const [statsResponse] = await Promise.all([
          api.get('/users/dashboard/stats'),
          dispatch(getMySkills()),
          dispatch(getSentRequests({ limit: 5 })),
          dispatch(getReceivedRequests({ limit: 5 })),
          dispatch(getConversations()),
          dispatch(getNotifications({ limit: 5 }))
        ]);

        setDashboardStats(statsResponse.data.stats);
        setRecentReviews(statsResponse.data.recentReviews);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  const stats = [
    {
      title: 'My Skills',
      value: dashboardStats.skillsCount,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      link: '#my-skills'
    },
    {
      title: 'Active Exchanges',
      value: dashboardStats.sentRequests + dashboardStats.receivedRequests,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      link: '/requests'
    },
    {
      title: 'Completed',
      value: dashboardStats.completedExchanges,
      icon: Award,
      gradient: 'from-purple-500 to-pink-500',
      link: '/requests?status=completed'
    },
    {
      title: 'Rating',
      value: dashboardStats.rating.average.toFixed(1),
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      link: '/reviews'
    }
  ];

  const pendingReceivedRequests = receivedRequests.filter(req => req.status === 'pending');
  const recentConversations = conversations.slice(0, 3);
  const recentNotifications = notifications.slice(0, 5);

  const handleStatClick = (link: string) => {
    if (link === '#my-skills') {
      document.getElementById('my-skills')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = link;
    }
  };

  if (isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back,{' '}
              <span className="text-gradient">{user?.name}!</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Here's what's happening with your skill exchanges
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleStatClick(stat.link)}
            >
              <div className="card p-6 hover:shadow-glow transition-all duration-500 group-hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {stat.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-8"
            >
              <div className="flex items-center mb-6">
                <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/skills/create">
                  <button className="w-full p-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow">
                    <Plus className="w-5 h-5 mx-auto mb-2" />
                    Add New Skill
                  </button>
                </Link>
                <Link to="/search">
                  <button className="w-full p-4 bg-gradient-to-r from-secondary-100 to-secondary-200 hover:from-secondary-200 hover:to-secondary-300 text-secondary-800 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 border border-secondary-300">
                    <Target className="w-5 h-5 mx-auto mb-2" />
                    Find Skills
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Pending Requests */}
            {pendingReceivedRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-warning-600 dark:text-warning-400 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Pending Requests
                    </h2>
                  </div>
                  <Link
                    to="/requests?tab=received"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {pendingReceivedRequests.slice(0, 3).map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-warning-50 to-orange-50 dark:from-warning-900/20 dark:to-orange-900/20 rounded-xl border border-warning-200 dark:border-warning-800"
                    >
                      <div className="flex items-center space-x-4">
                        {request.senderId.avatar ? (
                          <img
                            src={request.senderId.avatar}
                            alt={request.senderId.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                            {getInitials(request.senderId.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {request.senderId.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.senderSkillId.title} ↔ {request.receiverSkillId.title}
                          </p>
                        </div>
                      </div>
                      <Link to="/requests">
                        <Button size="sm" className="hover:scale-105 transition-transform">
                          Review
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* My Skills Section */}
            <motion.div
              id="my-skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    My Skills
                  </h2>
                </div>
                <Link
                  to="/skills/create"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Add skill
                </Link>
              </div>
              {skillsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : mySkills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {mySkills.map((skill) => (
                    <motion.div
                      key={skill._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative"
                    >
                      <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-md group-hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                        {/* Skill Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">
                              {getCategoryIcon(skill.category)}
                            </span>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {skill.title}
                              </h3>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}>
                                {skill.proficiency}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/skills/${skill._id}`}>
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link to={`/skills/${skill._id}/edit`}>
                              <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            </Link>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {skill.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {skill.rating.average.toFixed(1)} ({skill.rating.count})
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {skill.exchangeCount} exchanges
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You haven't added any skills yet
                  </p>
                  <Link to="/skills/create">
                    <Button className="hover:scale-105 transition-transform">
                      Add your first skill
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="text-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                    {getInitials(user?.name || 'User')}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {user?.name}
                </h3>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {dashboardStats.rating.average.toFixed(1)} ({dashboardStats.rating.count} reviews)
                  </span>
                </div>
                <Link to="/profile/edit" className="mt-4 inline-block">
                  <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Recent Messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Recent Messages
                  </h3>
                </div>
                <Link
                  to="/messages"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all
                </Link>
              </div>
              {recentConversations.length > 0 ? (
                <div className="space-y-3">
                  {recentConversations.map((conversation) => (
                    <Link
                      key={conversation.request._id}
                      to={`/chat/${conversation.request._id}`}
                      className="group"
                    >
                      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 group-hover:scale-105">
                        {conversation.otherUser.avatar ? (
                          <img
                            src={conversation.otherUser.avatar}
                            alt={conversation.otherUser.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(conversation.otherUser.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {conversation.otherUser.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No messages yet
                  </p>
                </div>
              )}
            </motion.div>

            {/* Recent Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <Link
                  to="/notifications"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all
                </Link>
              </div>
              {recentNotifications.length > 0 ? (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                        notification.isRead 
                          ? 'bg-gray-50 dark:bg-gray-700' 
                          : 'bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No recent activity
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
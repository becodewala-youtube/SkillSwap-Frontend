import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, XCircle, MessageSquare, Star, Award, Trash2, BookMarked as MarkAsRead } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  deleteAllRead
} from '../store/slices/notificationsSlice';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatRelativeTime } from '../utils/helpers';
import { NOTIFICATION_TYPES } from '../utils/constants';

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, isLoading, unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    dispatch(getNotifications({ unreadOnly: filter === 'unread' }));
  }, [dispatch, filter]);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (notificationId: string) => {
    dispatch(deleteNotification(notificationId));
  };

  const handleDeleteAllRead = () => {
    dispatch(deleteAllRead());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'skill_request':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'request_accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'request_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'request_completed':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'review_received':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 text-sm dark:text-gray-400 mt-2">
                Stay updated with your skill exchange activities
              </p>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <MarkAsRead className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllRead}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Read
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-blue-100 dark:ring-blue-900' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`mt-1 text-sm ${
                            !notification.isRead 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-blue-600 dark:text-blue-400"
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification._id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Action URL */}
                      {notification.actionUrl && (
                        <div className="mt-3">
                          <a
                            href={notification.actionUrl}
                            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Details →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {filter === 'unread' 
                ? 'All caught up! You have no unread notifications.'
                : 'When you start exchanging skills, notifications about requests, messages, and reviews will appear here.'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
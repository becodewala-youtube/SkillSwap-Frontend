import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MessageSquare,
  Star,
  Filter
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { 
  getSentRequests, 
  getReceivedRequests, 
  acceptRequest, 
  rejectRequest,
  completeRequest,
  cancelRequest
} from '../store/slices/requestsSlice';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, getStatusColor, capitalizeFirst } from '../utils/helpers';
import { REQUEST_STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

const RequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  
  const { sentRequests, receivedRequests, isLoading } = useSelector((state: RootState) => state.requests);
  
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>(
    (searchParams.get('tab') as 'received' | 'sent') || 'received'
  );
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'complete' | 'cancel'>('accept');
  const [actionData, setActionData] = useState({
    scheduledDate: '',
    reason: '',
    meetingDetails: {
      platform: '',
      link: '',
      notes: ''
    }
  });

  useEffect(() => {
    const params = { status: statusFilter || undefined };
    
    if (activeTab === 'sent') {
      dispatch(getSentRequests(params));
    } else {
      dispatch(getReceivedRequests(params));
    }
  }, [activeTab, statusFilter, dispatch]);

  useEffect(() => {
    // Update URL when tab or filter changes
    const newSearchParams = new URLSearchParams();
    if (activeTab !== 'received') newSearchParams.set('tab', activeTab);
    if (statusFilter) newSearchParams.set('status', statusFilter);
    setSearchParams(newSearchParams);
  }, [activeTab, statusFilter, setSearchParams]);

  const handleTabChange = (tab: 'received' | 'sent') => {
    setActiveTab(tab);
    setStatusFilter('');
  };

  const openActionModal = (request: any, action: 'accept' | 'reject' | 'complete' | 'cancel') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
    setActionData({
      scheduledDate: '',
      reason: '',
      meetingDetails: {
        platform: '',
        link: '',
        notes: ''
      }
    });
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    try {
      switch (actionType) {
        case 'accept':
          await dispatch(acceptRequest({
            requestId: selectedRequest._id,
            scheduledDate: actionData.scheduledDate || undefined,
            meetingDetails: actionData.meetingDetails
          })).unwrap();
          toast.success('Request accepted successfully!',{
  style: {
    color: '#fff', // white text
  },
});
          break;
        
        case 'reject':
          await dispatch(rejectRequest({
            requestId: selectedRequest._id,
            reason: actionData.reason
          })).unwrap();
          toast.success('Request rejected',{
  style: {
    color: '#fff', // white text
  },
});
          break;
        
        case 'complete':
          await dispatch(completeRequest(selectedRequest._id)).unwrap();
          toast.success('Exchange marked as completed!',{
  style: {
    color: '#fff', // white text
  },
});
          break;
        
        case 'cancel':
          await dispatch(cancelRequest({
            requestId: selectedRequest._id,
            reason: actionData.reason
          })).unwrap();
          toast.success('Request cancelled',{
  style: {
    color: '#fff', // white text
  },
});
          break;
      }
      
      setShowActionModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    }
  };

  const currentRequests = activeTab === 'sent' ? sentRequests : receivedRequests;
  const filteredRequests = statusFilter 
    ? currentRequests.filter(req => req.status === statusFilter)
    : currentRequests;

  const getActionButtons = (request: any) => {
    const isReceived = activeTab === 'received';
    
    switch (request.status) {
      case 'pending':
        return isReceived ? (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => openActionModal(request, 'accept')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openActionModal(request, 'reject')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openActionModal(request, 'cancel')}
          >
            Cancel
          </Button>
        );
      
      case 'accepted':
        return (
          <div className="flex space-x-2">
            <Link to={`/chat/${request._id}`}>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => openActionModal(request, 'complete')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          </div>
        );
      
      case 'completed':
        return (
          <Link to={`/reviews?requestId=${request._id}`}>
            <Button size="sm" variant="outline">
              <Star className="w-4 h-4 mr-1" />
              Review
            </Button>
          </Link>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Skill Exchange Requests
          </h1>
          <p className="text-gray-600 text-sm dark:text-gray-400 mt-2">
            Manage your incoming and outgoing skill exchange requests
          </p>
        </motion.div>

        {/* Tabs and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('received')}
                className={`py-2 px-1 border-b-2 font-medium text-xs ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Received ({receivedRequests.length})
              </button>
              <button
                onClick={() => handleTabChange('sent')}
                className={`py-2 px-1  text-xs border-b-2 font-medium  ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Sent ({sentRequests.length})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" className='text-sm'>All Statuses</option>
                {Object.entries(REQUEST_STATUSES).map(([status, config]) => (
                  <option key={status} value={status} className='text-sm'>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Requests List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-6">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={

                            activeTab === 'received' 
                              ? request.senderId.avatar || '/default-avatar.png'
                              : request.receiverId.avatar || '/default-avatar.png'
                          }
                          alt={
                            activeTab === 'received' 
                              ? request.senderId.name
                              : request.receiverId.name
                          }
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {activeTab === 'received' 
                              ? request.senderId.name
                              : request.receiverId.name
                            }
                          </h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {REQUEST_STATUSES[request.status as keyof typeof REQUEST_STATUSES]?.label || capitalizeFirst(request.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Skills Exchange */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                            {activeTab === 'received' ? 'They offer:' : 'You offer:'}
                          </h4>
                          <div className="bg-white text-sm dark:bg-gray-800 rounded p-3">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {request.senderSkillId.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.senderSkillId.category}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                            {activeTab === 'received' ? 'They want:' : 'You want:'}
                          </h4>
                          <div className="bg-white text-sm dark:bg-gray-800 rounded p-3">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {request.receiverSkillId.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.receiverSkillId.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                          Message:
                        </h4>
                        <p className="text-gray-700 text-sm dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded p-3">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {/* Scheduled Date */}
                    {request.scheduledDate && (
                      <div className="mb-4">
                        <div className="flex text-sm items-center text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          Scheduled for: {formatDate(request.scheduledDate)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    {getActionButtons(request)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'received' 
                ? "You haven't received any skill exchange requests yet"
                : "You haven't sent any skill exchange requests yet"
              }
            </p>
            <Link to="/skills">
              <Button>
                Browse Skills
              </Button>
            </Link>
          </div>
        )}

        {/* Action Modal */}
        <Modal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          title={
            actionType === 'accept' ? 'Accept Request' :
            actionType === 'reject' ? 'Reject Request' :
            actionType === 'complete' ? 'Complete Exchange' :
            'Cancel Request'
          }
        >
          <div className="space-y-4">
            {actionType === 'accept' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={actionData.scheduledDate}
                    onChange={(e) => setActionData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Platform
                  </label>
                  <input
                    type="text"
                    value={actionData.meetingDetails.platform}
                    onChange={(e) => setActionData(prev => ({ 
                      ...prev, 
                      meetingDetails: { ...prev.meetingDetails, platform: e.target.value }
                    }))}
                    placeholder="e.g., Zoom, Google Meet, Discord"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={actionData.meetingDetails.link}
                    onChange={(e) => setActionData(prev => ({ 
                      ...prev, 
                      meetingDetails: { ...prev.meetingDetails, link: e.target.value }
                    }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={actionData.meetingDetails.notes}
                    onChange={(e) => setActionData(prev => ({ 
                      ...prev, 
                      meetingDetails: { ...prev.meetingDetails, notes: e.target.value }
                    }))}
                    placeholder="Any additional information..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {(actionType === 'reject' || actionType === 'cancel') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={actionData.reason}
                  onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Provide a reason for your decision..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {actionType === 'complete' && (
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to mark this exchange as completed? This will allow both parties to leave reviews.
              </p>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowActionModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                variant={actionType === 'reject' || actionType === 'cancel' ? 'danger' : 'primary'}
              >
                {actionType === 'accept' ? 'Accept Request' :
                 actionType === 'reject' ? 'Reject Request' :
                 actionType === 'complete' ? 'Mark Complete' :
                 'Cancel Request'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default RequestsPage;
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Star, Filter } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  requestId: string;
  reviewerId: {
    _id: string;
    name: string;
    avatar: string;
  };
  reviewedUserId: {
    _id: string;
    name: string;
    avatar: string;
  };
  skillId: {
    _id: string;
    title: string;
  };
  rating: number;
  review: string;
  categories: {
    communication: number;
    punctuality: number;
    knowledge: number;
    helpfulness: number;
  };
  createdAt: string;
}

interface ExchangeRequest {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    avatar: string;
  };
  receiverId: {
    _id: string;
    name: string;
    avatar: string;
  };
  senderSkillId: {
    _id: string;
    title: string;
  };
  receiverSkillId: {
    _id: string;
    title: string;
  };
  status: string;
}

const ReviewsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ExchangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ExchangeRequest | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review: '',
    categories: {
      communication: 5,
      punctuality: 5,
      knowledge: 5,
      helpfulness: 5,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestId = searchParams.get('requestId');

  useEffect(() => {
    fetchData();
  }, [activeTab, user?._id]);

  useEffect(() => {
    // If requestId is provided, open review modal for that request
    if (requestId) {
      fetchRequestForReview(requestId);
    }
  }, [requestId]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (activeTab === 'received') {
        const response = await api.get(`/reviews/user/${user._id}`);
        setReviews(response.data.reviews);
      } else {
        const response = await api.get('/reviews/my-reviews');
        setReviews(response.data.reviews);
      }

      // Fetch completed requests that haven't been reviewed yet
      const [sentResponse, receivedResponse] = await Promise.all([
        api.get('/requests/sent?status=completed'),
        api.get('/requests/received?status=completed'),
      ]);

      const allCompleted = [...sentResponse.data.requests, ...receivedResponse.data.requests];
      
      // Filter out requests that have already been reviewed
      const reviewedRequestIds = new Set();
      if (activeTab === 'given') {
        const myReviewsResponse = await api.get('/reviews/my-reviews');
        myReviewsResponse.data.reviews.forEach((review: Review) => {
          reviewedRequestIds.add(review.requestId);
        });
      }

      const unreviewed = allCompleted.filter((req: any) => !reviewedRequestIds.has(req._id));
      setCompletedRequests(unreviewed);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequestForReview = async (requestId: string) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      const request = response.data.request;
      
      if (request.status === 'completed') {
        setSelectedRequest(request);
        setShowReviewModal(true);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedRequest || !user) return;

    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        requestId: selectedRequest._id,
        rating: reviewForm.rating,
        review: reviewForm.review,
        categories: reviewForm.categories,
      });

      toast.success('Review submitted successfully!',{
  style: {
    color: '#fff', // white text
  },
});
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewForm({
        rating: 5,
        review: '',
        categories: {
          communication: 5,
          punctuality: 5,
          knowledge: 5,
          helpfulness: 5,
        },
      });
      
      // Refresh data
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review',{
  style: {
    color: '#fff', // white text
  },
});
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (request: ExchangeRequest) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const getOtherUser = (request: ExchangeRequest) => {
    return request.senderId._id === user?._id ? request.receiverId : request.senderId;
  };

  const getOtherSkill = (request: ExchangeRequest) => {
    return request.senderId._id === user?._id ? request.receiverSkillId : request.senderSkillId;
  };

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange?.(star)}
            className={`${onRatingChange ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

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
          className="mb-4"
        >
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Reviews
          </h1>
          <p className="text-gray-600 text-sm dark:text-gray-400 mt-2">
            Manage your reviews and feedback
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reviews Received ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('given')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'given'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reviews Given ({reviews.length})
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Pending Reviews (only show in "given" tab) */}
        {activeTab === 'given' && completedRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-6 py-4  mb-8"
          >
            <h2 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              Pending Reviews
            </h2>
            <div className="space-y-4">
              {completedRequests.map((request) => {
                const otherUser = getOtherUser(request);
                const otherSkill = getOtherSkill(request);
                
                return (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={otherUser.avatar || '/default-avatar.png'}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {otherUser.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Exchange: {otherSkill.title}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openReviewModal(request)}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Write Review
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      activeTab === 'received' 
                        ? review.reviewerId.avatar || '/default-avatar.png'
                        : review.reviewedUserId.avatar || '/default-avatar.png'
                    }
                    alt={
                      activeTab === 'received' 
                        ? review.reviewerId.name
                        : review.reviewedUserId.name
                    }
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {activeTab === 'received' 
                            ? review.reviewerId.name
                            : review.reviewedUserId.name
                          }
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          For: {review.skillId.title}
                        </p>
                      </div>
                      <div className="text-right">
                        {renderStars(review.rating)}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {review.review && (
                      <p className="text-gray-700 text-sm dark:text-gray-300 mb-4">
                        {review.review}
                      </p>
                    )}
                    
                    {review.categories && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(review.categories).map(([category, rating]) => (
                          <div key={category} className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              {category}
                            </p>
                            <div className="flex justify-center mt-1">
                              {renderStars(rating)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'received' 
                ? "You haven't received any reviews yet. Complete some skill exchanges to start building your reputation!"
                : "You haven't given any reviews yet. Complete exchanges and share your experience with others!"
              }
            </p>
          </div>
        )}

        {/* Review Modal */}
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title="Write a Review"
          size="md"
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={getOtherUser(selectedRequest).avatar || '/default-avatar.png'}
                  alt={getOtherUser(selectedRequest).name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {getOtherUser(selectedRequest).name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Skill: {getOtherSkill(selectedRequest).title}
                  </p>
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Rating
                </label>
                {renderStars(reviewForm.rating, (rating) => 
                  setReviewForm(prev => ({ ...prev, rating }))
                )}
              </div>

              {/* Category Ratings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Detailed Ratings
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(reviewForm.categories).map(([category, rating]) => (
                    <div key={category}>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                        {category}
                      </p>
                      {renderStars(rating, (newRating) =>
                        setReviewForm(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [category]: newRating }
                        }))
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Written Review (Optional)
                </label>
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience with this skill exchange..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 outline-none dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewSubmit}
                  isLoading={isSubmitting}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ReviewsPage;
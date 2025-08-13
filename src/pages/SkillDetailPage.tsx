import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Award,
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  Share2,
  Users,
  TrendingUp,
  CheckCircle,
  Send
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { getSkillById, clearCurrentSkill, deleteSkill } from '../store/slices/skillsSlice';
import { sendSkillRequest } from '../store/slices/requestsSlice';
import { getMySkills } from '../store/slices/skillsSlice';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  formatDate, 
  getProficiencyColor, 
  getCategoryIcon, 
  getInitials,
  capitalizeFirst 
} from '../utils/helpers';
import { SKILL_CATEGORIES } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SkillDetailPage: React.FC = () => {
  // In SkillDetailPage.tsx, add this state:
const [showShareMenu, setShowShareMenu] = useState(false);

  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentSkill, isLoading } = useSelector((state: RootState) => state.skills);
  const { mySkills } = useSelector((state: RootState) => state.skills);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMySkill, setSelectedMySkill] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  const isOwner = user?._id === currentSkill?.userId._id;
  const canRequest = user && !isOwner && mySkills.length > 0 && !hasExistingRequest;

  useEffect(() => {
    if (skillId) {
      dispatch(getSkillById(skillId));
      if (user) {
        dispatch(getMySkills());
        checkExistingRequest();
      }
    }

    return () => {
      dispatch(clearCurrentSkill());
    };
  }, [skillId, dispatch, user]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (skillId) {
        try {
          const response = await api.get(`/reviews/skill/${skillId}`);
          setReviews(response.data.reviews);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      }
    };

    fetchReviews();
  }, [skillId]);

  const checkExistingRequest = async () => {
    if (!skillId || !user) return;
    
    try {
      // Check for existing requests between current user and skill owner
      const [sentResponse, receivedResponse] = await Promise.all([
        api.get('/requests/sent'),
        api.get('/requests/received')
      ]);
      
      const allRequests = [...sentResponse.data.requests, ...receivedResponse.data.requests];
      const existingRequest = allRequests.find(req => 
        (req.receiverSkillId._id === skillId || req.senderSkillId._id === skillId) &&
        ['pending', 'accepted', 'completed'].includes(req.status)
      );
      
      setHasExistingRequest(!!existingRequest);
    } catch (error) {
      console.error('Error checking existing requests:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedMySkill || !currentSkill) return;

    setIsSubmitting(true);
    try {
      await dispatch(sendSkillRequest({
        receiverSkillId: currentSkill._id,
        senderSkillId: selectedMySkill,
        message: requestMessage,
      })).unwrap();

      toast.success('Skill exchange request sent successfully!',{
  style: {
    color: '#fff', // white text
  },
});
      setShowRequestModal(false);
      setSelectedMySkill('');
      setRequestMessage('');
      setHasExistingRequest(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request',{
  style: {
    color: '#fff', // white text
  },
});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (!currentSkill) return;

    try {
      await dispatch(deleteSkill(currentSkill._id)).unwrap();
      toast.success('Skill deleted successfully',{
  style: {
    color: '#fff', // white text
  },
});
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete skill',{
  style: {
    color: '#fff', // white text
  },
});
    }
  };

  const handleEndorse = async () => {
    if (!currentSkill || !user) return;

    try {
      await api.post(`/users/${currentSkill.userId._id}/skills/${currentSkill._id}/endorse`, {
        message: 'Great skill!'
      });
      toast.success('Skill endorsed successfully!',{
  style: {
    color: '#fff', // white text
  },
});
      // Refresh skill data
      dispatch(getSkillById(currentSkill._id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to endorse skill',{
  style: {
    color: '#fff', // white text
  },
});
    }
  };



// In src/pages/SkillDetailPage.tsx, add these functions:
const handleShare = async () => {
  const shareData = {
    title: `${currentSkill?.title} - SkillSwap`,
    text: `Check out this amazing ${currentSkill?.category} skill: ${currentSkill?.title}`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log('Error sharing:', error);
      fallbackShare();
    }
  } else {
    fallbackShare();
  }
};

const fallbackShare = () => {
  const url = window.location.href;
  const text = `Check out this amazing ${currentSkill?.category} skill: ${currentSkill?.title}`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
    toast.success('Link copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = `${text}\n${url}`;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    toast.success('Link copied to clipboard!');
  });
};

const shareToSocial = (platform: string) => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Check out this amazing ${currentSkill?.category} skill: ${currentSkill?.title}`);
  
  const shareUrls = {
    twitter: `https://x.com/intent/tweet?text=${text}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
  };
  
  window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
};



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading skill details...</p>
        </div>
      </div>
    );
  }

  if (!currentSkill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Skill not found
          </h2>
          <Link to="/skills">
            <Button>Browse Skills</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabel = SKILL_CATEGORIES.find(c => c.value === currentSkill.category)?.label || currentSkill.category;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        {/* Skill Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card py-4 px-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              {/* Title and Category */}
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-accent-400 rounded-2xl flex items-center justify-center mr-6">
                  <span className="text-xl">
                    {getCategoryIcon(currentSkill.category)}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentSkill.title}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {categoryLabel}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getProficiencyColor(currentSkill.proficiency)}`}>
                      {capitalizeFirst(currentSkill.proficiency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentSkill.rating.average.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentSkill.rating.count} reviews
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentSkill.exchangeCount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    exchanges
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentSkill.endorsements?.length || 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    endorsements
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDate(currentSkill.createdAt).split(',')[0]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    created
                  </p>
                </div>
              </div>

              {/* Tags */}
              {currentSkill.tags && currentSkill.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentSkill.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-rose-400 dark:to-fuchsia-800 text-primary-700 dark:text-primary-100 text-xs rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 lg:ml-8 mt-6 lg:mt-0">
              {isOwner ? (
                <>
                  <Link to={`/skills/${currentSkill._id}/edit`}>
                    <Button className="w-full lg:w-auto hover:scale-105 transition-transform">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Skill
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full lg:w-auto hover:scale-105 transition-transform"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  {canRequest ? (
                    <Button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full lg:w-auto hover:scale-105 transition-transform"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Request Exchange
                    </Button>
                  ) : hasExistingRequest ? (
                    <Button
                      disabled
                      className="w-full lg:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Request Sent
                    </Button>
                  ) : !user ? (
                    <Link to="/login">
                      <Button className="w-full lg:w-auto hover:scale-105 transition-transform">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Login to Request
                      </Button>
                    </Link>
                  ) : null}
                  
                  {user && (
                    <Button
                      variant="outline"
                      onClick={handleEndorse}
                      className="w-full lg:w-auto hover:scale-105 transition-transform"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Endorse
                    </Button>
                  )}
                  
                  
<div className="relative">
  <Button
    variant="ghost"
    onClick={() => setShowShareMenu(!showShareMenu)}
    className="w-full lg:w-auto hover:scale-105 transition-transform"
  >
    <Share2 className="w-4 h-4 mr-2" />
    Share
  </Button>
  
  <AnimatePresence>
    {showShareMenu && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
      >
        <button 
          onClick={() => {
            handleShare();
            setShowShareMenu(false);
          }}
          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
        >
          <Share2 className="w-4 h-4 mr-3" />
          Share Link
        </button>
        <button 
          onClick={() => {
            shareToSocial('twitter');
            setShowShareMenu(false);
          }}
          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Twitter
        </button>
        <button 
          onClick={() => {
            shareToSocial('facebook');
            setShowShareMenu(false);
          }}
          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
        <button 
          onClick={() => {
            shareToSocial('linkedin');
            setShowShareMenu(false);
          }}
          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>
        <button 
          onClick={() => {
            shareToSocial('whatsapp');
            setShowShareMenu(false);
          }}
          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          WhatsApp
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>

                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card py-4 px-6"
            >
              <h2 className="text-md font-bold text-gray-900 dark:text-white mb-4">
                About This Skill
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {currentSkill.description}
                </p>
              </div>
            </motion.div>

            {/* Availability */}
            {currentSkill.availableDays && currentSkill.availableDays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card px-6 py-4"
              >
                <h2 className="text-md font-bold text-gray-900 dark:text-white mb-6">
                  Availability
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {currentSkill.availableDays.map((day) => (
                    <div
                      key={day}
                      className="px-4 py-2 text-slate-600 dark:text-white text-sm bg-gradient-to-r from-primary-100 to-accent-100 dark:from-rose-400 dark:to-accent-900   text-center rounded-xl font-medium"
                    >
                      {capitalizeFirst(day)}
                    </div>
                  ))}
                </div>
                
                {currentSkill.availableTimeSlots && currentSkill.availableTimeSlots.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      Time Slots
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentSkill.availableTimeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm">
                          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card px-6 py-4"
            >
              <h2 className="text-md font-bold text-gray-900 dark:text-white mb-6">
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review: any) => (
                    <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        {review.reviewerId.avatar ? (
                          <img
                            src={review.reviewerId.avatar}
                            alt={review.reviewerId.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                            {getInitials(review.reviewerId.name)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                              {review.reviewerId.name}
                            </h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.review && (
                            <p className="text-gray-700 text-xs dark:text-gray-300 mb-2">
                              {review.review}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <Button variant="outline" className="w-full hover:scale-105 transition-transform">
                      View All Reviews
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    No reviews yet. Be the first to exchange skills and leave a review!
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">
                Skill Owner
              </h3>
              <div className="text-center">
                {currentSkill.userId.avatar ? (
                  <img
                    src={currentSkill.userId.avatar}
                    alt={currentSkill.userId.name}
                    className="w-12 h-12 rounded-full object-cover mx-auto mb-2 hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                    {getInitials(currentSkill.userId.name)}
                  </div>
                )}
                
                <h4 className="font-bold text-sm text-gray-900 dark:text-white  mb-2">
                  {currentSkill.userId.name}
                </h4>
                
                {currentSkill.userId.location && (
                  <div className="flex items-center justify-center text-gray-600 text-xs dark:text-gray-400 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {currentSkill.userId.location}
                  </div>
                )}
                
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(currentSkill.userId.rating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {currentSkill.userId.rating.average.toFixed(1)} ({currentSkill.userId.rating.count} reviews)
                  </span>
                </div>

                <Link to={`/profile/${currentSkill.userId._id}`}>
                  <Button variant="outline" className="w-full text-sm hover:scale-105 transition-transform">
                    View Profile
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Endorsements */}
            {currentSkill.endorsements && currentSkill.endorsements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4">
                  Endorsements ({currentSkill.endorsements.length})
                </h3>
                <div className="space-y-4">
                  {currentSkill.endorsements.slice(0, 3).map((endorsement: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                        "{endorsement.message}"
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        {formatDate(endorsement.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Request Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Send Skill Exchange Request"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select your skill to offer
              </label>
              <select
                value={selectedMySkill}
                onChange={(e) => setSelectedMySkill(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a skill...</option>
                {mySkills.map((skill) => (
                  <option key={skill._id} value={skill._id}>
                    {skill.title} ({skill.proficiency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you'd like to exchange skills..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 outline-none rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRequestModal(false)}
                className="hover:scale-105 transition-transform"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendRequest}
                isLoading={isSubmitting}
                disabled={!selectedMySkill}
                className="hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Skill"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this skill? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="hover:scale-105 transition-transform"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteSkill}
                className="hover:scale-105 transition-transform"
              >
                Delete Skill
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SkillDetailPage;
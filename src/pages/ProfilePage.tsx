import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Award, 
  MessageSquare, 
  Edit,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, getInitials, getProficiencyColor, getCategoryIcon } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  skills: Array<{
    _id: string;
    title: string;
    description: string;
    category: string;
    proficiency: string;
    rating: { average: number; count: number };
    exchangeCount: number;
    createdAt: string;
  }>;
  rating: { average: number; count: number };
  createdAt: string;
}

interface Review {
  _id: string;
  reviewerId: {
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
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'reviews'>('skills');

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/users/${userId}`);
        setProfile(response.data.user);
        setReviews(response.data.reviews);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile not found
          </h2>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(profile.name)}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    {profile.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(profile.createdAt)}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(profile.rating.average)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {profile.rating.average.toFixed(1)} ({profile.rating.count} reviews)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Link to="/profile/edit">
                      <Button>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline">
                        <Award className="w-4 h-4 mr-2" />
                        Endorse
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {profile.skills.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Skills</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {profile.skills.reduce((sum, skill) => sum + skill.exchangeCount, 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Exchanges</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {profile.rating.count}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Reviews</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'skills'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Skills ({profile.skills.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.skills.map((skill) => (
                  <motion.div
                    key={skill._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getCategoryIcon(skill.category)}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {skill.title}
                          </h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}>
                            {skill.proficiency}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
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
                    
                    {!isOwnProfile && (
                      <Link to={`/skills/${skill._id}`} className="mt-3 block">
                        <Button size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.reviewerId.avatar || '/default-avatar.png'}
                          alt={review.reviewerId.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {review.reviewerId.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                For: {review.skillId.title}
                              </p>
                            </div>
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
                            <p className="mt-2 text-gray-700 dark:text-gray-300">
                              {review.review}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No reviews yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
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
  Twitter,
  Users,
  TrendingUp,
  BookOpen,
  Heart,
  Share2,
  MoreHorizontal,
  Badge,
  Clock
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, getInitials, getProficiencyColor, getCategoryIcon } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Avatar from '../components/ui/Avatar';

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
        toast.error(error.response?.data?.message || 'Failed to fetch profile',{
  style: {
    color: '#fff', // white text
  },
});
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile not found
          </h2>
          <Link to="/">
            <Button className="hover:scale-105 transition-transform">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Skills',
      value: profile.skills.length,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Exchanges',
      value: profile.skills.reduce((sum, skill) => sum + skill.exchangeCount, 0),
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Reviews',
      value: profile.rating.count,
      icon: Award,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card px-6 py-4 mb-8"
        >
<div className="flex flex-col lg:flex-row lg:items-center w-full gap-6 md:p-2 rounded-xl bg-white dark:bg-gray-800 ">
  {/* Avatar + Info */}
  <div className="flex flex-row items-start sm:items-center w-full gap-4">
    {/* Avatar */}
    <div className="relative flex-shrink-0">
      {profile.avatar ? (
        <Avatar
          src={profile?.avatar}
          alt={profile?.name || 'User'}
          name={profile?.name || 'User'}
          size="md"
          className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-500/20 shadow-2xl hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary-500/20 shadow-2xl hover:scale-110 transition-transform duration-300">
          {getInitials(profile.name)}
        </div>
      )}
      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
    </div>

    {/* Name + Details */}
    <div className="flex flex-col flex-1">
      <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
        {profile.name}
      </h1>

      {/* Location & Join Date */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
        {profile.location && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {profile.location}
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          Joined {formatDate(profile.createdAt)}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center mt-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(profile.rating.average)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {profile.rating.average.toFixed(1)} ({profile.rating.count} reviews)
        </span>
      </div>
    </div>
  </div>

  {/* Bio */}
  {profile.bio && (
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4 lg:mt-0">
      {profile.bio}
    </p>
  )}

  {/* Action Buttons */}
  <div className="flex flex-col gap-3 w-full lg:w-auto mt-4 lg:mt-0">
    {isOwnProfile ? (
      <Link to="/profile/edit" className="w-full">
        <Button className="w-full hover:scale-105 transition-transform">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </Link>
    ) : (
      <>
        <Button className="w-full sm:w-auto lg:w-full hover:scale-105 transition-transform">
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
        <div className="flex gap-2 w-full sm:w-auto lg:w-full">
          <Button
            variant="outline"
            className="flex-1 hover:scale-105 transition-transform"
          >
            <Heart className="w-4 h-4 mr-2" />
            Follow
          </Button>
          <Button
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </>
    )}
  </div>
</div>


        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="card px-6 py-4 hover:shadow-glow transition-all duration-500 group-hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
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
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'skills'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Skills ({profile.skills.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.skills.map((skill, index) => (
                  <motion.div
                    key={skill._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-glow group-hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                      {/* Skill Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-accent-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">
                              {getCategoryIcon(skill.category)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {skill.title}
                            </h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}>
                              {skill.proficiency}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        {!isOwnProfile && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {skill.rating.average.toFixed(1)} ({skill.rating.count})
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {skill.exchangeCount} exchanges
                        </div>
                      </div>
                      
                      {!isOwnProfile && (
                        <Link to={`/skills/${skill._id}`}>
                          <Button size="sm" className="w-full group-hover:scale-105 transition-transform">
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {profile.skills.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-fuchsia-400 dark:from-rose-500 dark:to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {isOwnProfile ? "You haven't added any skills yet" : "No skills shared yet"}
                    </p>
                    {isOwnProfile && (
                      <Link to="/skills/create">
                        <Button className="hover:scale-105 transition-transform">
                          Add your first skill
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-glow group-hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                        <div className="flex items-start space-x-4">
                          {review.reviewerId.avatar ? (
                            <img
                              src={review.reviewerId.avatar}
                              alt={review.reviewerId.name}
                              className="w-12 h-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300">
                              {getInitials(review.reviewerId.name)}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
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
                              <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                                {review.review}
                              </p>
                            )}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-fuchsia-400 dark:from-rose-500 dark:to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No reviews yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
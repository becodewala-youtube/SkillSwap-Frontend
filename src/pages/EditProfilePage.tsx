import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, FileText, Camera, Save, ArrowLeft, Upload } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { updateProfile } from '../store/slices/authSlice';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getInitials } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Avatar from '../components/ui/Avatar';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: false,
      language: 'en',
    },
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        preferences: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          pushNotifications: user.preferences?.pushNotifications ?? true,
          darkMode: user.preferences?.darkMode ?? false,
          language: user.preferences?.language ?? 'en',
        },
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB',{
  style: {
    color: '#fff', // white text
  },
});
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file',{
  style: {
    color: '#fff', // white text
  },
});
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.avatar;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar',{
  style: {
    color: '#fff', // white text
  },
});
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must not exceed 500 characters';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location must not exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let avatarUrl = user?.avatar;

      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
        if (!avatarUrl) return; // Upload failed
      }

      const updateData = {
        ...formData,
        ...(avatarUrl && { avatar: avatarUrl }),
      };

      await dispatch(updateProfile(updateData)).unwrap();
      toast.success('Profile updated successfully!',{
  style: {
    color: '#fff', // white text
  },
});
      navigate(`/profile/${user?._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile',{
  style: {
    color: '#fff', // white text
  },
});
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-poppins py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl md:text-xl font-bold text-slate-700 dark:text-white mb-2">
              Edit <span className="bg-gradient-to-r from-rose-400 to-fuchsia-400 dark:from-rose-500 dark:to-fuchsia-500 bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="text-xs md:text-md  text-slate-600 dark:text-slate-400">
              Update your profile information and preferences
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl px-6 py-4 border border-slate-700/50"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                {avatarPreview ? (
                  <Avatar
  src={user?.avatar}
  alt={user?.name || 'Avatar preview'}
   name={user?.name || 'Aatar Preview'}
  
  size="md"
  className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500/30 shadow-2xl"
/>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-fuchsia-400 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-500/30 shadow-2xl">
                    {getInitials(formData.name || 'User')}
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
                <label className="absolute bottom-1 right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                PNG, JPG up to 5MB
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-md font-bold text-slate-700 dark:text-white mb-2 flex items-center">
                <User className="w-4 h-4 mr-3 text-blue-400" />
                Basic Information
              </h3>
              
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 dark:text-slate-400 w-4 h-4" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className={`w-full pl-12 pr-4 py-2 dark:bg-slate-700/50 border text-sm border-slate-600/50 rounded-xl outline-none dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    errors.name ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-400 mt-2">{errors.name}</p>
                )}
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  name="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-12 pr-4 py-2 dark:bg-slate-700/50 border text-sm rounded-xl outline-none text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location (e.g., New York, NY)"
                  className={`w-full pl-12 pr-4 py-2 dark:bg-slate-700/50 border text-sm border-slate-600/50 rounded-xl outline-none dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    errors.location ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.location && (
                  <p className="text-sm text-red-400 mt-2">{errors.location}</p>
                )}
              </div>

              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  className={`w-full pl-12 pr-4 py-2 dark:bg-slate-700/50 border text-sm border-slate-600/50 rounded-xl outline-none dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                    errors.bio ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.bio && (
                  <p className="text-sm text-red-400 mt-2">{errors.bio}</p>
                )}
                <p className="text-sm text-slate-400 mt-2">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-slate-600 dark:text-white mb-4">
                Preferences
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between py-3 px-4 dark:bg-slate-700/30 rounded-xl border border-slate-600/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <span className="text-slate-600 dark:text-white font-medium text-sm">Email notifications</span>
                  <input
                    type="checkbox"
                    name="preferences.emailNotifications"
                    checked={formData.preferences.emailNotifications}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 outline-none"
                  />
                </label>

                <label className="flex items-center justify-between py-3 px-4 dark:bg-slate-700/30 rounded-xl border border-slate-600/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <span className="text-slate-600 text-sm dark:text-white font-medium">Push notifications</span>
                  <input
                    type="checkbox"
                    name="preferences.pushNotifications"
                    checked={formData.preferences.pushNotifications}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 outline-none"
                  />
                </label>

                <div>
                  <label className="block text-sm text-slate-700 dark:text-white font-medium mb-3">
                    Language
                  </label>
                  <select
                    name="preferences.language"
                    value={formData.preferences.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm dark:bg-slate-700 border border-slate-600/50 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading || isUploading}
                className="bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfilePage;
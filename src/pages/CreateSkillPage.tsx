import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Save, Sparkles } from 'lucide-react';
import { AppDispatch } from '../store/store';
import { createSkill } from '../store/slices/skillsSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS, DAYS_OF_WEEK } from '../utils/constants';
import toast from 'react-hot-toast';

const CreateSkillPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    proficiency: '',
    tags: [] as string[],
    availableDays: [] as string[],
    availableTimeSlots: [] as Array<{ start: string; end: string }>,
  });
  const [newTag, setNewTag] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState({ start: '', end: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTimeSlot = () => {
    if (newTimeSlot.start && newTimeSlot.end && newTimeSlot.start < newTimeSlot.end) {
      setFormData(prev => ({
        ...prev,
        availableTimeSlots: [...prev.availableTimeSlots, newTimeSlot]
      }));
      setNewTimeSlot({ start: '', end: '' });
    }
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.proficiency) {
      newErrors.proficiency = 'Proficiency level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const skillData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      await dispatch(createSkill(skillData)).unwrap();
      toast.success('Skill created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Share Your <span className="text-gradient">Expertise</span>
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-400">
              Create a skill profile and connect with learners worldwide
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card py-4 px-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-3" />
                <h3 className="text-md font-bold text-gray-900 dark:text-white">
                  Basic Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skill Title *
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., React Development, Guitar Lessons, Spanish Tutoring"
                  className={`input-modern ${errors.title ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose a clear, descriptive title for your skill
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your skill, what you can teach, your experience level, and what students can expect to learn..."
                  rows={5}
                  className={`input-modern resize-none ${errors.description ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`input-modern ${errors.category ? 'border-red-500 ring-red-500' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {SKILL_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proficiency Level *
                  </label>
                  <select
                    name="proficiency"
                    value={formData.proficiency}
                    onChange={handleInputChange}
                    className={`input-modern ${errors.proficiency ? 'border-red-500 ring-red-500' : ''}`}
                  >
                    <option value="">Select your level</option>
                    {PROFICIENCY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {errors.proficiency && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.proficiency}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Tags (Optional)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add relevant tags to help others find your skill
              </p>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 input-modern"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || formData.tags.length >= 10}
                  className="hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 text-primary-800 dark:text-primary-200 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Availability (Optional)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Let others know when you're available for skill exchanges
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Available Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day.value} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availableDays.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {day.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Time Slots
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="time"
                    value={newTimeSlot.start}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, start: e.target.value }))}
                    className="input-modern"
                  />
                  <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium">to</span>
                  <input
                    type="time"
                    value={newTimeSlot.end}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, end: e.target.value }))}
                    className="input-modern"
                  />
                  <Button
                    type="button"
                    onClick={addTimeSlot}
                    disabled={!newTimeSlot.start || !newTimeSlot.end || newTimeSlot.start >= newTimeSlot.end}
                    className="hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.availableTimeSlots.length > 0 && (
                  <div className="space-y-2">
                    {formData.availableTimeSlots.map((slot, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-xl"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {slot.start} - {slot.end}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="hover:scale-105 transition-transform"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="hover:scale-105 transition-transform"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Skill
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateSkillPage;
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { searchSkills } from '../store/slices/skillsSlice';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '../utils/constants';
import { getProficiencyColor, getCategoryIcon, formatRelativeTime, getInitials } from '../utils/helpers';

const SkillsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { skills, isLoading, pagination } = useSelector((state: RootState) => state.skills);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    proficiency: searchParams.get('proficiency') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = {
      ...filters,
      page: 1,
      limit: 12,
    };

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key as keyof typeof params]) {
        delete params[key as keyof typeof params];
      }
    });

    dispatch(searchSkills(params));

    // Update URL
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
    });
    setSearchParams(newSearchParams);
  }, [filters, dispatch, setSearchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      proficiency: '',
      location: '',
      sortBy: 'relevance',
    });
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      const params = {
        ...filters,
        page: pagination.page + 1,
        limit: 12,
      };

      dispatch(searchSkills(params));
    }
  };

  // Filter out current user's skills
  const filteredSkills = skills.filter(skill => skill.userId._id !== user?._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Amazing{' '}
            <span className="text-gradient">Skills</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Find the perfect skill to learn or teach
          </p>
          
          {isAuthenticated && (
            <Link to="/skills/create">
              <Button className="hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 mr-2" />
                Share Your Skill
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search skills, categories, or keywords..."
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className="w-full pl-12 pr-16 py-4 text-lg rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-modern"
                >
                  <option value="">All Categories</option>
                  {SKILL_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proficiency
                </label>
                <select
                  value={filters.proficiency}
                  onChange={(e) => handleFilterChange('proficiency', e.target.value)}
                  className="input-modern"
                >
                  <option value="">All Levels</option>
                  {PROFICIENCY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-modern"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="exchanges">Most Exchanges</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Active Filters */}
          {(filters.q || filters.category || filters.proficiency || filters.location) && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {filters.q && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    "{filters.q}"
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                    {SKILL_CATEGORIES.find(c => c.value === filters.category)?.label}
                  </span>
                )}
                {filters.proficiency && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200">
                    {PROFICIENCY_LEVELS.find(p => p.value === filters.proficiency)?.label}
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200">
                    <MapPin className="w-3 h-3 mr-1" />
                    {filters.location}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">
              {filteredSkills.length}
            </span>{' '}
            amazing skills found
          </p>
        </div>

        {/* Skills Grid */}
        {isLoading && filteredSkills.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Discovering amazing skills...
              </p>
            </div>
          </div>
        ) : filteredSkills.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredSkills.map((skill, index) => (
                <motion.div
                  key={skill._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="card p-6 h-full hover:shadow-glow transition-all duration-500 group-hover:-translate-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-accent-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-2xl">
                            {getCategoryIcon(skill.category)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {skill.title}
                          </h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}>
                            {skill.proficiency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>

                    {/* User Info */}
                    <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      {skill.user.avatar ? (
                        <img
                          src={skill.user.avatar}
                          alt={skill.user.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          {getInitials(skill.user.name)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {skill.user.name}
                        </p>
                        {skill.user.location && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            {skill.userId.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {skill.rating.average.toFixed(1)} ({skill.rating.count})
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {skill.exchangeCount} exchanges
                      </div>
                    </div>

                    {/* Tags */}
                    {skill.tags && skill.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skill.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-block px-2 py-1 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {skill.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                            +{skill.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(skill.createdAt)}
                      </span>
                      <Link to={`/skills/${skill._id}`}>
                        <Button size="sm" className="group-hover:scale-105 transition-transform">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {pagination.page < pagination.pages && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  isLoading={isLoading}
                  className="px-8 py-3 hover:scale-105 transition-transform"
                >
                  Load More Skills
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No skills found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or browse all skills to discover amazing learning opportunities.
            </p>
            <div className="space-y-4">
              <Button onClick={clearFilters} className="hover:scale-105 transition-transform">
                Clear Filters
              </Button>
              {isAuthenticated && (
                <div>
                  <Link to="/skills/create" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Share your own skill
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
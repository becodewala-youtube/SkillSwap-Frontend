import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, MapPin, User, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { searchSkills } from '../store/slices/skillsSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '../utils/constants';
import { getProficiencyColor, getCategoryIcon, formatRelativeTime, getInitials, debounce } from '../utils/helpers';
import api from '../utils/api';

interface UserResult {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  skills: Array<{
    _id: string;
    title: string;
    category: string;
    proficiency: string;
  }>;
  rating: {
    average: number;
    count: number;
  };
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { skills, isLoading, pagination } = useSelector((state: RootState) => state.skills);

  const [searchType, setSearchType] = useState<'skills' | 'users'>('skills');
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    proficiency: searchParams.get('proficiency') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 2) {
        fetchSuggestions(searchQuery);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await api.get('/skills/search', {
        params: { q: query, limit: 5 }
      });
      const suggestions = response.data.skills.map((skill: any) => skill.title) as string[];
setSearchSuggestions([...new Set(suggestions)]);

      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  useEffect(() => {
    if (searchType === 'skills') {
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
    } else {
      searchUsers();
    }

    // Update URL
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
    });
    if (searchType !== 'skills') newSearchParams.set('type', searchType);
    setSearchParams(newSearchParams);
  }, [filters, searchType, dispatch, setSearchParams]);

  // Trigger suggestions when search query changes
  useEffect(() => {
    debouncedSearch(filters.q);
  }, [filters.q, debouncedSearch]);

  const searchUsers = async () => {
    setIsLoadingUsers(true);
    try {
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

      const response = await api.get('/users', { params });
      setUsers(response.data.users);
      setUserPagination(response.data.pagination);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, q: suggestion }));
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      proficiency: '',
      location: '',
      sortBy: 'relevance',
    });
    setShowSuggestions(false);
  };

  const loadMoreSkills = () => {
    if (pagination.page < pagination.pages) {
      const params = {
        ...filters,
        page: pagination.page + 1,
        limit: 12,
      };

      dispatch(searchSkills(params));
    }
  };

  const loadMoreUsers = async () => {
    if (userPagination.page < userPagination.pages) {
      setIsLoadingUsers(true);
      try {
        const params = {
          ...filters,
          page: userPagination.page + 1,
          limit: 12,
        };

        const response = await api.get('/users', { params });
        setUsers(prev => [...prev, ...response.data.users]);
        setUserPagination(response.data.pagination);
      } catch (error) {
        console.error('Error loading more users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    }
  };

  const currentResults = searchType === 'skills' ? skills : users;
  const currentPagination = searchType === 'skills' ? pagination : userPagination;
  const currentLoading = searchType === 'skills' ? isLoading : isLoadingUsers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Amazing{' '}
              <span className="text-gradient">
                {searchType === 'skills' ? 'Skills' : 'People'}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find the perfect {searchType === 'skills' ? 'skills to learn' : 'people to connect with'}
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-8 relative"
        >
          {/* Search Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl">
              <button
                onClick={() => setSearchType('skills')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  searchType === 'skills'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Skills
              </button>
              <button
                onClick={() => setSearchType('users')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  searchType === 'users'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User className="w-5 h-5 mr-2" />
                People
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${searchType}... (try typing partial words)`}
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                onFocus={() => filters.q.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 z-50"
                >
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 text-primary-500 mr-3" />
                        <span className="text-gray-900 dark:text-white">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                {searchType === 'skills' && (
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
                )}

                {searchType === 'skills' && (
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
                )}

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
                    {searchType === 'skills' && <option value="exchanges">Most Exchanges</option>}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters */}
          {(filters.q || filters.category || filters.proficiency || filters.location) && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {filters.q && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    Search: "{filters.q}"
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
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            <span className="text-primary-600 dark:text-primary-400 font-bold">
              {currentPagination.total}
            </span>{' '}
            {searchType} found
            {filters.q && (
              <span> for "<span className="font-semibold">{filters.q}</span>"</span>
            )}
          </p>
        </div>

        {/* Results Grid */}
        {currentLoading && currentResults.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Searching for amazing {searchType}...
              </p>
            </div>
          </div>
        ) : currentResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {searchType === 'skills' ? (
                // Skills Results
                skills.map((skill, index) => (
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
                        <img
                          src={skill.user.avatar || '/default-avatar.png'}
                          alt={skill.user.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {skill.user.name}
                          </p>
                          {skill.user.location && (
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                              <MapPin className="w-3 h-3 mr-1" />
                              {skill.user.location}
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
                ))
              ) : (
                // Users Results
                users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="card p-6 h-full hover:shadow-glow transition-all duration-500 group-hover:-translate-y-2">
                      {/* Header */}
                      <div className="flex items-center mb-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover mr-4 group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {user.name}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <MapPin className="w-4 h-4 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                          {user.bio}
                        </p>
                      )}

                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {user.rating.average.toFixed(1)} ({user.rating.count} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Skills */}
                      {user.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                            Skills ({user.skills.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill._id}
                                className="inline-block px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 text-primary-700 dark:text-primary-300 text-xs rounded-full font-medium"
                              >
                                {skill.title}
                              </span>
                            ))}
                            {user.skills.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                +{user.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex justify-end">
                        <Link to={`/profile/${user._id}`}>
                          <Button size="sm" className="group-hover:scale-105 transition-transform">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Load More */}
            {currentPagination.page < currentPagination.pages && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={searchType === 'skills' ? loadMoreSkills : loadMoreUsers}
                  isLoading={currentLoading}
                  className="px-8 py-3"
                >
                  Load More {searchType === 'skills' ? 'Skills' : 'People'}
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
              No {searchType} found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {filters.q 
                ? `We couldn't find any ${searchType} matching "${filters.q}". Try different keywords or browse all ${searchType}.`
                : `Try adjusting your search criteria or browse all ${searchType}`
              }
            </p>
            <div className="space-y-4">
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
              <div>
                <Link to={searchType === 'skills' ? '/skills' : '/search'} className="text-primary-600 dark:text-primary-400 hover:underline">
                  Browse all {searchType}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
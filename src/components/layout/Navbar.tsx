import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  Plus,
  ChevronDown
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials } from '../../utils/helpers';
import Icon from '../../assets/icon.png'
import Avatar from '../ui/Avatar';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { unreadCount: notificationCount } = useSelector((state: RootState) => state.notifications);
  const { unreadCount: messageCount } = useSelector((state: RootState) => state.messages);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10  rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <img src={Icon} alt="logo" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white ">
  SkillSwap
</span>

          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
           {/*  <Link
              to="/skills"
              className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isActive('/skills')
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              Browse Skills
            </Link> */}

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    isActive('/dashboard')
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Search Icon - redirects to search page */}
                <button
                  onClick={() => navigate('/search')}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Create Skill Button */}
                <Link
                  to="/skills/create"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-fuchsia-400 hover:from-rose-400  hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>

                {/* Messages */}
                <Link
                  to="/messages"
                  className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MessageSquare className="w-5 h-5" />
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Link>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                  >
                    {user?.avatar ? (
                     <Avatar
  src={user?.avatar}
  alt={user?.name || 'User'}
  name={user?.name || 'User'}
  size="sm"
  className="group-hover:scale-110 transition-transform duration-300"
/>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-sm font-medium group-hover:scale-110 transition-transform duration-300">
                        {getInitials(user?.name || 'User')}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 backdrop-blur-xl"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        
                        <Link
                          to={`/profile/${user?._id}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          View Profile
                        </Link>
                        <Link
                          to="/profile/edit"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Search Icon for non-authenticated users */}
                <button
                  onClick={() => navigate('/search')}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Theme Toggle for non-authenticated users */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-fuchsia-400 hover:from-rose-400  hover:to-fuchsia-500 text-white text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 hover:scale-110 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="px-4 py-4 space-y-2">
              {/* <Link
                to="/skills"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
              >
                Browse Skills
              </Link>
 */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/search"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    Search
                  </Link>
                  <Link
                    to="/skills/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    Add Skill
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    <Bell className="w-5 h-5 mr-3" />
                    Notifications
                    {notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Messages
                    {messageCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {messageCount > 9 ? '9+' : messageCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to={`/profile/${user?._id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/profile/edit"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/search"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    Search
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl transition-all duration-300 text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
              >
                {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { getCurrentUser } from '../store/slices/authSlice';
import { getUnreadCount } from '../store/slices/notificationsSlice';
import { getUnreadCount as getMessageUnreadCount } from '../store/slices/messagesSlice';


interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If we have a token but no user, try to get the current user
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser());
    }
    
    // Fetch unread counts when authenticated
    if (isAuthenticated && user) {
      dispatch(getUnreadCount());
      dispatch(getMessageUnreadCount());
    }
  }, [dispatch, token, user, isLoading, isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, X } from 'lucide-react';

const RateLimitNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    // Listen for rate limit errors
    const handleRateLimit = (event: CustomEvent) => {
      const { retryAfter: retry } = event.detail;
      setRetryAfter(retry || 60);
      setIsVisible(true);
      
      // Auto hide after retry period
      setTimeout(() => {
        setIsVisible(false);
      }, (retry || 60) * 1000);
    };

    // Listen for 429 responses
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader) : 60;
        
        window.dispatchEvent(new CustomEvent('rateLimitError', {
          detail: { retryAfter: retryAfterSeconds }
        }));
      }
      
      return response;
    };

    window.addEventListener('rateLimitError', handleRateLimit as EventListener);

    return () => {
      window.removeEventListener('rateLimitError', handleRateLimit as EventListener);
      window.fetch = originalFetch;
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-orange-200 dark:border-orange-800 p-6 backdrop-blur-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Too Many Requests
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  You're making requests too quickly. Please slow down to ensure the best experience for everyone.
                </p>
                
                <div className="flex items-center space-x-2 text-xs text-orange-600 dark:text-orange-400">
                  <Clock className="w-3 h-3" />
                  <span>Try again in {formatTime(retryAfter)}</span>
                </div>
              </div>
              
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <motion.div
                className="h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: retryAfter, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RateLimitNotification;
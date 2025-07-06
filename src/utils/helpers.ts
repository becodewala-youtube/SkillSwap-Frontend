import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatDate = (date: string | Date) => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }
  
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatMessageTime = (date: string | Date) => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm');
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  return format(dateObj, 'MMM dd');
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getInitials = (name: string | undefined | null) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};


export const generateAvatar = (name: string) => {
  const initials = getInitials(name);
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500',
  ];
  
  const colorIndex = name.charCodeAt(0) % colors.length;
  
  return {
    initials,
    bgColor: colors[colorIndex],
  };
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string) => {
  const minLength = password.length >= 6;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasLowercase && hasUppercase && hasNumber,
    minLength,
    hasLowercase,
    hasUppercase,
    hasNumber,
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  
  return colors[status as keyof typeof colors] || colors.pending;
};

export const getProficiencyColor = (proficiency: string) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    expert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  
  return colors[proficiency as keyof typeof colors] || colors.beginner;
};

export const getCategoryIcon = (category: string) => {
  const icons = {
    programming: '💻',
    design: '🎨',
    marketing: '📈',
    business: '💼',
    language: '🗣️',
    music: '🎵',
    fitness: '💪',
    cooking: '👨‍🍳',
    photography: '📸',
    writing: '✍️',
    education: '📚',
    art: '🖼️',
    other: '🔧',
  };
  
  return icons[category as keyof typeof icons] || icons.other;
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Enhanced search functionality with partial matching
export const searchWithPartialMatch = (query: string, items: any[], searchFields: string[]) => {
  if (!query || query.length < 2) return items;
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return items.filter(item => {
    return searchTerms.some(term => {
      return searchFields.some(field => {
        const fieldValue = getNestedValue(item, field);
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(term);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.some(val => 
            typeof val === 'string' && val.toLowerCase().includes(term)
          );
        }
        return false;
      });
    });
  });
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Improved search scoring for relevance
export const scoreSearchResult = (query: string, item: any, searchFields: string[]) => {
  if (!query) return 0;
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  let score = 0;
  
  searchFields.forEach((field, fieldIndex) => {
    const fieldValue = getNestedValue(item, field);
    const fieldWeight = searchFields.length - fieldIndex; // Earlier fields have higher weight
    
    if (typeof fieldValue === 'string') {
      const lowerFieldValue = fieldValue.toLowerCase();
      
      searchTerms.forEach(term => {
        // Exact match gets highest score
        if (lowerFieldValue === term) {
          score += 100 * fieldWeight;
        }
        // Starts with term gets high score
        else if (lowerFieldValue.startsWith(term)) {
          score += 50 * fieldWeight;
        }
        // Contains term gets medium score
        else if (lowerFieldValue.includes(term)) {
          score += 25 * fieldWeight;
        }
        // Partial word match gets low score
        else if (term.length >= 3) {
          const words = lowerFieldValue.split(' ');
          words.forEach(word => {
            if (word.includes(term)) {
              score += 10 * fieldWeight;
            }
          });
        }
      });
    }
    
    if (Array.isArray(fieldValue)) {
      fieldValue.forEach(val => {
        if (typeof val === 'string') {
          const lowerVal = val.toLowerCase();
          searchTerms.forEach(term => {
            if (lowerVal.includes(term)) {
              score += 15 * fieldWeight;
            }
          });
        }
      });
    }
  });
  
  return score;
};
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with state synchronization
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value
 * @returns {[any, function]} - Stored value and setter function
 */
const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };
  
  const [storedValue, setStoredValue] = useState(readValue);
  
  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  // Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);
  
  return [storedValue, setValue];
};

/**
 * Hook for managing user preferences in localStorage
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    notifications: true,
    language: 'en',
    dashboardLayout: 'grid'
  });
  
  const updatePreferences = (updates) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };
  
  return { preferences, updatePreferences };
};

/**
 * Hook for managing recently viewed items
 */
export const useRecentlyViewed = (maxItems = 5) => {
  const [recentItems, setRecentItems] = useLocalStorage('recentlyViewed', []);
  
  const addItem = (item) => {
    setRecentItems(prev => {
      // Remove if already exists
      const filtered = prev.filter(i => i.id !== item.id);
      // Add to beginning and limit size
      return [item, ...filtered].slice(0, maxItems);
    });
  };
  
  const clearItems = () => {
    setRecentItems([]);
  };
  
  return { recentItems, addItem, clearItems };
};

export default useLocalStorage;
/**
 * Cache Service
 * Provides caching mechanisms for API responses
 * Supports localStorage, sessionStorage, and memory caching
 */

class CacheService {
    constructor() {
      this.memoryCache = new Map();
      this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    }

    /**
     * Set cache item
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     * @param {string} storage - 'memory', 'local', or 'session'
     */
    set(key, data, ttl = this.defaultTTL, storage = 'memory') {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl
      };

      if (storage === 'memory') {
        this.memoryCache.set(key, cacheItem);
      } else if (storage === 'local') {
        localStorage.setItem(key, JSON.stringify(cacheItem));
      } else if (storage === 'session') {
        sessionStorage.setItem(key, JSON.stringify(cacheItem));
      }
    }

    /**
     * Get cache item
     * @param {string} key - Cache key
     * @param {string} storage - 'memory', 'local', or 'session'
     * @returns {any|null} - Cached data or null if expired/not found
     */
    get(key, storage = 'memory') {
      let cacheItem = null;

      if (storage === 'memory') {
        cacheItem = this.memoryCache.get(key);
      } else if (storage === 'local') {
        const item = localStorage.getItem(key);
        if (item) cacheItem = JSON.parse(item);
      } else if (storage === 'session') {
        const item = sessionStorage.getItem(key);
        if (item) cacheItem = JSON.parse(item);
      }

      if (!cacheItem) return null;

      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
      if (isExpired) {
        this.remove(key, storage);
        return null;
      }

      return cacheItem.data;
    }

    /**
     * Remove cache item
     * @param {string} key - Cache key
     * @param {string} storage - 'memory', 'local', or 'session'
     */
    remove(key, storage = 'memory') {
      if (storage === 'memory') {
        this.memoryCache.delete(key);
      } else if (storage === 'local') {
        localStorage.removeItem(key);
      } else if (storage === 'session') {
        sessionStorage.removeItem(key);
      }
    }

    /**
     * Clear all cache
     * @param {string} storage - 'memory', 'local', or 'session'
     */
    clear(storage = 'memory') {
      if (storage === 'memory') {
        this.memoryCache.clear();
      } else if (storage === 'local') {
        localStorage.clear();
      } else if (storage === 'session') {
        sessionStorage.clear();
      }
    }

    /**
     * Clear cache by prefix
     * @param {string} prefix - Key prefix
     * @param {string} storage - 'memory', 'local', or 'session'
     */
    clearByPrefix(prefix, storage = 'memory') {
      if (storage === 'memory') {
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(prefix)) {
            this.memoryCache.delete(key);
          }
        }
      } else if (storage === 'local') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } else if (storage === 'session') {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
      }
    }

    /**
     * Generate cache key from request config
     * @param {string} url - API URL
     * @param {object} params - Query parameters
     * @returns {string} - Cache key
     */
    generateKey(url, params = {}) {
      const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
      return `${url}_${JSON.stringify(sortedParams)}`;
    }
  }

  export default new CacheService();
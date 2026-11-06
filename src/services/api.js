// frontend/src/services/api.js
import axios from 'axios';
import cacheService from './cacheService';

// Cache configuration by endpoint
const CACHE_CONFIG = {
  // Static data - long cache (30 minutes)
  '/payment-types': { ttl: 30 * 60 * 1000, storage: 'memory' },
  '/organizations/settings': { ttl: 15 * 60 * 1000, storage: 'memory' },

  // Dashboard data - medium cache (5 minutes)
  '/reports/summary': { ttl: 5 * 60 * 1000, storage: 'memory' },
  '/reports/monthly-summary': { ttl: 5 * 60 * 1000, storage: 'memory' },
  '/users/stats': { ttl: 5 * 60 * 1000, storage: 'memory' },

  // Transaction data - short cache (2 minutes)
  '/transactions/income': { ttl: 2 * 60 * 1000, storage: 'memory' },
  '/transactions/expenditure': { ttl: 2 * 60 * 1000, storage: 'memory' },
  '/payments/all': { ttl: 2 * 60 * 1000, storage: 'memory' },

  // Member data - medium cache
  '/users': { ttl: 5 * 60 * 1000, storage: 'memory' },

  // No cache for these endpoints
  '/auth/login': { ttl: 0, cacheable: false },
  '/auth/signup': { ttl: 0, cacheable: false },
  '/payments/initialize': { ttl: 0, cacheable: false },
  '/payment-gateway/initialize': { ttl: 0, cacheable: false }  // ✅ Added payment gateway
};

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

// ✅ CORRECTED URL (all lowercase to match Render)
const API_URL = 'https://finlightbackendv2.onrender.com/api';
// const API_URL = 'http://localhost:5173/api';

// Create axios instance with correct baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 90000
});

// Helper function to get cache configuration
const getCacheConfig = (url) => {
  for (const [path, config] of Object.entries(CACHE_CONFIG)) {
    if (url.includes(path)) {
      return config;
    }
  }
  return { ttl: 0, cacheable: false };
};

// Request interceptor - Add token and cache key
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if request should be cached
    const cacheConfig = getCacheConfig(config.url);

    if (cacheConfig.cacheable !== false && cacheConfig.ttl > 0) {
      const cacheKey = cacheService.generateKey(config.url, config.params);
      const cachedData = cacheService.get(cacheKey, cacheConfig.storage || 'memory');

      if (cachedData) {
        // Return cached data with a special flag
        config.__cached = true;
        config.__cachedData = cachedData;
        return config;
      }

      // Check for duplicate pending requests
      const pendingKey = `${config.method}_${config.url}_${JSON.stringify(config.params)}`;
      if (pendingRequests.has(pendingKey)) {
        // Return the pending promise to avoid duplicate requests
        return pendingRequests.get(pendingKey);
      }

      // Store the promise for this request
      const requestPromise = new Promise((resolve, reject) => {
        config.__pendingResolve = resolve;
        config.__pendingReject = reject;
      });
      pendingRequests.set(pendingKey, requestPromise);
      config.__pendingKey = pendingKey;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Cache responses and handle pending requests
api.interceptors.response.use(
  async (response) => {
    // Handle cached response
    if (response.config.__cached) {
      return Promise.resolve(response.config.__cachedData);
    }

    // Cache the response if applicable
    const cacheConfig = getCacheConfig(response.config.url);
    if (cacheConfig.cacheable !== false && cacheConfig.ttl > 0) {
      const cacheKey = cacheService.generateKey(response.config.url, response.config.params);
      cacheService.set(cacheKey, response, cacheConfig.ttl, cacheConfig.storage || 'memory');
    }

    // Resolve pending request promise if exists
    if (response.config.__pendingKey) {
      const resolve = response.config.__pendingResolve;
      if (resolve) {
        resolve(response);
      }
      pendingRequests.delete(response.config.__pendingKey);
    }

    return response;
  },
  async (error) => {
    // Reject pending request promise if exists
    if (error.config && error.config.__pendingKey) {
      const reject = error.config.__pendingReject;
      if (reject) {
        reject(error);
      }
      pendingRequests.delete(error.config.__pendingKey);
    }

    // ✅ Only redirect on 401 for authenticated endpoints, not auth endpoints themselves
    const url = error.config?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


// frontend/src/services/api.js
let warmupPromise = null;

export const warmupBackend = () => {
  // Only fire once per browser session
  if (warmupPromise) return warmupPromise;

  warmupPromise = api.get('/health', {
    timeout: 90000,           // tolerate cold start
    __skipCache: true         // don't let the cache layer interfere
  }).catch(() => {
    // Silent — cold-start wake-up is best-effort
  });

  return warmupPromise;
};
// Cache invalidation helper
export const invalidateCache = (urlPattern = null) => {
  if (urlPattern) {
    cacheService.clearByPrefix(urlPattern);
  } else {
    cacheService.clear('memory');
  }
};

// Invalidate cache on data mutations
export const invalidateOnMutation = (url) => {
  // Invalidate related caches when data changes
  if (url.includes('/payments')) {
    cacheService.clearByPrefix('/payments');
    cacheService.clearByPrefix('/reports/summary');
    cacheService.clearByPrefix('/users/stats');
  }
  if (url.includes('/transactions')) {
    cacheService.clearByPrefix('/transactions');
    cacheService.clearByPrefix('/reports');
  }
  if (url.includes('/users')) {
    cacheService.clearByPrefix('/users');
    cacheService.clearByPrefix('/reports/summary');
  }
  if (url.includes('/organizations/settings')) {
    cacheService.clearByPrefix('/organizations');
  }
  if (url.includes('/payment-gateway')) {
    // Don't cache payment gateway responses
    cacheService.clearByPrefix('/payment-gateway');
  }
};

// Intercept POST, PUT, DELETE requests to invalidate cache
const originalPost = api.post;
const originalPut = api.put;
const originalDelete = api.delete;

api.post = async (...args) => {
  const response = await originalPost(...args);
  invalidateOnMutation(args[0]);
  return response;
};

api.put = async (...args) => {
  const response = await originalPut(...args);
  invalidateOnMutation(args[0]);
  return response;
};

api.delete = async (...args) => {
  const response = await originalDelete(...args);
  invalidateOnMutation(args[0]);
  return response;
};

export default api;
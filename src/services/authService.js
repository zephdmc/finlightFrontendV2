// import api from './api';

// /**
//  * Authentication Service
//  * Handles all authentication-related API calls
//  */
// class AuthService {
//   /**
//    * Login user
//    * @param {string} email - User email
//    * @param {string} password - User password
//    * @returns {Promise} - Login response
//    */
//   async login(email, password) {
//     try {
//       const response = await api.post('/auth/login', { email, password });
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
//       }
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Register new user
//    * @param {Object} userData - User registration data
//    * @returns {Promise} - Registration response
//    */
//   async register(userData) {
//     try {
//       const response = await api.post('/auth/register', userData);
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
//       }
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Logout user
//    */
//   logout() {
//     localStorage.removeItem('token');
//     delete api.defaults.headers.common['Authorization'];
//   }

//   /**
//    * Get current user
//    * @returns {Promise} - User data
//    */
//   async getCurrentUser() {
//     try {
//       const response = await api.get('/auth/me');
//       return response.data.user;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Change password
//    * @param {string} currentPassword - Current password
//    * @param {string} newPassword - New password
//    * @returns {Promise} - Change password response
//    */
//   async changePassword(currentPassword, newPassword) {
//     try {
//       const response = await api.post('/auth/change-password', {
//         currentPassword,
//         newPassword
//       });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Request password reset
//    * @param {string} email - User email
//    * @returns {Promise} - Reset request response
//    */
//   async forgotPassword(email) {
//     try {
//       const response = await api.post('/auth/forgot-password', { email });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Reset password with token
//    * @param {string} token - Reset token
//    * @param {string} newPassword - New password
//    * @returns {Promise} - Reset response
//    */
//   async resetPassword(token, newPassword) {
//     try {
//       const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Refresh JWT token
//    * @returns {Promise} - New token
//    */
//   async refreshToken() {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.post('/auth/refresh-token', { token });
//       if (response.data.token) {
//         localStorage.setItem('token', response.data.token);
//         api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
//       }
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Verify admin PIN
//    * @param {string} pin - Admin PIN
//    * @returns {Promise} - Verification response
//    */
//   async verifyAdminPin(pin) {
//     try {
//       const response = await api.post('/auth/verify-admin-pin', { pin });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Check if user is authenticated
//    * @returns {boolean} - Authentication status
//    */
//   isAuthenticated() {
//     const token = localStorage.getItem('token');
//     return !!token;
//   }

//   /**
//    * Get auth token
//    * @returns {string|null} - JWT token
//    */
//   getToken() {
//     return localStorage.getItem('token');
//   }

//   /**
//    * Handle API errors
//    * @param {Error} error - Error object
//    * @returns {Error} - Enhanced error
//    */
//   handleError(error) {
//     if (error.response) {
//       // Server responded with error
//       const { status, data } = error.response;

//       if (status === 401) {
//         this.logout();
//         window.location.href = '/login';
//       }

//       const message = data.message || 'An error occurred';
//       const enhancedError = new Error(message);
//       enhancedError.status = status;
//       enhancedError.data = data;
//       return enhancedError;
//     } else if (error.request) {
//       // Request made but no response
//       return new Error('Network error. Please check your connection.');
//     } else {
//       // Something else happened
//       return error;
//     }
//   }
// }

// export default new AuthService();

import api from './api';
import cacheService from './cacheService';

/**
 * Authentication Service
 * Handles all authentication-related API calls with caching
 */
class AuthService {
  /**
   * Login user - No cache (always fresh)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Login response
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        // Clear user cache on login
        cacheService.remove('current_user');
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user - No cache
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration response
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user - Clear all auth caches
   */
  logout() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    // Clear auth-related caches
    cacheService.remove('current_user');
    cacheService.clearByPrefix('auth');
      }

  /**
   * Get current user - Cached for 5 minutes
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - User data
   */
  async getCurrentUser(useCache = true) {
    try {
      const cacheKey = 'current_user';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/auth/me');
      const userData = response.data.user;
      cacheService.set(cacheKey, userData, 5 * 60 * 1000); // 5 minutes cache
      return userData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password - Invalidate user cache
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Change password response
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      // Invalidate user cache
      cacheService.remove('current_user');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset - No cache
   * @param {string} email - User email
   * @returns {Promise} - Reset request response
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token - Invalidate user cache
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} - Reset response
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
      // Invalidate user cache as password changed
      cacheService.remove('current_user');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh JWT token - No cache
   * @returns {Promise} - New token
   */
  async refreshToken() {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/auth/refresh-token', { token });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify admin PIN - Cached for 1 minute (sensitive operation)
   * @param {string} pin - Admin PIN
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Verification response
   */
  async verifyAdminPin(pin, useCache = false) {
    try {
      // Admin PIN verification is sensitive - better not to cache by default
      if (useCache) {
        const cacheKey = `admin_pin_${pin}`;
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }

        const response = await api.post('/auth/verify-admin-pin', { pin });
        cacheService.set(cacheKey, response.data, 1 * 60 * 1000); // 1 minute cache
        return response.data;
      }

      const response = await api.post('/auth/verify-admin-pin', { pin });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Get auth token
   * @returns {string|null} - JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Manually invalidate user cache
   */
  invalidateUserCache() {
    cacheService.remove('current_user');
      }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} - Enhanced error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        this.logout();
        window.location.href = '/login';
      }

      const message = data.message || 'An error occurred';
      const enhancedError = new Error(message);
      enhancedError.status = status;
      enhancedError.data = data;
      return enhancedError;
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return error;
    }
  }
}

export default new AuthService();
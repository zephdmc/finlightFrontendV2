import api from './api';
import cacheService from './cacheService';

/**
 * Payment Service
 * Handles all payment-related API calls with caching
 */
class PaymentService {
  /**
   * Get user payments - Cached for 2 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Payments data
   */
  async getUserPayments(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('user_payments', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/payments', { params });
      cacheService.set(cacheKey, response.data, 2 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all payments (Admin only) - Cached for 3 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Payments data
   */
  async getAllPayments(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('all_payments', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/payments/all', { params });
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get outstanding payments - Cached for 2 minutes
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Outstanding payments
   */
  async getOutstandingPayments(useCache = true) {
    try {
      const cacheKey = 'outstanding_payments';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/payments/outstanding');
      cacheService.set(cacheKey, response.data, 2 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment (Admin only) - Invalidate caches
   * @param {Object} paymentData - Payment data
   * @returns {Promise} - Created payment
   */
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create admin direct payment (Admin only - no Paystack) - Invalidate caches
   * @param {Object} paymentData - Payment data
   * @returns {Promise} - Created payment
   */
  async createAdminDirectPayment(paymentData) {
    try {
      const response = await api.post('/payments/admin-direct', paymentData);
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  // ============================================================
  // NEW: HYBRID DUES ENDPOINTS
  // ============================================================

  /**
   * NEW: Get dues summary for the logged-in member
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Dues summary data
   */
  async getDuesSummary(useCache = true) {
    try {
      const cacheKey = 'dues_summary';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/payments/dues-summary');
      cacheService.set(cacheKey, response.data, 2 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * NEW: Get a specific dues payment by ID
   * @param {string} id - Dues payment ID
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Dues payment data
   */
  async getDuesPayment(id, useCache = true) {
    try {
      const cacheKey = `dues_payment_${id}`;

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get(`/payments/dues-payment/${id}`);
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * NEW: Create or update a dues payment with months array (Member)
   * @param {Object} paymentData - Payment data with months array
   * @returns {Promise} - Created/updated payment
   */
  async createDuesPayment(paymentData) {
    try {
      const response = await api.post('/payments/member-payment', {
        ...paymentData,
        // Ensure hybrid dues fields are included
        months: paymentData.months || [],
        monthCount: paymentData.monthCount || 0,
        monthlyPrice: paymentData.monthlyPrice || paymentData.amount
      });
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * NEW: Admin - Create dues payments for a member
   * @param {Object} data - { userId, paymentTypeId, months, name, type, amount }
   * @returns {Promise} - Created payment
   */
  async adminCreateDuesPayment(data) {
    try {
      const response = await api.post('/payments/admin/create-dues', data);
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============================================================
  // EXISTING METHODS
  // ============================================================


  /**
   * ✅ UPDATED: Initialize payment with Paystack (now uses /payment-gateway)
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - Initialization response
   */
  async initializePayment(paymentId) {
    try {
      // Changed from '/payments/initialize' to '/payment-gateway/initialize'
      const response = await api.post('/payment-gateway/initialize', { paymentId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * ✅ UPDATED: Verify payment (now uses /payment-gateway)
   * @param {string} reference - Transaction reference
   * @returns {Promise} - Verification response
   */
  async verifyPayment(reference) {
    try {
      // Changed from '/payments/verify/' to '/payment-gateway/verify/'
      const response = await api.get(`/payment-gateway/verify/${reference}`);
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * ✅ NEW: Check payment status via gateway
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - Payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payment-gateway/status/${paymentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment summary - Cached for 5 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Payment summary
   */
  async getPaymentSummary(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('payment_summary', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/payments/summary', { params });
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export payments to CSV - No cache for exports
   * @param {Object} params - Export parameters
   * @returns {Promise} - Blob data
   */
  async exportPayments(params = {}) {
    try {
      const response = await api.get('/payments/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process bulk payments (Admin only) - Invalidate caches
   * @param {Array} payments - Array of payment data
   * @returns {Promise} - Processing results
   */
  async processBulkPayments(payments) {
    try {
      const response = await api.post('/payments/bulk', { payments });
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single payment - Cached for 5 minutes
   * @param {string} id - Payment ID
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Payment data
   */
  async getPayment(id, useCache = true) {
    try {
      const cacheKey = `payment_${id}`;

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get(`/payments/${id}`);
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update payment (Admin only) - Invalidate caches
   * @param {string} id - Payment ID
   * @param {Object} data - Update data
   * @returns {Promise} - Updated payment
   */
  async updatePayment(id, data) {
    try {
      const response = await api.put(`/payments/${id}`, data);
      cacheService.remove(`payment_${id}`);
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete payment (Admin only) - Invalidate caches
   * @param {string} id - Payment ID
   * @returns {Promise} - Delete response
   */
  async deletePayment(id) {
    try {
      const response = await api.delete(`/payments/${id}`);
      cacheService.remove(`payment_${id}`);
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment statistics (Admin only) - Cached for 5 minutes
   * @param {Object} params - Query parameters (startDate, endDate)
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Payment statistics
   */
  async getPaymentStats(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('payment_stats', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/payments/stats', { params });
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment by reference - Cached for 10 minutes
   * @param {string} reference - Transaction reference
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Payment data
   */
  async getPaymentByReference(reference, useCache = true) {
    try {
      const cacheKey = `payment_ref_${reference}`;

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get(`/payments/reference/${reference}`);
      cacheService.set(cacheKey, response.data, 10 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send payment reminder (Admin only) - No cache needed
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - Reminder response
   */
  async sendPaymentReminder(paymentId) {
    try {
      const response = await api.post(`/payments/${paymentId}/reminder`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payments by member (Admin only) - Cached for 3 minutes
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Member payments
   */
  async getMemberPayments(userId, params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey(`member_payments_${userId}`, params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get(`/payments/member/${userId}`, { params });
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment types (for dropdown) - Cached for 15 minutes (rarely changes)
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Payment types
   */
  async getPaymentTypes(useCache = true) {
    try {
      const cacheKey = 'payment_types_list';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/payment-types');
      cacheService.set(cacheKey, response.data, 15 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Manually invalidate all payment caches
   */
  invalidateCache() {
    cacheService.clearByPrefix('payment');
    cacheService.clearByPrefix('user_payments');
    cacheService.clearByPrefix('all_payments');
    cacheService.remove('outstanding_payments');
    cacheService.remove('payment_types_list');
      }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} - Enhanced error
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Payment operation failed';
      const enhancedError = new Error(message);
      enhancedError.status = status;
      enhancedError.data = data;
      return enhancedError;
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return error;
    }
  }
}

export default new PaymentService();
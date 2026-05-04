import api from './api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */
class PaymentService {
  /**
   * Get user payments
   * @param {Object} params - Query parameters
   * @returns {Promise} - Payments data
   */
  async getUserPayments(params = {}) {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all payments (Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise} - Payments data
   */
  async getAllPayments(params = {}) {
    try {
      const response = await api.get('/payments/all', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get outstanding payments
   * @returns {Promise} - Outstanding payments
   */
  async getOutstandingPayments() {
    try {
      const response = await api.get('/payments/outstanding');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment (Admin only)
   * @param {Object} paymentData - Payment data
   * @returns {Promise} - Created payment
   */
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create admin direct payment (Admin only - no Paystack)
   * @param {Object} paymentData - Payment data
   * @returns {Promise} - Created payment
   */
  async createAdminDirectPayment(paymentData) {
    try {
      const response = await api.post('/payments/admin-direct', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Initialize payment with Paystack
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - Initialization response
   */
  async initializePayment(paymentId) {
    try {
      const response = await api.post('/payments/initialize', { paymentId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify payment
   * @param {string} reference - Transaction reference
   * @returns {Promise} - Verification response
   */
  async verifyPayment(reference) {
    try {
      const response = await api.get(`/payments/verify/${reference}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment summary
   * @param {Object} params - Query parameters
   * @returns {Promise} - Payment summary
   */
  async getPaymentSummary(params = {}) {
    try {
      const response = await api.get('/payments/summary', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export payments to CSV
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
   * Process bulk payments (Admin only)
   * @param {Array} payments - Array of payment data
   * @returns {Promise} - Processing results
   */
  async processBulkPayments(payments) {
    try {
      const response = await api.post('/payments/bulk', { payments });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single payment
   * @param {string} id - Payment ID
   * @returns {Promise} - Payment data
   */
  async getPayment(id) {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update payment (Admin only)
   * @param {string} id - Payment ID
   * @param {Object} data - Update data
   * @returns {Promise} - Updated payment
   */
  async updatePayment(id, data) {
    try {
      const response = await api.put(`/payments/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete payment (Admin only)
   * @param {string} id - Payment ID
   * @returns {Promise} - Delete response
   */
  async deletePayment(id) {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment statistics (Admin only)
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise} - Payment statistics
   */
  async getPaymentStats(params = {}) {
    try {
      const response = await api.get('/payments/stats', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment by reference
   * @param {string} reference - Transaction reference
   * @returns {Promise} - Payment data
   */
  async getPaymentByReference(reference) {
    try {
      const response = await api.get(`/payments/reference/${reference}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send payment reminder (Admin only)
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
   * Get payments by member (Admin only)
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Member payments
   */
  async getMemberPayments(userId, params = {}) {
    try {
      const response = await api.get(`/payments/member/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment types (for dropdown)
   * @returns {Promise} - Payment types
   */
  async getPaymentTypes() {
    try {
      const response = await api.get('/payment-types');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
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
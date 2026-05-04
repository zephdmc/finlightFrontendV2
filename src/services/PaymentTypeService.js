import api from './api';

/**
 * Payment Type Service
 * Handles all payment type-related API calls
 */
class PaymentTypeService {
  /**
   * Get all payment types
   * @param {Object} params - Query parameters (limit, page, etc.)
   * @returns {Promise} - Payment types data
   */
  async getAllPaymentTypes(params = {}) {
    try {
      const response = await api.get('/payment-types', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get active payment types
   * @returns {Promise} - Active payment types
   */
  async getActivePaymentTypes() {
    try {
      const response = await api.get('/payment-types/active');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single payment type by ID
   * @param {string} id - Payment type ID
   * @returns {Promise} - Payment type data
   */
  async getPaymentType(id) {
    try {
      const response = await api.get(`/payment-types/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new payment type (Admin only)
   * @param {Object} paymentTypeData - Payment type data
   * @param {string} paymentTypeData.name - Name of payment type
   * @param {string} paymentTypeData.description - Description
   * @param {number} paymentTypeData.amount - Amount in NGN
   * @param {boolean} paymentTypeData.is_mandatory - Whether payment is mandatory
   * @param {string} paymentTypeData.frequency - Frequency (one-time, monthly, quarterly, yearly)
   * @param {number} paymentTypeData.duration_value - Duration value for recurring payments
   * @param {string} paymentTypeData.duration_unit - Duration unit (days, weeks, months, years)
   * @returns {Promise} - Created payment type
   */
  async createPaymentType(paymentTypeData) {
    try {
      const response = await api.post('/payment-types', paymentTypeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update payment type (Admin only)
   * @param {string} id - Payment type ID
   * @param {Object} paymentTypeData - Updated payment type data
   * @returns {Promise} - Updated payment type
   */
  async updatePaymentType(id, paymentTypeData) {
    try {
      const response = await api.put(`/payment-types/${id}`, paymentTypeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete payment type (Admin only)
   * @param {string} id - Payment type ID
   * @returns {Promise} - Delete response
   */
  async deletePaymentType(id) {
    try {
      const response = await api.delete(`/payment-types/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment type statistics
   * @returns {Promise} - Statistics data
   */
  async getPaymentTypeStats() {
    try {
      const response = await api.get('/payment-types/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payments by payment type
   * @param {string} typeId - Payment type ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Payments data
   */
  async getPaymentsByType(typeId, params = {}) {
    try {
      const response = await api.get(`/payment-types/${typeId}/payments`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get members with unpaid payments for a specific type
   * @param {string} typeId - Payment type ID
   * @returns {Promise} - Members with unpaid payments
   */
  async getUnpaidMembersByType(typeId) {
    try {
      const response = await api.get(`/payment-types/${typeId}/unpaid-members`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create bulk payment types (Admin only)
   * @param {Array} paymentTypes - Array of payment type data
   * @returns {Promise} - Created payment types
   */
  async createBulkPaymentTypes(paymentTypes) {
    try {
      const response = await api.post('/payment-types/bulk', { paymentTypes });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle payment type status (activate/deactivate)
   * @param {string} id - Payment type ID
   * @param {boolean} isActive - Active status
   * @returns {Promise} - Updated payment type
   */
  async togglePaymentTypeStatus(id, isActive) {
    try {
      const response = await api.patch(`/payment-types/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment types by frequency
   * @param {string} frequency - Payment frequency
   * @returns {Promise} - Payment types
   */
  async getPaymentTypesByFrequency(frequency) {
    try {
      const response = await api.get(`/payment-types/frequency/${frequency}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get mandatory payment types
   * @returns {Promise} - Mandatory payment types
   */
  async getMandatoryPaymentTypes() {
    try {
      const response = await api.get('/payment-types/mandatory');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get optional payment types
   * @returns {Promise} - Optional payment types
   */
  async getOptionalPaymentTypes() {
    try {
      const response = await api.get('/payment-types/optional');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate recurring payments from a payment type
   * @param {string} id - Payment type ID
   * @param {Object} options - Generation options
   * @returns {Promise} - Generation result
   */
  async generateRecurringPayments(id, options = {}) {
    try {
      const response = await api.post(`/payment-types/${id}/generate-payments`, options);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment type usage report
   * @param {string} id - Payment type ID
   * @param {Object} params - Report parameters
   * @returns {Promise} - Usage report
   */
  async getPaymentTypeUsageReport(id, params = {}) {
    try {
      const response = await api.get(`/payment-types/${id}/report`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export payment types to CSV
   * @param {Object} params - Export parameters
   * @returns {Promise} - Blob data
   */
  async exportPaymentTypes(params = {}) {
    try {
      const response = await api.get('/payment-types/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment type summary for dashboard
   * @returns {Promise} - Summary data
   */
  async getPaymentTypeSummary() {
    try {
      const response = await api.get('/payment-types/summary');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate payment type data
   * @param {Object} paymentTypeData - Payment type data to validate
   * @returns {Object} - Validation result
   */
  validatePaymentTypeData(paymentTypeData) {
    const errors = {};
    
    if (!paymentTypeData.name || paymentTypeData.name.trim() === '') {
      errors.name = 'Payment type name is required';
    }
    
    if (!paymentTypeData.amount || paymentTypeData.amount <= 0) {
      errors.amount = 'Valid amount greater than 0 is required';
    }
    
    if (paymentTypeData.frequency !== 'one-time') {
      if (!paymentTypeData.duration_value || paymentTypeData.duration_value < 1) {
        errors.duration_value = 'Valid duration value is required for recurring payments';
      }
      if (!paymentTypeData.duration_unit) {
        errors.duration_unit = 'Duration unit is required for recurring payments';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format payment type for display
   * @param {Object} paymentType - Payment type object
   * @returns {Object} - Formatted payment type
   */
  formatPaymentType(paymentType) {
    return {
      ...paymentType,
      formattedAmount: `₦${paymentType.amount.toLocaleString()}`,
      formattedFrequency: paymentType.frequency === 'one-time' ? 'One Time' : 
                         paymentType.frequency.charAt(0).toUpperCase() + paymentType.frequency.slice(1),
      scheduleText: paymentType.frequency === 'one-time' ? 'One-time payment' :
                    `Every ${paymentType.duration_value} ${paymentType.duration_unit}`,
      statusText: paymentType.is_mandatory ? 'Mandatory' : 'Optional',
      statusColor: paymentType.is_mandatory ? 'red' : 'green'
    };
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} - Enhanced error
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Payment type operation failed';
      const enhancedError = new Error(message);
      enhancedError.status = status;
      enhancedError.data = data;
      return enhancedError;
    }
    return new Error('Network error. Please check your connection.');
  }
}

export default new PaymentTypeService();
import api from './api';

/**
 * Report Service
 * Handles all report-related API calls
 */
class ReportService {
  /**
   * Get financial summary
   * @returns {Promise} - Summary data
   */
  async getSummary() {
    try {
      const response = await api.get('/reports/summary');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get monthly summary for charts
   * @param {Object} params - Query parameters
   * @returns {Promise} - Monthly data
   */
  async getMonthlySummary(params = {}) {
    try {
      const response = await api.get('/reports/monthly-summary', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get paid members report
   * @param {Object} params - Query parameters
   * @returns {Promise} - Paid members data
   */
  async getPaidMembers(params = {}) {
    try {
      const response = await api.get('/reports/paid-members', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get outstanding payments report
   * @param {Object} params - Query parameters
   * @returns {Promise} - Outstanding payments
   */
  async getOutstandingPayments(params = {}) {
    try {
      const response = await api.get('/reports/outstanding', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get income report
   * @param {Object} params - Query parameters
   * @returns {Promise} - Income data
   */
  async getIncomeReport(params = {}) {
    try {
      const response = await api.get('/reports/income', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get expenditure report
   * @param {Object} params - Query parameters
   * @returns {Promise} - Expenditure data
   */
  async getExpenditureReport(params = {}) {
    try {
      const response = await api.get('/reports/expenditure', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get member payment report
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Member payment data
   */
  async getMemberPaymentReport(userId, params = {}) {
    try {
      const response = await api.get(`/reports/member/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get financial overview with trends
   * @param {Object} params - Query parameters
   * @returns {Promise} - Financial overview
   */
  async getFinancialOverview(params = {}) {
    try {
      const response = await api.get('/reports/financial-overview', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get member performance metrics
   * @returns {Promise} - Performance metrics
   */
  async getMemberPerformance() {
    try {
      const response = await api.get('/reports/member-performance');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export report
   * @param {string} type - Report type (income, expenditure, payments, members)
   * @param {Object} params - Export parameters
   * @returns {Promise} - Blob data
   */
  async exportReport(type, params = {}) {
    try {
      const response = await api.get(`/reports/export/${type}`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get dashboard statistics
   * @returns {Promise} - Dashboard stats
   */
  async getDashboardStats() {
    try {
      const [summary, monthly, performance] = await Promise.all([
        this.getSummary(),
        this.getMonthlySummary(),
        this.getMemberPerformance()
      ]);
      
      return {
        summary: summary.data,
        monthly: monthly.data,
        performance: performance.data
      };
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
      const message = data.message || 'Failed to fetch report data';
      const enhancedError = new Error(message);
      enhancedError.status = status;
      enhancedError.data = data;
      return enhancedError;
    }
    return new Error('Network error. Please check your connection.');
  }
}

export default new ReportService();
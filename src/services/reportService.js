// import api from './api';

// /**
//  * Report Service
//  * Handles all report-related API calls
//  */
// class ReportService {
//   /**
//    * Get financial summary
//    * @returns {Promise} - Summary data
//    */
//   async getSummary() {
//     try {
//       const response = await api.get('/reports/summary');
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get monthly summary for charts
//    * @param {Object} params - Query parameters
//    * @returns {Promise} - Monthly data
//    */
//   async getMonthlySummary(params = {}) {
//     try {
//       const response = await api.get('/reports/monthly-summary', { params });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get paid members report
//    * @param {Object} params - Query parameters
//    * @returns {Promise} - Paid members data
//    */
//   async getPaidMembers(params = {}) {
//     try {
//       const response = await api.get('/reports/paid-members', { params });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get outstanding payments report
//    * @param {Object} params - Query parameters
//    * @returns {Promise} - Outstanding payments
//    */
//   async getOutstandingPayments(params = {}) {
//     try {
//       const response = await api.get('/reports/outstanding', { params });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get income report
//    * @param {Object} params - Query parameters
//    * @returns {Promise} - Income data
//    */
//   async getIncomeReport(params = {}) {
//     try {
//       const response = await api.get('/reports/income', { params });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get expenditure report
//    * @param {Object} params - Query parameters
//    * @returns {Promise} - Expenditure data
//    */
//   async getExpenditureReport(params = {}) {
//     try {
//       const response = await api.get('/reports/expenditure', { params });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get member payment report
//    * @param {string} userId - User ID
//    * @param {Object} params - Query parameters
//    * @returns {Promise} - Member payment data
//    */
//   async getMemberPaymentReport(userId, params = {}) {
//     try {
//       const response = await api.get(`/reports/member/${userId}`, { params });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get financial overview with trends
//    * @param {Object} params - Query parameters
//    * @returns {Promise} - Financial overview
//    */
//   async getFinancialOverview(params = {}) {
//     try {
//       const response = await api.get('/reports/financial-overview', { params });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get member performance metrics
//    * @returns {Promise} - Performance metrics
//    */
//   async getMemberPerformance() {
//     try {
//       const response = await api.get('/reports/member-performance');
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Export report
//    * @param {string} type - Report type (income, expenditure, payments, members)
//    * @param {Object} params - Export parameters
//    * @returns {Promise} - Blob data
//    */
//   async exportReport(type, params = {}) {
//     try {
//       const response = await api.get(`/reports/export/${type}`, {
//         params,
//         responseType: 'blob'
//       });
//       return response.data;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Get dashboard statistics
//    * @returns {Promise} - Dashboard stats
//    */
//   async getDashboardStats() {
//     try {
//       const [summary, monthly, performance] = await Promise.all([
//         this.getSummary(),
//         this.getMonthlySummary(),
//         this.getMemberPerformance()
//       ]);

//       return {
//         summary: summary.data,
//         monthly: monthly.data,
//         performance: performance.data
//       };
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Handle API errors
//    * @param {Error} error - Error object
//    * @returns {Error} - Enhanced error
//    */
//   handleError(error) {
//     if (error.response) {
//       const { status, data } = error.response;
//       const message = data.message || 'Failed to fetch report data';
//       const enhancedError = new Error(message);
//       enhancedError.status = status;
//       enhancedError.data = data;
//       return enhancedError;
//     }
//     return new Error('Network error. Please check your connection.');
//   }
// }

// export default new ReportService();

import api from './api';
import cacheService from './cacheService';

/**
 * Report Service
 * Handles all report-related API calls with caching
 */
class ReportService {
  /**
   * Get financial summary - Cached for 3 minutes
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Summary data
   */
  async getSummary(useCache = true) {
    try {
      const cacheKey = 'report_summary';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/summary');
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000); // 3 minutes cache
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get monthly summary for charts - Cached for 5 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Monthly data
   */
  async getMonthlySummary(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('report_monthly', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/monthly-summary', { params });
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes cache
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get paid members report - Cached for 5 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Paid members data
   */
  async getPaidMembers(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('report_paid_members', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/paid-members', { params });
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get outstanding payments report - Cached for 3 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Outstanding payments
   */
  async getOutstandingPayments(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('report_outstanding', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/outstanding', { params });
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get income report - Cached for 5 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Income data
   */
  async getIncomeReport(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('report_income', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/income', { params });
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get expenditure report - Cached for 5 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Expenditure data
   */
  async getExpenditureReport(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('report_expenditure', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/expenditure', { params });
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get member payment report - Cached for 5 minutes
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Member payment data
   */
  async getMemberPaymentReport(userId, params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey(`report_member_${userId}`, params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get(`/reports/member/${userId}`, { params });
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get financial overview with trends - Cached for 3 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Financial overview
   */
  async getFinancialOverview(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('report_financial_overview', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/financial-overview', { params });
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get member performance metrics - Cached for 10 minutes (slow-changing)
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Performance metrics
   */
  async getMemberPerformance(useCache = true) {
    try {
      const cacheKey = 'report_member_performance';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/reports/member-performance');
      cacheService.set(cacheKey, response.data, 10 * 60 * 1000); // 10 minutes cache
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export report - No cache for exports
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
   * Get dashboard statistics - Cached for 3 minutes
   * @param {boolean} useCache - Whether to use cached data
   * @returns {Promise} - Dashboard stats
   */
  async getDashboardStats(useCache = true) {
    try {
      const cacheKey = 'dashboard_stats';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const [summary, monthly, performance] = await Promise.all([
        this.getSummary(false),
        this.getMonthlySummary({}, false),
        this.getMemberPerformance(false)
      ]);

      const result = {
        summary: summary.data,
        monthly: monthly.data,
        performance: performance.data
      };

      cacheService.set(cacheKey, result, 3 * 60 * 1000);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Manually invalidate all report caches
   */
  invalidateCache() {
    cacheService.clearByPrefix('report_');
    cacheService.remove('dashboard_stats');
      }

  /**
   * Invalidate specific report cache by type
   * @param {string} reportType - Type of report to invalidate
   */
  invalidateReportCache(reportType) {
    cacheService.clearByPrefix(`report_${reportType}`);
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
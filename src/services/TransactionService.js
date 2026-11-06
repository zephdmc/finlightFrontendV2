import api from './api';
import cacheService from './cacheService';

/**
 * Transaction Service
 * Handles all income and expenditure-related API calls with caching
 */
class TransactionService {
  /**
   * Record new income (Admin only) - Invalidate related caches
   */
  async recordIncome(incomeData) {
    try {
      const response = await api.post('/transactions/income', incomeData);
      // Invalidate transaction and report caches
      cacheService.clearByPrefix('/transactions');
      cacheService.clearByPrefix('/reports');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Record new expenditure (Admin only) - Invalidate related caches
   */
  async recordExpenditure(expenditureData) {
    try {
      const response = await api.post('/transactions/expenditure', expenditureData);
      // Invalidate transaction and report caches
      cacheService.clearByPrefix('/transactions');
      cacheService.clearByPrefix('/reports');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all income records (Admin only) - Cached for 3 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   */
  async getAllIncomes(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('/transactions/income', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/transactions/income', { params });
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000); // 3 minutes cache
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all expenditure records (Admin only) - Cached for 3 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   */
  async getAllExpenditures(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('/transactions/expenditure', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/transactions/expenditure', { params });
      cacheService.set(cacheKey, response.data, 3 * 60 * 1000); // 3 minutes cache
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all transactions (combined income and expenditure) - Cached for 3 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   */
  async getAllTransactions(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('/transactions/all', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const [incomeRes, expenditureRes] = await Promise.all([
        this.getAllIncomes(params, false), // Don't use cache for fresh combined
        this.getAllExpenditures(params, false)
      ]);

      const incomes = incomeRes.data?.records || incomeRes.data || [];
      const expenditures = expenditureRes.data?.records || expenditureRes.data || [];

      const formattedIncomes = incomes.map(inc => ({
        id: inc._id,
        type: 'income',
        amount: inc.amount,
        description: inc.description,
        source: inc.source,
        date: inc.date || inc.createdAt,
        createdAt: inc.createdAt,
        updatedAt: inc.updatedAt
      }));

      const formattedExpenditures = expenditures.map(exp => ({
        id: exp._id,
        type: 'expense',
        amount: exp.amount,
        description: exp.description,
        purpose: exp.purpose,
        date: exp.date || exp.createdAt,
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt
      }));

      const allTransactions = [...formattedIncomes, ...formattedExpenditures];
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      const result = {
        success: true,
        data: allTransactions,
        count: allTransactions.length
      };

      cacheService.set(cacheKey, result, 3 * 60 * 1000);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transaction summary for dashboard - Cached for 2 minutes
   * @param {boolean} useCache - Whether to use cached data
   */
  async getTransactionSummary(useCache = true) {
    try {
      const cacheKey = 'transaction_summary';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/transactions/summary');
      cacheService.set(cacheKey, response.data, 2 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current balance - Cached for 1 minute (frequently changing)
   * @param {boolean} useCache - Whether to use cached data
   */
  async getBalance(useCache = true) {
    try {
      const cacheKey = 'current_balance';

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/transactions/balance');
      cacheService.set(cacheKey, response.data, 1 * 60 * 1000); // 1 minute cache
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent transactions - Cached for 2 minutes
   * @param {number} limit - Number of transactions
   * @param {boolean} useCache - Whether to use cached data
   */
  async getRecentTransactions(limit = 10, useCache = true) {
    try {
      const cacheKey = `recent_transactions_${limit}`;

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
                    return cachedData;
        }
      }

      const response = await api.get('/transactions/recent', { params: { limit } });
      cacheService.set(cacheKey, response.data, 2 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single income record by ID - Cached for 5 minutes
   * @param {string} id - Income ID
   * @param {boolean} useCache - Whether to use cached data
   */
  async getIncomeById(id, useCache = true) {
    try {
      const cacheKey = `income_${id}`;

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) return cachedData;
      }

      const response = await api.get(`/transactions/income/${id}`);
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single expenditure record by ID - Cached for 5 minutes
   * @param {string} id - Expenditure ID
   * @param {boolean} useCache - Whether to use cached data
   */
  async getExpenditureById(id, useCache = true) {
    try {
      const cacheKey = `expenditure_${id}`;

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) return cachedData;
      }

      const response = await api.get(`/transactions/expenditure/${id}`);
      cacheService.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update income record (Admin only) - Invalidate caches
   */
  async updateIncome(id, updateData) {
    try {
      const response = await api.put(`/transactions/income/${id}`, updateData);
      // Invalidate specific cache and related caches
      cacheService.remove(`income_${id}`);
      cacheService.clearByPrefix('/transactions');
      cacheService.clearByPrefix('/reports');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update expenditure record (Admin only) - Invalidate caches
   */
  async updateExpenditure(id, updateData) {
    try {
      const response = await api.put(`/transactions/expenditure/${id}`, updateData);
      // Invalidate specific cache and related caches
      cacheService.remove(`expenditure_${id}`);
      cacheService.clearByPrefix('/transactions');
      cacheService.clearByPrefix('/reports');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete income record (Admin only) - Invalidate caches
   */
  async deleteIncome(id) {
    try {
      const response = await api.delete(`/transactions/income/${id}`);
      // Invalidate caches
      cacheService.remove(`income_${id}`);
      cacheService.clearByPrefix('/transactions');
      cacheService.clearByPrefix('/reports');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete expenditure record (Admin only) - Invalidate caches
   */
  async deleteExpenditure(id) {
    try {
      const response = await api.delete(`/transactions/expenditure/${id}`);
      // Invalidate caches
      cacheService.remove(`expenditure_${id}`);
      cacheService.clearByPrefix('/transactions');
      cacheService.clearByPrefix('/reports');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get income summary by period - Cached for 5 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   */
  async getIncomeSummary(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('income_summary', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) return cachedData;
      }

      const incomes = await this.getAllIncomes(params, false);
      const incomeList = incomes.data?.records || incomes.data || [];

      const totalIncome = incomeList.reduce((sum, inc) => sum + (inc.amount || 0), 0);
      const totalCount = incomeList.length;

      const bySource = incomeList.reduce((acc, inc) => {
        const source = inc.source || 'Other';
        acc[source] = (acc[source] || 0) + inc.amount;
        return acc;
      }, {});

      const result = {
        success: true,
        data: {
          total: totalIncome,
          count: totalCount,
          bySource,
          averageAmount: totalCount > 0 ? totalIncome / totalCount : 0
        }
      };

      cacheService.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get expenditure summary by period - Cached for 5 minutes
   * @param {Object} params - Query parameters
   * @param {boolean} useCache - Whether to use cached data
   */
  async getExpenditureSummary(params = {}, useCache = true) {
    try {
      const cacheKey = cacheService.generateKey('expenditure_summary', params);

      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) return cachedData;
      }

      const expenditures = await this.getAllExpenditures(params, false);
      const expenseList = expenditures.data?.records || expenditures.data || [];

      const totalExpense = expenseList.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const totalCount = expenseList.length;

      const byPurpose = expenseList.reduce((acc, exp) => {
        const purpose = exp.purpose || 'Other';
        acc[purpose] = (acc[purpose] || 0) + exp.amount;
        return acc;
      }, {});

      const result = {
        success: true,
        data: {
          total: totalExpense,
          count: totalCount,
          byPurpose,
          averageAmount: totalCount > 0 ? totalExpense / totalCount : 0
        }
      };

      cacheService.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export transactions to CSV - No cache for exports
   */
  async exportTransactions(params = {}) {
    try {
      const transactions = await this.getAllTransactions(params, false);
      const data = transactions.data || [];

      const headers = ['Date', 'Type', 'Source/Purpose', 'Amount', 'Description'];
      const csvRows = data.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type === 'income' ? 'Income' : 'Expense',
        t.type === 'income' ? t.source : t.purpose,
        t.amount,
        t.description || ''
      ]);

      const csvContent = [headers, ...csvRows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });

      return blob;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Manually invalidate transaction cache
   */
  invalidateCache() {
    cacheService.clearByPrefix('/transactions');
    cacheService.remove('transaction_summary');
    cacheService.remove('current_balance');
      }

  /**
   * Validate income data
   */
  validateIncomeData(incomeData) {
    const errors = {};

    if (!incomeData.amount || incomeData.amount <= 0) {
      errors.amount = 'Valid amount greater than 0 is required';
    }

    if (!incomeData.source || incomeData.source.trim() === '') {
      errors.source = 'Source of income is required';
    }

    if (!incomeData.date) {
      errors.date = 'Date is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate expenditure data
   */
  validateExpenditureData(expenditureData) {
    const errors = {};

    if (!expenditureData.amount || expenditureData.amount <= 0) {
      errors.amount = 'Valid amount greater than 0 is required';
    }

    if (!expenditureData.purpose || expenditureData.purpose.trim() === '') {
      errors.purpose = 'Purpose of expenditure is required';
    }

    if (!expenditureData.date) {
      errors.date = 'Date is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format transaction for display
   */
  formatTransaction(transaction) {
    return {
      ...transaction,
      formattedAmount: `â‚¦${transaction.amount.toLocaleString()}`,
      formattedDate: new Date(transaction.date).toLocaleDateString(),
      formattedType: transaction.type === 'income' ? 'Income' : 'Expense',
      amountColor: transaction.type === 'income' ? 'text-green-600' : 'text-red-600',
      amountPrefix: transaction.type === 'income' ? '+' : '-'
    };
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Transaction operation failed';
      const enhancedError = new Error(message);
      enhancedError.status = status;
      enhancedError.data = data;
      return enhancedError;
    }
    return new Error('Network error. Please check your connection.');
  }
}

export default new TransactionService();
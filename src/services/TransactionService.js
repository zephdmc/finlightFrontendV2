import api from './api';

/**
 * Transaction Service
 * Handles all income and expenditure-related API calls
 */
class TransactionService {
  /**
   * Record new income (Admin only)
   */
  async recordIncome(incomeData) {
    try {
      const response = await api.post('/transactions/income', incomeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Record new expenditure (Admin only)
   */
  async recordExpenditure(expenditureData) {
    try {
      const response = await api.post('/transactions/expenditure', expenditureData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all income records (Admin only)
   */
  async getAllIncomes(params = {}) {
    try {
      const response = await api.get('/transactions/income', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all expenditure records (Admin only)
   */
  async getAllExpenditures(params = {}) {
    try {
      const response = await api.get('/transactions/expenditure', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all transactions (combined income and expenditure)
   */
  async getAllTransactions(params = {}) {
    try {
      const [incomeRes, expenditureRes] = await Promise.all([
        this.getAllIncomes(params),
        this.getAllExpenditures(params)
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
      
      return {
        success: true,
        data: allTransactions,
        count: allTransactions.length
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transaction summary for dashboard
   */
  async getTransactionSummary() {
    try {
      const response = await api.get('/transactions/summary');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current balance
   */
  async getBalance() {
    try {
      const response = await api.get('/transactions/balance');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 10) {
    try {
      const response = await api.get('/transactions/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single income record by ID (Admin only)
   */
  async getIncomeById(id) {
    try {
      const response = await api.get(`/transactions/income/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single expenditure record by ID (Admin only)
   */
  async getExpenditureById(id) {
    try {
      const response = await api.get(`/transactions/expenditure/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update income record (Admin only)
   */
  async updateIncome(id, updateData) {
    try {
      const response = await api.put(`/transactions/income/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update expenditure record (Admin only)
   */
  async updateExpenditure(id, updateData) {
    try {
      const response = await api.put(`/transactions/expenditure/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete income record (Admin only)
   */
  async deleteIncome(id) {
    try {
      const response = await api.delete(`/transactions/income/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete expenditure record (Admin only)
   */
  async deleteExpenditure(id) {
    try {
      const response = await api.delete(`/transactions/expenditure/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get income summary by period
   */
  async getIncomeSummary(params = {}) {
    try {
      const incomes = await this.getAllIncomes(params);
      const incomeList = incomes.data?.records || incomes.data || [];
      
      const totalIncome = incomeList.reduce((sum, inc) => sum + (inc.amount || 0), 0);
      const totalCount = incomeList.length;
      
      const bySource = incomeList.reduce((acc, inc) => {
        const source = inc.source || 'Other';
        acc[source] = (acc[source] || 0) + inc.amount;
        return acc;
      }, {});
      
      return {
        success: true,
        data: {
          total: totalIncome,
          count: totalCount,
          bySource,
          averageAmount: totalCount > 0 ? totalIncome / totalCount : 0
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get expenditure summary by period
   */
  async getExpenditureSummary(params = {}) {
    try {
      const expenditures = await this.getAllExpenditures(params);
      const expenseList = expenditures.data?.records || expenditures.data || [];
      
      const totalExpense = expenseList.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const totalCount = expenseList.length;
      
      const byPurpose = expenseList.reduce((acc, exp) => {
        const purpose = exp.purpose || 'Other';
        acc[purpose] = (acc[purpose] || 0) + exp.amount;
        return acc;
      }, {});
      
      return {
        success: true,
        data: {
          total: totalExpense,
          count: totalCount,
          byPurpose,
          averageAmount: totalCount > 0 ? totalExpense / totalCount : 0
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(params = {}) {
    try {
      const transactions = await this.getAllTransactions(params);
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
      formattedAmount: `₦${transaction.amount.toLocaleString()}`,
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
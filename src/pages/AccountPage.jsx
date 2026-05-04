import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { 
  Plus, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Search,
  X,
  Wallet,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import TransactionService from '../services/TransactionService';
import api from '../services/api';
import toast from 'react-hot-toast';

const AccountPage = () => {
  const { isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const incomeSources = [
    'Membership Fees', 'Donations', 'Event Income', 'Investment Returns',
    'Grants', 'Sponsorships', 'Other Income', 'Member Payments'
  ];
  
  const expensePurposes = [
    'Event Expenses', 'Utilities', 'Salaries', 'Maintenance', 'Charity',
    'Office Supplies', 'Transport', 'Equipment', 'Marketing', 'Other Expenses'
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [transactions]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      let allTransactions = [];
      let totalIncome = 0;
      let totalExpense = 0;

      // Fetch incomes
      try {
        const incomesResponse = await api.get('/transactions/income/public?limit=100');
        let incomes = [];
        if (incomesResponse?.data?.data?.records) {
          incomes = incomesResponse.data.data.records;
        } else if (incomesResponse?.data?.records) {
          incomes = incomesResponse.data.records;
        } else if (Array.isArray(incomesResponse?.data)) {
          incomes = incomesResponse.data;
        }
        
        incomes.forEach(inc => {
          allTransactions.push({
            id: inc._id,
            type: 'income',
            amount: inc.amount,
            date: inc.date,
            description: inc.description,
            source: inc.source,
            isFromPayment: false
          });
          totalIncome += inc.amount;
        });
      } catch (err) {
        console.error('Error fetching incomes:', err);
      }

      // Fetch expenditures
      try {
        const expendituresResponse = await api.get('/transactions/expenditure/public?limit=100');
        let expenditures = [];
        if (expendituresResponse?.data?.data?.records) {
          expenditures = expendituresResponse.data.data.records;
        } else if (expendituresResponse?.data?.records) {
          expenditures = expendituresResponse.data.records;
        } else if (Array.isArray(expendituresResponse?.data)) {
          expenditures = expendituresResponse.data;
        }
        
        expenditures.forEach(exp => {
          allTransactions.push({
            id: exp._id,
            type: 'expense',
            amount: exp.amount,
            date: exp.date,
            description: exp.description,
            purpose: exp.purpose,
            isFromPayment: false
          });
          totalExpense += exp.amount;
        });
      } catch (err) {
        console.error('Error fetching expenditures:', err);
      }

      // Fetch payments
      try {
        const paymentsResponse = await api.get('/payments/all');
        let payments = [];
        if (paymentsResponse?.data?.data?.records) {
          payments = paymentsResponse.data.data.records;
        } else if (paymentsResponse?.data?.records) {
          payments = paymentsResponse.data.records;
        } else if (Array.isArray(paymentsResponse?.data)) {
          payments = paymentsResponse.data;
        }
        
        const paidPayments = payments.filter(p => p && p.status === 'paid');
        
        paidPayments.forEach(payment => {
          allTransactions.push({
            id: payment._id,
            type: 'income',
            amount: payment.amount,
            date: payment.paidAt || payment.createdAt,
            description: payment.description || `${payment.type} payment`,
            source: `${payment.type?.toUpperCase() || 'Member'} Payment`,
            isFromPayment: true,
            paymentType: payment.type
          });
          totalIncome += payment.amount;
        });
      } catch (err) {
        console.error('Error fetching payments:', err);
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(allTransactions);
      setStats({
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        balance: totalIncome - totalExpense,
        incomeCount: allTransactions.filter(t => t.type === 'income').length,
        expenseCount: allTransactions.filter(t => t.type === 'expense').length
      });
      
      console.log('Total transactions loaded:', allTransactions.length);
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(error.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllTransactions();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const calculateStats = () => {
    const income = transactions.filter(t => t.type === 'income');
    const expense = transactions.filter(t => t.type === 'expense');
    
    setStats(prev => ({
      ...prev,
      incomeCount: income.length,
      expenseCount: expense.length
    }));
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    
    if (!incomeForm.amount || incomeForm.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!incomeForm.source) {
      toast.error('Please select a source');
      return;
    }
    
    setModalLoading(true);
    
    try {
      await TransactionService.recordIncome({
        amount: parseFloat(incomeForm.amount),
        source: incomeForm.source,
        date: incomeForm.date,
        description: incomeForm.description
      });
      
      toast.success('Income recorded successfully');
      setShowIncomeModal(false);
      setIncomeForm({
        amount: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      await fetchAllTransactions();
    } catch (error) {
      console.error('Error recording income:', error);
      toast.error(error.message || 'Failed to record income');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!expenseForm.amount || expenseForm.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!expenseForm.purpose) {
      toast.error('Please select a purpose');
      return;
    }
    
    setModalLoading(true);
    
    try {
      await TransactionService.recordExpenditure({
        amount: parseFloat(expenseForm.amount),
        purpose: expenseForm.purpose,
        date: expenseForm.date,
        description: expenseForm.description
      });
      
      toast.success('Expense recorded successfully');
      setShowExpenseModal(false);
      setExpenseForm({
        amount: '',
        purpose: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      await fetchAllTransactions();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error(error.message || 'Failed to record expense');
    } finally {
      setModalLoading(false);
    }
  };

  const clearFilters = () => {
    setFilter({
      type: 'all',
      startDate: '',
      endDate: '',
      search: ''
    });
    setShowFilters(false);
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (filter.type !== 'all') {
      filtered = filtered.filter(t => t.type === filter.type);
    }
    if (filter.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filter.startDate));
    }
    if (filter.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filter.endDate));
    }
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        (t.source && t.source.toLowerCase().includes(searchTerm)) ||
        (t.purpose && t.purpose.toLowerCase().includes(searchTerm)) ||
        (t.description && t.description.toLowerCase().includes(searchTerm))
      );
    }
    
    return filtered;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const filteredTransactions = getFilteredTransactions();
  const hasActiveFilters = filter.type !== 'all' || filter.startDate || filter.endDate || filter.search;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <h1 className="font-semibold text-lg">Account Management</h1>
              </div>
              <p className="text-blue-100 text-xs mt-1">Track all financial transactions</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Action Buttons - Income and Expense */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setShowIncomeModal(true)}
              className="bg-green-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Income
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-red-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Total Income</p>
                <TrendingUp className="h-3 w-3 text-green-300" />
              </div>
              <p className="text-base font-bold text-green-300">{formatCurrency(stats.totalIncome)}</p>
              <p className="text-xs text-blue-200">{stats.incomeCount} transactions</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Total Expenses</p>
                <TrendingDown className="h-3 w-3 text-red-300" />
              </div>
              <p className="text-base font-bold text-red-300">{formatCurrency(stats.totalExpense)}</p>
              <p className="text-xs text-blue-200">{stats.expenseCount} transactions</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 col-span-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Net Balance</p>
                <DollarSign className="h-3 w-3 text-yellow-300" />
              </div>
              <p className={`text-lg font-bold ${stats.balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
              <select
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filter.startDate}
                  onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
                />
                <input
                  type="date"
                  value={filter.endDate}
                  onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-red-600 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && !showFilters && (
            <div className="mt-2 flex flex-wrap gap-2">
              {filter.type !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg text-xs text-blue-700">
                  {filter.type}
                </span>
              )}
              {filter.startDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg text-xs text-blue-700">
                  From: {filter.startDate}
                </span>
              )}
              {filter.endDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg text-xs text-blue-700">
                  To: {filter.endDate}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-gray-500">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <div key={transaction.id || index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          transaction.isFromPayment ? (
                            <CreditCard className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {transaction.type === 'income' 
                            ? (transaction.source || 'Payment Received')
                            : (transaction.purpose || 'Expense')
                          }
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(transaction.date)}
                          {transaction.isFromPayment && (
                            <span className="ml-2 text-xs text-blue-500">(Online Payment)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-base ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type === 'income' ? (transaction.isFromPayment ? 'Payment' : 'Income') : 'Expense'}
                      </span>
                    </div>
                  </div>
                  
                  {transaction.description && (
                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      {transaction.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Add Income</h3>
              </div>
              <button onClick={() => setShowIncomeModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleAddIncome} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
                <select
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select source</option>
                  {incomeSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
                <input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Optional description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Add Expense</h3>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                <select
                  value={expenseForm.purpose}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select purpose</option>
                  {expensePurposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Optional description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AccountPage;
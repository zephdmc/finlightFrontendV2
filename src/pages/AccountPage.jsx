import { useState, useEffect, useRef, useCallback } from 'react';
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
  CreditCard,
  Users,
  CheckCircle, ArrowLeft
} from 'lucide-react';
import TransactionService from '../services/TransactionService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useTransactions, usePaymentSummary, usePaymentsWithPenalties } from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AccountPage = () => {
  const { user, isAdmin } = useAuth();
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
    expenseCount: 0,
    paymentCount: 0,
    totalPayments: 0
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [transactions, setTransactions] = useState([]);

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ type: '', amount: 0, name: '' });
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
  const navigate = useNavigate();

  // Use ref to prevent infinite loop
  const isProcessingRef = useRef(false);
  const dataLoadedRef = useRef(false);

  // ========== REACT QUERY HOOKS ==========
  const {
    data: incomeTransactions = [],
    isLoading: incomeLoading,
    refetch: refetchIncomes
  } = useTransactions('income', 100);

  const {
    data: expenseTransactions = [],
    isLoading: expenseLoading,
    refetch: refetchExpenses
  } = useTransactions('expenditure', 100);

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments
  } = usePaymentsWithPenalties();

  const {
    data: summary = {},
    isLoading: summaryLoading,
    refetch: refetchSummary
  } = usePaymentSummary(user?._id || user?.id);

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

  // Process transactions when data loads - ONLY ONCE
  useEffect(() => {
    if (!isProcessingRef.current && !incomeLoading && !expenseLoading && !paymentsLoading && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      processTransactions();
    }
  }, [incomeTransactions, expenseTransactions, payments, incomeLoading, expenseLoading, paymentsLoading]);

  // Calculate stats when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      calculateStats();
    }
  }, [transactions]);

  const processTransactions = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;


    // Process income transactions (manual)
    const formattedIncomes = (incomeTransactions || []).map(income => ({
      id: income?._id,
      type: 'income',
      subType: 'manual_income',
      category: income?.source || income?.type || 'Manual Income',
      amount: income?.amount || 0,
      description: income?.description || '',
      source: income?.source || 'Unknown',
      date: income?.createdAt || income?.date,
      createdAt: income?.createdAt,
      icon: 'TrendingUp'
    }));

    // Process expense transactions
    const formattedExpenses = (expenseTransactions || []).map(exp => ({
      id: exp?._id,
      type: 'expenditure',
      subType: 'expense',
      category: exp?.purpose || 'Expense',
      amount: exp?.amount || 0,
      description: exp?.description || '',
      purpose: exp?.purpose || 'Unknown',
      date: exp?.createdAt || exp?.date,
      createdAt: exp?.createdAt,
      icon: 'TrendingDown'
    }));

    // Format payments as INCOME - only 'paid'
    const paymentsArray = Array.isArray(payments) ? payments : [];

    // Log payment details for debugging with penalties
    if (paymentsArray.length > 0) {
      paymentsArray.forEach((p, idx) => {
        let totalPenalty = 0;
        if (p?.penaltyBreakdown && p.penaltyBreakdown.length > 0) {
          p.penaltyBreakdown.forEach(item => {
            if (item.penalty && item.isLate) {
              totalPenalty += item.penalty;
            }
          });
        }
        const totalAmount = (p?.amount || 0) + totalPenalty;

              });
    }

    const formattedPayments = paymentsArray
      .filter(payment => {
        const amount = payment?.amount || 0;
        if (amount <= 0) return false;

        const status = (payment?.status || '').toLowerCase();

        // â­ ONLY count payments with status === 'paid'
        // This excludes fine/penalty records (like "6 times you came late")
        if (status !== 'paid') {
                    return false;
        }

        return true;
      })
      .map(payment => {
        let paymentType = 'Member Payment';
        let paymentDescription = payment?.description || '';

        const paymentName = payment?.name || payment?.paymentType || payment?.source || '';

        if (paymentName.toLowerCase().includes('wedding') || paymentName.toLowerCase().includes('leavy')) {
          paymentType = 'Wedding Levy';
        } else if (payment?.type === 'registration' || paymentDescription.toLowerCase().includes('registration')) {
          paymentType = 'Registration Fee';
        } else if (payment?.type === 'annual' || paymentDescription.toLowerCase().includes('annual')) {
          paymentType = 'Annual Dues';
        } else if (payment?.type === 'event' || paymentDescription.toLowerCase().includes('event')) {
          paymentType = 'Event Fee';
        } else if (payment?.type === 'fine' || paymentDescription.toLowerCase().includes('fine')) {
          paymentType = 'Fine/Penalty';
        } else if (payment?.type === 'late' || paymentDescription.toLowerCase().includes('late')) {
          paymentType = 'Late Fee';
        }

        // â­ Calculate total including penalty
        let totalPenalty = 0;
        if (payment?.penaltyBreakdown && payment.penaltyBreakdown.length > 0) {
          payment.penaltyBreakdown.forEach(item => {
            if (item.penalty && item.isLate) {
              totalPenalty += item.penalty;
            }
          });
        }
        const totalAmount = (payment?.amount || 0) + totalPenalty;

        return {
          id: payment?._id,
          type: 'income',
          subType: 'member_payment',
          category: paymentType,
          amount: totalAmount,
          description: paymentDescription || `${paymentType} payment${totalPenalty > 0 ? ` (includes â‚¦${totalPenalty} penalty)` : ''}`,
          memberName: payment?.memberName || payment?.name || 'Member',
          paymentMethod: payment?.paymentMethod || 'Card',
          date: payment?.date || payment?.paidAt || payment?.createdAt,
          createdAt: payment?.createdAt,
          icon: 'CreditCard',
          isMemberPayment: true,
          penaltyAmount: totalPenalty > 0 ? totalPenalty : 0,
          baseAmount: payment?.amount || 0
        };
      });


    // Combine all transactions
    const allTransactions = [...formattedIncomes, ...formattedPayments, ...formattedExpenses];

    allTransactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });


    setTransactions(allTransactions);
    isProcessingRef.current = false;
  };

  const calculateStats = () => {
    const incomes = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expenditure');
    const memberPayments = incomes.filter(t => t.subType === 'member_payment');
    const manualIncomes = incomes.filter(t => t.subType === 'manual_income');

    const totalIncome = incomes.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalMemberPayments = memberPayments.reduce((sum, t) => sum + (t.amount || 0), 0);
    const balance = totalIncome - totalExpense;


    setStats({
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      balance: balance,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
      paymentCount: memberPayments.length,
      totalPayments: totalMemberPayments,
      manualIncomeCount: manualIncomes.length
    });
  };

  const fetchAllTransactions = useCallback(async () => {
    setRefreshing(true);
    dataLoadedRef.current = false;
    isProcessingRef.current = false;
    await Promise.all([
      refetchIncomes(),
      refetchExpenses(),
      refetchPayments(),
      refetchSummary()
    ]);
    // Small delay to let the data settle
    setTimeout(() => {
      dataLoadedRef.current = false;
      isProcessingRef.current = false;
      processTransactions();
      setRefreshing(false);
    }, 500);
  }, [refetchIncomes, refetchExpenses, refetchPayments, refetchSummary]);

  const handleRefresh = async () => {
    await fetchAllTransactions();
    toast.success('Data refreshed');
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

      setSuccessData({
        type: 'income',
        amount: parseFloat(incomeForm.amount),
        name: incomeForm.source
      });

      setShowIncomeModal(false);
      setShowSuccessModal(true);
      setIncomeForm({
        amount: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });

    } catch (error) {
      console.error('Error recording income:', error);
      toast.error(error.message || 'Failed to record income');
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

      setSuccessData({
        type: 'expense',
        amount: parseFloat(expenseForm.amount),
        name: expenseForm.purpose
      });

      setShowExpenseModal(false);
      setShowSuccessModal(true);
      setExpenseForm({
        amount: '',
        purpose: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });

    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error(error.message || 'Failed to record expense');
      setModalLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessData({ type: '', amount: 0, name: '' });
    // Refresh the page entirely to show the new transaction
    window.location.reload();
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
        (t.category && t.category.toLowerCase().includes(searchTerm)) ||
        (t.source && t.source.toLowerCase().includes(searchTerm)) ||
        (t.purpose && t.purpose.toLowerCase().includes(searchTerm)) ||
        (t.description && t.description.toLowerCase().includes(searchTerm)) ||
        (t.memberName && t.memberName.toLowerCase().includes(searchTerm))
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

  const getTransactionIcon = (transaction) => {
    if (transaction.type === 'income') {
      if (transaction.isMemberPayment) {
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      }
      return <TrendingUp className="h-4 w-4 text-blue-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTransactionColor = (transaction) => {
    if (transaction.type === 'income') {
      return 'bg-blue-100';
    }
    return 'bg-red-100';
  };

  const isLoading = incomeLoading || expenseLoading || paymentsLoading || summaryLoading;

  if (isLoading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const handleBackToHome = () => {
    // Navigate based on user role
    if (isAdmin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />


      <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8  space-y-4">
        {/* Header */}

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-b-3xl p-4 text-white">




          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToHome}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <h1 className="font-semibold text-lg">Account Management</h1>
                  </div>
                  <p className="text-blue-100 text-xs mt-1">Track all financial transactions</p>
                </div>

              </div>
            </div>
            <div className="flex items-center gap-2">

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action Buttons - Income and Expense */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setShowIncomeModal(true)}
              className="bg-cyan-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
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

          {/* Stats Cards â€” Remodeled: Big Net Balance on right */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* LEFT: Income + Expenditure stacked */}
            <div className="col-span-1 space-y-3">
              {/* Total Income */}
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-blue-100 text-xs">Total Income</p>
                  <TrendingUp className="h-3 w-3 text-cyan-300" />
                </div>
                <p className="text-base font-bold text-cyan-300">
                  {formatCurrency(stats.totalIncome)}
                </p>
                <p className="text-xs text-blue-200">{stats.incomeCount} transactions</p>
              </div>

              {/* Total Expenses */}
              <div className="bg-white/10  rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-blue-100 text-xs">Total Expenses</p>
                  <TrendingDown className="h-3 w-3 text-red-300" />
                </div>
                <p className="text-base font-bold text-red-300">
                  {formatCurrency(stats.totalExpense)}
                </p>
                <p className="text-xs text-blue-200">{stats.expenseCount} transactions</p>
              </div>
            </div>

            {/* RIGHT: Big Net Balance */}
            <div className="col-span-1 bg-white/10 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <p className="text-blue-100 text-xs mb-2">Net Balance</p>
              <p
                className={`text-2xl font-bold leading-tight ${stats.balance >= 0 ? 'text-cyan-300' : 'text-red-300'
                  }`}
              >
                {formatCurrency(stats.balance)}
              </p>
              {/* <div
                className={`mt-2 h-2 w-2 rounded-full ${stats.balance >= 0 ? 'bg-cyan-300' : 'bg-red-300'
                  }`}
              /> */}
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
              className={`p-2.5 rounded-xl border transition-colors ${showFilters || hasActiveFilters
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
                <option value="expenditure">Expenses Only</option>
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
            <p className="text-sm px-2 text-gray-500">
              Transaction History
            </p>
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
              <button
                onClick={handleRefresh}
                className="mt-4 text-blue-600 text-sm font-medium"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <div key={transaction.id || index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getTransactionColor(transaction)}`}>
                        {getTransactionIcon(transaction)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {transaction.category || (transaction.type === 'income' ? 'Income' : 'Expense')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(transaction.date)}
                          {transaction.isMemberPayment && transaction.memberName && (
                            <span className="ml-2 text-xs text-gray-500">
                              by {transaction.memberName}
                            </span>
                          )}
                          {transaction.subType === 'manual_income' && (
                            <span className="ml-2 text-xs text-cyan-500">
                              (Manual Entry)
                            </span>
                          )}
                          {/* â­ Show penalty badge */}
                          {transaction.penaltyAmount > 0 && (
                            <span className="ml-2 text-xs  text-gray-700 px-1.5 py-0.5 rounded-full">
                              +â‚¦{transaction.penaltyAmount} penalty
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-base ${transaction.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${transaction.type === 'income'
                        ? (transaction.isMemberPayment ? ' text-gray-700' : ' text-gray-700')
                        : 'text-red-700'
                        }`}>
                        {transaction.type === 'income'
                          ? (transaction.isMemberPayment ? 'Member Payment' : 'Income')
                          : 'Expense'}
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
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select source</option>
                  {incomeSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (â‚¦) *</label>
                <input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
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
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (â‚¦) *</label>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md text-center">
            <div className={`p-6 ${successData.type === 'income' ? 'bg-blue-50' : 'bg-red-50'} rounded-t-2xl`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 ${successData.type === 'income' ? 'bg-blue-100' : 'bg-red-100'} rounded-full mb-4`}>
                <CheckCircle className={`h-8 w-8 ${successData.type === 'income' ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {successData.type === 'income' ? 'Income Added!' : 'Expense Added!'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {successData.type === 'income' ? 'Source:' : 'Purpose:'} {successData.name}
              </p>
              <p className="text-xl font-bold text-gray-800 mt-2">
                {formatCurrency(successData.amount)}
              </p>
            </div>

            <div className="p-6">
              <button
                onClick={handleCloseSuccessModal}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import TransactionService from '../../services/TransactionService';
import api from '../../services/api';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Calendar,
  Download,
  RefreshCw,
  Wallet,
  BarChart3,
  ChevronRight,
  PieChart,
  CreditCard,
  Filter,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState({
    type: 'all',
    limit: 10
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [calculatedTotals, setCalculatedTotals] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalPayments: 0,
    totalManualIncome: 0,
    netBalance: 0,
    paymentCount: 0,
    totalMembers: 0,
    paidMembers: 0,
    totalOutstanding: 0,
    outstandingCount: 0
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    applyFilters();
  }, [recentTransactions, transactionFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let totalPaymentsAmount = 0;
      let paidPayments = [];
      let manualIncomes = [];
      let totalManualIncome = 0;
      let totalExpense = 0;
      let expenditures = [];
      let totalOutstanding = 0;
      let outstandingCount = 0;

      // Fetch payments
      try {
        const paymentsRes = await api.get('/payments/all');
        let allPayments = [];
        if (paymentsRes?.data?.data?.records) {
          allPayments = paymentsRes.data.data.records;
        } else if (paymentsRes?.data?.records) {
          allPayments = paymentsRes.data.records;
        } else if (Array.isArray(paymentsRes?.data)) {
          allPayments = paymentsRes.data;
        }
        
        paidPayments = allPayments.filter(p => p && p.status === 'paid');
        const unpaidPayments = allPayments.filter(p => p && p.status === 'unpaid');
        totalPaymentsAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        totalOutstanding = unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        outstandingCount = unpaidPayments.length;
        setOutstandingPayments(unpaidPayments);
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
      
      // Fetch manual incomes
      try {
        const incomesResponse = await api.get('/transactions/income');
        if (incomesResponse?.data?.data?.records) {
          manualIncomes = incomesResponse.data.data.records;
        } else if (incomesResponse?.data?.records) {
          manualIncomes = incomesResponse.data.records;
        } else if (Array.isArray(incomesResponse?.data)) {
          manualIncomes = incomesResponse.data;
        }
        totalManualIncome = manualIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
      } catch (err) {
        console.error('Error fetching manual incomes:', err);
      }
      
      // Fetch members
      try {
        const membersRes = await api.get('/users?limit=100');
        let members = [];
        if (membersRes?.data?.data?.records) {
          members = membersRes.data.data.records;
        } else if (membersRes?.data?.records) {
          members = membersRes.data.records;
        } else if (Array.isArray(membersRes?.data)) {
          members = membersRes.data;
        }
        const totalMembers = members.filter(m => m.role === 'member').length;
        const registrationPayments = paidPayments.filter(p => p.type === 'registration');
        const paidMembersCount = registrationPayments.length;
        
        setCalculatedTotals(prev => ({
          ...prev,
          totalMembers: totalMembers,
          paidMembers: paidMembersCount,
          totalOutstanding: totalOutstanding,
          outstandingCount: outstandingCount
        }));
      } catch (err) {
        console.error('Error fetching members:', err);
      }
      
      // Fetch expenses
      try {
        const expendituresRes = await api.get('/transactions/expenditure');
        if (expendituresRes?.data?.data?.records) {
          expenditures = expendituresRes.data.data.records;
        } else if (expendituresRes?.data?.records) {
          expenditures = expendituresRes.data.records;
        } else if (Array.isArray(expendituresRes?.data)) {
          expenditures = expendituresRes.data;
        }
        totalExpense = expenditures.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      } catch (err) {
        console.error('Error fetching expenditures:', err);
      }
      
      // Calculate totals
      const totalIncome = totalManualIncome + totalPaymentsAmount;
      const netBalance = totalIncome - totalExpense;
      
      setCalculatedTotals(prev => ({
        ...prev,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        totalPayments: totalPaymentsAmount,
        totalManualIncome: totalManualIncome,
        netBalance: netBalance,
        paymentCount: paidPayments.length
      }));
      
      // Generate monthly data
      generateMonthlyData(paidPayments, manualIncomes);
      
      // Fetch recent transactions (combining all)
      await fetchRecentTransactions(paidPayments, manualIncomes, expenditures);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (payments, manualIncomes) => {
    const monthlyMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    months.forEach(month => {
      monthlyMap.set(month, { income: 0 });
    });
    
    payments.forEach(payment => {
      if (payment.paidAt) {
        const date = new Date(payment.paidAt);
        if (date.getFullYear() === currentYear) {
          const monthName = months[date.getMonth()];
          const existing = monthlyMap.get(monthName);
          existing.income += payment.amount;
          monthlyMap.set(monthName, existing);
        }
      }
    });
    
    manualIncomes.forEach(income => {
      if (income.date) {
        const date = new Date(income.date);
        if (date.getFullYear() === currentYear) {
          const monthName = months[date.getMonth()];
          const existing = monthlyMap.get(monthName);
          existing.income += income.amount;
          monthlyMap.set(monthName, existing);
        }
      }
    });
    
    const chartData = months.map(month => ({
      monthName: month,
      income: monthlyMap.get(month).income
    }));
    
    setMonthlyData(chartData);
  };

  const fetchRecentTransactions = async (payments, manualIncomes, expenditures) => {
    try {
      let allTransactions = [];

      payments.forEach(payment => {
        allTransactions.push({
          id: payment._id,
          type: 'payment',
          amount: payment.amount,
          date: payment.paidAt || payment.createdAt,
          description: payment.description || `${payment.type} payment`,
          member: payment.user?.name || 'Member',
          category: 'Payment',
          categoryLabel: 'Payment'
        });
      });

      manualIncomes.forEach(inc => {
        allTransactions.push({
          id: inc._id,
          type: 'income',
          amount: inc.amount,
          date: inc.date || inc.createdAt,
          description: inc.description,
          source: inc.source,
          category: 'Income',
          categoryLabel: 'Income'
        });
      });

      expenditures.forEach(exp => {
        allTransactions.push({
          id: exp._id,
          type: 'expense',
          amount: exp.amount,
          date: exp.date || exp.createdAt,
          description: exp.description,
          purpose: exp.purpose,
          category: 'Expense',
          categoryLabel: 'Expense'
        });
      });

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setRecentTransactions(allTransactions);
      applyFilters();
      
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...recentTransactions];
    
    if (transactionFilter.type !== 'all') {
      let typeMap = {
        'payment': 'Payment',
        'income': 'Income',
        'expense': 'Expense'
      };
      filtered = filtered.filter(t => t.category === typeMap[transactionFilter.type]);
    }
    
    filtered = filtered.slice(0, transactionFilter.limit);
    
    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (type, value) => {
    setTransactionFilter(prev => ({ ...prev, [type]: value }));
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setTransactionFilter({ type: 'all', limit: 10 });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date not set';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getCategoryStyle = (category) => {
    switch(category) {
      case 'Payment':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CreditCard };
      case 'Income':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: TrendingUp };
      case 'Expense':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: TrendingDown };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Wallet };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 animate-pulse">
            <div className="h-5 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h1 className="font-semibold text-lg">Admin Dashboard</h1>
              </div>
              <p className="text-blue-100 text-xs mt-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats Summary Row */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-blue-200">Total Income</p>
              <p className="text-sm font-bold">{formatCurrency(calculatedTotals.totalIncome)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Expenses</p>
              <p className="text-sm font-bold">{formatCurrency(calculatedTotals.totalExpense)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Balance</p>
              <p className={`text-sm font-bold ${calculatedTotals.netBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(calculatedTotals.netBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Total Members</p>
            <p className="text-xl font-bold text-gray-900">{calculatedTotals.totalMembers}</p>
            <p className="text-xs text-green-600 mt-1">{calculatedTotals.paidMembers} paid registration</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Total Income</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(calculatedTotals.totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {calculatedTotals.paymentCount} payments + ₦{calculatedTotals.totalManualIncome.toLocaleString()} manual
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Expenditure</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(calculatedTotals.totalExpense)}</p>
          </div>

          {/* REMOVED: Outstanding card - replaced with Payment Rate or kept as is without outstanding */}
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Payment Rate</p>
            <p className="text-lg font-bold text-purple-600">
              {calculatedTotals.totalMembers > 0 
                ? Math.round((calculatedTotals.paidMembers / calculatedTotals.totalMembers) * 100) 
                : 0}%
            </p>
            <p className="text-xs text-gray-400 mt-1">{calculatedTotals.paidMembers} of {calculatedTotals.totalMembers} members</p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Current Balance</p>
                <p className={`text-base font-bold ${calculatedTotals.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculatedTotals.netBalance)}
                </p>
              </div>
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Average Payment</p>
                <p className="text-base font-bold text-green-700">
                  {calculatedTotals.paymentCount > 0 
                    ? formatCurrency(Math.round(calculatedTotals.totalPayments / calculatedTotals.paymentCount))
                    : formatCurrency(0)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>

        {/* Period Selector and Chart */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex gap-1">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {monthlyData.length > 0 && (
            <div className="p-4">
              <div style={{ height: isMobile ? 200 : 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="monthName" tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ fontSize: 12, borderRadius: 12 }}
                    />
                    <Bar dataKey="income" fill="#10B981" name="Income" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions - Combined View with Filter */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Recent Activity
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredTransactions.length} of {recentTransactions.length} transactions
              </p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-3 w-3" />
                Filter
                {transactionFilter.type !== 'all' && (
                  <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[180px]">
                  <div className="p-2">
                    <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">Transaction Type</div>
                    <button
                      onClick={() => handleFilterChange('type', 'all')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => handleFilterChange('type', 'payment')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'payment' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Payments Only
                    </button>
                    <button
                      onClick={() => handleFilterChange('type', 'income')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'income' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Income Only
                    </button>
                    <button
                      onClick={() => handleFilterChange('type', 'expense')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'expense' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Expenses Only
                    </button>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">Items to Show</div>
                    {[5, 10, 15, 20, 50].map(limit => (
                      <button
                        key={limit}
                        onClick={() => handleFilterChange('limit', limit)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.limit === limit ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        Show {limit} items
                      </button>
                    ))}
                    
                    {(transactionFilter.type !== 'all' || transactionFilter.limit !== 10) && (
                      <>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          onClick={clearFilters}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Clear Filters
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No transactions found matching the filter</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction, index) => {
                  const style = getCategoryStyle(transaction.category);
                  const IconComponent = style.icon;
                  
                  return (
                    <div key={transaction.id || index} className={`flex items-center justify-between p-3 ${style.bg} rounded-xl border ${style.border}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center bg-white`}>
                            <IconComponent className="h-3 w-3" style={{ color: style.text.replace('text-', '') }} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {transaction.category === 'Payment' 
                                ? transaction.description || 'Member Payment'
                                : transaction.category === 'Income'
                                  ? transaction.source || 'Manual Income'
                                  : transaction.purpose || 'Expense'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${transaction.category === 'Expense' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.category === 'Expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-white ${style.text}`}>
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
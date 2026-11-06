import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Users, Wallet, PieChart as PieChartIcon, BarChart3, RefreshCw, ChevronRight, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  usePublicIncomes, usePublicExpenditures, usePublicPayments, useUsers
} from '../../hooks/usePaymentData';

/**
 * Reports Dashboard Component - Banking App Style
 * Comprehensive financial reporting with charts and exports
 */
const ReportsDashboard = ({ dateRange: propDateRange, isMobile: propIsMobile }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentDistribution, setPaymentDistribution] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dateRange, setDateRange] = useState(propDateRange || {
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isMobile, setIsMobile] = useState(propIsMobile || window.innerWidth < 768);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    amount: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // State for calculated totals
  const [calculatedTotals, setCalculatedTotals] = useState({
    totalIncome: 0,
    totalManualIncome: 0,
    totalPayments: 0,
    totalExpense: 0,
    netBalance: 0,
    totalMembers: 0,
    paidMembers: 0,
    outstandingPayments: 0,
    paymentCount: 0
  });

  // ========== REACT QUERY HOOKS ==========
  const {
    data: incomes = [],
    isLoading: incomesLoading,
    refetch: refetchIncomes
  } = usePublicIncomes(100);

  const {
    data: expenditures = [],
    isLoading: expendituresLoading,
    refetch: refetchExpenditures
  } = usePublicExpenditures(100);

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments
  } = usePublicPayments();

  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useUsers('member', 100);

  const expensePurposes = [
    'Event Expenses', 'Utilities', 'Salaries', 'Maintenance', 'Charity',
    'Office Supplies', 'Transport', 'Equipment', 'Marketing', 'Other Expenses'
  ];

  const isLoading = incomesLoading || expendituresLoading || paymentsLoading || usersLoading;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process data when React Query data arrives
  useEffect(() => {
    if (!isLoading && incomes !== undefined && expenditures !== undefined && payments !== undefined && users !== undefined) {
      processReportData();
    }
  }, [incomes, expenditures, payments, users, dateRange, selectedPeriod]);

  const processReportData = () => {

    // ---------- DEDUP ----------
    const seenPaymentIds = new Set();
    const allPayments = (Array.isArray(payments) ? payments : []).filter(p => {
      if (!p) return false;
      const id = p._id || p.id;
      if (!id) return true;
      if (seenPaymentIds.has(id)) return false;
      seenPaymentIds.add(id);
      return true;
    });

    console.table(allPayments.map(p => ({
      id: (p._id || p.id)?.slice(-6),
      amount: p.amount,
      baseAmount: p.baseAmount,
      penalty: p.penaltyAmount,
      hasPenalty: p.hasPenalty,
      type: p.type,
    })));

    // ---------- PAID PAYMENTS ----------
    // Backend already filters status:'paid'; keep the safety net
    const paidPayments = allPayments.filter(p => {
      const amount = p?.amount || 0;
      if (amount <= 0) return false;
      return true;
    });


    // ---------- TOTAL: â­ amount already includes penalty from backend ----------
    let totalPaymentsAmount = 0;
    paidPayments.forEach(p => {
      totalPaymentsAmount += (p?.amount || 0);
    });

    // ---------- MANUAL INCOMES ----------
    const seenIncomeIds = new Set();
    const manualIncomes = (Array.isArray(incomes) ? incomes : []).filter(inc => {
      if (!inc) return false;
      const id = inc._id || inc.id;
      if (!id) return true;
      if (seenIncomeIds.has(id)) return false;
      seenIncomeIds.add(id);
      return true;
    });

    const totalManualIncome = manualIncomes.reduce((s, i) => s + (i?.amount || 0), 0);

    // ---------- MEMBERS ----------
    const members = (Array.isArray(users) ? users : []).filter(m => m && m.role === 'member');
    const totalMembers = members.length;

    const paidMembersCount = paidPayments.filter(p => {
      const t = p?.type || p?.paymentTypeId?.name || '';
      return String(t).toLowerCase().includes('registration');
    }).length;

    // ---------- EXPENSES ----------
    const totalExpense = (Array.isArray(expenditures) ? expenditures : [])
      .reduce((s, e) => s + (e?.amount || 0), 0);

    // ---------- FINAL ----------
    const totalIncome = totalManualIncome + totalPaymentsAmount;
    const netBalance = totalIncome - totalExpense;


    setCalculatedTotals({
      totalIncome,
      totalManualIncome,
      totalPayments: totalPaymentsAmount,
      totalExpense,
      netBalance,
      totalMembers,
      paidMembers: paidMembersCount,
      outstandingPayments: 0,
      paymentCount: paidPayments.length
    });

    generateMonthlyData(paidPayments, manualIncomes, expenditures || []);
    generatePaymentDistribution(paidPayments);
  };
  const generateMonthlyData = (payments, manualIncomes, expenditures) => {
    const monthlyMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    months.forEach(month => {
      monthlyMap.set(month, { income: 0, expenditure: 0 });
    });

    // Add payments to months (as income) - â­ Include penalties
    // Add payments to months (income) - â­ amount already includes penalty
    if (payments && Array.isArray(payments)) {
      payments.forEach(payment => {
        if (!payment) return;
        const dateValue = payment?.paidAt || payment?.date || payment?.createdAt;
        if (!dateValue) return;

        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime()) || date < startDate || date > endDate || date.getFullYear() !== currentYear) return;

          const monthName = months[date.getMonth()];
          const existing = monthlyMap.get(monthName);
          existing.income += (payment?.amount || 0);   // â­ already includes penalty
          monthlyMap.set(monthName, existing);
        } catch (err) {
          console.warn('Invalid payment date:', dateValue);
        }
      });
    }

    // Add manual incomes to months (unchanged)
    if (manualIncomes && Array.isArray(manualIncomes)) {
      manualIncomes.forEach(income => {
        if (income && income.date) {
          try {
            const date = new Date(income.date);
            if (!isNaN(date.getTime()) && date >= startDate && date <= endDate && date.getFullYear() === currentYear) {
              const monthName = months[date.getMonth()];
              const existing = monthlyMap.get(monthName);
              existing.income += income.amount || 0;
              monthlyMap.set(monthName, existing);
            }
          } catch (err) {
            console.warn('Invalid income date:', income.date);
          }
        }
      });
    }

    // Add expenses to months (unchanged)
    if (expenditures && Array.isArray(expenditures)) {
      expenditures.forEach(expense => {
        if (expense && expense.date) {
          try {
            const date = new Date(expense.date);
            if (!isNaN(date.getTime()) && date >= startDate && date <= endDate && date.getFullYear() === currentYear) {
              const monthName = months[date.getMonth()];
              const existing = monthlyMap.get(monthName);
              existing.expenditure += expense.amount || 0;
              monthlyMap.set(monthName, existing);
            }
          } catch (err) {
            console.warn('Invalid expense date:', expense.date);
          }
        }
      });
    }

    const chartData = months.map(month => ({
      monthName: month,
      income: monthlyMap.get(month).income,
      expenditure: monthlyMap.get(month).expenditure
    }));

    setMonthlyData(chartData);
  };

  const generatePaymentDistribution = (payments) => {
    const distribution = {};

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      setPaymentDistribution([]);
      return;
    }

    payments.forEach(payment => {
      if (!payment) return;

      const amount = payment?.amount || 0;   // â­ already includes penalty
      if (amount <= 0) return;

      let type = 'other';
      if (payment?.type && typeof payment.type === 'string') {
        type = payment.type;
      } else if (payment?.paymentTypeId?.name) {
        type = payment.paymentTypeId.name;
      } else if (payment?.name) {
        type = payment.name;
      } else if (payment?.paymentType) {
        type = payment.paymentType;
      }

      let cleanType = 'Other';
      const lowerType = String(type).toLowerCase();
      if (lowerType === 'dues' || lowerType.includes('due')) cleanType = 'Dues';
      else if (lowerType === 'registration' || lowerType.includes('registration')) cleanType = 'Registration';
      else if (lowerType === 'fine' || lowerType.includes('fine')) cleanType = 'Fine';
      else if (lowerType === 'contribution' || lowerType.includes('contribution')) cleanType = 'Contribution';
      else if (lowerType === 'donation' || lowerType.includes('donation')) cleanType = 'Donation';
      else if (lowerType === 'leavy' || lowerType.includes('leavy') || lowerType.includes('levy')) cleanType = 'Levy';
      else {
        cleanType = String(type).charAt(0).toUpperCase() + String(type).slice(1).toLowerCase();
      }

      distribution[cleanType] = (distribution[cleanType] || 0) + amount;
    });

    const pieData = Object.keys(distribution).map(key => ({
      name: key,
      value: distribution[key]
    }));

    setPaymentDistribution(pieData);
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchIncomes(),
      refetchExpenditures(),
      refetchPayments(),
      refetchUsers()
    ]);
    toast.success('Reports refreshed');
    setRefreshing(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!expenseFormData.amount || expenseFormData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!expenseFormData.purpose) {
      toast.error('Please select a purpose');
      return;
    }

    try {
      await api.post('/transactions/expenditure', {
        amount: parseFloat(expenseFormData.amount),
        purpose: expenseFormData.purpose,
        date: expenseFormData.date,
        description: expenseFormData.description
      });

      toast.success('Expense recorded successfully');
      setShowExpenseForm(false);
      setExpenseFormData({
        amount: '',
        purpose: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      await refetchExpenditures();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error('Failed to record expense');
    }
  };

  const handleExport = async (type) => {
    try {
      let filename = '';
      let data = [];

      switch (type) {
        case 'payments':
          data = payments || [];
          filename = 'payments_report';
          break;
        case 'members':
          data = users || [];
          filename = 'members_report';
          break;
        case 'expenses':
          data = expenditures || [];
          filename = 'expenses_report';
          break;
        case 'incomes':
          data = incomes || [];
          filename = 'incomes_report';
          break;
        default:
          toast.error('Export type not available');
          return;
      }

      // Generate CSV
      const firstItem = data[0] || {};
      const headers = Object.keys(firstItem);
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          return JSON.stringify(value !== undefined && value !== null ? value : '');
        }).join(','))
      ];
      const csvContent = csvRows.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const COLORS = ['#095cedff', '#0f0e0dff', '#EF4444', '#8B5CF6', '#3B82F6'];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Total Income</p>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(calculatedTotals.totalIncome)}</p>
          {/* <p className="text-xs text-gray-400 mt-1">
            {calculatedTotals.paymentCount} payments ({calculatedTotals.totalPayments.toLocaleString()}) + {calculatedTotals.totalManualIncome.toLocaleString()} manual
          </p> */}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Expenditure</p>
            <TrendingDown className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-lg font-bold text-cyan-600">{formatCurrency(calculatedTotals.totalExpense)}</p>
          {/* <button
            onClick={() => setShowExpenseForm(true)}
            className="mt-1 text-xs text-blue-600 hover:text-blue-700"
          >
            + Add Expense
          </button> */}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Net Balance</p>
            <p className="h-4 w-4 text-blue-500"></p>
          </div>
          <p className={`text-lg font-bold ${calculatedTotals.netBalance >= 0 ? 'text-blue-600' : 'text-cyan-600'}`}>
            {formatCurrency(calculatedTotals.netBalance)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Members</p>
            <Users className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-lg font-bold text-cyan-600">{calculatedTotals.totalMembers}</p>
          {/* <p className="text-xs text-gray-400 mt-1">{calculatedTotals.paidMembers} paid registration</p> */}
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-1">
        {['week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${selectedPeriod === period
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Monthly Trend Chart */}
      {(monthlyData.some(m => m.income > 0) || monthlyData.some(m => m.expenditure > 0)) && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Monthly Financial Trend
            </h2>
          </div>
          <div className="p-3" style={{ height: isMobile ? 250 : 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="monthName" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ fontSize: 12, borderRadius: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                <Bar dataKey="income" fill="#1051f4ff" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenditure" fill="#ef4444ff" name="Expenditure" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payment Distribution Chart */}
      {paymentDistribution.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-cyan-600" />
              Payment Distribution by Type
            </h2>
          </div>
          <div className="p-3" style={{ height: isMobile ? 280 : 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={!isMobile ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
                  outerRadius={isMobile ? 70 : 90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ fontSize: 12, borderRadius: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {isMobile && (
            <div className="px-4 pb-4 flex flex-wrap gap-2 justify-center">
              {paymentDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-600" />
            Key Metrics
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Collection Rate</p>
              <p className="text-lg font-bold text-blue-600">
                {calculatedTotals.totalMembers > 0
                  ? Math.round((calculatedTotals.paidMembers / calculatedTotals.totalMembers) * 100)
                  : 0}%
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {calculatedTotals.paidMembers}/{calculatedTotals.totalMembers} members
            </p>
          </div>

          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Avg Payment/Member</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(calculatedTotals.totalMembers > 0
                  ? Math.round(calculatedTotals.totalIncome / calculatedTotals.totalMembers)
                  : 0)}
              </p>
            </div>
          </div>

          {/* <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Outstanding Balance</p>
              <p className="text-lg font-bold text-cyan-600">
                {formatCurrency(calculatedTotals.outstandingPayments)}
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Download className="h-4 w-4 text-blue-600" />
            Export Reports
          </h2>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleExport('payments')}
            className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="h-3 w-3 mr-1" />
            Payments
          </button>
          <button
            onClick={() => handleExport('incomes')}
            className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="h-3 w-3 mr-1" />
            Manual Income
          </button>
          <button
            onClick={() => handleExport('expenses')}
            className="flex items-center justify-center px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-medium hover:bg-cyan-700 transition-colors"
          >
            <Download className="h-3 w-3 mr-1" />
            Expenses
          </button>
          <button
            onClick={() => handleExport('members')}
            className="flex items-center justify-center px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-medium hover:bg-cyan-700 transition-colors"
          >
            <Download className="h-3 w-3 mr-1" />
            Members
          </button>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-cyan-600" />
                <h3 className="font-semibold text-gray-900">Record Expense</h3>
              </div>
              <button onClick={() => setShowExpenseForm(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                <select
                  value={expenseFormData.purpose}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select purpose</option>
                  {expensePurposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount () *</label>
                <input
                  type="number"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Optional description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
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

export default ReportsDashboard;
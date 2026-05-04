import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Users, Wallet, PieChart as PieChartIcon, BarChart3, RefreshCw, ChevronRight, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Reports Dashboard Component - Banking App Style
 * Comprehensive financial reporting with charts and exports
 */
const ReportsDashboard = ({ dateRange: propDateRange, isMobile: propIsMobile }) => {
  const [loading, setLoading] = useState(true);
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
  
  // State for calculated totals including payments and manual incomes
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
    fetchReportData();
  }, [selectedPeriod, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch payments
      const paymentsRes = await api.get('/payments/all');
      let payments = [];
      if (paymentsRes?.data?.data?.records) {
        payments = paymentsRes.data.data.records;
      } else if (paymentsRes?.data?.records) {
        payments = paymentsRes.data.records;
      } else if (Array.isArray(paymentsRes?.data)) {
        payments = paymentsRes.data;
      }
      
      const paidPayments = payments.filter(p => p && p.status === 'paid');
      const unpaidPayments = payments.filter(p => p && p.status === 'unpaid');
      const totalPaymentsAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const outstandingTotal = unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const paymentCount = paidPayments.length;
      
      // 2. Fetch manual incomes
      let totalManualIncome = 0;
      let manualIncomes = [];
      try {
        const incomesRes = await api.get('/transactions/income');
        if (incomesRes?.data?.data?.records) {
          manualIncomes = incomesRes.data.data.records;
        } else if (incomesRes?.data?.records) {
          manualIncomes = incomesRes.data.records;
        } else if (Array.isArray(incomesRes?.data)) {
          manualIncomes = incomesRes.data;
        }
        totalManualIncome = manualIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
      } catch (err) {
        console.error('Error fetching manual incomes:', err);
      }
      
      // 3. Fetch members
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
      
      // 4. Fetch expenses
      let totalExpense = 0;
      let expenditures = [];
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
      
      // 5. TOTAL INCOME = Manual Incomes + Payments
      const totalIncome = totalManualIncome + totalPaymentsAmount;
      const netBalance = totalIncome - totalExpense;
      
      setCalculatedTotals({
        totalIncome: totalIncome,
        totalManualIncome: totalManualIncome,
        totalPayments: totalPaymentsAmount,
        totalExpense: totalExpense,
        netBalance: netBalance,
        totalMembers: totalMembers,
        paidMembers: paidMembersCount,
        outstandingPayments: outstandingTotal,
        paymentCount: paymentCount
      });
      
      // 6. Generate monthly data including both payments and manual incomes
      generateMonthlyData(paidPayments, manualIncomes, expenditures);
      
      // 7. Generate payment distribution from payments
      generatePaymentDistribution(paidPayments);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
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
    
    // Add payments to months (as income)
    payments.forEach(payment => {
      if (payment.paidAt) {
        const date = new Date(payment.paidAt);
        if (date >= startDate && date <= endDate && date.getFullYear() === currentYear) {
          const monthName = months[date.getMonth()];
          const existing = monthlyMap.get(monthName);
          existing.income += payment.amount;
          monthlyMap.set(monthName, existing);
        }
      }
    });
    
    // Add manual incomes to months
    manualIncomes.forEach(income => {
      if (income.date) {
        const date = new Date(income.date);
        if (date >= startDate && date <= endDate && date.getFullYear() === currentYear) {
          const monthName = months[date.getMonth()];
          const existing = monthlyMap.get(monthName);
          existing.income += income.amount;
          monthlyMap.set(monthName, existing);
        }
      }
    });
    
    // Add expenses to months
    expenditures.forEach(expense => {
      if (expense.date) {
        const date = new Date(expense.date);
        if (date >= startDate && date <= endDate && date.getFullYear() === currentYear) {
          const monthName = months[date.getMonth()];
          const existing = monthlyMap.get(monthName);
          existing.expenditure += expense.amount;
          monthlyMap.set(monthName, existing);
        }
      }
    });
    
    const chartData = months.map(month => ({
      monthName: month,
      income: monthlyMap.get(month).income,
      expenditure: monthlyMap.get(month).expenditure
    }));
    
    setMonthlyData(chartData);
  };

  const generatePaymentDistribution = (payments) => {
    const distribution = {};
    
    payments.forEach(payment => {
      const type = payment.type || 'other';
      if (!distribution[type]) {
        distribution[type] = 0;
      }
      distribution[type] += payment.amount;
    });
    
    const pieData = Object.keys(distribution).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: distribution[key]
    }));
    
    setPaymentDistribution(pieData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
    toast.success('Reports refreshed');
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
    
    setLoading(true);
    
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
      await fetchReportData();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error('Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      let url = '';
      let filename = '';
      
      switch(type) {
        case 'payments':
          url = '/payments/all';
          filename = 'payments_report';
          break;
        case 'members':
          url = '/users?limit=1000';
          filename = 'members_report';
          break;
        case 'expenses':
          url = '/transactions/expenditure';
          filename = 'expenses_report';
          break;
        case 'incomes':
          url = '/transactions/income';
          filename = 'incomes_report';
          break;
        default:
          toast.error('Export type not available');
          return;
      }
      
      const response = await api.get(url);
      let data = [];
      
      if (response.data?.data?.records) {
        data = response.data.data.records;
      } else if (response.data?.data) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      const headers = Object.keys(data[0] || {});
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
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

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

  if (loading) {
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
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-lg font-bold text-green-600">{formatCurrency(calculatedTotals.totalIncome)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {calculatedTotals.paymentCount} payments + ₦{calculatedTotals.totalManualIncome.toLocaleString()} manual
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Expenditure</p>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-lg font-bold text-red-600">{formatCurrency(calculatedTotals.totalExpense)}</p>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="mt-1 text-xs text-blue-600 hover:text-blue-700"
          >
            + Add Expense
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Net Balance</p>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <p className={`text-lg font-bold ${calculatedTotals.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(calculatedTotals.netBalance)}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Members</p>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-600">{calculatedTotals.totalMembers}</p>
          <p className="text-xs text-gray-400 mt-1">{calculatedTotals.paidMembers} paid registration</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-1">
        {['week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedPeriod === period
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
                <Bar dataKey="income" fill="#10B981" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenditure" fill="#EF4444" name="Expenditure" radius={[4, 4, 0, 0]} />
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
              <PieChartIcon className="h-4 w-4 text-purple-600" />
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
            <Wallet className="h-4 w-4 text-green-600" />
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
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(calculatedTotals.totalMembers > 0 
                  ? Math.round(calculatedTotals.totalIncome / calculatedTotals.totalMembers) 
                  : 0)}
              </p>
            </div>
          </div>
          
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Outstanding Balance</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(calculatedTotals.outstandingPayments)}
              </p>
            </div>
          </div>
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
            className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="h-3 w-3 mr-1" />
            Manual Income
          </button>
          <button
            onClick={() => handleExport('expenses')}
            className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition-colors"
          >
            <Download className="h-3 w-3 mr-1" />
            Expenses
          </button>
          <button
            onClick={() => handleExport('members')}
            className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-medium hover:bg-purple-700 transition-colors"
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
                <TrendingDown className="h-5 w-5 text-red-600" />
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
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
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
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 resize-none"
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
                  disabled={loading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
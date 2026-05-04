import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';
import api from '../../services/api';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  Wallet,
  Calendar,
  ArrowRight,
  Filter,
  Download,
  Eye,
  Package,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Film,
  Zap,
  PieChart,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Heart,
  Briefcase,
  Gift,
  Coffee
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [orgSummary, setOrgSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [incomeList, setIncomeList] = useState([]);
  const [expenditureList, setExpenditureList] = useState([]);
  const [incomeFilter, setIncomeFilter] = useState('all');
  const [expenditureFilter, setExpenditureFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('income');
  const [trackRecordLoading, setTrackRecordLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMemberData();
    fetchTrackRecord();
  }, []);

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes, orgSummaryRes] = await Promise.all([
        api.get('/payments'),
        api.get(`/users/${user?.id}/payment-summary`),
        api.get('/reports/summary')
      ]);
      
      setPayments(paymentsRes.data.data || []);
      setSummary(summaryRes.data.data);
      setOrgSummary(orgSummaryRes.data.data);
    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackRecord = async () => {
    setTrackRecordLoading(true);
    try {
      const incomeRes = await api.get('/transactions/income');
      const expenditureRes = await api.get('/transactions/expenditure');
      
      setIncomeList(incomeRes.data.data || []);
      setExpenditureList(expenditureRes.data.data || []);
    } catch (error) {
      console.error('Error fetching track record:', error);
      toast.error('Failed to load track record data');
    } finally {
      setTrackRecordLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMemberData(), fetchTrackRecord()]);
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const categoryIcons = {
    'membership': Users,
    'donation': Heart,
    'event': Calendar,
    'investment': TrendingUp,
    'food': Utensils,
    'transport': Car,
    'utilities': Zap,
    'entertainment': Film,
    'shopping': ShoppingBag,
    'rent': Home,
    'salary': Briefcase,
    'gift': Gift,
    'other': Package
  };

  const incomeCategories = ['all', ...new Set(incomeList.map(item => item.category))];
  const expenditureCategories = ['all', ...new Set(expenditureList.map(item => item.category))];

  const filteredIncome = incomeFilter === 'all' 
    ? incomeList 
    : incomeList.filter(item => item.category === incomeFilter);
    
  const filteredExpenditure = expenditureFilter === 'all' 
    ? expenditureList 
    : expenditureList.filter(item => item.category === expenditureFilter);

  const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenditure = filteredExpenditure.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpenditure;

  const outstandingPayments = payments?.filter(p => p.status === 'unpaid') || [];
  const paidPayments = payments?.filter(p => p.status === 'paid') || [];
  const totalOutstanding = outstandingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
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
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5" />
              <h1 className="font-bold text-lg">Welcome back!</h1>
            </div>
            <p className="text-blue-100 text-xs">
              {user?.name?.split(' ')[0] || 'Member'}
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
        <p className="text-xs text-blue-100 mt-2 opacity-80">Your financial summary</p>
      </div>

      {/* Personal Stats Cards - 2x2 Grid for Mobile */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Total Paid</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalOutstanding)}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Payments Made</p>
          <p className="text-lg font-bold text-blue-600">{paidPayments.length}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-lg font-bold text-red-600">{outstandingPayments.length}</p>
        </div>
      </div>

      {/* Organization Financial Health - Compact */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Organization Financial Health
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <span className="text-xs font-medium text-green-700">Total Funds</span>
            <span className="text-base font-bold text-green-700">{formatCurrency(orgSummary?.totalBalance)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <span className="text-xs font-medium text-blue-700">Total Members</span>
            <span className="text-base font-bold text-blue-700">{orgSummary?.totalMembers || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <span className="text-xs font-medium text-purple-700">Total Income</span>
            <span className="text-base font-bold text-purple-700">{formatCurrency(orgSummary?.totalIncome)}</span>
          </div>
        </div>
      </div>

      {/* Financial Track Record Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Track Record</h2>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('income')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'income' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setActiveTab('expenditure')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'expenditure' 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Expense
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Summary Chips */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 text-center p-2 bg-green-50 rounded-xl">
              <p className="text-xs text-green-600">Total Income</p>
              <p className="text-sm font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="flex-1 text-center p-2 bg-red-50 rounded-xl">
              <p className="text-xs text-red-600">Total Expense</p>
              <p className="text-sm font-bold text-red-700">{formatCurrency(totalExpenditure)}</p>
            </div>
            <div className={`flex-1 text-center p-2 rounded-xl ${
              netBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
            }`}>
              <p className="text-xs text-gray-600">Net</p>
              <p className={`text-sm font-bold ${netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatCurrency(netBalance)}
              </p>
            </div>
          </div>

          {/* Category Filter - Horizontal Scroll */}
          <div className="mb-4 overflow-x-auto -mx-1 px-1">
            <div className="flex gap-2 pb-1">
              {activeTab === 'income' 
                ? incomeCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setIncomeFilter(category)}
                      className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                        incomeFilter === category
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  ))
                : expenditureCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setExpenditureFilter(category)}
                      className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                        expenditureFilter === category
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  ))
              }
            </div>
          </div>

          {/* Records List */}
          {trackRecordLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(activeTab === 'income' ? filteredIncome : filteredExpenditure).length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No records found</p>
                </div>
              )}
              
              {activeTab === 'income' && filteredIncome.slice(0, 5).map(income => {
                const IconComponent = categoryIcons[income.category] || Package;
                return (
                  <div key={income._id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <IconComponent className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-xs capitalize">
                          {income.description || income.category}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(income.date)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600 text-sm">+{formatCurrency(income.amount)}</p>
                  </div>
                );
              })}

              {activeTab === 'expenditure' && filteredExpenditure.slice(0, 5).map(expense => {
                const IconComponent = categoryIcons[expense.category] || Package;
                return (
                  <div key={expense._id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <IconComponent className="h-3.5 w-3.5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-xs capitalize">
                          {expense.description || expense.category}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600 text-sm">-{formatCurrency(expense.amount)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Outstanding Payments Section */}
      {outstandingPayments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-white">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Outstanding Payments ({outstandingPayments.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {outstandingPayments.slice(0, 3).map(payment => (
              <div key={payment._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm capitalize">{payment.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Due: {formatDate(payment.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600 text-sm">{formatCurrency(payment.amount)}</p>
                  <Link to="/payments" className="text-xs text-blue-600 font-medium">
                    Pay Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Payment History */}
      {paidPayments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Recent Payments
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {paidPayments.slice(0, 3).map(payment => (
              <div key={payment._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm capitalize">{payment.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(payment.paidAt)}
                  </p>
                </div>
                <p className="font-bold text-green-600 text-sm">{formatCurrency(payment.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {outstandingPayments.length === 0 && paidPayments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No Payment Records</h3>
          <p className="text-xs text-gray-500">You don't have any payment records yet.</p>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
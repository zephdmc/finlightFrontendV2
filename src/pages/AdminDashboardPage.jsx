import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import StatsCard from '../components/dashboard/StatsCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import api from '../services/api';
import { Users, DollarSign, TrendingUp, TrendingDown, AlertCircle, Wallet, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/reports/summary');
      setSummary(data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
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

          {/* Date/Time */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
            <Calendar className="h-3 w-3 text-blue-200" />
            <p className="text-xs text-blue-200">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-400">Members</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{summary?.totalMembers || 0}</p>
            <p className="text-xs text-green-600 mt-1">Total registered</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-400">Income</span>
            </div>
            <p className="text-lg font-bold text-green-600">{formatCurrency(summary?.totalIncome)}</p>
            <p className="text-xs text-gray-500 mt-1">Total revenue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-xs text-gray-400">Expenses</span>
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(summary?.totalExpenditure)}</p>
            <p className="text-xs text-gray-500 mt-1">Total spent</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-400">Outstanding</span>
            </div>
            <p className="text-lg font-bold text-yellow-600">{formatCurrency(summary?.outstandingPayments)}</p>
            <p className="text-xs text-gray-500 mt-1">Pending payments</p>
          </div>
        </div>

        {/* Balance Overview Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Net Balance</span>
            </div>
            <span className="text-xs text-green-100">Current</span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(summary?.totalBalance)}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-400/30">
            <div>
              <p className="text-xs text-green-100">Paid Members</p>
              <p className="text-lg font-semibold">{summary?.paidMembers || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-100">Registration Fee</p>
              <p className="text-lg font-semibold">₦500</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => window.location.href = '/members/add'}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span className="text-sm text-blue-700">Add Member</span>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </button>
            <button 
              onClick={() => window.location.href = '/payments'}
              className="flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <span className="text-sm text-green-700">New Payment</span>
              <ArrowRight className="h-4 w-4 text-green-600" />
            </button>
            <button 
              onClick={() => window.location.href = '/reports'}
              className="flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <span className="text-sm text-purple-700">View Reports</span>
              <ArrowRight className="h-4 w-4 text-purple-600" />
            </button>
            <button 
              onClick={() => window.location.href = '/account'}
              className="flex items-center justify-between p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <span className="text-sm text-orange-700">Manage Account</span>
              <ArrowRight className="h-4 w-4 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Transactions</h3>
            <button 
              onClick={() => window.location.href = '/account'}
              className="text-xs text-blue-600 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <RecentTransactions isMobile={isMobile} />
        </div>

        {/* Member Registration Status */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Registration Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Paid Registration</span>
                <span className="font-medium text-green-600">
                  {summary?.paidMembers || 0} / {summary?.totalMembers || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${summary?.totalMembers > 0 ? ((summary.paidMembers / summary.totalMembers) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-xs pt-2">
              <span className="text-gray-500">Registration Fee</span>
              <span className="font-medium">₦500 per member</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3">
            <p className="text-xs text-gray-600 mb-1">Collection Rate</p>
            <p className="text-xl font-bold text-blue-600">
              {summary?.totalMembers > 0 
                ? Math.round((summary.paidMembers / summary.totalMembers) * 100) 
                : 0}%
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-3">
            <p className="text-xs text-gray-600 mb-1">Avg Payment/Member</p>
            <p className="text-sm font-bold text-green-600">
              {summary?.totalMembers > 0 
                ? formatCurrency(Math.round(summary.totalIncome / summary.totalMembers))
                : formatCurrency(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
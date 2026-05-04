import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import PaymentTypeReport from '../components/reports/PaymentTypeReport';
import { BarChart3, Download, Calendar, FileText, TrendingUp, TrendingDown, Users, ChevronRight, Filter, X, RefreshCw, PieChart, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * Reports Page Component - Banking App Style
 * Main container for all reporting features
 */
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'payment-filter', label: 'Payment Filter', icon: Filter },
    { id: 'financial', label: 'Export', icon: Download }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Reports refreshed');
    }, 1000);
  };

  const applyDateFilter = () => {
    setShowDatePicker(false);
    toast.success('Date filter applied');
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setShowDatePicker(false);
    toast.success('Date filter cleared');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      let url = '';
      switch(type) {
        case 'income':
          url = `/reports/export/income?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        case 'expenditure':
          url = `/reports/export/expenditure?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        case 'members':
          url = `/reports/export/members`;
          break;
        case 'payments':
          url = `/payments/all`;
          break;
        default:
          return;
      }
      
      let response;
      if (type === 'payments') {
        response = await api.get(url);
        // Convert to CSV
        const data = response.data?.data?.records || response.data?.data || [];
        const headers = Object.keys(data[0] || {});
        const csvRows = [
          headers.join(','),
          ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      } else {
        const response = await api.get(url, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'text/csv' });
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.message || 'Failed to export report');
    } finally {
      setExporting(null);
    }
  };

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
                <h1 className="font-semibold text-lg">Reports & Analytics</h1>
              </div>
              <p className="text-blue-100 text-xs mt-1">
                Comprehensive financial analytics
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

          {/* Date Range Selector - Mobile Optimized */}
          <div className="mt-3">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center justify-between bg-white/10 rounded-xl px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                </span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${showDatePicker ? 'rotate-90' : ''}`} />
            </button>
            
            {showDatePicker && (
              <div className="mt-2 bg-white/10 rounded-xl p-3 space-y-3">
                <div>
                  <label className="text-xs text-blue-200 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-blue-200 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearDateFilter}
                    className="flex-1 py-2 bg-white/20 rounded-lg text-xs font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyDateFilter}
                    className="flex-1 py-2 bg-white text-blue-600 rounded-lg text-xs font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - Mobile Friendly */}
        <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className={isMobile ? 'text-xs' : 'text-sm'}>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Content */}
        {activeTab === 'dashboard' && <ReportsDashboard dateRange={dateRange} isMobile={isMobile} />}
        
        {activeTab === 'payment-filter' && (
          <PaymentTypeReport dateRange={dateRange} isMobile={isMobile} />
        )}
        
        {activeTab === 'financial' && (
          <div className="space-y-4">
            {/* Export Options Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  Export Financial Data
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => handleExport('payments')}
                  disabled={exporting === 'payments'}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {exporting === 'payments' ? (
                        <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Payments Report</p>
                      <p className="text-xs text-gray-500">CSV Format</p>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-blue-600" />
                </button>

                <button
                  onClick={() => handleExport('income')}
                  disabled={exporting === 'income'}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      {exporting === 'income' ? (
                        <Loader className="h-5 w-5 text-green-600 animate-spin" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Income Report</p>
                      <p className="text-xs text-gray-500">CSV Format</p>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-green-600" />
                </button>

                <button
                  onClick={() => handleExport('expenditure')}
                  disabled={exporting === 'expenditure'}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl hover:from-red-100 hover:to-rose-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      {exporting === 'expenditure' ? (
                        <Loader className="h-5 w-5 text-red-600 animate-spin" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Expenditure Report</p>
                      <p className="text-xs text-gray-500">CSV Format</p>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-red-600" />
                </button>

                <button
                  onClick={() => handleExport('members')}
                  disabled={exporting === 'members'}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      {exporting === 'members' ? (
                        <Loader className="h-5 w-5 text-purple-600 animate-spin" />
                      ) : (
                        <Users className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Member Report</p>
                      <p className="text-xs text-gray-500">CSV Format</p>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-purple-600" />
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Report Information</h3>
                  <p className="text-xs text-gray-600">
                    All reports are generated based on the selected date range. 
                    Data includes all transactions within the specified period.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Current range: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Import missing CreditCard icon
import { CreditCard } from 'lucide-react';

export default ReportsPage;
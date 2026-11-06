import { useState, useEffect } from 'react';
// import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import PaymentTypeReport from '../components/reports/PaymentTypeReport';
import { BarChart3, Download, Calendar, FileText, TrendingUp, TrendingDown, Users, ChevronRight, Filter, X, RefreshCw, PieChart, Loader, ArrowLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { usePayments, useTransactions, useUsers } from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';


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
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // ========== REACT QUERY HOOKS (for data freshness) ==========
  const { refetch: refetchPayments } = usePayments({});
  const { refetch: refetchIncomes } = useTransactions('income');
  const { refetch: refetchExpenditures } = useTransactions('expenditure');
  const { refetch: refetchUsers } = useUsers();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', },
    { id: 'payment-filter', label: 'Contribution List', },
    { id: 'financial', label: 'Export', }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPayments(),
        refetchIncomes(),
        refetchExpenditures(),
        refetchUsers()
      ]);
      toast.success('Reports refreshed');
    } catch (error) {
      toast.error('Failed to refresh reports');
    } finally {
      setRefreshing(false);
    }
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
      let fileName = '';

      switch (type) {
        case 'payments':
          url = `/payments/all`;
          fileName = `payments_report_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'income':
          url = `/reports/export/income?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          fileName = `income_report_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'expenditure':
          url = `/reports/export/expenditure?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          fileName = `expenditure_report_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'members':
          url = `/reports/export/members`;
          fileName = `members_report_${new Date().toISOString().split('T')[0]}`;
          break;
        default:
          return;
      }

      const response = await api.get(url);

      // Extract data from response
      let data = [];
      if (type === 'payments') {
        // Handle payments data structure
        if (response.data?.data?.records && Array.isArray(response.data.data.records)) {
          data = response.data.data.records;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else {
          data = [];
        }
      } else {
        // Handle other export types
        if (response.data?.data?.records && Array.isArray(response.data.data.records)) {
          data = response.data.data.records;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else {
          data = [];
        }
      }

      if (!data || data.length === 0) {
        toast.error('No data available for export');
        setExporting(null);
        return;
      }

      // Format data for CSV based on export type
      let formattedData = [];

      if (type === 'payments') {
        formattedData = data.map(payment => {
          // Extract user info
          const userName = payment.user?.name || payment.user || 'N/A';
          const userEmail = payment.user?.email || 'N/A';

          // Extract payment type info
          const paymentTypeName = payment.paymentTypeId?.name || payment.paymentTypeId || 'N/A';
          const paymentTypeAmount = payment.paymentTypeId?.amount || payment.amount || 0;

          // Get payment status
          const status = payment.status || 'unknown';
          const isPartial = payment.isPartial ? 'Yes' : 'No';

          // Calculate amounts
          const totalAmount = payment.amount || payment.originalAmount || paymentTypeAmount || 0;
          const remainingAmount = payment.remainingAmount || 0;
          const paidAmount = payment.totalPaidSoFar || payment.paidAmount || 0;

          // Get net amount from partial payments
          let netAmount = payment.netToOrganization || 0;
          if (netAmount === 0 && payment.partialPayments && Array.isArray(payment.partialPayments)) {
            netAmount = payment.partialPayments.reduce((sum, pp) => sum + (pp.netToOrg || 0), 0);
          }

          // Get payment date
          const paymentDate = payment.createdAt || payment.paidAt || payment.dueDate || new Date();
          const formattedDate = new Date(paymentDate).toLocaleDateString('en-US');

          return {
            'Payment ID': payment._id || 'N/A',
            'Member Name': userName,
            'Member Email': userEmail,
            'Payment Type': paymentTypeName,
            'Type': payment.type || 'N/A',
            'Status': status,
            'Is Partial': isPartial,
            'Total Amount': totalAmount,
            'Amount Paid': paidAmount,
            'Remaining Amount': remainingAmount,
            'Net Amount (Org)': netAmount || 0,
            'Payment Date': formattedDate,
            'Due Date': payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('en-US') : 'N/A',
            'Description': payment.description || 'N/A'
          };
        });
      } else {
        // Generic formatting for other exports
        formattedData = data.map(item => {
          const flatItem = {};
          Object.keys(item).forEach(key => {
            if (item[key] && typeof item[key] === 'object' && !Array.isArray(item[key])) {
              // Flatten nested objects
              Object.keys(item[key]).forEach(subKey => {
                flatItem[`${key}_${subKey}`] = item[key][subKey] || '';
              });
            } else if (Array.isArray(item[key])) {
              flatItem[key] = JSON.stringify(item[key]);
            } else {
              flatItem[key] = item[key] || '';
            }
          });
          return flatItem;
        });
      }

      // Create CSV
      const headers = Object.keys(formattedData[0] || {});
      const csvRows = [
        headers.join(','),
        ...formattedData.map(row =>
          headers.map(header => {
            const value = row[header] !== undefined && row[header] !== null ? row[header] : '';
            // Escape commas and quotes
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.message || 'Failed to export report');
    } finally {
      setExporting(null);
    }
  };

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

      <div className="max-w-7xl mx-auto  space-y-4">

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
                    <BarChart3 className="h-5 w-5" />
                    <h1 className="font-semibold text-lg">Reports & Analytics</h1>
                  </div>
                  <p className="text-blue-100 text-xs mt-1">
                    Comprehensive financial analytics
                  </p>
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
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {/* <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} /> */}
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
                  <Download className="h-4 w-4 text-blue-600" />
                  Export Financial Data
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => handleExport('payments')}
                  disabled={exporting === 'payments'}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl hover:from-blue-100 hover:to-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* <button
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
                </button> */}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
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

export default ReportsPage;
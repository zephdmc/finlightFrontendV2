import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentHistory from '../components/payment/PaymentHistory';
import PaymentTypeManager from '../components/payment/PaymentTypeManager';
import api from '../services/api';
import { CreditCard, History, Plus, Tag, RefreshCw, DollarSign, Users, TrendingUp, AlertCircle, Wallet, CheckCircle, XCircle, Clock, ArrowLeft, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  usePaymentTypes,
  usePayments,
  useAdminPayments,
  useCreatePaymentType,
  useUpdatePaymentType,
  useDeletePaymentType,
  // ============================================================
  // NEW: Import pending payments hook
  // ============================================================
  usePendingPayments
} from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate, Link } from 'react-router-dom';
// ============================================================
// NEW: Import period utilities
// ============================================================
import { formatPeriodKey, getCurrentPeriodKey } from '../utils/periodUtils';

/**
 * Payments Page Component - Banking App Style
 * Mobile-optimized payment management page with React Query caching
 */
const PaymentsPage = () => {
  const { user, isAdmin } = useAuth();

  // ========== LOCAL STATE (only for UI, not data) ==========
  const [activeTab, setActiveTab] = useState('history');
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [outstandingFromTypes, setOutstandingFromTypes] = useState([]);
  // ============================================================
  // NEW: Period filter state for history
  // ============================================================
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);

  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    paidPayments: 0,
    totalOutstanding: 0,
    partialCount: 0,
    totalPartial: 0
  });
  const navigate = useNavigate();

  // ========== REACT QUERY HOOKS (ENABLED - CACHES DATA) ==========
  const {
    data: paymentTypes = [],
    isLoading: typesLoading,
    refetch: refetchPaymentTypes,
    error: typesError
  } = usePaymentTypes();

  // Use different hook based on user role
  // Admin: fetch ALL payments from /payments/all
  // Member: fetch only user's payments from /payments
  const paymentsResult = isAdmin
    ? useAdminPayments({})
    : usePayments({});

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments,
    error: paymentsError
  } = paymentsResult;

  // ============================================================
  // NEW: Fetch pending payments
  // ============================================================
  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending
  } = usePendingPayments();

  // Mutations for payment types
  const createPaymentTypeMutation = useCreatePaymentType();
  const updatePaymentTypeMutation = useUpdatePaymentType();
  const deletePaymentTypeMutation = useDeletePaymentType();

  // Add debug log

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update stats whenever payments or paymentTypes change
  useEffect(() => {
    if (payments && paymentTypes) {
      updateStats(payments, paymentTypes);
    }
  }, [payments, paymentTypes, isAdmin]);

  // ============================================================
  // NEW: Extract available periods from payments
  // ============================================================
  useEffect(() => {
    if (payments.length > 0) {
      const periods = payments
        .filter(p => p.periodKey)
        .map(p => p.periodKey)
        .filter((value, index, self) => self.indexOf(value) === index);

      // Sort periods (newest first)
      periods.sort((a, b) => b.localeCompare(a));

      setAvailablePeriods(periods);
    }
  }, [payments]);

  // ============================================================
  // NEW: Filter payments by selected period
  // ============================================================
  const getFilteredPayments = () => {
    if (selectedPeriod === 'all' || !selectedPeriod) {
      return payments;
    }
    return payments.filter(p => p.periodKey === selectedPeriod);
  };

  const filteredPayments = getFilteredPayments();

  // ========== STATS CALCULATION (UPDATED FOR PARTIAL PAYMENTS) ==========
  const updateStats = (paymentsData, paymentTypesData) => {
    let paid = [];
    let unpaid = [];
    let partialPayments = [];

    if (isAdmin) {
      // Admin: All payments
      paid = paymentsData.filter(p => {
        const amount = p?.amount || 0;
        const isPartial = p?.isPartial === true;
        const isPaid = p?.status === 'paid';
        return amount > 0 && (isPaid || (!isPartial && p?.status !== 'unpaid' && p?.status !== 'pending'));
      });

      // âœ… Track partial payments separately
      partialPayments = paymentsData.filter(p => {
        return p?.isPartial === true && p?.remainingAmount > 0;
      });

      unpaid = paymentsData.filter(p => {
        const amount = p?.amount || 0;
        const isPartial = p?.isPartial === true;
        return (p?.status === 'unpaid' || p?.status === 'pending' || isPartial) && amount > 0 && p?.remainingAmount > 0;
      });
    } else {
      // Member: filter by status
      paid = paymentsData.filter(p => p.status === 'paid');
      partialPayments = paymentsData.filter(p => p.isPartial === true && p.remainingAmount > 0);
      unpaid = paymentsData.filter(p => p.status === 'unpaid' || p.status === 'pending');
    }

    // Generate outstanding from payment types (for members only)
    let totalOutstandingFromTypes = 0;
    let outstandingList = [];

    if (!isAdmin && paymentTypesData.length > 0) {
      const paidPaymentTypeIds = new Set();
      const paidNames = new Set();

      paid.forEach(p => {
        if (p.paymentTypeId) {
          let typeId = null;
          if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
            typeId = p.paymentTypeId._id.toString();
          } else if (typeof p.paymentTypeId === 'string') {
            typeId = p.paymentTypeId;
          } else if (typeof p.paymentTypeId === 'object' && p.paymentTypeId.toString) {
            typeId = p.paymentTypeId.toString();
          }

          if (typeId) {
            paidPaymentTypeIds.add(typeId);
          }
        }

        if (p.name) {
          paidNames.add(p.name);
        }
        if (p.type) {
          paidNames.add(p.type);
        }
      });

      outstandingList = paymentTypesData.filter(type => {
        const typeIdStr = type._id.toString();

        if (paidPaymentTypeIds.has(typeIdStr)) {
          return false;
        }

        if (paidNames.has(type.name)) {
          return false;
        }

        return true;
      });

      totalOutstandingFromTypes = outstandingList.reduce((sum, type) => sum + (type.amount || 0), 0);
      setOutstandingFromTypes(outstandingList);
    }

    // âœ… Calculate outstanding amounts correctly (including partial payments)
    const totalUnpaidFromPayments = unpaid.reduce((sum, p) => sum + (p.remainingAmount || p.amount || 0), 0);
    const totalPartialAmount = partialPayments.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
    const totalOutstanding = totalUnpaidFromPayments + totalOutstandingFromTypes + totalPartialAmount;
    const totalRevenue = paid.reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({
      totalPayments: paymentsData.length,
      totalRevenue: totalRevenue,
      pendingPayments: unpaid.length + (isAdmin ? 0 : outstandingList.length) + partialPayments.length,
      paidPayments: paid.length,
      totalOutstanding: isAdmin ? totalOutstanding : totalOutstanding,
      partialCount: partialPayments.length,
      totalPartial: totalPartialAmount
    });
  };

  // ========== EVENT HANDLERS (Using React Query) ==========
  const handlePaymentSuccess = () => {
    // Invalidate and refetch payments cache
    refetchPayments();
    refetchPending(); // â† NEW
  };

  const handlePaymentTypeSuccess = () => {
    // Invalidate and refetch both caches
    refetchPaymentTypes();
    refetchPayments();
    refetchPending(); // â† NEW
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Force refetch from server (bypass cache)
      await Promise.all([
        refetchPayments(),
        refetchPending(), // â† NEW
        isAdmin ? refetchPaymentTypes() : Promise.resolve()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // ========== PAYMENT TYPE HANDLERS (Using React Query Mutations) ==========
  const handleCreatePaymentType = async (paymentTypeData) => {
    try {
      const result = await createPaymentTypeMutation.mutateAsync(paymentTypeData);
      const newPaymentType = result.data || result;
      // Invalidate cache to refetch latest data
      await refetchPaymentTypes();
      toast.success('Payment type created successfully');
      return newPaymentType;
    } catch (error) {
      console.error('Error creating payment type:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment type');
      throw error;
    }
  };

  const handleUpdatePaymentType = async (id, paymentTypeData) => {
    try {
      const result = await updatePaymentTypeMutation.mutateAsync({ id, data: paymentTypeData });
      const updatedPaymentType = result.data || result;
      await refetchPaymentTypes();
      toast.success('Payment type updated successfully');
      return updatedPaymentType;
    } catch (error) {
      console.error('Error updating payment type:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment type');
      throw error;
    }
  };

  const handleDeletePaymentType = async (id) => {
    try {
      await deletePaymentTypeMutation.mutateAsync(id);
      await refetchPaymentTypes();
      toast.success('Payment type deleted successfully');
    } catch (error) {
      console.error('Error deleting payment type:', error);
      toast.error(error.response?.data?.message || 'Failed to delete payment type');
      throw error;
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

  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const titleSize = isMobile ? 'text-lg' : 'text-3xl';
  const headingSize = isMobile ? 'text-sm' : 'text-lg';

  // Loading state
  const isLoading = (paymentsLoading || typesLoading || pendingLoading) && payments.length === 0 && paymentTypes.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (paymentsError || typesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Failed to load data</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
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

  // ============================================================
  // NEW: Get pending payments count
  // ============================================================
  const pendingCount = pendingData?.data?.records?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <button
          onClick={handleBackToHome}
          className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`font-bold ${titleSize} mb-1`}>Payments</h1>
            <p className={`text-blue-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {isAdmin
                ? 'Manage member payments and history'
                : 'Make payments and view history'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ============================================================
        NEW: Pending Payments Badge
        ============================================================ */}
        {!isAdmin && pendingCount > 0 && (
          <div className="bg-gray-500/20 backdrop-blur-sm rounded-xl p-3 mb-3 border border-gray-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-200" />
                <span className="text-gray-100 text-sm font-medium">
                  {pendingCount} payment{pendingCount !== 1 ? 's' : ''} pending
                </span>
              </div>
              <button
                onClick={() => setActiveTab('make')}
                className="px-3 py-1 bg-gray-500/30 text-gray-100 text-xs rounded-lg hover:bg-gray-500/40 transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards for Members - Show Outstanding Amount */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Total Paid</p>
                <CheckCircle className="h-3 w-3 text-cyan-300" />
              </div>
              <p className="font-bold text-base">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Outstanding</p>
                <AlertCircle className="h-3 w-3 text-gray-300" />
              </div>
              <p className="font-bold text-base">{formatCurrency(stats.totalOutstanding)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Payments Made</p>
                <CreditCard className="h-3 w-3 text-blue-200" />
              </div>
              <p className="font-bold text-base">{stats.paidPayments}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Pending</p>
                <Clock className="h-3 w-3 text-gray-300" />
              </div>
              <p className="font-bold text-base">{stats.pendingPayments}</p>
            </div>
          </div>
        )}
        {/* âœ… Add Partial Payments Stats Card */}
        {stats.partialCount > 0 && (
          <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-200" />
                <p className="text-orange-100 text-xs font-medium">Partial Payments</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-base text-orange-100">{stats.partialCount}</p>
                <p className="text-xs text-orange-200">Remaining: {formatCurrency(stats.totalPartial)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards for Admin */}
        {isAdmin && payments.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Total Revenue</p>
                <DollarSign className="h-3 w-3 text-blue-200" />
              </div>
              <p className="font-bold text-base">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Total Payments</p>
                <CreditCard className="h-3 w-3 text-blue-200" />
              </div>
              <p className="font-bold text-base">{stats.totalPayments}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Paid</p>
                <CheckCircle className="h-3 w-3 text-cyan-300" />
              </div>
              <p className="font-bold text-base">{stats.paidPayments}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Pending</p>
                <Clock className="h-3 w-3 text-gray-300" />
              </div>
              <p className="font-bold text-base">{stats.pendingPayments}</p>
            </div>
          </div>
        )}

        {/* Stats for Members - Alternative view when no payments */}
        {!isAdmin && payments.length === 0 && stats.totalOutstanding > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-blue-100 text-xs mb-1">Total Paid</p>
              <p className="font-bold text-base">{formatCurrency(0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-blue-100 text-xs mb-1">Outstanding</p>
              <p className="font-bold text-base text-gray-200">{formatCurrency(stats.totalOutstanding)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs - Mobile Friendly */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab('make')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'make'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <CreditCard className="h-4 w-4" />
            {isAdmin ? 'Fine' : 'Pay'}
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('types')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'types'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Tag className="h-4 w-4" />
              Create
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
      NEW: Period Filter for History Tab
      ============================================================ */}
      {activeTab === 'history' && availablePeriods.length > 0 && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl shadow-sm p-2 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setShowPeriodFilter(!showPeriodFilter)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <Filter className="h-3 w-3" />
              Period
            </button>
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${selectedPeriod === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                All
              </button>
              {availablePeriods.map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Calendar className="h-3 w-3" />
                  {formatPeriodKey(period)}
                </button>
              ))}
            </div>
            {selectedPeriod !== 'all' && (
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                {filteredPayments.length} payments
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 mt-4 space-y-4">
        {activeTab === 'make' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className={`font-semibold text-gray-800 ${headingSize} flex items-center gap-2`}>
                <CreditCard className="h-4 w-4 text-blue-600" />
                {isAdmin ? 'Create New Payment' : 'Make a Payment'}
              </h3>
            </div>
            <div className="p-4">
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                payments={payments}
                isAdmin={isAdmin}
                paymentTypes={paymentTypes}
                userEmail={user?.email}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className={`font-semibold text-gray-800 ${headingSize} flex items-center gap-2`}>
                <History className="h-4 w-4 text-blue-600" />
                Payment History
              </h3>
              {/* ============================================================
              NEW: Show period filter indicator
              ============================================================ */}
              {selectedPeriod !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {formatPeriodKey(selectedPeriod)}
                </span>
              )}
            </div>
            <div className="p-4">
              <PaymentHistory
                payments={filteredPayments}  // â† Pass filtered payments
                loading={paymentsLoading}
                onRefresh={refetchPayments}
                isMobile={isMobile}
                formatCurrency={formatCurrency}
                paymentTypes={paymentTypes}
                isAdmin={isAdmin}
                // ============================================================
                // NEW: Pass selected period
                // ============================================================
                selectedPeriod={selectedPeriod}
              />
            </div>
          </div>
        )}

        {activeTab === 'types' && isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className={`font-semibold text-gray-800 ${headingSize} flex items-center gap-2`}>
                <Tag className="h-4 w-4 text-blue-600" />
                Payment Types
              </h3>
            </div>
            <div className="p-4">
              <PaymentTypeManager
                paymentTypes={paymentTypes}
                onCreate={handleCreatePaymentType}
                onUpdate={handleUpdatePaymentType}
                onDelete={handleDeletePaymentType}
                onSuccess={handlePaymentTypeSuccess}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Box for Payment Types */}
      {isAdmin && activeTab === 'types' && paymentTypes.length === 0 && (
        <div className="mx-4 mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Tag className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">No Payment Types Yet</h3>
              <p className="text-xs text-blue-700 mt-1">
                Create your first payment type to start managing payments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Section for Admin */}
      {isAdmin && activeTab === 'make' && paymentTypes.length === 0 && (
        <div className="mx-4 mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-800">Setup Required</h3>
              <p className="text-xs text-gray-700 mt-1">
                Please go to the
                <button
                  onClick={() => setActiveTab('types')}
                  className="text-blue-600 font-medium mx-1"
                >
                  Payment Types
                </button>
                tab to create payment types first.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
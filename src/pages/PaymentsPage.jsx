import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentHistory from '../components/payment/PaymentHistory';
import PaymentTypeManager from '../components/payment/PaymentTypeManager';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CreditCard, History, Plus, Tag, RefreshCw, DollarSign, Users, TrendingUp, AlertCircle, Wallet, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Payments Page Component - Banking App Style
 * Mobile-optimized payment management page
 */
const PaymentsPage = () => {
  const { user, isAdmin, hasPaidRegistration } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [outstandingFromTypes, setOutstandingFromTypes] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    paidPayments: 0,
    totalOutstanding: 0
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPayments(),
        fetchPaymentTypes()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (paymentsData, paymentTypesData) => {
    if (!paymentsData) paymentsData = payments;
    if (!paymentTypesData) paymentTypesData = paymentTypes;
    
    const paid = paymentsData.filter(p => p.status === 'paid');
    const unpaid = paymentsData.filter(p => p.status === 'unpaid');
    
    // Generate outstanding from payment types (for members)
    let totalOutstandingFromTypes = 0;
    let outstandingList = [];
    
    if (!isAdmin && paymentTypesData.length > 0) {
      // Track paid payment types by ID and by name
      const paidPaymentTypeIds = new Set();
      const paidNames = new Set();
      
      paid.forEach(p => {
        // Track by paymentTypeId (handle both object and string)
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
        
        // Track by name (important for payments without paymentTypeId)
        if (p.name) {
          paidNames.add(p.name);
        }
        if (p.type) {
          paidNames.add(p.type);
        }
      });
      
      // Generate outstanding payment types (not yet paid)
      outstandingList = paymentTypesData.filter(type => {
        const typeIdStr = type._id.toString();
        
        // Check by ID
        if (paidPaymentTypeIds.has(typeIdStr)) {
          return false;
        }
        
        // Check by name
        if (paidNames.has(type.name)) {
          return false;
        }
        
        return true;
      });
      
      totalOutstandingFromTypes = outstandingList.reduce((sum, type) => sum + (type.amount || 0), 0);
      setOutstandingFromTypes(outstandingList);
    }
    
    // Total outstanding = unpaid payments + outstanding from payment types
    const totalOutstanding = unpaid.reduce((sum, p) => sum + (p.amount || 0), 0) + totalOutstandingFromTypes;
    
    setStats({
      totalPayments: paymentsData.length,
      totalRevenue: paid.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingPayments: unpaid.length + outstandingList.length,
      paidPayments: paid.length,
      totalOutstanding: totalOutstanding
    });
  };

  const fetchPayments = async () => {
    try {
      const endpoint = isAdmin ? '/payments/all' : '/payments';
      const { data } = await api.get(endpoint);
      
      let paymentsData = [];
      if (data.data?.records) {
        paymentsData = data.data.records;
      } else if (data.data && Array.isArray(data.data)) {
        paymentsData = data.data;
      } else if (Array.isArray(data)) {
        paymentsData = data;
      } else {
        paymentsData = [];
      }
      
      setPayments(paymentsData);
      updateStats(paymentsData, paymentTypes);
      return paymentsData;
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
      return [];
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const { data } = await api.get('/payment-types');
      let typesData = [];
      if (data.data?.records) {
        typesData = data.data.records;
      } else if (data.data && Array.isArray(data.data)) {
        typesData = data.data;
      } else if (Array.isArray(data)) {
        typesData = data;
      } else if (data.records && Array.isArray(data.records)) {
        typesData = data.records;
      } else {
        typesData = [];
      }
      
      setPaymentTypes(typesData);
      updateStats(payments, typesData);
      return typesData;
    } catch (error) {
      console.error('Error fetching payment types:', error);
      toast.error('Failed to load payment types');
      return [];
    }
  };

  const handlePaymentSuccess = () => {
    fetchPayments();
  };

  const handlePaymentTypeSuccess = () => {
    fetchPaymentTypes();
    fetchPayments();
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/payments/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Payments exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export payments');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPayments(),
        isAdmin ? fetchPaymentTypes() : null
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreatePaymentType = async (paymentTypeData) => {
    try {
      const { data } = await api.post('/payment-types', paymentTypeData);
      const newPaymentType = data.data || data;
      setPaymentTypes(prev => [...prev, newPaymentType]);
      updateStats(payments, [...paymentTypes, newPaymentType]);
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
      const { data } = await api.put(`/payment-types/${id}`, paymentTypeData);
      const updatedPaymentType = data.data || data;
      const updatedTypes = paymentTypes.map(type => 
        (type._id === id || type.id === id) ? updatedPaymentType : type
      );
      setPaymentTypes(updatedTypes);
      updateStats(payments, updatedTypes);
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
      await api.delete(`/payment-types/${id}`);
      const updatedTypes = paymentTypes.filter(type => (type._id !== id && type.id !== id));
      setPaymentTypes(updatedTypes);
      updateStats(payments, updatedTypes);
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

  // Check if registration payment is pending (including from payment types)
  const hasRegistrationPending = !isAdmin && !hasPaidRegistration && (
    payments.some(p => p.type === 'registration' && p.status === 'unpaid') ||
    paymentTypes.some(t => t.type === 'registration' && t.name?.toLowerCase().includes('registration'))
  );

  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const titleSize = isMobile ? 'text-lg' : 'text-3xl';
  const headingSize = isMobile ? 'text-sm' : 'text-lg';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
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

        {/* Stats Cards for Members - Show Outstanding Amount */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Total Paid</p>
                <CheckCircle className="h-3 w-3 text-green-300" />
              </div>
              <p className="font-bold text-base">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Outstanding</p>
                <AlertCircle className="h-3 w-3 text-yellow-300" />
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
                <Clock className="h-3 w-3 text-yellow-300" />
              </div>
              <p className="font-bold text-base">{stats.pendingPayments}</p>
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
                <CheckCircle className="h-3 w-3 text-green-300" />
              </div>
              <p className="font-bold text-base">{stats.paidPayments}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-100 text-xs">Pending</p>
                <Clock className="h-3 w-3 text-yellow-300" />
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
              <p className="font-bold text-base text-yellow-200">{formatCurrency(stats.totalOutstanding)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs - Mobile Friendly */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab('make')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'make'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            {isAdmin ? 'Create' : 'Pay'}
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('types')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'types'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Tag className="h-4 w-4" />
              Types
            </button>
          )}
        </div>
      </div>

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
            </div>
            <div className="p-4">
              <PaymentHistory 
                payments={payments} 
                loading={loading}
                onRefresh={fetchPayments}
                isMobile={isMobile}
                formatCurrency={formatCurrency}
                paymentTypes={paymentTypes}
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
      
      {/* Registration Payment Notice for New Members */}
      {!isAdmin && hasRegistrationPending && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-4 shadow-lg z-40">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Registration Fee Required</p>
              <p className="text-xs text-yellow-100">Pay to access dashboard features</p>
            </div>
            <button
              onClick={() => setActiveTab('make')}
              className="px-4 py-2 bg-white text-yellow-600 rounded-xl text-sm font-medium"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

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
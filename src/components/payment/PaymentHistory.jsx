import { useState } from 'react';
import { Eye, ChevronRight, CheckCircle, XCircle, Clock, Calendar, DollarSign, AlertCircle, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentHistory = ({ payments = [], loading, onRefresh, isMobile, formatCurrency, paymentTypes = [] }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate stats including outstanding from payment types
  const calculateStats = () => {
    const paid = payments.filter(p => p.status === 'paid');
    const unpaid = payments.filter(p => p.status === 'unpaid');
    
    // Calculate outstanding from payment types (payment types not yet paid)
    let outstandingFromTypes = [];
    let totalOutstandingFromTypes = 0;
    
    if (paymentTypes && paymentTypes.length > 0) {
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
            console.log(`Paid paymentTypeId: ${typeId} for payment: ${p.name || p.type}`);
          }
        }
        
        // Track by name (important for payments without paymentTypeId)
        if (p.name) {
          paidNames.add(p.name);
          console.log(`Paid name: ${p.name}`);
        }
        if (p.type) {
          paidNames.add(p.type);
        }
      });
      
      console.log('Paid IDs:', Array.from(paidPaymentTypeIds));
      console.log('Paid Names:', Array.from(paidNames));
      
      // Generate outstanding payment types (not yet paid)
      outstandingFromTypes = paymentTypes.filter(type => {
        const typeIdStr = type._id.toString();
        
        // Check by ID
        if (paidPaymentTypeIds.has(typeIdStr)) {
          console.log(`Skipping paid type by ID: ${type.name}`);
          return false;
        }
        
        // Check by name
        if (paidNames.has(type.name)) {
          console.log(`Skipping paid type by name: ${type.name}`);
          return false;
        }
        
        console.log(`Outstanding type: ${type.name}`);
        return true;
      });
      
      totalOutstandingFromTypes = outstandingFromTypes.reduce((sum, type) => sum + (type.amount || 0), 0);
    }
    
    const totalPaidAmount = paid.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalUnpaidAmount = unpaid.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return {
      paidCount: paid.length,
      unpaidCount: unpaid.length,
      totalPaid: totalPaidAmount,
      totalUnpaid: totalUnpaidAmount,
      outstandingTypes: outstandingFromTypes,
      totalOutstandingFromTypes: totalOutstandingFromTypes
    };
  };

  const stats = calculateStats();

  // Show ONLY actual payments in history (no virtual payments)
  const filterPayments = () => {
    let filtered = [...payments]; // Only actual payments
    
    if (filterStatus === 'paid') {
      return filtered.filter(p => p.status === 'paid');
    } else if (filterStatus === 'unpaid') {
      return filtered.filter(p => p.status === 'unpaid');
    }
    return filtered;
  };

  const displayPayments = filterPayments();

  const getStatusColor = (payment) => {
    if (payment.status === 'unpaid') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Unpaid' };
    }
    if (payment.status === 'paid') {
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Paid' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle, label: 'Pending' };
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-green-700">Total Paid</p>
            <CheckCircle className="h-3 w-3 text-green-600" />
          </div>
          <p className="text-lg font-bold text-green-700">{stats.paidCount}</p>
          <p className="text-xs text-green-600 mt-1">{formatCurrency(stats.totalPaid)}</p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-yellow-700">Total Unpaid</p>
            <Clock className="h-3 w-3 text-yellow-600" />
          </div>
          <p className="text-lg font-bold text-yellow-700">{stats.unpaidCount}</p>
          <p className="text-xs text-yellow-600 mt-1">{formatCurrency(stats.totalUnpaid)}</p>
        </div>
      </div>

      {/* Outstanding Payment Types Notice - Only shown if there are pending payment types */}
      {stats.outstandingTypes.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-800">Pending Payment Types to Pay</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.outstandingTypes.map((type, idx) => (
                  <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    {type.name} ({formatCurrency(type.amount)})
                  </span>
                ))}
              </div>
              <Link 
                to="/payments?tab=make" 
                className="text-xs text-yellow-700 font-medium mt-2 inline-block hover:text-yellow-800 underline"
              >
                Make a Payment →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filterStatus !== 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-3 w-3" />
            Filter
            {filterStatus !== 'all' && (
              <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </button>
          
          {showFilters && (
            <div className="absolute left-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[120px]">
              <div className="p-1">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                    filterStatus === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Payments
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('paid');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                    filterStatus === 'paid' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Paid Only
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('unpaid');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                    filterStatus === 'unpaid' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Unpaid Only
                </button>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-400">
          {displayPayments.length} record(s)
        </p>
      </div>

      {/* Payment List - Only actual payments from database */}
      {displayPayments.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <DollarSign className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No payment records found</p>
          <p className="text-xs text-gray-400 mt-1">When you make payments, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayPayments.map((payment) => {
            const statusStyle = getStatusColor(payment);
            const StatusIcon = statusStyle.icon;
            const displayName = payment.name || payment.paymentType?.name || payment.type || 'Payment';
            const displayAmount = payment.amount || 0;
            const displayDate = payment.paidAt || payment.createdAt;
            
            return (
              <div
                key={payment._id}
                className={`bg-white rounded-xl border ${statusStyle.border} p-3 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-gray-800 text-sm capitalize">
                        {displayName}
                      </h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusStyle.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {displayDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(displayDate)}</span>
                        </div>
                      )}
                      {payment.description && (
                        <p className="text-gray-400 truncate max-w-[150px]">
                          {payment.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {formatCurrency(displayAmount)}
                    </p>
                    {payment.status !== 'paid' && (
                      <Link 
                        to="/payments?tab=make" 
                        className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1"
                      >
                        Pay Now
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
            <div className="px-4 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Type</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {selectedPayment.type || 'Payment'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium capitalize ${
                  selectedPayment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {selectedPayment.status || 'Pending'}
                </span>
              </div>
              
              {selectedPayment.description && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 block mb-1">Description</span>
                  <p className="text-sm text-gray-700">{selectedPayment.description}</p>
                </div>
              )}
              
              {selectedPayment.paidAt && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Paid On</span>
                  <span className="text-sm text-gray-700">{formatDate(selectedPayment.paidAt)}</span>
                </div>
              )}
              
              {selectedPayment.dueDate && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <span className="text-sm text-gray-700">{formatDate(selectedPayment.dueDate)}</span>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentHistory;
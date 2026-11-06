import { useState } from 'react';
import { ChevronRight, CheckCircle, Clock, Calendar, DollarSign, AlertCircle, Filter, X, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentHistory = ({ payments = [], loading, onRefresh, isMobile, formatCurrency: propFormatCurrency, paymentTypes = [], isAdmin = false }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Safe formatCurrency function with fallback
  const formatCurrency = (amount) => {
    if (propFormatCurrency && typeof propFormatCurrency === 'function') {
      return propFormatCurrency(amount);
    }
    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    } catch (error) {
      console.error('Format currency error:', error);
      return `₦${(amount || 0).toLocaleString()}`;
    }
  };

  // ⭐ Helper function to calculate total including penalty
  const calculateTotalWithPenalty = (payment) => {
    if (!payment) return 0;

    let baseAmount = payment.amount || 0;
    let totalPenalty = 0;

    // Check penaltyBreakdown
    if (payment.penaltyBreakdown && payment.penaltyBreakdown.length > 0) {
      payment.penaltyBreakdown.forEach(item => {
        if (item.penalty && item.isLate) {
          totalPenalty += item.penalty;
        }
      });
    }

    // Fallback to penaltyAmount field
    if (totalPenalty === 0 && payment.penaltyAmount && payment.penaltyAmount > 0) {
      totalPenalty = payment.penaltyAmount;
    }

    return baseAmount + totalPenalty;
  };

  // Calculate stats including outstanding from payment types
  // Calculate stats from payments only (no virtual types)
  const calculateStats = () => {
    let paidPayments = [];
    let unpaidPayments = [];
    let partialPayments = [];

    // ✅ Only include payments that exist in the database
    const validPayments = payments.filter(p => p.type !== 'outstanding');

    if (isAdmin) {
      paidPayments = validPayments.filter(p => p.status === 'paid');
      partialPayments = validPayments.filter(p => p.isPartial === true && p.remainingAmount > 0);
      unpaidPayments = validPayments.filter(p => p.status === 'unpaid' || p.status === 'pending');
    } else {
      paidPayments = validPayments.filter(p => p.status === 'paid');
      partialPayments = validPayments.filter(p => p.isPartial === true && p.remainingAmount > 0);
      unpaidPayments = validPayments.filter(p => p.status === 'unpaid' || p.status === 'pending');
    }

    // ⭐ Calculate totals INCLUDING penalties
    const totalPaidAmount = paidPayments.reduce((sum, p) => sum + calculateTotalWithPenalty(p), 0);
    const totalUnpaidAmount = unpaidPayments.reduce((sum, p) => sum + calculateTotalWithPenalty(p), 0);
    const totalPartialAmount = partialPayments.reduce((sum, p) => sum + calculateTotalWithPenalty(p), 0);

    return {
      paidCount: paidPayments.length,
      unpaidCount: unpaidPayments.length,
      partialCount: partialPayments.length,
      totalPaid: totalPaidAmount,
      totalUnpaid: totalUnpaidAmount,
      totalPartial: totalPartialAmount,
      totalOutstanding: totalUnpaidAmount + totalPartialAmount
    };
  };

  const stats = calculateStats();

  // Combine actual payments with outstanding payment types
  // Get payment items (only from database, no virtual types)
  const getPaymentItems = () => {
    const items = [];

    // ✅ Only include valid payments (not outstanding)
    const validPayments = payments.filter(p => p.type !== 'outstanding');

    validPayments.forEach(payment => {
      const isPartial = payment.isPartial === true;
      const remainingAmount = payment.remainingAmount || 0;

      // ⭐ Calculate total including penalty for display
      const totalAmount = calculateTotalWithPenalty(payment);

      items.push({
        ...payment,
        _id: payment._id,
        isVirtual: false,
        source: 'payment_record',
        displayStatus: isPartial ? 'partial' : (payment.status || 'paid'),
        displayAmount: totalAmount,  // ⭐ Use total including penalty
        originalAmount: payment.amount || 0,  // ⭐ Store original base amount
        penaltyAmount: totalAmount - (payment.amount || 0),  // ⭐ Calculate penalty amount
        remainingAmount: remainingAmount,
        totalPaidSoFar: payment.totalPaidSoFar || 0,
        isOutstanding: false,
        hasPenalty: totalAmount > (payment.amount || 0)  // ⭐ Flag if penalty exists
      });
    });

    // Filter based on status
    if (filterStatus === 'paid') {
      return items.filter(item => item.status === 'paid');
    } else if (filterStatus === 'unpaid') {
      return items.filter(item => item.status === 'unpaid' || item.status === 'pending');
    } else if (filterStatus === 'partial') {
      return items.filter(item => item.isPartial === true);
    }
    return items;
  };

  const displayItems = getPaymentItems();

  const getStatusColor = (item) => {
    const status = item.status;
    const isPartial = item.isPartial === true;

    if (isPartial) {
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle, label: 'Partial' };
    }
    if (status === 'unpaid' || status === 'pending') {
      return { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', icon: Clock, label: 'Pending' };
    }
    if (status === 'paid') {
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle, label: 'Paid' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle, label: 'Unknown' };
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
      {/* <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-blue-700">
              {isAdmin ? 'Total Payments Received' : 'Total Paid'}
            </p>
            <CheckCircle className="h-3 w-3 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-blue-700">{stats.paidCount}</p>
          <p className="text-xs text-blue-600 mt-1">{formatCurrency(stats.totalPaid)}</p>
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-amber-50 rounded-xl p-3 border border-sky-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-sky-700">
              Total Outstanding
            </p>
            <Clock className="h-3 w-3 text-sky-600" />
          </div>
          <p className="text-lg font-bold text-sky-700">
            {stats.unpaidCount + stats.partialCount}
          </p>
          <p className="text-xs text-sky-600 mt-1">{formatCurrency(stats.totalOutstanding)}</p>
        </div>
      </div> */}

      {/* Show Partial Payments Stats if any */}
      {/* {stats.partialCount > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-medium text-gray-700">Partial Payments</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700">{stats.partialCount}</p>
              <p className="text-xs text-gray-600">Remaining: {formatCurrency(stats.totalPartial)}</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus !== 'all'
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
            <div className="absolute left-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[130px]">
              <div className="p-1">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('paid');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${filterStatus === 'paid' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Paid Only
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('unpaid');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${filterStatus === 'unpaid' ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Unpaid Only
                </button>
                <button
                  onClick={() => {
                    setFilterStatus('partial');
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${filterStatus === 'partial' ? 'bg-gray-50 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Partial Payments
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {displayItems.length} item(s)
        </p>
      </div>

      {/* Combined Payment List */}
      {displayItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <DollarSign className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No payment records found</p>
          <p className="text-xs text-gray-400 mt-1">When payments are made, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item) => {
            const statusStyle = getStatusColor(item);
            const StatusIcon = statusStyle.icon;
            const displayName = item.name || item.type || 'Payment';
            const displayAmount = item.displayAmount || item.amount || 0;
            const displayDate = item.paidAt || item.createdAt || item.date;
            const memberName = item.user?.name || item.memberName || (isAdmin ? 'Member' : null);
            const isPartial = (item.isPartial === true || item.displayStatus === 'partial') && item.type !== 'outstanding';
            const remainingAmount = item.remainingAmount || 0;
            const totalPaidSoFar = item.totalPaidSoFar || 0;
            const hasPenalty = item.hasPenalty || false;
            const penaltyAmount = item.penaltyAmount || 0;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl border ${statusStyle.border} p-3 hover:shadow-md transition-shadow cursor-pointer ${item.isVirtual ? 'border-dashed' : ''
                  }`}
                onClick={() => !item.isVirtual && setSelectedPayment(item)}
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
                      {/* ⭐ Penalty Badge */}
                      {hasPenalty && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          +₦{penaltyAmount} penalty
                        </span>
                      )}
                      {isPartial && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {formatCurrency(remainingAmount)} remaining
                        </span>
                      )}
                      {item.isVirtual && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                      {isAdmin && !item.isVirtual && memberName && (
                        <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Users className="h-2 w-2" />
                          {memberName}
                        </span>
                      )}
                    </div>

                    {/* Partial payment details */}
                    {isPartial && totalPaidSoFar > 0 && (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>Paid: {formatCurrency(totalPaidSoFar)}</span>
                          <span>Remaining: {formatCurrency(remainingAmount)}</span>
                          {hasPenalty && (
                            <span className="text-red-500">Penalty: +₦{penaltyAmount}</span>
                          )}
                        </div>
                        {(() => {
                          const paidAmount = totalPaidSoFar || 0;
                          const charges = paidAmount * 0.04;
                          const netReceived = paidAmount - charges;
                          return (
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>Charges (4%): -{formatCurrency(charges)}</span>
                              <span className="text-blue-600">Net Received: {formatCurrency(netReceived)}</span>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      {displayDate && !item.isVirtual && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(displayDate)}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-gray-400 truncate max-w-[150px]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-sm ${item.status === 'paid' || item.displayStatus === 'paid' ? 'text-blue-600' :
                      isPartial ? 'text-gray-600' : 'text-sky-600'
                      }`}>
                      {formatCurrency(displayAmount)}
                    </p>
                    {hasPenalty && (
                      <p className="text-[10px] text-red-500 line-through">
                        {formatCurrency(item.originalAmount || 0)}
                      </p>
                    )}

                    {!isAdmin && !isPartial && item.status !== 'paid' && !item.isVirtual && (
                      <Link
                        to="/payments?tab=make"
                        className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1"
                        onClick={(e) => e.stopPropagation()}
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

      {/* Payment Details Modal - Updated to show partial payment info */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50" onClick={() => setSelectedPayment(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
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
              {isAdmin && selectedPayment.user?.name && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Member</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedPayment.user.name}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Type</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {selectedPayment.type || 'Payment'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(calculateTotalWithPenalty(selectedPayment))}
                </span>
              </div>

              {/* ⭐ Show penalty breakdown */}
              {selectedPayment.penaltyBreakdown && selectedPayment.penaltyBreakdown.length > 0 && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 block mb-1">Penalty Details</span>
                  {selectedPayment.penaltyBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gray-600">{item.month}</span>
                      <span className="text-red-600">+₦{item.penalty}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs font-medium mt-1 pt-1 border-t border-gray-200">
                    <span className="text-gray-700">Total Penalty</span>
                    <span className="text-red-700">+₦{selectedPayment.penaltyAmount || 0}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium capitalize ${selectedPayment.status === 'paid' ? 'text-blue-600' :
                  selectedPayment.isPartial ? 'text-gray-600' : 'text-sky-600'
                  }`}>
                  {selectedPayment.isPartial ? 'Partial' : (selectedPayment.status || 'Pending')}
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
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
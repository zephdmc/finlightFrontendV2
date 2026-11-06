import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, Filter, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, ChevronRight, Gavel, X, RefreshCw, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePayments, } from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';



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

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const {
        data: payments = [],
        isLoading,
        refetch: refetchPayments,
        error
    } = usePayments();


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount || 0);
        } catch (error) {
            return `₦${(amount || 0).toLocaleString()}`;
        }
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

    // Calculate stats from payments only (no virtual types)
    const calculateStats = () => {
        let paidPayments = [];
        let unpaidPayments = [];
        let partialPayments = [];

        // ✅ Only include payments that exist in the database
        // ✅ Exclude outstanding records
        const validPayments = payments.filter(p => p.type !== 'outstanding');

        paidPayments = validPayments.filter(p => p.status === 'paid');
        partialPayments = validPayments.filter(p => p.isPartial === true && p.remainingAmount > 0);
        unpaidPayments = validPayments.filter(p => p.status === 'unpaid' || p.status === 'pending');

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

    // Get payment items (only from database, no virtual types)
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
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Pending' };
        }
        if (status === 'paid') {
            return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle, label: 'Paid' };
        }
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle, label: 'Unknown' };
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Failed to load payment history</p>
                        <button
                            onClick={() => refetchPayments()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div
                            onClick={handleBackToDashboard}
                            className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
                            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                            {/* <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" /> */}

                        </div>


                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} mb-1`}>Payment History</h1>
                                <p className={`text-blue-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                    View all your payment records
                                </p>
                            </div>

                        </div>

                    </div>
                </div>







                {/* Filter Controls */}
                <div className="px-4 mt-4">
                    <div className="bg-white rounded-xl shadow-sm p-3">
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
                                            {['all', 'paid', 'unpaid', 'partial'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterStatus(status);
                                                        setShowFilters(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${filterStatus === status
                                                        ? status === 'all' ? 'bg-blue-50 text-blue-700'
                                                            : status === 'paid' ? 'bg-blue-50 text-blue-700'
                                                                : status === 'unpaid' ? 'bg-yellow-50 text-yellow-700'
                                                                    : 'bg-gray-50 text-gray-700'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {status === 'all' ? 'All Items' : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400">{displayItems.length} item(s)</p>
                        </div>
                    </div>
                </div>

                {/* Payment List */}
                <div className="px-4 mt-4">
                    {displayItems.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm text-center py-12 px-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <DollarSign className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">No Payment Records</h3>
                            <p className="text-sm text-gray-500">You don't have any payment records yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {displayItems.map((item) => {
                                const statusStyle = getStatusColor(item);
                                const StatusIcon = statusStyle.icon;
                                const displayName = item.name || item.type || 'Payment';
                                const displayAmount = item.displayAmount || item.amount || 0;
                                const displayDate = item.paidAt || item.createdAt || item.date;
                                const isPartial = (item.isPartial === true || item.displayStatus === 'partial') && item.type !== 'outstanding';
                                const remainingAmount = item.remainingAmount || 0;
                                const totalPaidSoFar = item.totalPaidSoFar || 0;
                                const hasPenalty = item.hasPenalty || false;
                                const penaltyAmount = item.penaltyAmount || 0;

                                return (
                                    <div
                                        key={item._id}
                                        className={`bg-white rounded-xl border ${statusStyle.border} p-3 hover:shadow-md transition-shadow cursor-pointer`}
                                        onClick={() => setSelectedPayment(item)}
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
                                                            <Gavel className="h-3 w-3" />
                                                            +₦{penaltyAmount} penalty
                                                        </span>
                                                    )}
                                                    {isPartial && (
                                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                                            {formatCurrency(remainingAmount)} remaining
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Show partial payment details with charges */}
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
                                                    {displayDate && (
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
                                                <p className={`font-bold text-sm ${item.status === 'paid' ? 'text-blue-600' :
                                                    isPartial ? 'text-gray-600' : 'text-yellow-600'
                                                    }`}>
                                                    {formatCurrency(displayAmount)}
                                                </p>
                                                {hasPenalty && (
                                                    <p className="text-[10px] text-red-500 line-through">
                                                        {formatCurrency(item.originalAmount || 0)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Payment Details Modal */}
                {/* Payment Details Modal */}
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
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Type</span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                        {selectedPayment.type || 'Payment'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Base Amount</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(selectedPayment.amount || 0)}
                                    </span>
                                </div>

                                {/* ⭐ Show penalty breakdown */}
                                {selectedPayment.penaltyBreakdown && selectedPayment.penaltyBreakdown.length > 0 && (
                                    <div className="py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500 block mb-1">Penalty Details</span>
                                        {selectedPayment.penaltyBreakdown.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-0.5">
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

                                <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-gray-50 rounded-lg p-2">
                                    <span className="text-sm font-medium text-gray-700">Total Amount</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatCurrency(calculateTotalWithPenalty(selectedPayment))}
                                    </span>
                                </div>

                                {selectedPayment.isPartial && (
                                    <>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-500">Amount Paid</span>
                                            <span className="text-sm font-medium text-blue-600">
                                                {formatCurrency(selectedPayment.totalPaidSoFar || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-gray-50 rounded-lg p-2">
                                            <span className="text-sm text-gray-700 font-medium">Remaining Balance</span>
                                            <span className="text-sm font-bold text-gray-700">
                                                {formatCurrency(selectedPayment.remainingAmount || 0)}
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <span className={`text-sm font-medium capitalize ${selectedPayment.status === 'paid' ? 'text-blue-600' :
                                        selectedPayment.isPartial ? 'text-gray-600' : 'text-yellow-600'
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
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
            </div>
        </div>
    );
};

export default PaymentHistoryPage;
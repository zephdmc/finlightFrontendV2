import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import PaymentHistory from '../components/payment/PaymentHistory';
import api from '../services/api';
import {
    History,
    RefreshCw,
    DollarSign,
    Users,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
    Calendar,
    Download,
    Filter,
    Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminPayments } from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

/**
 * Admin History Page - Complete Payment History View
 * Shows all payments made by all members (excluding fines)
 * Mobile-optimized with search and filter capabilities
 */

// â­ Helper function to calculate total including penalty
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
const AdminHistoryPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // ========== LOCAL STATE ==========
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ========== REACT QUERY HOOK ==========
    const {
        data: allPayments = [],
        isLoading: paymentsLoading,
        refetch: refetchPayments,
        error: paymentsError
    } = useAdminPayments({});

    // ========== STATS STATE ==========
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalRevenue: 0,
        paidPayments: 0,
        pendingPayments: 0,
        partialPayments: 0,
        totalOutstanding: 0,
        totalPartial: 0,
        uniqueMembers: 0
    });

    // ========== EFFECTS ==========
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update stats whenever payments change
    useEffect(() => {
        if (allPayments) {
            updateStats(allPayments);
        }
    }, [allPayments]);

    // ========== STATS CALCULATION ==========
    const updateStats = (paymentsData) => {
        // âœ… EXCLUDE FINES - filter out fine payments
        const validPayments = paymentsData.filter(p =>
            p.type !== 'fine' &&
            p.type !== 'fines' &&
            p.category !== 'fine' &&
            p.category !== 'fines' &&
            !p.isFine
        );

        const paid = validPayments.filter(p => p.status === 'paid');
        const partial = validPayments.filter(p => p.isPartial === true && p.remainingAmount > 0);
        const pending = validPayments.filter(p => p.status === 'unpaid' || p.status === 'pending');

        // â­ Calculate totals INCLUDING penalties
        const totalRevenue = paid.reduce((sum, p) => sum + calculateTotalWithPenalty(p), 0);

        // Calculate outstanding including penalties
        const totalOutstanding = pending.reduce((sum, p) => sum + calculateTotalWithPenalty(p), 0) +
            partial.reduce((sum, p) => sum + calculateTotalWithPenalty(p), 0);

        // Calculate partial remaining including penalties
        const totalPartial = partial.reduce((sum, p) => sum + calculateTotalWithPenalty(p), 0);

        // Get unique members
        const uniqueMemberIds = new Set();
        validPayments.forEach(p => {
            if (p.user?._id) uniqueMemberIds.add(p.user._id);
            if (p.userId) uniqueMemberIds.add(p.userId);
            if (p.memberId) uniqueMemberIds.add(p.memberId);
        });


        setStats({
            totalPayments: validPayments.length,
            totalRevenue: totalRevenue,  // â­ Now includes penalties
            paidPayments: paid.length,
            pendingPayments: pending.length + partial.length,
            partialPayments: partial.length,
            totalOutstanding: totalOutstanding,
            totalPartial: totalPartial,
            uniqueMembers: uniqueMemberIds.size
        });
    };

    // ========== FILTER PAYMENTS ==========
    const getFilteredPayments = () => {
        // âœ… EXCLUDE FINES at the source
        let filtered = allPayments.filter(p =>
            p.type !== 'fine' &&
            p.type !== 'fines' &&
            p.category !== 'fine' &&
            p.category !== 'fines' &&
            !p.isFine
        );
        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => {
                const memberName = p.user?.name || p.memberName || '';
                const type = p.type || '';
                const description = p.description || '';
                const reference = p.reference || '';
                return memberName.toLowerCase().includes(term) ||
                    type.toLowerCase().includes(term) ||
                    description.toLowerCase().includes(term) ||
                    reference.toLowerCase().includes(term);
            });
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(p => p.type === filterType);
        }

        // Status filter
        if (filterStatus === 'paid') {
            filtered = filtered.filter(p => p.status === 'paid');
        } else if (filterStatus === 'unpaid') {
            filtered = filtered.filter(p => p.status === 'unpaid' || p.status === 'pending');
        } else if (filterStatus === 'partial') {
            filtered = filtered.filter(p => p.isPartial === true);
        }

        // Date range filter
        if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            filtered = filtered.filter(p => {
                const paymentDate = new Date(p.paidAt || p.createdAt || p.date);
                return paymentDate >= startDate;
            });
        }
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59);
            filtered = filtered.filter(p => {
                const paymentDate = new Date(p.paidAt || p.createdAt || p.date);
                return paymentDate <= endDate;
            });
        }
        if (filtered.length > 0) {
            const hasPenaltyData = filtered.some(p => p.penaltyBreakdown && p.penaltyBreakdown.length > 0);
                    }

        return filtered;
    };

    // ========== EVENT HANDLERS ==========
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refetchPayments();
            toast.success('Payment history refreshed successfully');
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    };

    const handleExport = () => {
        const filtered = getFilteredPayments();
        if (filtered.length === 0) {
            toast.error('No payments to export');
            return;
        }

        // Create CSV data
        const headers = ['Member', 'Type', 'Amount', 'Status', 'Date', 'Description', 'Reference'];
        const csvData = filtered.map(p => [
            p.user?.name || p.memberName || 'Unknown',
            p.type || 'Payment',
            p.amount || 0,
            p.isPartial ? 'Partial' : p.status || 'Pending',
            new Date(p.paidAt || p.createdAt || p.date).toLocaleDateString(),
            p.description || '',
            p.reference || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Export started');
    };

    // ========== GET UNIQUE PAYMENT TYPES ==========
    const getUniqueTypes = () => {
        const types = new Set();
        allPayments.forEach(p => {
            if (p.type && p.type !== 'fine' && p.type !== 'fines') {
                types.add(p.type);
            }
        });
        return Array.from(types);
    };

    // ========== FORMAT CURRENCY ==========
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // ========== BACK TO HOME ==========
    const handleBackToHome = () => {
        navigate('/admin-dashboard');
    };

    // ========== LOADING STATE ==========
    if (paymentsLoading && allPayments.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // ========== ERROR STATE ==========
    if (paymentsError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Failed to load payment history</p>
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

    const filteredPayments = getFilteredPayments();
    const uniqueTypes = getUniqueTypes();

    // ========== RENDER ==========
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            {/* Header with Gradient Background */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackToHome}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-3xl'} mb-1`}>
                                Payment History
                            </h1>
                            <p className={`text-blue-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                Complete payment history for all members
                            </p>
                        </div>
                    </div>

                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {/* <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-blue-100 text-xs">Total Revenue</p>
                            <DollarSign className="h-3 w-3 text-blue-200" />
                        </div>
                        <p className="font-bold text-base">{formatCurrency(stats.totalRevenue)}</p>
                        <p className="text-xs text-blue-200 mt-1">{stats.paidPayments} payments</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-blue-100 text-xs">Total Outstanding</p>
                            <AlertCircle className="h-3 w-3 text-sky-300" />
                        </div>
                        <p className="font-bold text-base">{formatCurrency(stats.totalOutstanding)}</p>
                        <p className="text-xs text-blue-200 mt-1">{stats.pendingPayments} pending</p>
                    </div> */}

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-blue-100 text-xs">Members</p>
                            <Users className="h-3 w-3 text-blue-200" />
                        </div>
                        <p className="font-bold text-base">{stats.uniqueMembers}</p>
                        <p className="text-xs text-blue-200 mt-1">with payments</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-blue-100 text-xs">Total Payments</p>
                            <History className="h-3 w-3 text-blue-200" />
                        </div>
                        <p className="font-bold text-base">{stats.totalPayments}</p>
                        <p className="text-xs text-blue-200 mt-1">{stats.partialPayments} partial</p>
                    </div>
                </div>

                {/* Partial Payments Alert */}
                {/* {stats.partialPayments > 0 && (
                    <div className="bg-gray-500/20 backdrop-blur-sm rounded-xl p-3 mt-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-gray-200" />
                                <p className="text-gray-100 text-xs font-medium">
                                    {stats.partialPayments} Partial Payment{stats.partialPayments > 1 ? 's' : ''} Found
                                </p>
                            </div>
                            <p className="text-xs text-gray-200">
                                Remaining: {formatCurrency(stats.totalPartial)}
                            </p>
                        </div>
                    </div>
                )} */}
            </div>

            {/* Search and Filters */}
            <div className="px-4 mt-4 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by member, type, or reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm outline-none transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1 px-3 py-2 text-xs rounded-xl transition-all ${(filterStatus !== 'all' || filterType !== 'all' || dateRange.start || dateRange.end)
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-3 w-3" />
                        Filters
                        {(filterStatus !== 'all' || filterType !== 'all' || dateRange.start || dateRange.end) && (
                            <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                    </button>

                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`flex items-center gap-1 px-3 py-2 text-xs rounded-xl transition-all ${(dateRange.start || dateRange.end)
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Calendar className="h-3 w-3" />
                        Date
                        {(dateRange.start || dateRange.end) && (
                            <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterStatus('all');
                            setDateRange({ start: '', end: '' });
                            toast.success('Filters cleared');
                        }}
                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Clear All
                    </button>

                    <span className="text-xs text-gray-400 ml-auto">
                        {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-lg">
                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Status</label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('paid')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus === 'paid'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Paid
                                </button>
                                <button
                                    onClick={() => setFilterStatus('unpaid')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus === 'unpaid'
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setFilterStatus('partial')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus === 'partial'
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Partial
                                </button>
                            </div>
                        </div>

                        {/* Type Filter */}
                        {uniqueTypes.length > 0 && (
                            <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1.5">Payment Type</label>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => setFilterType('all')}
                                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterType === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        All Types
                                    </button>
                                    {uniqueTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors capitalize ${filterType === type
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Date Range Picker */}
                {showDatePicker && (
                    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-lg">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">From</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 block mb-1">To</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                            </div>
                        </div>
                        {(dateRange.start || dateRange.end) && (
                            <button
                                onClick={() => setDateRange({ start: '', end: '' })}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear dates
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <History className="h-4 w-4 text-blue-600" />
                            All Payment Records
                            <span className="text-xs text-gray-400 font-normal ml-1">
                                ({filteredPayments.length} records)
                            </span>
                        </h3>
                        {filteredPayments.length > 0 && (
                            <button
                                onClick={handleExport}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <Download className="h-3 w-3" />
                                Export
                            </button>
                        )}
                    </div>
                    <div className="p-4">
                        <PaymentHistory
                            payments={filteredPayments}
                            loading={paymentsLoading && refreshing}
                            onRefresh={handleRefresh}
                            isMobile={isMobile}
                            formatCurrency={formatCurrency}
                            paymentTypes={[]}
                            isAdmin={true}
                        />
                    </div>
                </div>
            </div>

            {/* Empty State Message */}
            {filteredPayments.length === 0 && allPayments.length > 0 && (
                <div className="px-4 mt-2">
                    <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-sky-800">No Payments Found</h3>
                                <p className="text-xs text-sky-700 mt-1">
                                    Try adjusting your search or filter criteria to see more results.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="px-4 mt-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <History className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">Payment History Overview</h3>
                            <p className="text-xs text-blue-700 mt-1">
                                View all payment records from all members. <span className="font-medium">Fines are excluded</span> from this view.
                                Use the search and filters to find specific payments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHistoryPage;
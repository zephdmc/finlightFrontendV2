import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import AuthService from '../services/authService';
import {
    Gavel,
    Users,
    RefreshCw,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Filter,
    Calendar,
    DollarSign,
    User,
    Lock,
    FileText,
    Trash2,
    Edit,
    Eye,
    Download,
    ChevronDown,
    ChevronRight,
    Plus,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Fine Management Page - Admin Only
 * Create and manage fines for members
 */
const FineManagementPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // ========== STATE ==========
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [members, setMembers] = useState([]);
    const [fines, setFines] = useState([]);
    const [filteredFines, setFilteredFines] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingFines, setLoadingFines] = useState(false);

    // Form state
    const [selectedMember, setSelectedMember] = useState(null);
    const [fineAmount, setFineAmount] = useState('');
    const [fineReason, setFineReason] = useState('');
    const [fineDescription, setFineDescription] = useState('');
    const [showAdminPinModal, setShowAdminPinModal] = useState(false);
    const [adminPin, setAdminPin] = useState('');
    const [verifyingPin, setVerifyingPin] = useState(false);
    const [editingFine, setEditingFine] = useState(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMember, setFilterMember] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // ========== REFS ==========
    const membersLoadedRef = useRef(false);

    // ========== EFFECTS ==========
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchMembers();
            fetchAllFines();
        }
    }, [isAdmin]);

    useEffect(() => {
        applyFilters();
    }, [fines, searchTerm, filterStatus, filterMember, dateRange]);

    // ========== API CALLS ==========
    const fetchMembers = async () => {
        if (membersLoadedRef.current) return;
        setLoadingMembers(true);
        try {
            const response = await api.get('/users?role=member&limit=100');
            const membersList = response.data?.data?.records || response.data?.data || [];
            setMembers(membersList);
            membersLoadedRef.current = true;
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load members');
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchAllFines = async () => {
        setLoadingFines(true);
        try {
            // Fetch all payments and filter fines
            const response = await api.get('/payments/all');
            const allPayments = response.data?.data?.records || response.data?.data || [];

            // Filter only fines
            const finePayments = allPayments.filter(p =>
                p.type === 'fine' ||
                p.type === 'fines' ||
                p.category === 'fine' ||
                p.category === 'fines' ||
                p.isFine === true
            );

            // Enrich with member names
            const enrichedFines = finePayments.map(fine => {
                const member = members.find(m =>
                    m._id === fine.userId ||
                    m._id === fine.user?._id ||
                    m.id === fine.userId
                );
                return {
                    ...fine,
                    memberName: member?.name || fine.user?.name || fine.memberName || 'Unknown Member',
                    memberEmail: member?.email || fine.user?.email || '',
                    memberId: member?._id || fine.userId || fine.user?._id
                };
            });

            setFines(enrichedFines);
        } catch (error) {
            console.error('Error fetching fines:', error);
            toast.error('Failed to load fines');
        } finally {
            setLoadingFines(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...fines];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(f =>
                f.memberName?.toLowerCase().includes(term) ||
                f.reason?.toLowerCase().includes(term) ||
                f.description?.toLowerCase().includes(term) ||
                f.reference?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (filterStatus === 'paid') {
            filtered = filtered.filter(f => f.status === 'paid');
        } else if (filterStatus === 'unpaid') {
            filtered = filtered.filter(f => f.status === 'unpaid' || f.status === 'pending');
        } else if (filterStatus === 'partial') {
            filtered = filtered.filter(f => f.isPartial === true);
        }

        // Member filter
        if (filterMember !== 'all') {
            filtered = filtered.filter(f =>
                f.memberId === filterMember ||
                f.userId === filterMember ||
                f.user?._id === filterMember
            );
        }

        // Date range filter
        if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            filtered = filtered.filter(f => {
                const fineDate = new Date(f.createdAt || f.date || f.dueDate);
                return fineDate >= startDate;
            });
        }
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59);
            filtered = filtered.filter(f => {
                const fineDate = new Date(f.createdAt || f.date || f.dueDate);
                return fineDate <= endDate;
            });
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || a.dueDate);
            const dateB = new Date(b.createdAt || b.date || b.dueDate);
            return dateB - dateA;
        });

        setFilteredFines(filtered);
        setCurrentPage(1);
    };

    // ========== FINE CRUD OPERATIONS ==========
    const createFine = async () => {
        if (!selectedMember) {
            toast.error('Please select a member');
            return;
        }
        if (!fineAmount || parseFloat(fineAmount) <= 0) {
            toast.error('Please enter a valid fine amount');
            return;
        }
        if (!fineReason) {
            toast.error('Please enter a reason for the fine');
            return;
        }

        if (!adminPin || adminPin.length < 4) {
            toast.error('Please enter a valid admin pin');
            return;
        }

        setVerifyingPin(true);
        try {
            // Verify admin pin
            const pinVerification = await AuthService.verifyAdminPin(adminPin);
            if (!pinVerification.success) {
                toast.error('Invalid admin pin');
                setVerifyingPin(false);
                return;
            }

            // Create fine
            const fineData = {
                userId: selectedMember._id || selectedMember.id,
                name: `Fine: ${fineReason}`,
                type: 'fine',
                amount: parseFloat(fineAmount),
                description: fineDescription || `Fine: ${fineReason}`,
                status: 'unpaid',
                dueDate: new Date().toISOString().split('T')[0],
                reason: fineReason
            };

            const response = await api.post('/payments', fineData);

            toast.success(`Fine of ${formatCurrency(parseFloat(fineAmount))} created for ${selectedMember.name}`);

            // Reset form
            setFineAmount('');
            setFineReason('');
            setFineDescription('');
            setShowAdminPinModal(false);
            setAdminPin('');

            // Refresh fines list
            await fetchAllFines();

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Create fine error:', error);
            toast.error(error.response?.data?.message || 'Failed to create fine');
        } finally {
            setVerifyingPin(false);
        }
    };

    const deleteFine = async (fineId) => {
        if (!window.confirm('Are you sure you want to delete this fine?')) return;

        try {
            await api.delete(`/payments/${fineId}`);
            toast.success('Fine deleted successfully');
            await fetchAllFines();
        } catch (error) {
            console.error('Delete fine error:', error);
            toast.error('Failed to delete fine');
        }
    };

    const markFineAsPaid = async (fineId) => {
        if (!window.confirm('Mark this fine as paid?')) return;

        try {
            await api.patch(`/payments/${fineId}`, { status: 'paid' });
            toast.success('Fine marked as paid');
            await fetchAllFines();
        } catch (error) {
            console.error('Update fine error:', error);
            toast.error('Failed to update fine');
        }
    };

    // ========== UTILITY FUNCTIONS ==========
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
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

    const getStatusColor = (status, isPartial) => {
        if (isPartial) {
            return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertCircle, label: 'Partial' };
        }
        if (status === 'paid') {
            return { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', icon: CheckCircle, label: 'Paid' };
        }
        if (status === 'unpaid' || status === 'pending') {
            return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: Clock, label: 'Unpaid' };
        }
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle, label: 'Unknown' };
    };

    // ========== STATS ==========
    const getStats = () => {
        const total = fines.length;
        const paid = fines.filter(f => f.status === 'paid').length;
        const unpaid = fines.filter(f => f.status === 'unpaid' || f.status === 'pending').length;
        const partial = fines.filter(f => f.isPartial === true).length;
        const totalAmount = fines.reduce((sum, f) => sum + (f.amount || 0), 0);
        const paidAmount = fines.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);
        const unpaidAmount = fines.filter(f => f.status === 'unpaid' || f.status === 'pending').reduce((sum, f) => sum + (f.amount || 0), 0);

        return { total, paid, unpaid, partial, totalAmount, paidAmount, unpaidAmount };
    };

    const stats = getStats();

    // ========== HANDLERS ==========
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([fetchMembers(), fetchAllFines()]);
            toast.success('Data refreshed successfully');
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    };

    const handleBackToHome = () => {
        navigate('/admin-dashboard');
    };

    const handleExport = () => {
        if (filteredFines.length === 0) {
            toast.error('No fines to export');
            return;
        }

        const headers = ['Member', 'Amount', 'Reason', 'Status', 'Date Created', 'Due Date', 'Description'];
        const csvData = filteredFines.map(f => [
            f.memberName || 'Unknown',
            f.amount || 0,
            f.reason || f.description || 'N/A',
            f.isPartial ? 'Partial' : f.status || 'Unpaid',
            formatDate(f.createdAt || f.date),
            formatDate(f.dueDate),
            f.description || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fines-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Export started');
    };

    // ========== PAGINATION ==========
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFines.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFines.length / itemsPerPage);

    // ========== LOADING STATE ==========
    if (loadingFines && fines.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            {/* Header with Gradient Background */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
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
                                Fine Management
                            </h1>
                            <p className={`text-red-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                Create and manage fines for members
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                            title="Export to CSV"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-red-100 text-xs">Total Fines</p>
                            <Gavel className="h-3 w-3 text-red-200" />
                        </div>
                        <p className="font-bold text-base">{stats.total}</p>
                        <p className="text-xs text-red-200 mt-1">{formatCurrency(stats.totalAmount)}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-red-100 text-xs">Unpaid</p>
                            <Clock className="h-3 w-3 text-yellow-300" />
                        </div>
                        <p className="font-bold text-base">{stats.unpaid}</p>
                        <p className="text-xs text-red-200 mt-1">{formatCurrency(stats.unpaidAmount)}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-red-100 text-xs">Paid</p>
                            <CheckCircle className="h-3 w-3 text-cyan-300" />
                        </div>
                        <p className="font-bold text-base">{stats.paid}</p>
                        <p className="text-xs text-red-200 mt-1">{formatCurrency(stats.paidAmount)}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-red-100 text-xs">Partial</p>
                            <AlertCircle className="h-3 w-3 text-orange-300" />
                        </div>
                        <p className="font-bold text-base">{stats.partial}</p>
                        <p className="text-xs text-red-200 mt-1">Pending completion</p>
                    </div>
                </div>
            </div>

            {/* Create Fine Form */}
            <div className="px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-red-200">
                    <div className="px-4 py-3 border-b border-gray-100 bg-red-50">
                        <h4 className="font-semibold text-red-700 text-sm flex items-center gap-2">
                            <Gavel className="h-4 w-4" />
                            Create New Fine
                        </h4>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Member Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Member <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedMember?._id || selectedMember?.id || ''}
                                    onChange={(e) => {
                                        const member = members.find(m => (m._id === e.target.value) || (m.id === e.target.value));
                                        setSelectedMember(member);
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white appearance-none"
                                    disabled={loadingMembers}
                                >
                                    <option value="">Choose a member...</option>
                                    {members.map(member => (
                                        <option key={member._id || member.id} value={member._id || member.id}>
                                            {member.name} - {member.email}
                                        </option>
                                    ))}
                                </select>
                                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Fine Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fine Amount (Organization receives this) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                                <input
                                    type="number"
                                    value={fineAmount}
                                    onChange={(e) => setFineAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Fine Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Fine <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={fineReason}
                                onChange={(e) => setFineReason(e.target.value)}
                                placeholder="e.g., Late payment, Meeting absence, etc."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={fineDescription}
                                onChange={(e) => setFineDescription(e.target.value)}
                                placeholder="Additional details about the fine..."
                                rows="2"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={() => setShowAdminPinModal(true)}
                            disabled={!selectedMember || !fineAmount || parseFloat(fineAmount) <= 0 || !fineReason}
                            className="w-full py-4 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                        >
                            <div className="flex items-center justify-center">
                                <Plus className="h-5 w-5 mr-2" />
                                Create Fine
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="px-4 mt-4 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search fines by member, reason, or reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-sm outline-none transition-all"
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
                        className={`flex items-center gap-1 px-3 py-2 text-xs rounded-xl transition-all ${(filterStatus !== 'all' || filterMember !== 'all' || dateRange.start || dateRange.end)
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-3 w-3" />
                        Filters
                        {(filterStatus !== 'all' || filterMember !== 'all' || dateRange.start || dateRange.end) && (
                            <span className="ml-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                            setFilterMember('all');
                            setDateRange({ start: '', end: '' });
                            toast.success('Filters cleared');
                        }}
                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Clear All
                    </button>

                    <span className="text-xs text-gray-400 ml-auto">
                        {filteredFines.length} fine{filteredFines.length !== 1 ? 's' : ''}
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
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('unpaid')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus === 'unpaid'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Unpaid
                                </button>
                                <button
                                    onClick={() => setFilterStatus('paid')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus === 'paid'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Paid
                                </button>
                                <button
                                    onClick={() => setFilterStatus('partial')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterStatus === 'partial'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Partial
                                </button>
                            </div>
                        </div>

                        {/* Member Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Member</label>
                            <select
                                value={filterMember}
                                onChange={(e) => setFilterMember(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                            >
                                <option value="all">All Members</option>
                                {members.map(member => (
                                    <option key={member._id || member.id} value={member._id || member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Date Range</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                                />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fines List */}
            <div className="px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <Gavel className="h-4 w-4 text-red-600" />
                            All Fines
                            <span className="text-xs text-gray-400 font-normal ml-1">
                                ({filteredFines.length} records)
                            </span>
                        </h3>
                    </div>

                    {loadingFines && refreshing ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Loading fines...</p>
                        </div>
                    ) : filteredFines.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Gavel className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No fines found</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {fines.length === 0 ? 'Create your first fine using the form above' : 'Try adjusting your filters'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {currentItems.map((fine) => {
                                const statusStyle = getStatusColor(fine.status, fine.isPartial);
                                const StatusIcon = statusStyle.icon;
                                const isPartial = fine.isPartial === true;

                                return (
                                    <div key={fine._id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="font-medium text-gray-800 text-sm">
                                                        {fine.memberName || 'Unknown Member'}
                                                    </h4>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusStyle.label}
                                                    </span>
                                                    {isPartial && (
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                            {formatCurrency(fine.remainingAmount || 0)} remaining
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-700 font-medium">
                                                    {formatCurrency(fine.amount || 0)}
                                                </p>

                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        {fine.reason || fine.description || 'No reason provided'}
                                                    </span>
                                                    {fine.dueDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Due: {formatDate(fine.dueDate)}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(fine.createdAt || fine.date)}
                                                    </span>
                                                </div>

                                                {fine.description && (
                                                    <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                                                        {fine.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 ml-2">
                                                {fine.status !== 'paid' && (
                                                    <button
                                                        onClick={() => markFineAsPaid(fine._id)}
                                                        className="p-1.5 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
                                                        title="Mark as paid"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteFine(fine._id)}
                                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete fine"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Partial payment details */}
                                        {isPartial && (
                                            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-orange-600">Paid: {formatCurrency(fine.totalPaidSoFar || 0)}</span>
                                                    <span className="text-orange-600">Remaining: {formatCurrency(fine.remainingAmount || 0)}</span>
                                                    <span className="text-cyan-600">Received: {formatCurrency((fine.totalPaidSoFar || 0) * 0.94)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-gray-500">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin PIN Verification Modal */}
            {showAdminPinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
                        <div className="px-4 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-red-600" />
                                <h3 className="font-semibold text-gray-900">Admin Verification</h3>
                            </div>
                            <button
                                onClick={() => { setShowAdminPinModal(false); setAdminPin(''); }}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="rounded-xl p-4 mb-4 bg-red-50">
                                <p className="text-sm text-red-800">
                                    Create fine of {formatCurrency(parseFloat(fineAmount) || 0)} for {selectedMember?.name}
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    Reason: {fineReason}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admin PIN</label>
                                <input
                                    type="password"
                                    value={adminPin}
                                    onChange={(e) => setAdminPin(e.target.value)}
                                    placeholder="Enter your admin pin"
                                    maxLength="6"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg text-center tracking-wider focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    autoFocus
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            createFine();
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">Enter your admin pin to authorize this fine</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowAdminPinModal(false); setAdminPin(''); }}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createFine}
                                    disabled={verifyingPin || !adminPin}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {verifyingPin ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>Confirm Fine</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default FineManagementPage;
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import {
    Tag,
    Plus,
    RefreshCw,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Filter,
    DollarSign,
    Edit,
    Trash2,
    Eye,
    Users,
    Calendar,
    Lock,
    Shield,
    Save,
    X,
    Layers,
    Calculator,
    Info,
    TrendingUp,
    TrendingDown,
    Wallet,
    Gavel,
    CalendarDays,
    FileText,
    ChevronDown,
    Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    usePaymentTypes, useCreatePaymentType, useUpdatePaymentType, useDeletePaymentType, useTogglePaymentTypeActive
} from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ⭐ A payment type is "locked" if it has payments linked to it.
// The backend enforces this too — this is just for the UI.
const isPaymentTypeLocked = (type) => {
    // Use whichever field your API exposes:
    //   - paymentsCount (from backend, if you add it to the response)
    //   - hasPayments (from backend)
    //   - totalPayments (from aggregate endpoint)
    // For now, default to false if the field isn't present.
    return Number(type?.paymentsCount || type?.hasPayments || type?.totalPayments || 0) > 0;
};

/**
 * Payment Type Management Page - Admin Only
 * Full CRUD operations for Contribution with Dues/Other tabs
 * Fully Responsive - Mobile, Tablet, Desktop, Laptop
 */
const PaymentTypeManagementPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // ========== STATE ==========
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 640 && window.innerWidth < 1024);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterMandatory, setFilterMandatory] = useState('all');


    // ============================================================
    // Tab state
    // ============================================================
    const [activeTab, setActiveTab] = useState('dues');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [viewingType, setViewingType] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [newlyCreatedType, setNewlyCreatedType] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'dues',
        description: '',
        amount: '',
        is_mandatory: false,
        frequency: 'one-time',
        duration_value: 1,
        duration_unit: 'months',
        late_penalty_enabled: false,
        late_penalty_type: 'fixed',
        late_penalty_value: '',
        late_penalty_days_after: 7,
        due_date_after: 30,
    });

    const [loading, setLoading] = useState(false);

    // ========== REACT QUERY HOOKS ==========
    const {
        data: paymentTypes = [],
        isLoading: typesLoading,
        refetch: refetchPaymentTypes,
        error: typesError
    } = usePaymentTypes();

    const createPaymentType = useCreatePaymentType();
    const updatePaymentType = useUpdatePaymentType();
    const deletePaymentType = useDeletePaymentType();
    const togglePaymentTypeActive = useTogglePaymentTypeActive();   // ⭐ ADD

    // ========== OPTIONS ==========
    const typeOptions = [
        { value: 'dues', label: 'Dues', color: 'blue', description: 'Regular membership dues' },
        { value: 'leavy', label: 'Levy', color: 'blue', description: 'Special contributions for specific events' },
        { value: 'registration', label: 'Registration', color: 'blue', description: 'One-time registration fee' },
        { value: 'monthly_dues', label: 'Monthly Dues', color: 'blue', description: 'Monthly subscription payments' },
        { value: 'wedding_dues', label: 'Wedding Dues', color: 'pink', description: 'Wedding celebration contributions' },
        { value: 'charity_dues', label: 'Charity Dues', color: 'black', description: 'Charitable donations' }
    ];

    const frequencyOptions = [
        { value: 'one-time', label: 'One Time' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' }
    ];

    const unitOptions = [
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
        { value: 'years', label: 'Years' }
    ];

    const duesTypes = ['dues', 'monthly_dues'];
    const otherTypes = ['leavy', 'registration', 'wedding_dues', 'charity_dues'];

    // ========== EFFECTS ==========
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 640);
            setIsTablet(width >= 640 && width < 1024);
            setIsDesktop(width >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ⭐ Derive the list directly from React Query — single source of truth
    const paymentTypesList = useMemo(() => {
        if (Array.isArray(paymentTypes)) return paymentTypes;
        if (paymentTypes?.data?.records) return paymentTypes.data.records;
        if (Array.isArray(paymentTypes?.data)) return paymentTypes.data;
        if (paymentTypes?.records) return paymentTypes.records;
        return [];
    }, [paymentTypes]);

    // ========== FILTER FUNCTIONS ==========
    const getFilteredPaymentTypes = () => {
        let filtered = [...paymentTypesList];

        if (activeTab === 'dues') {
            filtered = filtered.filter(p => duesTypes.includes(p.type));
        } else {
            filtered = filtered.filter(p => otherTypes.includes(p.type));
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term) ||
                p.type?.toLowerCase().includes(term)
            );
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(p => p.type === filterType);
        }

        if (filterMandatory === 'mandatory') {
            filtered = filtered.filter(p => p.is_mandatory === true);
        } else if (filterMandatory === 'optional') {
            filtered = filtered.filter(p => p.is_mandatory === false);
        }

        filtered.sort((a, b) => a.name?.localeCompare(b.name || '') || 0);
        return filtered;
    };

    const getUniqueTypes = () => {
        const types = new Set();
        paymentTypesList.forEach(p => {
            if (p.type) types.add(p.type);
        });
        return Array.from(types);
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

    const getCategoryLabel = (typeValue) => {
        const option = typeOptions.find(opt => opt.value === typeValue);
        return option?.label || typeValue || 'Dues';
    };

    const getFrequencyLabel = (frequency) => {
        const option = frequencyOptions.find(opt => opt.value === frequency);
        return option?.label || frequency || 'One Time';
    };

    const getTypeKey = (type) => type.id || type._id || Math.random().toString();

    const calculateMemberPays = (baseAmount) => {
        if (!baseAmount || baseAmount <= 0) return 0;
        let memberPays = baseAmount / 0.96;
        return Math.ceil(memberPays);
    };

    const calculatePenaltyPreview = (amount, penaltyType, penaltyValue) => {
        if (!penaltyValue || parseFloat(penaltyValue) <= 0) return 0;
        if (penaltyType === 'fixed') {
            return parseFloat(penaltyValue);
        } else {
            return (parseFloat(amount) * parseFloat(penaltyValue)) / 100;
        }
    };

    // ========== FORM HANDLERS ==========
    const resetForm = () => {
        setFormData({
            name: '',
            type: 'dues',
            description: '',
            amount: '',
            is_mandatory: false,
            frequency: 'one-time',
            duration_value: 1,
            duration_unit: 'months',
            late_penalty_enabled: false,
            late_penalty_type: 'fixed',
            late_penalty_value: '',
            late_penalty_days_after: 7,
            due_date_after: 30,
        });
        setEditingType(null);
    };

    const handleOpenModal = (type = null) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name || '',
                type: type.type || 'dues',
                description: type.description || '',
                amount: type.amount?.toString() || '',
                is_mandatory: type.is_mandatory || false,
                frequency: type.frequency || 'one-time',
                duration_value: type.duration_value || 1,
                duration_unit: type.duration_unit || 'months',
                late_penalty_enabled: type.late_penalty_enabled || false,
                late_penalty_type: type.late_penalty_type || 'fixed',
                late_penalty_value: type.late_penalty_value?.toString() || '',
                late_penalty_days_after: type.late_penalty_days_after || 7,
                due_date_after: type.due_date_after || 30,
            });
        } else {
            resetForm();
            if (activeTab === 'dues') {
                setFormData(prev => ({ ...prev, type: 'dues' }));
            } else {
                setFormData(prev => ({ ...prev, type: 'leavy' }));
            }
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ========== CRUD OPERATIONS ==========
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Payment type name is required');
            return;
        }

        if (!formData.type) {
            toast.error('Please select a category');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('Valid amount is required');
            return;
        }

        if (formData.frequency !== 'one-time') {
            if (!formData.duration_value || formData.duration_value < 1) {
                toast.error('Duration value is required for recurring payments');
                return;
            }
            if (!formData.duration_unit) {
                toast.error('Duration unit is required for recurring payments');
                return;
            }
        }

        if (formData.late_penalty_enabled) {
            if (!formData.late_penalty_value || parseFloat(formData.late_penalty_value) <= 0) {
                toast.error('Late penalty amount is required when enabled');
                return;
            }
            if (formData.late_penalty_type === 'percentage' && parseFloat(formData.late_penalty_value) > 100) {
                toast.error('Percentage penalty cannot exceed 100%');
                return;
            }
        }

        setLoading(true);
        try {
            const submitData = {
                name: formData.name,
                type: formData.type,
                description: formData.description || '',
                amount: parseFloat(formData.amount),
                is_mandatory: formData.is_mandatory,
                frequency: formData.frequency,
                late_penalty_enabled: formData.late_penalty_enabled,
                late_penalty_type: formData.late_penalty_type,
                late_penalty_value: formData.late_penalty_enabled ? parseFloat(formData.late_penalty_value) : null,
                late_penalty_days_after: formData.late_penalty_enabled ? parseInt(formData.late_penalty_days_after) : null,
                due_date_after: parseInt(formData.due_date_after),
            };

            if (formData.frequency !== 'one-time') {
                submitData.duration_value = parseInt(formData.duration_value);
                submitData.duration_unit = formData.duration_unit;
            }

            let result;
            if (editingType) {
                result = await updatePaymentType.mutateAsync({
                    id: editingType._id || editingType.id,
                    data: submitData
                });
                toast.success('Payment type updated successfully');
                handleCloseModal();
                // ⭐ Full reload after short delay so toast is seen
                setTimeout(() => window.location.reload(), 600);
            } else {
                result = await createPaymentType.mutateAsync(submitData);
                toast.success('Payment type created successfully');
                setNewlyCreatedType(result || submitData);
                handleCloseModal();
                setShowSuccessModal(true);
                // Don't reload immediately — let the success modal show first
                // The modal's close button will trigger the reload
            }

        } catch (error) {
            console.error('Error saving payment type:', error);
            toast.error(error.response?.data?.message || 'Failed to save payment type');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type) => {
        if (window.confirm(`Delete "${type.name}"? This will affect existing payments.`)) {
            try {
                await deletePaymentType.mutateAsync(type._id || type.id);
                // ⭐ Reload so the list reflects the deletion
                setTimeout(() => window.location.reload(), 600);
            } catch (error) {
                console.error('Error deleting payment type:', error);
                // ✅ Error toast is shown by the hook
            }
        }
    };
    const handleToggleActive = async (type) => {
        const willDeactivate = type.isActive !== false;

        const confirmMessage = willDeactivate
            ? `Deactivate "${type.name}"?\n\nMembers will no longer see or be able to pay this type. Existing payment history is kept.`
            : `Reactivate "${type.name}"?\n\nMembers will see and be able to pay this type again.`;

        if (!window.confirm(confirmMessage)) return;

        try {
            await togglePaymentTypeActive.mutateAsync({
                id: type._id || type.id,
                isActive: !willDeactivate,
            });
            toast.success(willDeactivate ? 'Payment type deactivated' : 'Payment type reactivated');
            // ⭐ Reload so the badge flips
            setTimeout(() => window.location.reload(), 600);
        } catch (error) {
            console.error('Toggle active error:', error);
            toast.error(error.response?.data?.message || 'Failed to change status');
        }
    };
    // const handleRefresh = async () => {
    //     setRefreshing(true);
    //     try {
    //         await refetchPaymentTypes();
    //         toast.success('Data refreshed successfully');
    //     } catch (error) {
    //         toast.error('Failed to refresh data');
    //     } finally {
    //         setRefreshing(false);
    //     }
    // };

    const handleRefresh = async () => {
        setRefreshing(true);
        toast.success('Refreshing data...');
        // ⭐ Full reload
        setTimeout(() => window.location.reload(), 400);
    };
    const handleBackToHome = () => {
        navigate('/admin-dashboard');
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        setNewlyCreatedType(null);
        // ⭐ Reload the page so the fresh list is fetched
        window.location.reload();
    };

    // ========== STATS ==========
    const getStats = () => {
        const filtered = paymentTypesList.filter(p => {
            if (activeTab === 'dues') {
                return duesTypes.includes(p.type);
            } else {
                return otherTypes.includes(p.type);
            }
        });
        const total = filtered.length;
        const mandatory = filtered.filter(p => p.is_mandatory).length;
        const optional = total - mandatory;
        const totalAmount = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
        const types = Array.from(new Set(filtered.map(p => p.type)));

        return { total, mandatory, optional, totalAmount, types };
    };

    const stats = getStats();
    const filteredTypes = getFilteredPaymentTypes();
    const uniqueTypes = getUniqueTypes();
    const duesCount = paymentTypesList.filter(p => duesTypes.includes(p.type)).length;
    const otherCount = paymentTypesList.filter(p => otherTypes.includes(p.type)).length;

    // ========== LOADING STATE ==========
    if (typesLoading && paymentTypesList.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // ========== RENDER ==========
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            {/* ============================================================
            HEADER - Responsive
            ============================================================ */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleBackToHome}
                            className="p-1.5 sm:p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <div>
                            <h1 className="font-bold text-base sm:text-lg md:text-2xl lg:text-3xl mb-0.5 sm:mb-1">
                                Contribution
                            </h1>
                            <p className="text-blue-100 text-[10px] sm:text-xs md:text-sm">
                                Manage payment types and dues
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-1.5 sm:p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                    >
                        <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <p className="text-blue-100 text-[8px] sm:text-xs">Total Types</p>
                            <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-200" />
                        </div>
                        <p className="font-bold text-sm sm:text-base">{stats.total}</p>
                        <p className="text-[8px] sm:text-xs text-blue-200 mt-0.5 sm:mt-1">{formatCurrency(stats.totalAmount)} total</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <p className="text-blue-100 text-[8px] sm:text-xs">Mandatory</p>
                            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-200" />
                        </div>
                        <p className="font-bold text-sm sm:text-base">{stats.mandatory}</p>
                        <p className="text-[8px] sm:text-xs text-blue-200 mt-0.5 sm:mt-1">Required payments</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <p className="text-blue-100 text-[8px] sm:text-xs">Optional</p>
                            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-200" />
                        </div>
                        <p className="font-bold text-sm sm:text-base">{stats.optional}</p>
                        <p className="text-[8px] sm:text-xs text-blue-200 mt-0.5 sm:mt-1">Voluntary payments</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <p className="text-blue-100 text-[8px] sm:text-xs">Categories</p>
                            <Layers className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-200" />
                        </div>
                        <p className="font-bold text-sm sm:text-base">{stats.types.length}</p>
                        <p className="text-[8px] sm:text-xs text-blue-200 mt-0.5 sm:mt-1">Different types</p>
                    </div>
                </div>
            </div>

            {/* ============================================================
            TABS - Responsive
            ============================================================ */}
            <div className="px-3 sm:px-4 mt-3 sm:mt-4">
                <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1 border border-gray-100">
                    <button
                        onClick={() => setActiveTab('dues')}
                        className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${activeTab === 'dues'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className=" xs:inline">Dues</span>
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white">
                            {duesCount}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('other')}
                        className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${activeTab === 'other'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className=" xs:inline">Other Payments</span>
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 text-white">
                            {otherCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* ============================================================
            CREATE BUTTON - Responsive
            ============================================================ */}
            <div className="px-3 sm:px-4 mt-3 sm:mt-4">
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full py-3 sm:py-4 rounded-2xl font-semibold transition-all shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Create {activeTab === 'dues' ? 'Dues' : 'Levy/Other Payment'}
                </button>
            </div>

            {/* ============================================================
            INFO BANNER - Responsive
            ============================================================ */}
            <div className="px-3 sm:px-4 mt-3 sm:mt-4">
                <div className="bg-blue-50 rounded-xl p-2.5 sm:p-3 border border-blue-200">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                        <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] sm:text-xs text-blue-800 font-medium">
                                {activeTab === 'dues' ? 'Dues Management' : 'Other Payments Management'}
                            </p>
                            <p className="text-[9px] sm:text-xs text-blue-700 mt-0.5">
                                {activeTab === 'dues'
                                    ? 'Dues are recurring mandatory payments. Set frequency and late penalties.'
                                    : 'Levy, Registration, Wedding Dues, and Charity Dues are one-time payments.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================
            SEARCH & FILTERS - Responsive
            ============================================================ */}
            <div className="px-3 sm:px-4 mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'dues' ? 'dues' : 'payments'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm outline-none transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-xl transition-all ${(filterType !== 'all' || filterMandatory !== 'all')
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Filters
                        {(filterType !== 'all' || filterMandatory !== 'all') && (
                            <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterMandatory('all');
                            toast.success('Filters cleared');
                        }}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Clear All
                    </button>

                    <span className="text-[10px] sm:text-xs text-gray-400 ml-auto">
                        {filteredTypes.length} type{filteredTypes.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {showFilters && (
                    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-lg">
                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-gray-700 block mb-1.5">Category</label>
                            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-xs rounded-lg transition-colors ${filterType === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                {uniqueTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-xs rounded-lg transition-colors capitalize ${filterType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {getCategoryLabel(type)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] sm:text-xs font-medium text-gray-700 block mb-1.5">Status</label>
                            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterMandatory('all')}
                                    className={`px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-xs rounded-lg transition-colors ${filterMandatory === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterMandatory('mandatory')}
                                    className={`px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-xs rounded-lg transition-colors ${filterMandatory === 'mandatory'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Mandatory
                                </button>
                                <button
                                    onClick={() => setFilterMandatory('optional')}
                                    className={`px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-xs rounded-lg transition-colors ${filterMandatory === 'optional'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Optional
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================
            PAYMENT TYPES LIST - Responsive
            ============================================================ */}
            <div className="px-3 sm:px-4 mt-3 sm:mt-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                            <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                            {activeTab === 'dues' ? 'Dues' : 'Payments'}
                            <span className="text-[10px] sm:text-xs text-gray-400 font-normal ml-0.5 sm:ml-1">
                                ({filteredTypes.length} records)
                            </span>
                        </h3>
                    </div>

                    {filteredTypes.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-3 sm:mb-4">
                                <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No {activeTab === 'dues' ? 'dues' : 'payments'} found</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {paymentTypesList.length === 0 ? 'Create your first payment type' : 'Try adjusting your search'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ============================================================
                            MOBILE CARD VIEW (< 640px)
                            ============================================================ */}
                            {isMobile && (
                                <div className="divide-y divide-gray-100">
                                    {filteredTypes.map((type) => {
                                        const locked = isPaymentTypeLocked(type);
                                        const inactive = type.isActive === false;

                                        return (
                                            <div key={getTypeKey(type)} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Badges row */}
                                                        <div className="flex items-center items-start justify-between gap-1.5 flex-wrap mb-1">
                                                            <div>
                                                                <h4 className="font-medium text-gray-800 text-sm truncate">
                                                                    {type.name}
                                                                </h4>
                                                                <span className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full capitalize">
                                                                    {getCategoryLabel(type.type)}
                                                                </span>
                                                                {type.is_mandatory && (
                                                                    <span className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                                        <Shield className="h-2.5 w-2.5" />
                                                                        Required
                                                                    </span>
                                                                )}
                                                                {locked && (
                                                                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                                                                        <Lock className="h-2.5 w-2.5" />
                                                                        Locked
                                                                    </span>
                                                                )}
                                                                {inactive && (
                                                                    <span className="text-[9px] bg-black-100 text-black-700 px-1.5 py-0.5 rounded-full font-medium">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                {/* Amount */}
                                                                <p className="text-base font-bold text-blue-900">
                                                                    {formatCurrency(type.amount)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Amount */}
                                                        {/* <p className="text-base font-bold text-blue-900">
                                                            {formatCurrency(type.amount)}
                                                        </p> */}

                                                        {/* Meta row */}
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 flex-wrap">
                                                            <span>{getFrequencyLabel(type.frequency)}</span>
                                                            {type.frequency !== 'one-time' && type.duration_value && (
                                                                <span>• Every {type.duration_value} {type.duration_unit}</span>
                                                            )}
                                                            {type.late_penalty_enabled && (
                                                                <span className="text-blue-500 font-medium">
                                                                    • Penalty: {type.late_penalty_type === 'fixed'
                                                                        ? formatCurrency(type.late_penalty_value)
                                                                        : `${type.late_penalty_value}%`
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
                                                        {/* View — always allowed */}
                                                        <button
                                                            onClick={() => setViewingType(type)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>

                                                        {/* Toggle Active — always allowed */}
                                                        <button
                                                            onClick={() => handleToggleActive(type)}
                                                            className={` rounded-lg transition-colors ${inactive
                                                                ? 'text-blue-600 hover:bg-blue-50'
                                                                : 'text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                            title={inactive ? 'Activate' : 'Deactivate'}
                                                        >
                                                            {inactive ? (
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <XCircle className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>

                                                        {/* Edit — disabled if locked */}
                                                        <button
                                                            onClick={() => {
                                                                if (locked) {
                                                                    toast.error('This payment type has member payments and cannot be edited.');
                                                                    return;
                                                                }
                                                                handleOpenModal(type);
                                                            }}
                                                            disabled={locked}
                                                            className={` rounded-lg transition-colors ${locked
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-blue-600 hover:bg-blue-50'
                                                                }`}
                                                            title={locked ? 'Locked — member payments exist' : 'Edit'}
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>

                                                        {/* Delete — disabled if locked */}
                                                        <button
                                                            onClick={() => {
                                                                if (locked) {
                                                                    toast.error('This payment type has member payments and cannot be deleted.');
                                                                    return;
                                                                }
                                                                handleDelete(type);
                                                            }}
                                                            disabled={locked}
                                                            className={` rounded-lg transition-colors ${locked
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-blue-600 hover:bg-blue-50'
                                                                }`}
                                                            title={locked ? 'Locked — member payments exist' : 'Delete'}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ============================================================
                            TABLET VIEW (640px - 1023px) - Compact Table
                            ============================================================ */}
                            {isTablet && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Org Receives</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Member Pays</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                                                <th className="px-3 py-2.5 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTypes.map((type) => {
                                                const locked = isPaymentTypeLocked(type);
                                                const inactive = type.isActive === false;

                                                return (
                                                    <tr key={getTypeKey(type)} className="hover:bg-gray-50">
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                <div className="text-xs font-medium text-gray-900">{type.name}</div>
                                                                {locked && (
                                                                    <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                                                                        <Lock className="h-2 w-2" />
                                                                        Locked
                                                                    </span>
                                                                )}
                                                                {inactive && (
                                                                    <span className="text-[8px] bg-black-100 text-black-700 px-1.5 py-0.5 rounded-full font-medium">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {type.description && (
                                                                <div className="text-[9px] text-gray-400 truncate max-w-[120px]">{type.description}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <span className="text-[10px] text-gray-600 capitalize">{getCategoryLabel(type.type)}</span>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="text-xs font-bold text-gray-900">{formatCurrency(type.amount)}</div>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="text-[10px] text-blue-600 font-medium">{formatCurrency(calculateMemberPays(type.amount))}</div>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="text-[10px] text-gray-600">
                                                                {getFrequencyLabel(type.frequency)}
                                                                {type.frequency !== 'one-time' && type.duration_value &&
                                                                    ` / ${type.duration_value} ${type.duration_unit}`
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            {type.late_penalty_enabled ? (
                                                                <div className="text-[9px]">
                                                                    <span className="text-blue-600 font-medium">
                                                                        {type.late_penalty_type === 'fixed'
                                                                            ? formatCurrency(type.late_penalty_value)
                                                                            : `${type.late_penalty_value}%`
                                                                        }
                                                                    </span>
                                                                    <span className="text-gray-400 block">
                                                                        After {type.late_penalty_days_after || 7}d
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[9px] text-gray-400">None</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end space-x-1">
                                                                {/* View */}
                                                                <button
                                                                    onClick={() => setViewingType(type)}
                                                                    className="p-1 text-blue-600 hover:text-blue-900"
                                                                    title="View"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </button>

                                                                {/* Toggle */}
                                                                <button
                                                                    onClick={() => handleToggleActive(type)}
                                                                    className={`p-1 ${inactive
                                                                        ? 'text-blue-600 hover:text-blue-800'
                                                                        : 'text-amber-600 hover:text-amber-800'
                                                                        }`}
                                                                    title={inactive ? 'Activate' : 'Deactivate'}
                                                                >
                                                                    {inactive ? (
                                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                                    ) : (
                                                                        <XCircle className="h-3.5 w-3.5" />
                                                                    )}
                                                                </button>

                                                                {/* Edit */}
                                                                <button
                                                                    onClick={() => {
                                                                        if (locked) {
                                                                            toast.error('This payment type has member payments and cannot be edited.');
                                                                            return;
                                                                        }
                                                                        handleOpenModal(type);
                                                                    }}
                                                                    disabled={locked}
                                                                    className={`p-1 ${locked
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'text-blue-600 hover:text-blue-900'
                                                                        }`}
                                                                    title={locked ? 'Locked — member payments exist' : 'Edit'}
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </button>

                                                                {/* Delete */}
                                                                <button
                                                                    onClick={() => {
                                                                        if (locked) {
                                                                            toast.error('This payment type has member payments and cannot be deleted.');
                                                                            return;
                                                                        }
                                                                        handleDelete(type);
                                                                    }}
                                                                    disabled={locked}
                                                                    className={`p-1 ${locked
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'text-blue-600 hover:text-blue-900'
                                                                        }`}
                                                                    title={locked ? 'Locked — member payments exist' : 'Delete'}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ============================================================
                            DESKTOP VIEW (>= 1024px) - Full Table
                            ============================================================ */}
                            {isDesktop && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Receives</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Pays</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTypes.map((type) => (
                                                <tr key={getTypeKey(type)} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                                        {type.description && (
                                                            <div className="text-xs text-gray-400 truncate max-w-xs">{type.description}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600 capitalize">{getCategoryLabel(type.type)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">{formatCurrency(type.amount)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-blue-600 font-medium">{formatCurrency(calculateMemberPays(type.amount))}</div>
                                                        <div className="text-xs text-gray-400">(incl. fees)</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600">
                                                            {getFrequencyLabel(type.frequency)}
                                                            {type.frequency !== 'one-time' && type.duration_value &&
                                                                ` / ${type.duration_value} ${type.duration_unit}`
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {type.late_penalty_enabled ? (
                                                            <div className="text-xs">
                                                                <span className="text-blue-600 font-medium">
                                                                    {type.late_penalty_type === 'fixed'
                                                                        ? formatCurrency(type.late_penalty_value)
                                                                        : `${type.late_penalty_value}%`
                                                                    }
                                                                </span>
                                                                <span className="text-gray-400 block">
                                                                    After {type.late_penalty_days_after || 7} days
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">None</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${type.is_mandatory ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {type.is_mandatory ? 'Mandatory' : 'Optional'}
                                                            </span>
                                                            {isPaymentTypeLocked(type) && (
                                                                <span
                                                                    className="px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800"
                                                                    title="This type has member payments and cannot be edited or deleted"
                                                                >
                                                                    <Lock className="h-3 w-3" />
                                                                    Locked
                                                                </span>
                                                            )}
                                                            {type.isActive === false && (
                                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-black-100 text-black-700">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {/* View — always allowed */}
                                                            <button
                                                                onClick={() => setViewingType(type)}
                                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                                title="View details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            {/* Deactivate / Activate toggle — ALWAYS allowed */}
                                                            <button
                                                                onClick={() => handleToggleActive(type)}
                                                                className={`p-1 ${type.isActive === false
                                                                    ? 'text-blue-600 hover:text-blue-800'
                                                                    : 'text-amber-600 hover:text-amber-800'
                                                                    }`}
                                                                title={type.isActive === false ? 'Activate' : 'Deactivate'}
                                                            >
                                                                {type.isActive === false ? (
                                                                    <CheckCircle className="h-4 w-4" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4" />
                                                                )}
                                                            </button>

                                                            {/* Edit — disabled if locked */}
                                                            <button
                                                                onClick={() => {
                                                                    if (isPaymentTypeLocked(type)) {
                                                                        toast.error('This payment type has member payments and cannot be edited.');
                                                                        return;
                                                                    }
                                                                    handleOpenModal(type);
                                                                }}
                                                                disabled={isPaymentTypeLocked(type)}
                                                                className={`p-1 transition-colors ${isPaymentTypeLocked(type)
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-blue-600 hover:text-blue-900'
                                                                    }`}
                                                                title={isPaymentTypeLocked(type) ? 'Locked — member payments exist' : 'Edit'}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>

                                                            {/* Delete — disabled if locked */}
                                                            <button
                                                                onClick={() => {
                                                                    if (isPaymentTypeLocked(type)) {
                                                                        toast.error('This payment type has member payments and cannot be deleted.');
                                                                        return;
                                                                    }
                                                                    handleDelete(type);
                                                                }}
                                                                disabled={isPaymentTypeLocked(type)}
                                                                className={`p-1 transition-colors ${isPaymentTypeLocked(type)
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-blue-600 hover:text-blue-900'
                                                                    }`}
                                                                title={isPaymentTypeLocked(type) ? 'Locked — member payments exist' : 'Delete'}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ============================================================
            HELP SECTION - Responsive
            ============================================================ */}
            <div className="px-3 sm:px-4 mt-3 sm:mt-4">
                <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-medium text-blue-800">
                                About {activeTab === 'dues' ? 'Dues' : 'Payments'}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5 sm:mt-1">
                                {activeTab === 'dues'
                                    ? 'Dues are recurring payments that auto-generate for members. Set late penalties to encourage timely payment.'
                                    : 'One-time payments like levies, registration fees, wedding dues, and charity contributions.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================
            CREATE/EDIT MODAL - Responsive
            ============================================================ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                                {editingType ? 'Edit' : 'Create'} {activeTab === 'dues' ? 'Dues' : 'Payment'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder={activeTab === 'dues' ? "e.g., Monthly Dues" : "e.g., Wedding Levy"}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                />
                            </div>

                            {/* Category/Type Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <div className="relative">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                                    >
                                        {(activeTab === 'dues' ? typeOptions.filter(o => duesTypes.includes(o.value)) : typeOptions.filter(o => otherTypes.includes(o.value))).map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Layers className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {typeOptions.find(opt => opt.value === formData.type)?.description}
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Optional description"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                />
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount Organization Receives (₦) *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                        ₦
                                    </div>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="100"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    This is the amount credited to your organization after fees.
                                </p>
                            </div>

                            {/* Member Pays Preview */}
                            {formData.amount && parseFloat(formData.amount) > 0 && (
                                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <Calculator className="h-3.5 w-3.5 text-blue-600" />
                                        <span className="text-xs font-medium text-blue-700">Member will pay:</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-700">
                                        {formatCurrency(calculateMemberPays(parseFloat(formData.amount)))}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-0.5">
                                        (Includes 2% Flutterwave + 2% platform fee)
                                    </p>
                                </div>
                            )}

                            {/* Due Date After Creation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date After Creation (Days)
                                    <span className="text-xs text-gray-400 ml-2">- When is payment due?</span>
                                </label>
                                <input
                                    type="number"
                                    name="due_date_after"
                                    value={formData.due_date_after}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="365"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Payment will be due {formData.due_date_after} days after creation
                                </p>
                            </div>

                            {/* Frequency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {frequencyOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                if (option.value !== 'one-time') {
                                                    const isDuesType = formData.type === 'dues' || formData.type === 'monthly_dues';
                                                    if (!isDuesType) {
                                                        toast.warning('Recurring payments are only available for Dues and Monthly Dues types.');
                                                        return;
                                                    }
                                                }
                                                setFormData(prev => ({
                                                    ...prev,
                                                    frequency: option.value,
                                                    duration_value: option.value === 'one-time' ? 1 : prev.duration_value,
                                                    duration_unit: option.value === 'one-time' ? 'months' : prev.duration_unit
                                                }));
                                            }}
                                            className={`py-2.5 rounded-xl font-medium text-sm transition-all ${formData.frequency === option.value
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                {(formData.type === 'dues' || formData.type === 'monthly_dues') ? (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formData.frequency === 'one-time' ? 'One-time payment' : 'Recurring - auto-generates for members'}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">
                                        One-time only (recurring only for Dues types)
                                    </p>
                                )}
                            </div>

                            {/* Recurring Schedule */}
                            {formData.frequency !== 'one-time' && (
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-medium text-blue-700">Recurring Schedule</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Every</label>
                                            <input
                                                type="number"
                                                name="duration_value"
                                                value={formData.duration_value}
                                                onChange={handleInputChange}
                                                min="1"
                                                step="1"
                                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                            <select
                                                name="duration_unit"
                                                value={formData.duration_unit}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                                            >
                                                {unitOptions.map(unit => (
                                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600">
                                        Members will be charged every {formData.duration_value || 1} {formData.duration_unit || 'months'}
                                    </p>
                                </div>
                            )}

                            {/* ============================================================
                            LATE PAYMENT PENALTY SECTION - Dues Only
                            ============================================================ */}

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="checkbox"
                                        name="late_penalty_enabled"
                                        id="late_penalty_enabled"
                                        checked={formData.late_penalty_enabled}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="late_penalty_enabled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Gavel className="h-4 w-4 text-blue-500" />
                                        Enable Late Payment Penalty
                                    </label>
                                </div>

                                {formData.late_penalty_enabled && (
                                    <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-200">
                                        <p className="text-xs font-medium text-blue-700">Late Payment Penalty Settings</p>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Type</label>
                                                <select
                                                    name="late_penalty_type"
                                                    value={formData.late_penalty_type}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                                                >
                                                    <option value="fixed">Fixed Amount</option>
                                                    <option value="percentage">Percentage of Amount</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {formData.late_penalty_type === 'fixed' ? 'Penalty Amount (₦)' : 'Penalty Percentage (%)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="late_penalty_value"
                                                    value={formData.late_penalty_value}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    step={formData.late_penalty_type === 'fixed' ? '100' : '1'}
                                                    placeholder={formData.late_penalty_type === 'fixed' ? '0.00' : '0'}
                                                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Apply Penalty After (Days)
                                                <span className="text-xs text-gray-400 ml-2">- Days after due date</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="late_penalty_days_after"
                                                value={formData.late_penalty_days_after}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="365"
                                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                            <p className="text-xs text-blue-600 mt-1">
                                                Penalty will apply {formData.late_penalty_days_after} days after the due date
                                            </p>
                                        </div>

                                        {/* Penalty Preview */}
                                        {formData.amount && parseFloat(formData.amount) > 0 && formData.late_penalty_value && (
                                            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                                <p className="text-xs text-blue-700">
                                                    Penalty Preview:
                                                    <strong>
                                                        {formData.late_penalty_type === 'fixed'
                                                            ? ` ${formatCurrency(parseFloat(formData.late_penalty_value))}`
                                                            : ` ${parseFloat(formData.late_penalty_value)}% (${formatCurrency(calculatePenaltyPreview(formData.amount, formData.late_penalty_type, formData.late_penalty_value) || 0)})`
                                                        }
                                                    </strong>
                                                </p>
                                                <p className="text-xs text-blue-500 mt-0.5">
                                                    Total with penalty: {formatCurrency(
                                                        parseFloat(formData.amount) + (calculatePenaltyPreview(formData.amount, formData.late_penalty_type, formData.late_penalty_value) || 0)
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>


                            {/* Mandatory Checkbox */}
                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    name="is_mandatory"
                                    id="is_mandatory"
                                    checked={formData.is_mandatory}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_mandatory" className="text-sm text-gray-700">
                                    Mandatory Payment
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || createPaymentType.isLoading || updatePaymentType.isLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center text-sm"
                                >
                                    {(loading || createPaymentType.isLoading || updatePaymentType.isLoading) ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {editingType ? 'Update' : 'Create'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewingType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Payment Type Details</h3>
                            <button onClick={() => setViewingType(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl p-4 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                                    <Tag className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">{viewingType.name}</h4>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(viewingType.amount)}</p>
                                <p className="text-xs text-gray-500 mt-1">Organization receives this amount</p>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-3">
                                <div className="flex items-center gap-1 mb-1.5">
                                    <Calculator className="h-3.5 w-3.5 text-blue-600" />
                                    <p className="text-xs font-medium text-blue-700">Member will pay:</p>
                                </div>
                                <p className="text-lg font-bold text-blue-700">
                                    {formatCurrency(calculateMemberPays(viewingType.amount))}
                                </p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    (Includes 2% Flutterwave + 2% platform fee)
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Category</span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                        {getCategoryLabel(viewingType.type)}
                                    </span>
                                </div>

                                {viewingType.description && (
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-500 mb-1">Description</p>
                                        <p className="text-sm text-gray-700">{viewingType.description}</p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Frequency</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {getFrequencyLabel(viewingType.frequency)}
                                    </span>
                                </div>

                                {viewingType.frequency !== 'one-time' && viewingType.duration_value && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-500">Schedule</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            Every {viewingType.duration_value} {viewingType.duration_unit}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Late Payment Penalty</span>
                                    <span className="text-sm font-medium">
                                        {viewingType.late_penalty_enabled ? (
                                            <span className="text-blue-600">
                                                {viewingType.late_penalty_type === 'fixed'
                                                    ? formatCurrency(viewingType.late_penalty_value)
                                                    : `${viewingType.late_penalty_value}%`
                                                }
                                                <span className="text-xs text-gray-400 block">
                                                    After {viewingType.late_penalty_days_after || 7} days
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">None</span>
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${viewingType.is_mandatory ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {viewingType.is_mandatory ? 'Mandatory' : 'Optional'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => {
                                    if (isPaymentTypeLocked(viewingType)) {
                                        toast.error('This payment type has member payments and cannot be edited.');
                                        return;
                                    }
                                    setViewingType(null);
                                    handleOpenModal(viewingType);
                                }}
                                disabled={isPaymentTypeLocked(viewingType)}
                                className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm ${isPaymentTypeLocked(viewingType)
                                    ? 'border border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => setViewingType(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && newlyCreatedType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
                        <div className="bg-gradient-to-r from-blue-500 to-emerald-600 rounded-t-2xl p-6 text-center text-white">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Payment Type Created!</h3>
                            <p className="text-blue-100 text-sm mt-1">
                                {newlyCreatedType.name} is now available
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm font-semibold text-blue-800">What happens next?</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-blue-700">
                                            <strong>Members can now make payments</strong> - This payment type will appear in the "Make a Payment" section.
                                        </p>
                                    </div>
                                    {newlyCreatedType.late_penalty_enabled && (
                                        <div className="flex items-start gap-2">
                                            <Gavel className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-blue-700">
                                                <strong>Late penalty enabled</strong> - {newlyCreatedType.late_penalty_type === 'fixed'
                                                    ? formatCurrency(newlyCreatedType.late_penalty_value)
                                                    : `${newlyCreatedType.late_penalty_value}%`
                                                } penalty after {newlyCreatedType.late_penalty_days_after || 7} days.
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-blue-700">
                                            <strong>Amount: {formatCurrency(newlyCreatedType.amount)}</strong> - Organization receives this amount.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseSuccessModal}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-emerald-700 transition-colors text-sm"
                                >
                                    Got it
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
                @media (min-width: 480px) {
                    .xs\\:inline {
                        display: inline !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentTypeManagementPage;
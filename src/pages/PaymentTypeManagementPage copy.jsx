import { useState, useEffect } from 'react';
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
    Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { usePaymentTypes, useCreatePaymentType, useUpdatePaymentType, useDeletePaymentType } from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Payment Type Management Page - Admin Only
 * Full CRUD operations for Contribution
 */
const PaymentTypeManagementPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // ========== STATE ==========
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterMandatory, setFilterMandatory] = useState('all');

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
        duration_unit: 'months'
    });

    const [loading, setLoading] = useState(false);
    const [paymentTypesList, setPaymentTypesList] = useState([]);

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

    // ========== OPTIONS ==========
    const typeOptions = [
        { value: 'dues', label: 'Dues', color: 'blue', description: 'Regular membership dues' },
        { value: 'leavy', label: 'Levy', color: 'purple', description: 'Special contributions for specific events' },
        { value: 'registration', label: 'Registration', color: 'green', description: 'One-time registration fee' },
        { value: 'monthly_dues', label: 'Monthly Dues', color: 'indigo', description: 'Monthly subscription payments' },
        { value: 'wedding_dues', label: 'Wedding Dues', color: 'pink', description: 'Wedding celebration contributions' },
        { value: 'charity_dues', label: 'Charity Dues', color: 'orange', description: 'Charitable donations' }
    ];

    const frequencyOptions = [
        { value: 'one-time', label: 'One Time' },
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

    // ========== EFFECTS ==========
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (Array.isArray(paymentTypes)) {
            setPaymentTypesList(paymentTypes);
        } else if (paymentTypes?.data?.records && Array.isArray(paymentTypes.data.records)) {
            setPaymentTypesList(paymentTypes.data.records);
        } else if (paymentTypes?.data && Array.isArray(paymentTypes.data)) {
            setPaymentTypesList(paymentTypes.data);
        } else if (paymentTypes?.records && Array.isArray(paymentTypes.records)) {
            setPaymentTypesList(paymentTypes.records);
        } else {
            setPaymentTypesList([]);
        }
    }, [paymentTypes]);

    // ========== FILTER FUNCTIONS ==========
    const getFilteredPaymentTypes = () => {
        let filtered = [...paymentTypesList];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term) ||
                p.type?.toLowerCase().includes(term)
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(p => p.type === filterType);
        }

        // Mandatory filter
        if (filterMandatory === 'mandatory') {
            filtered = filtered.filter(p => p.is_mandatory === true);
        } else if (filterMandatory === 'optional') {
            filtered = filtered.filter(p => p.is_mandatory === false);
        }

        // Sort by name
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

    const getTypeId = (type) => type.id || type._id;
    const getTypeKey = (type) => type.id || type._id || Math.random().toString();

    // Calculate what member pays including fees
    const calculateMemberPays = (baseAmount) => {
        if (!baseAmount || baseAmount <= 0) return 0;
        let memberPays = baseAmount / 0.96;
        return Math.ceil(memberPays);
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
            duration_unit: 'months'
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
                duration_unit: type.duration_unit || 'months'
            });
        } else {
            resetForm();
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

        setLoading(true);
        try {
            const submitData = {
                name: formData.name,
                type: formData.type,
                description: formData.description || '',
                amount: parseFloat(formData.amount),
                is_mandatory: formData.is_mandatory,
                frequency: formData.frequency
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
                await refetchPaymentTypes();
            } else {
                result = await createPaymentType.mutateAsync(submitData);
                toast.success('Payment type created successfully');

                // Store the newly created type for the success modal
                setNewlyCreatedType(result || submitData);
                setShowSuccessModal(true);
                handleCloseModal();
                await refetchPaymentTypes();
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
                toast.success('Payment type deleted successfully');
                await refetchPaymentTypes();
            } catch (error) {
                console.error('Error deleting payment type:', error);
                toast.error('Failed to delete payment type');
            }
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refetchPaymentTypes();
            toast.success('Contribution refreshed successfully');
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    };

    const handleBackToHome = () => {
        navigate('/admin-dashboard');
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        setNewlyCreatedType(null);
    };

    // ========== STATS ==========
    const getStats = () => {
        const total = paymentTypesList.length;
        const mandatory = paymentTypesList.filter(p => p.is_mandatory).length;
        const optional = total - mandatory;
        const totalAmount = paymentTypesList.reduce((sum, p) => sum + (p.amount || 0), 0);
        const types = getUniqueTypes();

        return { total, mandatory, optional, totalAmount, types };
    };

    const stats = getStats();
    const filteredTypes = getFilteredPaymentTypes();
    const uniqueTypes = getUniqueTypes();

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

            {/* Header with Gradient Background */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
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
                                Contribution
                            </h1>
                            <p className={`text-purple-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                Set the amount your organization receives. Members will pay applicable fees on top.
                            </p>
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

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-purple-100 text-xs">Total Types</p>
                            <Tag className="h-3 w-3 text-purple-200" />
                        </div>
                        <p className="font-bold text-base">{stats.total}</p>
                        <p className="text-xs text-purple-200 mt-1">{formatCurrency(stats.totalAmount)} total</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-purple-100 text-xs">Mandatory</p>
                            <Shield className="h-3 w-3 text-purple-200" />
                        </div>
                        <p className="font-bold text-base">{stats.mandatory}</p>
                        <p className="text-xs text-purple-200 mt-1">Required payments</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-purple-100 text-xs">Optional</p>
                            <Users className="h-3 w-3 text-purple-200" />
                        </div>
                        <p className="font-bold text-base">{stats.optional}</p>
                        <p className="text-xs text-purple-200 mt-1">Voluntary payments</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-purple-100 text-xs">Categories</p>
                            <Layers className="h-3 w-3 text-purple-200" />
                        </div>
                        <p className="font-bold text-base">{stats.types.length}</p>
                        <p className="text-xs text-purple-200 mt-1">Different types</p>
                    </div>
                </div>
            </div>

            {/* Create Button */}
            <div className="px-4 mt-4">
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full py-4 rounded-2xl font-semibold transition-all shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Create New Payment
                </button>
            </div>

            {/* Info Banner - Updated for Flutterwave fees */}
            <div className="px-4 mt-4">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-blue-800 font-medium">How it works</p>
                            <p className="text-xs text-blue-700 mt-0.5">
                                You set the amount your organization should receive. When members pay, <strong>Flutterwave (2%)</strong> and <strong>platform (4%)</strong> fees are added automatically.
                                The member pays the total amount, and your organization receives the exact amount you set.
                            </p>
                        </div>
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
                        placeholder="Search Contribution by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm outline-none transition-all"
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
                        className={`flex items-center gap-1 px-3 py-2 text-xs rounded-xl transition-all ${(filterType !== 'all' || filterMandatory !== 'all')
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="h-3 w-3" />
                        Filters
                        {(filterType !== 'all' || filterMandatory !== 'all') && (
                            <span className="ml-1 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterMandatory('all');
                            toast.success('Filters cleared');
                        }}
                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Clear All
                    </button>

                    <span className="text-xs text-gray-400 ml-auto">
                        {filteredTypes.length} type{filteredTypes.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-lg">
                        {/* Type Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Category</label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterType === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                {uniqueTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors capitalize ${filterType === type
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {getCategoryLabel(type)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mandatory Filter */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">Status</label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterMandatory('all')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterMandatory === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterMandatory('mandatory')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterMandatory === 'mandatory'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Mandatory
                                </button>
                                <button
                                    onClick={() => setFilterMandatory('optional')}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterMandatory === 'optional'
                                        ? 'bg-green-600 text-white'
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

            {/* Contribution List */}
            <div className="px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <Tag className="h-4 w-4 text-purple-600" />
                            All Contribution
                            <span className="text-xs text-gray-400 font-normal ml-1">
                                ({filteredTypes.length} records)
                            </span>
                        </h3>
                    </div>

                    {filteredTypes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Tag className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No Contribution found</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {paymentTypesList.length === 0 ? 'Create your first payment type' : 'Try adjusting your search'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            {isMobile ? (
                                <div className="divide-y divide-gray-100">
                                    {filteredTypes.map((type) => (
                                        <div key={getTypeKey(type)} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h4 className="font-medium text-gray-800 text-sm">
                                                            {type.name}
                                                        </h4>
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                                                            {getCategoryLabel(type.type)}
                                                        </span>
                                                        {type.is_mandatory && (
                                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Shield className="h-3 w-3" />
                                                                Required
                                                            </span>
                                                        )}
                                                        {type.frequency === 'monthly' && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Monthly
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(type.amount)}
                                                    </p>
                                                    <p className="text-xs text-green-600">
                                                        Member pays: {formatCurrency(calculateMemberPays(type.amount))}
                                                    </p>

                                                    {type.description && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {type.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                        <span>{getFrequencyLabel(type.frequency)}</span>
                                                        {type.frequency !== 'one-time' && type.duration_value && (
                                                            <span>Every {type.duration_value} {type.duration_unit}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 ml-2">
                                                    <button
                                                        onClick={() => setViewingType(type)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(type)}
                                                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Edit payment type"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(type)}
                                                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete payment type"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Desktop Table View */
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Receives</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Pays</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
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
                                                        <div className="text-sm text-green-600 font-medium">{formatCurrency(calculateMemberPays(type.amount))}</div>
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
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${type.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {type.is_mandatory ? 'Mandatory' : 'Optional'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => setViewingType(type)}
                                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                                title="View details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenModal(type)}
                                                                className="text-green-600 hover:text-green-900 p-1"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(type)}
                                                                className="text-red-600 hover:text-red-900 p-1"
                                                                title="Delete"
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

            {/* Help Section */}
            <div className="px-4 mt-4">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Info className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-purple-800">About Contribution</h3>
                            <p className="text-xs text-purple-700 mt-1">
                                Contribution define the categories of payments members can make.
                                <span className="font-medium"> Mandatory</span> payments are required for all members.
                                <span className="font-medium"> Monthly</span> payments recur every month.
                                Members will see these as available payment options.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {editingType ? 'Edit Payment Type' : 'Create Payment Type'}
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
                                    placeholder="e.g., Monthly Dues, Wedding Levy"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                                    >
                                        {typeOptions.map(option => (
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
                                    rows="3"
                                    placeholder="Optional description"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Amount Input - This is what organization receives */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount Organization Receives (₦) *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
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
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    This is the amount that will be credited to your organization after all fees.
                                    Members will pay additional fees on top.
                                </p>
                            </div>

                            {/* What Member Will Pay Preview */}
                            {formData.amount && parseFloat(formData.amount) > 0 && (
                                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                                    <div className="flex items-center gap-1 mb-2">
                                        <Calculator className="h-3 w-3 text-green-600" />
                                        <span className="text-xs font-medium text-green-700">Member will pay:</span>
                                    </div>
                                    <p className="text-lg font-bold text-green-700">
                                        {formatCurrency(calculateMemberPays(parseFloat(formData.amount)))}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        (Includes 2% Flutterwave fee + 4% platform fee)
                                    </p>
                                </div>
                            )}

                            {/* Frequency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {frequencyOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    frequency: option.value,
                                                    duration_value: option.value === 'one-time' ? 1 : prev.duration_value,
                                                    duration_unit: option.value === 'one-time' ? 'months' : prev.duration_unit
                                                }));
                                            }}
                                            className={`py-2.5 rounded-xl font-medium text-sm transition-all ${formData.frequency === option.value
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recurring Schedule */}
                            {formData.frequency !== 'one-time' && (
                                <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-medium text-purple-700">Recurring Schedule</p>
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
                                                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                            <select
                                                name="duration_unit"
                                                value={formData.duration_unit}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                                            >
                                                {unitOptions.map(unit => (
                                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-xs text-purple-600">
                                        Members will be charged every {formData.duration_value || 1} {formData.duration_unit || 'months'}
                                    </p>
                                </div>
                            )}

                            {/* Mandatory Checkbox */}
                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    name="is_mandatory"
                                    id="is_mandatory"
                                    checked={formData.is_mandatory}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || createPaymentType.isLoading || updatePaymentType.isLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
                        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 text-lg">Payment Type Details</h3>
                            <button onClick={() => setViewingType(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                                    <Tag className="h-6 w-6 text-purple-600" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">{viewingType.name}</h4>
                                <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(viewingType.amount)}</p>
                                <p className="text-xs text-gray-500 mt-1">Organization receives this amount</p>
                            </div>

                            {/* What Member Pays */}
                            <div className="bg-green-50 rounded-xl p-3">
                                <div className="flex items-center gap-1 mb-2">
                                    <Calculator className="h-3 w-3 text-green-600" />
                                    <p className="text-xs font-medium text-green-700">Member will pay:</p>
                                </div>
                                <p className="text-lg font-bold text-green-700">
                                    {formatCurrency(calculateMemberPays(viewingType.amount))}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    (Includes 2% Flutterwave fee + 4% platform fee)
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

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${viewingType.is_mandatory ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {viewingType.is_mandatory ? 'Mandatory' : 'Optional'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => {
                                    setViewingType(null);
                                    handleOpenModal(viewingType);
                                }}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => setViewingType(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && newlyCreatedType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
                    <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md animate-slide-up">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-center text-white">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Payment Type Created!</h3>
                            <p className="text-green-100 text-sm mt-1">
                                {newlyCreatedType.name} is now available
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-green-600" />
                                    <p className="text-sm font-semibold text-green-800">What happens next?</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-green-700">
                                            <strong>Members can now make payments</strong> - This payment type will appear in the "Make a Payment" section for all members.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-green-700">
                                            <strong>Amount: {formatCurrency(newlyCreatedType.amount)}</strong> - Your organization will receive this amount. Members will pay additional fees on top (2% Flutterwave + 4% platform).
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-green-700">
                                            <strong>Payment type is {newlyCreatedType.is_mandatory ? 'mandatory' : 'optional'}</strong> - {newlyCreatedType.is_mandatory ? 'Members are required to pay this.' : 'Members can choose to pay this voluntarily.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseSuccessModal}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-colors"
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
      `}</style>
        </div>
    );
};

export default PaymentTypeManagementPage;
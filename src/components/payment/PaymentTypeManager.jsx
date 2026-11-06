// src/components/payment/PaymentTypeManager.jsx
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Eye, X, Save, Tag, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, ChevronRight, Layers, Calculator, TrendingUp, TrendingDown, Wallet, Info, Users, CalendarDays, Gavel, CreditCard, FileText, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// NEW: Payment Type Form Component (Reusable)
// ============================================================
const PaymentTypeForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  isDues = true
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: isDues ? 'dues' : 'leavy',
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

  const duesTypeOptions = [
    { value: 'dues', label: 'Dues', description: 'Regular membership dues' },
    { value: 'monthly_dues', label: 'Monthly Dues', description: 'Monthly subscription payments' },
  ];

  const otherTypeOptions = [
    { value: 'leavy', label: 'Levy', description: 'Special contributions for specific events' },
    { value: 'registration', label: 'Registration', description: 'One-time registration fee' },
    { value: 'wedding_dues', label: 'Wedding Dues', description: 'Wedding celebration contributions' },
    { value: 'charity_dues', label: 'Charity Dues', description: 'Charitable donations' },
  ];

  const typeOptions = isDues ? duesTypeOptions : otherTypeOptions;

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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || (isDues ? 'dues' : 'leavy'),
        description: initialData.description || '',
        amount: initialData.amount?.toString() || '',
        is_mandatory: initialData.is_mandatory || false,
        frequency: initialData.frequency || 'one-time',
        duration_value: initialData.duration_value || 1,
        duration_unit: initialData.duration_unit || 'months',
        late_penalty_enabled: initialData.late_penalty_enabled || false,
        late_penalty_type: initialData.late_penalty_type || 'fixed',
        late_penalty_value: initialData.late_penalty_value?.toString() || '',
        late_penalty_days_after: initialData.late_penalty_days_after || 7,
        due_date_after: initialData.due_date_after || 30,
      });
    }
  }, [initialData, isDues]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
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

    // ============================================================
    // FIX: Validate recurring fields properly
    // ============================================================
    if (formData.frequency !== 'one-time') {
      if (!formData.duration_value || parseInt(formData.duration_value) < 1) {
        toast.error('Duration value is required for recurring payments');
        return;
      }
      if (!formData.duration_unit) {
        toast.error('Duration unit is required for recurring payments');
        return;
      }
    }

    // Validate late penalty
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

    // ============================================================
    // CRITICAL FIX: Build submitData with ALL fields
    // ============================================================
    const submitData = {
      name: formData.name,
      type: formData.type,
      description: formData.description || '',
      amount: parseFloat(formData.amount),
      is_mandatory: formData.is_mandatory,
      frequency: formData.frequency,
      // ALWAYS include duration fields (backend validates based on frequency)
      duration_value: parseInt(formData.duration_value) || 1,
      duration_unit: formData.duration_unit || 'months',
      late_penalty_enabled: formData.late_penalty_enabled,
      late_penalty_type: formData.late_penalty_type,
      late_penalty_value: formData.late_penalty_enabled ? parseFloat(formData.late_penalty_value) : null,
      late_penalty_days_after: formData.late_penalty_enabled ? parseInt(formData.late_penalty_days_after) : null,
      due_date_after: parseInt(formData.due_date_after) || 30,
    };

    // ============================================================
    // DEBUG: Log the data being sent
    // ============================================================

    onSubmit(submitData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateMemberPays = (baseAmount) => {
    if (!baseAmount || baseAmount <= 0) return 0;
    let memberPays = baseAmount / 0.96;
    return Math.ceil(memberPays);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={isDues ? "e.g., Monthly Dues" : "e.g., Wedding Levy"}
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
          rows="2"
          placeholder="Optional description"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount Organization Receives (â‚¦) *
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
            â‚¦
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
          This is the amount credited to your organization after fees.
        </p>
      </div>

      {/* Member Pays Preview */}
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
            (Includes 2% Flutterwave + 2% platform fee)
          </p>
        </div>
      )}

      {/* Due Date Setting */}
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
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                ? 'bg-purple-600 text-white shadow-md'
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

      {/* Late Payment Penalty Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            name="late_penalty_enabled"
            id="late_penalty_enabled"
            checked={formData.late_penalty_enabled}
            onChange={handleInputChange}
            className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="late_penalty_enabled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Gavel className="h-4 w-4 text-red-500" />
            Enable Late Payment Penalty
          </label>
        </div>

        {formData.late_penalty_enabled && (
          <div className="bg-red-50 rounded-xl p-4 space-y-3 border border-red-200">
            <p className="text-xs font-medium text-red-700">Late Payment Penalty Settings</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Type</label>
                <select
                  name="late_penalty_type"
                  value={formData.late_penalty_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage of Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.late_penalty_type === 'fixed' ? 'Penalty Amount (â‚¦)' : 'Penalty Percentage (%)'}
                </label>
                <input
                  type="number"
                  name="late_penalty_value"
                  value={formData.late_penalty_value}
                  onChange={handleInputChange}
                  min="0"
                  step={formData.late_penalty_type === 'fixed' ? '100' : '1'}
                  placeholder={formData.late_penalty_type === 'fixed' ? '0.00' : '0'}
                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-red-600 mt-1">
                Penalty will apply {formData.late_penalty_days_after} days after the due date
              </p>
            </div>

            {formData.amount && parseFloat(formData.amount) > 0 && formData.late_penalty_value && (
              <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-red-700">
                  Penalty Preview:
                  <strong>
                    {formData.late_penalty_type === 'fixed'
                      ? ` ${formatCurrency(parseFloat(formData.late_penalty_value))}`
                      : ` ${parseFloat(formData.late_penalty_value)}% (${formatCurrency((parseFloat(formData.amount) * parseFloat(formData.late_penalty_value)) / 100)})`
                    }
                  </strong>
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                  Total with penalty: {formatCurrency(
                    parseFloat(formData.amount) +
                    (formData.late_penalty_type === 'fixed'
                      ? parseFloat(formData.late_penalty_value)
                      : (parseFloat(formData.amount) * parseFloat(formData.late_penalty_value)) / 100
                    )
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
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {initialData ? 'Update' : 'Create'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// ============================================================
// MAIN PAYMENT TYPE MANAGER COMPONENT
// ============================================================
const PaymentTypeManager = ({ paymentTypes = [], onCreate, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [viewingType, setViewingType] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newlyCreatedType, setNewlyCreatedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentTypesList, setPaymentTypesList] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [activeTab, setActiveTab] = useState('dues');
  const [isDuesForm, setIsDuesForm] = useState(true);

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

  const duesTypes = ['dues', 'monthly_dues'];
  const otherTypes = ['leavy', 'registration', 'wedding_dues', 'charity_dues'];

  const filteredTypes = paymentTypesList.filter(type => {
    if (activeTab === 'dues') {
      return duesTypes.includes(type.type);
    } else {
      return otherTypes.includes(type.type);
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getCategoryLabel = (typeValue) => {
    const labels = {
      dues: 'Dues',
      monthly_dues: 'Monthly Dues',
      leavy: 'Levy',
      registration: 'Registration',
      wedding_dues: 'Wedding Dues',
      charity_dues: 'Charity Dues'
    };
    return labels[typeValue] || typeValue || 'Dues';
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'one-time': 'One Time',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency || 'One Time';
  };

  const getTypeKey = (type) => type.id || type._id || Math.random().toString();

  const calculateMemberPays = (baseAmount) => {
    if (!baseAmount || baseAmount <= 0) return 0;
    let memberPays = baseAmount / 0.96;
    return Math.ceil(memberPays);
  };

  const handleOpenModal = (type = null, isDues = true) => {
    setIsDuesForm(isDues);
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setNewlyCreatedType(null);
  };

  const handleSubmit = async (submitData) => {
    setLoading(true);
    try {
      // â† DEBUG LOG

      let result;
      if (editingType) {
        result = await onUpdate(editingType._id || editingType.id, submitData);
        toast.success('Payment type updated successfully');
        handleCloseModal();
      } else {
        result = await onCreate(submitData);
        toast.success('Payment type created successfully');
        setNewlyCreatedType(result || submitData);
        setShowSuccessModal(true);
        handleCloseModal();
      }
    } catch (error) {
      console.error('âŒ Error saving payment type:', error);
      console.error('âŒ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save payment type');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type) => {
    if (window.confirm(`Delete "${type.name}"? This will affect existing payments.`)) {
      try {
        await onDelete(type._id || type.id);
        toast.success('Payment type deleted successfully');
      } catch (error) {
        console.error('Error deleting payment type:', error);
        toast.error('Failed to delete payment type');
      }
    }
  };

  const getStats = (types) => {
    const total = types.length;
    const mandatory = types.filter(t => t.is_mandatory).length;
    const optional = total - mandatory;
    const totalAmount = types.reduce((sum, t) => sum + (t.amount || 0), 0);
    return { total, mandatory, optional, totalAmount };
  };

  const stats = getStats(filteredTypes);
  const duesCount = paymentTypesList.filter(t => duesTypes.includes(t.type)).length;
  const otherCount = paymentTypesList.filter(t => otherTypes.includes(t.type)).length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1 border border-gray-100">
        <button
          onClick={() => setActiveTab('dues')}
          className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'dues'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Tag className="h-4 w-4" />
          Dues
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'dues'
            ? 'bg-white/20 text-white'
            : 'bg-gray-200 text-gray-600'
            }`}>
            {duesCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'other'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Layers className="h-4 w-4" />
          Other Payments
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'other'
            ? 'bg-white/20 text-white'
            : 'bg-gray-200 text-gray-600'
            }`}>
            {otherCount}
          </span>
        </button>
      </div>

      {/* Create Button */}
      <button
        onClick={() => handleOpenModal(null, activeTab === 'dues')}
        className="w-full py-3 rounded-xl font-medium transition-all shadow-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="h-4 w-4" />
        Create {activeTab === 'dues' ? 'Dues' : 'Payment'}
      </button>

      {/* Stats Summary */}
      {filteredTypes.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <p className="text-xs text-gray-500 mb-1">Total {activeTab === 'dues' ? 'Dues' : 'Payments'}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <p className="text-xs text-gray-500 mb-1">Mandatory</p>
            <p className="text-2xl font-bold text-red-600">{stats.mandatory}</p>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-blue-800 font-medium">
              {activeTab === 'dues' ? 'Dues Management' : 'Other Payments Management'}
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {activeTab === 'dues'
                ? 'Dues are recurring mandatory payments. Set frequency and late penalties.'
                : 'Levy, Registration, Wedding Dues, and Charity Dues are one-time payments.'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Types List */}
      {filteredTypes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            {activeTab === 'dues' ? (
              <Tag className="h-8 w-8 text-gray-400" />
            ) : (
              <Layers className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <p className="text-gray-500 text-sm">
            No {activeTab === 'dues' ? 'dues' : 'payment'} types created yet
          </p>
          <button
            onClick={() => handleOpenModal(null, activeTab === 'dues')}
            className="mt-4 text-purple-600 text-sm font-medium inline-flex items-center gap-1 hover:text-purple-700"
          >
            <Plus className="h-4 w-4" />
            Create your first {activeTab === 'dues' ? 'dues' : 'payment'} type
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                      {type.late_penalty_enabled ? (
                        <div className="text-xs">
                          <span className="text-red-600 font-medium">
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
                          onClick={() => handleOpenModal(type, duesTypes.includes(type.type))}
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
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-lg">
                {editingType ? 'Edit' : 'Create'} {isDuesForm ? 'Dues' : 'Payment'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <PaymentTypeForm
              initialData={editingType}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              loading={loading}
              isDues={isDuesForm}
            />
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

              <div className="bg-green-50 rounded-xl p-3">
                <div className="flex items-center gap-1 mb-2">
                  <Calculator className="h-3 w-3 text-green-600" />
                  <p className="text-xs font-medium text-green-700">Member will pay:</p>
                </div>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(calculateMemberPays(viewingType.amount))}
                </p>
                <p className="text-xs text-green-600 mt-1">
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
                      <span className="text-red-600">
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
                  handleOpenModal(viewingType, duesTypes.includes(viewingType.type));
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
                      <strong>Members can now make payments</strong> - This payment type will appear in the "Make a Payment" section.
                    </p>
                  </div>
                  {newlyCreatedType.late_penalty_enabled && (
                    <div className="flex items-start gap-2">
                      <Gavel className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700">
                        <strong>Late penalty enabled</strong> - {newlyCreatedType.late_penalty_type === 'fixed'
                          ? formatCurrency(newlyCreatedType.late_penalty_value)
                          : `${newlyCreatedType.late_penalty_value}%`
                        } penalty after {newlyCreatedType.late_penalty_days_after || 7} days.
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-700">
                      <strong>Amount: {formatCurrency(newlyCreatedType.amount)}</strong> - Organization receives this amount.
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

export default PaymentTypeManager;
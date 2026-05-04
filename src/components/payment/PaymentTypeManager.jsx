import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Eye, X, Save, Tag, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, ChevronRight, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentTypeManager = ({ paymentTypes = [], onCreate, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [viewingType, setViewingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dues',
    description: '',
    amount: '',
    is_mandatory: false,
    frequency: 'one-time',  // Changed from 'one-time' to match backend
    duration_value: 1,
    duration_unit: 'months'
  });
  const [loading, setLoading] = useState(false);
  const [paymentTypesList, setPaymentTypesList] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Type options for the dropdown
  const typeOptions = [
    { value: 'dues', label: 'Dues', color: 'blue', description: 'Regular membership dues' },
    { value: 'leavy', label: 'Leavy', color: 'purple', description: 'Special contributions for specific events' },
    { value: 'registration', label: 'Registration', color: 'green', description: 'One-time registration fee' },
    { value: 'monthly_dues', label: 'Monthly Dues', color: 'indigo', description: 'Monthly subscription payments' },
    { value: 'wedding_dues', label: 'Wedding Dues', color: 'pink', description: 'Wedding celebration contributions' },
    { value: 'charity_dues', label: 'Charity Dues', color: 'orange', description: 'Charitable donations' }
  ];

  // Frequency options - MATCH BACKEND ENUM
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
        name: type.name,
        type: type.type || 'dues',
        description: type.description || '',
        amount: type.amount,
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
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Valid amount is required');
      return;
    }
  
    // For recurring payments, validate duration fields
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
      // Start with base data
      const submitData = {
        name: formData.name,
        type: formData.type,
        description: formData.description || '',
        amount: parseFloat(formData.amount),
        is_mandatory: formData.is_mandatory,
        frequency: formData.frequency
      };
      
      // ONLY add duration fields if frequency is NOT one-time
      if (formData.frequency !== 'one-time') {
        submitData.duration_value = parseInt(formData.duration_value);
        submitData.duration_unit = formData.duration_unit;
      }
      // For one-time, we DO NOT add duration_value or duration_unit at all
      
      console.log('Submitting payment type:', submitData);
      
      if (editingType) {
        await onUpdate(editingType.id || editingType._id, submitData);
      } else {
        await onCreate(submitData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving payment type:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save payment type');
      }
    } finally {
      setLoading(false);
    }
  };

  
  const handleDelete = async (type) => {
    if (window.confirm(`Delete "${type.name}"? This will affect existing payments.`)) {
      try {
        await onDelete(type.id || type._id);
      } catch (error) {
        console.error('Error deleting payment type:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getTypeId = (type) => type.id || type._id;
  const getTypeKey = (type) => type.id || type._id || Math.random().toString();

  const getCategoryLabel = (typeValue) => {
    const option = typeOptions.find(opt => opt.value === typeValue);
    return option?.label || typeValue || 'Dues';
  };

  const getFrequencyLabel = (frequency) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option?.label || frequency || 'One Time';
  };

  // Mobile Card View
  const MobileCardView = () => (
    <div className="space-y-3">
      {paymentTypesList.map((type) => (
        <div key={getTypeKey(type)} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    type.is_mandatory ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <Tag className={`h-4 w-4 ${type.is_mandatory ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{type.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      Category: {getCategoryLabel(type.type)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{formatCurrency(type.amount)}</p>
              </div>
            </div>

            {type.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{type.description}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {getFrequencyLabel(type.frequency)}
                  {type.frequency !== 'one-time' && type.duration_value && 
                    ` • Every ${type.duration_value} ${type.duration_unit}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingType(type)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleOpenModal(type)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(type)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop Table View
  const DesktopTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paymentTypesList.map((type) => (
            <tr key={getTypeKey(type)} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{type.name}</div>
               </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600 capitalize">{getCategoryLabel(type.type)}</span>
               </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 max-w-md truncate">
                  {type.description || '-'}
                </div>
               </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(type.amount)}</div>
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
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  type.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {type.is_mandatory ? 'Mandatory' : 'Optional'}
                </span>
               </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button onClick={() => setViewingType(type)} className="text-blue-600 hover:text-blue-900 p-1">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleOpenModal(type)} className="text-green-600 hover:text-green-900 p-1">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(type)} className="text-red-600 hover:text-red-900 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
               </td>
            </tr>
          ))}
        </tbody>
       </table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Payment Types</h2>
            </div>
            <p className="text-purple-100 text-sm">Manage payment categories and schedules</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            {!isMobile && "Create"}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {paymentTypesList.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <p className="text-xs text-gray-500 mb-1">Total Types</p>
            <p className="text-2xl font-bold text-gray-900">{paymentTypesList.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <p className="text-xs text-gray-500 mb-1">Mandatory</p>
            <p className="text-2xl font-bold text-red-600">
              {paymentTypesList.filter(t => t.is_mandatory).length}
            </p>
          </div>
        </div>
      )}

      {/* Payment Types List */}
      {paymentTypesList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No payment types created yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-blue-600 text-sm font-medium inline-flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Create your first payment type
          </button>
        </div>
      ) : (
        <>
          {isMobile ? <MobileCardView /> : <DesktopTableView />}
        </>
      )}

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

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
                      className={`py-2.5 rounded-xl font-medium text-sm transition-all ${
                        formData.frequency === option.value
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

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
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    viewingType.is_mandatory ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
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

export default PaymentTypeManager;
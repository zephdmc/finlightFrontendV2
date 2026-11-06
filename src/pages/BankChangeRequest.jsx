import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import {
  Building,
  CreditCard,
  Banknote,
  Send,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Lock,
  User,
  Mail,
  Phone,
  FileText,
  Eye,
  EyeOff,
  Key,
  Search,
  X,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const BankChangeRequest = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [verifyingCurrent, setVerifyingCurrent] = useState(false);
  const [currentDetailsVerified, setCurrentDetailsVerified] = useState(false);
  const [showCurrentAccount, setShowCurrentAccount] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [formData, setFormData] = useState({
    // Organization details
    orgName: '',
    orgEmail: '',
    orgPhone: '',

    // Current bank details (for verification)
    currentBankName: '',
    currentAccountNumber: '',
    currentAccountName: '',
    currentSubaccountCode: '',

    // New bank details
    newBankName: '',
    newAccountNumber: '',
    newAccountName: '',
    newSubaccountCode: '',

    // Reason for change
    reason: '',

    // Confirmation
    confirmAccuracy: false,
    confirmAuthorization: false
  });

  const [errors, setErrors] = useState({});
  const [actualCurrentDetails, setActualCurrentDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    subaccountCode: ''
  });
  const [nigerianBanks, setNigerianBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const [currentBankSearch, setCurrentBankSearch] = useState('');
  const [isCurrentBankDropdownOpen, setIsCurrentBankDropdownOpen] = useState(false);
  const [filteredCurrentBanks, setFilteredCurrentBanks] = useState([]);
  const currentDropdownRef = useRef(null);
  const currentSearchInputRef = useRef(null);

  useEffect(() => {
    fetchOrganizationDetails();
  }, []);

  const fetchOrganizationDetails = async () => {
    try {
      const response = await api.get('/organizations/settings');
      if (response.data.success) {
        const org = response.data.data;
        // Store actual current details for verification
        setActualCurrentDetails({
          bankName: org.flutterwave?.bankName || '',
          accountNumber: org.flutterwave?.accountNumber || '',
          accountName: org.flutterwave?.accountName || '',
          subaccountCode: org.flutterwave?.subaccountCode || ''
        });

        setFormData(prev => ({
          ...prev,
          orgName: org.name || '',
          orgEmail: user?.email || '',
          orgPhone: '',
          // Don't auto-fill current details - admin must enter them
          currentBankName: '',
          currentAccountNumber: '',
          currentAccountName: '',
          currentSubaccountCode: '',
          newBankName: '',
          newAccountNumber: '',
          newAccountName: '',
          newSubaccountCode: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
      toast.error('Could not load organization details');
    }
  };



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter banks based on search
  useEffect(() => {
    if (bankSearch.trim() === '') {
      setFilteredBanks(nigerianBanks);
    } else {
      const searchTerm = bankSearch.toLowerCase().trim();
      const filtered = nigerianBanks.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm)
      );
      setFilteredBanks(filtered);
    }
  }, [bankSearch, nigerianBanks]);

  // Fetch banks from Flutterwave
  useEffect(() => {
    fetchBanksFromFlutterwave();
  }, []);

  // Filter current banks based on search
  useEffect(() => {
    if (currentBankSearch.trim() === '') {
      setFilteredCurrentBanks(nigerianBanks);
    } else {
      const searchTerm = currentBankSearch.toLowerCase().trim();
      const filtered = nigerianBanks.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm)
      );
      setFilteredCurrentBanks(filtered);
    }
  }, [currentBankSearch, nigerianBanks]);

  // Close current bank dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currentDropdownRef.current && !currentDropdownRef.current.contains(event.target)) {
        setIsCurrentBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch banks from Flutterwave API
  const fetchBanksFromFlutterwave = async () => {
    setLoadingBanks(true);
    try {
      const response = await api.get('/payment-gateway/flutterwave/banks');

      if (response.data.success && response.data.data) {
        let banksData = response.data.data;
        let banks = [];

        if (Array.isArray(banksData)) {
          banks = banksData.map(bank => ({
            name: bank.name || bank.bank_name || bank.bankName || '',
            code: bank.code || bank.bank_code || bank.bankCode || ''
          })).filter(bank => bank.name && bank.code);
        } else if (banksData.data && Array.isArray(banksData.data)) {
          banks = banksData.data.map(bank => ({
            name: bank.name || bank.bank_name || bank.bankName || '',
            code: bank.code || bank.bank_code || bank.bankCode || ''
          })).filter(bank => bank.name && bank.code);
        }

        if (banks.length > 0) {
                    setNigerianBanks(banks);
          setFilteredBanks(banks);
          setFilteredCurrentBanks(banks); // â† ADD THIS
        } else {
          throw new Error('No banks found in response');
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('âŒ Error fetching banks:', error);
      // Fallback banks
      const fallbackBanks = [
        { name: 'Access Bank', code: '044' },
        { name: 'Citibank', code: '023' },
        { name: 'Ecobank', code: '050' },
        { name: 'Fidelity Bank', code: '070' },
        { name: 'First Bank', code: '011' },
        { name: 'First City Monument Bank', code: '214' },
        { name: 'Guaranty Trust Bank', code: '058' },
        { name: 'Heritage Bank', code: '030' },
        { name: 'Keystone Bank', code: '082' },
        { name: 'Polaris Bank', code: '076' },
        { name: 'Providus Bank', code: '101' },
        { name: 'Stanbic IBTC Bank', code: '221' },
        { name: 'Standard Chartered Bank', code: '068' },
        { name: 'Sterling Bank', code: '232' },
        { name: 'Suntrust Bank', code: '100' },
        { name: 'Titan Trust Bank', code: '102' },
        { name: 'Union Bank', code: '032' },
        { name: 'United Bank for Africa', code: '033' },
        { name: 'Unity Bank', code: '215' },
        { name: 'Wema Bank', code: '035' },
        { name: 'Zenith Bank', code: '057' }
      ];
      setNigerianBanks(fallbackBanks);
      setFilteredBanks(fallbackBanks);
      setFilteredCurrentBanks(fallbackBanks); // â† ADD THIS
      toast.info('Using offline bank list');
    } finally {
      setLoadingBanks(false);
    }
  };



  const verifyCurrentDetails = () => {
    // Check if current details match actual stored details
    const bankNameMatch = formData.currentBankName.trim().toLowerCase() === actualCurrentDetails.bankName.toLowerCase();
    const accountNumberMatch = formData.currentAccountNumber.trim() === actualCurrentDetails.accountNumber;

    if (!bankNameMatch) {
      toast.error('Current bank name does not match our records');
      setErrors(prev => ({ ...prev, currentBankName: 'Bank name does not match our records' }));
      return false;
    }

    if (!accountNumberMatch) {
      toast.error('Current account number does not match our records');
      setErrors(prev => ({ ...prev, currentAccountNumber: 'Account number does not match our records' }));
      return false;
    }

    setCurrentDetailsVerified(true);
    toast.success('Current bank details verified! You can now enter new details.');
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateNewDetails = () => {
    const newErrors = {};

    // New bank details validation
    if (!formData.newBankName.trim()) {
      newErrors.newBankName = 'New bank name is required';
    }
    if (!formData.newAccountNumber.trim()) {
      newErrors.newAccountNumber = 'New account number is required';
    } else if (!/^\d{10}$/.test(formData.newAccountNumber)) {
      newErrors.newAccountNumber = 'Account number must be 10 digits';
    }
    if (!formData.newAccountName.trim()) {
      newErrors.newAccountName = 'Account name is required';
    }

    // Check if new details are different from current
    if (formData.newBankName === actualCurrentDetails.bankName &&
      formData.newAccountNumber === actualCurrentDetails.accountNumber) {
      newErrors.newBankName = 'New bank details must be different from current';
    }

    // Reason validation
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for the change';
    } else if (formData.reason.length < 10) {
      newErrors.reason = 'Please provide a more detailed reason (at least 10 characters)';
    }

    // Confirmations
    if (!formData.confirmAccuracy) {
      newErrors.confirmAccuracy = 'Please confirm the information is accurate';
    }
    if (!formData.confirmAuthorization) {
      newErrors.confirmAuthorization = 'Please confirm you are authorized to make this request';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatWhatsAppMessage = () => {
    const message = `
ðŸ¦ *BANK DETAIL CHANGE REQUEST (VERIFIED)*
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ðŸ“‹ *ORGANIZATION INFORMATION*
â€¢ Name: ${formData.orgName}
â€¢ Email: ${formData.orgEmail}
â€¢ Phone: ${formData.orgPhone || 'Not provided'}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ¦ *CURRENT BANK DETAILS (VERIFIED)*
â€¢ Bank: ${actualCurrentDetails.bankName}
â€¢ Account Number: ${actualCurrentDetails.accountNumber}
â€¢ Account Name: ${actualCurrentDetails.accountName || 'N/A'}
â€¢ Subaccount Code: ${actualCurrentDetails.subaccountCode || 'N/A'}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ†• *REQUESTED BANK DETAILS*
â€¢ Bank: ${formData.newBankName}
â€¢ Account Number: ${formData.newAccountNumber}
â€¢ Account Name: ${formData.newAccountName}
â€¢ Subaccount Code: ${formData.newSubaccountCode || 'Not provided'}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“ *REASON FOR CHANGE*
${formData.reason}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ‘¤ *REQUESTED BY*
â€¢ Name: ${user?.name}
â€¢ Email: ${user?.email}
â€¢ Role: ${user?.role}
â€¢ Date: ${new Date().toLocaleString()}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
âš ï¸ *VERIFICATION*
âœ“ Current bank details verified by admin
âœ“ Information confirmed accurate
âœ“ Authorization confirmed
    `;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentDetailsVerified) {
      toast.error('Please verify your current bank details first');
      return;
    }

    if (!validateNewDetails()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const message = formatWhatsAppMessage();
      const whatsappUrl = `https://wa.me/2347062780839?text=${message}`;
      window.open(whatsappUrl, '_blank');
      setSubmitted(true);
      toast.success('Request prepared! WhatsApp will open to send your request.');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Only admins can access this page
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your bank detail change request has been prepared. WhatsApp will open to send your request to support.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Our team will review your request and contact you within 24-48 hours.
            </p>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Request Bank Detail Change</h1>
              <p className="text-sm text-gray-500">
                Verify current details and submit new bank account information
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Security Verification Required</p>
              <p className="text-xs text-blue-700 mt-1">
                For security reasons, you must verify your current bank details before requesting a change.
                This ensures that only authorized administrators can update bank information.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Information */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Organization Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input type="text" value={formData.orgName} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Email</label>
                  <input type="email" value={formData.orgEmail} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="tel" name="orgPhone" value={formData.orgPhone} onChange={handleChange} placeholder="e.g., 08012345678" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Current Bank Details - Verification Required */}
          <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${currentDetailsVerified ? 'border-green-500' : 'border-yellow-500'}`}>
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Key className="h-5 w-5 text-yellow-600" />
                  Current Bank Details Verification
                </h2>
                {currentDetailsVerified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter your current bank details to verify your identity</p>
            </div>
            <div className="p-6 space-y-4">
              {!currentDetailsVerified ? (
                <>
                  <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-yellow-700">âš ï¸ You must enter your current bank details correctly to proceed with the change request.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Bank Name *</label>
                      <div className="relative" ref={currentDropdownRef}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            ref={currentSearchInputRef}
                            type="text"
                            placeholder="Search for your current bank..."
                            value={currentBankSearch}
                            onChange={(e) => {
                              setCurrentBankSearch(e.target.value);
                              setIsCurrentBankDropdownOpen(true);
                              // Update form data
                              setFormData(prev => ({
                                ...prev,
                                currentBankName: e.target.value
                              }));
                              // Clear error
                              if (errors.currentBankName) {
                                setErrors(prev => ({ ...prev, currentBankName: '' }));
                              }
                            }}
                            onFocus={() => setIsCurrentBankDropdownOpen(true)}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg ${errors.currentBankName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500`}
                          />
                          {currentBankSearch && (
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentBankSearch('');
                                setFormData(prev => ({ ...prev, currentBankName: '' }));
                                currentSearchInputRef.current?.focus();
                              }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {isCurrentBankDropdownOpen && !loadingBanks && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredCurrentBanks.length > 0 ? (
                              filteredCurrentBanks.map(bank => (
                                <button
                                  key={bank.code}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      currentBankName: bank.name
                                    }));
                                    setCurrentBankSearch(bank.name);
                                    setIsCurrentBankDropdownOpen(false);
                                    // Clear error
                                    if (errors.currentBankName) {
                                      setErrors(prev => ({ ...prev, currentBankName: '' }));
                                    }
                                                                      }}
                                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${formData.currentBankName === bank.name ? 'bg-blue-50' : ''
                                    }`}
                                >
                                  <span className="text-sm text-gray-700">{bank.name}</span>
                                  {formData.currentBankName === bank.name && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No banks found matching "{currentBankSearch}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.currentBankName && <p className="mt-1 text-xs text-red-600">{errors.currentBankName}</p>}
                      {formData.currentBankName && !isCurrentBankDropdownOpen && (
                        <div className="mt-1 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-gray-600">Selected: <strong>{formData.currentBankName}</strong></span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Account Number *</label>
                      <div className="relative">
                        <input type={showCurrentAccount ? 'text' : 'password'} name="currentAccountNumber" value={formData.currentAccountNumber} onChange={handleChange} placeholder="10-digit account number" maxLength="10" className={`w-full px-4 py-2 border rounded-lg pr-10 ${errors.currentAccountNumber ? 'border-red-500' : 'border-gray-200'}`} />
                        <button type="button" onClick={() => setShowCurrentAccount(!showCurrentAccount)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {showCurrentAccount ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                      {errors.currentAccountNumber && <p className="mt-1 text-xs text-red-600">{errors.currentAccountNumber}</p>}
                    </div>
                  </div>

                  <button type="button" onClick={verifyCurrentDetails} className="w-full py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition flex items-center justify-center gap-2">
                    <Key className="h-4 w-4" /> Verify Current Details
                  </button>
                </>
              ) : (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-700">Current Bank Details Verified</p>
                  </div>
                  <p className="text-xs text-green-600">Your identity has been verified. You can now proceed with the change request.</p>
                </div>
              )}
            </div>
          </div>

          {/* New Bank Details - Only shown after verification */}
          {currentDetailsVerified && (
            <>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    New Bank Details
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Enter the new bank account details</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Bank Name *</label>
                      <div className="relative" ref={dropdownRef}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={loadingBanks ? 'Loading banks...' : 'Search for your bank...'}
                            value={bankSearch}
                            onChange={(e) => {
                              setBankSearch(e.target.value);
                              setIsBankDropdownOpen(true);
                            }}
                            onFocus={() => setIsBankDropdownOpen(true)}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg ${errors.newBankName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500`}
                            disabled={loadingBanks}
                          />
                          {bankSearch && (
                            <button
                              type="button"
                              onClick={() => {
                                setBankSearch('');
                                searchInputRef.current?.focus();
                              }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {isBankDropdownOpen && !loadingBanks && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredBanks.length > 0 ? (
                              filteredBanks.map(bank => (
                                <button
                                  key={bank.code}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      newBankName: bank.name
                                    }));
                                    setBankSearch(bank.name);
                                    setIsBankDropdownOpen(false);
                                    // Clear error
                                    if (errors.newBankName) {
                                      setErrors(prev => ({ ...prev, newBankName: '' }));
                                    }
                                                                      }}
                                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${formData.newBankName === bank.name ? 'bg-blue-50' : ''
                                    }`}
                                >
                                  <span className="text-sm text-gray-700">{bank.name}</span>
                                  {formData.newBankName === bank.name && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No banks found matching "{bankSearch}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.newBankName && <p className="mt-1 text-xs text-red-600">{errors.newBankName}</p>}
                      {loadingBanks && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Loader className="h-3 w-3 animate-spin" />
                          Fetching banks from Flutterwave...
                        </p>
                      )}
                      {formData.newBankName && !isBankDropdownOpen && (
                        <div className="mt-1 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-gray-600">Selected: <strong>{formData.newBankName}</strong></span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Account Number *</label>
                      <div className="relative">
                        <input type={showNewAccount ? 'text' : 'password'} name="newAccountNumber" value={formData.newAccountNumber} onChange={handleChange} placeholder="10-digit account number" maxLength="10" className={`w-full px-4 py-2 border rounded-lg pr-10 ${errors.newAccountNumber ? 'border-red-500' : 'border-gray-200'}`} />
                        <button type="button" onClick={() => setShowNewAccount(!showNewAccount)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {showNewAccount ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                      {errors.newAccountNumber && <p className="mt-1 text-xs text-red-600">{errors.newAccountNumber}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Account Name *</label>
                    <input type="text" name="newAccountName" value={formData.newAccountName} onChange={handleChange} placeholder="Account holder name" className={`w-full px-4 py-2 border rounded-lg ${errors.newAccountName ? 'border-red-500' : 'border-gray-200'}`} />
                    {errors.newAccountName && <p className="mt-1 text-xs text-red-600">{errors.newAccountName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paystack Subaccount Code (Optional)</label>
                    <input type="text" name="newSubaccountCode" value={formData.newSubaccountCode} onChange={handleChange} placeholder="e.g., ACCT_xxxxxxxxxxxxx" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Reason for Change */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Reason for Change
                  </h2>
                </div>
                <div className="p-6">
                  <textarea name="reason" value={formData.reason} onChange={handleChange} rows="4" placeholder="Please explain why you need to change the bank account details..." className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${errors.reason ? 'border-red-500' : 'border-gray-200'}`} />
                  {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
                </div>
              </div>

              {/* Confirmations */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    Confirmations
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" name="confirmAccuracy" checked={formData.confirmAccuracy} onChange={handleChange} className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">I confirm that all information provided is accurate</label>
                      <p className="text-xs text-gray-500">I understand that providing false information may result in rejection of this request</p>
                    </div>
                  </div>
                  {errors.confirmAccuracy && <p className="text-xs text-red-600 mt-1 ml-8">{errors.confirmAccuracy}</p>}

                  <div className="flex items-start gap-3">
                    <input type="checkbox" name="confirmAuthorization" checked={formData.confirmAuthorization} onChange={handleChange} className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">I confirm that I am authorized to make this request</label>
                      <p className="text-xs text-gray-500">I am an authorized administrator of this organization</p>
                    </div>
                  </div>
                  {errors.confirmAuthorization && <p className="text-xs text-red-600 mt-1 ml-8">{errors.confirmAuthorization}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Sending Request...</> : <><Send className="h-4 w-4" /> Submit Request via WhatsApp</>}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default BankChangeRequest;
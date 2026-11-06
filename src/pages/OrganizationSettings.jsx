// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import Navbar from '../components/common/Navbar';
// import { Building, CreditCard, Banknote, Save, AlertCircle, CheckCircle, ArrowLeft, Shield, Lock, Eye, EyeOff, Loader } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import api from '../services/api';
// import DOMPurify from 'dompurify';

// const OrganizationSettings = () => {
//   const { user, isAdmin } = useAuth();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [showAccountNumber, setShowAccountNumber] = useState(false);
//   const [subaccountStatus, setSubaccountStatus] = useState(null);
//   const [bankDetails, setBankDetails] = useState({
//     bankName: '',
//     accountNumber: '',
//     accountName: ''
//   });
//   const [settings, setSettings] = useState({
//     organizationName: '',
//     slug: '',
//     settings: {
//       registrationFee: 500,
//       currency: 'NGN',
//       timezone: 'Africa/Lagos'
//     }
//   });

//   // List of Nigerian banks
//   const nigerianBanks = [
//     'Access Bank',
//     'Citibank',
//     'Ecobank',
//     'Fidelity Bank',
//     'First Bank',
//     'First City Monument Bank',
//     'Guaranty Trust Bank',
//     'Heritage Bank',
//     'Keystone Bank',
//     'Polaris Bank',
//     'Providus Bank',
//     'Stanbic IBTC Bank',
//     'Standard Chartered Bank',
//     'Sterling Bank',
//     'Suntrust Bank',
//     'Titan Trust Bank',
//     'Union Bank',
//     'United Bank for Africa',
//     'Unity Bank',
//     'Wema Bank',
//     'Zenith Bank'
//   ];

//   useEffect(() => {
//     if (!isAdmin) {
//       navigate('/dashboard');
//       return;
//     }
//     fetchOrganizationSettings();
//     fetchSubaccountStatus();
//   }, [isAdmin, navigate]);

//   const sanitizeInput = (value) => {
//     if (typeof value === 'string') {
//       return DOMPurify.sanitize(value.trim());
//     }
//     return value;
//   };

//   const fetchOrganizationSettings = async () => {
//     setFetching(true);
//     try {
//       const response = await api.get('/organizations/settings');
//       if (response.data.success) {
//         const org = response.data.data;
//         setSettings({
//           organizationName: org.name || '',
//           slug: org.slug || '',
//           settings: org.settings || {
//             registrationFee: 500,
//             currency: 'NGN',
//             timezone: 'Africa/Lagos'
//           }
//         });

//         // Populate bank details from Flutterwave field (or fallback to paystack for legacy)
//         const flutterwave = org.flutterwave || org.paystack;
//         if (flutterwave) {
//           setBankDetails({
//             bankName: flutterwave.bankName || '',
//             accountNumber: flutterwave.accountNumber || '',
//             accountName: flutterwave.accountName || org.name || ''
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching organization settings:', error);
//       toast.error('Failed to load organization settings');
//     } finally {
//       setFetching(false);
//     }
//   };

//   const fetchSubaccountStatus = async () => {
//     try {
//       const response = await api.get('/organizations/subaccount/status');
//       if (response.data.success) {
//         setSubaccountStatus(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching subaccount status:', error);
//     }
//   };

//   const handleBankDetailsChange = (e) => {
//     const { name, value } = e.target;
//     const sanitizedValue = sanitizeInput(value);

//     if (name === 'bankName' && sanitizedValue && !/^[a-zA-Z\s]+$/.test(sanitizedValue)) {
//       toast.error('Bank name should only contain letters and spaces');
//       return;
//     }

//     if (name === 'accountNumber' && sanitizedValue) {
//       if (!/^\d*$/.test(sanitizedValue)) {
//         toast.error('Account number should only contain digits');
//         return;
//       }
//       if (sanitizedValue.length > 10) {
//         toast.error('Account number cannot exceed 10 digits');
//         return;
//       }
//     }

//     setBankDetails(prev => ({
//       ...prev,
//       [name]: sanitizedValue
//     }));
//   };

//   const handleSettingsChange = (e) => {
//     const { name, value } = e.target;
//     const sanitizedValue = sanitizeInput(value);

//     if (name === 'registrationFee') {
//       const fee = parseFloat(sanitizedValue);
//       if (isNaN(fee) || fee < 0) {
//         toast.error('Please enter a valid registration fee');
//         return;
//       }
//       if (fee > 100000) {
//         toast.error('Registration fee cannot exceed â‚¦100,000');
//         return;
//       }
//     }

//     setSettings(prev => ({
//       ...prev,
//       settings: {
//         ...prev.settings,
//         [name]: name === 'registrationFee' ? parseFloat(sanitizedValue) || 0 : sanitizedValue
//       }
//     }));
//   };

//   // Submit bank details to auto-create Flutterwave subaccount
//   const handleBankDetailsSubmit = async (e) => {
//     e.preventDefault();

//     if (!bankDetails.bankName) {
//       toast.error('Please select your bank');
//       return;
//     }

//     if (!bankDetails.accountNumber || bankDetails.accountNumber.length !== 10) {
//       toast.error('Please enter a valid 10-digit account number');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await api.put('/organizations/bank-details', {
//         bankName: bankDetails.bankName,
//         accountNumber: bankDetails.accountNumber,
//         accountName: bankDetails.accountName || settings.organizationName
//       });

//       if (response.data.success) {
//         toast.success(response.data.message || 'Bank details saved and subaccount created!');
//         await fetchSubaccountStatus(); // Refresh status
//         await fetchOrganizationSettings(); // Refresh settings
//       }
//     } catch (error) {
//       console.error('Error saving bank details:', error);
//       toast.error(error.response?.data?.message || 'Failed to save bank details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update general settings
//   const handleGeneralSettingsSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const submitData = {
//         settings: {
//           registrationFee: settings.settings.registrationFee,
//           currency: settings.settings.currency,
//           timezone: settings.settings.timezone
//         }
//       };

//       const response = await api.put('/organizations/settings', submitData);

//       if (response.data.success) {
//         toast.success('General settings updated successfully!');

//         // Redirect to dashboard after successful save
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1500);
//       }
//     } catch (error) {
//       console.error('Error updating settings:', error);
//       toast.error(error.response?.data?.message || 'Failed to update settings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="flex justify-center py-12">
//           <Loader className="h-12 w-12 animate-spin text-blue-600" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       <Navbar />

//       <div className="max-w-3xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Back
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
//               <Building className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">Organization Settings</h1>
//               <p className="text-sm text-gray-500">Manage your organization's financial settings</p>
//             </div>
//           </div>
//         </div>

//         {/* Subaccount Status Card - Updated for Flutterwave */}
//         {subaccountStatus && (
//           <div className={`rounded-2xl p-4 mb-6 border ${
//             subaccountStatus.hasSubaccount
//               ? 'bg-green-50 border-green-200'
//               : 'bg-yellow-50 border-yellow-200'
//           }`}>
//             <div className="flex items-center gap-3">
//               {subaccountStatus.hasSubaccount ? (
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//               ) : (
//                 <AlertCircle className="h-6 w-6 text-yellow-600" />
//               )}
//               <div className="flex-1">
//                 <h3 className="font-semibold text-gray-800">
//                   {subaccountStatus.hasSubaccount ? 'âœ… Payment Account Active' : 'âš ï¸ Payment Setup Required'}
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   {subaccountStatus.hasSubaccount
//                     ? `Your Flutterwave subaccount is active. Members can now make payments.`
//                     : `Please add your bank details below to start receiving payments from members.`
//                   }
//                 </p>
//                 {subaccountStatus.hasSubaccount && subaccountStatus.subaccountId && (
//                   <p className="text-xs text-gray-500 mt-2 font-mono">
//                     Subaccount ID: {subaccountStatus.subaccountId}
//                   </p>
//                 )}
//                 {subaccountStatus.hasSubaccount && subaccountStatus.subaccountCode && (
//                   <p className="text-xs text-gray-500 font-mono">
//                     Subaccount Code: {subaccountStatus.subaccountCode}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Bank Details Form - Creates Flutterwave Subaccount */}
//         <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
//           <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
//             <h2 className="font-semibold text-gray-800 flex items-center gap-2">
//               <CreditCard className="h-5 w-5 text-green-600" />
//               Bank Details for Payments
//             </h2>
//             <p className="text-xs text-gray-500 mt-1">
//               Your Flutterwave subaccount will be created automatically when you save your bank details
//             </p>
//           </div>

//           <form onSubmit={handleBankDetailsSubmit} className="p-6 space-y-5">
//             <div className="bg-blue-50 rounded-xl p-4 mb-4">
//               <div className="flex items-start gap-3">
//                 <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-sm font-medium text-blue-800">How payment works:</p>
//                   <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
//                     <li>Your Flutterwave subaccount will be created automatically</li>
//                     <li>Payments will be split: 94% to your organization, 6% to platform (2% Flutterwave + 4% platform fee)</li>
//                     <li>Flutterwave fee is 2% (no cap, no fixed fee) â€“ deducted automatically</li>
//                     <li>Funds settle to your bank account within 2-3 business days</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Bank Name <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="bankName"
//                 value={bankDetails.bankName}
//                 onChange={handleBankDetailsChange}
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               >
//                 <option value="">Select your bank</option>
//                 {nigerianBanks.map(bank => (
//                   <option key={bank} value={bank}>{bank}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Account Number <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showAccountNumber ? 'text' : 'password'}
//                   name="accountNumber"
//                   value={bankDetails.accountNumber}
//                   onChange={handleBankDetailsChange}
//                   placeholder="0123456789"
//                   maxLength="10"
//                   pattern="[0-9]{10}"
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowAccountNumber(!showAccountNumber)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               <p className="text-xs text-gray-400 mt-1">Enter your 10-digit NUBAN account number</p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Account Name <span className="text-gray-400">(Optional)</span>
//               </label>
//               <input
//                 type="text"
//                 name="accountName"
//                 value={bankDetails.accountName}
//                 onChange={handleBankDetailsChange}
//                 placeholder="Your organization name"
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               <p className="text-xs text-gray-400 mt-1">Will use organization name if left blank</p>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader className="h-5 w-5 animate-spin" />
//                   Creating Subaccount...
//                 </>
//               ) : (
//                 <>
//                   <CreditCard className="h-5 w-5" />
//                   {subaccountStatus?.hasSubaccount ? 'Update Bank Details' : 'Save & Create Subaccount'}
//                 </>
//               )}
//             </button>
//           </form>
//         </div>

//         {/* General Settings Card (unchanged) */}
//         <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
//             <h2 className="font-semibold text-gray-800 flex items-center gap-2">
//               <Banknote className="h-5 w-5 text-purple-600" />
//               General Settings
//             </h2>
//           </div>

//           <form onSubmit={handleGeneralSettingsSubmit} className="p-6 space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Registration Fee (â‚¦)
//               </label>
//               <input
//                 type="number"
//                 name="registrationFee"
//                 value={settings.settings.registrationFee}
//                 onChange={handleSettingsChange}
//                 step="100"
//                 min="0"
//                 max="100000"
//                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               <p className="text-xs text-gray-400 mt-1">
//                 Amount new members pay to register (2% Flutterwave fee + 4% platform fee apply)
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Currency
//               </label>
//               <select
//                 name="currency"
//                 value={settings.settings.currency}
//                 onChange={handleSettingsChange}
//                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="NGN">Nigerian Naira (â‚¦)</option>
//                 <option value="USD">US Dollar ($)</option>
//                 <option value="GHS">Ghana Cedi (â‚µ)</option>
//                 <option value="KES">Kenyan Shilling (KSh)</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Timezone
//               </label>
//               <select
//                 name="timezone"
//                 value={settings.settings.timezone}
//                 onChange={handleSettingsChange}
//                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Africa/Lagos">West Africa Time (WAT)</option>
//                 <option value="Africa/Nairobi">East Africa Time (EAT)</option>
//                 <option value="Africa/Johannesburg">South Africa Standard Time</option>
//                 <option value="Africa/Cairo">Egypt Standard Time</option>
//               </select>
//             </div>

//             <div className="pt-4">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <Loader className="h-4 w-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     Save General Settings
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrganizationSettings;
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { Building, Search, X, CreditCard, Banknote, Save, AlertCircle, CheckCircle, ArrowLeft, Shield, Lock, Eye, EyeOff, Loader, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import DOMPurify from 'dompurify';

const OrganizationSettings = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [subaccountStatus, setSubaccountStatus] = useState(null);
  const [nigerianBanks, setNigerianBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: '',
    verified: false
  });
  const [settings, setSettings] = useState({
    organizationName: '',
    slug: '',
    settings: {
      registrationFee: 500,
      currency: 'NGN',
      timezone: 'Africa/Lagos'
    }
  });
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fallback banks with codes (used if API fails)
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

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchOrganizationSettings();
    fetchSubaccountStatus();
    fetchBanksFromFlutterwave();
  }, [isAdmin, navigate]);

  // Auto-verify account when account number reaches 10 digits and bank is selected
  useEffect(() => {
    if (
      bankDetails.accountNumber.length === 10 &&
      bankDetails.bankCode &&
      !bankDetails.verified
    ) {
      verifyAccount();
    }
  }, [bankDetails.accountNumber, bankDetails.bankCode]);

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

  const sanitizeInput = (value) => {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value.trim());
    }
    return value;
  };

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
          setFilteredBanks(banks);  // â† ADD THIS LINE
        } else {
          throw new Error('No banks found in response');
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('âŒ Error fetching banks:', error);
            setNigerianBanks(fallbackBanks);
      setFilteredBanks(fallbackBanks);  // â† ADD THIS LINE
      toast.info('Using offline bank list');
    } finally {
      setLoadingBanks(false);
    }
  };

  const fetchOrganizationSettings = async () => {
    setFetching(true);
    try {
      const response = await api.get('/organizations/settings');
      if (response.data.success) {
        const org = response.data.data;
        setSettings({
          organizationName: org.name || '',
          slug: org.slug || '',
          settings: org.settings || {
            registrationFee: 500,
            currency: 'NGN',
            timezone: 'Africa/Lagos'
          }
        });

        // Populate bank details from Flutterwave field
        const flutterwave = org.flutterwave || org.paystack;
        if (flutterwave) {
          const banksList = nigerianBanks.length > 0 ? nigerianBanks : fallbackBanks;
          const bank = banksList.find(b => b.name === flutterwave.bankName);
          setBankDetails({
            bankName: flutterwave.bankName || '',
            bankCode: bank?.code || flutterwave.bankCode || '',
            accountNumber: flutterwave.accountNumber || '',
            accountName: flutterwave.accountName || org.name || '',
            verified: true
          });
        }
      }
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      toast.error('Failed to load organization settings');
    } finally {
      setFetching(false);
    }
  };

  const fetchSubaccountStatus = async () => {
    try {
      const response = await api.get('/organizations/subaccount/status');
      if (response.data.success) {
        setSubaccountStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subaccount status:', error);
    }
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);

    if (name === 'bankName') {
      // Find the selected bank from the list
      const selectedBank = nigerianBanks.find(b => b.name === sanitizedValue);

      // Debug logging

      // If bank not found in loaded list, try fallback
      let bankCode = selectedBank?.code || '';
      if (!bankCode) {
        const fallbackBank = fallbackBanks.find(b => b.name === sanitizedValue);
        bankCode = fallbackBank?.code || '';
              }

      setBankDetails(prev => ({
        ...prev,
        bankName: sanitizedValue,
        bankCode: bankCode,
        verified: false,
        accountName: ''
      }));
      return;
    }

    if (name === 'accountNumber' && sanitizedValue) {
      if (!/^\d*$/.test(sanitizedValue)) {
        toast.error('Account number should only contain digits');
        return;
      }
      if (sanitizedValue.length > 10) {
        toast.error('Account number cannot exceed 10 digits');
        return;
      }

      setBankDetails(prev => ({
        ...prev,
        accountNumber: sanitizedValue,
        verified: false,
        accountName: ''
      }));
      return;
    }

    setBankDetails(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  // Verify account with Flutterwave
  const verifyAccount = async () => {
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit account number');
      return;
    }

    if (!bankDetails.bankCode) {
      toast.error('Bank code not found. Please reselect your bank.');
      return;
    }

    setVerifying(true);

    try {
      const response = await api.post('/payment-gateway/organizations/resolve-account', {
        accountNumber: bankDetails.accountNumber,
        bankCode: bankDetails.bankCode
      });

      if (response.data.success) {
        setBankDetails(prev => ({
          ...prev,
          accountName: response.data.accountName,
          verified: true
        }));
        toast.success('Account verified successfully!');
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      setBankDetails(prev => ({
        ...prev,
        accountName: '',
        verified: false
      }));
      toast.error(error.response?.data?.message || 'Unable to verify account. Please check the account number and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);

    if (name === 'registrationFee') {
      const fee = parseFloat(sanitizedValue);
      if (isNaN(fee) || fee < 0) {
        toast.error('Please enter a valid registration fee');
        return;
      }
      if (fee > 100000) {
        toast.error('Registration fee cannot exceed â‚¦100,000');
        return;
      }
    }

    setSettings(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: name === 'registrationFee' ? parseFloat(sanitizedValue) || 0 : sanitizedValue
      }
    }));
  };

  // Submit bank details to auto-create Flutterwave subaccount
  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();

    // Debug logging

    if (!bankDetails.verified) {
      toast.error('Please verify your account before continuing');
      return;
    }

    if (!bankDetails.bankName) {
      toast.error('Please select your bank');
      return;
    }

    if (!bankDetails.bankCode) {
      toast.error('Bank code not found. Please reselect your bank.');
      return;
    }

    if (!bankDetails.accountNumber || bankDetails.accountNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit account number');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put('/organizations/bank-details', {
        bankName: bankDetails.bankName,
        bankCode: bankDetails.bankCode,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Bank details saved and subaccount created!');
        await fetchSubaccountStatus();
        await fetchOrganizationSettings();
      }
    } catch (error) {
      console.error('Error saving bank details:', error);
      toast.error(error.response?.data?.message || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  // Update general settings
  const handleGeneralSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        settings: {
          registrationFee: settings.settings.registrationFee,
          currency: settings.settings.currency,
          timezone: settings.settings.timezone
        }
      };

      const response = await api.put('/organizations/settings', submitData);

      if (response.data.success) {
        toast.success('General settings updated successfully!');

        // Redirect to dashboard after successful save
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <Loader className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Organization Settings</h1>
              <p className="text-sm text-gray-500">Manage your organization's financial settings</p>
            </div>
          </div>
        </div>

        {/* Subaccount Status Card */}
        {subaccountStatus && (
          <div className={`rounded-2xl p-4 mb-6 border ${subaccountStatus.hasSubaccount
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
            }`}>
            <div className="flex items-center gap-3">
              {subaccountStatus.hasSubaccount ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {subaccountStatus.hasSubaccount ? 'âœ… Payment Account Active' : 'âš ï¸ Payment Setup Required'}
                </h3>
                <p className="text-sm text-gray-600">
                  {subaccountStatus.hasSubaccount
                    ? `Your Flutterwave subaccount is active. Members can now make payments.`
                    : `Please add your bank details below to start receiving payments from members.`
                  }
                </p>
                {subaccountStatus.hasSubaccount && subaccountStatus.subaccountId && (
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Subaccount ID: {subaccountStatus.subaccountId}
                  </p>
                )}
                {subaccountStatus.hasSubaccount && subaccountStatus.subaccountCode && (
                  <p className="text-xs text-gray-500 font-mono">
                    Subaccount Code: {subaccountStatus.subaccountCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bank Details Form - Creates Flutterwave Subaccount */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Bank Details for Payments
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Your Flutterwave subaccount will be created automatically when you save your bank details
            </p>
          </div>

          <form onSubmit={handleBankDetailsSubmit} className="p-6 space-y-5">
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">How payment works:</p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Your Flutterwave subaccount will be created automatically</li>
                    <li>Payments will be split: 96% to your organization, 4% to platform (2% Flutterwave + 2% platform fee)</li>
                    <li>Flutterwave fee is 2% (no cap, no fixed fee) â€“ deducted automatically</li>
                    <li>Funds settle to your bank account within 2-3 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Select Bank with Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bank <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                {/* Search Input */}
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
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                {/* Dropdown List */}
                {isBankDropdownOpen && !loadingBanks && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map(bank => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => {
                            setBankDetails(prev => ({
                              ...prev,
                              bankName: bank.name,
                              bankCode: bank.code,
                              verified: false,
                              accountName: ''
                            }));
                            setBankSearch(bank.name);
                            setIsBankDropdownOpen(false);
                                                      }}
                          className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${bankDetails.bankName === bank.name ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                            }`}
                        >
                          <span className="text-sm text-gray-700">{bank.name}</span>
                          {bankDetails.bankName === bank.name && (
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

                {loadingBanks && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <Loader className="h-3 w-3 animate-spin" />
                    Fetching banks from Flutterwave...
                  </div>
                )}
              </div>
              {/* Selected bank display */}
              {bankDetails.bankName && !isBankDropdownOpen && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Selected: <strong>{bankDetails.bankName}</strong></span>
                </div>
              )}
              {!loadingBanks && nigerianBanks.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Failed to load banks. Please refresh the page.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showAccountNumber ? 'text' : 'password'}
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleBankDetailsChange}
                  placeholder="0123456789"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  required
                  disabled={verifying}
                />
                <button
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Enter your 10-digit NUBAN account number</p>
            </div>

            {/* Account Name - Read-only, populated by verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bankDetails.accountName}
                  readOnly
                  placeholder={verifying ? 'Verifying account...' : 'Enter account number to verify'}
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 ${bankDetails.verified
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                    }`}
                />
                {verifying && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                )}
                {bankDetails.verified && !verifying && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>

              {bankDetails.verified && (
                <div className="mt-2 flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Account Verified</span>
                </div>
              )}

              {bankDetails.accountNumber.length === 10 && !bankDetails.verified && !verifying && (
                <div className="mt-2 flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Click "Verify Account" to confirm ownership</span>
                </div>
              )}

              {!bankDetails.verified && bankDetails.accountNumber.length === 10 && bankDetails.bankCode && (
                <button
                  type="button"
                  onClick={verifyAccount}
                  disabled={verifying}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${verifying ? 'animate-spin' : ''}`} />
                  {verifying ? 'Verifying...' : 'Verify Account'}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!bankDetails.verified || loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${bankDetails.verified
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  {subaccountStatus?.hasSubaccount ? 'Updating...' : 'Creating Subaccount...'}
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  {subaccountStatus?.hasSubaccount ? 'Update Bank Details' : 'Save & Create Subaccount'}
                </>
              )}
            </button>

            {!bankDetails.verified && bankDetails.accountNumber.length === 10 && (
              <p className="text-xs text-yellow-600 text-center">
                âš ï¸ Please verify your account before saving
              </p>
            )}
          </form>
        </div>

        {/* General Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-purple-600" />
              General Settings
            </h2>
          </div>

          <form onSubmit={handleGeneralSettingsSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Fee (â‚¦)
              </label>
              <input
                type="number"
                name="registrationFee"
                value={settings.settings.registrationFee}
                onChange={handleSettingsChange}
                step="100"
                min="0"
                max="100000"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Amount new members pay to register (2% Flutterwave fee + 2% platform fee apply)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={settings.settings.currency}
                onChange={handleSettingsChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="NGN">Nigerian Naira (â‚¦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GHS">Ghana Cedi (â‚µ)</option>
                <option value="KES">Kenyan Shilling (KSh)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                name="timezone"
                value={settings.settings.timezone}
                onChange={handleSettingsChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Africa/Lagos">West Africa Time (WAT)</option>
                <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                <option value="Africa/Johannesburg">South Africa Standard Time</option>
                <option value="Africa/Cairo">Egypt Standard Time</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save General Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
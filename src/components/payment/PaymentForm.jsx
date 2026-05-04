import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, Info, User, Shield, Lock, ArrowLeft, Wallet, TrendingUp, Clock, ChevronRight, Phone, Mail, HelpCircle, RefreshCw, FileText, Gavel } from 'lucide-react';
import PaymentService from '../../services/paymentService';
import AuthService from '../../services/authService';
import api from '../../services/api';

/**
 * Payment Form Component - Banking App Style
 * Handles creating new payments (Admin) and making payments (Members)
 */
const PaymentForm = ({ onSuccess, payments = [], isAdmin = false, paymentTypes = [] }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [availablePaymentTypes, setAvailablePaymentTypes] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [loadingMemberOutstanding, setLoadingMemberOutstanding] = useState(false);
  const [paystackLoading, setPaystackLoading] = useState(false);
  
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef(null);
  const initialFetchDoneRef = useRef(false);
  
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');
  const [fineDescription, setFineDescription] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchMembers();
    } else {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = setTimeout(() => {
        if (!initialFetchDoneRef.current) {
          initialFetchDoneRef.current = true;
          fetchPendingPayments();
        }
      }, 500);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && selectedMember) {
      fetchMemberOutstandingPayments(selectedMember._id || selectedMember.id);
    } else if (isAdmin && !selectedMember) {
      setAvailablePaymentTypes([]);
      setSelectedPaymentType(null);
    }
  }, [selectedMember, isAdmin]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const fetchMemberOutstandingPayments = async (memberId) => {
    setLoadingMemberOutstanding(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login again');
        return;
      }
  
      console.log('=== FETCHING OUTSTANDING PAYMENTS ===');
      console.log('Member ID:', memberId);
  
      const paymentTypesResponse = await api.get('/payment-types');
      let allPaymentTypes = paymentTypesResponse.data?.data?.records || paymentTypesResponse.data?.data || [];
      
      const paymentsResponse = await api.get(`/payments/all?userId=${memberId}`);
      let memberPayments = paymentsResponse.data?.data?.records || paymentsResponse.data?.data || [];
      
      const paidPaymentTypeIds = new Set();
      
      memberPayments.forEach(payment => {
        const isPaid = payment.status === 'paid' || payment.paidAt !== null;
        
        if (isPaid && payment.paymentTypeId) {
          paidPaymentTypeIds.add(payment.paymentTypeId.toString());
        }
      });
      
      const outstandingPaymentTypes = [];
      
      for (const type of allPaymentTypes) {
        const typeIdStr = type._id.toString();
        
        if (!paidPaymentTypeIds.has(typeIdStr)) {
          outstandingPaymentTypes.push({
            id: type._id,
            value: type.name.toLowerCase().replace(/\s+/g, '_'),
            label: type.name,
            amount: type.amount,
            is_mandatory: type.is_mandatory || false,
            frequency: type.frequency || 'one-time',
            description: type.description,
            type: type.type || 'dues',
            is_fine: false,
            is_outstanding_type: true
          });
        }
      }
      
      const unpaidFines = memberPayments
        .filter(p => p.type === 'fine' && p.status !== 'paid' && !p.paidAt)
        .map(fine => ({
          id: fine._id,
          label: `Fine: ${fine.description || fine.reason || 'Penalty'}`,
          amount: fine.amount,
          is_fine: true,
          fine_reason: fine.description || fine.reason,
          status: 'unpaid',
          paymentId: fine._id
        }));
      
      const allOutstanding = [...outstandingPaymentTypes, ...unpaidFines];
      
      setAvailablePaymentTypes(allOutstanding);
      setSelectedPaymentType(null);
      
      if (allOutstanding.length === 0) {
        toast.success('This member has no outstanding payments');
      }
      
    } catch (error) {
      console.error('Error fetching member outstanding payments:', error);
      toast.error('Failed to load member outstanding payments');
      setAvailablePaymentTypes([]);
    } finally {
      setLoadingMemberOutstanding(false);
    }
  };

  // FIXED: This function now correctly identifies paid payment types
  const fetchPendingPayments = async () => {
    if (isFetchingRef.current) {
      console.log('Already fetching pending payments, skipping...');
      return;
    }
    
    isFetchingRef.current = true;
    setLoadingPending(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login again');
        return;
      }
    
      // Get all payment types
      const paymentTypesResponse = await api.get('/payment-types');
      let allPaymentTypes = paymentTypesResponse.data?.data?.records || paymentTypesResponse.data?.data || [];
      
      // Get user's existing payments
      const paymentsResponse = await api.get('/payments');
      let userPayments = paymentsResponse.data?.data?.records || paymentsResponse.data?.data || [];
      
      console.log('=== USER PAYMENTS DEBUG ===');
      
      // CRITICAL FIX: Extract the paymentTypeId correctly whether it's an object or string
      const paidPaymentTypeIds = new Set();
      
      userPayments.forEach(p => {
        // Check if payment is PAID
        const isPaid = p.status === 'paid' || p.paidAt !== null;
        
        if (isPaid) {
          // Get paymentTypeId - handle both object and string cases
          let paymentTypeIdValue = null;
          
          if (p.paymentTypeId) {
            // If paymentTypeId is an object with _id property
            if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
              paymentTypeIdValue = p.paymentTypeId._id.toString();
            }
            // If paymentTypeId is a string or object with toString
            else if (typeof p.paymentTypeId === 'string') {
              paymentTypeIdValue = p.paymentTypeId;
            }
            // If paymentTypeId is an object without _id, try its toString
            else if (typeof p.paymentTypeId === 'object') {
              paymentTypeIdValue = p.paymentTypeId.toString();
            }
          }
          
          if (paymentTypeIdValue) {
            paidPaymentTypeIds.add(paymentTypeIdValue);
            console.log(`Marked paymentTypeId ${paymentTypeIdValue} as PAID for payment: ${p.name || p.type}`);
          }
          
          // Also track by name for fallback
          if (p.name) {
            paidPaymentTypeIds.add(p.name);
          }
        }
      });
      
      console.log('Paid payment type IDs:', Array.from(paidPaymentTypeIds));
      
      // Get unpaid fines
      const unpaidFines = userPayments
        .filter(p => p.type === 'fine' && p.status !== 'paid' && !p.paidAt)
        .map(fine => ({
          id: fine._id,
          label: `Fine: ${fine.description || fine.reason || 'Penalty'}`,
          amount: fine.amount,
          is_fine: true,
          fine_reason: fine.description || fine.reason,
          status: 'unpaid',
          paymentId: fine._id
        }));
      
      // Get unpaid payment records
      const unpaidPaymentRecords = userPayments
        .filter(p => p.status === 'unpaid' && p.paymentTypeId && p.type !== 'fine' && !p.paidAt)
        .map(payment => {
          let paymentTypeName = null;
          // Try to find payment type from allPaymentTypes
          if (payment.paymentTypeId) {
            let typeId = null;
            if (typeof payment.paymentTypeId === 'object' && payment.paymentTypeId._id) {
              typeId = payment.paymentTypeId._id.toString();
            } else if (typeof payment.paymentTypeId === 'string') {
              typeId = payment.paymentTypeId;
            }
            
            if (typeId) {
              const paymentType = allPaymentTypes.find(t => t._id.toString() === typeId);
              if (paymentType) {
                paymentTypeName = paymentType.name;
              }
            }
          }
          
          return {
            id: payment._id,
            label: paymentTypeName || payment.name || payment.type || 'Payment',
            amount: payment.amount,
            is_mandatory: false,
            is_fine: false,
            is_unpaid_record: true,
            paymentId: payment._id
          };
        });
      
      // FIXED: Only include payment types that have NOT been paid
      const outstandingPaymentTypes = allPaymentTypes
        .filter(type => {
          const typeIdStr = type._id.toString();
          
          // Check if this payment type ID has been paid
          if (paidPaymentTypeIds.has(typeIdStr)) {
            console.log(`Skipping PAID payment type by ID: ${type.name} (${typeIdStr})`);
            return false;
          }
          
          // Also check if paid by name
          if (paidPaymentTypeIds.has(type.name)) {
            console.log(`Skipping PAID payment type by name: ${type.name}`);
            return false;
          }
          
          console.log(`Keeping OUTSTANDING payment type: ${type.name} (${typeIdStr})`);
          return true;
        })
        .map(type => ({
          id: type._id,
          value: type.name.toLowerCase().replace(/\s+/g, '_'),
          label: type.name,
          amount: type.amount,
          is_mandatory: type.is_mandatory || false,
          frequency: type.frequency || 'one-time',
          description: type.description,
          type: type.type || 'dues',
          is_fine: false,
          is_outstanding_type: true
        }));
      
      const allPending = [...outstandingPaymentTypes, ...unpaidPaymentRecords, ...unpaidFines];
      allPending.sort((a, b) => b.amount - a.amount);
      
      console.log('=== RESULT ===');
      console.log('Outstanding payment types:', outstandingPaymentTypes.map(t => t.label));
      console.log('Unpaid payment records:', unpaidPaymentRecords.length);
      console.log('Unpaid fines:', unpaidFines.length);
      console.log('Total pending to show:', allPending.length);
      
      setPendingPayments(allPending);
      setAvailablePaymentTypes(allPending);
      
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      if (error.response?.status !== 429) {
        toast.error('Failed to load pending payments');
      }
      setPendingPayments([]);
      setAvailablePaymentTypes([]);
    } finally {
      setLoadingPending(false);
      isFetchingRef.current = false;
    }
  };

  const fetchMembers = async () => {
    setFetchingMembers(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login again');
        setFetchingMembers(false);
        return;
      }
  
      const response = await api.get('/users?limit=100');
      let allUsers = response.data?.data?.records || response.data?.data || [];
      const membersList = allUsers.filter(user => user.role === 'member');
      
      setMembers(membersList);
    } catch (error) {
      console.error('Failed to load members:', error);
      toast.error('Failed to load members list');
      setMembers([]);
    } finally {
      setFetchingMembers(false);
    }
  };

  const getPaymentTypeValue = (paymentType) => {
    if (paymentType.type) {
      return paymentType.type;
    }
    return 'dues';
  };

  const memberPayForSelfViaPaystack = async () => {
    if (!selectedPaymentType) {
      toast.error('Please select a payment type');
      return;
    }

    setPaystackLoading(true);
    
    try {
      const paymentName = selectedPaymentType.label || selectedPaymentType.name || 'Payment';
      const paymentTypeValue = getPaymentTypeValue(selectedPaymentType);
      const paymentAmount = selectedPaymentType.amount;
      const paymentDescription = selectedPaymentType.description || `${paymentName} payment`;
      const paymentTypeId = selectedPaymentType.id;
      
      const paymentData = {
        name: paymentName,
        type: paymentTypeValue,
        amount: paymentAmount,
        description: paymentDescription,
        paymentTypeId: paymentTypeId
      };
      
      console.log('Creating payment with data:', paymentData);
      
      const createResponse = await api.post('/payments/member-payment', paymentData);
      const createdPayment = createResponse.data.data || createResponse.data;
      
      const initResponse = await api.post('/payment-gateway/initialize', {
        paymentId: createdPayment._id
      });
      
      if (initResponse.data.success) {
        toast.success('Redirecting to Paystack to complete payment...');
        window.location.href = initResponse.data.data.authorizationUrl;
      } else {
        throw new Error(initResponse.data.message || 'Failed to initialize payment');
      }
      
    } catch (error) {
      console.error('Paystack initialization error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to initialize payment');
      setPaystackLoading(false);
    }
  };

  const processCreateFine = async () => {
    if (!adminPin || adminPin.length < 4) {
      toast.error('Please enter a valid admin pin');
      return;
    }
    
    setVerifyingPin(true);
    
    try {
      const pinVerification = await AuthService.verifyAdminPin(adminPin);
      
      if (!pinVerification.success) {
        toast.error('Invalid admin pin');
        setVerifyingPin(false);
        return;
      }
      
      const fineData = {
        userId: selectedMember._id || selectedMember.id,
        name: `Fine: ${fineReason}`,
        type: 'fine',
        amount: parseFloat(fineAmount),
        description: fineDescription || `Fine: ${fineReason}`,
        status: 'unpaid',
        dueDate: new Date().toISOString().split('T')[0]
      };
      
      await PaymentService.createPayment(fineData);
      
      toast.success(`Fine of ₦${parseFloat(fineAmount).toLocaleString()} created for ${selectedMember.name}. It will appear in their outstanding payments.`);
      
      setFineAmount('');
      setFineReason('');
      setFineDescription('');
      
      if (selectedMember) {
        await fetchMemberOutstandingPayments(selectedMember._id || selectedMember.id);
      }
      
      setShowAdminPinModal(false);
      setAdminPin('');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Create fine error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create fine');
    } finally {
      setVerifyingPin(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Member Payment View
  if (!isAdmin) {
    if (loadingPending) {
      return (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading pending payments...</p>
        </div>
      );
    }
    
    if (pendingPayments.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-sm text-gray-500">No pending payments or fines found</p>
          <p className="text-xs text-gray-400 mt-1">You're all up to date.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-6 w-6" />
            <h3 className="font-semibold text-lg">Make a Payment</h3>
          </div>
          <p className="text-blue-100 text-sm">Select payment type to continue</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <label className="text-sm font-medium text-gray-700">Select Payment Type</label>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingPayments.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedPaymentType(type)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    selectedPaymentType?.id === type.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{type.label}</span>
                      {type.is_fine && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Fine</span>}
                      {type.is_mandatory && !type.is_fine && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(type.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Category: {type.type?.replace('_', ' ') || 'dues'}
                    </p>
                  </div>
                  {selectedPaymentType?.id === type.id && <CheckCircle className="h-5 w-5 text-green-500" />}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={memberPayForSelfViaPaystack}
            disabled={paystackLoading || !selectedPaymentType}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {paystackLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Initializing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Pay {selectedPaymentType ? formatCurrency(selectedPaymentType.amount) : 'Now'} with Card
              </div>
            )}
          </button>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800 mb-1">Secure Payment</p>
                <p className="text-xs text-blue-700">
                  Your payment is processed securely via Paystack. We accept all major cards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Admin View
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Gavel className="h-6 w-6" />
          <h3 className="font-semibold text-lg">Admin - Create Fine</h3>
        </div>
        <p className="text-red-100 text-sm">Create fines for members (will appear as outstanding payment)</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <label className="text-sm font-medium text-gray-700">Select Member</label>
          </div>
          <div className="relative">
            <select
              value={selectedMember?._id || selectedMember?.id || ''}
              onChange={(e) => { 
                const member = members.find(m => (m._id === e.target.value) || (m.id === e.target.value)); 
                setSelectedMember(member); 
              }}
              className="w-full px-4 py-4 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              disabled={fetchingMembers}
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
          {fetchingMembers && (<div className="px-4 py-2 bg-gray-50"><p className="text-xs text-gray-500">Loading members...</p></div>)}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-red-50">
            <h4 className="font-semibold text-red-700 text-sm flex items-center gap-2">
              <Gavel className="h-4 w-4" />Create New Fine for Member
            </h4>
            <p className="text-xs text-red-600 mt-1">Fine will appear as outstanding payment for the member</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fine Amount <span className="text-red-500">*</span></label>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Fine <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={fineReason} 
                onChange={(e) => setFineReason(e.target.value)} 
                placeholder="e.g., Late payment, Meeting absence, etc." 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea 
                value={fineDescription} 
                onChange={(e) => setFineDescription(e.target.value)} 
                placeholder="Additional details about the fine..." 
                rows="3" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
              />
            </div>
            
            {selectedMember && (fineAmount || fineReason) && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-4">
                <h4 className="font-semibold text-red-700 text-sm mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />Fine Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member:</span>
                    <span className="font-medium text-gray-900">{selectedMember.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reason:</span>
                    <span className="text-gray-900">{fineReason || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-red-200">
                    <span className="text-gray-600">Fine Amount:</span>
                    <span className="font-bold text-red-600">{formatCurrency(parseFloat(fineAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-yellow-600">Unpaid</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setShowAdminPinModal(true)} 
          disabled={!selectedMember || !fineAmount || parseFloat(fineAmount) <= 0 || !fineReason} 
          className="w-full py-4 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
        >
          <div className="flex items-center justify-center">
            <Gavel className="h-5 w-5 mr-2" />Create Fine
          </div>
        </button>
        
        {(!selectedMember || !fineAmount || parseFloat(fineAmount) <= 0 || !fineReason) && (
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-sm text-gray-500">
              {!selectedMember ? 'Select a member to continue' : 'Enter fine amount and reason to continue'}
            </p>
          </div>
        )}
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
              <button onClick={() => { setShowAdminPinModal(false); setAdminPin(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-4">
              <div className="rounded-xl p-4 mb-4 bg-red-50">
                <p className="text-sm text-red-800">
                  Create fine of {formatCurrency(parseFloat(fineAmount) || 0)} for {selectedMember?.name}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  This fine will appear in member's outstanding payments
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
                      processCreateFine(); 
                    } 
                  }} 
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Enter your admin pin to authorize this fine</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowAdminPinModal(false); setAdminPin(''); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                <button 
                  onClick={processCreateFine} 
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

      <style jsx>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default PaymentForm;
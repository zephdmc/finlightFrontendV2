import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, Info, User, Shield, Lock, ArrowLeft, Wallet, TrendingUp, Clock, ChevronRight, Phone, Mail, HelpCircle, RefreshCw, FileText, Gavel, Calculator, TrendingDown } from 'lucide-react';
import PaymentService from '../../services/paymentService';
import AuthService from '../../services/authService';
import api from '../../services/api';
import { usePaymentTypes, useUsers, useCreateMemberPayment, useInitializePayment } from '../../hooks/usePaymentData';
import LoadingSpinner from '../common/LoadingSpinner';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

/**
 * Payment Form Component - Banking App Style
 * Handles creating new payments (Admin) and making payments (Members)
 */
const PaymentForm = ({ onSuccess, payments = [], isAdmin = false, paymentTypes = [], userEmail: userEmailProp = null }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [customAmount, setCustomAmount] = useState('');
  const [showPartialPaymentWarning, setShowPartialPaymentWarning] = useState(false);

  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef(null);
  const initialFetchDoneRef = useRef(false);
  const membersLoadedRef = useRef(false);

  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');
  const [fineDescription, setFineDescription] = useState('');

  // Fee calculation state - only shown when payment type is selected
  const [feeCalculation, setFeeCalculation] = useState(null);
  const [organizationReceives, setOrganizationReceives] = useState(0);
  const [memberTotalPayable, setMemberTotalPayable] = useState(0);

  // ========== REACT QUERY HOOKS ==========
  const {
    data: paymentTypesData = [],
    isLoading: typesLoading,
    refetch: refetchPaymentTypes
  } = usePaymentTypes();

  const {
    data: usersData = [],
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useUsers('member', 100);

  const createMemberPayment = useCreateMemberPayment();
  const initializePayment = useInitializePayment();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process members data from React Query - OPTIMIZED: only processes when data is actually available
  useEffect(() => {
    if (isAdmin && usersData && usersData.length > 0 && !membersLoadedRef.current) {
      const membersList = usersData.filter(user => user.role === 'member');
      setMembers(membersList);
      membersLoadedRef.current = true;
    } else if (isAdmin && usersData && usersData.length === 0 && !usersLoading && !membersLoadedRef.current) {
      setMembers([]);
      membersLoadedRef.current = true;
    }
  }, [usersData, usersLoading, isAdmin]);

  // Initial load - only once
  useEffect(() => {
    if (isAdmin && !membersLoadedRef.current) {
      // Use cached data if available, otherwise fetch
      if (usersData && usersData.length > 0) {
        const membersList = usersData.filter(user => user.role === 'member');
        setMembers(membersList);
        membersLoadedRef.current = true;
      } else if (!usersLoading) {
        // Only fetch if no cached data and not already loading
        refetchUsers();
      }
    }
  }, [isAdmin, usersData, usersLoading, refetchUsers]);

  useEffect(() => {
    if (!isAdmin) {
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

  /**
   * Calculate what member should pay including fees
   */
  const calculateMemberPayable = (targetOrganizationAmount) => {
    if (!targetOrganizationAmount || targetOrganizationAmount <= 0) return 0;
    // Member pays = target / 0.94 (2% Flutterwave + 4% platform = 6% total)
    let memberPays = targetOrganizationAmount / 0.94;
    return Math.ceil(memberPays);
  };

  /**
   * Calculate complete fee breakdown for display
   */
  const calculateFeeBreakdown = (memberPaysAmount) => {
    if (!memberPaysAmount || memberPaysAmount <= 0) return null;

    const flutterwaveFee = memberPaysAmount * 0.02;   // 2%
    const platformFee = memberPaysAmount * 0.04;      // 4%
    const totalFees = flutterwaveFee + platformFee;
    const organizationGets = memberPaysAmount - totalFees;

    return {
      memberPays: memberPaysAmount,
      flutterwaveFee: Math.round(flutterwaveFee),
      platformFee: Math.round(platformFee),
      organizationReceives: Math.round(organizationGets),
      totalFees: Math.round(totalFees)
    };
  };

  // Update fee calculation when selected payment type changes
  useEffect(() => {
    if (selectedPaymentType && !isAdmin) {
      const targetOrgAmount = selectedPaymentType.amount;
      const memberPays = calculateMemberPayable(targetOrgAmount);
      const breakdown = calculateFeeBreakdown(memberPays);

      if (breakdown) {
        setFeeCalculation(breakdown);
        setOrganizationReceives(breakdown.organizationReceives);
        setMemberTotalPayable(breakdown.memberPays);
      }
    }
  }, [selectedPaymentType, isAdmin]);

  // Update fee calculation when custom amount changes
  useEffect(() => {
    if (customAmount && parseFloat(customAmount) > 0 && selectedPaymentType && !isAdmin) {
      const memberPays = parseFloat(customAmount);
      const breakdown = calculateFeeBreakdown(memberPays);

      if (breakdown) {
        setFeeCalculation(breakdown);
        setOrganizationReceives(breakdown.organizationReceives);
        setMemberTotalPayable(breakdown.memberPays);
      }
    } else if (selectedPaymentType && !customAmount) {
      const targetOrgAmount = selectedPaymentType.amount;
      const memberPays = calculateMemberPayable(targetOrgAmount);
      const breakdown = calculateFeeBreakdown(memberPays);

      if (breakdown) {
        setFeeCalculation(breakdown);
        setOrganizationReceives(breakdown.organizationReceives);
        setMemberTotalPayable(breakdown.memberPays);
      }
    }
  }, [customAmount, selectedPaymentType, isAdmin]);

  const fetchMemberOutstandingPayments = async (memberId) => {
    setLoadingMemberOutstanding(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login again');
        return;
      }

      const paymentTypesResponse = await api.get('/payment-types');
      let allPaymentTypes = paymentTypesResponse.data?.data?.records || paymentTypesResponse.data?.data || [];

      const paymentsResponse = await api.get(`/payments/all?userId=${memberId}`);
      let memberPayments = paymentsResponse.data?.data?.records || paymentsResponse.data?.data || [];

      const paidPaymentTypeIds = new Set();
      const outstandingPaymentRecords = new Map();

      memberPayments.forEach(payment => {
        const isPaid = payment.status === 'paid' || payment.paidAt !== null;

        if (isPaid && payment.paymentTypeId) {
          paidPaymentTypeIds.add(payment.paymentTypeId.toString());
        }

        if (payment.status === 'paid' && payment.remainingAmount > 0) {
          outstandingPaymentRecords.set(payment.paymentTypeId?.toString(), {
            ...payment,
            outstandingAmount: payment.remainingAmount
          });
        }

        if (payment.status === 'unpaid' && payment.paymentTypeId && !payment.paidAt) {
          outstandingPaymentRecords.set(payment.paymentTypeId?.toString(), {
            ...payment,
            outstandingAmount: payment.amount
          });
        }
      });

      const outstandingPaymentTypes = [];

      for (const type of allPaymentTypes) {
        const typeIdStr = type._id.toString();
        const existingRecord = outstandingPaymentRecords.get(typeIdStr);

        if (existingRecord && existingRecord.outstandingAmount > 0) {
          outstandingPaymentTypes.push({
            id: type._id,
            value: type.name.toLowerCase().replace(/\s+/g, '_'),
            label: `${type.name} (Outstanding: ${formatCurrency(existingRecord.outstandingAmount)})`,
            originalAmount: type.amount,
            amount: existingRecord.outstandingAmount,
            is_mandatory: type.is_mandatory || false,
            frequency: type.frequency || 'one-time',
            description: type.description,
            type: type.type || 'dues',
            is_fine: false,
            is_outstanding_type: true,
            hasOutstandingBalance: true,
            originalPaymentId: existingRecord._id
          });
        }
        else if (!paidPaymentTypeIds.has(typeIdStr) && !existingRecord) {
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
            is_outstanding_type: true,
            hasOutstandingBalance: false
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

  const fetchPendingPayments = async () => {
    if (isFetchingRef.current) {
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

      const paymentTypesResponse = await api.get('/payment-types');
      let allPaymentTypes = paymentTypesResponse.data?.data?.records || paymentTypesResponse.data?.data || [];

      const paymentsResponse = await api.get('/payments');
      let userPayments = paymentsResponse.data?.data?.records || paymentsResponse.data?.data || [];

      const completedPaymentTypeIds = new Set();
      const completedPaymentNames = new Set();
      const pendingPaymentTypeIds = new Set();
      const outstandingPaymentRecords = new Map();

      userPayments.forEach(p => {
        const isCompleted = p.status === 'paid';
        const isPending = p.status === 'pending';

        if (isCompleted) {
          let paymentTypeIdValue = null;

          if (p.paymentTypeId) {
            if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
              paymentTypeIdValue = p.paymentTypeId._id.toString();
            } else if (typeof p.paymentTypeId === 'string') {
              paymentTypeIdValue = p.paymentTypeId;
            }
          }

          if (paymentTypeIdValue) {
            completedPaymentTypeIds.add(paymentTypeIdValue);
          }
          if (p.name) {
            completedPaymentNames.add(p.name);
          }

          if (p.remainingAmount > 0) {
            outstandingPaymentRecords.set(paymentTypeIdValue, {
              ...p,
              outstandingAmount: p.remainingAmount
            });
          }
        }

        if (isPending && p.paymentTypeId) {
          let paymentTypeIdValue = null;
          if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
            paymentTypeIdValue = p.paymentTypeId._id.toString();
          } else if (typeof p.paymentTypeId === 'string') {
            paymentTypeIdValue = p.paymentTypeId;
          }
          if (paymentTypeIdValue) {
            pendingPaymentTypeIds.add(paymentTypeIdValue);
          }
        }

        if (p.status === 'unpaid' && p.paymentTypeId && !p.paidAt) {
          let paymentTypeIdValue = null;
          if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
            paymentTypeIdValue = p.paymentTypeId._id.toString();
          } else if (typeof p.paymentTypeId === 'string') {
            paymentTypeIdValue = p.paymentTypeId;
          }
          if (paymentTypeIdValue) {
            outstandingPaymentRecords.set(paymentTypeIdValue, {
              ...p,
              outstandingAmount: p.amount
            });
          }
        }
      });

      const pendingPaymentRecords = userPayments
        .filter(p => p.status === 'pending' && p.paymentTypeId && p.type !== 'fine')
        .map(payment => {
          let paymentTypeName = null;
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
            paymentId: payment._id,
            label: paymentTypeName || payment.name || payment.type || 'Payment',
            amount: payment.amount,
            type: payment.type,
            is_mandatory: false,
            is_fine: false,
            is_pending: true,
            status: 'pending',
            paymentTypeId: payment.paymentTypeId
          };
        });

      const unpaidFines = userPayments
        .filter(p => p.type === 'fine' && p.status !== 'paid' && !p.paidAt)
        .map(fine => ({
          id: fine._id,
          paymentId: fine._id,
          label: `Fine: ${fine.description || fine.reason || 'Penalty'}`,
          amount: fine.amount,
          is_fine: true,
          fine_reason: fine.description || fine.reason,
          status: fine.status,
        }));

      const unpaidPaymentRecords = userPayments
        .filter(p => p.status === 'unpaid' && p.paymentTypeId && p.type !== 'fine' && !p.paidAt)
        .map(payment => {
          let paymentTypeName = null;
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
            paymentId: payment._id,
            label: paymentTypeName || payment.name || payment.type || 'Payment',
            amount: payment.amount,
            is_mandatory: false,
            is_fine: false,
            is_unpaid_record: true,
            status: 'unpaid',
            paymentTypeId: payment.paymentTypeId
          };
        });

      const outstandingPaymentTypes = allPaymentTypes
        .filter(type => {
          const typeIdStr = type._id.toString();

          if (completedPaymentTypeIds.has(typeIdStr)) {
            return false;
          }

          if (pendingPaymentTypeIds.has(typeIdStr)) {
            return false;
          }

          if (completedPaymentNames.has(type.name)) {
            return false;
          }

          return true;
        })
        .map(type => {
          const outstandingRecord = outstandingPaymentRecords.get(type._id.toString());

          return {
            id: type._id,
            paymentId: outstandingRecord?._id || null,
            label: outstandingRecord?.outstandingAmount ?
              `${type.name} (Outstanding: ${formatCurrency(outstandingRecord.outstandingAmount)})` :
              type.name,
            originalAmount: type.amount,
            amount: outstandingRecord?.outstandingAmount || type.amount,
            is_mandatory: type.is_mandatory || false,
            frequency: type.frequency || 'one-time',
            description: type.description,
            type: type.type || 'dues',
            is_fine: false,
            is_outstanding_type: true,
            status: 'unpaid',
            paymentTypeId: type._id,
            hasOutstandingBalance: !!outstandingRecord?.outstandingAmount,
            originalPaymentId: outstandingRecord?._id
          };
        });

      const itemsMap = new Map();

      for (const item of pendingPaymentRecords) {
        const key = item.paymentTypeId?.toString() || item.label;
        itemsMap.set(key, { ...item, priority: 1 });
      }

      for (const item of unpaidPaymentRecords) {
        const key = item.paymentTypeId?.toString() || item.label;
        if (!itemsMap.has(key)) {
          itemsMap.set(key, { ...item, priority: 2 });
        }
      }

      for (const item of outstandingPaymentTypes) {
        const key = item.paymentTypeId?.toString() || item.label;
        if (!itemsMap.has(key)) {
          itemsMap.set(key, { ...item, priority: 3 });
        }
      }

      for (const item of unpaidFines) {
        const key = `fine_${item.id}`;
        itemsMap.set(key, { ...item, priority: 1 });
      }

      const allPending = Array.from(itemsMap.values());
      allPending.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.amount - a.amount;
      });

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

  // OPTIMIZED: Use cached members directly - no extra API call
  // The fetchMembers function is no longer needed - using React Query cache directly
  // Removed fetchMembers to prevent unnecessary API calls

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

    // Get user email (same logic as before)
    let userEmail = userEmailProp;
    if (!userEmail) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userEmail = payload.email;
        }
      } catch (error) {}
    }
    if (!userEmail) {
      userEmail = localStorage.getItem('rememberEmail');
    }
    if (!userEmail) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userEmail = userObj.email || userObj.user?.email;
        }
      } catch (error) {}
    }
    if (!userEmail) {
      toast.error('User email not found. Please login again.');
      return;
    }

    let amountToPay = memberTotalPayable > 0 ? memberTotalPayable : selectedPaymentType.amount;
    if (customAmount && parseFloat(customAmount) > 0) {
      amountToPay = parseFloat(customAmount);
    }
    const targetOrgAmount = selectedPaymentType.amount;

    // Partial payment warning (same)
    if (customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < targetOrgAmount) {
      const confirm = window.confirm(
        `You are about to pay ${formatCurrency(parseFloat(customAmount))} instead of the full required amount of ${formatCurrency(targetOrgAmount)}.\n\n` +
        `This will create an outstanding balance of ${formatCurrency(targetOrgAmount - parseFloat(customAmount))} that you'll need to pay later.\n\n` +
        `Do you want to continue?`
      );
      if (!confirm) return;
    }

    setPaystackLoading(true); // keep state name (or rename to flutterwaveLoading)

    try {
      let paymentId = selectedPaymentType.paymentId || selectedPaymentType.id;
      let existingPayment = null;

      if (selectedPaymentType.is_pending && selectedPaymentType.paymentId) {
        existingPayment = { _id: selectedPaymentType.paymentId };
      } else if (selectedPaymentType.hasOutstandingBalance && selectedPaymentType.originalPaymentId) {
        existingPayment = { _id: selectedPaymentType.originalPaymentId };
      }

      if (!existingPayment) {
        const paymentName = selectedPaymentType.label || selectedPaymentType.name || 'Payment';
        const paymentTypeValue = getPaymentTypeValue(selectedPaymentType);
        const paymentAmount = targetOrgAmount;
        const paymentDescription = selectedPaymentType.description || `${paymentName} payment`;
        const paymentTypeId = selectedPaymentType.id;

        const paymentData = {
          name: paymentName,
          type: paymentTypeValue,
          amount: paymentAmount,
          description: paymentDescription,
          paymentTypeId: paymentTypeId
        };

        const createResult = await createMemberPayment.mutateAsync(paymentData);
        existingPayment = createResult.data || createResult;
      }

      // Initialize payment on backend
      const initResponse = await api.post('/payment-gateway/initialize', {
        email: userEmail,
        amount: amountToPay,
        paymentId: existingPayment._id
        // organizationSubaccount is now fetched by backend
      });

      const { success, data } = initResponse.data;
      if (!success) throw new Error(initResponse.data.message || 'Initialization failed');

      // Flutterwave modal configuration
      const config = {
        public_key: process.env.REACT_APP_FLW_PUBLIC_KEY,
        tx_ref: data.reference,
        amount: amountToPay,
        currency: 'NGN',
        payment_options: 'card',
        customer: {
          email: userEmail,
          name: userEmail.split('@')[0],
        },
        customizations: {
          title: 'AGFMA Payment',
          description: `Payment for ${selectedPaymentType.label || 'dues'}`,
          logo: 'https://your-logo-url.com/logo.png', // optional
        },
        redirect_url: `${window.location.origin}/payment-verify`, // fallback
        meta: {
          payment_id: existingPayment._id
        }
      };

      const handleFlutterPayment = useFlutterwave(config);
      handleFlutterPayment({
        callback: (response) => {
          if (response.status === 'successful') {
            toast.success('Payment successful! Verifying...');
            // Optionally call verification endpoint
            verifyPaymentOnBackend(response.tx_ref);
          } else if (response.status === 'cancelled') {
            toast.error('Payment was cancelled');
          } else {
            toast.error('Payment failed. Please try again.');
          }
          closePaymentModal();
          setPaystackLoading(false);
          fetchPendingPayments(); // refresh list
          if (onSuccess) onSuccess();
        },
        onClose: () => {
          setPaystackLoading(false);
        },
      });

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to initialize payment');
      setPaystackLoading(false);
    }
  };


  const verifyPaymentOnBackend = async (reference) => {
    try {
      const response = await api.get(`/payment-gateway/verify/${reference}`);
      if (response.data.success) {
        toast.success('Payment verified successfully!');
        fetchPendingPayments();
      } else {
        toast.error('Verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Could not verify payment status.');
    }
  };
  // const memberPayForSelfViaPaystack = async () => {
  //   if (!selectedPaymentType) {
  //     toast.error('Please select a payment type');
  //     return;
  //   }

  //   // Use the userEmail prop if available (passed from parent)
  //   let userEmail = userEmailProp;

  //   // Fallback: Try to get from localStorage if prop is not provided
  //   if (!userEmail) {
  //     try {
  //       const token = localStorage.getItem('token');
  //       if (token) {
  //         const payload = JSON.parse(atob(token.split('.')[1]));
  //         userEmail = payload.email;
  //         console.log('Email from token payload:', userEmail);
  //       }
  //     } catch (error) {
  //       console.error('Error decoding token:', error);
  //     }
  //   }

  //   // Fallback: Try rememberEmail
  //   if (!userEmail) {
  //     userEmail = localStorage.getItem('rememberEmail');
  //     console.log('Email from rememberEmail:', userEmail);
  //   }

  //   // Fallback: Try from localStorage user object
  //   if (!userEmail) {
  //     try {
  //       const userStr = localStorage.getItem('user');
  //       if (userStr) {
  //         const userObj = JSON.parse(userStr);
  //         userEmail = userObj.email || userObj.user?.email;
  //         console.log('Email from user object:', userEmail);
  //       }
  //     } catch (error) {
  //       console.error('Error parsing user from localStorage:', error);
  //     }
  //   }

  //   if (!userEmail) {
  //     toast.error('User email not found. Please login again.');
  //     return;
  //   }

  //   let amountToPay = memberTotalPayable > 0 ? memberTotalPayable : selectedPaymentType.amount;

  //   if (customAmount && parseFloat(customAmount) > 0) {
  //     amountToPay = parseFloat(customAmount);
  //   }

  //   const targetOrgAmount = selectedPaymentType.amount;

  //   if (customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < targetOrgAmount) {
  //     const confirm = window.confirm(
  //       `You are about to pay ${formatCurrency(parseFloat(customAmount))} instead of the full required amount of ${formatCurrency(targetOrgAmount)}.\n\n` +
  //       `This will create an outstanding balance of ${formatCurrency(targetOrgAmount - parseFloat(customAmount))} that you'll need to pay later.\n\n` +
  //       `Do you want to continue?`
  //     );
  //     if (!confirm) return;
  //   }

  //   setPaystackLoading(true);

  //   try {
  //     let paymentId = selectedPaymentType.paymentId || selectedPaymentType.id;
  //     let existingPayment = null;

  //     if (selectedPaymentType.is_pending && selectedPaymentType.paymentId) {
  //       existingPayment = { _id: selectedPaymentType.paymentId };
  //       console.log('Resuming pending payment:', existingPayment._id);
  //     }

  //     if (selectedPaymentType.hasOutstandingBalance && selectedPaymentType.originalPaymentId) {
  //       existingPayment = { _id: selectedPaymentType.originalPaymentId };
  //       console.log('Paying outstanding balance for payment:', existingPayment._id);
  //     }

  //     if (!existingPayment) {
  //       const paymentName = selectedPaymentType.label || selectedPaymentType.name || 'Payment';
  //       const paymentTypeValue = getPaymentTypeValue(selectedPaymentType);
  //       const paymentAmount = targetOrgAmount;
  //       const paymentDescription = selectedPaymentType.description || `${paymentName} payment`;
  //       const paymentTypeId = selectedPaymentType.id;

  //       const paymentData = {
  //         name: paymentName,
  //         type: paymentTypeValue,
  //         amount: paymentAmount,
  //         description: paymentDescription,
  //         paymentTypeId: paymentTypeId
  //       };

  //       console.log('Creating payment with data:', paymentData);

  //       const createResult = await createMemberPayment.mutateAsync(paymentData);
  //       existingPayment = createResult.data || createResult;
  //     }

  //     const organizationSubaccount = null;

  //     console.log('=== SENDING TO PAYMENT GATEWAY ===');
  //     console.log('Email:', userEmail);
  //     console.log('Amount:', amountToPay);
  //     console.log('Payment ID:', existingPayment._id);

  //     await initializePayment.mutateAsync({
  //       email: userEmail,
  //       amount: amountToPay,
  //       paymentId: existingPayment._id,
  //       organizationSubaccount: organizationSubaccount
  //     });

  //   } catch (error) {
  //     console.error('Paystack initialization error:', error);
  //     toast.error(error.response?.data?.message || error.message || 'Failed to initialize payment');
  //     setPaystackLoading(false);
  //   }
  // };

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

      toast.success(`Fine of ${formatCurrency(parseFloat(fineAmount))} created for ${selectedMember.name}. It will appear in their outstanding payments.`);

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

        {/* Payment Method Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <label className="text-sm font-medium text-gray-700 block mb-2">Payment Method</label>
          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'card'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Card Payment
            </button>
            <button
              onClick={() => {
                setPaymentMethod('transfer');
                toast.info('Bank transfer option will be available soon. For now, please use card payment.', {
                  duration: 4000
                });
              }}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'transfer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              Bank Transfer
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Payment Type Selection List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <label className="text-sm font-medium text-gray-700">Select Payment Type</label>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingPayments.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedPaymentType(type);
                    setCustomAmount('');
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    selectedPaymentType?.id === type.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{type.label}</span>
                      {type.is_fine && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Fine</span>}
                      {type.is_mandatory && !type.is_fine && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>}
                      {type.is_pending && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                      {type.hasOutstandingBalance && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Partial Payment
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(type.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Category: {type.type?.replace('_', ' ') || 'dues'}
                    </p>
                    {type.hasOutstandingBalance && type.originalAmount && (
                      <p className="text-xs text-orange-600 mt-1">
                        Original amount: {formatCurrency(type.originalAmount)}
                      </p>
                    )}
                    {type.is_pending && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Previous payment attempt was not completed. Click to retry.
                      </p>
                    )}
                  </div>
                  {selectedPaymentType?.id === type.id && <CheckCircle className="h-5 w-5 text-green-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input for Partial Payments */}
          {selectedPaymentType && !selectedPaymentType.is_fine && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Custom Amount (Optional)
                <span className="text-xs text-gray-400 ml-2">- Enter the amount you want to pay</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Ã¢â€šÂ¦</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setCustomAmount(e.target.value);
                    if (value > 0) {
                      if (value < selectedPaymentType.amount) {
                        setShowPartialPaymentWarning(true);
                      } else {
                        setShowPartialPaymentWarning(false);
                      }
                    } else {
                      setShowPartialPaymentWarning(false);
                    }
                  }}
                  placeholder={`Enter custom amount (Organization receives: ${formatCurrency(selectedPaymentType.amount)})`}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {showPartialPaymentWarning && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                      You're making a partial payment of {formatCurrency(parseFloat(customAmount) || 0)}.
                      Organization will receive this amount (minus fees).
                      You will need to pay the remaining balance of{' '}
                      <strong>{formatCurrency(selectedPaymentType.amount - (parseFloat(customAmount) || 0))}</strong> later.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fee Breakdown Display */}
          {selectedPaymentType && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Payment Breakdown</p>
              </div>

              {(() => {
                const targetOrgAmount = selectedPaymentType.amount;
                const memberPays = customAmount && parseFloat(customAmount) > 0
                  ? parseFloat(customAmount)
                  : calculateMemberPayable(targetOrgAmount);
                const breakdown = calculateFeeBreakdown(memberPays);

                if (!breakdown) return null;

                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">You Pay (Total):</span>
                      <span className="font-bold text-gray-900 text-lg">{formatCurrency(breakdown.memberPays)}</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Organization receives:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(breakdown.organizationReceives)}</span>
                      </div>
                      <div className="flex justify-between text-red-500">
  <span>Flutterwave Fee (2%):</span>
  <span>-{formatCurrency(breakdown.flutterwaveFee)}</span>
</div>
<div className="flex justify-between text-orange-500">
  <span>Platform Fee (4%):</span>
  <span>-{formatCurrency(breakdown.platformFee)}</span>
</div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-xs text-gray-400">
                      <span>Total Fees:</span>
                      <span>{formatCurrency(breakdown.totalFees)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={memberPayForSelfViaPaystack}
            disabled={paystackLoading || createMemberPayment.isLoading || initializePayment.isLoading || !selectedPaymentType}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {(paystackLoading || createMemberPayment.isLoading || initializePayment.isLoading) ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Initializing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Pay {selectedPaymentType ?
                  formatCurrency(
                    customAmount && parseFloat(customAmount) > 0
                      ? parseFloat(customAmount)
                      : calculateMemberPayable(selectedPaymentType.amount)
                  ) : 'Now'}
                with Card
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
  Your payment is processed securely via Flutterwave. We accept all major cards.
  The organization will receive exactly what they requested - fees are added on top.
</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ==================== ADMIN VIEW ====================
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Gavel className="h-6 w-6" />
              <h3 className="font-semibold text-lg">Admin - Create Fine</h3>
            </div>
            <p className="text-red-100 text-sm">Create fines for members (will appear as outstanding payment)</p>
          </div>
        </div>
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
              disabled={usersLoading && members.length === 0}
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
          {usersLoading && members.length === 0 && (
            <div className="px-4 py-2 bg-gray-50">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                Loading members...
              </p>
            </div>
          )}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fine Amount (Organization will receive this amount) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Ã¢â€šÂ¦</span>
                <input
                  type="number"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              {parseFloat(fineAmount) > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Member will pay approximately {formatCurrency(calculateMemberPayable(parseFloat(fineAmount)))} (includes fees)
                </p>
              )}
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
                    <span className="text-gray-600">Organization Receives:</span>
                    <span className="font-bold text-green-700">{formatCurrency(parseFloat(fineAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Pays (approx):</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculateMemberPayable(parseFloat(fineAmount) || 0))}</span>
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
              <button onClick={() => { setShowAdminPinModal(false); setAdminPin(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">Ãƒâ€”</button>
            </div>
            <div className="p-4">
              <div className="rounded-xl p-4 mb-4 bg-red-50">
                <p className="text-sm text-red-800">
                  Create fine of {formatCurrency(parseFloat(fineAmount) || 0)} for {selectedMember?.name}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Member will pay approximately {formatCurrency(calculateMemberPayable(parseFloat(fineAmount) || 0))}
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
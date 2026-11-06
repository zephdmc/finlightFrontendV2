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

    const [paymentInProgress, setPaymentInProgress] = useState(false);
    const isFetchingRef = useRef(false);
    const fetchTimeoutRef = useRef(null);
    const initialFetchDoneRef = useRef(false);
    const membersLoadedRef = useRef(false);

    const [outstandingPayments, setOutstandingPayments] = useState([]);
    const [loadingOutstanding, setLoadingOutstanding] = useState(false);

    const [fineAmount, setFineAmount] = useState('');
    const [fineReason, setFineReason] = useState('');
    const [fineDescription, setFineDescription] = useState('');

    // Fee calculation state - only shown when payment type is selected
    const [feeCalculation, setFeeCalculation] = useState(null);
    const [organizationReceives, setOrganizationReceives] = useState(0);
    const [memberTotalPayable, setMemberTotalPayable] = useState(0);

    // Ã¢Â­Â NEW: Tab filter state for payment types
    const [paymentFilterTab, setPaymentFilterTab] = useState('all');

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

    // Add this state with the other useState declarations
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const createMemberPayment = useCreateMemberPayment();
    const initializePayment = useInitializePayment();
    const [verifyingPayment, setVerifyingPayment] = useState(false);
    const showVerifyButton = selectedPaymentType?.is_pending && selectedPaymentType?.paymentId;
    // ========== FLUTTERWAVE HOOK ==========
    // IMPORTANT: Hooks must be called at the top level, not inside functions
    const handleFlutterwavePayment = useFlutterwave();

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

    const fetchOutstandingPayments = async () => {
        if (!isAdmin) return;
        setLoadingOutstanding(true);
        try {
            const response = await api.get('/payments/outstanding');
            const payments = response.data?.data?.payments || response.data?.data || [];
            setOutstandingPayments(payments);
        } catch (error) {
            console.error('Error fetching outstanding payments:', error);
        } finally {
            setLoadingOutstanding(false);
        }
    };

    /**
     * Calculate what member should pay including fees
     */
    const calculateMemberPayable = (targetOrganizationAmount) => {
        if (!targetOrganizationAmount || targetOrganizationAmount <= 0) return 0;
        // Member pays = target / 0.94 (2% Flutterwave + 4% platform = 6% total)
        let memberPays = targetOrganizationAmount / 0.96;
        return Math.ceil(memberPays);
    };
    const formatPeriodKey = (periodKey) => {
        if (!periodKey) return 'Unknown';
        if (periodKey.match(/^\d{4}-\d{2}$/)) {
            const [year, month] = periodKey.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        return periodKey;
    };
    /**
     * Calculate complete fee breakdown for display
     */
    const calculateFeeBreakdown = (memberPaysAmount) => {
        if (!memberPaysAmount || memberPaysAmount <= 0) return null;

        const flutterwaveFee = memberPaysAmount * 0.02;   // 2%
        const platformFee = memberPaysAmount * 0.02;      // 2%
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

    useEffect(() => {
        const cleanupExpiredPayments = async () => {
            if (isAdmin || loadingPending) return;

            try {
                const paymentsResponse = await api.get('/payments');
                const userPayments = paymentsResponse.data?.data?.records || paymentsResponse.data?.data || [];

                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const expiredPayments = userPayments.filter(
                    p => p.status === 'pending' && new Date(p.createdAt) < twentyFourHoursAgo
                );

                if (expiredPayments.length > 0) {
                    for (const payment of expiredPayments) {
                        await api.delete(`/payments/${payment._id}`).catch(() => { });
                    }
                    // Refresh the list
                    await fetchPendingPayments();
                    // Also refetch payment types to ensure they appear
                    await refetchPaymentTypes();
                    toast.info(`${expiredPayments.length} expired payment(s) cleared`);
                }
            } catch (error) {
                console.error('Error cleaning up expired payments:', error);
            }
        };

        if (!isAdmin) {
            cleanupExpiredPayments();
        }
    }, [isAdmin, loadingPending]);

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

            // ===== FIX: Only track ACTIVE pending payments =====
            const activePendingPaymentTypeIds = new Set();

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
                }

                // ===== Only add if there's an ACTUAL pending payment record =====
                if (isPending && p.paymentTypeId) {
                    let paymentTypeIdValue = null;
                    if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
                        paymentTypeIdValue = p.paymentTypeId._id.toString();
                    } else if (typeof p.paymentTypeId === 'string') {
                        paymentTypeIdValue = p.paymentTypeId;
                    }
                    if (paymentTypeIdValue) {
                        activePendingPaymentTypeIds.add(paymentTypeIdValue);
                    }
                }
            });

            // ===== Get ALL pending payments =====
            const allPendingPayments = userPayments
                .filter(p =>
                    (p.status === 'pending' || p.type === 'outstanding') &&
                    p.type !== 'fine' &&
                    p.status !== 'partial'  // Ã¢Å“â€¦ Exclude partial payments
                )
                .map(payment => {
                    let paymentTypeName = null;
                    let paymentTypeId = null;

                    if (payment.paymentTypeId) {
                        if (typeof payment.paymentTypeId === 'object' && payment.paymentTypeId._id) {
                            paymentTypeId = payment.paymentTypeId._id.toString();
                        } else if (typeof payment.paymentTypeId === 'string') {
                            paymentTypeId = payment.paymentTypeId;
                        }

                        if (paymentTypeId) {
                            const paymentType = allPaymentTypes.find(t => t._id.toString() === paymentTypeId);
                            if (paymentType) {
                                paymentTypeName = paymentType.name;
                            }
                        }
                    }

                    const displayName = paymentTypeName || payment.name || 'Payment';
                    // Ã¢Å“â€¦ Determine if this is an outstanding record
                    const isOutstanding = payment.type === 'outstanding';
                    return {
                        id: payment._id,
                        paymentId: payment._id,
                        label: isOutstanding ? `${displayName} (Outstanding Balance)` : displayName,
                        amount: isOutstanding ? payment.remainingAmount || payment.amount : payment.amount || 0,
                        originalAmount: payment.originalAmount || payment.targetOrgAmount || payment.amount,
                        remainingAmount: payment.remainingAmount,
                        totalPaidSoFar: payment.totalPaidSoFar || 0,
                        type: payment.type || 'payment',
                        is_mandatory: false,
                        is_fine: false,
                        is_pending: payment.status === 'pending',
                        is_outstanding: isOutstanding,
                        status: payment.status,
                        paymentTypeId: paymentTypeId || payment.paymentTypeId,
                        description: payment.description,
                        priority: isOutstanding ? 0 : 1,
                        transactionReference: payment.transactionReference,
                        months: payment.months || [],
                        monthCount: payment.monthCount || 0,
                        monthlyPrice: payment.monthlyPrice || 0
                    };
                });

            // ===== Filter outstanding payment types =====
            const outstandingPaymentTypes = allPaymentTypes
                .filter(type => {
                    const typeIdStr = type._id.toString();

                    // Log for debugging

                    // If already paid, exclude
                    if (completedPaymentTypeIds.has(typeIdStr)) {
                        return false;
                    }

                    // ===== FIX: Only exclude if there's an ACTIVE pending payment =====
                    if (activePendingPaymentTypeIds.has(typeIdStr)) {
                        return false;
                    }

                    // Ã¢Å“â€¦ CHECK IF THERE'S A PARTIAL PAYMENT FOR THIS TYPE
                    const hasPartialPayment = userPayments.some(p => {
                        if (!p.paymentTypeId) return false;

                        let paymentTypeIdStr = null;

                        // Handle different formats of paymentTypeId
                        if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
                            paymentTypeIdStr = p.paymentTypeId._id.toString();
                        } else if (typeof p.paymentTypeId === 'string') {
                            paymentTypeIdStr = p.paymentTypeId;
                        } else if (p.paymentTypeId && p.paymentTypeId.toString) {
                            paymentTypeIdStr = p.paymentTypeId.toString();
                        }

                        // Also check if the payment type matches by name (fallback)
                        const matchesById = paymentTypeIdStr === typeIdStr;
                        const matchesByName = p.name && p.name === type.name && p.isPartial === true;

                        return (matchesById || matchesByName) && p.isPartial === true;
                    });
                    if (hasPartialPayment) {
                        return false;  // Ã¢Å“â€¦ Don't show outstanding type if there's already a partial payment
                    }
                    // If completed by name, exclude
                    if (completedPaymentNames.has(type.name)) {
                        return false;
                    }

                    return true;
                })
                .map(type => {
                    return {
                        id: type._id,
                        paymentId: null,
                        label: type.name,
                        amount: type.amount,
                        is_mandatory: type.is_mandatory || false,
                        frequency: type.frequency || 'one-time',
                        description: type.description,
                        type: type.type || 'dues',
                        is_fine: false,
                        is_outstanding_type: true,
                        status: 'unpaid',
                        paymentTypeId: type._id,
                        hasOutstandingBalance: false,
                        originalPaymentId: null,
                        priority: 0,
                        months: [],
                        monthCount: 0,
                        monthlyPrice: type.amount || 0
                    };
                });

            // ===== Build itemsMap =====
            const itemsMap = new Map();

            // Add pending payments
            for (const item of allPendingPayments) {
                const key = item.paymentId.toString();
                itemsMap.set(key, { ...item, priority: 0 });
            }

            // Add outstanding payment types
            for (const item of outstandingPaymentTypes) {
                const key = item.paymentTypeId?.toString() || item.label;
                if (!itemsMap.has(key)) {
                    itemsMap.set(key, { ...item });
                }
            }

            // Add unpaid fines
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
                    priority: 2
                }));

            for (const item of unpaidFines) {
                const key = `fine_${item.id}`;
                itemsMap.set(key, { ...item });
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



    const lastVerifyAttempt = useRef(0);

    const verifyPendingPayment = async () => {
        // 1. Prevent rapid clicking
        const now = Date.now();
        if (now - lastVerifyAttempt.current < 5000) {
            toast.info('Please wait a moment before trying again');
            return;
        }
        lastVerifyAttempt.current = now;

        // 2. Prevent double submission
        if (verifyingPayment) return;

        // 3. Validate payment exists
        if (!selectedPaymentType?.paymentId) {
            toast.error('No payment to verify');
            return;
        }

        setVerifyingPayment(true);

        try {
            // 4. Get payment details with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const paymentResponse = await api.get(
                `/payments/${selectedPaymentType.paymentId}`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            const payment = paymentResponse.data.data;

            // 5. Already paid? No need to verify
            if (payment.status === 'paid') {
                toast.success('Ã¢Å“â€¦ Payment already verified!');
                fetchPendingPayments();
                if (onSuccess) onSuccess();
                return;
            }

            // 6. Must have a transaction reference
            if (!payment.transactionReference) {
                toast.error('No transaction reference found. Please contact support.');
                return;
            }

            // 7. Call verify endpoint with timeout
            toast.loading('Verifying payment...', { id: 'verify-payment' });
            const verifyController = new AbortController();
            const verifyTimeout = setTimeout(() => verifyController.abort(), 30000);

            const verifyResponse = await api.get(
                `/payment-gateway/verify/${payment.transactionReference}`,
                { signal: verifyController.signal }
            );
            clearTimeout(verifyTimeout);

            toast.dismiss('verify-payment');

            // 8. Handle response
            if (verifyResponse.data.success) {
                const status = verifyResponse.data.data.status;
                if (status === 'paid') {
                    toast.success('Ã¢Å“â€¦ Payment verified successfully!');
                    fetchPendingPayments();
                    if (onSuccess) onSuccess();
                } else if (status === 'pending') {
                    toast.info('Ã¢ÂÂ³ Payment is still processing. Please wait a few minutes.');
                } else {
                    toast.warning(`Payment status: ${status}`);
                }
            } else {
                toast.error('Verification failed. Please try again.');
            }
        } catch (error) {
            toast.dismiss('verify-payment');

            if (error.name === 'AbortError') {
                toast.error('Verification timed out. Please try again.');
            } else {
                console.error('Verification error:', error);
                toast.error(error.response?.data?.message || 'Could not verify payment');
            }
        } finally {
            setVerifyingPayment(false);
        }
    };

    const getPaymentTypeValue = (paymentType) => {
        if (paymentType.type) {
            return paymentType.type;
        }
        return 'dues';
    };

    // ========== FIXED PAYMENT FUNCTION ==========
    const memberPayForSelfViaPaystack = async () => {

        // At the start of memberPayForSelfViaPaystack:
        // Clear any old pending payment data
        sessionStorage.removeItem('pendingPaymentId');
        sessionStorage.removeItem('pendingTxRef');
        sessionStorage.removeItem('verifyingInProgress');

        if (!selectedPaymentType) {
            toast.error('Please select a payment type');
            return;
        }

        // Get user email
        let userEmail = userEmailProp;
        if (!userEmail) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userEmail = payload.email;
                }
            } catch (error) { }
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
            } catch (error) { }
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

        // Partial payment warning
        if (customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < targetOrgAmount) {
            const confirm = window.confirm(
                `You are about to pay ${formatCurrency(parseFloat(customAmount))} instead of the full required amount of ${formatCurrency(targetOrgAmount)}.\n\n` +
                `This will create an outstanding balance of ${formatCurrency(targetOrgAmount - parseFloat(customAmount))} that you'll need to pay later.\n\n` +
                `Do you want to continue?`
            );
            if (!confirm) return;
        }

        setPaystackLoading(true);
        setPaymentInProgress(true);
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
                // ============================================================
                // ⭐ Build payload — only include optional fields if they have valid values
                // ============================================================
                const paymentData = {
                    name: paymentName,
                    type: paymentTypeValue,
                    amount: paymentAmount,
                    description: paymentDescription || '',
                    paymentTypeId: paymentTypeId,
                };

                // Only add months/monthCount/monthlyPrice if there are actual months
                const months = Array.isArray(selectedPaymentType.months) ? selectedPaymentType.months : [];
                if (months.length > 0) {
                    paymentData.months = months;
                    paymentData.monthCount = months.length;
                    paymentData.monthlyPrice = Number(selectedPaymentType.monthlyPrice) || Number(paymentAmount) || 0;
                }

                // Only add period fields if they're valid strings
                if (selectedPaymentType.periodKey && typeof selectedPaymentType.periodKey === 'string') {
                    paymentData.periodKey = selectedPaymentType.periodKey;
                }
                if (selectedPaymentType.periodStart && typeof selectedPaymentType.periodStart === 'string') {
                    paymentData.periodStart = selectedPaymentType.periodStart;
                }
                if (selectedPaymentType.periodEnd && typeof selectedPaymentType.periodEnd === 'string') {
                    paymentData.periodEnd = selectedPaymentType.periodEnd;
                }

                // const paymentData = {
                //     name: paymentName,
                //     type: paymentTypeValue,
                //     amount: paymentAmount,
                //     description: paymentDescription,
                //     paymentTypeId: paymentTypeId,
                //     months: selectedPaymentType.months || [],
                //     monthCount: selectedPaymentType.monthCount || 0,
                //     monthlyPrice: selectedPaymentType.monthlyPrice || paymentAmount,
                //     periodKey: selectedPaymentType.periodKey || null,
                //     periodStart: selectedPaymentType.periodStart || null,
                //     periodEnd: selectedPaymentType.periodEnd || null
                // };

                const createResult = await createMemberPayment.mutateAsync(paymentData);
                existingPayment = createResult.data || createResult;
            }

            // Initialize payment on backend with custom amount if set
            const initPayload = {
                paymentId: existingPayment._id
            };

            // Send custom amount to backend for partial payment
            if (customAmount && parseFloat(customAmount) > 0) {
                initPayload.amount = parseFloat(customAmount);
            }

            const initResponse = await api.post('/payment-gateway/initialize', initPayload);


            const { success, data } = initResponse.data;
            if (!success) throw new Error(initResponse.data.message || 'Initialization failed');

            // Show partial payment message if applicable
            if (data.isPartialPayment) {
                toast.success(`Partial payment initialized. Remaining balance: ${formatCurrency(data.remainingBalance)}`);
            }

            // ===== FIX: Use window.location redirect instead of modal =====
            // The modal is causing issues, so we redirect directly to Flutterwave
            if (data.authorizationUrl) {
                // Store the payment ID and reference for verification after redirect
                sessionStorage.setItem('pendingPaymentId', existingPayment._id);
                sessionStorage.setItem('pendingTxRef', data.reference);

                // Redirect to Flutterwave checkout
                window.location.href = data.authorizationUrl;
                // Set loading to false - the page will reload
                setPaymentInProgress(false);
                setPaystackLoading(false);
            } else {
                throw new Error('No payment URL received from backend');
            }

        } catch (error) {
            console.error('Payment initialization error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || error.message || 'Failed to initialize payment');
            setPaystackLoading(false);
        }
    };

    const verifyPaymentOnBackend = async (reference) => {
        // Check if already verifying
        if (sessionStorage.getItem('verifyingInProgress') === 'true') {
            return;
        }

        sessionStorage.setItem('verifyingInProgress', 'true');

        try {
            const response = await api.get(`/payment-gateway/verify/${reference}`);
            if (response.data.success) {
                toast.success('Payment verified successfully!');
                fetchPendingPayments();
                if (onSuccess) onSuccess();
                sessionStorage.removeItem('pendingPaymentId');
                sessionStorage.removeItem('pendingTxRef');
            } else {
                toast.error('Verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Could not verify payment status.');
        } finally {
            sessionStorage.removeItem('verifyingInProgress');
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

    // Ã¢Â­Â NEW: Filter available payment types by category
    const getFilteredPaymentTypes = () => {
        // If somehow 'all' is set (e.g., from old state), show contribution
        if (paymentFilterTab === 'all' || paymentFilterTab === 'contribution') {
            return pendingPayments.filter(p => {
                // Ã¢Â­Â EXCLUDE fines
                if (p.is_fine === true) return false;

                // Ã¢Â­Â EXCLUDE outstanding/partial/pending
                if (p.is_outstanding === true) return false;
                if (p.hasOutstandingBalance === true) return false;
                if (p.status === 'partial') return false;
                if (p.is_pending === true) return false;

                // Ã¢Â­Â EXCLUDE dues
                const type = (p.type || '').toLowerCase();
                if (type === 'dues' || type === 'monthly_dues') return false;

                // Ã¢Â­Â ONLY leavy/levy/contribution
                return type === 'leavy' || type === 'levy' || type === 'contribution';
            });
        }

        if (paymentFilterTab === 'fine') {
            return pendingPayments.filter(p => p.is_fine === true);
        }

        if (paymentFilterTab === 'outstanding') {
            return pendingPayments.filter(p => {
                if (p.is_fine === true) return false;
                return p.is_outstanding === true ||
                    p.hasOutstandingBalance === true ||
                    p.status === 'partial' ||
                    p.is_pending === true;
            });
        }

        return pendingPayments;
    };
    // Ã¢Â­Â NEW: Get counts for each tab
    // Ã¢Â­Â NEW: Get counts for each tab (mutually exclusive)
    // Ã¢Â­Â NEW: Get counts for each tab (mutually exclusive)
    const getTabCounts = () => {
        // Ã¢Â­Â Contribution: ONLY leavy/levy/contribution - NOT dues, NOT fines
        const contributionCount = pendingPayments.filter(p => {
            if (p.is_fine === true) return false;
            if (p.is_outstanding === true) return false;
            if (p.hasOutstandingBalance === true) return false;
            if (p.status === 'partial') return false;
            if (p.is_pending === true) return false;

            const type = (p.type || '').toLowerCase();
            if (type === 'dues' || type === 'monthly_dues') return false;

            return type === 'leavy' || type === 'levy' || type === 'contribution';
        }).length;

        // Fine count
        const fineCount = pendingPayments.filter(p => p.is_fine === true).length;

        // Outstanding count
        const outstandingCount = pendingPayments.filter(p => {
            if (p.is_fine === true) return false;
            return p.is_outstanding === true ||
                p.hasOutstandingBalance === true ||
                p.status === 'partial' ||
                p.is_pending === true;
        }).length;

        return {
            all: pendingPayments.length,
            contribution: contributionCount,
            fine: fineCount,
            outstanding: outstandingCount
        };
    };

    const tabCounts = getTabCounts();
    const filteredPaymentTypes = getFilteredPaymentTypes();

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
                        <p className="text-blue-100 text-sm">Ensure to pay the exact amount for the selected payment type</p>
                    </div>
                </div>

                {/* ============================================================
                    Ã¢Â­Â NEW: TAB FILTER - Contribution, Fine, Outstanding
                    ============================================================ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-1.5">
                    <div className="grid grid-cols-3 gap-1">
                        {[
                            // { id: 'all', label: 'All', shortLabel: 'All', count: tabCounts.all },
                            { id: 'contribution', label: 'Contribution', shortLabel: 'Contribution', count: tabCounts.contribution },
                            { id: 'fine', label: 'Fine', shortLabel: 'Fine', count: tabCounts.fine },
                            { id: 'outstanding', label: 'Outstanding', shortLabel: 'Outstanding', count: tabCounts.outstanding }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setPaymentFilterTab(tab.id)}
                                className={`relative px-1 sm:px-3 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 ${paymentFilterTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-600 to-[#2683e9] text-white shadow-lg shadow-blue-500/25'
                                    : 'text-blue-600 hover:bg-gray-50 hover:text-gray-blue'
                                    }`}
                            >
                                <span className="text-[9px] xs:text-[10px] sm:text-sm">
                                    {isMobile ? tab.shortLabel : tab.label}
                                </span>
                                {tab.count > 0 && (
                                    <span className={`text-[8px] xs:text-[9px] sm:text-xs px-1 rounded-full ${paymentFilterTab === tab.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Payment Type Selection List */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {filteredPaymentTypes.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-500">No payments in this category</p>
                                </div>
                            ) : (
                                filteredPaymentTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSelectedPaymentType({
                                                ...type, months: type.months || [],
                                                monthCount: type.monthCount || 0,
                                                monthlyPrice: type.monthlyPrice || type.amount || 0
                                            });
                                            setCustomAmount('');
                                            setShowPaymentModal(true);
                                        }}
                                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedPaymentType?.id === type.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-medium text-gray-900 text-sm">{type.label}</span>
                                                {type.is_fine && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Fine</span>}
                                                {type.is_mandatory && !type.is_fine && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Required</span>}
                                                {type.is_pending && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Pending
                                                    </span>
                                                )}
                                                {type.is_outstanding && (
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Outstanding Balance
                                                    </span>
                                                )}
                                                {type.hasOutstandingBalance && (
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Partial Payment
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(type.amount)}</p>

                                            {type.is_outstanding && type.originalAmount && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Original amount: {formatCurrency(type.originalAmount)}
                                                </p>
                                            )}

                                            {type.is_outstanding && type.remainingAmount > 0 && (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-gray-600">
                                                        Remaining: {formatCurrency(type.remainingAmount)}
                                                    </span>
                                                </div>
                                            )}

                                            {type.remainingAmount > 0 && type.status === 'partial' && type.type !== 'outstanding' && (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-orange-600">Paid: {formatCurrency(type.totalPaidSoFar || 0)}</span>
                                                    <span className="text-xs text-orange-600">Remaining: {formatCurrency(type.remainingAmount)}</span>
                                                </div>
                                            )}

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
                                                    Previous payment attempt was not completed. Click to retry after 10min if verification was not successful.
                                                </p>
                                            )}
                                        </div>
                                        {selectedPaymentType?.id === type.id && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        <p className='text-xs text-blue-500 hover:underline '>Pay Now</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ===== PAYMENT MODAL ===== */}
                    {showPaymentModal && selectedPaymentType && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-xl">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">Complete Payment</h3>
                                            <p className="text-xs text-gray-500">{selectedPaymentType.label}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setSelectedPaymentType(null);
                                            setCustomAmount('');
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="px-6 py-4 space-y-4">
                                    {/* Custom Amount Input */}
                                    {/* {!selectedPaymentType.is_fine && (
                                        <div>
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
                                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
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
                                    )} */}

                                    {/* Fee Breakdown Display */}
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
                                                        <div className="flex justify-between text-blue-500">
                                                            <span>Flutterwave Fee (2%):</span>
                                                            <span>-{formatCurrency(breakdown.flutterwaveFee)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-orange-500">
                                                            <span>Platform Fee (2%):</span>
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
                                    {selectedPaymentType?.months && selectedPaymentType.months.length > 0 && (
                                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                                            <p className="text-xs font-medium text-purple-700 mb-1"> Months</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedPaymentType.months.map(month => (
                                                    <span key={month} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                        {formatPeriodKey(month)}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-purple-600 mt-1">
                                                {selectedPaymentType.months.length} month{selectedPaymentType.months.length > 1 ? 's' : ''} total
                                            </p>
                                        </div>
                                    )}

                                    {/* ====== Partial Payment Status ====== */}
                                    {selectedPaymentType?.status === 'partial' && (
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-orange-800">Partial Payment</h4>
                                                    <div className="mt-2 space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Total Amount:</span>
                                                            <span className="font-medium">{formatCurrency(selectedPaymentType.amount)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Already Paid:</span>
                                                            <span className="font-medium text-green-600">{formatCurrency(selectedPaymentType.totalPaidSoFar || 0)}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t border-orange-200 pt-2 mt-2">
                                                            <span className="text-gray-600 font-medium">Remaining Balance:</span>
                                                            <span className="font-bold text-orange-700">{formatCurrency(selectedPaymentType.remainingAmount || 0)}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (selectedPaymentType.remainingAmount > 0) {
                                                                setCustomAmount(selectedPaymentType.remainingAmount.toString());
                                                            }
                                                        }}
                                                        className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                                                    >
                                                        Pay Remaining {formatCurrency(selectedPaymentType.remainingAmount || 0)}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ====== Ã¢Å“â€¦ VERIFY PAYMENT BUTTON ====== */}
                                    {selectedPaymentType?.is_pending && selectedPaymentType?.paymentId && (
                                        <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-yellow-800">
                                                        If you've already completed your payment, click below to verify it instantly.
                                                    </p>
                                                    <button
                                                        onClick={verifyPendingPayment}
                                                        disabled={verifyingPayment}
                                                        className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                                                    >
                                                        {verifyingPayment ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <RefreshCw className="h-4 w-4" />
                                                                Verify Payment
                                                            </>
                                                        )}
                                                    </button>
                                                    <p className="text-xs text-yellow-600 mt-1">
                                                        Your payment will also be verified automatically within 10 minutes.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pay Button */}
                                    <button
                                        onClick={() => {
                                            // Close modal and trigger payment
                                            setShowPaymentModal(false);
                                            memberPayForSelfViaPaystack();
                                        }}
                                        disabled={paymentInProgress || paystackLoading || createMemberPayment.isLoading || initializePayment.isLoading || !selectedPaymentType}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                                                Now
                                            </div>
                                        )}
                                    </button>

                                    {/* Secure Payment Note */}
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
                        </div>
                    )}


                </div>
            </div>
        );
    }

    // ==================== ADMIN VIEW ====================
    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Gavel className="h-6 w-6" />
                            <h3 className="font-semibold text-lg">Admin - Create Fine</h3>
                        </div>
                        <p className="text-blue-100 text-sm">Create fines for members (will appear as outstanding payment)</p>
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
                            className="w-full px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                    <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                        <h4 className="font-semibold text-blue-700 text-sm flex items-center gap-2">
                            <Gavel className="h-4 w-4" />Create New Fine for Member
                        </h4>
                        <p className="text-xs text-blue-600 mt-1">Fine will appear as outstanding payment for the member</p>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fine Amount (Organization will receive this amount) <span className="text-blue-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Ã¢â€šÂ¦</span>
                                <input
                                    type="number"
                                    value={fineAmount}
                                    onChange={(e) => setFineAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {parseFloat(fineAmount) > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                    Member will pay approximately {formatCurrency(calculateMemberPayable(parseFloat(fineAmount)))} (includes fees)
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Fine <span className="text-blue-500">*</span></label>
                            <input
                                type="text"
                                value={fineReason}
                                onChange={(e) => setFineReason(e.target.value)}
                                placeholder="e.g., Late payment, Meeting absence, etc."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                            <textarea
                                value={fineDescription}
                                onChange={(e) => setFineDescription(e.target.value)}
                                placeholder="Additional details about the fine..."
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {selectedMember && (fineAmount || fineReason) && (
                            <div className="bg-gradient-to-r from-blue-50 to-rose-50 rounded-2xl p-4">
                                <h4 className="font-semibold text-blue-700 text-sm mb-2 flex items-center gap-2">
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
                                    <div className="flex justify-between pt-2 border-t border-blue-200">
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
                    className="w-full py-4 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
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
                                <Lock className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Admin Verification</h3>
                            </div>
                            <button onClick={() => { setShowAdminPinModal(false); setAdminPin(''); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">Ãƒâ€”</button>
                        </div>
                        <div className="p-4">
                            <div className="rounded-xl p-4 mb-4 bg-blue-50">
                                <p className="text-sm text-blue-800">
                                    Create fine of {formatCurrency(parseFloat(fineAmount) || 0)} for {selectedMember?.name}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
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
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg text-center tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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
            {/* Add this style for the modal animation */}
            <style jsx>{`
    @keyframes slide-up {
        from { transform: translateY(100%) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
`}</style>
            <style jsx>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default PaymentForm;
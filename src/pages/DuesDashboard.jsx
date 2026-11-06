// src/pages/Member/DuesDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePayments, usePendingPayments, useCreateMemberPayment } from '../hooks/usePaymentData';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    CreditCard,
    ArrowLeft,
    RefreshCw,
    Wallet,
    ChevronRight,
    Info,
    Shield,
    Calculator,
    DollarSign,
    X,
    Tag,
    Landmark,
    ShoppingCart,
    Plus,
    Minus,
    Gavel,
    TrendingUp,
    RefreshCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const DuesDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [refreshing, setRefreshing] = useState(false);

    // ============================================================
    // STATE
    // ============================================================
    const [duesTypes, setDuesTypes] = useState([]);
    const [selectedDuesType, setSelectedDuesType] = useState(null);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [paidMonths, setPaidMonths] = useState([]);
    const [unpaidMonths, setUnpaidMonths] = useState([]);
    // ============================================================
    // NEW: Pending months (months with pending payment)
    // ============================================================
    const [pendingMonths, setPendingMonths] = useState([]);
    const [loadingDues, setLoadingDues] = useState(false);
    const [existingPayments, setExistingPayments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentInProgress, setPaymentInProgress] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [showPartialWarning, setShowPartialWarning] = useState(false);

    // ============================================================
    // â­ NEW: Paid/pending months PER dues type
    // ============================================================
    const [paidMonthsByType, setPaidMonthsByType] = useState({});
    const [pendingMonthsByType, setPendingMonthsByType] = useState({});
    const [partialPaymentsByType, setPartialPaymentsByType] = useState({});
    const [penaltiesByType, setPenaltiesByType] = useState({});

    // ============================================================
    // Penalty state
    // ============================================================
    const [penaltyInfo, setPenaltyInfo] = useState({ totalPenalty: 0, breakdown: [] });
    const [showPenaltyDetails, setShowPenaltyDetails] = useState(false);

    // ============================================================
    // Partial payments state
    // ============================================================
    const [partialPayments, setPartialPayments] = useState([]);
    const [showPartialModal, setShowPartialModal] = useState(false);
    const [selectedPartialPayment, setSelectedPartialPayment] = useState(null);

    // ============================================================
    // Pending payments state
    // ============================================================
    const [pendingPaymentsList, setPendingPaymentsList] = useState([]);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [selectedPendingPayment, setSelectedPendingPayment] = useState(null);
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    // ============================================================
    // NEW: Active pending payment (blocks month selection)
    // ============================================================
    const [activePendingPayment, setActivePendingPayment] = useState(null);

    const isFetchingRef = useRef(false);
    const initialFetchDoneRef = useRef(false);

    // Fetch hooks
    const {
        data: payments = [],
        isLoading: paymentsLoading,
        refetch: refetchPayments,
        error: paymentsError
    } = usePayments({});

    const {
        data: pendingData,
        isLoading: pendingLoading,
        refetch: refetchPending
    } = usePendingPayments();

    const createMemberPayment = useCreateMemberPayment();

    // ============================================================
    // FETCH: Dues Types AND Existing Payments
    // ============================================================
    // ============================================================
    // FETCH: Dues Types AND Existing Payments
    // ============================================================
    const fetchDuesData = async () => {
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;
        setLoadingDues(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                toast.error('Please login again');
                return;
            }

            // ============================================================
            // STEP 1: Get ALL payment types (templates)
            // ============================================================
            const paymentTypesResponse = await api.get('/payment-types');
            let allPaymentTypes = paymentTypesResponse.data?.data?.records || paymentTypesResponse.data?.data || [];

            const duesTypesOnly = allPaymentTypes.filter(p =>
                p.type === 'dues' || p.type === 'monthly_dues'
            );

            // ============================================================
            // STEP 2: Get user's existing payments
            // ============================================================
            const paymentsResponse = await api.get('/payments');
            let userPayments = paymentsResponse.data?.data?.records || paymentsResponse.data?.data || [];

            const existingDuesPayments = userPayments.filter(p =>
                p.type === 'dues' || p.type === 'monthly_dues'
            );

            setExistingPayments(existingDuesPayments);

            // ============================================================
            // STEP 3: Extract paid, unpaid, pending months PER DUES TYPE
            // ============================================================
            const paidMonthsByTypeLocal = {};      // { typeId: ['2026-02', '2026-03'] }
            const pendingMonthsByTypeLocal = {};   // { typeId: ['2026-04'] }
            const partialPaymentsByTypeLocal = {}; // { typeId: [...] }
            const penaltiesByTypeLocal = {};       // { typeId: totalPenalty }
            const pendings = [];
            let activePending = null;

            existingDuesPayments.forEach(p => {
                // Get the dues type ID for this payment
                let typeId = null;
                if (p.paymentTypeId) {
                    if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
                        typeId = p.paymentTypeId._id.toString();
                    } else if (typeof p.paymentTypeId === 'string') {
                        typeId = p.paymentTypeId;
                    }
                }

                if (!typeId) return; // Skip payments without a payment type ID

                // Initialize arrays for this type if needed
                if (!paidMonthsByTypeLocal[typeId]) paidMonthsByTypeLocal[typeId] = [];
                if (!pendingMonthsByTypeLocal[typeId]) pendingMonthsByTypeLocal[typeId] = [];
                if (!partialPaymentsByTypeLocal[typeId]) partialPaymentsByTypeLocal[typeId] = [];
                if (!penaltiesByTypeLocal[typeId]) penaltiesByTypeLocal[typeId] = 0;

                // Track paid months
                if (p.paidMonths && p.paidMonths.length > 0) {
                    paidMonthsByTypeLocal[typeId].push(...p.paidMonths);
                } else if (p.months && p.months.length > 0 && p.status === 'paid') {
                    paidMonthsByTypeLocal[typeId].push(...p.months);
                }

                // Track penalties
                if (p.penaltyAmount) {
                    penaltiesByTypeLocal[typeId] += p.penaltyAmount;
                }

                // Track PENDING months
                if (p.status === 'pending' && p.months && p.months.length > 0) {
                    pendingMonthsByTypeLocal[typeId].push(...p.months);
                    pendings.push({
                        ...p,
                        paymentType: 'pending',
                        isPending: true,
                        createdAt: p.createdAt,
                        transactionReference: p.transactionReference,
                        months: p.months
                    });

                    if (!activePending) {
                        activePending = p;
                    }
                }

                // Track PARTIAL payments
                if (p.status === 'partial' && p.remainingAmount > 0 && p.months && p.months.length > 0) {
                    const paidMonthsList = p.paidMonths || [];
                    const remainingMonths = p.months.filter(m => !paidMonthsList.includes(m));
                    partialPaymentsByTypeLocal[typeId].push({
                        ...p,
                        remainingMonths: remainingMonths,
                        remainingCount: remainingMonths.length,
                        totalAmount: p.amount,
                        paidAmount: p.totalPaidSoFar || 0,
                        isPartial: true,
                        paymentType: 'partial'
                    });
                }
            });

            // Remove duplicates per type
            Object.keys(paidMonthsByTypeLocal).forEach(typeId => {
                paidMonthsByTypeLocal[typeId] = [...new Set(paidMonthsByTypeLocal[typeId])];
            });
            Object.keys(pendingMonthsByTypeLocal).forEach(typeId => {
                pendingMonthsByTypeLocal[typeId] = [...new Set(pendingMonthsByTypeLocal[typeId])];
            });

            // Store in state
            setPaidMonthsByType(paidMonthsByTypeLocal);
            setPendingMonthsByType(pendingMonthsByTypeLocal);
            setPartialPaymentsByType(partialPaymentsByTypeLocal);
            setPenaltiesByType(penaltiesByTypeLocal);
            setPendingPaymentsList(pendings);
            setActivePendingPayment(activePending);

            // Also keep the flat paidMonths/pendingMonths for backward compatibility
            const allPaidMonths = Object.values(paidMonthsByTypeLocal).flat();
            const allPendingMonths = Object.values(pendingMonthsByTypeLocal).flat();
            setPaidMonths([...new Set(allPaidMonths)]);
            setPendingMonths([...new Set(allPendingMonths)]);

            // ============================================================
            // STEP 4: Set dues types for display - SHOW ALL ACTIVE DUES TYPES
            // ============================================================
            // â­ Show ALL active dues types regardless of existing payments
            const uniqueTypes = duesTypesOnly.filter((t, i, self) =>
                i === self.findIndex(tt => tt._id === t._id)
            );

            setDuesTypes(uniqueTypes);

            if (uniqueTypes.length > 0 && !selectedDuesType) {
                setSelectedDuesType(uniqueTypes[0]);
            }


        } catch (error) {
            console.error('Error fetching dues data:', error);
            if (error.response?.status !== 429) {
                toast.error('Failed to load dues data');
            }
            setDuesTypes([]);
        } finally {
            setLoadingDues(false);
            isFetchingRef.current = false;
        }
    };
    // ============================================================
    // Initial fetch on mount
    // ============================================================
    useEffect(() => {
        if (!initialFetchDoneRef.current) {
            initialFetchDoneRef.current = true;
            fetchDuesData();
        }
    }, []);

    // ============================================================
    // Refresh when payments data changes
    // ============================================================
    useEffect(() => {
        if (payments.length > 0 && !loadingDues) {
            fetchDuesData();
        }
    }, [payments]);

    // ============================================================
    // Handle resize
    // ============================================================
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ============================================================
    // MONTH SELECTION LOGIC
    // ============================================================
    // ============================================================
    // MONTH SELECTION LOGIC - With Independent Penalty Calculation
    // ============================================================
    const getAvailableMonths = () => {
        const months = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const now = new Date();

        // Get penalty settings from the selected dues type
        const paymentType = selectedDuesType;
        const isPenaltyEnabled = paymentType?.late_penalty_enabled || false;
        const penaltyType = paymentType?.late_penalty_type || 'fixed';
        const penaltyValue = paymentType?.late_penalty_value || 0;
        const dueDateAfter = paymentType?.due_date_after || 30;
        const daysAfterDue = paymentType?.late_penalty_days_after || 7;
        const baseAmount = paymentType?.amount || 100;

        // â­ Get paid/pending months FOR THE SELECTED DUES TYPE ONLY
        const typeId = paymentType?._id?.toString();
        const typePaidMonths = typeId ? (paidMonthsByType[typeId] || []) : [];
        const typePendingMonths = typeId ? (pendingMonthsByType[typeId] || []) : [];

        for (let i = -12; i <= 12; i++) {
            const date = new Date(currentYear, currentMonth + i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`;

            // â­ Use TYPE-SPECIFIC paid/pending months
            const isPaid = typePaidMonths.includes(periodKey);
            const isPending = typePendingMonths.includes(periodKey);
            // ============================================================
            // â­ INDEPENDENT PENALTY CALCULATION (based on dues type)
            // ============================================================
            let penalty = 0;
            let isLate = false;
            let dueDate = null;

            if (isPenaltyEnabled && !isPaid && !isPending) {
                // Calculate due date for this month
                const monthDueDate = new Date(year, month, 1);
                monthDueDate.setDate(monthDueDate.getDate() + dueDateAfter);

                // Calculate penalty start date
                const penaltyStartDate = new Date(monthDueDate);
                penaltyStartDate.setDate(penaltyStartDate.getDate() + daysAfterDue);

                // Check if current date is past the penalty start date
                isLate = now > penaltyStartDate;

                if (isLate) {
                    // Calculate penalty based on type
                    if (penaltyType === 'percentage') {
                        penalty = baseAmount * (penaltyValue / 100);
                    } else {
                        // Fixed amount
                        penalty = penaltyValue;
                    }
                    // Round to 2 decimal places
                    penalty = Math.round(penalty * 100) / 100;
                    dueDate = monthDueDate;
                }
            }

            const isSelectable = !isPaid && !isPending;

            months.push({
                periodKey,
                year,
                month,
                monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                isPast: date < new Date(currentYear, currentMonth, 1),
                isFuture: date > new Date(currentYear, currentMonth, 1),
                isCurrent: date.getMonth() === currentMonth && date.getFullYear() === currentYear,
                isPaid,
                isPending,
                isSelected: selectedMonths.includes(periodKey),
                isSelectable,
                penalty,
                isLate,
                dueDate,
                hasPenalty: penalty > 0,
                // â­ Calculate total for this month
                totalAmount: baseAmount + penalty
            });
        }

        return months;
    };

    // ============================================================
    // FIX: toggleMonth - block selection if there's a pending payment
    // ============================================================
    const toggleMonth = (periodKey) => {
        // Check for pending payment
        if (activePendingPayment) {
            toast('You have a pending payment. Please complete or retry it first.', {
                icon: 'â³',
                duration: 5000
            });
            openPendingModal(activePendingPayment);
            return;
        }

        const month = getAvailableMonths().find(m => m.periodKey === periodKey);
        if (!month || !month.isSelectable) {
            if (month?.isPending) {
                toast('This month has a pending payment. Please retry or verify it.', {
                    icon: 'â³',
                    duration: 4000
                });
                const pendingPayment = pendingPaymentsList.find(p =>
                    p.months && p.months.includes(periodKey)
                );
                if (pendingPayment) {
                    openPendingModal(pendingPayment);
                }
            } else if (month?.isPaid) {
                toast('This month is already paid âœ“', {
                    icon: 'âœ…',
                    duration: 3000
                });
            } else {
                toast('This month is not available', {
                    icon: 'â„¹ï¸',
                    duration: 3000
                });
            }
            return;
        }

        // â­ Show penalty warning with amount
        if (month.hasPenalty) {
            toast(
                `âš ï¸ This month has a late penalty of ${month.penalty.toLocaleString()} that will be added.`,
                {
                    duration: 5000,
                    icon: 'âš ï¸'
                }
            );
        }

        setSelectedMonths(prev => {
            if (prev.includes(periodKey)) {
                return prev.filter(m => m !== periodKey);
            } else {
                return [...prev, periodKey];
            }
        });
    };
    const selectAllMonths = () => {
        // ============================================================
        // FIX: If there's a pending payment, block select all
        // ============================================================
        if (activePendingPayment) {
            toast('You have a pending payment. Please complete or retry it first.', {
                icon: 'â³',
                duration: 5000
            });
            return;
        }

        const allMonths = getAvailableMonths()
            .filter(m => m.isSelectable)
            .map(m => m.periodKey);

        if (allMonths.length === 0) {
            toast('No selectable months available', { icon: 'â„¹ï¸' });
            return;
        }

        setSelectedMonths(allMonths);
    };

    const clearAllMonths = () => {
        setSelectedMonths([]);
    };

    // ============================================================
    // Calculate total amount with penalties
    // ============================================================
    // ============================================================
    // Calculate total amount with penalties - FRONTEND CALCULATION
    // ============================================================
    const calculatePenalties = (monthsToCheck) => {
        if (!selectedDuesType || monthsToCheck.length === 0) {
            return { totalPenalty: 0, breakdown: [], baseTotal: 0 };
        }

        const availableMonthsData = getAvailableMonths();
        let baseTotal = 0;
        let totalPenalty = 0;
        const penaltyBreakdown = [];

        monthsToCheck.forEach(monthKey => {
            const monthData = availableMonthsData.find(m => m.periodKey === monthKey);
            baseTotal += selectedDuesType.amount || 0;
            if (monthData && monthData.hasPenalty) {
                totalPenalty += monthData.penalty;
                penaltyBreakdown.push({
                    month: monthKey,
                    penalty: monthData.penalty,
                    isLate: true
                });
            }
        });

        return { totalPenalty, breakdown: penaltyBreakdown, baseTotal };
    };

    useEffect(() => {
        if (selectedMonths.length > 0 && selectedDuesType) {
            const result = calculatePenalties(selectedMonths);
            setPenaltyInfo({
                totalPenalty: result.totalPenalty,
                breakdown: result.breakdown
            });
        } else {
            setPenaltyInfo({ totalPenalty: 0, breakdown: [] });
        }
    }, [selectedMonths, selectedDuesType, paidMonths]);

    // ============================================================
    // Get totals
    // ============================================================
    const baseTotal = selectedMonths.length * (selectedDuesType?.amount || 0);
    const totalAmount = baseTotal + penaltyInfo.totalPenalty;
    const totalPayable = totalAmount > 0 ? Math.ceil(totalAmount / 0.96) : 0;

    // ============================================================
    // HANDLE RETRY PENDING PAYMENT
    // ============================================================
    const handleRetryPendingPayment = async (pendingPayment) => {
        if (!pendingPayment) return;

        setPaymentInProgress(true);
        setShowPendingModal(false);

        try {
            const createdAt = new Date(pendingPayment.createdAt);
            const now = new Date();
            const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                toast.error('This payment has expired (24 hours). Please create a new payment.', {
                    duration: 5000
                });
                setPaymentInProgress(false);
                return;
            }

            // ============================================================
            // FIX: Use existing payment ID - don't create new
            // ============================================================
            const amount = pendingPayment.remainingAmount || pendingPayment.amount || 0;
            const totalPayable = Math.ceil(amount / 0.96);

            const initPayload = {
                paymentId: pendingPayment._id,
                amount: totalPayable
            };

            const initResponse = await api.post('/payment-gateway/initialize', initPayload);

            if (initResponse.data.success && initResponse.data.data?.authorizationUrl) {
                sessionStorage.setItem('pendingPaymentId', pendingPayment._id);
                sessionStorage.setItem('pendingTxRef', initResponse.data.data.reference);
                sessionStorage.setItem('pendingPaymentType', 'dues');
                sessionStorage.setItem('pendingRetry', 'true');

                window.location.href = initResponse.data.data.authorizationUrl;
            } else {
                throw new Error('Payment initialization failed');
            }

        } catch (error) {
            console.error('Pending payment retry error:', error);
            toast.error(error.response?.data?.message || 'Failed to initialize payment');
            setPaymentInProgress(false);
        }
    };

    // ============================================================
    // HANDLE VERIFY PENDING PAYMENT
    // ============================================================
    const handleVerifyPendingPayment = async (pendingPayment) => {
        if (!pendingPayment || !pendingPayment.transactionReference) {
            toast.error('No transaction reference found');
            return;
        }

        setVerifyingPayment(true);

        try {
            const response = await api.get(`/payment-gateway/verify/${pendingPayment.transactionReference}`);

            if (response.data.success) {
                const status = response.data.data?.status;
                if (status === 'paid') {
                    toast.success('âœ… Payment verified successfully!');
                    await fetchDuesData();
                    setShowPendingModal(false);
                } else if (status === 'pending') {
                    toast.info('â³ Payment is still processing. Please wait a few minutes.');
                } else {
                    toast.warning(`Payment status: ${status}`);
                }
            } else {
                toast.error('Verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Could not verify payment. Please try again.');
        } finally {
            setVerifyingPayment(false);
        }
    };

    // ============================================================
    // HANDLE PARTIAL PAYMENT COMPLETION
    // ============================================================
    const handleCompletePartialPayment = async (partialPayment) => {
        if (!partialPayment) return;

        setPaymentInProgress(true);
        setShowPartialModal(false);

        try {
            const remainingAmount = partialPayment.remainingAmount || 0;
            const totalPayable = Math.ceil(remainingAmount / 0.96);

            const initPayload = {
                paymentId: partialPayment._id,
                amount: totalPayable
            };

            const initResponse = await api.post('/payment-gateway/initialize', initPayload);

            if (initResponse.data.success && initResponse.data.data?.authorizationUrl) {
                sessionStorage.setItem('pendingPaymentId', partialPayment._id);
                sessionStorage.setItem('pendingTxRef', initResponse.data.data.reference);
                sessionStorage.setItem('pendingPaymentType', 'dues');
                sessionStorage.setItem('pendingPartialComplete', 'true');

                window.location.href = initResponse.data.data.authorizationUrl;
            } else {
                throw new Error('Payment initialization failed');
            }

        } catch (error) {
            console.error('Partial payment completion error:', error);
            toast.error(error.response?.data?.message || 'Failed to initialize payment');
            setPaymentInProgress(false);
        }
    };

    const openPartialModal = (payment) => {
        setSelectedPartialPayment(payment);
        setShowPartialModal(true);
    };

    const openPendingModal = (payment) => {
        setSelectedPendingPayment(payment);
        setShowPendingModal(true);
    };

    // ============================================================
    // HANDLE NEW PAYMENT
    // ============================================================
    // const handlePayNow = async () => {
    //     // ============================================================
    //     // FIX: If there's a pending payment, block new payment
    //     // ============================================================
    //     if (activePendingPayment) {
    //         toast('You have a pending payment. Please complete or retry it first.', {
    //             icon: 'â³',
    //             duration: 5000
    //         });
    //         openPendingModal(activePendingPayment);
    //         return;
    //     }

    //     if (selectedMonths.length === 0) {
    //         toast.error('Please select at least one month');
    //         return;
    //     }

    //     if (!selectedDuesType) {
    //         toast.error('Please select a dues type');
    //         return;
    //     }

    //     setPaymentInProgress(true);
    //     setIsModalOpen(false);

    //     try {

    //         const baseTotal = selectedMonths.length * (selectedDuesType.amount || 0);
    //         const totalPenalty = penaltyInfo.totalPenalty;
    //         const totalWithPenalty = baseTotal + totalPenalty;
    //         const totalPayable = Math.ceil(totalWithPenalty / 0.96);



    //         const paymentData = {
    //             name: selectedDuesType.name || 'Dues',
    //             type: selectedDuesType.type || 'monthly_dues',
    //             amount: baseTotal,
    //             description: `${selectedDuesType.name} - ${selectedMonths.length} months`,
    //             paymentTypeId: selectedDuesType._id,
    //             months: selectedMonths,
    //             monthCount: selectedMonths.length,
    //             monthlyPrice: selectedDuesType.amount || 0,
    //             customAmount: customAmount ? parseFloat(customAmount) : null,
    //             includePenalties: true,
    //             penaltyAmount: totalPenalty,  // â† CRITICAL: Send penalty separately
    //         };

    //         console.log('ðŸ“¤ Creating hybrid dues payment:', paymentData);

    //         const result = await api.post('/payments/member-payment', paymentData);
    //         const payment = result.data.data || result.data;

    //         const initPayload = {
    //             paymentId: payment._id,
    //             amount: customAmount ? parseFloat(customAmount) : totalPayable
    //         };

    //         const initResponse = await api.post('/payment-gateway/initialize', initPayload);

    //         if (initResponse.data.success && initResponse.data.data?.authorizationUrl) {
    //             sessionStorage.setItem('pendingPaymentId', payment._id);
    //             sessionStorage.setItem('pendingTxRef', initResponse.data.data.reference);
    //             sessionStorage.setItem('pendingMonths', JSON.stringify(selectedMonths));
    //             sessionStorage.setItem('pendingPaymentType', 'dues');
    //             sessionStorage.setItem('pendingPenalty', JSON.stringify(penaltyInfo));

    //             window.location.href = initResponse.data.data.authorizationUrl;
    //         } else {
    //             throw new Error('Payment initialization failed');
    //         }

    //     } catch (error) {
    //         console.error('Payment error:', error);
    //         toast.error(error.response?.data?.message || 'Failed to initialize payment');
    //         setPaymentInProgress(false);
    //     }
    // };
    // ============================================================
    // HANDLE NEW PAYMENT - FIXED
    // ============================================================
    const handlePayNow = async () => {
        if (activePendingPayment) {
            toast('You have a pending payment. Please complete or retry it first.', {
                icon: 'â³',
                duration: 5000
            });
            openPendingModal(activePendingPayment);
            return;
        }

        if (selectedMonths.length === 0) {
            toast.error('Please select at least one month');
            return;
        }

        if (!selectedDuesType) {
            toast.error('Please select a dues type');
            return;
        }

        setPaymentInProgress(true);
        setIsModalOpen(false);

        try {
            // â­ STEP 1: Calculate using frontend data
            const availableMonthsData = getAvailableMonths();
            let baseTotal = 0;
            let totalPenalty = 0;
            const penaltyBreakdown = [];

            selectedMonths.forEach(monthKey => {
                const monthData = availableMonthsData.find(m => m.periodKey === monthKey);
                baseTotal += selectedDuesType.amount || 0;
                if (monthData && monthData.hasPenalty) {
                    totalPenalty += monthData.penalty;
                    penaltyBreakdown.push({
                        month: monthKey,
                        penalty: monthData.penalty,
                        isLate: true
                    });
                }
            });

            const totalWithPenalty = baseTotal + totalPenalty;
            const totalPayable = Math.ceil(totalWithPenalty / 0.96);


            // â­ STEP 2: Create payment with correct amounts
            const paymentData = {
                name: selectedDuesType.name || 'Dues',
                type: selectedDuesType.type || 'monthly_dues',
                amount: baseTotal,
                description: `${selectedDuesType.name} - ${selectedMonths.length} months`,
                paymentTypeId: selectedDuesType._id,
                months: selectedMonths,
                monthCount: selectedMonths.length,
                monthlyPrice: selectedDuesType.amount || 0,
                includePenalties: true,
                customAmount: totalPayable,
                // Send penalty info to backend for verification
                penaltyAmount: totalPenalty,
                penaltyBreakdown: penaltyBreakdown
            };


            const result = await api.post('/payments/member-payment', paymentData);
            const payment = result.data.data || result.data;

            // â­ STEP 3: Initialize Flutterwave with correct amount
            const initPayload = {
                paymentId: payment._id,
                amount: totalPayable
            };


            const initResponse = await api.post('/payment-gateway/initialize', initPayload);

            if (initResponse.data.success && initResponse.data.data?.authorizationUrl) {
                sessionStorage.setItem('pendingPaymentId', payment._id);
                sessionStorage.setItem('pendingTxRef', initResponse.data.data.reference);
                sessionStorage.setItem('pendingMonths', JSON.stringify(selectedMonths));
                sessionStorage.setItem('pendingPaymentType', 'dues');
                sessionStorage.setItem('pendingPenalty', JSON.stringify({ totalPenalty, breakdown: penaltyBreakdown }));
                sessionStorage.setItem('pendingExpectedAmount', totalPayable.toString());

                window.location.href = initResponse.data.data.authorizationUrl;
            } else {
                throw new Error('Payment initialization failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to initialize payment');
            setPaymentInProgress(false);
        }
    };

    const openPaymentModal = () => {
        // ============================================================
        // FIX: If there's a pending payment, block new payment
        // ============================================================
        if (activePendingPayment) {
            toast('You have a pending payment. Please complete or retry it first.', {
                icon: 'â³',
                duration: 5000
            });
            openPendingModal(activePendingPayment);
            return;
        }

        if (selectedMonths.length === 0) {
            toast.error('Please select at least one month');
            return;
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCustomAmount('');
        setShowPartialWarning(false);
        setShowPenaltyDetails(false);
    };

    // ============================================================
    // Format helpers
    // ============================================================
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
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

    // ============================================================
    // Handlers
    // ============================================================
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetchPayments(), refetchPending()]);
            await fetchDuesData();
            toast.success('Data refreshed');
        } catch (error) {
            toast.error('Failed to refresh');
        } finally {
            setRefreshing(false);
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    // ============================================================
    // Render
    // ============================================================
    const isLoading = paymentsLoading || pendingLoading || loadingDues;

    if (isLoading && duesTypes.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    const availableMonths = getAvailableMonths();

    const stats = {
        paid: paidMonthsByType[selectedDuesType?._id?.toString()]?.length || 0,
        unpaid: unpaidMonths.length,
        pending: pendingMonthsByType[selectedDuesType?._id?.toString()]?.length || 0,
        totalOutstanding: unpaidMonths.length * (selectedDuesType?.amount || 0),
        totalPenalty: penaltiesByType[selectedDuesType?._id?.toString()] || 0,
        partialCount: (partialPaymentsByType[selectedDuesType?._id?.toString()] || []).length,
        pendingCount: pendingPaymentsList.length
    };

    const hasPenalty = penaltyInfo.totalPenalty > 0;
    const hasPending = pendingMonths.length > 0;
    const hasActivePending = !!activePendingPayment;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

                {/* ============================================================
                HEADER
                ============================================================ */}
                <div className="bg-gradient-to-br from-[#012a7b] via-blue-800 to-[#2683e9] text-white px-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackToDashboard}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                                My Dues
                                <Shield className="h-4 w-4 text-blue-400" />
                            </h1>
                            <p className="text-blue-200/80 text-xs sm:text-sm">
                                Select months and pay your dues
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-blue-200 text-xs">Paid</p>
                            <p className="text-xl font-bold">{stats.paid}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-blue-200 text-xs">Selected</p>
                            <p className="text-xl font-bold">{selectedMonths.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-blue-200 text-xs">Outstanding</p>
                            <p className="text-lg font-bold text-red-200">
                                {formatCurrency(stats.totalOutstanding)}
                            </p>
                        </div>
                    </div>

                    {/* ============================================================
                    PENDING BANNER - Show when there's a pending payment
                    ============================================================ */}
                    {/* {hasPending && (
                        <div className="mt-3 bg-yellow-500/30 backdrop-blur-sm rounded-xl p-3 border border-yellow-400/50 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-200" />
                                    <span className="text-yellow-100 text-sm font-medium">
                                        â³ You have a pending payment ({pendingMonths.length} month{pendingMonths.length > 1 ? 's' : ''})
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (activePendingPayment) {
                                            openPendingModal(activePendingPayment);
                                        } else if (pendingPaymentsList.length > 0) {
                                            openPendingModal(pendingPaymentsList[0]);
                                        }
                                    }}
                                    className="px-4 py-1.5 bg-yellow-500/30 text-yellow-100 text-sm rounded-lg hover:bg-yellow-500/40 transition-colors"
                                >
                                    Complete Payment
                                </button>
                            </div>
                            <p className="text-xs text-yellow-200/80 mt-1">
                                Please complete your pending payment before selecting new months.
                            </p>
                        </div>
                    )} */}

                    {/* PARTIAL PAYMENTS BANNER */}
                    {stats.partialCount > 0 && (
                        <div className="mt-3 bg-orange-500/20 backdrop-blur-sm rounded-xl p-3 border border-orange-400/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-orange-200" />
                                    <span className="text-orange-100 text-xs font-medium">
                                        âš ï¸ You have {stats.partialCount} partial payment{stats.partialCount > 1 ? 's' : ''} to complete
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        document.getElementById('partial-payments-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-3 py-1 bg-orange-500/30 text-orange-100 text-xs rounded-lg hover:bg-orange-500/40 transition-colors"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Penalty Banner */}
                    {stats.totalPenalty > 0 && (
                        <div className="mt-3 bg-red-500/20 backdrop-blur-sm rounded-xl p-3 border border-red-400/30">
                            <div className="flex items-center gap-2">
                                <Gavel className="h-4 w-4 text-red-200" />
                                <span className="text-red-100 text-xs font-medium">
                                    âš ï¸ You have {stats.totalPenalty.toLocaleString()} in late penalties
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ============================================================
                PENDING PAYMENTS SECTION
                ============================================================ */}
                {pendingPaymentsList.length > 0 && (
                    <div id="pending-payments-section" className="px-4 mt-4">
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-300 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-yellow-200 bg-yellow-100/70">
                                <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Action Required
                                    <span className="text-xs text-yellow-600 font-normal ml-2">
                                        ({pendingPaymentsList.length} payment{pendingPaymentsList.length > 1 ? 's' : ''})
                                    </span>
                                </h3>
                                <p className="text-xs text-yellow-600 mt-0.5">
                                    You have an initiated payment that needs to be completed. Please retry or verify below.
                                </p>
                            </div>


                        </div>
                    </div>
                )}

                {/* ============================================================
                DUES TYPE SELECTOR
                ============================================================ */}
                <div className="px-4 mt-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-4 sm:px-5 pt-4 sm:pt-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Select Dues Type
                                    </label>
                                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                        {hasActivePending ? 'âš ï¸ Complete pending payment first' : 'Choose the type of dues you want to pay.'}
                                    </p>
                                </div>
                                {duesTypes.length > 0 && (
                                    <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-blue-600">
                                        {duesTypes.length} {duesTypes.length === 1 ? 'type' : 'types'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="px-4 sm:px-5 py-4">
                            {duesTypes.length > 0 ? (
                                <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
                                    {duesTypes.map((type) => {
                                        const isSelected = selectedDuesType?._id === type._id;

                                        return (
                                            <button
                                                key={type._id}
                                                type="button"
                                                onClick={() => {
                                                    if (hasActivePending) {
                                                        toast('Please complete your pending payment first.', {
                                                            icon: 'â³',
                                                            duration: 4000
                                                        });
                                                        return;
                                                    }
                                                    setSelectedDuesType(type);
                                                    setSelectedMonths([]);
                                                    setPenaltyInfo({ totalPenalty: 0, breakdown: [] });
                                                }}
                                                aria-pressed={isSelected}
                                                className={`group relative flex-shrink-0 min-w-[150px] sm:min-w-[170px] snap-start rounded-xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isSelected
                                                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className={`truncate text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                            {type.name}
                                                        </p>
                                                        <p className={`mt-1 text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            Dues amount
                                                        </p>
                                                    </div>
                                                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${isSelected
                                                        ? 'bg-white/15'
                                                        : 'bg-white border border-gray-200'
                                                        }`}>
                                                        {isSelected ? (
                                                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 111.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <span className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-baseline gap-1">
                                                    <span className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>

                                                    </span>
                                                    <span className={`text-lg font-bold tracking-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                        {Number(type.amount).toLocaleString('en-NG')}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-white/60" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-gray-400" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M4.93 19h14.14a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.2 16a2 2 0 001.73 3z" />
                                        </svg>
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-gray-700">No dues types available</p>
                                    <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">Your administrator hasn't created any dues types yet.</p>
                                </div>
                            )}
                        </div>
                        {duesTypes.length > 1 && (
                            <div className="border-t border-gray-50 px-4 py-2.5 sm:hidden">
                                <p className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-400">Swipe to see more</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================================
                MONTH SELECTOR - With pending status
                ============================================================ */}
                {selectedDuesType && (
                    <div className="px-4 mt-4">
                        <div className="bg-white rounded-2xl text-xs shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    Select Months
                                    <span className="text-xs text-gray-400 font-normal">
                                        ({selectedMonths.length} selected)
                                    </span>
                                    {/* {hasActivePending && (
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                            â³ Pending payment blocks selection
                                        </span>
                                    )} */}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectAllMonths}
                                        disabled={hasActivePending}
                                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${hasActivePending
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={clearAllMonths}
                                        disabled={hasActivePending}
                                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${hasActivePending
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>


                            {/* In the month selector rendering (updated to show penalty and total) */}
                            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                {availableMonths.map((month) => {
                                    const isSelected = selectedMonths.includes(month.periodKey);
                                    const isPaid = month.isPaid;
                                    const isPending = month.isPending;
                                    const baseAmount = selectedDuesType?.amount || 0;
                                    const monthTotal = baseAmount + (month.hasPenalty ? month.penalty : 0);

                                    // â­ IMPORTANT: Check if the month is selectable
                                    const isSelectable = !isPaid && !isPending && !hasActivePending;

                                    return (
                                        <div
                                            key={month.periodKey}
                                            className={`px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''
                                                } ${isPaid ? 'opacity-60' : ''} ${isPending ? 'bg-yellow-50' : ''}`}
                                        >
                                            <div className="flex text-xs items-center gap-3 flex-1 min-w-0">
                                                {/* â­ SELECTION BUTTON - Always render it */}
                                                <button
                                                    onClick={() => toggleMonth(month.periodKey)}
                                                    disabled={!isSelectable}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : isPaid
                                                            ? 'bg-green-500 border-green-500 text-white cursor-not-allowed'
                                                            : isPending
                                                                ? 'bg-yellow-500 border-yellow-500 text-white cursor-not-allowed'
                                                                : isSelectable
                                                                    ? 'border-gray-300 hover:border-blue-400'
                                                                    : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isSelected && <CheckCircle className="h-4 w-4" />}
                                                    {isPaid && <CheckCircle className="h-4 w-4" />}
                                                    {isPending && <Clock className="h-4 w-4" />}
                                                </button>

                                                <div className="min-w-0 flex-1">
                                                    <span className={`font-medium ${isPaid ? 'text-gray-400' : isPending ? 'text-yellow-600' : 'text-gray-800'
                                                        }`}>
                                                        {month.monthName}
                                                    </span>
                                                    {month.isCurrent && (
                                                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                    {isPaid && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                            Paid âœ“
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Pending â³
                                                        </span>
                                                    )}
                                                    {/* â­ PENALTY BADGE */}
                                                    {month.hasPenalty && !isPaid && !isPending && (
                                                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                                            <Gavel className="h-3 w-3" />
                                                            +{month.penalty.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* â­ Amount display */}
                                            <div className="text-right flex-shrink-0 ml-2">
                                                {month.hasPenalty && !isPaid && !isPending ? (
                                                    <div>
                                                        <div className="text-sm font-bold text-red-600">
                                                            {monthTotal.toLocaleString()}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 line-through">
                                                            {baseAmount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {baseAmount.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary Footer */}
                            {/* Summary Footer - Updated */}
                            {selectedMonths.length > 0 && !hasActivePending && (
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                    <div className="space-y-2">
                                        {/* Selected months count */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">
                                                {selectedMonths.length} month{selectedMonths.length > 1 ? 's' : ''} selected
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Ã— {formatCurrency(selectedDuesType?.amount || 0)}
                                            </span>
                                        </div>

                                        {/* Base subtotal */}
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                            <span className="text-sm text-gray-600">Base Subtotal</span>
                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(baseTotal)}</span>
                                        </div>

                                        {/* â­ Penalty breakdown - Show each month with penalty */}
                                        {hasPenalty && (
                                            <div className="border-b border-red-100 pb-2">
                                                <div className="flex items-center justify-between text-xs text-red-600 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Gavel className="h-3 w-3" />
                                                        Late Penalties ({penaltyInfo.breakdown.filter(b => b.isLate).length} months)
                                                    </span>
                                                    <span>+{formatCurrency(penaltyInfo.totalPenalty)}</span>
                                                </div>
                                                {showPenaltyDetails && penaltyInfo.breakdown.filter(b => b.isLate).map(b => {
                                                    const monthName = formatPeriodKey(b.month);
                                                    return (
                                                        <div key={b.month} className="flex justify-between text-xs text-red-500 pl-4 mt-0.5">
                                                            <span>{monthName}</span>
                                                            <span>+{formatCurrency(b.penalty)}</span>
                                                        </div>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setShowPenaltyDetails(!showPenaltyDetails)}
                                                    className="text-[10px] text-red-500 hover:text-red-700 transition-colors mt-0.5"
                                                >
                                                    {showPenaltyDetails ? 'Hide details' : 'Show details'}
                                                </button>
                                            </div>
                                        )}

                                        {/* â­ Total with penalties */}
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-sm font-semibold text-gray-700">Total with Penalties</span>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
                                                {hasPenalty && (
                                                    <div className="text-[10px] text-gray-400">
                                                        Includes {penaltyInfo.totalPenalty} late penalty
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* â­ You Pay (with fees) */}
                                        <div className="flex items-center justify-between pt-2 border-t-2 border-blue-200 bg-blue-50/50 -mx-4 px-4 py-2 rounded-b-lg">
                                            <span className="text-sm font-bold text-blue-700">You Pay</span>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-blue-700">{formatCurrency(totalPayable)}</div>
                                                <div className="text-[10px] text-blue-500">
                                                    {/* (incl. {formatCurrency(Math.round(totalAmount * 0.04))} Platform Charges) */}
                                                    (incl.  Platform Charges {formatCurrency(totalPayable)})

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                )}

                {/* ============================================================
                PARTIAL PAYMENTS SECTION
                ============================================================ */}
                {(partialPaymentsByType[selectedDuesType?._id?.toString()] || []).length > 0 && (
                    <div id="partial-payments-section" className="px-4 mt-4">
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-orange-200 bg-orange-100/50">
                                <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Partial Payments to Complete
                                    <span className="text-xs text-orange-600 font-normal ml-2">
                                        ({partialPayments.length} payment{partialPayments.length > 1 ? 's' : ''})
                                    </span>
                                </h3>
                            </div>

                            <div className="divide-y divide-orange-100">
                                {partialPayments.map((payment) => {
                                    const remainingMonths = payment.remainingMonths || [];

                                    return (
                                        <div key={payment._id} className="px-4 py-3 hover:bg-orange-50/50 transition-colors">
                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-gray-800 text-sm">
                                                            {payment.name}
                                                        </span>
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                            Partial
                                                        </span>
                                                        {payment.penaltyAmount > 0 && (
                                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Gavel className="h-3 w-3" />
                                                                +{payment.penaltyAmount} penalty
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-3 text-xs">
                                                        <span className="text-gray-500">
                                                            Paid: <span className="font-medium text-green-600">{formatCurrency(payment.totalPaidSoFar || 0)}</span>
                                                        </span>
                                                        <span className="text-gray-500">
                                                            Remaining: <span className="font-medium text-orange-600">{formatCurrency(payment.remainingAmount || 0)}</span>
                                                        </span>
                                                        <span className="text-gray-500">
                                                            Months: <span className="font-medium">{remainingMonths.length} remaining</span>
                                                        </span>
                                                    </div>
                                                    {remainingMonths.length > 0 && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {remainingMonths.map(month => (
                                                                <span key={month} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                                    {formatPeriodKey(month)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => openPartialModal(payment)}
                                                    disabled={paymentInProgress}
                                                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-sm font-medium hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 shadow-md flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                    Complete Payment
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================
                PAY BUTTON
                ============================================================ */}
                {/* ============================================================
PAY BUTTON - Shows total with penalties
============================================================ */}
                {!hasActivePending && selectedDuesType && selectedMonths.length > 0 && (
                    <div className="px-4 mt-4">
                        <button
                            onClick={openPaymentModal}
                            disabled={paymentInProgress}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                        >
                            {paymentInProgress ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    {/* <ShoppingCart className="h-5 w-5" /> */}
                                    Pay {formatCurrency(totalPayable)} for {selectedMonths.length} month{selectedMonths.length > 1 ? 's' : ''}
                                    {hasPenalty && (
                                        <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            {/* <Gavel className="h-3 w-3" />
                                            +{penaltyInfo.totalPenalty} penalty */}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                        {hasPenalty && (
                            <div className="mt-2 text-center">
                                {/* <p className="text-xs text-red-500">
                                    âš ï¸ Includes {penaltyInfo.totalPenalty} late payment penalty
                                </p> */}
                                <div className="flex justify-center gap-3 text-[10px] text-gray-400 mt-0.5">
                                    <span>Base: {formatCurrency(baseTotal)}</span>
                                    <span>Penalty: +{formatCurrency(penaltyInfo.totalPenalty)}</span>
                                    <span>Total: {formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 text-center mt-1">
                            You'll be redirected to Flutterwave to complete payment
                        </p>
                    </div>
                )}

                {hasActivePending && (
                    <div className="px-4 mt-4">
                        <button
                            onClick={() => openPendingModal(activePendingPayment)}
                            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-2xl font-semibold hover:from-yellow-700 hover:to-amber-700 transition-all shadow-lg flex items-center justify-center gap-3"
                        >
                            <Clock className="h-5 w-5" />
                            Complete Pending Payment
                        </button>
                        <p className="text-xs text-yellow-600 text-center mt-2">
                            You have a pending payment that needs your attention
                        </p>
                    </div>
                )}

                {/* ============================================================
                PAYMENT MODAL
                ============================================================ */}
                {isModalOpen && selectedDuesType && selectedMonths.length > 0 && !hasActivePending && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
                            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-xl">
                                        <DollarSign className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">Confirm Payment</h3>
                                        <p className="text-xs text-gray-500">{selectedDuesType.name}</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                {/* Payment Summary */}
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                            <span className="text-gray-600">
                                                {selectedMonths.length} Month{selectedMonths.length > 1 ? 's' : ''}
                                            </span>
                                            <span className="font-bold text-gray-900">{formatCurrency(baseTotal)}</span>
                                        </div>

                                        {hasPenalty && (
                                            <div className="border-t border-red-100 pt-2">
                                                <div className="flex justify-between items-center text-red-600">
                                                    <span className="text-xs flex items-center gap-1">
                                                        <Gavel className="h-3 w-3" />
                                                        Late Penalties
                                                    </span>
                                                    <span className="font-medium">+{formatCurrency(penaltyInfo.totalPenalty)}</span>
                                                </div>
                                                {penaltyInfo.breakdown.filter(b => b.isLate).map(b => (
                                                    <div key={b.month} className="flex justify-between text-xs text-red-500 pl-4">
                                                        <span>{formatPeriodKey(b.month)}</span>
                                                        <span>+{formatCurrency(b.penalty)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Flutterwave Fee (2%)</span>
                                            <span className="text-blue-500">-{formatCurrency(Math.round(totalAmount * 0.02))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Platform Fee (2%)</span>
                                            <span className="text-orange-500">-{formatCurrency(Math.round(totalAmount * 0.02))}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-200">
                                            <span className="font-medium text-gray-700">You Pay</span>
                                            <span className="font-bold text-green-600">{formatCurrency(totalPayable)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Months being paid */}
                                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                                    <p className="text-xs font-medium text-blue-700 mb-1">Months Selected</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedMonths.map(month => {
                                            const hasPenaltyForMonth = penaltyInfo.breakdown.some(b => b.month === month && b.isLate);
                                            return (
                                                <span key={month} className={`text-xs px-2 py-0.5 rounded-full ${hasPenaltyForMonth
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {formatPeriodKey(month)}
                                                    {hasPenaltyForMonth && ' âš ï¸'}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <button
                                    onClick={handlePayNow}
                                    disabled={paymentInProgress}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                                >
                                    {paymentInProgress ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5" />
                                            {/* Pay {formatCurrency(customAmount ? parseFloat(customAmount) : totalPayable)} */}
                                            Pay {formatCurrency(totalPayable)}
                                        </>
                                    )}
                                </button>

                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Shield className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800 mb-1">Secure Payment</p>
                                            <p className="text-xs text-blue-700">
                                                Payment is processed securely via Flutterwave. You'll be redirected to complete payment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================
                PENDING PAYMENT MODAL
                ============================================================ */}
                {showPendingModal && selectedPendingPayment && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
                            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-50 rounded-xl">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">Pending Payment</h3>
                                        <p className="text-xs text-gray-500">{selectedPendingPayment.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPendingModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Payment Initiated but Not Completed</p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                You started this payment but didn't complete it. You can retry or verify it below.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                            <span className="text-gray-600">Amount</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(selectedPendingPayment.amount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Created</span>
                                            <span className="text-gray-900">{new Date(selectedPendingPayment.createdAt).toLocaleString()}</span>
                                        </div>
                                        {selectedPendingPayment.months && selectedPendingPayment.months.length > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Months</span>
                                                <span className="text-gray-900">{selectedPendingPayment.months.map(formatPeriodKey).join(', ')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status</span>
                                            <span className="text-yellow-600 font-medium">Pending â³</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleRetryPendingPayment(selectedPendingPayment)}
                                        disabled={paymentInProgress}
                                        className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-xl font-medium hover:from-yellow-700 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                        Retry Payment
                                    </button>
                                    <button
                                        onClick={() => handleVerifyPendingPayment(selectedPendingPayment)}
                                        disabled={verifyingPayment}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {verifyingPayment ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Verify
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 border border-yellow-200">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <Shield className="h-4 w-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800 mb-1">Need Help?</p>
                                            <p className="text-xs text-yellow-700">
                                                If you already completed the payment, click "Verify" to confirm it.
                                                Otherwise, click "Retry Payment" to try again.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================
                PARTIAL PAYMENT MODAL
                ============================================================ */}
                {showPartialModal && selectedPartialPayment && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
                            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-xl">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">Complete Partial Payment</h3>
                                        <p className="text-xs text-gray-500">{selectedPartialPayment.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPartialModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                            <span className="text-gray-600">Total Amount</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(selectedPartialPayment.totalAmount || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Already Paid</span>
                                            <span className="font-medium text-green-600">{formatCurrency(selectedPartialPayment.totalPaidSoFar || 0)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-orange-200 pt-2 mt-2">
                                            <span className="text-gray-600 font-medium">Remaining Balance</span>
                                            <span className="font-bold text-orange-700">{formatCurrency(selectedPartialPayment.remainingAmount || 0)}</span>
                                        </div>
                                        {selectedPartialPayment.penaltyAmount > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span className="text-xs flex items-center gap-1">
                                                    <Gavel className="h-3 w-3" />
                                                    Penalty
                                                </span>
                                                <span className="font-medium">+{formatCurrency(selectedPartialPayment.penaltyAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedPartialPayment.remainingMonths?.length > 0 && (
                                    <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                                        <p className="text-xs font-medium text-orange-700 mb-1">Remaining Months</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPartialPayment.remainingMonths.map(month => (
                                                <span key={month} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                    {formatPeriodKey(month)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleCompletePartialPayment(selectedPartialPayment)}
                                    disabled={paymentInProgress}
                                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                                >
                                    {paymentInProgress ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5" />
                                            Complete Payment ({formatCurrency(Math.ceil((selectedPartialPayment.remainingAmount || 0) / 0.96))})
                                        </>
                                    )}
                                </button>

                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-200">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Shield className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-orange-800 mb-1">Complete Your Payment</p>
                                            <p className="text-xs text-orange-700">
                                                You'll be redirected to Flutterwave to pay the remaining balance.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================
                NO DUES MESSAGE
                ============================================================ */}
                {duesTypes.length === 0 && (
                    <div className="px-4 mt-4">
                        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Calendar className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="text-gray-700 font-medium">No Dues Available</h4>
                            <p className="text-sm text-gray-400 mt-1">
                                Your organization hasn't created any dues types yet.
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Contact your administrator to set up dues.
                            </p>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes slide-up {
                        from { transform: translateY(100%) scale(0.95); opacity: 0; }
                        to { transform: translateY(0) scale(1); opacity: 1; }
                    }
                    .animate-slide-up {
                        animation: slide-up 0.3s ease-out;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default DuesDashboard;
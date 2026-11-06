// pages/FinancialTransparency.js - BANK GRADE UI/UX
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

import {
    CreditCard,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Wallet,
    Calendar,
    RefreshCw,
    Eye,
    Building2,
    PiggyBank,
    History,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Printer,
    ChevronRight,
    Shield,
    Award,
    BarChart3,
    PieChart,
    Landmark,
    FileText,
    DollarSign,
    Percent,
    Activity,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    usePaymentTypes,
    usePaymentSummary,
    usePublicIncomes,
    usePublicExpenditures,
    usePublicPayments,
} from '../hooks/usePaymentData';



// ⭐ Helper function to calculate total including penalty
// ⭐ Helper function to calculate total including penalty
const calculateTotalWithPenalty = (payment) => {
    if (!payment) return 0;

    let baseAmount = payment.amount || 0;
    let totalPenalty = 0;

    // 1. Check penaltyBreakdown array
    if (Array.isArray(payment.penaltyBreakdown) && payment.penaltyBreakdown.length > 0) {
        payment.penaltyBreakdown.forEach(item => {
            const penaltyValue =
                item?.penalty ||
                item?.penaltyAmount ||
                item?.amount ||
                item?.lateFee ||
                0;

            if (penaltyValue > 0 && (item?.isLate !== false)) {
                totalPenalty += penaltyValue;
            }
        });
    }

    // 2. Check penaltyAmount field
    if (totalPenalty === 0 && payment.penaltyAmount > 0) {
        totalPenalty = payment.penaltyAmount;
    }

    // 3. Check penalty field
    if (totalPenalty === 0 && payment.penalty > 0) {
        totalPenalty = payment.penalty;
    }

    // 4. Check lateFee field
    if (totalPenalty === 0 && payment.lateFee > 0) {
        totalPenalty = payment.lateFee;
    }

    return baseAmount + totalPenalty;
};
const FinancialTransparency = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [summary, setSummary] = useState(null);
    const [outstandingFromTypes, setOutstandingFromTypes] = useState([]);
    const [showTransactions, setShowTransactions] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activeTab, setActiveTab] = useState('overview');

    const [orgFinancialData, setOrgFinancialData] = useState({
        totalIncome: 0,
        totalExpenditure: 0,
        totalPaymentsCollected: 0,
        totalManualIncome: 0,
        totalOutstanding: 0,
        netBalance: 0,
        totalMembers: 0,
        paidMembers: 0
    });

    const [incomeFilter, setIncomeFilter] = useState('all');
    const [expenditureFilter, setExpenditureFilter] = useState('all');
    const [showIncomeFilters, setShowIncomeFilters] = useState(false);
    const [showExpenditureFilters, setShowExpenditureFilters] = useState(false);

    // Processed data states
    const [manualIncomes, setManualIncomes] = useState([]);
    const [memberPayments, setMemberPayments] = useState([]);
    const [expenditureList, setExpenditureList] = useState([]);
    const [payments, setPayments] = useState([]);

    // ========== REACT QUERY HOOKS ==========


    const {
        data: paymentTypes = [],
        isLoading: typesLoading,
        refetch: refetchPaymentTypes
    } = usePaymentTypes();

    // const {
    //     data: userPayments = [],
    //     isLoading: paymentsLoading,
    //     refetch: refetchUserPayments
    // } = usePayments({});
    // ✅ NEW — includes full penalty data
    // ✅ Revert to the working hook
    const lastProcessedSignatureRef = useRef('');
    const {
        data: allMembersPayments = [],
        isLoading: allMembersPaymentsLoading,
        refetch: refetchAllMembersPayments
    } = usePublicPayments();
    // ✅ Simple assignment — backend already returns penalty fields
    const publicPayments = allMembersPayments;
    const publicPaymentsLoading = allMembersPaymentsLoading;
    const refetchPublicPayments = refetchAllMembersPayments;



    const {
        data: paymentSummary = null,
        isLoading: summaryLoading,
        refetch: refetchSummary
    } = usePaymentSummary(user?._id || user?.id);

    const {
        data: publicIncomes = [],
        isLoading: incomesLoading,
        refetch: refetchPublicIncomes
    } = usePublicIncomes(100);

    const {
        data: publicExpenditures = [],
        isLoading: expendituresLoading,
        refetch: refetchPublicExpenditures
    } = usePublicExpenditures(100);

    // const publicPayments = userPayments;
    // const publicPaymentsLoading = paymentsLoading;
    // const refetchPublicPayments = refetchUserPayments;
    // ✅ Use ALL members' payments for transparency (not just current user's)
    // Use the enriched array instead

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                refetchPublicIncomes(),
                refetchPublicExpenditures(),
                refetchPublicPayments()
            ]);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // useEffect(() => {
    //     if (userPayments && paymentTypes) {
    //         processMemberData();
    //     }
    // }, [userPayments, paymentTypes, paymentSummary]);

    // useEffect(() => {
    //     if (publicIncomes !== undefined && publicExpenditures !== undefined && userPayments !== undefined) {
    //         processOrganizationData();
    //     }
    // }, [publicIncomes, publicExpenditures, userPayments]);

    useEffect(() => {
        if (publicIncomes !== undefined && publicExpenditures !== undefined && publicPayments !== undefined) {
            processOrganizationData();
        }
    }, [publicIncomes, publicExpenditures, publicPayments]);

    // const processMemberData = () => {
    //     try {
    //         const userId = user?._id || user?.id;

    //         const paidPaymentTypeIds = new Set();
    //         const paidNames = new Set();
    //         const partialPayments = (userPayments || []).filter(p => p?.isPartial === true && p?.remainingAmount > 0);

    //         (userPayments || []).forEach(p => {
    //             if (p?.status === 'paid' && !(p?.isPartial === true && p?.remainingAmount > 0)) {
    //                 if (p?.paymentTypeId) {
    //                     let typeId = null;
    //                     if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
    //                         typeId = p.paymentTypeId._id.toString();
    //                     } else if (typeof p.paymentTypeId === 'string') {
    //                         typeId = p.paymentTypeId;
    //                     } else if (typeof p.paymentTypeId === 'object') {
    //                         typeId = p.paymentTypeId.toString();
    //                     }

    //                     if (typeId) {
    //                         paidPaymentTypeIds.add(typeId);
    //                     }
    //                 }

    //                 if (p?.name) {
    //                     paidNames.add(p.name);
    //                 }
    //             }
    //         });

    //         const outstandingTypes = (paymentTypes || [])
    //             .filter(type => {
    //                 const typeIdStr = type?._id?.toString();

    //                 if (typeIdStr && paidPaymentTypeIds.has(typeIdStr)) {
    //                     return false;
    //                 }

    //                 if (type?.name && paidNames.has(type.name)) {
    //                     return false;
    //                 }

    //                 return true;
    //             })
    //             .map(type => ({
    //                 _id: `temp_${type?._id}`,
    //                 paymentTypeId: type?._id,
    //                 type: type?.type || 'dues',
    //                 name: type?.name || 'Payment',
    //                 amount: type?.amount || 0,
    //                 status: 'unpaid',
    //                 dueDate: null,
    //                 description: type?.description || '',
    //                 is_mandatory: type?.is_mandatory || false,
    //                 frequency: type?.frequency || 'one-time'
    //             }));

    //         const existingUnpaid = (userPayments || []).filter(p => p?.status === 'unpaid');
    //         const partialOutstanding = partialPayments.map(p => ({
    //             _id: p._id,
    //             paymentTypeId: p.paymentTypeId,
    //             type: p.type || 'dues',
    //             name: `${p.name || 'Payment'} (Partial)`,
    //             amount: p.remainingAmount || p.amount,
    //             originalAmount: p.amount,
    //             remainingAmount: p.remainingAmount,
    //             totalPaidSoFar: p.totalPaidSoFar || 0,
    //             status: 'partial',
    //             dueDate: p.dueDate,
    //             description: p.description || 'Partial payment remaining balance',
    //             is_mandatory: false,
    //             is_partial: true,
    //             parentPaymentId: p._id
    //         }));
    //         const allOutstanding = [...existingUnpaid, ...outstandingTypes];

    //         setPayments(userPayments || []);
    //         setOutstandingFromTypes(allOutstanding);

    //         if (paymentSummary) {
    //             setSummary(paymentSummary);
    //         }

    //     } catch (error) {
    //         console.error('Error processing member data:', error);
    //         setPayments([]);
    //         setOutstandingFromTypes([]);
    //     }
    // };
    const processOrganizationData = () => {
        try {
            // const paymentsData = userPayments || [];
            const paymentsData = publicPayments || [];

            // ⭐ GUARD: Prevent infinite render loop
            const signature = JSON.stringify({
                incomeCount: publicIncomes?.length || 0,
                incomeIds: (publicIncomes || []).map(i => i._id || i.id).sort(),
                expenditureCount: publicExpenditures?.length || 0,
                expenditureIds: (publicExpenditures || []).map(e => e._id || e.id).sort(),
                paymentCount: paymentsData.length,
                paymentIds: paymentsData.map(p => p._id || p.id).sort(),
                // ⭐ Include penalty amounts in signature so real changes trigger reprocess
                paymentPenalties: paymentsData.map(p => ({
                    id: p._id || p.id,
                    penalty: p.penaltyAmount || 0
                })),
            });

            if (lastProcessedSignatureRef.current === signature) {
                // No real change — skip to avoid infinite loop
                return;
            }
            lastProcessedSignatureRef.current = signature;


            let totalManualIncome = 0;
            let allManualIncomes = [];
            let allExpenditures = [];
            let allMemberPayments = [];

            if (publicIncomes && publicIncomes.length > 0) {
                allManualIncomes = (publicIncomes || []).map(inc => ({
                    ...inc,
                    source: inc?.source || 'Manual Income',
                    description: inc?.description || '',
                    amount: inc?.amount || 0,
                    date: inc?.date || inc?.createdAt || new Date()
                }));

                totalManualIncome = allManualIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
            }

            if (paymentsData && paymentsData.length > 0) {
                // ✅ Backend /payments/public/income already returns:
                //    amount (total incl penalty), baseAmount, penaltyAmount, hasPenalty
                //    isPartial, totalPaidSoFar, remainingAmount, months, paidMonths
                allMemberPayments = paymentsData
                    .filter(p => {
                        const type = p?.type || '';
                        // Exclude outstanding balance records
                        if (type === 'outstanding') return false;
                        // Exclude unpaid fines
                        if (type === 'fine' && !p?.paidAt) return false;
                        // For partial payments, include if any money received
                        if (p?.isPartial && (p?.totalPaidSoFar || 0) > 0) return true;
                        // Otherwise only include paid
                        return p?.paidAt != null || p?.status === 'paid';
                    })
                    .map(p => ({
                        ...p,
                        _id: p._id || p.id,
                        // Trust the backend-computed fields
                        amount: p.amount || 0,
                        baseAmount: p.baseAmount || 0,
                        penaltyAmount: p.penaltyAmount || 0,
                        hasPenalty: p.hasPenalty || (p.penaltyAmount || 0) > 0,
                        isPartialPayment: p.isPartial === true,
                        source: p.source || p.paymentType || 'Member Payment',
                        description: p.description || '',
                        memberName: p.memberName || 'Member',
                        date: p.date || p.paidAt || p.createdAt || new Date(),
                    }));


            }

            if (publicExpenditures && publicExpenditures.length > 0) {
                allExpenditures = (publicExpenditures || []).map(exp => ({
                    ...exp,
                    purpose: exp?.purpose || 'Other',
                    description: exp?.description || '',
                    amount: exp?.amount || 0,
                    date: exp?.date || exp?.createdAt || new Date()
                }));
            }

            const totalPaymentsCollected = allMemberPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const totalExpenditure = allExpenditures.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const totalIncome = totalManualIncome + totalPaymentsCollected;
            const netBalance = totalIncome - totalExpenditure;



            setOrgFinancialData({
                totalIncome: totalIncome,
                totalExpenditure: totalExpenditure,
                totalPaymentsCollected: totalPaymentsCollected,
                totalManualIncome: totalManualIncome,
                totalOutstanding: 0,
                netBalance: netBalance,
                totalMembers: 0,
                paidMembers: 0
            });

            setManualIncomes(allManualIncomes);
            setMemberPayments(allMemberPayments);
            setExpenditureList(allExpenditures);

        } catch (error) {
            console.error('Error processing organization data:', error);
            setManualIncomes([]);
            setMemberPayments([]);
            setExpenditureList([]);
        }
    };
    const getAllIncomeRecords = () => {
        const formattedManualIncomes = (manualIncomes || []).map(inc => ({
            ...inc,
            incomeType: 'manual',
            displaySource: inc?.source || inc?.description || 'Manual Income',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            memberName: null,
            amount: inc?.amount || 0,
            hasPenalty: false,
            penaltyAmount: 0,
            baseAmount: inc?.amount || 0
        }));

        // ⭐ STRICT FILTER: Only include PAID member payments
        const formattedMemberPayments = (memberPayments || [])
            .filter(payment => {
                // ⭐ Must be paid
                if (!payment) return false;
                if (payment?.type === 'outstanding') return false;
                if (payment?.type === 'fine' && !payment?.paidAt) return false;
                return true;
            })
            .map(payment => ({
                ...payment,
                incomeType: 'member_payment',
                displaySource: payment?.source || payment?.paymentType || 'Member Payment',
                description: payment?.description || `${payment?.memberName || 'Member'} made a payment`,
                iconColor: 'text-blue-600',
                bgColor: 'bg-blue-50',
                memberName: payment?.memberName,
                amount: payment?.amount || 0,
                hasPenalty: payment?.hasPenalty || false,
                penaltyAmount: payment?.penaltyAmount || 0,
                baseAmount: payment?.baseAmount || payment?.amount || 0
            }));

        const allIncomes = [...formattedManualIncomes, ...formattedMemberPayments];
        allIncomes.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

        return allIncomes;
    };

    const allIncomeRecords = getAllIncomeRecords();

    const getUniqueIncomeSources = () => {
        const sources = new Set();
        allIncomeRecords.forEach(item => {
            const source = item?.displaySource || item?.source || item?.description || 'Other';
            if (source && typeof source === 'string') {
                sources.add(source);
            }
        });
        return ['all', ...Array.from(sources)];
    };

    const getUniqueExpenditurePurposes = () => {
        const purposes = new Set();
        expenditureList.forEach(item => {
            const purpose = item?.purpose || item?.description || 'Other';
            if (purpose && typeof purpose === 'string') {
                purposes.add(purpose);
            }
        });
        return ['all', ...Array.from(purposes)];
    };

    const filteredIncome = incomeFilter === 'all'
        ? allIncomeRecords
        : allIncomeRecords.filter(item => {
            const source = item?.displaySource || item?.source || item?.description || 'Other';
            return source === incomeFilter;
        });

    const filteredExpenditure = expenditureFilter === 'all'
        ? expenditureList
        : expenditureList.filter(item => {
            const purpose = item?.purpose || item?.description || 'Other';
            return purpose === expenditureFilter;
        });

    const filteredIncomeTotal = filteredIncome.reduce((sum, item) => sum + (item?.amount || 0), 0);
    const filteredExpenditureTotal = filteredExpenditure.reduce((sum, item) => sum + (item?.amount || 0), 0);

    const clearIncomeFilter = () => setIncomeFilter('all');
    const clearExpenditureFilter = () => setExpenditureFilter('all');

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchPaymentTypes(),
                refetchSummary(),
                refetchPublicIncomes(),
                refetchPublicExpenditures(),
                refetchPublicPayments()
            ]);
        } finally {
            setRefreshing(false);
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

    const formatTransactionDate = (item) => {
        const dateValue = item?.date || item?.createdAt || item?.paidAt;
        if (!dateValue) return 'N/A';
        try {
            return new Date(dateValue).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const paymentsArray = Array.isArray(payments) ? payments : [];
    const paidPayments = paymentsArray.filter(p => p?.status === 'paid') || [];
    const totalPaid = paidPayments.reduce((sum, p) => sum + (p?.amount || 0), 0);
    const totalOutstandingUser = outstandingFromTypes.reduce((sum, p) => sum + (p?.amount || 0), 0);
    const outstandingCount = outstandingFromTypes.length;

    const isLoading = typesLoading || summaryLoading || incomesLoading || expendituresLoading || publicPaymentsLoading;
    // Calculate derived metrics
    const totalIncome = orgFinancialData.totalIncome;
    const totalExpenditure = orgFinancialData.totalExpenditure;
    const netBalance = totalIncome - totalExpenditure;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenditure) / totalIncome * 100) : 0;
    const totalTransactions = allIncomeRecords.length + expenditureList.length;

    if (isLoading && payments.length === 0 && outstandingFromTypes.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">


                {/* ===== HEADER SECTION ===== */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#012a7b]   via-blue-800  to-[#2683e9] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-sm">
                    {/* <button
                        onClick={handleBackToDashboard}
                        className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button> */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-500/10 rounded-full blur-3xl -ml-24 -mb-24" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">


                        <div className="flex items-center gap-3 sm:gap-4">
                            <div
                                onClick={handleBackToDashboard}
                                className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
                                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                {/* <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" /> */}

                            </div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                                    Financial Transparency
                                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                </h1>
                                <p className="text-blue-200/80 text-xs sm:text-sm">
                                    Complete financial overview and transparency report
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* <button
                                onClick={() => window.print()}
                                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/10"
                                title="Print Report"
                            >
                                <Printer className="h-4 w-4 text-blue-300" />
                            </button> */}

                        </div>
                    </div>
                </div>

                {/* ===== TAB NAVIGATION - HIGHLY RESPONSIVE ===== */}
                {/* ===== TAB NAVIGATION - MOBILE OPTIMIZED ===== */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-1.5">
                    {/* Mobile Layout: Overview left (big), Income + Expenditure stacked right */}
                    <div className="sm:hidden flex gap-1.5">
                        {/* Overview - Big Tab on Left */}
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 rounded-xl text-xs font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 py-3 ${activeTab === 'overview'
                                ? 'bg-gradient-to-r from-blue-600 to-[#2683e9] text-white shadow-sm shadow-blue-500/25'
                                : 'text-blue-600 hover:bg-gray-50 hover:text-blue-900'
                                }`}
                        >
                            <PieChart className="h-4 w-4" />
                            <span className="capitalize">Overview</span>
                        </button>

                        {/* Right Column: Income on top, Expenditure below */}
                        <div className="flex-1 flex flex-col gap-1.5">
                            <button
                                onClick={() => setActiveTab('income')}
                                className={`rounded-xl text-[10px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 py-2 ${activeTab === 'income'
                                    ? 'bg-gradient-to-r from-blue-600 to-[#2683e9] text-white shadow-sm shadow-blue-500/25'
                                    : 'text-blue-600 hover:bg-gray-50 hover:text-blue-900'
                                    }`}
                            >
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span className="capitalize">Income</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('expenditure')}
                                className={`rounded-xl text-[10px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 py-2 ${activeTab === 'expenditure'
                                    ? 'bg-gradient-to-r from-blue-600 to-[#2683e9] text-white shadow-sm shadow-blue-500/25'
                                    : 'text-blue-600 hover:bg-gray-50 hover:text-blue-900'
                                    }`}
                            >
                                <TrendingDown className="h-3.5 w-3.5" />
                                <span className="capitalize">Expenditure</span>
                            </button>
                        </div>
                    </div>

                    {/* Desktop Layout: Show all 3 tabs in a row */}
                    <div className="hidden sm:grid sm:grid-cols-3 gap-1">
                        {['overview', 'income', 'expenditure'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === tab
                                    ? 'bg-gradient-to-r from-blue-600 to-[#2683e9] text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'overview' && <PieChart className="h-4 w-4" />}
                                {tab === 'income' && <TrendingUp className="h-4 w-4" />}
                                {tab === 'expenditure' && <TrendingDown className="h-4 w-4" />}
                                <span className="capitalize">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== OVERVIEW TAB ===== */}
                {activeTab === 'overview' && (
                    <>
                        {/* Key Metrics Grid */}
                        <div className="space-y-3">
                            {/* Top section: Net Balance left (big), Income + Expenditure right (stacked) */}
                            <div className="flex gap-3">
                                {/* Net Balance - Big Card on Left */}
                                <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100/50">
                                    <p className="text-xs text-gray-500 font-medium">Net Balance</p>
                                    <p className={`text-2xl sm:text-3xl font-bold mt-2 ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                                        }`}>
                                        {formatCurrency(netBalance)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {netBalance >= 0 ? 'Surplus' : 'Deficit'}
                                    </p>
                                </div>

                                {/* Right Column: Income on top, Expenditure below */}
                                <div className="flex-1 flex flex-col ">
                                    {/* Income */}
                                    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100/50">
                                        <p className="text-xs text-gray-500 font-medium">Total Income</p>
                                        <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">
                                            {formatCurrency(totalIncome)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {allIncomeRecords.length} transactions
                                        </p>
                                    </div>

                                    {/* Expenditure */}
                                    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100/50">
                                        <p className="text-xs text-gray-500 font-medium">Total Expenditure</p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-600 mt-1">
                                            {formatCurrency(totalExpenditure)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {expenditureList.length} transactions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Savings Rate - Full width line below */}
                            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100/50">
                                <p className="text-xs text-gray-500">
                                    Savings Rate: <span className="font-bold text-gray-700">{savingsRate.toFixed(1)}%</span> of total income
                                </p>
                            </div>
                        </div>

                        {/* Income vs Expenditure Chart */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                    Income vs Expenditure Breakdown
                                </h3>
                                <span className="text-xs text-gray-400">{totalTransactions} total transactions</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                                            Income
                                        </span>
                                        <span className="font-semibold text-blue-600">{formatCurrency(totalIncome)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: (totalIncome + totalExpenditure) > 0 ? `${(totalIncome / (totalIncome + totalExpenditure)) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <span className="inline-block w-3 h-3 rounded-full bg-gray-500" />
                                            Expenditure
                                        </span>
                                        <span className="font-semibold text-gray-600">{formatCurrency(totalExpenditure)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: (totalIncome + totalExpenditure) > 0 ? `${(totalExpenditure / (totalIncome + totalExpenditure)) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                                <span>Total: {formatCurrency(totalIncome + totalExpenditure)}</span>
                                <span>Balance: {formatCurrency(netBalance)}</span>
                            </div>
                        </div>

                        {/* Financial Records */}
                        {(allIncomeRecords.length > 0 || expenditureList.length > 0) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                            <Eye className="h-4 w-4 text-indigo-600" />
                                            Financial Records
                                            <span className="text-xs font-normal text-gray-400 ml-2">For Transparency</span>
                                        </h3>
                                        <button
                                            onClick={() => setShowTransactions(!showTransactions)}
                                            className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-1"
                                        >
                                            {showTransactions ? 'Hide' : 'View Details'}
                                            <ChevronRight className={`h-3 w-3 transition-transform ${showTransactions ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {showTransactions && (
                                    <div className="p-4 sm:p-6 space-y-6">
                                        {/* Income Records */}
                                        {allIncomeRecords.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4" />
                                                        Income Records ({allIncomeRecords.length})
                                                    </h4>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowIncomeFilters(!showIncomeFilters)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                                        >
                                                            <Filter className="h-3 w-3" />
                                                            Filter
                                                            {incomeFilter !== 'all' && (
                                                                <span className="ml-0.5 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[9px]">
                                                                    1
                                                                </span>
                                                            )}
                                                        </button>

                                                        {showIncomeFilters && (
                                                            <div className="absolute right-0 top-full mt-1.5 z-10 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[200px] py-1">
                                                                <div className="px-3 py-2 border-b border-gray-100">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-medium text-gray-700">Filter by Source</span>
                                                                        {incomeFilter !== 'all' && (
                                                                            <button
                                                                                onClick={clearIncomeFilter}
                                                                                className="text-xs text-gray-500 hover:text-gray-700"
                                                                            >
                                                                                Clear
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto">
                                                                    {getUniqueIncomeSources().map(source => (
                                                                        <button
                                                                            key={source}
                                                                            onClick={() => {
                                                                                setIncomeFilter(source);
                                                                                setShowIncomeFilters(false);
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${incomeFilter === source
                                                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                                                : 'text-gray-600 hover:bg-gray-50'
                                                                                }`}
                                                                        >
                                                                            {source === 'all' ? 'All Sources' : source}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {incomeFilter !== 'all' && (
                                                    <div className="mb-3 p-2.5 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-200">
                                                        <span className="text-xs text-blue-700">Filtered Total:</span>
                                                        <span className="text-sm font-bold text-blue-700">{formatCurrency(filteredIncomeTotal)}</span>
                                                    </div>
                                                )}

                                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                                    {filteredIncome.slice(0, 20).map((item, idx) => (
                                                        <div key={idx} className={`flex items-center justify-between p-3 ${item.bgColor || 'bg-gray-50'} rounded-xl hover:shadow-sm transition-shadow`}>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    {item.incomeType === 'member_payment' ? (
                                                                        <CreditCard className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                                    ) : (
                                                                        <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                                    )}
                                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                                        {item.displaySource || item.source || item.description || 'Income'}
                                                                    </p>
                                                                    {item.memberName && (
                                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                            {item.memberName}
                                                                        </span>
                                                                    )}
                                                                    {/* ⭐ Show penalty badge for member payments with penalty */}
                                                                    {item.incomeType === 'member_payment' && item.hasPenalty && (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                            <AlertCircle className="h-3 w-3" />
                                                                            +₦{item.penaltyAmount} penalty
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {formatTransactionDate(item)}
                                                                    </p>
                                                                    {item.incomeType === 'manual' && (
                                                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Manual</span>
                                                                    )}
                                                                </div>
                                                                {item.description && item.description !== (item.displaySource || item.source) && (
                                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-right ml-3 flex-shrink-0">
                                                                <p className={`text-base font-bold ${item.incomeType === 'member_payment' && item.hasPenalty ? 'text-red-600' : 'text-blue-600'}`}>
                                                                    +{formatCurrency(item.amount)}
                                                                </p>
                                                                {item.incomeType === 'member_payment' && item.hasPenalty && (
                                                                    <p className="text-[10px] text-gray-400 line-through">
                                                                        {formatCurrency(item.baseAmount || 0)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {filteredIncome.length === 0 && (
                                                    <div className="text-center py-6 text-gray-500 text-sm">
                                                        No income records match the filter
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Expenditure Records */}
                                        {expenditureList.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-black-700 flex items-center gap-2">
                                                        <TrendingDown className="h-4 w-4" />
                                                        Expenditure Records ({expenditureList.length})
                                                    </h4>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowExpenditureFilters(!showExpenditureFilters)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                                        >
                                                            <Filter className="h-3 w-3" />
                                                            Filter
                                                            {expenditureFilter !== 'all' && (
                                                                <span className="ml-0.5 px-1.5 py-0.5 bg-gray-500 text-white rounded-full text-[9px]">
                                                                    1
                                                                </span>
                                                            )}
                                                        </button>

                                                        {showExpenditureFilters && (
                                                            <div className="absolute right-0 top-full mt-1.5 z-10 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[180px] py-1">
                                                                <div className="px-3 py-2 border-b border-gray-100">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-medium text-gray-700">Filter by Purpose</span>
                                                                        {expenditureFilter !== 'all' && (
                                                                            <button
                                                                                onClick={clearExpenditureFilter}
                                                                                className="text-xs text-gray-500 hover:text-gray-700"
                                                                            >
                                                                                Clear
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto">
                                                                    {getUniqueExpenditurePurposes().map(purpose => (
                                                                        <button
                                                                            key={purpose}
                                                                            onClick={() => {
                                                                                setExpenditureFilter(purpose);
                                                                                setShowExpenditureFilters(false);
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${expenditureFilter === purpose
                                                                                ? 'bg-gray-50 text-gray-700 font-medium'
                                                                                : 'text-gray-600 hover:bg-gray-50'
                                                                                }`}
                                                                        >
                                                                            {purpose === 'all' ? 'All Purposes' : purpose}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {expenditureFilter !== 'all' && (
                                                    <div className="mb-3 p-2.5 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                                                        <span className="text-xs text-gray-700">Filtered Total:</span>
                                                        <span className="text-sm font-bold text-gray-700">{formatCurrency(filteredExpenditureTotal)}</span>
                                                    </div>
                                                )}

                                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                    {filteredExpenditure.slice(0, 10).map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:shadow-sm transition-shadow">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                                    {item.description || item.purpose || 'Expenditure'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {formatTransactionDate(item)}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-600 ml-3 flex-shrink-0">
                                                                -{formatCurrency(item.amount)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ===== INCOME TAB ===== */}
                {activeTab === 'income' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-emerald-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        All Income Records
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{allIncomeRecords.length} transactions • Total: {formatCurrency(totalIncome)}</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowIncomeFilters(!showIncomeFilters)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                                    >
                                        <Filter className="h-3 w-3" />
                                        Filter
                                    </button>
                                    {showIncomeFilters && (
                                        <div className="absolute right-0 top-full mt-1.5 z-10 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[200px] py-1">
                                            <div className="px-3 py-2 border-b border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-gray-700">Filter by Source</span>
                                                    {incomeFilter !== 'all' && (
                                                        <button onClick={clearIncomeFilter} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                {getUniqueIncomeSources().map(source => (
                                                    <button
                                                        key={source}
                                                        onClick={() => { setIncomeFilter(source); setShowIncomeFilters(false); }}
                                                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${incomeFilter === source
                                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {source === 'all' ? 'All Sources' : source}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {incomeFilter !== 'all' && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-xl flex justify-between items-center border border-blue-200">
                                    <span className="text-sm text-blue-700">Filtered Total:</span>
                                    <span className="text-lg font-bold text-blue-700">{formatCurrency(filteredIncomeTotal)}</span>
                                </div>
                            )}

                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {filteredIncome.map((item, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-4 ${item.bgColor || 'bg-gray-50'} rounded-xl hover:shadow-md transition-all duration-200`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {item.incomeType === 'member_payment' ? (
                                                    <CreditCard className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                ) : (
                                                    <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                )}
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {item.displaySource || item.source || item.description || 'Income'}
                                                </p>
                                                {item.memberName && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.memberName}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatTransactionDate(item)}
                                                </p>
                                                {item.incomeType === 'manual' && (
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Manual</span>
                                                )}
                                            </div>
                                            {item.description && item.description !== (item.displaySource || item.source) && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                                            )}
                                        </div>
                                        <p className="text-base font-bold text-blue-600 ml-3 flex-shrink-0">
                                            +{formatCurrency(item.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {filteredIncome.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm">No income records found</p>
                                    <button onClick={clearIncomeFilter} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                                        Clear Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== EXPENDITURE TAB ===== */}
                {activeTab === 'expenditure' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-rose-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-gray-600" />
                                        All Expenditure Records
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{expenditureList.length} transactions • Total: {formatCurrency(totalExpenditure)}</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowExpenditureFilters(!showExpenditureFilters)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                                    >
                                        <Filter className="h-3 w-3" />
                                        Filter
                                    </button>
                                    {showExpenditureFilters && (
                                        <div className="absolute right-0 top-full mt-1.5 z-10 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[180px] py-1">
                                            <div className="px-3 py-2 border-b border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-gray-700">Filter by Purpose</span>
                                                    {expenditureFilter !== 'all' && (
                                                        <button onClick={clearExpenditureFilter} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                {getUniqueExpenditurePurposes().map(purpose => (
                                                    <button
                                                        key={purpose}
                                                        onClick={() => { setExpenditureFilter(purpose); setShowExpenditureFilters(false); }}
                                                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${expenditureFilter === purpose
                                                            ? 'bg-gray-50 text-gray-700 font-medium'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {purpose === 'all' ? 'All Purposes' : purpose}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {expenditureFilter !== 'all' && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-200">
                                    <span className="text-sm text-gray-700">Filtered Total:</span>
                                    <span className="text-lg font-bold text-gray-700">{formatCurrency(filteredExpenditureTotal)}</span>
                                </div>
                            )}

                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {filteredExpenditure.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {item.description || item.purpose || 'Expenditure'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatTransactionDate(item)}
                                                </p>
                                                {item.purpose && item.purpose !== item.description && (
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.purpose}</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-gray-600 ml-3 flex-shrink-0">
                                            -{formatCurrency(item.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {filteredExpenditure.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <TrendingDown className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm">No expenditure records found</p>
                                    <button onClick={clearExpenditureFilter} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                                        Clear Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== PAYMENTS TAB ===== */}
                {/* ===== PAYMENTS TAB ===== */}
                {/* ===== PAYMENTS TAB ===== */}
                {activeTab === 'payments' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-pink-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-600" />
                                        Member Payments
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {memberPayments.length} payments • Total: {formatCurrency(memberPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {memberPayments.map((payment, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-4 ${payment.hasPenalty ? 'bg-red-50/50' : payment.isPartialPayment ? 'bg-orange-50/50' : 'bg-gray-50'} rounded-xl hover:shadow-md transition-all duration-200 border ${payment.hasPenalty ? 'border-red-200' : payment.isPartialPayment ? 'border-orange-200' : 'border-gray-100'}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <CreditCard className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {payment.memberName || 'Member'}
                                                </p>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {payment.paymentType || payment.type || 'Payment'}
                                                </span>
                                                {/* ⭐ Penalty Badge */}
                                                {payment.hasPenalty && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        +₦{payment.penaltyAmount} penalty
                                                    </span>
                                                )}
                                                {/* ⭐ Partial Payment Badge */}
                                                {payment.isPartialPayment && (
                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Partial
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatTransactionDate(payment)}
                                                </p>
                                                {payment.description && (
                                                    <p className="text-xs text-gray-400 truncate">{payment.description}</p>
                                                )}
                                            </div>
                                            {payment.hasPenalty && (
                                                <p className="text-[10px] text-red-500 line-through mt-0.5">
                                                    Base: {formatCurrency(payment.baseAmount || 0)}
                                                </p>
                                            )}
                                            {/* ⭐ Partial payment details */}
                                            {payment.isPartialPayment && (
                                                <p className="text-[10px] text-orange-500 mt-0.5">
                                                    Paid: {formatCurrency(payment.totalPaidSoFar || 0)} • Remaining: {formatCurrency(payment.remainingAmount || 0)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-3 flex-shrink-0">
                                            <p className={`text-base font-bold ${payment.hasPenalty ? 'text-red-600' : payment.isPartialPayment ? 'text-orange-600' : 'text-gray-600'}`}>
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            {payment.hasPenalty && (
                                                <p className="text-[10px] text-gray-400 line-through">
                                                    {formatCurrency(payment.baseAmount || 0)}
                                                </p>
                                            )}
                                            {payment.isPartialPayment && (
                                                <p className="text-[10px] text-orange-500">
                                                    Remaining: {formatCurrency(payment.remainingAmount || 0)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {memberPayments.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm">No member payments recorded yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== FOOTER ===== */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <Activity className="h-3 w-3 text-blue-500" />
                                Last updated: {new Date().toLocaleString()}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{totalTransactions} total transactions</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3 text-blue-500" />
                                Verified
                            </span>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Printer className="h-3 w-3" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialTransparency;
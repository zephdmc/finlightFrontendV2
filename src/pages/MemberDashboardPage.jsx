import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

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
  History,  // ✅ ADD THIS
  Filter,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  usePaymentTypes,
  usePayments,
  useTransactions,
  usePaymentSummary,
  usePublicIncomes,
  usePublicExpenditures,
  usePublicPayments
} from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';


// ⭐ Helper function to calculate total including penalty
const calculateTotalWithPenalty = (payment) => {
  if (!payment) return 0;

  let baseAmount = payment.amount || 0;
  let totalPenalty = 0;

  // Check penaltyBreakdown
  if (payment.penaltyBreakdown && payment.penaltyBreakdown.length > 0) {
    payment.penaltyBreakdown.forEach(item => {
      if (item.penalty && item.isLate) {
        totalPenalty += item.penalty;
      }
    });
  }

  // Fallback to penaltyAmount field
  if (totalPenalty === 0 && payment.penaltyAmount && payment.penaltyAmount > 0) {
    totalPenalty = payment.penaltyAmount;
  }

  return baseAmount + totalPenalty;
};
const MemberDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [outstandingFromTypes, setOutstandingFromTypes] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
  const navigate = useNavigate();

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

  const {
    data: userPayments = [],
    isLoading: paymentsLoading,
    refetch: refetchUserPayments
  } = usePayments({});

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

  const {
    data: publicPayments = [],
    isLoading: publicPaymentsLoading,
    refetch: refetchPublicPayments
  } = usePublicPayments();

  // Safe string helper
  const safeString = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process member data when React Query data arrives
  useEffect(() => {
    if (userPayments && paymentTypes) {
      processMemberData();
    }
  }, [userPayments, paymentTypes, paymentSummary]);

  // Process organization data when public data arrives
  useEffect(() => {
    if (publicIncomes && publicExpenditures && publicPayments) {
      processOrganizationData();
    }
  }, [publicIncomes, publicExpenditures, publicPayments]);

  const processMemberData = () => {
    try {
      const userId = user?._id || user?.id;

      // Process paid payment type IDs
      const paidPaymentTypeIds = new Set();
      const paidNames = new Set();
      const partialPayments = (userPayments || []).filter(p => p?.isPartial === true && p?.remainingAmount > 0);

      (userPayments || []).forEach(p => {
        if (p?.status === 'paid' && !(p?.isPartial === true && p?.remainingAmount > 0)) {
          if (p?.paymentTypeId) {
            let typeId = null;
            if (typeof p.paymentTypeId === 'object' && p.paymentTypeId._id) {
              typeId = p.paymentTypeId._id.toString();
            } else if (typeof p.paymentTypeId === 'string') {
              typeId = p.paymentTypeId;
            } else if (typeof p.paymentTypeId === 'object') {
              typeId = p.paymentTypeId.toString();
            }

            if (typeId) {
              paidPaymentTypeIds.add(typeId);
            }
          }

          if (p?.name) {
            paidNames.add(p.name);
          }
        }
      });

      // ⭐ Calculate outstanding types with penalties
      const now = new Date();
      const outstandingTypes = (paymentTypes || [])
        .filter(type => {
          const typeIdStr = type?._id?.toString();

          if (typeIdStr && paidPaymentTypeIds.has(typeIdStr)) {
            return false;
          }

          if (type?.name && paidNames.has(type.name)) {
            return false;
          }

          return true;
        })
        .map(type => {
          // ⭐ Calculate penalty for this payment type
          let penaltyAmount = 0;
          let isLate = false;

          if (type?.late_penalty_enabled) {
            const dueDateAfter = type.due_date_after || 30;
            const daysAfterDue = type.late_penalty_days_after || 7;

            // For dues, check if any months are late
            if (type.type === 'dues' || type.type === 'monthly_dues') {
              // Check current month
              const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              const [year, month] = currentMonthKey.split('-').map(Number);
              const dueDate = new Date(year, month - 1, 1);
              dueDate.setDate(dueDate.getDate() + dueDateAfter);

              const penaltyStartDate = new Date(dueDate);
              penaltyStartDate.setDate(penaltyStartDate.getDate() + daysAfterDue);

              isLate = now > penaltyStartDate;

              if (isLate) {
                if (type.late_penalty_type === 'percentage') {
                  penaltyAmount = type.amount * (type.late_penalty_value / 100);
                } else {
                  penaltyAmount = type.late_penalty_value;
                }
              }
            } else {
              // For non-dues, use creation date
              const dueDate = new Date(type.createdAt || now);
              dueDate.setDate(dueDate.getDate() + dueDateAfter);

              const penaltyStartDate = new Date(dueDate);
              penaltyStartDate.setDate(penaltyStartDate.getDate() + daysAfterDue);

              isLate = now > penaltyStartDate;

              if (isLate) {
                if (type.late_penalty_type === 'percentage') {
                  penaltyAmount = type.amount * (type.late_penalty_value / 100);
                } else {
                  penaltyAmount = type.late_penalty_value;
                }
              }
            }
          }

          const totalAmount = (type?.amount || 0) + (isLate ? penaltyAmount : 0);

          return {
            _id: `temp_${type?._id}`,
            paymentTypeId: type?._id,
            type: type?.type || 'dues',
            name: type?.name || 'Payment',
            amount: totalAmount,  // ⭐ Use total including penalty
            baseAmount: type?.amount || 0,
            penaltyAmount: penaltyAmount,
            isLate: isLate,
            status: 'unpaid',
            dueDate: null,
            description: type?.description || '',
            is_mandatory: type?.is_mandatory || false,
            frequency: type?.frequency || 'one-time'
          };
        });

      // Get existing unpaid payments
      const existingUnpaid = (userPayments || []).filter(p => p?.status === 'unpaid');

      // ⭐ Include partial payments in outstanding list
      const partialOutstanding = partialPayments.map(p => ({
        _id: p._id,
        paymentTypeId: p.paymentTypeId,
        type: p.type || 'dues',
        name: `${p.name || 'Payment'} (Partial)`,
        amount: p.remainingAmount || p.amount,
        originalAmount: p.amount,
        remainingAmount: p.remainingAmount,
        totalPaidSoFar: p.totalPaidSoFar || 0,
        status: 'partial',
        dueDate: p.dueDate,
        description: p.description || 'Partial payment remaining balance',
        is_mandatory: false,
        is_partial: true,
        parentPaymentId: p._id
      }));

      const allOutstanding = [...existingUnpaid, ...outstandingTypes];

      setPayments(userPayments || []);
      setOutstandingFromTypes(allOutstanding);

      if (paymentSummary) {
        setSummary(paymentSummary);
      }

    } catch (error) {
      console.error('Error processing member data:', error);
      setPayments([]);
      setOutstandingFromTypes([]);
    }
  };
  const processOrganizationData = () => {
    try {
      let totalManualIncome = 0;
      let allManualIncomes = [];
      let allExpenditures = [];
      let allMemberPayments = [];

      // Process manual incomes
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

      // Process member payments
      if (publicPayments && publicPayments.length > 0) {
        allMemberPayments = (publicPayments || []).map(p => ({
          ...p,
          amount: p?.amount || 0,
          source: p?.source || p?.paymentType || 'Member Payment',
          description: p?.description || '',
          memberName: p?.memberName || 'Member',
          date: p?.date || p?.paidAt || p?.createdAt || new Date()
        }));
      }

      // Process expenditures
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPaymentTypes(),
        refetchUserPayments(),
        refetchSummary(),
        refetchPublicIncomes(),
        refetchPublicExpenditures(),
        refetchPublicPayments()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
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

  const getAllIncomeRecords = () => {
    const formattedManualIncomes = (manualIncomes || []).map(inc => ({
      ...inc,
      incomeType: 'manual',
      displaySource: inc?.source || inc?.description || 'Manual Income',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      memberName: null,
      amount: inc?.amount || 0
    }));

    const formattedMemberPayments = (memberPayments || []).map(payment => ({
      ...payment,
      incomeType: 'member_payment',
      displaySource: payment?.source || payment?.paymentType || 'Member Payment',
      description: payment?.description || `${payment?.memberName || 'Member'} made a payment`,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      memberName: payment?.memberName,
      amount: payment?.amount || 0
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



  // ⭐ Calculate paid payments INCLUDING penalties
  const paymentsArray = Array.isArray(payments) ? payments : [];
  const paidPayments = paymentsArray.filter(p => p?.status === 'paid') || [];

  // ⭐ Calculate total paid INCLUDING penalties
  const totalPaid = paidPayments.reduce((sum, p) => {
    return sum + calculateTotalWithPenalty(p);
  }, 0);

  // ⭐ Calculate total outstanding INCLUDING penalties
  const totalOutstandingUser = outstandingFromTypes.reduce((sum, p) => {
    // For partial payments, use remainingAmount (which already includes penalty)
    if (p.is_partial) {
      return sum + (p.remainingAmount || p.amount || 0);
    }
    return sum + (p?.amount || 0);
  }, 0);

  const outstandingCount = outstandingFromTypes.length;

  const isLoading = typesLoading || paymentsLoading || summaryLoading || incomesLoading || expendituresLoading || publicPaymentsLoading;

  if (isLoading && payments.length === 0 && outstandingFromTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5" />
                <h1 className="font-bold text-lg">Welcome back, {user?.name?.split(' ')[0] || 'Member'}!</h1>
              </div>
              <p className="text-blue-100 text-xs">
                Here's your financial overview
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Buttons - History, Make Payment & Financial Transparency */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4">
            {/* Mobile: 2 columns top row, 1 column full width bottom row */}
            {/* Desktop/Tablet: 3 columns evenly */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* History Button - Takes 1 column on mobile */}


              {/* Make Payment Button - Takes 1 column on mobile */}
              <button
                onClick={() => navigate('/make-payment')}
                className="py-2.5 sm:py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-sm text-gray-600 hover:bg-gray-100 hover:shadow-md active:scale-95"
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="hidden xs:inline text-blue-500">My Levy</span>
                <span className="xs:hidden text-[10px] text-blue-500 font-medium">My levy</span>
              </button>

              <button
                onClick={() => navigate('/member/dues')}
                className="py-2.5 sm:py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-sm text-gray-600 hover:bg-gray-100 hover:shadow-md active:scale-95"
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="hidden xs:inline text-blue-500">My Dues</span>
                <span className="xs:hidden text-[10px] text-blue-500 font-medium"> My Dues</span>
              </button>



              {/* Transparency Button - Takes full width on mobile (span 2 columns), 1 column on larger screens */}
              <button
                onClick={() => navigate('/financial-transparency')}
                className="col-span-2 sm:col-span-1 py-2.5 sm:py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-sm text-gray-600 hover:bg-gray-100 hover:shadow-md active:scale-95"
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="hidden xs:inline text-blue-500">Organization  Finance</span>
                <span className="xs:hidden text-[10px] font-medium text-blue-500">Organization  Finance</span>
              </button>
            </div>
          </div>
        </div>


        {/* Recent Payments - Only 2 */}
        {/* Recent Payments - Only 2 */}
        {paidPayments.length > 0 && (
          <div className="px-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-4 py-xs border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Recent Payments
                </h2>
                <button
                  onClick={() => navigate('/payment-history')}
                  className="py-2 px-2 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 active:scale-95"
                >
                  <span className="hidden xs:inline text-blue-500">Payment History</span>
                  <span className="xs:hidden text-[10px] text-blue-500 font-medium">History</span>
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {paidPayments.slice(0, 2).map(payment => {
                  // ⭐ Calculate total with penalty for display
                  const totalAmount = calculateTotalWithPenalty(payment);
                  const hasPenalty = totalAmount > (payment.amount || 0);
                  const penaltyAmount = totalAmount - (payment.amount || 0);

                  return (
                    <div key={payment._id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 font-medium text-xs sm:text-sm capitalize">
                          {payment.paymentType?.name || payment.name || payment.type || 'Payment'}
                        </p>
                        <p className="font-medium text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                          {hasPenalty && (
                            <span className="text-[10px] bg-gray-50 text-gray-700 px-1.5 py-0.5 rounded-full">
                              +₦{penaltyAmount} penalty
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="font-bold text-blue-600 text-sm">{formatCurrency(totalAmount)}</p>
                    </div>
                  );
                })}
                {paidPayments.length > 2 && (
                  <div className="p-3 text-center">
                    <button
                      onClick={() => navigate('/payment-history')}
                      className="text-xs text-blue-600 font-medium hover:text-blue-800"
                    >
                      View All {paidPayments.length} Payments →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(totalPaid)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-lg font-bold text-gray-600">{formatCurrency(totalOutstandingUser)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Payments Made</p>
            <p className="text-lg font-bold text-blue-600">{paidPayments.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-bold text-red-600">{outstandingCount}</p>
          </div>
        </div>

        {outstandingFromTypes.filter(p => p.is_partial).length > 0 && (
          <div className="bg-orange-50 rounded-2xl shadow-sm p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-xs font-medium text-orange-700">Partial Payments</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-orange-700">
                  {outstandingFromTypes.filter(p => p.is_partial).length}
                </p>
                <p className="text-xs text-orange-600">
                  Remaining: {formatCurrency(outstandingFromTypes.filter(p => p.is_partial).reduce((sum, p) => sum + (p.remainingAmount || p.amount || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        )} */}



        {/* Outstanding Summary Card - Ultra Compact */}
        {/* Outstanding Summary Card - Mobile Optimized */}
        {/* {outstandingFromTypes.length > 0 && (
          <div className="px-3 sm:px-4">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-yellow-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                      Outstanding Payments
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-0.5">
                      <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                        {outstandingFromTypes.length} payment(s)
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-yellow-700 whitespace-nowrap">
                        Total: {formatCurrency(totalOutstandingUser)}
                      </span>
                      {outstandingFromTypes.some(p => p.penaltyAmount > 0 || p.isLate) && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                          Includes penalties
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to="/make-payment"
                  className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-600 text-white text-xs sm:text-sm rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1 font-medium"
                >
                  Pay Now
                  <span className="text-[10px] sm:text-xs">→</span>
                </Link>
              </div>
            </div>
          </div>
        )} */}




        {/* Organization Financial Health */}
        {/* <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Organization Financial Health
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Financial transparency report</p>
          </div>
          <div className="p-4 space-y-3">
            <div className={`flex justify-between items-center p-3 rounded-xl border ${orgFinancialData.netBalance >= 0
              ? 'bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
              }`}>
              <div className="flex items-center gap-2">
                <PiggyBank className={`h-4 w-4 ${orgFinancialData.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                <span className={`text-xs font-medium ${orgFinancialData.netBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  Current Balance
                </span>
              </div>
              <span className={`text-base font-bold ${orgFinancialData.netBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatCurrency(orgFinancialData.netBalance)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl">
              <div>
                <span className="text-xs font-medium text-blue-700 block">Total Income</span>
                <span className="text-xs text-blue-500">
                  {formatCurrency(orgFinancialData.totalPaymentsCollected)} from members
                </span>
              </div>
              <span className="text-base font-bold text-blue-700">{formatCurrency(orgFinancialData.totalIncome)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
              <span className="text-xs font-medium text-red-700">Total Expenditure</span>
              <span className="text-base font-bold text-red-700">{formatCurrency(orgFinancialData.totalExpenditure)}</span>
            </div>
          </div>
        </div> */}





        {/* Empty State */}
        {outstandingFromTypes.length === 0 && paidPayments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No Payment Records</h3>
            <p className="text-xs text-gray-500">You don't have any payment records yet.</p>
            <Link
              to="/payments"
              className="inline-block mt-4 text-sm text-blue-600 font-medium"
            >
              Make a Payment →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
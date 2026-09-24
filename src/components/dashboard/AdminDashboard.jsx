import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TransactionService from '../../services/TransactionService';
import api from '../../services/api';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw,
  Wallet,
  BarChart3,
  ChevronRight,
  PieChart,
  CreditCard,
  Filter,
  User,
  Gavel,
  X,
  Tag,
  History,
  Building,
  CheckCircle,
  FileText
} from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import {
  useOrganizationSettings,
  usePaymentsWithPenalties,
  usePublicIncomes,
  usePublicExpenditures,
  useUsers
} from '../../hooks/usePaymentData';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState({
    type: 'all',
    limit: 10
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Setup dismissal state - persists for the current browser session only
  const [dismissedSetup, setDismissedSetup] = useState(() => {
    // Check if admin dismissed setup in this session (resets when browser closes)
    return sessionStorage.getItem('admin_setup_dismissed') === 'true';
  });

  const [calculatedTotals, setCalculatedTotals] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalPayments: 0,
    totalManualIncome: 0,
    netBalance: 0,
    paymentCount: 0,
    totalMembers: 0,
    paidMembers: 0,
    totalOutstanding: 0,
    outstandingCount: 0
  });

  // ========== REACT QUERY HOOKS ==========
  const {
    data: organization = null,
    isLoading: orgLoading,
    refetch: refetchOrg
  } = useOrganizationSettings();

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments
  } = usePaymentsWithPenalties();

  const {
    data: incomes = [],
    isLoading: incomesLoading,
    refetch: refetchIncomes
  } = usePublicIncomes(100);

  const {
    data: expenditures = [],
    isLoading: expendituresLoading,
    refetch: refetchExpenditures
  } = usePublicExpenditures(100);

  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useUsers('member', 100);

  // ========== ROBUST SETUP COMPLETION CHECK ==========
  // This checks if the organization has VALID setup (not just exists)
  // ========== ROBUST SETUP COMPLETION CHECK ==========
  // This checks if the organization has VALID setup (not just exists)
  const hasCompletedSetup = useMemo(() => {
    if (!organization || orgLoading) return false;

    // Check Flutterwave fields (your current payment gateway)
    const flutterwave = organization?.flutterwave || {};
    const subaccountCode = flutterwave?.subaccountCode;
    const bankName = flutterwave?.bankName;
    const accountNumber = flutterwave?.accountNumber;

    // Also check Paystack as fallback (for legacy organizations)
    const paystack = organization?.paystack || {};
    const paystackSubaccount = paystack?.subaccountCode;
    const paystackBank = paystack?.bankName;
    const paystackAccount = paystack?.accountNumber;

    // Use Flutterwave first, fallback to Paystack
    const hasValidSubaccount = (subaccountCode && typeof subaccountCode === 'string' && subaccountCode.trim().length > 0) ||
      (paystackSubaccount && typeof paystackSubaccount === 'string' && paystackSubaccount.trim().length > 0);

    const hasValidBank = (bankName && typeof bankName === 'string' && bankName.trim().length > 0) ||
      (paystackBank && typeof paystackBank === 'string' && paystackBank.trim().length > 0);

    const hasValidAccount = (accountNumber && typeof accountNumber === 'string' && accountNumber.trim().length > 0) ||
      (paystackAccount && typeof paystackAccount === 'string' && paystackAccount.trim().length > 0);

    // Setup is complete ONLY if all three have valid values
    return hasValidSubaccount && hasValidBank && hasValidAccount;
  }, [organization, orgLoading]);

  // Determine if we need to show the setup modal
  const needsBankSetup = !hasCompletedSetup && !dismissedSetup && !orgLoading;

  // Auto-clear dismissal when setup is actually completed (prevents stuck state)
  useEffect(() => {
    if (hasCompletedSetup && dismissedSetup) {
      // If setup is complete but modal was dismissed, clear the dismissal
      sessionStorage.removeItem('admin_setup_dismissed');
      setDismissedSetup(false);
      // Refresh organization data to ensure UI updates
      refetchOrg();
    }
  }, [hasCompletedSetup, dismissedSetup, refetchOrg]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process data when all data arrives
  useEffect(() => {
    if (!paymentsLoading && !incomesLoading && !expendituresLoading && !usersLoading && !orgLoading) {
      processDashboardData();
    }
  }, [payments, incomes, expenditures, users, paymentsLoading, incomesLoading, expendituresLoading, usersLoading, orgLoading]);

  useEffect(() => {
    applyFilters();
  }, [recentTransactions, transactionFilter]);

  const processDashboardData = async () => {
    setLoading(true);
    try {
      // Process payments - FIX: Include penalties in payment amounts
      const allPayments = Array.isArray(payments) ? payments : [];

      // Log payment details for debugging
      if (allPayments.length > 0) {
        allPayments.forEach((p, idx) => {
          // â­ Calculate total including penalty from penaltyBreakdown
          let totalPenalty = 0;
          if (p?.penaltyBreakdown && p.penaltyBreakdown.length > 0) {
            p.penaltyBreakdown.forEach(item => {
              if (item.penalty && item.isLate) {
                totalPenalty += item.penalty;
              }
            });
          }
          const totalAmount = (p?.amount || 0) + totalPenalty;

        });
      }
      // ---------- FILTER: ONLY count payments explicitly marked as paid ----------
      const paidPayments = allPayments.filter(p => {
        const amount = p?.amount || 0;
        if (amount <= 0) return false;

        const status = (p?.status || '').toLowerCase();

        // â­ ONLY include payments with status === 'paid'
        // Everything else (unpaid, pending, partial, fine, missing status) is excluded
        if (status !== 'paid') {
          return false;
        }

        return true;
      });

            // â­ Penalties are NOT added to income â€” the base `amount` already reflects
      // the correct value (penalties were double-counting â‚¦200)
      // â­ Penalties ARE income â€” include them in total
      let totalPaymentsAmount = 0;
      let totalPenalties = 0;
      paidPayments.forEach(p => {
        const baseAmount = p?.amount || 0;

        let pen = 0;
        if (p?.penaltyBreakdown?.length) {
          p.penaltyBreakdown.forEach(item => {
            if (item.penalty && item.isLate) pen += item.penalty;
          });
        }
        if (pen === 0 && p?.penaltyAmount > 0) pen = p.penaltyAmount;

        totalPaymentsAmount += baseAmount + pen;   // â­ INCLUDE penalty
        totalPenalties += pen;
      });



      // Calculate outstanding payments
      const unpaidPayments = allPayments.filter(p => {
        const isUnpaid = p?.status === 'unpaid' || p?.status === 'pending';
        const isPartial = p?.isPartial === true;
        return isUnpaid || isPartial;
      });

      // â­ Calculate outstanding amount including penalties
      let totalOutstanding = 0;
      unpaidPayments.forEach(p => {
        let totalPenalty = 0;
        if (p?.penaltyBreakdown && p.penaltyBreakdown.length > 0) {
          p.penaltyBreakdown.forEach(item => {
            if (item.penalty && item.isLate) {
              totalPenalty += item.penalty;
            }
          });
        }
        const totalAmount = (p?.amount || 0) + totalPenalty;
        totalOutstanding += totalAmount;
      });

      const outstandingCount = unpaidPayments.length;
      setOutstandingPayments(unpaidPayments);

      // Process manual incomes
      const manualIncomes = Array.isArray(incomes) ? incomes : [];
      const totalManualIncome = manualIncomes.reduce((sum, inc) => sum + (inc?.amount || 0), 0);

      // Process members
      const membersList = Array.isArray(users) ? users : [];
      const members = membersList.filter(m => m && m.role === 'member');
      const totalMembers = members.length;

      // Count paid registrations from payments
      const registrationPayments = paidPayments.filter(p => {
        const paymentType = p?.type || p?.paymentType || '';
        return paymentType === 'registration' || paymentType?.toLowerCase().includes('registration');
      });
      const paidMembersCount = registrationPayments.length;

      // Process expenses
      const expenses = Array.isArray(expenditures) ? expenditures : [];
      const totalExpense = expenses.reduce((sum, exp) => sum + (exp?.amount || 0), 0);

      // â­ Calculate totals - PAYMENTS ARE INCOME (including penalties!)
      const totalIncome = totalManualIncome + totalPaymentsAmount;
      const netBalance = totalIncome - totalExpense;


      setCalculatedTotals({
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        totalPayments: totalPaymentsAmount,
        totalManualIncome: totalManualIncome,
        netBalance: netBalance,
        paymentCount: paidPayments.length,
        totalMembers: totalMembers,
        paidMembers: paidMembersCount,
        totalOutstanding: totalOutstanding,
        outstandingCount: outstandingCount
      });

      // Generate monthly data using paid payments as income (including penalties)
      generateMonthlyData(paidPayments, manualIncomes);

      // Build recent transactions
      buildRecentTransactions(paidPayments, manualIncomes, expenses);

    } catch (error) {
      console.error('Error processing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (payments, manualIncomes) => {
    const monthlyMap = new Map();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    months.forEach(month => {
      monthlyMap.set(month, { income: 0 });
    });

    // Add payments to months (as income) - â­ Include penalties
    if (payments && payments.length > 0) {
      payments.forEach(payment => {
        // Check multiple possible date fields
        const dateValue = payment?.paidAt || payment?.date || payment?.createdAt;
        if (dateValue) {
          try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
              const monthName = months[date.getMonth()];
              const existing = monthlyMap.get(monthName);

              // â­ Calculate total including penalty
              let totalPenalty = 0;
              if (payment?.penaltyBreakdown && payment.penaltyBreakdown.length > 0) {
                payment.penaltyBreakdown.forEach(item => {
                  if (item.penalty && item.isLate) {
                    totalPenalty += item.penalty;
                  }
                });
              }
              const totalAmount = (payment?.amount || 0) + totalPenalty;

              existing.income += totalAmount;
              monthlyMap.set(monthName, existing);
            }
          } catch (err) {
            console.warn('Invalid payment date:', dateValue);
          }
        }
      });
    }

    // Add manual incomes to months
    if (manualIncomes && manualIncomes.length > 0) {
      manualIncomes.forEach(income => {
        if (income && income.date) {
          try {
            const date = new Date(income.date);
            if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
              const monthName = months[date.getMonth()];
              const existing = monthlyMap.get(monthName);
              existing.income += income.amount || 0;
              monthlyMap.set(monthName, existing);
            }
          } catch (err) {
            console.warn('Invalid income date:', income.date);
          }
        }
      });
    }

    const chartData = months.map(month => ({
      monthName: month,
      income: monthlyMap.get(month).income
    }));

    setMonthlyData(chartData);
  };

  const buildRecentTransactions = (payments, manualIncomes, expenditures) => {
    try {
      let allTransactions = [];

      // Add payments as INCOME transactions - â­ Include penalties
      if (payments && payments.length > 0) {
        payments.forEach(payment => {
          // Determine payment type for display
          let paymentType = 'Member Payment';
          const paymentName = payment?.name || payment?.paymentType || payment?.type || '';

          if (paymentName.toLowerCase().includes('wedding') || paymentName.toLowerCase().includes('leavy')) {
            paymentType = 'Wedding Levy';
          } else if (paymentName.toLowerCase().includes('registration')) {
            paymentType = 'Registration Fee';
          } else if (paymentName.toLowerCase().includes('annual') || paymentName.toLowerCase().includes('dues')) {
            paymentType = 'Annual Dues';
          } else if (paymentName.toLowerCase().includes('event')) {
            paymentType = 'Event Fee';
          } else if (paymentName.toLowerCase().includes('fine')) {
            paymentType = 'Fine/Penalty';
          }

          // â­ Calculate total including penalty
          let totalPenalty = 0;
          if (payment?.penaltyBreakdown && payment.penaltyBreakdown.length > 0) {
            payment.penaltyBreakdown.forEach(item => {
              if (item.penalty && item.isLate) {
                totalPenalty += item.penalty;
              }
            });
          }
          const totalAmount = (payment.amount || 0) + totalPenalty;

          allTransactions.push({
            id: payment._id,
            type: 'payment',
            amount: totalAmount,  // â­ Use total including penalty
            date: payment.paidAt || payment.createdAt || payment.date,
            description: payment.description || `${paymentType} from ${payment?.memberName || payment?.name || 'Member'}`,
            member: payment.memberName || payment?.name || 'Member',
            category: 'Payment',
            categoryLabel: 'Payment',
            isMemberPayment: true,
            penaltyAmount: totalPenalty > 0 ? totalPenalty : 0  // â­ Show penalty if any
          });
        });
      }

      // Add manual incomes
      if (manualIncomes && manualIncomes.length > 0) {
        manualIncomes.forEach(inc => {
          allTransactions.push({
            id: inc._id,
            type: 'income',
            amount: inc.amount || 0,
            date: inc.date || inc.createdAt,
            description: inc.description || inc.source || 'Manual income',
            source: inc.source,
            category: 'Income',
            categoryLabel: 'Income'
          });
        });
      }

      // Add expenditures
      if (expenditures && expenditures.length > 0) {
        expenditures.forEach(exp => {
          allTransactions.push({
            id: exp._id,
            type: 'expense',
            amount: exp.amount || 0,
            date: exp.date || exp.createdAt,
            description: exp.description || exp.purpose || 'Expense',
            purpose: exp.purpose,
            category: 'Expense',
            categoryLabel: 'Expense'
          });
        });
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setRecentTransactions(allTransactions);
      applyFilters();

    } catch (error) {
      console.error('Error building transactions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...recentTransactions];

    if (transactionFilter.type !== 'all') {
      let typeMap = {
        'payment': 'Payment',
        'income': 'Income',
        'expense': 'Expense'
      };
      filtered = filtered.filter(t => t.category === typeMap[transactionFilter.type]);
    }

    filtered = filtered.slice(0, transactionFilter.limit);

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (type, value) => {
    setTransactionFilter(prev => ({ ...prev, [type]: value }));
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setTransactionFilter({ type: 'all', limit: 10 });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchOrg(),
        refetchPayments(),
        refetchIncomes(),
        refetchExpenditures(),
        refetchUsers()
      ]);
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle dismiss setup - stores in session storage (resets when browser closes)
  const handleDismissSetup = useCallback(() => {
    sessionStorage.setItem('admin_setup_dismissed', 'true');
    setDismissedSetup(true);
    toast.success('You can complete setup later from Organization Settings', {
      duration: 4000,
      icon: 'â°'
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Payment':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: CreditCard };
      case 'Income':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: TrendingUp };
      case 'Expense':
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: TrendingDown };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Wallet };
    }
  };

  const isLoading = orgLoading || paymentsLoading || incomesLoading || expendituresLoading || usersLoading;

  // Show loading spinner while checking setup status
  if (isLoading && !organization && !payments.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Show setup modal ONLY if:
  // 1. Organization has NOT completed setup (no valid subaccount/bank/account)
  // 2. Admin hasn't dismissed it in this session
  // 3. Data is loaded (not loading)
  if (needsBankSetup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-3" />
              <h1 className="text-2xl font-bold">Complete Your Setup</h1>
              <p className="text-yellow-100 mt-2">Configure payment settings to start receiving funds</p>
            </div>

            <div className="p-6">
              <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Payment Setup Required</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      To receive payments from members, you need to configure your Paystack subaccount and bank details.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/organization-settings')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-700 transition"
              >
                Configure Payment Settings
              </button>

              <button
                onClick={handleDismissSetup}
                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Continue to Dashboard (I'll set up later)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Bank Setup Reminder Banner - Shows only when setup incomplete AND modal was dismissed */}
        {!hasCompletedSetup && dismissedSetup && (
          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-700">Payment setup incomplete</span>
              </div>
              <button
                onClick={() => navigate('/organization-settings')}
                className="text-xs text-blue-600 font-medium hover:text-blue-700"
              >
                Complete Setup â†’
              </button>
            </div>
          </div>
        )}

        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h1 className="font-semibold text-lg">Admin Dashboard</h1>
              </div>
              <p className="text-blue-100 text-xs mt-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
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

          {/* Stats Summary Row */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-blue-200">Total Income</p>
              <p className="text-sm font-bold">{formatCurrency(calculatedTotals.totalIncome)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Expenses</p>
              <p className="text-sm font-bold">{formatCurrency(calculatedTotals.totalExpense)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Balance</p>
              <p className={`text-sm font-bold ${calculatedTotals.netBalance >= 0 ? 'text-blue-300' : 'text-gray-300'}`}>
                {formatCurrency(calculatedTotals.netBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {/* Members */}
            <button
              onClick={() => navigate('/members')}
              className="py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-sm bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-blue-500">Members</span>
            </button>

            {/* Payments */}
            {/* <button
              onClick={() => navigate('/payments')}
              className="py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-sm bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs">Payments</span>
            </button> */}

            {/* Payment History (Admin) */}
            <button
              onClick={() => navigate('/admin-history')}
              className="py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-sm bg-blue-100 flex items-center justify-center">
                <History className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-blue-500">History</span>
            </button>

            {/* Fine Management */}
            <button
              onClick={() => navigate('/fine-management')}
              className="py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-sm bg-blue-100 flex items-center justify-center">
                <Gavel className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-blue-500">Fines</span>
            </button>

            {/* Payment Types */}
            <button
              onClick={() => navigate('/contribution-management')}
              className="py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-sm bg-blue-100 flex items-center justify-center">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-blue-500">Contribution</span>
            </button>

            {/* Account */}
            <button
              onClick={() => navigate('/account')}
              className="py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-sm bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-blue-500">Account</span>
            </button>

            {/* Reports */}
            <button
              onClick={() => navigate('/reports')}
              className="py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-sm bg-blue-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-blue-500">Reports</span>
            </button>

          </div>
        </div>





        {/* Stats Cards â€” Remodeled: Members left, Rate + Avg stacked right */}
        <div className="grid grid-cols-2 gap-2">
          {/* LEFT: Total Members (tall) */}
          <div className="bg-white col-span-1 rounded-xl p-3 flex flex-col justify-center items-center text-center">
            <div className="flex items-center justify-between mb-1">
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 ">
                {calculatedTotals.totalMembers}
              </p>
              {/* <p className="text-xs text-gray-600">
                {calculatedTotals.paidMembers} paid registration
              </p> */}
            </div>
          </div>

          {/* RIGHT: Payment Rate + Average Payment stacked */}
          <div className="flex flex-col gap-3">
            {/* Payment Rate */}
            <div className="bg-white rounded-2xl shadow-sm p-3 flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">Payment Rate</p>
                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5 text-gray-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-600">
                {calculatedTotals.totalMembers > 0
                  ? Math.round((calculatedTotals.paidMembers / calculatedTotals.totalMembers) * 100)
                  : 0}%
              </p>
              {/* <p className="text-xs text-gray-400 mt-1">
                {calculatedTotals.paidMembers} of {calculatedTotals.totalMembers}
              </p> */}
            </div>

            {/* Average Payment */}
            <div className="bg-white rounded-2xl shadow-sm p-3 flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">Avg Payment</p>
                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-gray-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-600">
                {calculatedTotals.paymentCount > 0
                  ? formatCurrency(Math.round(calculatedTotals.totalPayments / calculatedTotals.paymentCount))
                  : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector and Chart */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex gap-1">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {monthlyData.length > 0 && (
            <div className="p-4">
              <div style={{ height: isMobile ? 200 : 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="monthName" tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ fontSize: 12, borderRadius: 12 }}
                    />
                    <Bar dataKey="income" fill="#1041bdff" name="Income" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Recent Activity
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredTransactions.length} of {recentTransactions.length} transactions
              </p>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-3 w-3" />
                Filter
                {transactionFilter.type !== 'all' && (
                  <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                )}
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[180px]">
                  <div className="p-2">
                    <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">Transaction Type</div>
                    <button
                      onClick={() => handleFilterChange('type', 'all')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => handleFilterChange('type', 'payment')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'payment' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Payments Only
                    </button>
                    <button
                      onClick={() => handleFilterChange('type', 'income')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'income' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Income Only
                    </button>
                    <button
                      onClick={() => handleFilterChange('type', 'expense')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.type === 'expense' ? 'bg-gray-50 text-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Expenses Only
                    </button>

                    <div className="border-t border-gray-100 my-2"></div>

                    <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">Items to Show</div>
                    {[5, 10, 15, 20, 50].map(limit => (
                      <button
                        key={limit}
                        onClick={() => handleFilterChange('limit', limit)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${transactionFilter.limit === limit ? 'bg-graye-50 text-graye-700' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        Show {limit} items
                      </button>
                    ))}

                    {(transactionFilter.type !== 'all' || transactionFilter.limit !== 10) && (
                      <>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          onClick={clearFilters}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          Clear Filters
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction, index) => {
                  const style = getCategoryStyle(transaction.category);
                  const IconComponent = style.icon;
                  const hasPenalty = transaction.penaltyAmount && transaction.penaltyAmount > 0;

                  return (
                    <div key={transaction.id || index} className={`flex items-center justify-between p-3 ${style.bg} rounded-xl border ${style.border}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center bg-white`}>
                            <IconComponent className="h-3 w-3" style={{ color: style.text.replace('text-', '') }} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {transaction.category === 'Payment'
                                ? transaction.description || 'Member Payment'
                                : transaction.category === 'Income'
                                  ? transaction.source || 'Manual Income'
                                  : transaction.purpose || 'Expense'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.date)}
                              {/* â­ Show penalty badge */}
                              {hasPenalty && (
                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                  +â‚¦{transaction.penaltyAmount} penalty
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${transaction.category === 'Expense' ? 'text-gray-600' : 'text-blue-600'}`}>
                          {transaction.category === 'Expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-white ${style.text}`}>
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
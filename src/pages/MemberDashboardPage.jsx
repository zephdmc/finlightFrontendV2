import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
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
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [manualIncomes, setManualIncomes] = useState([]);
  const [memberPayments, setMemberPayments] = useState([]);
  const [expenditureList, setExpenditureList] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [outstandingFromTypes, setOutstandingFromTypes] = useState([]);
  
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMemberData();
    fetchPublicOrganizationData();
  }, []);

  const fetchPublicOrganizationData = async () => {
    try {
      let totalManualIncome = 0;
      let totalExpenditure = 0;
      let allManualIncomes = [];
      let allExpenditures = [];
      let allMemberPayments = [];

      try {
        const incomesResponse = await api.get('/transactions/income/public', {
          params: { page: 1, limit: 100 }
        });
        
        if (incomesResponse?.data?.data?.records) {
          allManualIncomes = incomesResponse.data.data.records;
        } else if (incomesResponse?.data?.records) {
          allManualIncomes = incomesResponse.data.records;
        } else if (Array.isArray(incomesResponse?.data)) {
          allManualIncomes = incomesResponse.data;
        }
        
        totalManualIncome = allManualIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
        
      } catch (err) {
        console.error('Error fetching manual incomes:', err);
      }

      try {
        const paymentsRes = await api.get('/payments/public/income');
        
        if (paymentsRes?.data?.data?.records) {
          allMemberPayments = paymentsRes.data.data.records;
        } else if (paymentsRes?.data?.records) {
          allMemberPayments = paymentsRes.data.records;
        } else if (Array.isArray(paymentsRes?.data)) {
          allMemberPayments = paymentsRes.data;
        }
        
      } catch (err) {
        console.error('Error fetching member payments:', err);
      }

      try {
        const expendituresRes = await api.get('/transactions/expenditure/public', {
          params: { page: 1, limit: 100 }
        });
        
        if (expendituresRes?.data?.data?.records) {
          allExpenditures = expendituresRes.data.data.records;
        } else if (expendituresRes?.data?.records) {
          allExpenditures = expendituresRes.data.records;
        } else if (Array.isArray(expendituresRes?.data)) {
          allExpenditures = expendituresRes.data;
        }
        
        totalExpenditure = allExpenditures.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        
      } catch (err) {
        console.error('Error fetching expenditures:', err);
      }

      const totalPaymentsCollected = allMemberPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
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
      console.error('Error fetching public organization data:', error);
      setManualIncomes([]);
      setMemberPayments([]);
      setExpenditureList([]);
    }
  };

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const userId = user?._id || user?.id;
      
      if (!userId) {
        console.error('No user ID found');
        setLoading(false);
        return;
      }

      // Fetch all payment types
      const paymentTypesRes = await api.get('/payment-types');
      let allPaymentTypes = paymentTypesRes.data?.data?.records || paymentTypesRes.data?.data || [];
      
      console.log('=== All Payment Types ===');
      console.log(allPaymentTypes.map(t => ({ id: t._id, name: t.name, type: t.type })));
      
      // Fetch user's existing payments
      const paymentsResponse = await api.get(`/payments?userId=${userId}`);
      let paymentsData = [];
      if (paymentsResponse?.data?.data?.records) {
        paymentsData = paymentsResponse.data.data.records;
      } else if (paymentsResponse?.data?.records) {
        paymentsData = paymentsResponse.data.records;
      } else if (Array.isArray(paymentsResponse?.data)) {
        paymentsData = paymentsResponse.data;
      }
      
      console.log('=== User Paid Payments ===');
      console.log(paymentsData.filter(p => p.status === 'paid').map(p => ({ 
        name: p.name, 
        paymentTypeId: p.paymentTypeId,
        type: p.type
      })));
      
      // Track which payment types have been paid (by ID and by name)
      const paidPaymentTypeIds = new Set();
      const paidNames = new Set();
      
      paymentsData.forEach(p => {
        if (p.status === 'paid') {
          // Track by paymentTypeId (handle both object and string)
          if (p.paymentTypeId) {
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
              console.log(`Marked paymentTypeId ${typeId} as PAID`);
            }
          }
          
          // Track by name (important for payments without paymentTypeId)
          if (p.name) {
            paidNames.add(p.name);
            console.log(`Marked name "${p.name}" as PAID`);
          }
        }
      });
      
      console.log('=== Paid IDs Set ===', Array.from(paidPaymentTypeIds));
      console.log('=== Paid Names Set ===', Array.from(paidNames));
      
      // Generate outstanding payment types
      const outstandingTypes = allPaymentTypes
        .filter(type => {
          const typeIdStr = type._id.toString();
          
          // Check by ID
          if (paidPaymentTypeIds.has(typeIdStr)) {
            console.log(`❌ SKIPPING (paid by ID): ${type.name}`);
            return false;
          }
          
          // Check by name
          if (paidNames.has(type.name)) {
            console.log(`❌ SKIPPING (paid by name): ${type.name}`);
            return false;
          }
          
          console.log(`✅ KEEPING (outstanding): ${type.name}`);
          return true;
        })
        .map(type => ({
          _id: `temp_${type._id}`,
          paymentTypeId: type._id,
          type: type.type || 'dues',
          name: type.name,
          amount: type.amount,
          status: 'unpaid',
          dueDate: null,
          description: type.description,
          is_mandatory: type.is_mandatory,
          frequency: type.frequency
        }));
      
      const existingUnpaid = paymentsData.filter(p => p.status === 'unpaid');
      const allOutstanding = [...existingUnpaid, ...outstandingTypes];
      
      console.log('=== Outstanding Types Count ===', outstandingTypes.length);
      console.log('=== Outstanding Types ===', outstandingTypes.map(t => t.name));
      
      setPayments(paymentsData);
      setOutstandingFromTypes(allOutstanding);
      
      try {
        const summaryResponse = await api.get(`/users/${userId}/payment-summary`);
        setSummary(summaryResponse.data?.data || summaryResponse.data);
      } catch (err) {
        console.warn('Payment summary not available:', err);
      }
      
    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to load dashboard data');
      setPayments([]);
      setOutstandingFromTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Refreshing dashboard...', { id: 'refresh' });
    try {
      await Promise.all([fetchMemberData(), fetchPublicOrganizationData()]);
      toast.success('Dashboard refreshed', { id: 'refresh' });
    } catch (error) {
      toast.error('Failed to refresh dashboard', { id: 'refresh' });
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
    const formattedManualIncomes = manualIncomes.map(inc => ({
      ...inc,
      incomeType: 'manual',
      displaySource: inc.source || inc.description || 'Manual Income',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      memberName: null
    }));
    
    const formattedMemberPayments = memberPayments.map(payment => ({
      ...payment,
      incomeType: 'member_payment',
      displaySource: payment.source || payment.paymentType || 'Member Payment',
      description: payment.description || `${payment.memberName || 'Member'} made a payment`,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      memberName: payment.memberName
    }));
    
    const allIncomes = [...formattedManualIncomes, ...formattedMemberPayments];
    allIncomes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return allIncomes;
  };

  const allIncomeRecords = getAllIncomeRecords();

  const getUniqueIncomeSources = () => {
    const sources = new Set();
    allIncomeRecords.forEach(item => {
      const source = item.displaySource || item.source || item.description || 'Other';
      sources.add(source);
    });
    return ['all', ...Array.from(sources)];
  };

  const getUniqueExpenditurePurposes = () => {
    const purposes = new Set();
    expenditureList.forEach(item => {
      const purpose = item.purpose || item.description || 'Other';
      purposes.add(purpose);
    });
    return ['all', ...Array.from(purposes)];
  };

  const filteredIncome = incomeFilter === 'all' 
    ? allIncomeRecords 
    : allIncomeRecords.filter(item => {
        const source = item.displaySource || item.source || item.description || 'Other';
        return source === incomeFilter;
      });

  const filteredExpenditure = expenditureFilter === 'all' 
    ? expenditureList 
    : expenditureList.filter(item => {
        const purpose = item.purpose || item.description || 'Other';
        return purpose === expenditureFilter;
      });

  const filteredIncomeTotal = filteredIncome.reduce((sum, item) => sum + (item.amount || 0), 0);
  const filteredExpenditureTotal = filteredExpenditure.reduce((sum, item) => sum + (item.amount || 0), 0);

  const clearIncomeFilter = () => setIncomeFilter('all');
  const clearExpenditureFilter = () => setExpenditureFilter('all');

  const paymentsArray = Array.isArray(payments) ? payments : [];
  const paidPayments = paymentsArray.filter(p => p?.status === 'paid') || [];
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p?.amount || 0), 0);
  const totalOutstandingUser = outstandingFromTypes.reduce((sum, p) => sum + (p?.amount || 0), 0);
  const outstandingCount = outstandingFromTypes.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 animate-pulse">
            <div className="h-6 bg-white/20 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5" />
                <h1 className="font-bold text-lg">Welcome back!</h1>
              </div>
              <p className="text-blue-100 text-xs">
                {user?.name?.split(' ')[0] || 'Member'}
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
          <p className="text-xs text-blue-100 mt-2 opacity-80">Your financial summary</p>
        </div>

        {/* Personal Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalOutstandingUser)}</p>
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

        {/* Organization Financial Health */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Organization Financial Health
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Financial transparency report</p>
          </div>
          <div className="p-4 space-y-3">
            <div className={`flex justify-between items-center p-3 rounded-xl border ${
              orgFinancialData.netBalance >= 0 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <PiggyBank className={`h-4 w-4 ${orgFinancialData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs font-medium ${orgFinancialData.netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Current Balance
                </span>
              </div>
              <span className={`text-base font-bold ${orgFinancialData.netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(orgFinancialData.netBalance)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div>
                <span className="text-xs font-medium text-blue-700 block">Total Income</span>
                <span className="text-xs text-blue-500">
                  {formatCurrency(orgFinancialData.totalPaymentsCollected)} from members + 
                  {formatCurrency(orgFinancialData.totalManualIncome)} manual
                </span>
              </div>
              <span className="text-base font-bold text-blue-700">{formatCurrency(orgFinancialData.totalIncome)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
              <span className="text-xs font-medium text-red-700">Total Expenditure</span>
              <span className="text-base font-bold text-red-700">{formatCurrency(orgFinancialData.totalExpenditure)}</span>
            </div>
          </div>
        </div>

        {/* Combined Income & Expenditure Section */}
        {(allIncomeRecords.length > 0 || expenditureList.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  Financial Records (For Transparency)
                </h2>
                <button
                  onClick={() => setShowTransactions(!showTransactions)}
                  className="text-xs text-indigo-600 font-medium"
                >
                  {showTransactions ? 'Hide' : 'View Details'}
                </button>
              </div>
            </div>
            
            {showTransactions && (
              <div className="p-4">
                {/* Combined Income Section */}
                {allIncomeRecords.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Income Records ({allIncomeRecords.length})
                        <span className="text-xs font-normal text-gray-500 ml-2">
                          {memberPayments.length} member payments + {manualIncomes.length} manual
                        </span>
                      </h3>
                      <div className="relative">
                        <button
                          onClick={() => setShowIncomeFilters(!showIncomeFilters)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Filter className="h-3 w-3" />
                          Filter
                        </button>
                        
                        {showIncomeFilters && (
                          <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[180px]">
                            <div className="p-2">
                              <div className="flex items-center justify-between mb-2 px-2">
                                <span className="text-xs font-medium text-gray-700">Filter by Source</span>
                                {incomeFilter !== 'all' && (
                                  <button
                                    onClick={clearIncomeFilter}
                                    className="text-xs text-red-500 hover:text-red-700"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {getUniqueIncomeSources().map(source => (
                                  <button
                                    key={source}
                                    onClick={() => {
                                      setIncomeFilter(source);
                                      setShowIncomeFilters(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                      incomeFilter === source
                                        ? 'bg-green-50 text-green-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    {source === 'all' ? 'All Sources' : source}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {incomeFilter !== 'all' && (
                      <div className="mb-3 p-2 bg-green-50 rounded-lg flex justify-between items-center">
                        <span className="text-xs text-green-700">Filtered Total:</span>
                        <span className="text-sm font-bold text-green-700">{formatCurrency(filteredIncomeTotal)}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredIncome.slice(0, 20).map((item, idx) => (
                        <div key={idx} className={`flex justify-between items-center p-3 ${item.bgColor || 'bg-green-50'} rounded-lg`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.incomeType === 'member_payment' ? (
                                <CreditCard className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingUp className="h-3 w-3 text-blue-600" />
                              )}
                              <p className="text-xs font-medium text-gray-800">
                                {item.displaySource || item.source || item.description || 'Income'}
                              </p>
                              {item.incomeType === 'member_payment' && item.memberName && (
                                <span className="text-xs text-gray-500">
                                  by {item.memberName}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatTransactionDate(item)}
                            </p>
                            {item.description && item.description !== (item.displaySource || item.source) && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <p className="text-xs font-bold text-green-600 ml-2">
                            +{formatCurrency(item.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {filteredIncome.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        No income records match the filter
                      </div>
                    )}
                  </div>
                )}
                
                {/* Expenditure Section */}
                {expenditureList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                        <TrendingDown className="h-3 w-3" />
                        Expenditure Records ({expenditureList.length})
                      </h3>
                      <div className="relative">
                        <button
                          onClick={() => setShowExpenditureFilters(!showExpenditureFilters)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Filter className="h-3 w-3" />
                          Filter
                        </button>
                        
                        {showExpenditureFilters && (
                          <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[150px]">
                            <div className="p-2">
                              <div className="flex items-center justify-between mb-2 px-2">
                                <span className="text-xs font-medium text-gray-700">Filter by Purpose</span>
                                {expenditureFilter !== 'all' && (
                                  <button
                                    onClick={clearExpenditureFilter}
                                    className="text-xs text-red-500 hover:text-red-700"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {getUniqueExpenditurePurposes().map(purpose => (
                                  <button
                                    key={purpose}
                                    onClick={() => {
                                      setExpenditureFilter(purpose);
                                      setShowExpenditureFilters(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                      expenditureFilter === purpose
                                        ? 'bg-red-50 text-red-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    {purpose === 'all' ? 'All Purposes' : purpose}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {expenditureFilter !== 'all' && (
                      <div className="mb-3 p-2 bg-red-50 rounded-lg flex justify-between items-center">
                        <span className="text-xs text-red-700">Filtered Total:</span>
                        <span className="text-sm font-bold text-red-700">{formatCurrency(filteredExpenditureTotal)}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredExpenditure.slice(0, 10).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-800">
                              {item.description || item.purpose || 'Expenditure'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {formatTransactionDate(item)}
                            </p>
                          </div>
                          <p className="text-xs font-bold text-red-600 ml-2">-{formatCurrency(item.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Outstanding Payments Section */}
        {outstandingFromTypes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Your Outstanding Payments
                </h2>
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {outstandingFromTypes.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total Due: {formatCurrency(totalOutstandingUser)}
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {outstandingFromTypes.map(payment => (
                <div key={payment._id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm capitalize">
                      {payment.name || payment.type || 'Payment'}
                    </p>
                    {payment.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {payment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {payment.is_mandatory && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                      {payment.frequency && payment.frequency !== 'one-time' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {payment.frequency}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600 text-sm">
                      {formatCurrency(payment.amount)}
                    </p>
                    <Link 
                      to="/payments" 
                      state={{ selectedPaymentType: payment }} 
                      className="text-xs text-blue-600 font-medium"
                    >
                      Pay Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Payment History */}
        {paidPayments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Your Recent Payments
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {paidPayments.slice(0, 5).map(payment => (
                <div key={payment._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm capitalize">
                      {payment.paymentType?.name || payment.name || payment.type || 'Payment'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <p className="font-bold text-green-600 text-sm">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {outstandingFromTypes.length === 0 && paidPayments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No Payment Records</h3>
            <p className="text-xs text-gray-500">You don't have any payment records yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
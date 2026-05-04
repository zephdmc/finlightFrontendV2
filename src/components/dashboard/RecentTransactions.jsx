import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ArrowUpRight, ArrowDownRight, Clock, RefreshCw, Eye, ChevronRight, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Recent Transactions Component - Banking App Style
 * Displays recent income, expenditure, and payment records
 */
const RecentTransactions = ({ limit = 5, isMobile = false, showViewAll = true }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecentTransactions();
  }, [limit]);

  const fetchRecentTransactions = async () => {
    setLoading(true);
    try {
      let allTransactions = [];

      // Fetch incomes
      try {
        const incomesResponse = await api.get('/transactions/income/public?limit=20');
        let incomes = [];
        if (incomesResponse?.data?.data?.records) {
          incomes = incomesResponse.data.data.records;
        } else if (incomesResponse?.data?.records) {
          incomes = incomesResponse.data.records;
        } else if (Array.isArray(incomesResponse?.data)) {
          incomes = incomesResponse.data;
        }
        
        incomes.forEach(inc => {
          allTransactions.push({
            id: inc._id,
            type: 'income',
            amount: inc.amount,
            date: inc.date || inc.createdAt,
            description: inc.description,
            source: inc.source,
            reference: inc.reference,
            createdAt: inc.createdAt
          });
        });
      } catch (err) {
        console.error('Error fetching incomes:', err);
      }

      // Fetch expenditures
      try {
        const expendituresResponse = await api.get('/transactions/expenditure/public?limit=20');
        let expenditures = [];
        if (expendituresResponse?.data?.data?.records) {
          expenditures = expendituresResponse.data.data.records;
        } else if (expendituresResponse?.data?.records) {
          expenditures = expendituresResponse.data.records;
        } else if (Array.isArray(expendituresResponse?.data)) {
          expenditures = expendituresResponse.data;
        }
        
        expenditures.forEach(exp => {
          allTransactions.push({
            id: exp._id,
            type: 'expense',
            amount: exp.amount,
            date: exp.date || exp.createdAt,
            description: exp.description,
            purpose: exp.purpose,
            reference: exp.reference,
            createdAt: exp.createdAt
          });
        });
      } catch (err) {
        console.error('Error fetching expenditures:', err);
      }

      // Fetch payments
      try {
        const paymentsResponse = await api.get('/payments/all');
        let payments = [];
        if (paymentsResponse?.data?.data?.records) {
          payments = paymentsResponse.data.data.records;
        } else if (paymentsResponse?.data?.records) {
          payments = paymentsResponse.data.records;
        } else if (Array.isArray(paymentsResponse?.data)) {
          payments = paymentsResponse.data;
        }
        
        // Filter only paid payments
        const paidPayments = payments.filter(p => p && p.status === 'paid');
        
        paidPayments.forEach(payment => {
          allTransactions.push({
            id: payment._id,
            type: 'payment',
            amount: payment.amount,
            date: payment.paidAt || payment.createdAt,
            description: payment.description || `${payment.type} payment`,
            member: payment.user?.name || 'Member',
            reference: payment.transactionReference,
            createdAt: payment.createdAt,
            paymentType: payment.type
          });
        });
      } catch (err) {
        console.error('Error fetching payments:', err);
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Take only the requested limit
      setTransactions(allTransactions.slice(0, limit));
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load recent transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecentTransactions();
    toast.success('Transactions refreshed');
  };

  const handleViewAll = () => {
    navigate('/account');
  };

  const getTransactionIcon = (type) => {
    if (type === 'income') {
      return (
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <ArrowUpRight className="h-4 w-4 text-green-600" />
        </div>
      );
    } else if (type === 'expense') {
      return (
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <ArrowDownRight className="h-4 w-4 text-red-600" />
        </div>
      );
    } else {
      return (
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-blue-600" />
        </div>
      );
    }
  };

  const getTransactionColor = (type) => {
    if (type === 'income' || type === 'payment') return 'text-green-600';
    return 'text-red-600';
  };

  const getTransactionLabel = (type) => {
    if (type === 'income') return 'Income';
    if (type === 'expense') return 'Expense';
    return 'Payment';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const getTransactionTitle = (transaction) => {
    if (transaction.type === 'income') return transaction.source || transaction.description || 'Income';
    if (transaction.type === 'expense') return transaction.purpose || transaction.description || 'Expense';
    return `Payment: ${transaction.member || 'Member'} - ${transaction.paymentType?.toUpperCase() || 'Dues'}`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No recent transactions</p>
        <button
          onClick={handleRefresh}
          className="mt-3 text-xs text-blue-600 flex items-center justify-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with refresh */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Recent Transactions</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id || index}
            className="bg-white rounded-xl p-3 hover:bg-gray-50 transition-all duration-150 cursor-pointer border border-gray-100"
            onClick={() => navigate('/account')}
          >
            <div className="flex items-center gap-3">
              {getTransactionIcon(transaction.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {getTransactionTitle(transaction)}
                  </p>
                  <p className={`font-semibold text-sm ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'income' || transaction.type === 'payment' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">
                      {transaction.reference?.slice(0, 10) || 
                       transaction.transactionReference?.slice(0, 10) || 
                       getTransactionLabel(transaction.type)}
                    </p>
                    <span className="text-xs text-gray-300">•</span>
                    <p className="text-xs text-gray-400">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-700' : 
                    transaction.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {getTransactionLabel(transaction.type)}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {showViewAll && transactions.length >= limit && (
        <button
          onClick={handleViewAll}
          className="w-full mt-2 py-2 text-center text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center justify-center gap-1"
        >
          View All Transactions
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Mini summary for mobile */}
      {isMobile && transactions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Total Transactions</span>
            <span className="font-medium text-gray-700">{transactions.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Alternative Compact Version for Dashboard Sidebar
export const CompactRecentTransactions = ({ limit = 3 }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      let allTransactions = [];

      // Fetch incomes
      try {
        const incomesResponse = await api.get('/transactions/income/public?limit=10');
        let incomes = [];
        if (incomesResponse?.data?.data?.records) {
          incomes = incomesResponse.data.data.records;
        } else if (incomesResponse?.data?.records) {
          incomes = incomesResponse.data.records;
        } else if (Array.isArray(incomesResponse?.data)) {
          incomes = incomesResponse.data;
        }
        
        incomes.forEach(inc => {
          allTransactions.push({
            id: inc._id,
            type: 'income',
            amount: inc.amount,
            date: inc.date || inc.createdAt,
            description: inc.source || inc.description
          });
        });
      } catch (err) {
        console.error('Error fetching incomes:', err);
      }

      // Fetch expenditures
      try {
        const expendituresResponse = await api.get('/transactions/expenditure/public?limit=10');
        let expenditures = [];
        if (expendituresResponse?.data?.data?.records) {
          expenditures = expendituresResponse.data.data.records;
        } else if (expendituresResponse?.data?.records) {
          expenditures = expendituresResponse.data.records;
        } else if (Array.isArray(expendituresResponse?.data)) {
          expenditures = expendituresResponse.data;
        }
        
        expenditures.forEach(exp => {
          allTransactions.push({
            id: exp._id,
            type: 'expense',
            amount: exp.amount,
            date: exp.date || exp.createdAt,
            description: exp.purpose || exp.description
          });
        });
      } catch (err) {
        console.error('Error fetching expenditures:', err);
      }

      // Fetch payments
      try {
        const paymentsResponse = await api.get('/payments/all');
        let payments = [];
        if (paymentsResponse?.data?.data?.records) {
          payments = paymentsResponse.data.data.records;
        } else if (paymentsResponse?.data?.records) {
          payments = paymentsResponse.data.records;
        } else if (Array.isArray(paymentsResponse?.data)) {
          payments = paymentsResponse.data;
        }
        
        const paidPayments = payments.filter(p => p && p.status === 'paid');
        paidPayments.forEach(payment => {
          allTransactions.push({
            id: payment._id,
            type: 'payment',
            amount: payment.amount,
            date: payment.paidAt || payment.createdAt,
            description: `${payment.type?.toUpperCase() || 'Member'} Payment`
          });
        });
      } catch (err) {
        console.error('Error fetching payments:', err);
      }

      // Sort and limit
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTransactions.slice(0, limit));
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
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

  const getIcon = (type) => {
    if (type === 'income') return <ArrowUpRight className="h-3 w-3 text-green-500" />;
    if (type === 'expense') return <ArrowDownRight className="h-3 w-3 text-red-500" />;
    return <CreditCard className="h-3 w-3 text-blue-500" />;
  };

  const getColor = (type) => {
    if (type === 'income' || type === 'payment') return 'text-green-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-xs text-gray-500 text-center py-4">No transactions</p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id || index}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          onClick={() => navigate('/account')}
        >
          <div className="flex items-center gap-2">
            {getIcon(transaction.type)}
            <span className="text-xs text-gray-600 truncate max-w-[120px]">
              {transaction.description}
            </span>
          </div>
          <span className={`text-xs font-medium ${getColor(transaction.type)}`}>
            {transaction.type === 'income' || transaction.type === 'payment' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      ))}
      {transactions.length >= limit && (
        <button
          onClick={() => navigate('/account')}
          className="w-full text-xs text-blue-600 text-center pt-2"
        >
          View all →
        </button>
      )}
    </div>
  );
};

export default RecentTransactions;
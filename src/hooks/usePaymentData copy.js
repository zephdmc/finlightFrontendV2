import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import TransactionService from '../services/TransactionService'; // ADD THIS LINE
// ==================== QUERY KEYS ====================
export const queryKeys = {
  paymentTypes: ['payment-types'],
  payments: ['payments'],
  transactions: (type) => ['transactions', type],
  users: ['users'],
  paymentSummary: (userId) => ['payment-summary', userId],
  organization: ['organization-settings'],
};

// ==================== PAYMENT TYPES ====================
export const usePaymentTypes = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: async () => {
      const response = await api.get('/payment-types');
      return response.data?.data?.records || response.data?.data || [];
    },
    staleTime: 30 * 60 * 1000, // Payment types rarely change - 30 minutes
    gcTime: 60 * 60 * 1000,     // Keep in cache for 1 hour
    ...options,
  });
};

// ==================== PAYMENTS ====================
export const usePayments = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.payments, filters],
    queryFn: async () => {
      const response = await api.get('/payments', { params: filters });
      return response.data?.data?.records || response.data?.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,     // 5 minutes
    ...options,
  });
};

// ==================== TRANSACTIONS ====================
export const useTransactions = (type = 'income', limit = 100, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.transactions(type), limit],
    queryFn: async () => {
      const response = await api.get(`/transactions/${type}/public?limit=${limit}`);
      return response.data?.data?.records || response.data?.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};
// Add this hook to your usePaymentData.js file

// Fetch member limit
export const useMemberLimit = () => {
    return useQuery({
      queryKey: ['member-limit'],
      queryFn: async () => {
        const response = await api.get('/auth/check-member-limit');
        return response.data?.data || response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes - limit doesn't change often
      gcTime: 10 * 60 * 1000,
    });
  };


// ==================== USERS ====================
export const useUsers = (role = 'member', options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.users, role],
    queryFn: async () => {
      const response = await api.get(`/users?role=${role}&limit=100`);
      return response.data?.data?.records || response.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// ==================== PAYMENT SUMMARY ====================
export const usePaymentSummary = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.paymentSummary(userId),
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/payment-summary`);
      return response.data?.data || {};
    },
    staleTime: 1 * 60 * 1000, // 1 minute - updates frequently
    enabled: !!userId, // Only run if userId exists
    ...options,
  });
};

// ==================== ORGANIZATION SETTINGS ====================
export const useOrganizationSettings = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.organization,
    queryFn: async () => {
      const response = await api.get('/organizations/settings');
      return response.data?.data || {};
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

// Add these to your existing usePaymentData.js file
// ==================== PAYMENT TYPE MUTATIONS ====================
// Add these to your existing usePaymentData.js file

// Create payment type
export const useCreatePaymentType = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (paymentTypeData) => {
        const response = await api.post('/payment-types', paymentTypeData);
        return response.data.data || response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes });
        toast.success('Payment type created successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create payment type');
        throw error;
      },
    });
  };
  
  // Update payment type
  export const useUpdatePaymentType = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await api.put(`/payment-types/${id}`, data);
        return response.data.data || response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes });
        toast.success('Payment type updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update payment type');
        throw error;
      },
    });
  };
  
  // Delete payment type
  export const useDeletePaymentType = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (id) => {
        await api.delete(`/payment-types/${id}`);
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes });
        toast.success('Payment type deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete payment type');
        throw error;
      },
    });
  };
// Fetch payments (as income)
export const usePaymentsAsIncome = (limit = 100) => {
    return useQuery({
      queryKey: ['payments', 'all', limit],
      queryFn: async () => {
        const response = await api.get('/payments/all', { params: { limit } });
        let payments = [];
        if (response?.data?.data?.records) {
          payments = response.data.data.records;
        } else if (response?.data?.records) {
          payments = response.data.records;
        } else if (Array.isArray(response?.data?.data)) {
          payments = response.data.data;
        } else if (Array.isArray(response?.data)) {
          payments = response.data;
        }
        return payments;
      },
      staleTime: 2 * 60 * 1000,
    });
  };
  
// Add these additional hooks to your usePaymentData.js file

// Fetch public incomes
export const usePublicIncomes = (limit = 100) => {
    return useQuery({
      queryKey: ['public', 'incomes', limit],
      queryFn: async () => {
        const response = await api.get('/transactions/income/public', { params: { limit } });
        let incomesData = [];
        if (response?.data?.data?.records) {
          incomesData = response.data.data.records;
        } else if (response?.data?.records) {
          incomesData = response.data.records;
        } else if (Array.isArray(response?.data)) {
          incomesData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          incomesData = response.data.data;
        }
        return incomesData;
      },
      staleTime: 2 * 60 * 1000,
    });
  };
  
  // Fetch public expenditures
  export const usePublicExpenditures = (limit = 100) => {
    return useQuery({
      queryKey: ['public', 'expenditures', limit],
      queryFn: async () => {
        const response = await api.get('/transactions/expenditure/public', { params: { limit } });
        let expendituresData = [];
        if (response?.data?.data?.records) {
          expendituresData = response.data.data.records;
        } else if (response?.data?.records) {
          expendituresData = response.data.records;
        } else if (Array.isArray(response?.data)) {
          expendituresData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          expendituresData = response.data.data;
        }
        return expendituresData;
      },
      staleTime: 2 * 60 * 1000,
    });
};
  
// Add this to your usePaymentData.js file

// Fetch ALL payments (for admin only) - uses /payments/all endpoint
export const useAdminPayments = (filters = {}, options = {}) => {
    return useQuery({
      queryKey: ['admin-payments', filters],
      queryFn: async () => {
        const response = await api.get('/payments/all', { params: filters });
        let paymentsData = [];
        
        // Handle different response structures
        if (response?.data?.data?.records && Array.isArray(response.data.data.records)) {
          paymentsData = response.data.data.records;
        } else if (response?.data?.records && Array.isArray(response.data.records)) {
          paymentsData = response.data.records;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          paymentsData = response.data.data;
        } else if (Array.isArray(response?.data)) {
          paymentsData = response.data;
        }
        
        console.log('Admin payments fetched:', paymentsData.length);
        
        // Normalize payment data
        const normalizedPayments = paymentsData.map(payment => ({
          ...payment,
          status: payment.status || (payment.amount > 0 && !payment.isPartial ? 'paid' : 'pending'),
          amount: Number(payment.amount) || 0
        }));
        
        return normalizedPayments;
      },
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      ...options,
    });
  };
  // Fetch public payments (for admin dashboard and reports)
export const usePublicPayments = () => {
    return useQuery({
      queryKey: ['public', 'payments'],
      queryFn: async () => {
        const response = await api.get('/payments/public/income');
        console.log('Raw payments API response:', response.data);
        
        let paymentsData = [];
        
        // Fix: Extract from the correct structure
        // The response has: { success: true, data: { records: [...] } }
        if (response?.data?.data?.records && Array.isArray(response.data.data.records)) {
          paymentsData = response.data.data.records;
        } 
        // Alternative structure: { success: true, data: [...] }
        else if (response?.data?.data && Array.isArray(response.data.data)) {
          paymentsData = response.data.data;
        }
        // Alternative structure: { success: true, records: [...] }
        else if (response?.data?.records && Array.isArray(response.data.records)) {
          paymentsData = response.data.records;
        }
        // Direct array
        else if (Array.isArray(response?.data)) {
          paymentsData = response.data;
        }
        
        console.log('Extracted payments data:', paymentsData.length, 'payments');
        
        // Log first payment to see structure
        if (paymentsData.length > 0) {
          console.log('First payment structure:', paymentsData[0]);
          console.log('Payment status:', paymentsData[0]?.status);
          console.log('Payment amount:', paymentsData[0]?.amount);
        }
        
        return paymentsData;
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  // Create income mutation
  export const useCreateIncome = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (incomeData) => {
        const response = await TransactionService.recordIncome(incomeData);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
        toast.success('Income recorded successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to record income');
      },
    });
  };
  
  // Create expense mutation
  export const useCreateExpense = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (expenseData) => {
        const response = await TransactionService.recordExpenditure(expenseData);
        return response;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions', 'expenditure'] });
        toast.success('Expense recorded successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to record expense');
      },
    });
  };
// ==================== MUTATIONS ====================

// Create payment (Member)
export const useCreateMemberPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post('/payments/member-payment', paymentData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions('income') });
      
      // If we have user ID, invalidate payment summary
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.paymentSummary(variables.userId) });
      }
      
      toast.success('Payment created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create payment');
    },
  });
};

// Create fine (Admin)
export const useCreateFine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fineData) => {
      const response = await api.post('/payments/fine', fineData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.paymentSummary(variables.userId) });
      }
      
      toast.success('Fine created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create fine');
    },
  });
};

// Initialize Paystack Payment
export const useInitializePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paymentId }) => {
      const response = await api.post('/payment-gateway/initialize', { paymentId });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data?.authorizationUrl) {
        // Store payment ID for verification
        localStorage.setItem('pendingPaymentId', data.data.paymentId);
        // Redirect to Paystack
        window.location.href = data.data.authorizationUrl;
      } else {
        toast.error(data.message || 'Payment initialization failed');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment initialization failed');
    },
  });
};

// Verify Payment (called on callback page)
export const useVerifyPayment = (reference) => {
  return useQuery({
    queryKey: ['payment-verification', reference],
    queryFn: async () => {
      const response = await api.get(`/payment-gateway/verify/${reference}`);
      return response.data;
    },
    enabled: !!reference, // Only run if reference exists
    retry: 2,
    retryDelay: 1000,
    staleTime: 0, // Never stale - verify only once
    gcTime: 0,    // Don't cache verification results
  });
};

// Record partial payment (Admin)
export const useRecordPartialPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paymentId, amountPaid, reference }) => {
      const response = await api.post('/payment-gateway/record-partial-payment', {
        paymentId,
        amountPaid,
        reference,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions('income') });
      toast.success('Partial payment recorded');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record partial payment');
    },
  });
};
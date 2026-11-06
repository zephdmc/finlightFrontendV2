// hooks/usePaymentData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import TransactionService from '../services/TransactionService';

// ==================== QUERY KEYS ====================
export const queryKeys = {
  paymentTypes: ['payment-types'],
  payments: ['payments'],
  pendingPayments: ['pending-payments'],
  currentPeriodPayments: ['current-period-payments'],
  paymentPeriods: ['payment-periods'],
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
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

// ============================================================
// PENDING PAYMENTS HOOK
// ============================================================
export const usePendingPayments = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.pendingPayments,
    queryFn: async () => {
      const response = await api.get('/payments/pending');
      return response.data || { data: { records: [] } };
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    ...options,
  });
};

// ============================================================
// CURRENT PERIOD PAYMENTS HOOK
// ============================================================
export const useCurrentPeriodPayments = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.currentPeriodPayments,
    queryFn: async () => {
      const response = await api.get('/payments/current-period');
      return response.data?.data || { payments: [], summary: {} };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

// ============================================================
// PAYMENT PERIODS HOOK
// ============================================================
export const usePaymentPeriods = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.paymentPeriods,
    queryFn: async () => {
      const response = await api.get('/payments/periods');
      return response.data?.data || [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
    staleTime: 2 * 60 * 1000,
    ...options,
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 1 * 60 * 1000,
    enabled: !!userId,
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
    staleTime: 15 * 60 * 1000,
    ...options,
  });
};

// ============================================================
// PAYMENT TYPE MUTATIONS - UPDATED
// ============================================================

// Create payment type - UPDATED with all fields
export const useCreatePaymentType = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentTypeData) => {
      const payload = {
        name: paymentTypeData.name,
        type: paymentTypeData.type,
        description: paymentTypeData.description || '',
        amount: paymentTypeData.amount,
        is_mandatory: paymentTypeData.is_mandatory || false,
        frequency: paymentTypeData.frequency || 'one-time',
        due_date_after: parseInt(paymentTypeData.due_date_after) || 30,
      };

      // Only include duration when frequency is recurring
      if (paymentTypeData.frequency && paymentTypeData.frequency !== 'one-time') {
        payload.duration_value = parseInt(paymentTypeData.duration_value) || 1;
        payload.duration_unit = paymentTypeData.duration_unit || 'months';
      }

      // Late penalty
      payload.late_penalty_enabled = paymentTypeData.late_penalty_enabled || false;
      if (paymentTypeData.late_penalty_enabled) {
        payload.late_penalty_type = paymentTypeData.late_penalty_type || 'fixed';
        payload.late_penalty_value = parseFloat(paymentTypeData.late_penalty_value);
        payload.late_penalty_days_after = parseInt(paymentTypeData.late_penalty_days_after) || 7;
      }

      // ⭐ STRIP ALL NULLS / UNDEFINED
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log('📤 createPaymentType payload (cleaned):', JSON.stringify(payload, null, 2));

      const response = await api.post('/payment-types', payload);
      return response.data.data || response.data;
    },
    onSuccess: async (data) => {
      // ⭐ Invalidate AND force immediate refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes,
        refetchType: 'all',
      });
      await queryClient.refetchQueries({
        queryKey: queryKeys.paymentTypes,
        type: 'active',
      });
      toast.success('Payment type created successfully');
    },
    onError: (error) => {
      console.error('❌ Create payment type error:', error);
      console.error('❌ Error response:', error.response?.data);
      // ⭐ NEW: Show exactly which fields failed
      if (error.response?.data?.errors) {
        console.error('❌ Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
      toast.error(error.response?.data?.message || 'Failed to create payment type');
      throw error;
    },
  });
};

// Update payment type - UPDATED with all fields
export const useUpdatePaymentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = {
        name: data.name,
        type: data.type,
        description: data.description || '',
        amount: data.amount,
        is_mandatory: data.is_mandatory || false,
        frequency: data.frequency || 'one-time',
        // ⭐ ALWAYS send duration (schema enum requires it)
        duration_value: parseInt(data.duration_value) || 1,
        duration_unit: data.duration_unit || 'months',
        due_date_after: parseInt(data.due_date_after) || 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
        late_penalty_enabled: data.late_penalty_enabled || false,
      };

      // Only add late penalty fields when enabled
      if (data.late_penalty_enabled) {
        payload.late_penalty_type = data.late_penalty_type || 'fixed';
        payload.late_penalty_value = parseFloat(data.late_penalty_value);
        payload.late_penalty_days_after = parseInt(data.late_penalty_days_after) || 7;
      }

      // Strip nulls/undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log('📤 updatePaymentType payload:', JSON.stringify(payload, null, 2));

      const response = await api.put(`/payment-types/${id}`, payload);
      return response.data.data || response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes,
        refetchType: 'all',
      });
      await queryClient.refetchQueries({
        queryKey: queryKeys.paymentTypes,
        type: 'active',
      });
      toast.success('Payment type updated successfully');
    },
    onError: (error) => {
      console.error('❌ Update payment type error:', error.response?.data);
      if (error.response?.data?.errors) {
        console.error('❌ Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
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

    // ⭐ Optimistically remove from cache BEFORE the server responds
    onMutate: async (id) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.paymentTypes });

      // Snapshot the previous value for rollback
      const previous = queryClient.getQueryData(queryKeys.paymentTypes);

      // Optimistically remove the item
      queryClient.setQueryData(queryKeys.paymentTypes, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter(t => (t._id || t.id) !== id);
      });

      // Return context for rollback on error
      return { previous };
    },

    // If the mutation fails, roll back
    onError: (error, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.paymentTypes, context.previous);
      }
      toast.error(error.response?.data?.message || 'Failed to delete payment type');
    },

    // After success, force a fresh fetch to be safe
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes,
        refetchType: 'all',
      });
      toast.success('Payment type deleted successfully');
    },
  });
};

// ============================================================
// OTHER HOOKS (Existing, unchanged)
// ============================================================

export const useMemberLimit = () => {
  return useQuery({
    queryKey: ['member-limit'],
    queryFn: async () => {
      const response = await api.get('/auth/check-member-limit');
      return response.data?.data || response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

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

export const useAdminPayments = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['admin-payments', filters],
    queryFn: async () => {
      const response = await api.get('/payments/all', { params: filters });
      let paymentsData = [];

      if (response?.data?.data?.records && Array.isArray(response.data.data.records)) {
        paymentsData = response.data.data.records;
      } else if (response?.data?.records && Array.isArray(response.data.records)) {
        paymentsData = response.data.records;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        paymentsData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        paymentsData = response.data;
      }

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

export const usePublicPayments = () => {
  return useQuery({
    queryKey: ['public', 'payments'],
    queryFn: async () => {
      const response = await api.get('/payments/public/income');
      let paymentsData = [];

      if (response?.data?.data?.records && Array.isArray(response.data.data.records)) {
        paymentsData = response.data.data.records;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        paymentsData = response.data.data;
      } else if (response?.data?.records && Array.isArray(response.data.records)) {
        paymentsData = response.data.records;
      } else if (Array.isArray(response?.data)) {
        paymentsData = response.data;
      }

      return paymentsData;
    },
    staleTime: 2 * 60 * 1000,
  });
};



// ============================================================
// Ã¢Â­Â PUBLIC PAYMENTS WITH PENALTIES
// Fetches all members' payments WITH full penalty data
// (used for financial transparency page)
// ============================================================
export const usePublicPaymentsWithPenalties = () => {
  return useQuery({
    queryKey: ['public', 'payments', 'with-penalties'],
    queryFn: async () => {
      // /payments/all returns the FULL payment documents including penalties
      const response = await api.get('/payments/all', { params: { limit: 500 } });

      let paymentsData = [];

      if (response?.data?.data?.records && Array.isArray(response.data.data.records)) {
        paymentsData = response.data.data.records;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        paymentsData = response.data.data;
      } else if (response?.data?.records && Array.isArray(response.data.records)) {
        paymentsData = response.data.records;
      } else if (Array.isArray(response?.data)) {
        paymentsData = response.data;
      }

      // Ã¢Â­Â Log to confirm penalty data is present

      return paymentsData;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================================
// Fetch current user's FULL payments (includes penalty data)
// Used to enrich public payments with penalty info
// ============================================================
export const useMyPaymentsWithPenalties = () => {
  return useQuery({
    queryKey: ['my-payments', 'full'],
    queryFn: async () => {
      const response = await api.get('/payments');
      let paymentsData = [];
      if (response?.data?.data?.records) paymentsData = response.data.data.records;
      else if (Array.isArray(response?.data?.data)) paymentsData = response.data.data;
      else if (Array.isArray(response?.data)) paymentsData = response.data;


      return paymentsData;
    },
    staleTime: 2 * 60 * 1000,
  });
};
// In usePaymentData.js - Add this new hook

export const usePaymentsWithPenalties = () => {
  return useQuery({
    queryKey: ['payments', 'with-penalties'],
    queryFn: async () => {
      // Ã¢Â­Â Use the main payments endpoint which should include all fields
      const response = await api.get('/payments/all', { params: { limit: 100 } });

      let paymentsData = [];

      if (response?.data?.data?.records && Array.isArray(response.data.data.records)) {
        paymentsData = response.data.data.records;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        paymentsData = response.data.data;
      } else if (response?.data?.records && Array.isArray(response.data.records)) {
        paymentsData = response.data.records;
      } else if (Array.isArray(response?.data)) {
        paymentsData = response.data;
      }

      // Ã¢Â­Â Log to verify penaltyBreakdown is included

      return paymentsData;
    },
    staleTime: 2 * 60 * 1000,
  });
};

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

// ============================================================
// PAYMENT MUTATIONS
// ============================================================

export const useCreateMemberPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post('/payments/member-payment', paymentData);
      return response.data;
    },
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.payments }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pendingPayments }),
        queryClient.invalidateQueries({ queryKey: queryKeys.currentPeriodPayments }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions('income') }),
        // ⭐ Refresh public payments (Financial Transparency page)
        queryClient.invalidateQueries({ queryKey: ['public', 'payments'] }),
        // ⭐ Refresh payment types so the Locked badge appears
        queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypes }),
      ]);

      await queryClient.refetchQueries({
        queryKey: queryKeys.paymentTypes,
        type: 'active',
      });

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

export const useCreateFine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fineData) => {
      const response = await api.post('/payments/fine', fineData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingPayments });
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

export const useInitializePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId }) => {
      const response = await api.post('/payment-gateway/initialize', { paymentId });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data?.authorizationUrl) {
        localStorage.setItem('pendingPaymentId', data.data.paymentId);
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

export const useVerifyPayment = (reference) => {
  return useQuery({
    queryKey: ['payment-verification', reference],
    queryFn: async () => {
      const response = await api.get(`/payment-gateway/verify/${reference}`);
      return response.data;
    },
    enabled: !!reference,
    retry: 2,
    retryDelay: 1000,
    staleTime: 0,
    gcTime: 0,
  });
};

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
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingPayments });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions('income') });
      toast.success('Partial payment recorded');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record partial payment');
    },
  });
};

// ============================================================
// Toggle payment type active/inactive
// ============================================================
export const useTogglePaymentTypeActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await api.patch(`/payment-types/${id}/status`, { isActive });
      return response.data.data || response.data;
    },

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.paymentTypes });
      const previous = queryClient.getQueryData(queryKeys.paymentTypes);

      queryClient.setQueryData(queryKeys.paymentTypes, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(t =>
          (t._id || t.id) === id ? { ...t, isActive } : t
        );
      });

      return { previous };
    },

    onError: (error, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.paymentTypes, context.previous);
      }
      console.error('❌ Toggle payment type error:', error.response?.data);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes,
        refetchType: 'all',
      });
    },
  });
};
import { QueryClient } from '@tanstack/react-query';

// Configure query client with optimal settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache settings
      staleTime: 2 * 60 * 1000,     // Data fresh for 2 minutes
      gcTime: 5 * 60 * 1000,         // Keep in cache for 5 minutes

      // Refetch settings
      refetchOnWindowFocus: false,    // Don't auto-refetch (prevents 429)
      refetchOnReconnect: true,       // Refetch when network reconnects
      refetchInterval: false,          // No polling
      refetchOnMount: true,           // Refetch when component mounts

      // Retry settings
      retry: 1,                       // Only retry once
      retryDelay: 1000,               // Wait 1 second before retry

      // Performance
      placeholderData: (previous) => previous, // Keep old data while fetching

      // Security - don't keep sensitive data
      cacheTime: 5 * 60 * 1000,       // Clear after 5 minutes
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

// Clear all cache on logout
export const clearAllCache = () => {
  queryClient.clear();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
};

// Clear specific query cache
export const invalidateQueries = (queryKey) => {
  queryClient.invalidateQueries({ queryKey: [queryKey] });
};
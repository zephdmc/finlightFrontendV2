import { useState, useEffect, useCallback } from 'react';
import cacheService from '../services/cacheService';
import api from '../services/api';

/**
 * Custom hook for caching API data with automatic refresh
 * @param {string} url - API endpoint
 * @param {object} params - Query parameters
 * @param {object} options - Cache options
 */
export const useCachedQuery = (url, params = {}, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    refreshInterval = null,
    onSuccess = null,
    onError = null
  } = options;

  const fetchData = useCallback(async (skipCache = false) => {
    if (!enabled) return;

    setLoading(true);

    try {
      const cacheKey = cacheService.generateKey(url, params);

      // Check cache if not skipping
      if (!skipCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
          setData(cachedData.data);
          setLastUpdated(cachedData.timestamp);
          setLoading(false);
          if (onSuccess) onSuccess(cachedData.data);
          return;
        }
      }

      // Fetch from API
      const response = await api.get(url, { params });
      const responseData = response.data;

      // Cache the response
      cacheService.set(cacheKey, responseData, ttl);

      setData(responseData);
      setLastUpdated(Date.now());
      if (onSuccess) onSuccess(responseData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params), ttl, enabled, onSuccess, onError]);

  // Auto-refresh on interval
  useEffect(() => {
    if (!enabled) return;

    fetchData();

    let interval;
    if (refreshInterval) {
      interval = setInterval(() => {
        fetchData(true); // Skip cache on refresh
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchData, refreshInterval, enabled]);

  // Manual refresh
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Invalidate cache for this query
  const invalidate = useCallback(() => {
    const cacheKey = cacheService.generateKey(url, params);
    cacheService.remove(cacheKey);
  }, [url, params]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    invalidate
  };
};

/**
 * Hook for caching paginated data
 */
export const useCachedPaginatedQuery = (url, params = {}, options = {}) => {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const cacheKey = `${url}_paginated_${JSON.stringify(params)}`;

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const cached = cacheService.get(cacheKey);
        if (cached) {
          setAllData(cached.data);
          setTotal(cached.total);
          setLoading(false);
          return;
        }

        const response = await api.get(url, { params: { ...params, page, limit: 50 } });
        const newData = response.data.data?.records || [];
        const newTotal = response.data.data?.pagination?.total || 0;

        setAllData(newData);
        setTotal(newTotal);
        cacheService.set(cacheKey, { data: newData, total: newTotal }, 5 * 60 * 1000);
      } catch (error) {
        console.error('Error fetching paginated data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [url, JSON.stringify(params), page, cacheKey]);

  return {
    data: allData,
    total,
    loading,
    page,
    setPage
  };
};

export default useCachedQuery;
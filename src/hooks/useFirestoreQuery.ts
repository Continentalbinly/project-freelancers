/**
 * 🎣 useFirestoreQuery Hook
 * Optimized Firestore data fetching with caching and deduplication
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Query, getDocs } from 'firebase/firestore';
import { fetchWithCache, clearCache } from '@/service/dataFetch';

interface UseFirestoreQueryOptions {
  enabled?: boolean;
  ttl?: number;
  onError?: (error: Error) => void;
  dependencies?: any[];
}

export function useFirestoreQuery<T = any>(
  queryKey: string,
  query: Query | null,
  options: UseFirestoreQueryOptions = {}
) {
  const {
    enabled = true,
    ttl = 5 * 60 * 1000, // 5 minutes default
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  const refetch = useCallback(async (force = false) => {
    if (!enabled || !query) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const result = await fetchWithCache<T[]>(
        queryKey,
        async (signal) => {
          abortController.current = new AbortController();
          const snapshot = await getDocs(query);
          
          // Check if request was aborted
          if (signal.aborted) {
            throw new Error('Request cancelled');
          }

          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
        },
        { ttl, useCache: !force, forceRefresh: force }
      );

      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Don't set error for aborted requests
      if (error.message !== 'Request cancelled' && isMounted.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [queryKey, query, enabled, ttl, onError]);

  useEffect(() => {
    isMounted.current = true;
    refetch();

    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [refetch, ...dependencies]);

  return { data, loading, error, refetch };
}

/**
 * 🎣 useDashboardData Hook
 * Specialized hook for dashboard data with shorter TTL
 */
export function useDashboardData(queryKey: string, query: Query | null, options = {}) {
  return useFirestoreQuery(queryKey, query, {
    ttl: 3 * 60 * 1000, // 3 minutes for dashboard
    ...options,
  });
}

/**
 * 🎣 useProfileData Hook
 * Specialized hook for profile data with longer TTL
 */
export function useProfileData(queryKey: string, query: Query | null, options = {}) {
  return useFirestoreQuery(queryKey, query, {
    ttl: 10 * 60 * 1000, // 10 minutes for profile data
    ...options,
  });
}

/**
 * 🎣 useApiData Hook
 * Hook for fetching from Next.js API routes
 */
interface UseApiDataOptions {
  enabled?: boolean;
  method?: string;
  ttl?: number;
  onError?: (error: Error) => void;
  revalidateOnFocus?: boolean;
}

export function useApiData<T = any>(
  endpoint: string,
  options: UseApiDataOptions & { body?: any; token?: string } = {}
) {
  const {
    enabled = true,
    method = 'POST',
    ttl = 5 * 60 * 1000,
    onError,
    revalidateOnFocus = true,
    body,
    token,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  const cacheKey = `${endpoint}:${JSON.stringify(body || {})}`;

  const refetch = useCallback(async (force = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      abortController.current = new AbortController();

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      if (isMounted.current) {
        setData(result.data);
      }

      // Cache the result
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(result.data));
      } catch (e) {
        // sessionStorage quota exceeded
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (error.message !== 'Request cancelled' && isMounted.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [endpoint, method, enabled, token, body, onError, cacheKey]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;

    // Try to use cached data first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached));
      }
    } catch (e) {
      // Ignore cache errors
    }

    refetch();

    // Revalidate on focus
    if (revalidateOnFocus) {
      const handleFocus = () => refetch(true);
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
        isMounted.current = false;
        if (abortController.current) {
          abortController.current.abort();
        }
      };
    }

    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [cacheKey, refetch, revalidateOnFocus]);

  return { data, loading, error, refetch };
}

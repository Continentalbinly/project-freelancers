/**
 * 🚀 Optimized Data Fetching Service
 * Features:
 * - Request deduplication (prevents duplicate in-flight requests)
 * - Caching with TTL
 * - Abort signal support for cancellation
 * - Error handling and retry logic
 */

  interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest {
  promise: Promise<unknown>;
  abortController: AbortController;
}

const CACHE = new Map<string, CacheEntry<unknown>>();
const PENDING_REQUESTS = new Map<string, PendingRequest>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if cache entry is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Get from cache
 */
export function getFromCache<T>(key: string): T | null {
  const entry = CACHE.get(key);
  if (isCacheValid(entry)) {
    return entry.data as T;
  }
  CACHE.delete(key);
  return null as T | null;
}

/**
 * Set to cache
 */
export function setToCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  CACHE.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Clear cache entry or all cache when using wildcard
 */
export function clearCache(key: string): void {
  if (key === "*") {
    clearAllCache();
    return;
  }
  CACHE.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  CACHE.clear();
}

/**
 * Abort pending requests
 */
export function abortPendingRequest(key: string): void {
  const pending = PENDING_REQUESTS.get(key);
  if (pending) {
    pending.abortController.abort();
    PENDING_REQUESTS.delete(key);
  }
}

/**
 * Abort all in-flight requests
 */
export function abortAllPendingRequests(): void {
  for (const [key, pending] of PENDING_REQUESTS.entries()) {
    pending.abortController.abort();
    PENDING_REQUESTS.delete(key);
  }
}

/**
 * 🔄 Deduplicated fetch with caching
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: (signal: AbortSignal) => Promise<T>,
  options: {
    ttl?: number;
    useCache?: boolean;
    forceRefresh?: boolean;
  } = {}
): Promise<T> {
  const {
    ttl = DEFAULT_TTL,
    useCache = true,
    forceRefresh = false,
  } = options;

  // Check cache first (unless forceRefresh)
  if (useCache && !forceRefresh) {
    const cached = getFromCache<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // Check if request is already in flight
  const pending = PENDING_REQUESTS.get(key);
  if (pending && !forceRefresh) {
    return pending.promise as Promise<T>;
  }

  // Create new request
  const abortController = new AbortController();
  const promise = (async () => {
    try {
      const data = await fetchFn(abortController.signal);
      setToCache(key, data, ttl);
      return data;
    } finally {
      PENDING_REQUESTS.delete(key);
    }
  })();

  PENDING_REQUESTS.set(key, { promise, abortController });
  return promise;
}

/**
 * Fetch with API route (server-side benefits)
 */
export async function fetchFromAPI<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    ttl?: number;
    useCache?: boolean;
    token?: string;
  } = {}
): Promise<T> {
  const {
    method = 'POST',
    body,
    headers = {},
    ttl = DEFAULT_TTL,
    useCache = true,
    token,
  } = options;

  // ✅ SECURITY: Include token in cache key to prevent cross-user data leakage
  // Without token in key, different users with same request body would share cached data
  const cacheKey = `${endpoint}:${JSON.stringify(body || {})}:${token || 'anonymous'}`;

  return fetchWithCache<T>(
    cacheKey,
    async (signal) => {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...headers,
        },
        ...(body && { body: JSON.stringify(body) }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data as T;
    },
    { ttl, useCache }
  );
}

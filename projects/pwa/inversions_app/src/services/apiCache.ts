/**
 * ============================================================================
 * apiCache.ts
 * ============================================================================
 *
 * FIC: In-memory API response cache with configurable TTL.
 * Caches responses keyed by a string (URL + body) to avoid redundant network
 * calls when navigating between pages or re-mounting components.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Retrieve a cached value by key. Returns undefined if missing or expired.
 */
export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.data as T;
}

/**
 * Store a value in cache with an optional TTL (default 5 minutes).
 */
export function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalidate a specific cache entry.
 */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/**
 * Invalidate all cache entries that match a prefix (e.g., all coverage entries).
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  store.clear();
}

/**
 * Build a normalized cache key from a URL and optional body.
 */
export function buildCacheKey(url: string, body?: unknown): string {
  if (body === undefined) return url;
  return `${url}::${JSON.stringify(body)}`;
}

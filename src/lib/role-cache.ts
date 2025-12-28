/**
 * Role Cache for Middleware Performance Optimization
 *
 * This module provides an in-memory cache for user roles to avoid
 * querying the database on every protected route request.
 *
 * - Cache TTL: 5 minutes (configurable)
 * - Automatic cleanup of expired entries
 * - Thread-safe for serverless environments
 */

interface CacheEntry {
  role: string;
  expiresAt: number;
}

// In-memory cache for user roles
const roleCache = new Map<string, CacheEntry>();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Cleanup interval (10 minutes)
const CLEANUP_INTERVAL = 10 * 60 * 1000;

// Last cleanup timestamp
let lastCleanup = Date.now();

/**
 * Get role from cache if available and not expired
 *
 * @param userId - User ID
 * @returns Cached role or null if not found/expired
 */
export function getRoleFromCache(userId: string): string | null {
  const entry = roleCache.get(userId);

  if (!entry) {
    return null;
  }

  // Check if entry is expired
  if (Date.now() > entry.expiresAt) {
    roleCache.delete(userId);
    return null;
  }

  return entry.role;
}

/**
 * Set role in cache with TTL
 *
 * @param userId - User ID
 * @param role - User role
 */
export function setRoleInCache(userId: string, role: string): void {
  roleCache.set(userId, {
    role,
    expiresAt: Date.now() + CACHE_TTL,
  });

  // Cleanup old entries periodically
  cleanupExpiredEntries();
}

/**
 * Invalidate (remove) role from cache
 * Use this when user role changes
 *
 * @param userId - User ID
 */
export function invalidateRoleCache(userId: string): void {
  roleCache.delete(userId);
}

/**
 * Clear entire cache
 * Use sparingly, mainly for testing or emergency situations
 */
export function clearRoleCache(): void {
  roleCache.clear();
}

/**
 * Cleanup expired cache entries
 * Runs automatically based on CLEANUP_INTERVAL
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  // Only cleanup if enough time has passed since last cleanup
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }

  lastCleanup = now;
  let removedCount = 0;

  for (const [userId, entry] of roleCache.entries()) {
    if (now > entry.expiresAt) {
      roleCache.delete(userId);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    console.log(`[Role Cache] Cleaned up ${removedCount} expired entries`);
  }
}

/**
 * Get cache statistics (for monitoring/debugging)
 */
export function getRoleCacheStats() {
  let activeCount = 0;
  let expiredCount = 0;
  const now = Date.now();

  for (const entry of roleCache.values()) {
    if (now > entry.expiresAt) {
      expiredCount++;
    } else {
      activeCount++;
    }
  }

  return {
    total: roleCache.size,
    active: activeCount,
    expired: expiredCount,
    ttlMs: CACHE_TTL,
  };
}

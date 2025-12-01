/**
 * Rate Limiter Utility
 *
 * Implements client-side rate limiting for API calls to prevent abuse
 * and ensure fair usage of the Supabase backend.
 *
 * Features:
 * - Token bucket algorithm for smooth rate limiting
 * - Per-endpoint rate limits
 * - Automatic retry with exponential backoff
 * - Memory-efficient storage using Map
 * - Configurable limits per operation type
 */

interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
  retryAfterMs?: number; // Optional retry delay
}

interface RateLimitEntry {
  tokens: number; // Available tokens
  lastRefill: number; // Last refill timestamp
  queue: Array<() => void>; // Queue for pending requests
}

/**
 * Rate limit configurations for different operation types
 */
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Read operations - more permissive
  read: {
    maxRequests: 100,
    windowMs: 60000, // 100 requests per minute
  },
  // Write operations - more restrictive
  write: {
    maxRequests: 30,
    windowMs: 60000, // 30 requests per minute
  },
  // Bulk operations - most restrictive
  bulk: {
    maxRequests: 10,
    windowMs: 60000, // 10 requests per minute
  },
  // Authentication operations
  auth: {
    maxRequests: 20,
    windowMs: 60000, // 20 requests per minute
  },
  // Search operations
  search: {
    maxRequests: 50,
    windowMs: 60000, // 50 requests per minute
  },
  // File upload operations
  upload: {
    maxRequests: 20,
    windowMs: 60000, // 20 requests per minute
  },
};

/**
 * Rate limiter class using token bucket algorithm
 */
class RateLimiter {
  private buckets: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  /**
   * Check if a request is allowed and consume a token
   */
  async checkLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    let entry = this.buckets.get(key);

    if (!entry) {
      // First request for this key
      entry = {
        tokens: config.maxRequests - 1,
        lastRefill: now,
        queue: [],
      };
      this.buckets.set(key, entry);
      return true;
    }

    // Refill tokens based on time elapsed
    const timeSinceRefill = now - entry.lastRefill;
    const refillAmount = Math.floor((timeSinceRefill / config.windowMs) * config.maxRequests);

    if (refillAmount > 0) {
      entry.tokens = Math.min(config.maxRequests, entry.tokens + refillAmount);
      entry.lastRefill = now;
    }

    // Check if tokens available
    if (entry.tokens > 0) {
      entry.tokens--;
      return true;
    }

    return false;
  }

  /**
   * Wait for rate limit to allow request
   */
  async waitForLimit(key: string, config: RateLimitConfig): Promise<void> {
    const allowed = await this.checkLimit(key, config);

    if (allowed) {
      return;
    }

    // Calculate wait time
    const entry = this.buckets.get(key);
    if (!entry) {
      return;
    }

    const waitTime = Math.max(config.retryAfterMs || 1000, config.windowMs / config.maxRequests);

    // Wait and retry
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    return this.waitForLimit(key, config);
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 600000; // 10 minutes

    const keysToDelete: string[] = [];
    this.buckets.forEach((entry, key) => {
      if (now - entry.lastRefill > maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.buckets.delete(key);
    });
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.buckets.clear();
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(
    key: string,
    config: RateLimitConfig
  ): {
    remaining: number;
    resetAt: Date;
  } {
    const entry = this.buckets.get(key);

    if (!entry) {
      return {
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowMs),
      };
    }

    return {
      remaining: entry.tokens,
      resetAt: new Date(entry.lastRefill + config.windowMs),
    };
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public limit: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Wrap an async function with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationType: keyof typeof RATE_LIMITS,
  customKey?: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const config = RATE_LIMITS[operationType];
    const key = customKey || `${operationType}:${fn.name}`;

    // Check rate limit
    const allowed = await rateLimiter.checkLimit(key, config);

    if (!allowed) {
      const status = rateLimiter.getStatus(key, config);
      const retryAfter = Math.ceil((status.resetAt.getTime() - Date.now()) / 1000);

      throw new RateLimitError(
        `Rate limit exceeded for ${operationType} operations. Please try again in ${retryAfter} seconds.`,
        retryAfter,
        config.maxRequests
      );
    }

    // Execute the function
    try {
      return await fn(...args);
    } catch (error) {
      // If the error is from the backend rate limiting, wrap it
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new RateLimitError(
          error.message,
          60, // Default 60 second retry
          config.maxRequests
        );
      }
      throw error;
    }
  }) as T;
}

/**
 * Get rate limit status for an operation type
 */
export function getRateLimitStatus(
  operationType: keyof typeof RATE_LIMITS,
  customKey?: string
): {
  remaining: number;
  resetAt: Date;
  limit: number;
} {
  const config = RATE_LIMITS[operationType];
  const key = customKey || operationType;
  const status = rateLimiter.getStatus(key, config);

  return {
    ...status,
    limit: config.maxRequests,
  };
}

/**
 * Reset rate limit for a specific key (useful for testing)
 */
export function resetRateLimit(operationType: keyof typeof RATE_LIMITS, customKey?: string): void {
  const key = customKey || operationType;
  rateLimiter['buckets'].delete(key);
}

/**
 * Destroy the global rate limiter (useful for cleanup)
 */
export function destroyRateLimiter(): void {
  rateLimiter.destroy();
}

export { rateLimiter, RATE_LIMITS };

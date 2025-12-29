/**
 * Rate limiting utilities for API standardization
 */

import type { RateLimitConfig } from './types';
import { rateLimitHandler, type RateLimitStatus } from './rate-limit-handler';

/**
 * Simple in-memory rate limiter
 */
export class ApiRateLimiter {
  private requests = new Map<string, number[]>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key?: string): boolean {
    const requestKey = key || 'default';
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let keyRequests = this.requests.get(requestKey) || [];

    // Remove requests outside the window
    keyRequests = keyRequests.filter((timestamp) => timestamp > windowStart);

    // Check if under limit
    if (keyRequests.length >= this.config.maxRequests) {
      return false;
    }

    // Add current request
    keyRequests.push(now);
    this.requests.set(requestKey, keyRequests);

    return true;
  }

  /**
   * Get remaining requests for key
   */
  getRemaining(key?: string): number {
    const requestKey = key || 'default';
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let keyRequests = this.requests.get(requestKey) || [];

    // Remove requests outside the window
    keyRequests = keyRequests.filter((timestamp) => timestamp > windowStart);

    return Math.max(0, this.config.maxRequests - keyRequests.length);
  }

  /**
   * Get reset time for key
   */
  getResetTime(key?: string): number {
    const requestKey = key || 'default';
    const keyRequests = this.requests.get(requestKey) || [];

    if (keyRequests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...keyRequests);
    return oldestRequest + this.config.windowMs;
  }

  /**
   * Clear requests for key
   */
  clear(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }

  /**
   * Get rate limit info
   */
  getInfo(key?: string) {
    return {
      limit: this.config.maxRequests,
      remaining: this.getRemaining(key),
      resetTime: this.getResetTime(key),
      windowMs: this.config.windowMs,
    };
  }

  /**
   * Execute operation with rate limiting
   */
  async execute<T>(operation: () => Promise<T>, key?: string, priority: number = 1): Promise<T> {
    const requestKey = key || 'default';

    // Use the enhanced rate limit handler for better queuing and retry logic
    return rateLimitHandler.execute(operation, requestKey, priority);
  }

  /**
   * Get enhanced rate limit status
   */
  getEnhancedStatus(key?: string): RateLimitStatus {
    const requestKey = key || 'default';
    return rateLimitHandler.getRateLimitStatus(requestKey);
  }
}

/**
 * Default rate limiters for different operations
 */
export const RateLimiters = {
  /**
   * General API rate limiter
   */
  api: new ApiRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  /**
   * Authentication rate limiter
   */
  auth: new ApiRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  }),

  /**
   * Search rate limiter
   */
  search: new ApiRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  }),

  /**
   * Upload rate limiter
   */
  upload: new ApiRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),
};

/**
 * Enhanced rate limiting utilities
 */
export const EnhancedRateLimiting = {
  /**
   * Execute operation with enhanced rate limit handling
   */
  async execute<T>(
    operation: () => Promise<T>,
    key: string = 'default',
    priority: number = 1
  ): Promise<T> {
    return rateLimitHandler.execute(operation, key, priority);
  },

  /**
   * Get rate limit status for all keys
   */
  getAllStatus(): Map<string, RateLimitStatus> {
    return rateLimitHandler.getAllRateLimitInfo();
  },

  /**
   * Get queue information
   */
  getQueueInfo(key: string = 'default') {
    return rateLimitHandler.getQueueInfo(key);
  },

  /**
   * Clear queue for key
   */
  clearQueue(key: string = 'default'): void {
    rateLimitHandler.clearQueue(key);
  },
};

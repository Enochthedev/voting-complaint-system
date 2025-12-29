/**
 * Rate Limit Handling System
 *
 * Provides request queuing for rate limit scenarios,
 * retry-after header parsing and waiting,
 * and rate limit status reporting for users.
 */

import { ErrorNormalizer } from './error-normalizer';
import { ErrorType } from './types';
import type { StandardApiError, ErrorContext } from './types';

/**
 * Rate limit information from headers or API response
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp
  retryAfter?: number; // Seconds to wait
  windowMs: number;
}

/**
 * Rate limit status for user reporting
 */
export interface RateLimitStatus {
  isLimited: boolean;
  info: RateLimitInfo;
  waitTimeMs: number;
  message: string;
}

/**
 * Queued request information
 */
interface QueuedRequest<T> {
  id: string;
  operation: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  priority: number;
  timestamp: number;
  context?: Partial<ErrorContext>;
}

/**
 * Rate limit handler configuration
 */
export interface RateLimitHandlerConfig {
  maxQueueSize: number;
  defaultWaitMs: number;
  maxWaitMs: number;
  enableQueuing: boolean;
  priorityLevels: number;
}

/**
 * Default rate limit handler configuration
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitHandlerConfig = {
  maxQueueSize: 100,
  defaultWaitMs: 1000,
  maxWaitMs: 300000, // 5 minutes
  enableQueuing: true,
  priorityLevels: 3,
};

/**
 * Rate limit handling system
 */
export class RateLimitHandler {
  private config: RateLimitHandlerConfig;
  private requestQueue: Map<string, QueuedRequest<any>[]> = new Map();
  private processing: Map<string, boolean> = new Map();
  private rateLimitInfo: Map<string, RateLimitInfo> = new Map();

  constructor(config: Partial<RateLimitHandlerConfig> = {}) {
    this.config = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
  }

  /**
   * Execute operation with rate limit handling
   */
  async execute<T>(
    operation: () => Promise<T>,
    key: string = 'default',
    priority: number = 1,
    context?: Partial<ErrorContext>
  ): Promise<T> {
    // Check current rate limit status
    const status = this.getRateLimitStatus(key);

    if (status.isLimited && status.waitTimeMs > 0) {
      if (!this.config.enableQueuing) {
        throw this.createRateLimitError(status, context);
      }

      // Queue the request if rate limited
      return this.queueRequest(operation, key, priority, context);
    }

    try {
      const result = await operation();

      // Update rate limit info from successful response
      this.updateRateLimitFromResponse(key, null);

      return result;
    } catch (error: any) {
      // Check if this is a rate limit error
      if (this.isRateLimitError(error)) {
        const rateLimitInfo = this.parseRateLimitFromError(error);
        this.updateRateLimitInfo(key, rateLimitInfo);

        if (!this.config.enableQueuing) {
          throw this.createRateLimitError(this.getRateLimitStatus(key), context);
        }

        // Queue the request for retry after rate limit expires
        return this.queueRequest(operation, key, priority, context);
      }

      throw error;
    }
  }

  /**
   * Queue a request for later execution
   */
  private async queueRequest<T>(
    operation: () => Promise<T>,
    key: string,
    priority: number,
    context?: Partial<ErrorContext>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queue = this.requestQueue.get(key) || [];

      // Check queue size limit
      if (queue.length >= this.config.maxQueueSize) {
        reject(this.createQueueFullError(context));
        return;
      }

      const request: QueuedRequest<T> = {
        id: this.generateRequestId(),
        operation,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
        context,
      };

      // Insert request based on priority (higher priority first)
      const insertIndex = queue.findIndex((r) => r.priority < priority);
      if (insertIndex === -1) {
        queue.push(request);
      } else {
        queue.splice(insertIndex, 0, request);
      }

      this.requestQueue.set(key, queue);

      // Start processing queue if not already processing
      if (!this.processing.get(key)) {
        this.processQueue(key);
      }
    });
  }

  /**
   * Process queued requests for a specific key
   */
  private async processQueue(key: string): Promise<void> {
    if (this.processing.get(key)) {
      return;
    }

    this.processing.set(key, true);

    try {
      while (true) {
        const queue = this.requestQueue.get(key) || [];
        if (queue.length === 0) {
          break;
        }

        // Check if we can process requests now
        const status = this.getRateLimitStatus(key);
        if (status.isLimited && status.waitTimeMs > 0) {
          // Wait for rate limit to reset
          await this.waitForRateLimit(status.waitTimeMs);
          continue;
        }

        // Process next request
        const request = queue.shift()!;
        this.requestQueue.set(key, queue);

        try {
          const result = await request.operation();
          request.resolve(result);

          // Update rate limit info
          this.updateRateLimitFromResponse(key, null);
        } catch (error: any) {
          if (this.isRateLimitError(error)) {
            // Update rate limit info and requeue
            const rateLimitInfo = this.parseRateLimitFromError(error);
            this.updateRateLimitInfo(key, rateLimitInfo);

            // Put request back at front of queue
            queue.unshift(request);
            this.requestQueue.set(key, queue);
          } else {
            request.reject(error);
          }
        }

        // Small delay between requests to avoid overwhelming
        await this.delay(100);
      }
    } finally {
      this.processing.set(key, false);
    }
  }

  /**
   * Get current rate limit status for a key
   */
  getRateLimitStatus(key: string): RateLimitStatus {
    const info = this.rateLimitInfo.get(key);

    if (!info) {
      return {
        isLimited: false,
        info: this.createDefaultRateLimitInfo(),
        waitTimeMs: 0,
        message: 'No rate limit information available',
      };
    }

    const now = Date.now();
    const resetTime = info.resetTime * 1000; // Convert to milliseconds
    const waitTimeMs = Math.max(0, resetTime - now);
    const isLimited = info.remaining <= 0 && waitTimeMs > 0;

    let message = `Rate limit: ${info.remaining}/${info.limit} requests remaining`;
    if (isLimited) {
      const waitSeconds = Math.ceil(waitTimeMs / 1000);
      message = `Rate limited. Try again in ${waitSeconds} seconds.`;
    }

    return {
      isLimited,
      info,
      waitTimeMs,
      message,
    };
  }

  /**
   * Parse rate limit information from error response
   */
  private parseRateLimitFromError(error: any): RateLimitInfo {
    const headers = error.headers || {};
    const now = Math.floor(Date.now() / 1000);

    return {
      limit: parseInt(headers['x-ratelimit-limit'] || headers['ratelimit-limit'] || '100'),
      remaining: parseInt(
        headers['x-ratelimit-remaining'] || headers['ratelimit-remaining'] || '0'
      ),
      resetTime: parseInt(
        headers['x-ratelimit-reset'] || headers['ratelimit-reset'] || (now + 60).toString()
      ),
      retryAfter: parseInt(headers['retry-after'] || '60'),
      windowMs: parseInt(headers['x-ratelimit-window'] || '60000'),
    };
  }

  /**
   * Update rate limit information from successful response
   */
  private updateRateLimitFromResponse(key: string, headers: Record<string, string> | null): void {
    if (!headers) {
      // If no headers provided, assume we have remaining requests
      const existing = this.rateLimitInfo.get(key);
      if (existing && existing.remaining > 0) {
        this.rateLimitInfo.set(key, {
          ...existing,
          remaining: Math.max(0, existing.remaining - 1),
        });
      }
      return;
    }

    const info = this.parseRateLimitFromHeaders(headers);
    this.updateRateLimitInfo(key, info);
  }

  /**
   * Parse rate limit information from response headers
   */
  private parseRateLimitFromHeaders(headers: Record<string, string>): RateLimitInfo {
    const now = Math.floor(Date.now() / 1000);

    return {
      limit: parseInt(headers['x-ratelimit-limit'] || headers['ratelimit-limit'] || '100'),
      remaining: parseInt(
        headers['x-ratelimit-remaining'] || headers['ratelimit-remaining'] || '99'
      ),
      resetTime: parseInt(
        headers['x-ratelimit-reset'] || headers['ratelimit-reset'] || (now + 60).toString()
      ),
      retryAfter: headers['retry-after'] ? parseInt(headers['retry-after']) : undefined,
      windowMs: parseInt(headers['x-ratelimit-window'] || '60000'),
    };
  }

  /**
   * Update rate limit information for a key
   */
  private updateRateLimitInfo(key: string, info: RateLimitInfo): void {
    this.rateLimitInfo.set(key, info);
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: any): boolean {
    return (
      error?.status === 429 ||
      error?.code === 'RATE_LIMIT_EXCEEDED' ||
      error?.message?.toLowerCase().includes('rate limit') ||
      error?.message?.toLowerCase().includes('too many requests')
    );
  }

  /**
   * Wait for rate limit to reset
   */
  private async waitForRateLimit(waitTimeMs: number): Promise<void> {
    const clampedWaitTime = Math.min(waitTimeMs, this.config.maxWaitMs);
    await this.delay(clampedWaitTime);
  }

  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create default rate limit info
   */
  private createDefaultRateLimitInfo(): RateLimitInfo {
    const now = Math.floor(Date.now() / 1000);
    return {
      limit: 100,
      remaining: 100,
      resetTime: now + 60,
      windowMs: 60000,
    };
  }

  /**
   * Create rate limit error
   */
  private createRateLimitError(
    status: RateLimitStatus,
    context?: Partial<ErrorContext>
  ): StandardApiError {
    return ErrorNormalizer.normalize(
      {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: status.message,
        headers: {
          'retry-after': Math.ceil(status.waitTimeMs / 1000).toString(),
        },
      },
      context
    );
  }

  /**
   * Create queue full error
   */
  private createQueueFullError(context?: Partial<ErrorContext>): StandardApiError {
    return ErrorNormalizer.createServerError(
      'Request queue is full. Please try again later.',
      context
    );
  }

  /**
   * Get queue information for a key
   */
  getQueueInfo(key: string = 'default') {
    const queue = this.requestQueue.get(key) || [];
    return {
      length: queue.length,
      processing: this.processing.get(key) || false,
      oldestRequest: queue.length > 0 ? queue[queue.length - 1].timestamp : null,
    };
  }

  /**
   * Clear queue for a key
   */
  clearQueue(key: string = 'default'): void {
    const queue = this.requestQueue.get(key) || [];
    queue.forEach((request) => {
      request.reject(new Error('Queue cleared'));
    });
    this.requestQueue.delete(key);
    this.processing.set(key, false);
  }

  /**
   * Get all rate limit information
   */
  getAllRateLimitInfo(): Map<string, RateLimitStatus> {
    const result = new Map<string, RateLimitStatus>();

    for (const [key] of Array.from(this.rateLimitInfo)) {
      result.set(key, this.getRateLimitStatus(key));
    }

    return result;
  }
}

/**
 * Default rate limit handler instance
 */
export const rateLimitHandler = new RateLimitHandler();

/**
 * Utility function to execute operation with rate limit handling
 */
export async function withRateLimitHandling<T>(
  operation: () => Promise<T>,
  key: string = 'default',
  priority: number = 1,
  context?: Partial<ErrorContext>
): Promise<T> {
  return rateLimitHandler.execute(operation, key, priority, context);
}

/**
 * Utility function to get rate limit status
 */
export function getRateLimitStatus(key: string = 'default'): RateLimitStatus {
  return rateLimitHandler.getRateLimitStatus(key);
}

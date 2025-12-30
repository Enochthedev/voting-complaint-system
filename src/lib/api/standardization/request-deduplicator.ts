/**
 * Request deduplication system for API optimization
 *
 * Prevents duplicate requests from being sent within configurable time windows.
 * Provides statistics and monitoring for request deduplication effectiveness.
 */

import type { RequestOptions } from './types';

/**
 * Configuration for request deduplication
 */
export interface DeduplicationConfig {
  /** Time window in milliseconds for considering requests as duplicates */
  windowMs: number;
  /** Maximum number of pending requests to track */
  maxPendingRequests: number;
  /** Whether to enable deduplication by default */
  enabled: boolean;
}

/**
 * Statistics for request deduplication
 */
export interface DeduplicationStats {
  /** Total number of requests processed */
  totalRequests: number;
  /** Number of requests that were deduplicated */
  deduplicatedRequests: number;
  /** Number of unique requests sent */
  uniqueRequests: number;
  /** Current number of pending requests */
  pendingRequests: number;
  /** Deduplication rate as a percentage */
  deduplicationRate: number;
}

/**
 * Information about a pending request
 */
interface PendingRequest {
  /** Promise that resolves when the request completes */
  promise: Promise<any>;
  /** Timestamp when the request was initiated */
  timestamp: number;
  /** Number of times this request was deduplicated */
  duplicateCount: number;
}

/**
 * Request deduplication system
 */
export class RequestDeduplicator {
  private config: DeduplicationConfig;
  private pendingRequests = new Map<string, PendingRequest>();
  private stats: DeduplicationStats = {
    totalRequests: 0,
    deduplicatedRequests: 0,
    uniqueRequests: 0,
    pendingRequests: 0,
    deduplicationRate: 0,
  };

  constructor(config: Partial<DeduplicationConfig> = {}) {
    this.config = {
      windowMs: 5000, // 5 seconds default
      maxPendingRequests: 100,
      enabled: true,
      ...config,
    };

    // Clean up expired requests periodically
    setInterval(() => this.cleanup(), this.config.windowMs);
  }

  /**
   * Generate a unique key for a request based on method, URL, and parameters
   */
  generateRequestKey(
    method: string,
    url: string,
    params?: Record<string, any>,
    body?: any
  ): string {
    const normalizedMethod = method.toUpperCase();
    const normalizedUrl = url.toLowerCase();

    // Create a stable string representation of parameters and body
    const paramsStr = params ? JSON.stringify(this.sortObject(params)) : '';
    const bodyStr = body ? JSON.stringify(this.sortObject(body)) : '';

    return `${normalizedMethod}:${normalizedUrl}:${paramsStr}:${bodyStr}`;
  }

  /**
   * Execute a request with deduplication
   */
  async execute<T>(
    requestKey: string,
    requestFn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    this.stats.totalRequests++;

    // Check if deduplication is disabled for this request
    if (!this.config.enabled || options.cache === false) {
      this.stats.uniqueRequests++;
      return requestFn();
    }

    // Check if there's already a pending request with the same key
    const existingRequest = this.pendingRequests.get(requestKey);

    if (existingRequest) {
      // Check if the existing request is still within the time window
      const now = Date.now();
      if (now - existingRequest.timestamp < this.config.windowMs) {
        // Deduplicate this request
        this.stats.deduplicatedRequests++;
        existingRequest.duplicateCount++;
        this.updateDeduplicationRate();

        // Return the existing promise
        return existingRequest.promise;
      } else {
        // Existing request is too old, remove it
        this.pendingRequests.delete(requestKey);
        this.stats.pendingRequests--;
      }
    }

    // Create a new request
    const timestamp = Date.now();
    const promise = requestFn().finally(() => {
      // Clean up when request completes
      this.pendingRequests.delete(requestKey);
      this.stats.pendingRequests--;
    });

    // Store the pending request
    const pendingRequest: PendingRequest = {
      promise,
      timestamp,
      duplicateCount: 0,
    };

    this.pendingRequests.set(requestKey, pendingRequest);
    this.stats.pendingRequests++;
    this.stats.uniqueRequests++;
    this.updateDeduplicationRate();

    // Enforce max pending requests limit
    if (this.pendingRequests.size > this.config.maxPendingRequests) {
      this.cleanup();
    }

    return promise;
  }

  /**
   * Get current deduplication statistics
   */
  getStats(): DeduplicationStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      uniqueRequests: 0,
      pendingRequests: this.pendingRequests.size,
      deduplicationRate: 0,
    };
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
    this.stats.pendingRequests = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DeduplicationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): DeduplicationConfig {
    return { ...this.config };
  }

  /**
   * Clean up expired pending requests
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp >= this.config.windowMs) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.pendingRequests.delete(key);
      this.stats.pendingRequests--;
    }
  }

  /**
   * Update deduplication rate
   */
  private updateDeduplicationRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.deduplicationRate =
        (this.stats.deduplicatedRequests / this.stats.totalRequests) * 100;
    }
  }

  /**
   * Sort object keys for consistent serialization
   */
  private sortObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortObject(item));
    }

    const sorted: any = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sorted[key] = this.sortObject(obj[key]);
    }

    return sorted;
  }
}

/**
 * Global request deduplicator instance
 */
export const globalDeduplicator = new RequestDeduplicator();

/**
 * Utility function to deduplicate a request
 */
export async function deduplicateRequest<T>(
  method: string,
  url: string,
  requestFn: () => Promise<T>,
  params?: Record<string, any>,
  body?: any,
  options: RequestOptions = {}
): Promise<T> {
  const requestKey = globalDeduplicator.generateRequestKey(method, url, params, body);
  return globalDeduplicator.execute(requestKey, requestFn, options);
}

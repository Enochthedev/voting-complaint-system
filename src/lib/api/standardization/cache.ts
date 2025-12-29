/**
 * Caching utilities for API standardization
 */

import type { CacheConfig, CacheInfo } from './types';

/**
 * Simple in-memory cache implementation
 */
export class ApiCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      strategy: 'lru',
      ...config,
    };
  }

  /**
   * Get cached data
   */
  get<T>(key: string): { data: T | null; info: CacheInfo } {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry || entry.expires < now) {
      // Cache miss or expired
      if (entry) {
        this.cache.delete(key);
      }

      return {
        data: null,
        info: {
          key,
          ttl: this.config.ttl,
          hit: false,
        },
      };
    }

    // Cache hit - update access time for LRU
    if (this.config.strategy === 'lru') {
      this.cache.delete(key);
      this.cache.set(key, entry);
    }

    return {
      data: entry.data,
      info: {
        key,
        ttl: entry.expires - now,
        hit: true,
      },
    };
  }

  /**
   * Set cached data
   */
  set(key: string, data: any, ttl?: number): void {
    const expires = Date.now() + (ttl || this.config.ttl);

    // Evict if at max size
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, { data, expires });
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      strategy: this.config.strategy,
    };
  }

  /**
   * Evict entries based on strategy
   */
  private evict(): void {
    if (this.config.strategy === 'lru') {
      // Remove oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    } else if (this.config.strategy === 'fifo') {
      // Remove first entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Generate cache key from parameters
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|');

    return `${prefix}:${sortedParams}`;
  }
}

/**
 * Global cache instance
 */
export const globalCache = new ApiCache();

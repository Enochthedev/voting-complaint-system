/**
 * Enhanced cache management system for API optimization
 *
 * Provides improved React Query cache policies, persistent storage,
 * and intelligent garbage collection for better performance.
 */

import { QueryClient } from '@tanstack/react-query';
import type { CacheConfig, CacheInfo } from './types';

/**
 * Enhanced cache configuration
 */
export interface EnhancedCacheConfig extends CacheConfig {
  /** Whether to enable persistent storage */
  persistentStorage: boolean;
  /** Storage key for persistent cache */
  storageKey: string;
  /** Maximum age for persistent cache (ms) */
  maxAge: number;
  /** Whether to enable intelligent garbage collection */
  intelligentGC: boolean;
  /** Garbage collection interval (ms) */
  gcInterval: number;
  /** Memory usage threshold for aggressive GC (bytes) */
  memoryThreshold: number;
}

/**
 * Cache statistics and monitoring
 */
export interface CacheStats {
  /** Total number of cache entries */
  totalEntries: number;
  /** Cache hit rate as percentage */
  hitRate: number;
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Estimated memory usage (bytes) */
  memoryUsage: number;
  /** Number of garbage collections performed */
  gcCount: number;
  /** Last garbage collection timestamp */
  lastGC: string | null;
}

/**
 * Cache entry metadata
 */
interface CacheEntryMeta {
  /** Last access timestamp */
  lastAccess: number;
  /** Access count */
  accessCount: number;
  /** Entry size estimate (bytes) */
  size: number;
  /** Priority score for GC */
  priority: number;
}

/**
 * Enhanced cache management system
 */
export class EnhancedCacheManager {
  private config: EnhancedCacheConfig;
  private queryClient: QueryClient;
  private persister: any;
  private stats: CacheStats = {
    totalEntries: 0,
    hitRate: 0,
    hits: 0,
    misses: 0,
    memoryUsage: 0,
    gcCount: 0,
    lastGC: null,
  };
  private entryMetadata = new Map<string, CacheEntryMeta>();
  private gcTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<EnhancedCacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      strategy: 'lru',
      persistentStorage: true,
      storageKey: 'complaint-system-cache',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      intelligentGC: true,
      gcInterval: 5 * 60 * 1000, // 5 minutes
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      ...config,
    };

    this.queryClient = this.createQueryClient();
    this.setupPersistentStorage();
    this.setupIntelligentGC();
  }

  /**
   * Create optimized QueryClient with enhanced cache policies
   */
  private createQueryClient(): QueryClient {
    return new QueryClient({
      defaultOptions: {
        queries: {
          // Enhanced stale time based on data type
          staleTime: (query) => {
            const queryKey = query.queryKey[0] as string;

            // Static data can be cached longer
            if (queryKey.includes('users') || queryKey.includes('templates')) {
              return 10 * 60 * 1000; // 10 minutes
            }

            // Dynamic data needs fresher cache
            if (queryKey.includes('notifications') || queryKey.includes('realtime')) {
              return 30 * 1000; // 30 seconds
            }

            // Default cache time
            return this.config.ttl;
          },

          // Enhanced garbage collection time (static value in v5)
          gcTime: 10 * 60 * 1000, // 10 minutes default

          // Intelligent refetch policies (static value in v5)
          refetchOnWindowFocus: true,

          // Enhanced retry logic (static value in v5, configure per-query if needed)
          retry: 3,

          retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

          // Network mode for offline support
          networkMode: 'offlineFirst',
        },

        mutations: {
          // Enhanced mutation retry (static value in v5, configure per-mutation if needed)
          retry: 1,

          // Network mode for mutations
          networkMode: 'online',
        },
      },
    });
  }

  /**
   * Setup persistent storage for cache
   */
  private setupPersistentStorage(): void {
    if (!this.config.persistentStorage || typeof window === 'undefined') {
      return;
    }

    // Note: Persistent storage requires additional packages:
    // @tanstack/react-query-persist-client and @tanstack/query-sync-storage-persister
    // For now, this is a placeholder for future implementation
    console.log('Persistent storage configuration ready');
  }

  /**
   * Setup intelligent garbage collection
   */
  private setupIntelligentGC(): void {
    if (!this.config.intelligentGC) {
      return;
    }

    this.gcTimer = setInterval(() => {
      this.performIntelligentGC();
    }, this.config.gcInterval);
  }

  /**
   * Perform intelligent garbage collection
   */
  private performIntelligentGC(): void {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    // Update memory usage estimate
    this.updateMemoryUsage(queries);

    // Only perform aggressive GC if memory threshold exceeded
    if (this.stats.memoryUsage > this.config.memoryThreshold) {
      this.performAggressiveGC(queries);
    } else {
      this.performStandardGC(queries);
    }

    this.stats.gcCount++;
    this.stats.lastGC = new Date().toISOString();
  }

  /**
   * Perform standard garbage collection
   */
  private performStandardGC(queries: any[]): void {
    const now = Date.now();

    queries.forEach((query) => {
      const queryKey = JSON.stringify(query.queryKey);
      const meta = this.entryMetadata.get(queryKey);

      if (!meta) return;

      // Remove queries that haven't been accessed recently
      const timeSinceAccess = now - meta.lastAccess;
      if (timeSinceAccess > this.config.ttl * 2) {
        query.remove();
        this.entryMetadata.delete(queryKey);
      }
    });
  }

  /**
   * Perform aggressive garbage collection when memory threshold exceeded
   */
  private performAggressiveGC(queries: any[]): void {
    // Calculate priority scores for all queries
    const queryPriorities = queries.map((query) => {
      const queryKey = JSON.stringify(query.queryKey);
      const meta = this.entryMetadata.get(queryKey);

      if (!meta) {
        return { query, priority: 0 };
      }

      // Priority based on access frequency, recency, and size
      const accessScore = Math.log(meta.accessCount + 1);
      const recencyScore = 1 / (Date.now() - meta.lastAccess + 1);
      const sizeScore = 1 / (meta.size + 1);

      const priority = accessScore * recencyScore * sizeScore;

      return { query, priority };
    });

    // Sort by priority (lowest first) and remove bottom 25%
    queryPriorities.sort((a, b) => a.priority - b.priority);
    const toRemove = Math.floor(queryPriorities.length * 0.25);

    for (let i = 0; i < toRemove; i++) {
      const { query } = queryPriorities[i];
      const queryKey = JSON.stringify(query.queryKey);

      query.remove();
      this.entryMetadata.delete(queryKey);
    }
  }

  /**
   * Update memory usage estimate
   */
  private updateMemoryUsage(queries: any[]): void {
    let totalSize = 0;

    queries.forEach((query) => {
      const queryKey = JSON.stringify(query.queryKey);
      let meta = this.entryMetadata.get(queryKey);

      if (!meta) {
        // Estimate size based on data
        const dataSize = this.estimateDataSize(query.state.data);
        meta = {
          lastAccess: Date.now(),
          accessCount: 1,
          size: dataSize,
          priority: 1,
        };
        this.entryMetadata.set(queryKey, meta);
      }

      totalSize += meta.size;
    });

    this.stats.memoryUsage = totalSize;
    this.stats.totalEntries = queries.length;
  }

  /**
   * Estimate data size in bytes
   */
  private estimateDataSize(data: any): number {
    if (!data) return 0;

    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data || {}).length * 2; // Rough UTF-16 estimate
    }
  }

  /**
   * Track cache access for statistics
   */
  trackAccess(queryKey: string, hit: boolean): void {
    if (hit) {
      this.stats.hits++;

      // Update metadata
      const meta = this.entryMetadata.get(queryKey);
      if (meta) {
        meta.lastAccess = Date.now();
        meta.accessCount++;
      }
    } else {
      this.stats.misses++;
    }

    // Update hit rate
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalEntries: this.stats.totalEntries,
      hitRate: 0,
      hits: 0,
      misses: 0,
      memoryUsage: this.stats.memoryUsage,
      gcCount: 0,
      lastGC: null,
    };
  }

  /**
   * Get the QueryClient instance
   */
  getQueryClient(): QueryClient {
    return this.queryClient;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EnhancedCacheConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart GC timer if interval changed
    if (config.gcInterval && this.gcTimer) {
      clearInterval(this.gcTimer);
      this.setupIntelligentGC();
    }
  }

  /**
   * Get configuration
   */
  getConfig(): EnhancedCacheConfig {
    return { ...this.config };
  }

  /**
   * Manually trigger garbage collection
   */
  triggerGC(): void {
    this.performIntelligentGC();
  }

  /**
   * Clear all cache data
   */
  clear(): void {
    this.queryClient.clear();
    this.entryMetadata.clear();
    this.stats.totalEntries = 0;
    this.stats.memoryUsage = 0;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }

    this.clear();
  }
}

/**
 * Global enhanced cache manager instance
 */
export const globalCacheManager = new EnhancedCacheManager();

/**
 * Enhanced React Query provider with optimized cache
 */
export function createEnhancedQueryClient(config?: Partial<EnhancedCacheConfig>): QueryClient {
  const cacheManager = new EnhancedCacheManager(config);
  return cacheManager.getQueryClient();
}

/**
 * Cache invalidation utilities
 */
export class CacheInvalidator {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate complaint-related queries
   */
  invalidateComplaints(complaintId?: string): void {
    if (complaintId) {
      this.queryClient.invalidateQueries({
        queryKey: ['complaint', complaintId],
      });
    }

    this.queryClient.invalidateQueries({
      queryKey: ['complaints'],
    });
    this.queryClient.invalidateQueries({
      queryKey: ['complaint-stats'],
    });
  }

  /**
   * Invalidate user-related queries
   */
  invalidateUser(userId?: string): void {
    if (userId) {
      this.queryClient.invalidateQueries({
        queryKey: ['user', userId],
      });
    }

    this.queryClient.invalidateQueries({
      queryKey: ['users'],
    });
  }

  /**
   * Invalidate notification queries
   */
  invalidateNotifications(userId?: string): void {
    if (userId) {
      this.queryClient.invalidateQueries({
        queryKey: ['notifications', userId],
      });
    }

    this.queryClient.invalidateQueries({
      queryKey: ['notifications'],
    });
  }

  /**
   * Smart invalidation based on mutation type
   */
  smartInvalidate(mutationType: string, entityId?: string): void {
    switch (mutationType) {
      case 'complaint-create':
      case 'complaint-update':
      case 'complaint-delete':
        this.invalidateComplaints(entityId);
        break;

      case 'user-update':
        this.invalidateUser(entityId);
        break;

      case 'notification-create':
      case 'notification-update':
        this.invalidateNotifications(entityId);
        break;

      default:
        // Fallback: invalidate all queries
        this.queryClient.invalidateQueries();
    }
  }
}

/**
 * Create cache invalidator instance
 */
export function createCacheInvalidator(queryClient: QueryClient): CacheInvalidator {
  return new CacheInvalidator(queryClient);
}

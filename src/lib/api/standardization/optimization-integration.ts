/**
 * Integration example for request optimization layer
 *
 * Demonstrates how to use request deduplication, batch optimization,
 * and enhanced cache management together for maximum performance.
 */

import { supabase } from '@/lib/supabase';
import { globalDeduplicator, deduplicateRequest } from './request-deduplicator';
import { globalBatchOptimizer, batchComplaintQueries, batchUserQueries } from './batch-optimizer';
import { globalCacheManager, createCacheInvalidator } from './enhanced-cache';

/**
 * Optimized API client that combines all optimization features
 */
export class OptimizedApiClient {
  private cacheInvalidator = createCacheInvalidator(globalCacheManager.getQueryClient());

  /**
   * Fetch complaints with full optimization stack
   */
  async getComplaints(filters?: Record<string, any>) {
    return deduplicateRequest(
      'GET',
      '/api/complaints',
      async () => {
        // Track cache access
        const cacheKey = `complaints:${JSON.stringify(filters || {})}`;

        try {
          const { data, error } = await supabase
            .from('complaints')
            .select(
              `
              *,
              student:users!complaints_student_id_fkey(id, full_name, email),
              assigned_user:users!complaints_assigned_to_fkey(id, full_name, email)
            `
            )
            .eq('is_draft', false)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Track successful cache access
          globalCacheManager.trackAccess(cacheKey, true);

          return data;
        } catch (error) {
          // Track cache miss
          globalCacheManager.trackAccess(cacheKey, false);
          throw error;
        }
      },
      filters
    );
  }

  /**
   * Fetch multiple complaints by IDs using batch optimization
   */
  async getComplaintsByIds(complaintIds: string[]) {
    return batchComplaintQueries(complaintIds, async (ids: string[]) => {
      const { data, error } = await supabase
        .from('complaints')
        .select(
          `
          *,
          student:users!complaints_student_id_fkey(id, full_name, email),
          assigned_user:users!complaints_assigned_to_fkey(id, full_name, email),
          tags:complaint_tags(tag_name)
        `
        )
        .in('id', ids);

      if (error) throw error;
      return data || [];
    });
  }

  /**
   * Fetch multiple users by IDs using batch optimization
   */
  async getUsersByIds(userIds: string[]) {
    return batchUserQueries(userIds, async (ids: string[]) => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .in('id', ids);

      if (error) throw error;
      return data || [];
    });
  }

  /**
   * Create complaint with optimized cache invalidation
   */
  async createComplaint(complaintData: any) {
    return deduplicateRequest(
      'POST',
      '/api/complaints',
      async () => {
        const { data, error } = await supabase
          .from('complaints')
          .insert(complaintData)
          .select()
          .single();

        if (error) throw error;

        // Smart cache invalidation
        this.cacheInvalidator.smartInvalidate('complaint-create', data.id);

        return data;
      },
      undefined,
      complaintData,
      { cache: false } // Don't deduplicate create operations
    );
  }

  /**
   * Update complaint with optimized cache invalidation
   */
  async updateComplaint(complaintId: string, updates: any) {
    return deduplicateRequest(
      'PUT',
      `/api/complaints/${complaintId}`,
      async () => {
        const { data, error } = await supabase
          .from('complaints')
          .update(updates)
          .eq('id', complaintId)
          .select()
          .single();

        if (error) throw error;

        // Smart cache invalidation
        this.cacheInvalidator.smartInvalidate('complaint-update', complaintId);

        return data;
      },
      { id: complaintId },
      updates,
      { cache: false } // Don't deduplicate update operations
    );
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats() {
    return {
      deduplication: globalDeduplicator.getStats(),
      batching: globalBatchOptimizer.getStats(),
      cache: globalCacheManager.getStats(),
    };
  }

  /**
   * Reset all optimization statistics
   */
  resetOptimizationStats() {
    globalDeduplicator.resetStats();
    globalBatchOptimizer.resetStats();
    globalCacheManager.resetStats();
  }

  /**
   * Configure optimization settings
   */
  configureOptimization(config: { deduplication?: any; batching?: any; cache?: any }) {
    if (config.deduplication) {
      globalDeduplicator.updateConfig(config.deduplication);
    }

    if (config.batching) {
      globalBatchOptimizer.updateConfig(config.batching);
    }

    if (config.cache) {
      globalCacheManager.updateConfig(config.cache);
    }
  }
}

/**
 * Global optimized API client instance
 */
export const optimizedApiClient = new OptimizedApiClient();

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  /**
   * Measure API call performance
   */
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      this.recordMetric(name, duration);

      return { result, duration };
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get performance statistics
   */
  getStats(name: string) {
    const values = this.metrics.get(name) || [];

    if (values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Get all metrics
   */
  getAllStats() {
    const stats: Record<string, any> = {};

    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name);
    }

    return stats;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Utility function to create an optimized API hook
 */
export function createOptimizedApiHook<T>(name: string, apiCall: () => Promise<T>) {
  return async (): Promise<T> => {
    const { result } = await performanceMonitor.measureApiCall(name, apiCall);
    return result;
  };
}

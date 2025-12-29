/**
 * Batch query optimizer for API requests
 *
 * Combines related requests into batches to reduce N+1 query problems
 * and improve overall API performance.
 */

import type { RequestOptions } from './types';

/**
 * Configuration for batch optimization
 */
export interface BatchConfig {
  /** Maximum time to wait before executing a batch (ms) */
  batchWindow: number;
  /** Maximum number of requests in a single batch */
  maxBatchSize: number;
  /** Whether to enable batching by default */
  enabled: boolean;
}

/**
 * Statistics for batch optimization
 */
export interface BatchStats {
  /** Total number of individual requests processed */
  totalRequests: number;
  /** Number of batches executed */
  batchesExecuted: number;
  /** Average batch size */
  averageBatchSize: number;
  /** Total requests saved through batching */
  requestsSaved: number;
  /** Batch efficiency as a percentage */
  batchEfficiency: number;
}

/**
 * Information about a pending batch request
 */
interface PendingBatchRequest {
  /** Unique identifier for the request */
  id: string;
  /** Parameters for the request */
  params: any;
  /** Promise resolver for the request */
  resolve: (value: any) => void;
  /** Promise rejector for the request */
  reject: (error: any) => void;
  /** Timestamp when the request was added */
  timestamp: number;
}

/**
 * Batch execution function type
 */
export type BatchExecutor<T, R> = (requests: T[]) => Promise<R[]>;

/**
 * Batch query optimizer
 */
export class BatchOptimizer {
  private config: BatchConfig;
  private pendingBatches = new Map<string, PendingBatchRequest[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();
  private stats: BatchStats = {
    totalRequests: 0,
    batchesExecuted: 0,
    averageBatchSize: 0,
    requestsSaved: 0,
    batchEfficiency: 0,
  };

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      batchWindow: 50, // 50ms default
      maxBatchSize: 100,
      enabled: true,
      ...config,
    };
  }

  /**
   * Add a request to a batch
   */
  async batchRequest<T, R>(
    batchKey: string,
    requestParams: T,
    batchExecutor: BatchExecutor<T, R>,
    options: RequestOptions = {}
  ): Promise<R> {
    this.stats.totalRequests++;

    // If batching is disabled, execute immediately
    if (!this.config.enabled || options.cache === false) {
      const results = await batchExecutor([requestParams]);
      return results[0];
    }

    return new Promise<R>((resolve, reject) => {
      const requestId = this.generateRequestId();
      const pendingRequest: PendingBatchRequest = {
        id: requestId,
        params: requestParams,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      // Get or create batch for this key
      if (!this.pendingBatches.has(batchKey)) {
        this.pendingBatches.set(batchKey, []);
      }

      const batch = this.pendingBatches.get(batchKey)!;
      batch.push(pendingRequest);

      // Execute immediately if batch is full
      if (batch.length >= this.config.maxBatchSize) {
        this.executeBatch(batchKey, batchExecutor);
        return;
      }

      // Set or reset timer for this batch
      if (this.batchTimers.has(batchKey)) {
        clearTimeout(this.batchTimers.get(batchKey)!);
      }

      const timer = setTimeout(() => {
        this.executeBatch(batchKey, batchExecutor);
      }, this.config.batchWindow);

      this.batchTimers.set(batchKey, timer);
    });
  }

  /**
   * Execute a batch of requests
   */
  private async executeBatch<T, R>(
    batchKey: string,
    batchExecutor: BatchExecutor<T, R>
  ): Promise<void> {
    const batch = this.pendingBatches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }

    // Clear the batch and timer
    this.pendingBatches.delete(batchKey);
    if (this.batchTimers.has(batchKey)) {
      clearTimeout(this.batchTimers.get(batchKey)!);
      this.batchTimers.delete(batchKey);
    }

    // Update statistics
    this.stats.batchesExecuted++;
    const batchSize = batch.length;
    this.stats.requestsSaved += Math.max(0, batchSize - 1);
    this.updateAverageBatchSize(batchSize);
    this.updateBatchEfficiency();

    try {
      // Extract parameters and execute batch
      const requestParams = batch.map((req) => req.params);
      const results = await batchExecutor(requestParams);

      // Resolve individual promises
      if (results.length !== batch.length) {
        throw new Error(
          `Batch executor returned ${results.length} results for ${batch.length} requests`
        );
      }

      batch.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in the batch
      batch.forEach((request) => {
        request.reject(error);
      });
    }
  }

  /**
   * Get current batch statistics
   */
  getStats(): BatchStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      batchesExecuted: 0,
      averageBatchSize: 0,
      requestsSaved: 0,
      batchEfficiency: 0,
    };
  }

  /**
   * Clear all pending batches
   */
  clear(): void {
    // Clear all timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();

    // Reject all pending requests
    for (const batch of this.pendingBatches.values()) {
      batch.forEach((request) => {
        request.reject(new Error('Batch optimizer cleared'));
      });
    }
    this.pendingBatches.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): BatchConfig {
    return { ...this.config };
  }

  /**
   * Get pending batch information
   */
  getPendingBatches(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, batch] of this.pendingBatches.entries()) {
      result[key] = batch.length;
    }
    return result;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update average batch size
   */
  private updateAverageBatchSize(newBatchSize: number): void {
    if (this.stats.batchesExecuted === 1) {
      this.stats.averageBatchSize = newBatchSize;
    } else {
      const totalSize =
        this.stats.averageBatchSize * (this.stats.batchesExecuted - 1) + newBatchSize;
      this.stats.averageBatchSize = totalSize / this.stats.batchesExecuted;
    }
  }

  /**
   * Update batch efficiency
   */
  private updateBatchEfficiency(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.batchEfficiency = (this.stats.requestsSaved / this.stats.totalRequests) * 100;
    }
  }
}

/**
 * Global batch optimizer instance
 */
export const globalBatchOptimizer = new BatchOptimizer();

/**
 * Utility functions for common batch operations
 */

/**
 * Batch multiple complaint queries by IDs
 */
export async function batchComplaintQueries(
  complaintIds: string[],
  queryFn: (ids: string[]) => Promise<any[]>
): Promise<any[]> {
  return globalBatchOptimizer.batchRequest(
    'complaints-by-ids',
    complaintIds,
    async (batches: string[][]) => {
      // Flatten all IDs from all batches
      const allIds = batches.flat();
      const results = await queryFn(allIds);

      // Return results in the same order as requested
      return batches.map((batchIds) =>
        batchIds.map((id) => results.find((result) => result.id === id))
      );
    }
  );
}

/**
 * Batch user queries by IDs
 */
export async function batchUserQueries(
  userIds: string[],
  queryFn: (ids: string[]) => Promise<any[]>
): Promise<any[]> {
  return globalBatchOptimizer.batchRequest('users-by-ids', userIds, async (batches: string[][]) => {
    const allIds = batches.flat();
    const results = await queryFn(allIds);

    return batches.map((batchIds) =>
      batchIds.map((id) => results.find((result) => result.id === id))
    );
  });
}

/**
 * Batch notification queries by user IDs
 */
export async function batchNotificationQueries(
  userIds: string[],
  queryFn: (ids: string[]) => Promise<any[]>
): Promise<any[]> {
  return globalBatchOptimizer.batchRequest(
    'notifications-by-user-ids',
    userIds,
    async (batches: string[][]) => {
      const allIds = batches.flat();
      const results = await queryFn(allIds);

      return batches.map((batchIds) =>
        batchIds.map((id) => results.filter((result) => result.user_id === id))
      );
    }
  );
}

/**
 * Create a batch executor for generic ID-based queries
 */
export function createBatchExecutor<T extends { id: string }>(
  queryFn: (ids: string[]) => Promise<T[]>
): BatchExecutor<string, T | undefined> {
  return async (batches: string[][]) => {
    const allIds = batches.flat();
    const results = await queryFn(allIds);

    return batches
      .map((batchIds) => batchIds.map((id) => results.find((result) => result.id === id)))
      .flat();
  };
}

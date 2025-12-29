/**
 * Request parallelization system for API optimization
 *
 * Provides intelligent parallel execution of independent API calls,
 * dependency-aware request scheduling, and optimized multi-call operations.
 */

import type { RequestOptions } from './types';

/**
 * Configuration for request parallelization
 */
export interface ParallelizationConfig {
  /** Enable/disable parallelization */
  enabled: boolean;
  /** Maximum number of concurrent requests */
  maxConcurrency: number;
  /** Timeout for individual requests (ms) */
  requestTimeout: number;
  /** Enable dependency-aware scheduling */
  dependencyAware: boolean;
  /** Batch size for grouped operations */
  batchSize: number;
  /** Enable request prioritization */
  prioritization: boolean;
}

/**
 * Request dependency definition
 */
export interface RequestDependency {
  /** Request identifier */
  id: string;
  /** Dependencies that must complete first */
  dependsOn: string[];
  /** Priority level (higher = more important) */
  priority: number;
}

/**
 * Parallel request definition
 */
export interface ParallelRequest<T = any> {
  /** Unique identifier */
  id: string;
  /** Request function */
  requestFn: () => Promise<T>;
  /** Dependencies */
  dependencies: string[];
  /** Priority level */
  priority: number;
  /** Timeout override */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Request execution result
 */
export interface RequestResult<T = any> {
  /** Request ID */
  id: string;
  /** Success status */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error (if failed) */
  error?: Error;
  /** Execution time (ms) */
  executionTime: number;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
}

/**
 * Parallelization statistics
 */
export interface ParallelizationStats {
  /** Total requests processed */
  totalRequests: number;
  /** Successful requests */
  successfulRequests: number;
  /** Failed requests */
  failedRequests: number;
  /** Average execution time (ms) */
  averageExecutionTime: number;
  /** Concurrency utilization (%) */
  concurrencyUtilization: number;
  /** Dependency resolution efficiency (%) */
  dependencyEfficiency: number;
  /** Total time saved through parallelization (ms) */
  timeSaved: number;
}

/**
 * Request parallelization manager
 */
export class RequestParallelizer {
  private config: ParallelizationConfig;
  private activeRequests = new Map<string, Promise<any>>();
  private completedRequests = new Map<string, RequestResult>();
  private requestQueue: ParallelRequest[] = [];
  private stats: ParallelizationStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageExecutionTime: 0,
    concurrencyUtilization: 0,
    dependencyEfficiency: 0,
    timeSaved: 0,
  };

  constructor(config: Partial<ParallelizationConfig> = {}) {
    this.config = {
      enabled: true,
      maxConcurrency: 6,
      requestTimeout: 30000,
      dependencyAware: true,
      batchSize: 10,
      prioritization: true,
      ...config,
    };
  }

  /**
   * Execute multiple requests in parallel with dependency resolution
   */
  async executeParallel<T extends Record<string, any>>(
    requests: Record<keyof T, ParallelRequest>
  ): Promise<Record<keyof T, RequestResult>> {
    if (!this.config.enabled) {
      return this.executeSequential(requests);
    }

    const requestArray = Object.entries(requests).map(([key, request]) => ({
      ...request,
      id: key as string,
    }));

    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(requestArray);

    // Execute with dependency resolution
    const results = await this.executeDependencyAware(dependencyGraph);

    // Convert back to object format
    const resultObject = {} as Record<keyof T, RequestResult>;
    for (const [key] of Object.entries(requests)) {
      resultObject[key as keyof T] = results.get(key) || {
        id: key,
        success: false,
        error: new Error('Request not executed'),
        executionTime: 0,
        startTime: Date.now(),
        endTime: Date.now(),
      };
    }

    return resultObject;
  }

  /**
   * Execute requests using Promise.all for independent operations
   */
  async executeAll<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    if (!this.config.enabled || requests.length <= 1) {
      // Execute sequentially if parallelization disabled or single request
      const results: T[] = [];
      for (const request of requests) {
        results.push(await request());
      }
      return results;
    }

    const startTime = Date.now();
    this.stats.totalRequests += requests.length;

    try {
      // Execute all requests in parallel
      const results = await Promise.all(
        requests.map(async (request, index) => {
          const requestStartTime = Date.now();

          try {
            const result = await this.executeWithTimeout(request, this.config.requestTimeout);

            const executionTime = Date.now() - requestStartTime;
            this.updateExecutionTimeStats(executionTime);
            this.stats.successfulRequests++;

            return result;
          } catch (error) {
            this.stats.failedRequests++;
            throw error;
          }
        })
      );

      // Calculate time saved
      const parallelTime = Date.now() - startTime;
      const estimatedSequentialTime = this.estimateSequentialTime(requests.length);
      this.stats.timeSaved += Math.max(0, estimatedSequentialTime - parallelTime);

      return results;
    } catch (error) {
      console.error('Parallel execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute requests with intelligent batching
   */
  async executeBatched<T>(requests: Array<() => Promise<T>>, batchSize?: number): Promise<T[]> {
    const effectiveBatchSize = batchSize || this.config.batchSize;
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += effectiveBatchSize) {
      const batch = requests.slice(i, i + effectiveBatchSize);
      const batchResults = await this.executeAll(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Execute requests with priority-based scheduling
   */
  async executePrioritized<T>(
    requests: Array<ParallelRequest<T>>
  ): Promise<Map<string, RequestResult<T>>> {
    if (!this.config.prioritization) {
      return this.executeSimpleParallel(requests);
    }

    // Sort by priority (higher first)
    const sortedRequests = [...requests].sort((a, b) => b.priority - a.priority);

    const results = new Map<string, RequestResult<T>>();
    const semaphore = new Semaphore(this.config.maxConcurrency);

    // Execute with priority-based concurrency control
    await Promise.all(
      sortedRequests.map(async (request) => {
        await semaphore.acquire();

        try {
          const result = await this.executeRequest(request);
          results.set(request.id, result);
        } finally {
          semaphore.release();
        }
      })
    );

    return results;
  }

  /**
   * Create optimized multi-call operation
   */
  createMultiCall<T extends Record<string, any>>(operations: Record<keyof T, () => Promise<any>>) {
    return {
      /**
       * Execute all operations in parallel
       */
      executeAll: async (): Promise<T> => {
        const requests = Object.entries(operations).map(([key, fn]) => ({
          id: key,
          requestFn: fn,
          dependencies: [],
          priority: 1,
        }));

        const results = await this.executeSimpleParallel(requests);

        const output = {} as T;
        for (const [key] of Object.entries(operations)) {
          const result = results.get(key);
          if (result?.success) {
            output[key as keyof T] = result.data;
          } else {
            throw result?.error || new Error(`Operation ${key} failed`);
          }
        }

        return output;
      },

      /**
       * Execute with dependency resolution
       */
      executeWithDependencies: async (dependencies: Record<keyof T, string[]>): Promise<T> => {
        const requests = Object.entries(operations).map(([key, fn]) => ({
          id: key,
          requestFn: fn,
          dependencies: dependencies[key as keyof T] || [],
          priority: 1,
        }));

        const dependencyGraph = this.buildDependencyGraph(requests);
        const results = await this.executeDependencyAware(dependencyGraph);

        const output = {} as T;
        for (const [key] of Object.entries(operations)) {
          const result = results.get(key);
          if (result?.success) {
            output[key as keyof T] = result.data;
          } else {
            throw result?.error || new Error(`Operation ${key} failed`);
          }
        }

        return output;
      },

      /**
       * Execute with custom priorities
       */
      executeWithPriorities: async (priorities: Record<keyof T, number>): Promise<T> => {
        const requests = Object.entries(operations).map(([key, fn]) => ({
          id: key,
          requestFn: fn,
          dependencies: [],
          priority: priorities[key as keyof T] || 1,
        }));

        const results = await this.executePrioritized(requests);

        const output = {} as T;
        for (const [key] of Object.entries(operations)) {
          const result = results.get(key);
          if (result?.success) {
            output[key as keyof T] = result.data;
          } else {
            throw result?.error || new Error(`Operation ${key} failed`);
          }
        }

        return output;
      },
    };
  }

  /**
   * Get parallelization statistics
   */
  getStats(): ParallelizationStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageExecutionTime: 0,
      concurrencyUtilization: 0,
      dependencyEfficiency: 0,
      timeSaved: 0,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ParallelizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Build dependency graph from requests
   */
  private buildDependencyGraph<T>(requests: ParallelRequest<T>[]): Map<string, ParallelRequest<T>> {
    const graph = new Map<string, ParallelRequest<T>>();

    for (const request of requests) {
      graph.set(request.id, request);
    }

    return graph;
  }

  /**
   * Execute requests with dependency awareness
   */
  private async executeDependencyAware<T>(
    dependencyGraph: Map<string, ParallelRequest<T>>
  ): Promise<Map<string, RequestResult<T>>> {
    const results = new Map<string, RequestResult<T>>();
    const inProgress = new Set<string>();
    const completed = new Set<string>();

    const executeRequest = async (requestId: string): Promise<void> => {
      if (completed.has(requestId) || inProgress.has(requestId)) {
        return;
      }

      const request = dependencyGraph.get(requestId);
      if (!request) {
        throw new Error(`Request ${requestId} not found`);
      }

      // Wait for dependencies
      for (const depId of request.dependencies) {
        if (!completed.has(depId)) {
          await executeRequest(depId);
        }
      }

      inProgress.add(requestId);

      try {
        const result = await this.executeRequest(request);
        results.set(requestId, result);
        completed.add(requestId);
      } catch (error) {
        const result: RequestResult<T> = {
          id: requestId,
          success: false,
          error: error as Error,
          executionTime: 0,
          startTime: Date.now(),
          endTime: Date.now(),
        };
        results.set(requestId, result);
        completed.add(requestId);
      } finally {
        inProgress.delete(requestId);
      }
    };

    // Execute all requests
    await Promise.all(Array.from(dependencyGraph.keys()).map(executeRequest));

    return results;
  }

  /**
   * Execute a single request with monitoring
   */
  private async executeRequest<T>(request: ParallelRequest<T>): Promise<RequestResult<T>> {
    const startTime = Date.now();

    try {
      const timeout = request.timeout || this.config.requestTimeout;
      const data = await this.executeWithTimeout(request.requestFn, timeout);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.updateExecutionTimeStats(executionTime);
      this.stats.successfulRequests++;

      return {
        id: request.id,
        success: true,
        data,
        executionTime,
        startTime,
        endTime,
      };
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.stats.failedRequests++;

      return {
        id: request.id,
        success: false,
        error: error as Error,
        executionTime,
        startTime,
        endTime,
      };
    }
  }

  /**
   * Execute simple parallel requests without dependencies
   */
  private async executeSimpleParallel<T>(
    requests: ParallelRequest<T>[]
  ): Promise<Map<string, RequestResult<T>>> {
    const results = new Map<string, RequestResult<T>>();

    await Promise.all(
      requests.map(async (request) => {
        const result = await this.executeRequest(request);
        results.set(request.id, result);
      })
    );

    return results;
  }

  /**
   * Execute sequential fallback
   */
  private async executeSequential<T extends Record<string, any>>(
    requests: Record<keyof T, ParallelRequest>
  ): Promise<Record<keyof T, RequestResult>> {
    const results = {} as Record<keyof T, RequestResult>;

    for (const [key, request] of Object.entries(requests)) {
      const result = await this.executeRequest(request as ParallelRequest);
      results[key as keyof T] = result;
    }

    return results;
  }

  /**
   * Execute request with timeout
   */
  private async executeWithTimeout<T>(requestFn: () => Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      requestFn()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  /**
   * Update execution time statistics
   */
  private updateExecutionTimeStats(executionTime: number): void {
    if (this.stats.successfulRequests === 1) {
      this.stats.averageExecutionTime = executionTime;
    } else {
      const total =
        this.stats.averageExecutionTime * (this.stats.successfulRequests - 1) + executionTime;
      this.stats.averageExecutionTime = total / this.stats.successfulRequests;
    }
  }

  /**
   * Estimate sequential execution time
   */
  private estimateSequentialTime(requestCount: number): number {
    return requestCount * this.stats.averageExecutionTime;
  }
}

/**
 * Semaphore for concurrency control
 */
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      resolve();
    } else {
      this.permits++;
    }
  }
}

/**
 * Global request parallelizer instance
 */
export const globalParallelizer = new RequestParallelizer();

/**
 * Utility functions for common parallel operations
 */

/**
 * Execute multiple API calls in parallel
 */
export async function parallelApiCalls<T extends Record<string, any>>(
  calls: Record<keyof T, () => Promise<any>>
): Promise<T> {
  const multiCall = globalParallelizer.createMultiCall(calls);
  return multiCall.executeAll();
}

/**
 * Execute API calls with dependencies
 */
export async function parallelApiCallsWithDeps<T extends Record<string, any>>(
  calls: Record<keyof T, () => Promise<any>>,
  dependencies: Record<keyof T, string[]>
): Promise<T> {
  const multiCall = globalParallelizer.createMultiCall(calls);
  return multiCall.executeWithDependencies(dependencies);
}

/**
 * Batch multiple similar operations
 */
export async function batchOperations<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const operations = items.map((item) => () => operation(item));
  return globalParallelizer.executeBatched(operations, batchSize);
}

/**
 * Execute with automatic retry and parallelization
 */
export async function parallelWithRetry<T>(
  operations: Array<() => Promise<T>>,
  retryConfig: { attempts: number; delay: number } = { attempts: 3, delay: 1000 }
): Promise<T[]> {
  const requests: ParallelRequest<T>[] = operations.map((op, index) => ({
    id: `operation-${index}`,
    requestFn: op,
    dependencies: [],
    priority: 1,
    retry: retryConfig,
  }));

  const results = await globalParallelizer.executePrioritized(requests);

  return Array.from(results.values()).map((result) => {
    if (result.success) {
      return result.data!;
    } else {
      throw result.error;
    }
  });
}

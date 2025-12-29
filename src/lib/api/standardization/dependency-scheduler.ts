/**
 * Dependency-aware request scheduler for optimized API execution
 *
 * Provides intelligent scheduling of API requests based on dependencies,
 * resource constraints, and performance characteristics.
 */

import type { ParallelRequest, RequestResult } from './request-parallelizer';

/**
 * Scheduler configuration
 */
export interface SchedulerConfig {
  /** Maximum concurrent requests */
  maxConcurrency: number;
  /** Enable priority-based scheduling */
  priorityScheduling: boolean;
  /** Enable resource-aware scheduling */
  resourceAware: boolean;
  /** Scheduling algorithm */
  algorithm: 'fifo' | 'priority' | 'shortest-job-first' | 'dependency-first';
  /** Enable adaptive scheduling */
  adaptive: boolean;
}

/**
 * Resource constraints
 */
export interface ResourceConstraints {
  /** Maximum memory usage (bytes) */
  maxMemory: number;
  /** Maximum CPU usage (%) */
  maxCpu: number;
  /** Maximum network bandwidth (bytes/sec) */
  maxBandwidth: number;
  /** Current resource usage */
  current: {
    memory: number;
    cpu: number;
    bandwidth: number;
  };
}

/**
 * Scheduling decision
 */
export interface SchedulingDecision {
  /** Request to execute */
  request: ParallelRequest;
  /** Estimated start time */
  estimatedStartTime: number;
  /** Estimated completion time */
  estimatedCompletionTime: number;
  /** Resource allocation */
  resourceAllocation: {
    memory: number;
    cpu: number;
    bandwidth: number;
  };
  /** Scheduling reason */
  reason: string;
}

/**
 * Scheduler statistics
 */
export interface SchedulerStats {
  /** Total requests scheduled */
  totalScheduled: number;
  /** Average wait time (ms) */
  averageWaitTime: number;
  /** Average execution time (ms) */
  averageExecutionTime: number;
  /** Resource utilization efficiency (%) */
  resourceUtilization: number;
  /** Dependency resolution efficiency (%) */
  dependencyEfficiency: number;
  /** Scheduling overhead (ms) */
  schedulingOverhead: number;
}

/**
 * Request execution context
 */
interface ExecutionContext {
  /** Request being executed */
  request: ParallelRequest;
  /** Start time */
  startTime: number;
  /** Estimated completion time */
  estimatedCompletion: number;
  /** Resource usage */
  resourceUsage: {
    memory: number;
    cpu: number;
    bandwidth: number;
  };
  /** Promise for completion */
  promise: Promise<RequestResult>;
  /** Resolve function */
  resolve: (result: RequestResult) => void;
  /** Reject function */
  reject: (error: Error) => void;
}

/**
 * Dependency-aware request scheduler
 */
export class DependencyScheduler {
  private config: SchedulerConfig;
  private requestQueue: ParallelRequest[] = [];
  private executionQueue: ExecutionContext[] = [];
  private completedRequests = new Map<string, RequestResult>();
  private dependencyGraph = new Map<string, Set<string>>();
  private reverseDependencyGraph = new Map<string, Set<string>>();
  private resourceConstraints: ResourceConstraints;
  private stats: SchedulerStats = {
    totalScheduled: 0,
    averageWaitTime: 0,
    averageExecutionTime: 0,
    resourceUtilization: 0,
    dependencyEfficiency: 0,
    schedulingOverhead: 0,
  };

  constructor(
    config: Partial<SchedulerConfig> = {},
    resourceConstraints?: Partial<ResourceConstraints>
  ) {
    this.config = {
      maxConcurrency: 6,
      priorityScheduling: true,
      resourceAware: true,
      algorithm: 'dependency-first',
      adaptive: true,
      ...config,
    };

    this.resourceConstraints = {
      maxMemory: 100 * 1024 * 1024, // 100MB
      maxCpu: 80, // 80%
      maxBandwidth: 10 * 1024 * 1024, // 10MB/s
      current: {
        memory: 0,
        cpu: 0,
        bandwidth: 0,
      },
      ...resourceConstraints,
    };

    // Start scheduler loop
    this.startSchedulerLoop();
  }

  /**
   * Schedule a request for execution
   */
  async scheduleRequest<T>(request: ParallelRequest<T>): Promise<RequestResult<T>> {
    const schedulingStartTime = Date.now();

    // Build dependency graph
    this.updateDependencyGraph(request);

    // Add to queue
    this.requestQueue.push(request);
    this.stats.totalScheduled++;

    // Create promise for completion
    return new Promise<RequestResult<T>>((resolve, reject) => {
      const context: ExecutionContext = {
        request,
        startTime: 0,
        estimatedCompletion: 0,
        resourceUsage: this.estimateResourceUsage(request),
        promise: Promise.resolve({} as RequestResult),
        resolve: resolve as (result: RequestResult) => void,
        reject,
      };

      // Update scheduling overhead
      const schedulingTime = Date.now() - schedulingStartTime;
      this.updateSchedulingOverhead(schedulingTime);

      // The scheduler loop will pick this up
    });
  }

  /**
   * Schedule multiple requests with dependency resolution
   */
  async scheduleMultiple<T>(
    requests: ParallelRequest<T>[]
  ): Promise<Map<string, RequestResult<T>>> {
    const results = new Map<string, RequestResult<T>>();

    // Schedule all requests
    const promises = requests.map(async (request) => {
      const result = await this.scheduleRequest(request);
      results.set(request.id, result);
      return result;
    });

    // Wait for all to complete
    await Promise.all(promises);

    return results;
  }

  /**
   * Get next request to execute based on scheduling algorithm
   */
  private getNextRequest(): ParallelRequest | null {
    if (this.requestQueue.length === 0) return null;

    // Check if we can execute more requests
    if (this.executionQueue.length >= this.config.maxConcurrency) return null;

    // Filter requests that have all dependencies satisfied
    const readyRequests = this.requestQueue.filter((request) =>
      this.areDependenciesSatisfied(request)
    );

    if (readyRequests.length === 0) return null;

    let selectedRequest: ParallelRequest;

    switch (this.config.algorithm) {
      case 'priority':
        selectedRequest = this.selectByPriority(readyRequests);
        break;
      case 'shortest-job-first':
        selectedRequest = this.selectByEstimatedTime(readyRequests);
        break;
      case 'dependency-first':
        selectedRequest = this.selectByDependencyCount(readyRequests);
        break;
      case 'fifo':
      default:
        selectedRequest = readyRequests[0];
        break;
    }

    // Check resource constraints
    if (this.config.resourceAware && !this.canAllocateResources(selectedRequest)) {
      return null;
    }

    // Remove from queue
    const index = this.requestQueue.indexOf(selectedRequest);
    if (index > -1) {
      this.requestQueue.splice(index, 1);
    }

    return selectedRequest;
  }

  /**
   * Execute a request
   */
  private async executeRequest(request: ParallelRequest): Promise<RequestResult> {
    const startTime = Date.now();

    // Allocate resources
    this.allocateResources(request);

    try {
      // Execute the request
      const data = await request.requestFn();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      const result: RequestResult = {
        id: request.id,
        success: true,
        data,
        executionTime,
        startTime,
        endTime,
      };

      // Update statistics
      this.updateExecutionStats(executionTime);

      // Mark as completed
      this.completedRequests.set(request.id, result);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      const result: RequestResult = {
        id: request.id,
        success: false,
        error: error as Error,
        executionTime,
        startTime,
        endTime,
      };

      this.completedRequests.set(request.id, result);
      return result;
    } finally {
      // Release resources
      this.releaseResources(request);
    }
  }

  /**
   * Check if all dependencies are satisfied
   */
  private areDependenciesSatisfied(request: ParallelRequest): boolean {
    return request.dependencies.every(
      (depId) => this.completedRequests.has(depId) && this.completedRequests.get(depId)?.success
    );
  }

  /**
   * Select request by priority
   */
  private selectByPriority(requests: ParallelRequest[]): ParallelRequest {
    return requests.reduce((highest, current) =>
      current.priority > highest.priority ? current : highest
    );
  }

  /**
   * Select request by estimated execution time (shortest first)
   */
  private selectByEstimatedTime(requests: ParallelRequest[]): ParallelRequest {
    return requests.reduce((shortest, current) => {
      const currentEstimate = this.estimateExecutionTime(current);
      const shortestEstimate = this.estimateExecutionTime(shortest);
      return currentEstimate < shortestEstimate ? current : shortest;
    });
  }

  /**
   * Select request by dependency count (fewer dependents first)
   */
  private selectByDependencyCount(requests: ParallelRequest[]): ParallelRequest {
    return requests.reduce((fewest, current) => {
      const currentDependents = this.reverseDependencyGraph.get(current.id)?.size || 0;
      const fewestDependents = this.reverseDependencyGraph.get(fewest.id)?.size || 0;
      return currentDependents < fewestDependents ? current : fewest;
    });
  }

  /**
   * Check if resources can be allocated for request
   */
  private canAllocateResources(request: ParallelRequest): boolean {
    const estimated = this.estimateResourceUsage(request);
    const current = this.resourceConstraints.current;
    const max = this.resourceConstraints;

    return (
      current.memory + estimated.memory <= max.maxMemory &&
      current.cpu + estimated.cpu <= max.maxCpu &&
      current.bandwidth + estimated.bandwidth <= max.maxBandwidth
    );
  }

  /**
   * Allocate resources for request
   */
  private allocateResources(request: ParallelRequest): void {
    const usage = this.estimateResourceUsage(request);
    this.resourceConstraints.current.memory += usage.memory;
    this.resourceConstraints.current.cpu += usage.cpu;
    this.resourceConstraints.current.bandwidth += usage.bandwidth;
  }

  /**
   * Release resources after request completion
   */
  private releaseResources(request: ParallelRequest): void {
    const usage = this.estimateResourceUsage(request);
    this.resourceConstraints.current.memory -= usage.memory;
    this.resourceConstraints.current.cpu -= usage.cpu;
    this.resourceConstraints.current.bandwidth -= usage.bandwidth;

    // Ensure non-negative values
    this.resourceConstraints.current.memory = Math.max(0, this.resourceConstraints.current.memory);
    this.resourceConstraints.current.cpu = Math.max(0, this.resourceConstraints.current.cpu);
    this.resourceConstraints.current.bandwidth = Math.max(
      0,
      this.resourceConstraints.current.bandwidth
    );
  }

  /**
   * Estimate resource usage for a request
   */
  private estimateResourceUsage(request: ParallelRequest): {
    memory: number;
    cpu: number;
    bandwidth: number;
  } {
    // This is a simplified estimation - in practice, you might use
    // historical data or request metadata to make better estimates
    return {
      memory: 1024 * 1024, // 1MB
      cpu: 10, // 10%
      bandwidth: 100 * 1024, // 100KB/s
    };
  }

  /**
   * Estimate execution time for a request
   */
  private estimateExecutionTime(request: ParallelRequest): number {
    // Use historical data or default estimate
    return this.stats.averageExecutionTime || 1000; // 1 second default
  }

  /**
   * Update dependency graph
   */
  private updateDependencyGraph(request: ParallelRequest): void {
    // Forward dependencies
    if (!this.dependencyGraph.has(request.id)) {
      this.dependencyGraph.set(request.id, new Set());
    }

    for (const depId of request.dependencies) {
      this.dependencyGraph.get(request.id)!.add(depId);

      // Reverse dependencies
      if (!this.reverseDependencyGraph.has(depId)) {
        this.reverseDependencyGraph.set(depId, new Set());
      }
      this.reverseDependencyGraph.get(depId)!.add(request.id);
    }
  }

  /**
   * Start the scheduler loop
   */
  private startSchedulerLoop(): void {
    const scheduleNext = async () => {
      const request = this.getNextRequest();

      if (request) {
        // Create execution context
        const context: ExecutionContext = {
          request,
          startTime: Date.now(),
          estimatedCompletion: Date.now() + this.estimateExecutionTime(request),
          resourceUsage: this.estimateResourceUsage(request),
          promise: this.executeRequest(request),
          resolve: () => {},
          reject: () => {},
        };

        this.executionQueue.push(context);

        // Execute and handle completion
        context.promise
          .then((result) => {
            // Remove from execution queue
            const index = this.executionQueue.indexOf(context);
            if (index > -1) {
              this.executionQueue.splice(index, 1);
            }
          })
          .catch((error) => {
            // Handle error and remove from queue
            const index = this.executionQueue.indexOf(context);
            if (index > -1) {
              this.executionQueue.splice(index, 1);
            }
          });
      }

      // Schedule next iteration
      setTimeout(scheduleNext, 10); // Check every 10ms
    };

    scheduleNext();
  }

  /**
   * Update execution statistics
   */
  private updateExecutionStats(executionTime: number): void {
    if (this.stats.totalScheduled === 1) {
      this.stats.averageExecutionTime = executionTime;
    } else {
      const total =
        this.stats.averageExecutionTime * (this.stats.totalScheduled - 1) + executionTime;
      this.stats.averageExecutionTime = total / this.stats.totalScheduled;
    }
  }

  /**
   * Update scheduling overhead
   */
  private updateSchedulingOverhead(overhead: number): void {
    if (this.stats.totalScheduled === 1) {
      this.stats.schedulingOverhead = overhead;
    } else {
      const total = this.stats.schedulingOverhead * (this.stats.totalScheduled - 1) + overhead;
      this.stats.schedulingOverhead = total / this.stats.totalScheduled;
    }
  }

  /**
   * Get scheduler statistics
   */
  getStats(): SchedulerStats {
    return { ...this.stats };
  }

  /**
   * Get current resource usage
   */
  getResourceUsage(): ResourceConstraints {
    return { ...this.resourceConstraints };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear all queues and reset state
   */
  clear(): void {
    this.requestQueue.length = 0;
    this.executionQueue.length = 0;
    this.completedRequests.clear();
    this.dependencyGraph.clear();
    this.reverseDependencyGraph.clear();
    this.resourceConstraints.current = { memory: 0, cpu: 0, bandwidth: 0 };
  }
}

/**
 * Global dependency scheduler instance
 */
export const globalScheduler = new DependencyScheduler();

/**
 * Utility functions for dependency-aware scheduling
 */

/**
 * Create a dependency chain for sequential operations
 */
export function createDependencyChain<T>(
  operations: Array<{ id: string; fn: () => Promise<T> }>
): ParallelRequest<T>[] {
  return operations.map((op, index) => ({
    id: op.id,
    requestFn: op.fn,
    dependencies: index > 0 ? [operations[index - 1].id] : [],
    priority: operations.length - index, // Earlier operations have higher priority
  }));
}

/**
 * Create parallel branches with a common dependency
 */
export function createParallelBranches<T>(
  commonDependency: string,
  branches: Array<{ id: string; fn: () => Promise<T> }>
): ParallelRequest<T>[] {
  return branches.map((branch) => ({
    id: branch.id,
    requestFn: branch.fn,
    dependencies: [commonDependency],
    priority: 1,
  }));
}

/**
 * Schedule requests with automatic dependency resolution
 */
export async function scheduleWithDependencies<T>(
  requests: ParallelRequest<T>[]
): Promise<Map<string, RequestResult<T>>> {
  return globalScheduler.scheduleMultiple(requests);
}

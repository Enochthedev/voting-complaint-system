/**
 * Performance optimization integration layer
 *
 * Integrates all performance optimization systems into a cohesive solution
 * for the complaint system API layer.
 */

import { QueryClient } from '@tanstack/react-query';
import {
  IntelligentPrefetcher,
  initializePrefetcher,
  getPrefetcher,
} from './intelligent-prefetcher';
import { ResponseCompression, globalCompression } from './response-compression';
import { RequestParallelizer, globalParallelizer } from './request-parallelizer';
import { DependencyScheduler, globalScheduler } from './dependency-scheduler';
import {
  PerformanceValidator,
  globalPerformanceValidator,
  measureApiCall,
} from './performance-validator';
import { EnhancedCacheManager, globalCacheManager } from './enhanced-cache';

/**
 * Performance optimization configuration
 */
export interface PerformanceOptimizationConfig {
  /** Enable intelligent prefetching */
  prefetching: {
    enabled: boolean;
    maxConcurrentPrefetches: number;
    confidenceThreshold: number;
  };
  /** Enable response compression */
  compression: {
    enabled: boolean;
    threshold: number;
    algorithm: 'gzip' | 'deflate' | 'brotli';
  };
  /** Enable request parallelization */
  parallelization: {
    enabled: boolean;
    maxConcurrency: number;
    dependencyAware: boolean;
  };
  /** Enable performance monitoring */
  monitoring: {
    enabled: boolean;
    realTimeValidation: boolean;
    benchmarking: boolean;
  };
  /** Enhanced caching configuration */
  caching: {
    intelligentGC: boolean;
    persistentStorage: boolean;
    maxAge: number;
  };
}

/**
 * Performance optimization statistics
 */
export interface PerformanceOptimizationStats {
  /** Prefetching statistics */
  prefetching: {
    totalPrefetches: number;
    hitRate: number;
    timeSaved: number;
  };
  /** Compression statistics */
  compression: {
    compressionRatio: number;
    bytesSaved: number;
    averageCompressionTime: number;
  };
  /** Parallelization statistics */
  parallelization: {
    concurrencyUtilization: number;
    timeSaved: number;
    successRate: number;
  };
  /** Cache statistics */
  cache: {
    hitRate: number;
    memoryUsage: number;
    gcCount: number;
  };
  /** Overall performance score */
  overallScore: number;
}

/**
 * Performance optimization manager
 */
export class PerformanceOptimizationManager {
  private config: PerformanceOptimizationConfig;
  private queryClient: QueryClient;
  private prefetcher?: IntelligentPrefetcher;
  private compression!: ResponseCompression;
  private parallelizer!: RequestParallelizer;
  private scheduler!: DependencyScheduler;
  private validator!: PerformanceValidator;
  private cacheManager!: EnhancedCacheManager;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(queryClient: QueryClient, config: Partial<PerformanceOptimizationConfig> = {}) {
    this.queryClient = queryClient;
    this.config = {
      prefetching: {
        enabled: true,
        maxConcurrentPrefetches: 3,
        confidenceThreshold: 0.7,
      },
      compression: {
        enabled: true,
        threshold: 1024,
        algorithm: 'gzip',
      },
      parallelization: {
        enabled: true,
        maxConcurrency: 6,
        dependencyAware: true,
      },
      monitoring: {
        enabled: true,
        realTimeValidation: true,
        benchmarking: true,
      },
      caching: {
        intelligentGC: true,
        persistentStorage: true,
        maxAge: 5 * 60 * 1000,
      },
      ...config,
    };

    this.initializeOptimizations();
  }

  /**
   * Initialize all optimization systems
   */
  private initializeOptimizations(): void {
    // Initialize prefetcher
    if (this.config.prefetching.enabled) {
      initializePrefetcher(this.queryClient, {
        enabled: true,
        maxConcurrentPrefetches: this.config.prefetching.maxConcurrentPrefetches,
        confidenceThreshold: this.config.prefetching.confidenceThreshold,
      });
      this.prefetcher = getPrefetcher();
    }

    // Initialize compression
    this.compression = globalCompression;
    this.compression.updateConfig({
      enabled: this.config.compression.enabled,
      threshold: this.config.compression.threshold,
      algorithm: this.config.compression.algorithm,
    });

    // Initialize parallelizer
    this.parallelizer = globalParallelizer;
    this.parallelizer.updateConfig({
      enabled: this.config.parallelization.enabled,
      maxConcurrency: this.config.parallelization.maxConcurrency,
      dependencyAware: this.config.parallelization.dependencyAware,
    });

    // Initialize scheduler
    this.scheduler = globalScheduler;

    // Initialize validator
    this.validator = globalPerformanceValidator;

    // Initialize cache manager
    this.cacheManager = globalCacheManager;
    this.cacheManager.updateConfig({
      intelligentGC: this.config.caching.intelligentGC,
      persistentStorage: this.config.caching.persistentStorage,
      maxAge: this.config.caching.maxAge,
    });

    // Start real-time monitoring
    if (this.config.monitoring.enabled && this.config.monitoring.realTimeValidation) {
      this.startRealTimeMonitoring();
    }
  }

  /**
   * Optimize API call with all available optimizations
   */
  async optimizeApiCall<T>(
    operation: string,
    apiCall: () => Promise<T>,
    options: {
      enablePrefetch?: boolean;
      enableCompression?: boolean;
      enableParallelization?: boolean;
      priority?: number;
      dependencies?: string[];
    } = {}
  ): Promise<T> {
    const {
      enablePrefetch = true,
      enableCompression = true,
      enableParallelization = true,
      priority = 1,
      dependencies = [],
    } = options;

    // Record access pattern for prefetching
    if (this.prefetcher && enablePrefetch) {
      this.prefetcher.recordAccess(operation);
    }

    // Wrap with performance monitoring
    const monitoredCall = () => measureApiCall(operation, apiCall);

    // Apply parallelization if enabled and has dependencies
    if (enableParallelization && dependencies.length > 0) {
      const request = {
        id: `${operation}-${Date.now()}`,
        requestFn: monitoredCall,
        dependencies,
        priority,
      };

      const result = await this.scheduler.scheduleRequest(request);
      if (result.success) {
        return result.data as T;
      } else {
        throw result.error;
      }
    }

    // Execute with monitoring
    const result = await monitoredCall();

    // Apply compression if enabled and beneficial
    if (enableCompression && this.compression.shouldCompress(result)) {
      const compressed = await this.compression.compressResponse(result);
      if (compressed) {
        // Store compressed version in cache if applicable
        // This would integrate with React Query's cache
      }
    }

    return result;
  }

  /**
   * Optimize multiple API calls with intelligent batching and parallelization
   */
  async optimizeMultipleApiCalls<T extends Record<string, any>>(
    operations: Record<keyof T, () => Promise<any>>,
    dependencies?: Record<keyof T, string[]>
  ): Promise<T> {
    const operationNames = Object.keys(operations) as Array<keyof T>;

    // Record access patterns
    if (this.prefetcher) {
      operationNames.forEach((name) => {
        this.prefetcher!.recordAccess(String(name), dependencies?.[name]?.map(String) || []);
      });
    }

    // Create monitored operations
    const monitoredOperations: Record<keyof T, () => Promise<any>> = {} as any;
    for (const [key, operation] of Object.entries(operations)) {
      monitoredOperations[key as keyof T] = () => measureApiCall(String(key), operation);
    }

    // Execute with parallelization and dependency resolution
    if (dependencies && this.config.parallelization.dependencyAware) {
      const multiCall = this.parallelizer.createMultiCall(monitoredOperations);
      return multiCall.executeWithDependencies(dependencies);
    } else {
      const multiCall = this.parallelizer.createMultiCall(monitoredOperations);
      return multiCall.executeAll();
    }
  }

  /**
   * Prefetch data based on usage patterns
   */
  async prefetchData(
    queryKey: any[],
    queryFn: () => Promise<any>,
    options: { priority?: number; confidence?: number } = {}
  ): Promise<void> {
    if (!this.prefetcher) return;

    await this.prefetcher.prefetch(queryKey, queryFn, options);
  }

  /**
   * Run performance benchmark
   */
  async runBenchmark(
    name: string,
    operation: () => Promise<any>,
    config: {
      iterations?: number;
      concurrency?: number;
      warmupIterations?: number;
    } = {}
  ) {
    if (!this.config.monitoring.benchmarking) {
      throw new Error('Benchmarking is disabled');
    }

    const benchmarkConfig = {
      name,
      iterations: 100,
      concurrency: 10,
      warmupIterations: 10,
      ...config,
    };

    return this.validator.runBenchmark(operation, benchmarkConfig);
  }

  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats(): PerformanceOptimizationStats {
    const prefetchingStats = this.prefetcher?.getStats() || {
      totalPrefetches: 0,
      prefetchHits: 0,
      averagePrefetchTime: 0,
    };

    const compressionStats = this.compression.getStats();
    const parallelizationStats = this.parallelizer.getStats();
    const cacheStats = this.cacheManager.getStats();
    const validationResult = this.validator.validatePerformance();

    // Calculate estimated time saved from prefetching
    const estimatedTimeSaved =
      prefetchingStats.prefetchHits * (prefetchingStats.averagePrefetchTime || 0);

    return {
      prefetching: {
        totalPrefetches: prefetchingStats.totalPrefetches,
        hitRate:
          (prefetchingStats.prefetchHits / Math.max(1, prefetchingStats.totalPrefetches)) * 100,
        timeSaved: estimatedTimeSaved,
      },
      compression: {
        compressionRatio: compressionStats.compressionRatio,
        bytesSaved: compressionStats.bytesSaved,
        averageCompressionTime: compressionStats.averageCompressionTime,
      },
      parallelization: {
        concurrencyUtilization: parallelizationStats.concurrencyUtilization,
        timeSaved: parallelizationStats.timeSaved,
        successRate:
          (parallelizationStats.successfulRequests /
            Math.max(1, parallelizationStats.totalRequests)) *
          100,
      },
      cache: {
        hitRate: cacheStats.hitRate,
        memoryUsage: cacheStats.memoryUsage,
        gcCount: cacheStats.gcCount,
      },
      overallScore: validationResult.score,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PerformanceOptimizationConfig>): void {
    this.config = { ...this.config, ...config };

    // Update individual systems
    if (config.compression) {
      this.compression.updateConfig(config.compression);
    }

    if (config.parallelization) {
      this.parallelizer.updateConfig(config.parallelization);
    }

    if (config.caching) {
      this.cacheManager.updateConfig(config.caching);
    }

    // Restart monitoring if needed
    if (config.monitoring?.realTimeValidation !== undefined) {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = undefined;
      }

      if (config.monitoring.realTimeValidation) {
        this.startRealTimeMonitoring();
      }
    }
  }

  /**
   * Start real-time performance monitoring
   */
  private startRealTimeMonitoring(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      const validation = this.validator.validatePerformance(30000); // 30 second window

      if (!validation.passed) {
        console.warn('Performance targets not met:', validation);

        // Auto-adjust optimizations based on performance
        this.autoOptimize(validation);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Automatically adjust optimizations based on performance
   */
  private autoOptimize(validation: any): void {
    // Increase prefetching if response times are high
    if (!validation.targets.responseTime.passed && this.prefetcher) {
      this.prefetcher.updateConfig({
        maxConcurrentPrefetches: Math.min(6, this.config.prefetching.maxConcurrentPrefetches + 1),
        confidenceThreshold: Math.max(0.5, this.config.prefetching.confidenceThreshold - 0.1),
      });
    }

    // Increase compression threshold if memory usage is high
    if (!validation.targets.memory.passed) {
      this.compression.updateConfig({
        threshold: Math.max(512, this.config.compression.threshold - 256),
      });
    }

    // Adjust parallelization if throughput is low
    if (!validation.targets.throughput.passed) {
      this.parallelizer.updateConfig({
        maxConcurrency: Math.min(10, this.config.parallelization.maxConcurrency + 1),
      });
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.cacheManager.destroy();
    this.validator.clearMeasurements();
    this.parallelizer.resetStats();
    this.compression.resetStats();

    if (this.prefetcher) {
      this.prefetcher.clear();
    }
  }
}

/**
 * Global performance optimization manager
 */
let globalOptimizationManager: PerformanceOptimizationManager | null = null;

/**
 * Initialize global performance optimization
 */
export function initializePerformanceOptimization(
  queryClient: QueryClient,
  config?: Partial<PerformanceOptimizationConfig>
): PerformanceOptimizationManager {
  globalOptimizationManager = new PerformanceOptimizationManager(queryClient, config);
  return globalOptimizationManager;
}

/**
 * Get global optimization manager
 */
export function getOptimizationManager(): PerformanceOptimizationManager {
  if (!globalOptimizationManager) {
    throw new Error(
      'Performance optimization not initialized. Call initializePerformanceOptimization first.'
    );
  }
  return globalOptimizationManager;
}

/**
 * Utility functions for easy integration
 */

/**
 * Optimize complaint API calls
 */
export async function optimizeComplaintApiCall<T>(
  operation: string,
  apiCall: () => Promise<T>,
  options?: {
    priority?: number;
    dependencies?: string[];
  }
): Promise<T> {
  const manager = getOptimizationManager();
  return manager.optimizeApiCall(operation, apiCall, options);
}

/**
 * Optimize multiple complaint operations
 */
export async function optimizeComplaintOperations<T extends Record<string, any>>(
  operations: Record<keyof T, () => Promise<any>>,
  dependencies?: Record<keyof T, string[]>
): Promise<T> {
  const manager = getOptimizationManager();
  return manager.optimizeMultipleApiCalls(operations, dependencies);
}

/**
 * Prefetch complaint data
 */
export async function prefetchComplaintData(
  queryKey: any[],
  queryFn: () => Promise<any>,
  priority: number = 1
): Promise<void> {
  const manager = getOptimizationManager();
  return manager.prefetchData(queryKey, queryFn, { priority, confidence: 0.8 });
}

/**
 * Get performance dashboard data
 */
export function getPerformanceDashboard() {
  const manager = getOptimizationManager();
  const stats = manager.getPerformanceStats();
  const validation = globalPerformanceValidator.validatePerformance();

  return {
    stats,
    validation,
    recommendations: validation.recommendations,
    regressions: validation.regressions,
  };
}

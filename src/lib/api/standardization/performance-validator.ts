/**
 * Performance target validation system for API optimization
 *
 * Provides comprehensive performance monitoring, target validation,
 * regression detection, and benchmarking for API operations.
 */

/**
 * Performance target configuration
 */
export interface PerformanceTargets {
  /** Response time targets (ms) */
  responseTime: {
    /** Target for 50th percentile */
    p50: number;
    /** Target for 95th percentile */
    p95: number;
    /** Target for 99th percentile */
    p99: number;
    /** Maximum acceptable response time */
    max: number;
  };
  /** Throughput targets */
  throughput: {
    /** Requests per second */
    rps: number;
    /** Concurrent requests */
    concurrent: number;
  };
  /** Error rate targets (%) */
  errorRate: {
    /** Maximum error rate */
    max: number;
    /** Target error rate */
    target: number;
  };
  /** Cache performance targets */
  cache: {
    /** Minimum hit rate (%) */
    hitRate: number;
    /** Maximum cache miss penalty (ms) */
    missPenalty: number;
  };
  /** Memory usage targets */
  memory: {
    /** Maximum memory usage (bytes) */
    max: number;
    /** Target memory usage (bytes) */
    target: number;
  };
}

/**
 * Performance measurement
 */
export interface PerformanceMeasurement {
  /** Measurement timestamp */
  timestamp: number;
  /** Operation identifier */
  operation: string;
  /** Response time (ms) */
  responseTime: number;
  /** Success status */
  success: boolean;
  /** Error details (if any) */
  error?: string;
  /** Cache hit status */
  cacheHit?: boolean;
  /** Memory usage (bytes) */
  memoryUsage?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Performance validation result
 */
export interface ValidationResult {
  /** Overall validation status */
  passed: boolean;
  /** Individual target results */
  targets: {
    responseTime: TargetResult;
    throughput: TargetResult;
    errorRate: TargetResult;
    cache: TargetResult;
    memory: TargetResult;
  };
  /** Performance score (0-100) */
  score: number;
  /** Recommendations for improvement */
  recommendations: string[];
  /** Regression detection results */
  regressions: RegressionResult[];
}

/**
 * Individual target validation result
 */
export interface TargetResult {
  /** Target met status */
  passed: boolean;
  /** Current value */
  current: number;
  /** Target value */
  target: number;
  /** Percentage of target achieved */
  percentage: number;
  /** Trend direction */
  trend: 'improving' | 'degrading' | 'stable';
}

/**
 * Regression detection result
 */
export interface RegressionResult {
  /** Regression type */
  type: 'response_time' | 'throughput' | 'error_rate' | 'memory';
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Description */
  description: string;
  /** Current value */
  current: number;
  /** Baseline value */
  baseline: number;
  /** Percentage change */
  change: number;
  /** Confidence level (0-1) */
  confidence: number;
}

/**
 * Benchmark comparison result
 */
export interface BenchmarkResult {
  /** Benchmark name */
  name: string;
  /** Current performance */
  current: PerformanceMetrics;
  /** Baseline performance */
  baseline: PerformanceMetrics;
  /** Comparison result */
  comparison: {
    /** Performance improvement/degradation (%) */
    change: number;
    /** Statistical significance */
    significant: boolean;
    /** Confidence level */
    confidence: number;
  };
}

/**
 * Performance metrics summary
 */
export interface PerformanceMetrics {
  /** Response time statistics */
  responseTime: {
    mean: number;
    median: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    stdDev: number;
  };
  /** Throughput metrics */
  throughput: {
    rps: number;
    concurrent: number;
  };
  /** Error metrics */
  errors: {
    rate: number;
    count: number;
    total: number;
  };
  /** Cache metrics */
  cache: {
    hitRate: number;
    missRate: number;
    avgHitTime: number;
    avgMissTime: number;
  };
  /** Memory metrics */
  memory: {
    usage: number;
    peak: number;
    average: number;
  };
}

/**
 * Performance validator
 */
export class PerformanceValidator {
  private targets: PerformanceTargets;
  private measurements: PerformanceMeasurement[] = [];
  private baselines = new Map<string, PerformanceMetrics>();
  private maxMeasurements: number = 10000;

  constructor(targets: PerformanceTargets) {
    this.targets = targets;
  }

  /**
   * Record a performance measurement
   */
  recordMeasurement(measurement: PerformanceMeasurement): void {
    this.measurements.push(measurement);

    // Limit measurements to prevent memory issues
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
  }

  /**
   * Validate current performance against targets
   */
  validatePerformance(timeWindow?: number): ValidationResult {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const relevantMeasurements = this.measurements.filter((m) => m.timestamp >= windowStart);

    if (relevantMeasurements.length === 0) {
      return this.createEmptyValidationResult();
    }

    const metrics = this.calculateMetrics(relevantMeasurements);

    // Validate individual targets
    const responseTimeResult = this.validateResponseTime(metrics);
    const throughputResult = this.validateThroughput(metrics);
    const errorRateResult = this.validateErrorRate(metrics);
    const cacheResult = this.validateCache(metrics);
    const memoryResult = this.validateMemory(metrics);

    // Calculate overall score
    const score = this.calculateOverallScore([
      responseTimeResult,
      throughputResult,
      errorRateResult,
      cacheResult,
      memoryResult,
    ]);

    // Detect regressions
    const regressions = this.detectRegressions(metrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, [
      responseTimeResult,
      throughputResult,
      errorRateResult,
      cacheResult,
      memoryResult,
    ]);

    return {
      passed: score >= 80, // 80% threshold for passing
      targets: {
        responseTime: responseTimeResult,
        throughput: throughputResult,
        errorRate: errorRateResult,
        cache: cacheResult,
        memory: memoryResult,
      },
      score,
      recommendations,
      regressions,
    };
  }

  /**
   * Run performance benchmark
   */
  async runBenchmark(
    operation: () => Promise<any>,
    config: {
      name: string;
      iterations: number;
      concurrency: number;
      warmupIterations?: number;
    }
  ): Promise<BenchmarkResult> {
    const { name, iterations, concurrency, warmupIterations = 10 } = config;

    // Warmup phase
    for (let i = 0; i < warmupIterations; i++) {
      try {
        await operation();
      } catch (error) {
        // Ignore warmup errors
      }
    }

    // Benchmark phase
    const measurements: PerformanceMeasurement[] = [];
    const startTime = Date.now();

    // Execute concurrent operations
    const batches = Math.ceil(iterations / concurrency);

    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, iterations - batch * concurrency);
      const batchPromises: Promise<void>[] = [];

      for (let i = 0; i < batchSize; i++) {
        batchPromises.push(this.executeBenchmarkOperation(operation, measurements));
      }

      await Promise.all(batchPromises);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Calculate metrics
    const current = this.calculateMetrics(measurements);
    current.throughput.rps = measurements.length / (totalTime / 1000);

    // Compare with baseline
    const baseline = this.baselines.get(name);
    let comparison = {
      change: 0,
      significant: false,
      confidence: 0,
    };

    if (baseline) {
      comparison = this.compareWithBaseline(current, baseline);
    } else {
      // Set as new baseline
      this.baselines.set(name, current);
    }

    return {
      name,
      current,
      baseline: baseline || current,
      comparison,
    };
  }

  /**
   * Monitor performance in real-time
   */
  startRealTimeMonitoring(
    callback: (validation: ValidationResult) => void,
    interval: number = 5000
  ): () => void {
    const intervalId = setInterval(() => {
      const validation = this.validatePerformance(interval * 2); // Use 2x interval as window
      callback(validation);
    }, interval);

    return () => clearInterval(intervalId);
  }

  /**
   * Set performance baseline
   */
  setBaseline(name: string, metrics: PerformanceMetrics): void {
    this.baselines.set(name, metrics);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(timeWindow?: number): PerformanceMetrics {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const relevantMeasurements = this.measurements.filter((m) => m.timestamp >= windowStart);

    return this.calculateMetrics(relevantMeasurements);
  }

  /**
   * Clear measurements
   */
  clearMeasurements(): void {
    this.measurements.length = 0;
  }

  /**
   * Update targets
   */
  updateTargets(targets: Partial<PerformanceTargets>): void {
    this.targets = { ...this.targets, ...targets };
  }

  /**
   * Execute benchmark operation
   */
  private async executeBenchmarkOperation(
    operation: () => Promise<any>,
    measurements: PerformanceMeasurement[]
  ): Promise<void> {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();

    try {
      await operation();

      const endTime = Date.now();
      const endMemory = this.getMemoryUsage();

      measurements.push({
        timestamp: startTime,
        operation: 'benchmark',
        responseTime: endTime - startTime,
        success: true,
        memoryUsage: endMemory - startMemory,
      });
    } catch (error) {
      const endTime = Date.now();

      measurements.push({
        timestamp: startTime,
        operation: 'benchmark',
        responseTime: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Calculate performance metrics from measurements
   */
  private calculateMetrics(measurements: PerformanceMeasurement[]): PerformanceMetrics {
    if (measurements.length === 0) {
      return this.createEmptyMetrics();
    }

    // Response time calculations
    const responseTimes = measurements.map((m) => m.responseTime).sort((a, b) => a - b);
    const mean = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const median = responseTimes[Math.floor(responseTimes.length / 2)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
    const min = responseTimes[0];
    const max = responseTimes[responseTimes.length - 1];
    const variance =
      responseTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / responseTimes.length;
    const stdDev = Math.sqrt(variance);

    // Error calculations
    const errors = measurements.filter((m) => !m.success);
    const errorRate = (errors.length / measurements.length) * 100;

    // Cache calculations
    const cacheHits = measurements.filter((m) => m.cacheHit === true);
    const cacheMisses = measurements.filter((m) => m.cacheHit === false);
    const hitRate = (cacheHits.length / (cacheHits.length + cacheMisses.length)) * 100;
    const avgHitTime =
      cacheHits.length > 0
        ? cacheHits.reduce((sum, m) => sum + m.responseTime, 0) / cacheHits.length
        : 0;
    const avgMissTime =
      cacheMisses.length > 0
        ? cacheMisses.reduce((sum, m) => sum + m.responseTime, 0) / cacheMisses.length
        : 0;

    // Memory calculations
    const memoryUsages = measurements
      .filter((m) => m.memoryUsage !== undefined)
      .map((m) => m.memoryUsage!);
    const avgMemory =
      memoryUsages.length > 0
        ? memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length
        : 0;
    const peakMemory = memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0;

    // Throughput calculations
    const timeSpan =
      measurements.length > 1
        ? (measurements[measurements.length - 1].timestamp - measurements[0].timestamp) / 1000
        : 1;
    const rps = measurements.length / timeSpan;

    return {
      responseTime: {
        mean,
        median,
        p95,
        p99,
        min,
        max,
        stdDev,
      },
      throughput: {
        rps,
        concurrent: 1, // This would need to be tracked separately
      },
      errors: {
        rate: errorRate,
        count: errors.length,
        total: measurements.length,
      },
      cache: {
        hitRate: isNaN(hitRate) ? 0 : hitRate,
        missRate: isNaN(hitRate) ? 0 : 100 - hitRate,
        avgHitTime,
        avgMissTime,
      },
      memory: {
        usage: avgMemory,
        peak: peakMemory,
        average: avgMemory,
      },
    };
  }

  /**
   * Validate response time targets
   */
  private validateResponseTime(metrics: PerformanceMetrics): TargetResult {
    const target = this.targets.responseTime.p95;
    const current = metrics.responseTime.p95;
    const passed = current <= target;
    const percentage = Math.min(100, (target / current) * 100);

    return {
      passed,
      current,
      target,
      percentage,
      trend: 'stable', // Would need historical data to determine trend
    };
  }

  /**
   * Validate throughput targets
   */
  private validateThroughput(metrics: PerformanceMetrics): TargetResult {
    const target = this.targets.throughput.rps;
    const current = metrics.throughput.rps;
    const passed = current >= target;
    const percentage = Math.min(100, (current / target) * 100);

    return {
      passed,
      current,
      target,
      percentage,
      trend: 'stable',
    };
  }

  /**
   * Validate error rate targets
   */
  private validateErrorRate(metrics: PerformanceMetrics): TargetResult {
    const target = this.targets.errorRate.max;
    const current = metrics.errors.rate;
    const passed = current <= target;
    const percentage = current === 0 ? 100 : Math.min(100, (target / current) * 100);

    return {
      passed,
      current,
      target,
      percentage,
      trend: 'stable',
    };
  }

  /**
   * Validate cache targets
   */
  private validateCache(metrics: PerformanceMetrics): TargetResult {
    const target = this.targets.cache.hitRate;
    const current = metrics.cache.hitRate;
    const passed = current >= target;
    const percentage = Math.min(100, (current / target) * 100);

    return {
      passed,
      current,
      target,
      percentage,
      trend: 'stable',
    };
  }

  /**
   * Validate memory targets
   */
  private validateMemory(metrics: PerformanceMetrics): TargetResult {
    const target = this.targets.memory.max;
    const current = metrics.memory.peak;
    const passed = current <= target;
    const percentage = current === 0 ? 100 : Math.min(100, (target / current) * 100);

    return {
      passed,
      current,
      target,
      percentage,
      trend: 'stable',
    };
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(results: TargetResult[]): number {
    const weights = [0.3, 0.2, 0.2, 0.15, 0.15]; // Response time has highest weight
    let totalScore = 0;

    results.forEach((result, index) => {
      const weight = weights[index] || 0.2;
      totalScore += result.percentage * weight;
    });

    return Math.round(totalScore);
  }

  /**
   * Detect performance regressions
   */
  private detectRegressions(metrics: PerformanceMetrics): RegressionResult[] {
    const regressions: RegressionResult[] = [];

    // This is a simplified regression detection
    // In practice, you'd use statistical methods and historical data

    // Check response time regression
    if (metrics.responseTime.p95 > this.targets.responseTime.p95 * 1.2) {
      regressions.push({
        type: 'response_time',
        severity: 'high',
        description: 'Response time has increased significantly',
        current: metrics.responseTime.p95,
        baseline: this.targets.responseTime.p95,
        change:
          ((metrics.responseTime.p95 - this.targets.responseTime.p95) /
            this.targets.responseTime.p95) *
          100,
        confidence: 0.8,
      });
    }

    // Check error rate regression
    if (metrics.errors.rate > this.targets.errorRate.max * 2) {
      regressions.push({
        type: 'error_rate',
        severity: 'critical',
        description: 'Error rate has increased dramatically',
        current: metrics.errors.rate,
        baseline: this.targets.errorRate.target,
        change:
          ((metrics.errors.rate - this.targets.errorRate.target) / this.targets.errorRate.target) *
          100,
        confidence: 0.9,
      });
    }

    return regressions;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetrics, results: TargetResult[]): string[] {
    const recommendations: string[] = [];

    // Response time recommendations
    if (!results[0].passed) {
      if (metrics.cache.hitRate < 80) {
        recommendations.push('Improve cache hit rate to reduce response times');
      }
      if (metrics.responseTime.stdDev > metrics.responseTime.mean * 0.5) {
        recommendations.push(
          'High response time variance detected - investigate inconsistent performance'
        );
      }
    }

    // Throughput recommendations
    if (!results[1].passed) {
      recommendations.push('Consider implementing request parallelization to improve throughput');
      recommendations.push('Review database query optimization and indexing');
    }

    // Error rate recommendations
    if (!results[2].passed) {
      recommendations.push('Investigate and fix sources of errors');
      recommendations.push('Implement better error handling and retry mechanisms');
    }

    // Cache recommendations
    if (!results[3].passed) {
      recommendations.push('Optimize cache strategy and increase cache size');
      recommendations.push('Review cache invalidation policies');
    }

    // Memory recommendations
    if (!results[4].passed) {
      recommendations.push('Optimize memory usage and implement garbage collection');
      recommendations.push('Review data structures for memory efficiency');
    }

    return recommendations;
  }

  /**
   * Compare current metrics with baseline
   */
  private compareWithBaseline(
    current: PerformanceMetrics,
    baseline: PerformanceMetrics
  ): { change: number; significant: boolean; confidence: number } {
    // Simplified comparison - in practice, you'd use statistical tests
    const responseTimeChange =
      ((current.responseTime.mean - baseline.responseTime.mean) / baseline.responseTime.mean) * 100;
    const throughputChange =
      ((current.throughput.rps - baseline.throughput.rps) / baseline.throughput.rps) * 100;

    // Overall change (weighted average)
    const overallChange = responseTimeChange * -0.5 + throughputChange * 0.5; // Negative for response time (lower is better)

    const significant = Math.abs(overallChange) > 5; // 5% threshold
    const confidence = Math.min(0.95, Math.abs(overallChange) / 20); // Confidence based on magnitude of change

    return {
      change: overallChange,
      significant,
      confidence,
    };
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Create empty validation result
   */
  private createEmptyValidationResult(): ValidationResult {
    const emptyResult: TargetResult = {
      passed: false,
      current: 0,
      target: 0,
      percentage: 0,
      trend: 'stable',
    };

    return {
      passed: false,
      targets: {
        responseTime: emptyResult,
        throughput: emptyResult,
        errorRate: emptyResult,
        cache: emptyResult,
        memory: emptyResult,
      },
      score: 0,
      recommendations: ['No performance data available'],
      regressions: [],
    };
  }

  /**
   * Create empty metrics
   */
  private createEmptyMetrics(): PerformanceMetrics {
    return {
      responseTime: {
        mean: 0,
        median: 0,
        p95: 0,
        p99: 0,
        min: 0,
        max: 0,
        stdDev: 0,
      },
      throughput: {
        rps: 0,
        concurrent: 0,
      },
      errors: {
        rate: 0,
        count: 0,
        total: 0,
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        avgHitTime: 0,
        avgMissTime: 0,
      },
      memory: {
        usage: 0,
        peak: 0,
        average: 0,
      },
    };
  }
}

/**
 * Default performance targets for complaint system
 */
export const defaultPerformanceTargets: PerformanceTargets = {
  responseTime: {
    p50: 200, // 200ms for 50th percentile
    p95: 500, // 500ms for 95th percentile
    p99: 1000, // 1s for 99th percentile
    max: 5000, // 5s maximum
  },
  throughput: {
    rps: 100, // 100 requests per second
    concurrent: 50, // 50 concurrent requests
  },
  errorRate: {
    max: 1, // 1% maximum error rate
    target: 0.1, // 0.1% target error rate
  },
  cache: {
    hitRate: 80, // 80% cache hit rate
    missPenalty: 100, // 100ms cache miss penalty
  },
  memory: {
    max: 100 * 1024 * 1024, // 100MB maximum
    target: 50 * 1024 * 1024, // 50MB target
  },
};

/**
 * Global performance validator instance
 */
export const globalPerformanceValidator = new PerformanceValidator(defaultPerformanceTargets);

/**
 * Utility functions for performance monitoring
 */

/**
 * Measure and record API call performance
 */
export async function measureApiCall<T>(
  operation: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  const startMemory = globalPerformanceValidator['getMemoryUsage']();

  try {
    const result = await apiCall();
    const endTime = Date.now();
    const endMemory = globalPerformanceValidator['getMemoryUsage']();

    globalPerformanceValidator.recordMeasurement({
      timestamp: startTime,
      operation,
      responseTime: endTime - startTime,
      success: true,
      memoryUsage: endMemory - startMemory,
      metadata,
    });

    return result;
  } catch (error) {
    const endTime = Date.now();
    const endMemory = globalPerformanceValidator['getMemoryUsage']();

    globalPerformanceValidator.recordMeasurement({
      timestamp: startTime,
      operation,
      responseTime: endTime - startTime,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      memoryUsage: endMemory - startMemory,
      metadata,
    });

    throw error;
  }
}

/**
 * Create performance monitoring wrapper for API functions
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    return measureApiCall(operationName, () => fn(...args));
  }) as T;
}

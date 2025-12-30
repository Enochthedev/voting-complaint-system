/**
 * Monitoring Wrapper - Integration Layer for API Monitoring
 *
 * Provides wrapper functions to integrate monitoring with all API calls:
 * - Automatic request tracing with unique identifiers
 * - Performance metrics collection
 * - Error logging and context capture
 * - Monitoring dashboard data endpoints
 */

import { apiMonitor } from './api-monitor';
import { performanceAlerting } from './performance-alerting';

export interface MonitoringConfig {
  enabled: boolean;
  collectMetrics: boolean;
  enableAlerting: boolean;
  traceRequests: boolean;
  logErrors: boolean;
  metadata?: Record<string, any>;
}

export interface ApiCallContext {
  endpoint: string;
  method: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Default monitoring configuration
 */
const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: true,
  collectMetrics: true,
  enableAlerting: true,
  traceRequests: true,
  logErrors: true,
};

/**
 * Global monitoring configuration
 */
let globalConfig: MonitoringConfig = { ...DEFAULT_CONFIG };

/**
 * Update global monitoring configuration
 */
export function updateMonitoringConfig(config: Partial<MonitoringConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get current monitoring configuration
 */
export function getMonitoringConfig(): MonitoringConfig {
  return { ...globalConfig };
}

/**
 * Wrap an API function with comprehensive monitoring
 */
export function withMonitoring<T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  context: ApiCallContext,
  config: Partial<MonitoringConfig> = {}
): (...args: T) => Promise<R> {
  const effectiveConfig = { ...globalConfig, ...config };

  return async (...args: T): Promise<R> => {
    // Skip monitoring if disabled
    if (!effectiveConfig.enabled) {
      return apiFunction(...args);
    }

    let requestId: string | undefined;
    let startTime: number | undefined;

    try {
      // Start request tracking
      if (effectiveConfig.collectMetrics || effectiveConfig.traceRequests) {
        requestId = apiMonitor.startRequest(context.endpoint, context.method, context.userId, {
          ...effectiveConfig.metadata,
          ...context.metadata,
        });
        startTime = Date.now();
      }

      // Execute the API function
      const result = await apiFunction(...args);

      // Record successful completion
      if (requestId && effectiveConfig.collectMetrics) {
        apiMonitor.endRequest(requestId, true);
      }

      return result;
    } catch (error) {
      // Record failed completion
      if (requestId && effectiveConfig.collectMetrics) {
        apiMonitor.endRequest(requestId, false, error as Error);
      }

      // Enhanced error logging
      if (effectiveConfig.logErrors) {
        console.error(`API Error [${requestId || 'unknown'}]:`, {
          endpoint: context.endpoint,
          method: context.method,
          userId: context.userId,
          duration: startTime ? Date.now() - startTime : undefined,
          error: {
            message: (error as Error).message,
            name: (error as Error).name,
            stack: (error as Error).stack,
          },
          args: args.length > 0 ? '[REDACTED]' : undefined, // Don't log sensitive data
          metadata: context.metadata,
        });
      }

      throw error;
    }
  };
}

/**
 * Simplified wrapper for quick integration
 */
export function monitorApiCall<T extends any[], R>(
  endpoint: string,
  method: string,
  apiFunction: (...args: T) => Promise<R>,
  userId?: string,
  metadata?: Record<string, any>
): (...args: T) => Promise<R> {
  return withMonitoring(apiFunction, { endpoint, method, userId, metadata });
}

/**
 * Decorator for class methods (if using TypeScript decorators)
 */
export function Monitor(endpoint: string, method: string = 'POST') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = withMonitoring(
      originalMethod,
      { endpoint, method },
      { metadata: { className: target.constructor.name, methodName: propertyKey } }
    );

    return descriptor;
  };
}

/**
 * Batch monitoring wrapper for multiple API calls
 */
export async function withBatchMonitoring<T>(
  operations: Array<{
    name: string;
    operation: () => Promise<T>;
    context?: Partial<ApiCallContext>;
  }>,
  batchContext?: Partial<ApiCallContext>
): Promise<Array<{ name: string; result?: T; error?: Error }>> {
  const batchId = `batch-${Date.now()}`;
  const results: Array<{ name: string; result?: T; error?: Error }> = [];

  for (const { name, operation, context } of operations) {
    const effectiveContext: ApiCallContext = {
      endpoint: context?.endpoint || batchContext?.endpoint || `batch/${name}`,
      method: context?.method || batchContext?.method || 'BATCH',
      userId: context?.userId || batchContext?.userId,
      metadata: {
        batchId,
        operationName: name,
        ...batchContext?.metadata,
        ...context?.metadata,
      },
    };

    try {
      const monitoredOperation = withMonitoring(operation, effectiveContext);
      const result = await monitoredOperation();
      results.push({ name, result });
    } catch (error) {
      results.push({ name, error: error as Error });
    }
  }

  return results;
}

/**
 * Create monitoring dashboard data endpoints
 */
export class MonitoringDashboard {
  /**
   * Get real-time monitoring statistics
   */
  static async getStats(timeRangeMs: number = 24 * 60 * 60 * 1000) {
    return apiMonitor.getDashboardData(timeRangeMs);
  }

  /**
   * Get endpoint-specific statistics
   */
  static async getEndpointStats(endpoint: string, method?: string, timeRangeMs?: number) {
    return apiMonitor.getEndpointStats(endpoint, method, timeRangeMs);
  }

  /**
   * Get recent alerts
   */
  static async getAlerts(timeRangeMs: number = 24 * 60 * 60 * 1000) {
    return {
      alerts: apiMonitor.getAlerts(timeRangeMs),
      stats: performanceAlerting.getAlertStats(timeRangeMs),
    };
  }

  /**
   * Get system health summary
   */
  static async getHealthSummary() {
    const stats = apiMonitor.getStats(60 * 60 * 1000); // Last hour
    const alerts = apiMonitor.getAlerts(60 * 60 * 1000);
    const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

    return {
      status: criticalAlerts.length > 0 ? 'critical' : alerts.length > 0 ? 'warning' : 'healthy',
      summary: {
        totalRequests: stats.totalRequests,
        successRate: stats.successRate,
        averageResponseTime: stats.averageDuration,
        activeAlerts: alerts.length,
        criticalAlerts: criticalAlerts.length,
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date(),
    };
  }

  /**
   * Export metrics for external analysis
   */
  static async exportMetrics(timeRangeMs?: number, format: 'json' | 'csv' = 'json') {
    const metrics = apiMonitor.exportMetrics(timeRangeMs);

    if (format === 'csv') {
      const headers = [
        'timestamp',
        'endpoint',
        'method',
        'duration',
        'success',
        'error',
        'requestId',
        'userId',
      ];
      const csvRows = [
        headers.join(','),
        ...metrics.map((m) =>
          [
            m.timestamp.toISOString(),
            m.endpoint,
            m.method,
            m.duration,
            m.success,
            m.error?.message || '',
            m.requestId,
            m.userId || '',
          ].join(',')
        ),
      ];
      return csvRows.join('\n');
    }

    return metrics;
  }

  /**
   * Get performance trends
   */
  static async getPerformanceTrends(
    timeRangeMs: number = 24 * 60 * 60 * 1000,
    bucketSize: number = 60 * 60 * 1000
  ) {
    const metrics = apiMonitor.exportMetrics(timeRangeMs);
    const now = Date.now();
    const buckets: Array<{
      timestamp: Date;
      requests: number;
      avgDuration: number;
      errorRate: number;
      successRate: number;
    }> = [];

    // Create time buckets
    for (let time = now - timeRangeMs; time < now; time += bucketSize) {
      const bucketStart = time;
      const bucketEnd = time + bucketSize;

      const bucketMetrics = metrics.filter((m) => {
        const metricTime = m.timestamp.getTime();
        return metricTime >= bucketStart && metricTime < bucketEnd;
      });

      if (bucketMetrics.length > 0) {
        const successfulRequests = bucketMetrics.filter((m) => m.success).length;
        const avgDuration =
          bucketMetrics.reduce((sum, m) => sum + m.duration, 0) / bucketMetrics.length;

        buckets.push({
          timestamp: new Date(bucketStart),
          requests: bucketMetrics.length,
          avgDuration,
          errorRate: (bucketMetrics.length - successfulRequests) / bucketMetrics.length,
          successRate: successfulRequests / bucketMetrics.length,
        });
      }
    }

    return buckets;
  }

  /**
   * Get metrics with filtering options (compatibility method)
   */
  static async getMetrics(options: { timeRange?: string; categories?: string[] }) {
    const timeRangeMs = this.parseTimeRange(options.timeRange || '1h');
    const stats = apiMonitor.getStats(timeRangeMs);
    const metrics = apiMonitor.exportMetrics(timeRangeMs);

    return {
      stats,
      metrics: metrics.slice(0, 100), // Limit to recent 100
      categories: options.categories || [],
      timeRange: options.timeRange,
    };
  }

  /**
   * Get error metrics (compatibility method)
   */
  static async getErrorMetrics(options: { timeRange?: string; groupBy?: string[] }) {
    const timeRangeMs = this.parseTimeRange(options.timeRange || '1h');
    const metrics = apiMonitor.exportMetrics(timeRangeMs);
    const errorMetrics = metrics.filter((m) => !m.success);

    const errorsByType: Record<string, number> = {};
    const errorsByEndpoint: Record<string, number> = {};

    errorMetrics.forEach((m) => {
      const errorType = m.error?.code || 'unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      errorsByEndpoint[m.endpoint] = (errorsByEndpoint[m.endpoint] || 0) + 1;
    });

    return {
      total: errorMetrics.length,
      byType: errorsByType,
      byEndpoint: errorsByEndpoint,
      recent: errorMetrics.slice(0, 10),
    };
  }

  /**
   * Get performance metrics (compatibility method)
   */
  static async getPerformanceMetrics(options: { timeRange?: string; percentiles?: number[] }) {
    const timeRangeMs = this.parseTimeRange(options.timeRange || '1h');
    const stats = apiMonitor.getStats(timeRangeMs);

    return {
      p50: stats.medianDuration,
      p95: stats.p95Duration,
      p99: stats.p99Duration,
      avg: stats.averageDuration,
      percentiles: options.percentiles || [50, 95, 99],
    };
  }

  /**
   * Configure dashboard (placeholder for compatibility)
   */
  static configureDashboard(config: any): void {
    console.log('Dashboard configured:', config.title);
    // TODO: Implement actual dashboard configuration storage
  }

  /**
   * Update dashboard data (placeholder for compatibility)
   */
  static updateDashboardData(data: any): void {
    // TODO: Implement actual dashboard data updates
  }

  /**
   * Record a metric (compatibility wrapper)
   */
  static recordMetric(config: any): void {
    // This is a placeholder - actual metrics are recorded via apiMonitor
    console.log('Metric recorded:', config.metric, config.value);
  }

  /**
   * Get recent metrics by name (compatibility method)
   */
  static getRecentMetrics(metricNames: string[]): Record<string, number> {
    const stats = apiMonitor.getStats(60 * 60 * 1000); // Last hour
    const result: Record<string, number> = {};

    metricNames.forEach((name) => {
      if (name === 'api_error_rate') {
        result[name] = 1 - stats.successRate;
      } else if (name === 'api_response_time_avg') {
        result[name] = stats.averageDuration;
      } else if (name === 'api_throughput_rpm') {
        result[name] = (stats.totalRequests / 60) * 60; // Requests per minute
      } else {
        result[name] = 0;
      }
    });

    return result;
  }

  /**
   * Get active dashboards count (placeholder)
   */
  static getActiveDashboards(): any[] {
    // TODO: Implement actual dashboard tracking
    return [];
  }

  /**
   * Get realtime metrics (compatibility method)
   */
  static async getRealtimeMetrics(options: { timeRange?: string }) {
    const timeRangeMs = this.parseTimeRange(options.timeRange || '5m');
    const metrics = apiMonitor.exportMetrics(timeRangeMs);
    const stats = apiMonitor.getStats(timeRangeMs);

    // Get metrics from the last 5 seconds for real-time view
    const recentMetrics = metrics.filter(
      (m) => Date.now() - m.timestamp.getTime() < 5000
    );

    return {
      currentThroughput: (recentMetrics.length / 5) * 1000, // Requests per second
      activeRequests: recentMetrics.length,
      recentRequests: recentMetrics.slice(0, 20),
      summary: {
        totalRequests: stats.totalRequests,
        successRate: stats.successRate,
        avgResponseTime: stats.averageDuration,
        errorRate: 1 - stats.successRate,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Refresh dashboard (compatibility method)
   */
  static async refreshDashboard(dashboardId?: string): Promise<void> {
    console.log('Refreshing dashboard:', dashboardId || 'all');
    // TODO: Implement actual dashboard refresh logic
  }

  /**
   * Record an error (compatibility method)
   */
  static recordError(config: {
    operation: string;
    category: string;
    error: Error;
    duration?: number;
    tags?: Record<string, any>;
    context?: Record<string, any>;
  }): void {
    console.error(`Error in ${config.category}/${config.operation}:`, config.error, {
      duration: config.duration,
      tags: config.tags,
      context: config.context,
    });
    // Errors are automatically recorded via apiMonitor when using withMonitoring wrapper
  }

  /**
   * Record a successful operation (compatibility method)
   */
  static recordSuccess(config: {
    operation: string;
    category: string;
    duration?: number;
    tags?: Record<string, any>;
    context?: Record<string, any>;
  }): void {
    // Success is automatically recorded via apiMonitor when using withMonitoring wrapper
    console.debug(`Success in ${config.category}/${config.operation}`, {
      duration: config.duration,
      tags: config.tags,
    });
  }

  /**
   * Parse time range string to milliseconds
   */
  private static parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/^(\d+)([smhd])$/);
    if (!match) return 60 * 60 * 1000; // Default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000;
    }
  }
}

/**
 * Initialize monitoring system
 */
export function initializeMonitoring(config?: Partial<MonitoringConfig>): void {
  if (config) {
    updateMonitoringConfig(config);
  }

  // Start performance alerting if enabled
  if (globalConfig.enableAlerting) {
    performanceAlerting.startMonitoring();
  }

  console.log('API Monitoring initialized', {
    config: globalConfig,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Cleanup monitoring resources
 */
export function cleanupMonitoring(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): void {
  apiMonitor.cleanup(olderThanMs);
  console.log(`Monitoring cleanup completed - removed data older than ${olderThanMs}ms`);
}

// Auto-initialize with default config
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  initializeMonitoring();
}

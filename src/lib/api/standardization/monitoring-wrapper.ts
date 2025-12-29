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

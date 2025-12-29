/**
 * API Monitor - Metrics Collection and Performance Monitoring
 *
 * Provides comprehensive monitoring capabilities for API calls including:
 * - Performance metrics (duration, success rates)
 * - Error logging with detailed context
 * - Metrics aggregation and statistics
 * - Request tracing with unique identifiers
 */

import { v4 as uuidv4 } from 'uuid';

export interface ApiMetric {
  id: string;
  endpoint: string;
  method: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  error?: {
    message: string;
    code?: string;
    stack?: string;
    context?: Record<string, any>;
  };
  requestId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ApiStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageDuration: number;
  medianDuration: number;
  p95Duration: number;
  p99Duration: number;
  errorsByType: Record<string, number>;
  requestsByEndpoint: Record<string, number>;
  slowestRequests: ApiMetric[];
}

export interface PerformanceAlert {
  id: string;
  type: 'response_time' | 'error_rate' | 'failure_spike';
  severity: 'warning' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: Date;
  endpoint?: string;
  diagnostics: Record<string, any>;
}

export class ApiMonitor {
  private metrics: ApiMetric[] = [];
  private maxMetricsHistory = 10000; // Keep last 10k metrics
  private alertThresholds = {
    responseTime: {
      warning: 2000, // 2 seconds
      critical: 5000, // 5 seconds
    },
    errorRate: {
      warning: 0.05, // 5%
      critical: 0.15, // 15%
    },
  };
  private alerts: PerformanceAlert[] = [];
  private maxAlertsHistory = 1000;

  /**
   * Record the start of an API call
   */
  startRequest(
    endpoint: string,
    method: string,
    userId?: string,
    metadata?: Record<string, any>
  ): string {
    const requestId = uuidv4();

    // Store request start time in a Map for tracking
    if (!this.requestStartTimes) {
      this.requestStartTimes = new Map();
    }

    this.requestStartTimes.set(requestId, {
      startTime: Date.now(),
      endpoint,
      method,
      userId,
      metadata,
    });

    return requestId;
  }

  private requestStartTimes = new Map<
    string,
    {
      startTime: number;
      endpoint: string;
      method: string;
      userId?: string;
      metadata?: Record<string, any>;
    }
  >();

  /**
   * Record the completion of an API call
   */
  endRequest(requestId: string, success: boolean, error?: Error): void {
    const requestInfo = this.requestStartTimes.get(requestId);
    if (!requestInfo) {
      console.warn(`ApiMonitor: No start time found for request ${requestId}`);
      return;
    }

    const duration = Date.now() - requestInfo.startTime;

    const metric: ApiMetric = {
      id: uuidv4(),
      endpoint: requestInfo.endpoint,
      method: requestInfo.method,
      duration,
      success,
      timestamp: new Date(),
      requestId,
      userId: requestInfo.userId,
      metadata: requestInfo.metadata,
    };

    if (error) {
      metric.error = {
        message: error.message,
        code: (error as any).code,
        stack: error.stack,
        context: {
          name: error.name,
          cause: (error as any).cause,
        },
      };
    }

    this.recordMetric(metric);
    this.requestStartTimes.delete(requestId);

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);
  }

  /**
   * Record a metric directly (for backward compatibility)
   */
  recordMetric(metric: ApiMetric): void {
    this.metrics.push(metric);

    // Maintain metrics history limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Log errors with detailed context
    if (!metric.success && metric.error) {
      console.error(`API Error [${metric.requestId}]:`, {
        endpoint: metric.endpoint,
        method: metric.method,
        duration: metric.duration,
        error: metric.error,
        userId: metric.userId,
        timestamp: metric.timestamp,
        metadata: metric.metadata,
      });
    }
  }

  /**
   * Get aggregated statistics for all metrics or filtered by time range
   */
  getStats(timeRangeMs?: number): ApiStats {
    const now = Date.now();
    const filteredMetrics = timeRangeMs
      ? this.metrics.filter((m) => now - m.timestamp.getTime() <= timeRangeMs)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        averageDuration: 0,
        medianDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorsByType: {},
        requestsByEndpoint: {},
        slowestRequests: [],
      };
    }

    const successfulRequests = filteredMetrics.filter((m) => m.success).length;
    const failedRequests = filteredMetrics.length - successfulRequests;
    const durations = filteredMetrics.map((m) => m.duration).sort((a, b) => a - b);

    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const medianIndex = Math.floor(durations.length * 0.5);

    // Group errors by type
    const errorsByType: Record<string, number> = {};
    filteredMetrics
      .filter((m) => !m.success && m.error)
      .forEach((m) => {
        const errorType = m.error?.code || m.error?.message || 'Unknown';
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      });

    // Group requests by endpoint
    const requestsByEndpoint: Record<string, number> = {};
    filteredMetrics.forEach((m) => {
      const key = `${m.method} ${m.endpoint}`;
      requestsByEndpoint[key] = (requestsByEndpoint[key] || 0) + 1;
    });

    // Get slowest requests (top 10)
    const slowestRequests = [...filteredMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalRequests: filteredMetrics.length,
      successfulRequests,
      failedRequests,
      successRate: successfulRequests / filteredMetrics.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      medianDuration: durations[medianIndex] || 0,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      errorsByType,
      requestsByEndpoint,
      slowestRequests,
    };
  }

  /**
   * Get statistics for a specific endpoint
   */
  getEndpointStats(endpoint: string, method?: string, timeRangeMs?: number): ApiStats {
    const now = Date.now();
    let filteredMetrics = this.metrics.filter((m) => m.endpoint === endpoint);

    if (method) {
      filteredMetrics = filteredMetrics.filter((m) => m.method === method);
    }

    if (timeRangeMs) {
      filteredMetrics = filteredMetrics.filter((m) => now - m.timestamp.getTime() <= timeRangeMs);
    }

    // Use the same stats calculation logic
    const tempMonitor = new ApiMonitor();
    tempMonitor.metrics = filteredMetrics;
    return tempMonitor.getStats();
  }

  /**
   * Check for performance alerts based on the latest metric
   */
  private checkPerformanceAlerts(metric: ApiMetric): void {
    const alerts: PerformanceAlert[] = [];

    // Check response time alerts
    if (metric.duration > this.alertThresholds.responseTime.critical) {
      alerts.push({
        id: uuidv4(),
        type: 'response_time',
        severity: 'critical',
        message: `Critical response time detected: ${metric.duration}ms`,
        threshold: this.alertThresholds.responseTime.critical,
        actualValue: metric.duration,
        timestamp: new Date(),
        endpoint: metric.endpoint,
        diagnostics: {
          requestId: metric.requestId,
          method: metric.method,
          userId: metric.userId,
          metadata: metric.metadata,
        },
      });
    } else if (metric.duration > this.alertThresholds.responseTime.warning) {
      alerts.push({
        id: uuidv4(),
        type: 'response_time',
        severity: 'warning',
        message: `Slow response time detected: ${metric.duration}ms`,
        threshold: this.alertThresholds.responseTime.warning,
        actualValue: metric.duration,
        timestamp: new Date(),
        endpoint: metric.endpoint,
        diagnostics: {
          requestId: metric.requestId,
          method: metric.method,
          userId: metric.userId,
          metadata: metric.metadata,
        },
      });
    }

    // Check error rate alerts (last 100 requests for this endpoint)
    const recentMetrics = this.metrics.filter((m) => m.endpoint === metric.endpoint).slice(-100);

    if (recentMetrics.length >= 10) {
      // Only check if we have enough data
      const errorRate = recentMetrics.filter((m) => !m.success).length / recentMetrics.length;

      if (errorRate > this.alertThresholds.errorRate.critical) {
        alerts.push({
          id: uuidv4(),
          type: 'error_rate',
          severity: 'critical',
          message: `Critical error rate detected: ${(errorRate * 100).toFixed(1)}%`,
          threshold: this.alertThresholds.errorRate.critical,
          actualValue: errorRate,
          timestamp: new Date(),
          endpoint: metric.endpoint,
          diagnostics: {
            recentRequests: recentMetrics.length,
            recentErrors: recentMetrics.filter((m) => !m.success).length,
            errorTypes: this.getErrorTypesFromMetrics(recentMetrics.filter((m) => !m.success)),
          },
        });
      } else if (errorRate > this.alertThresholds.errorRate.warning) {
        alerts.push({
          id: uuidv4(),
          type: 'error_rate',
          severity: 'warning',
          message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
          threshold: this.alertThresholds.errorRate.warning,
          actualValue: errorRate,
          timestamp: new Date(),
          endpoint: metric.endpoint,
          diagnostics: {
            recentRequests: recentMetrics.length,
            recentErrors: recentMetrics.filter((m) => !m.success).length,
            errorTypes: this.getErrorTypesFromMetrics(recentMetrics.filter((m) => !m.success)),
          },
        });
      }
    }

    // Store alerts
    this.alerts.push(...alerts);

    // Maintain alerts history limit
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertsHistory);
    }

    // Log alerts
    alerts.forEach((alert) => {
      const logLevel = alert.severity === 'critical' ? 'error' : 'warn';
      console[logLevel](`Performance Alert [${alert.id}]:`, {
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        endpoint: alert.endpoint,
        threshold: alert.threshold,
        actualValue: alert.actualValue,
        diagnostics: alert.diagnostics,
      });
    });
  }

  /**
   * Get error types from a list of failed metrics
   */
  private getErrorTypesFromMetrics(failedMetrics: ApiMetric[]): Record<string, number> {
    const errorTypes: Record<string, number> = {};
    failedMetrics.forEach((m) => {
      if (m.error) {
        const errorType = m.error.code || m.error.message || 'Unknown';
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      }
    });
    return errorTypes;
  }

  /**
   * Get recent alerts
   */
  getAlerts(timeRangeMs?: number): PerformanceAlert[] {
    if (!timeRangeMs) {
      return [...this.alerts];
    }

    const now = Date.now();
    return this.alerts.filter((alert) => now - alert.timestamp.getTime() <= timeRangeMs);
  }

  /**
   * Clear old metrics and alerts
   */
  cleanup(olderThanMs: number): void {
    const cutoff = Date.now() - olderThanMs;

    this.metrics = this.metrics.filter((m) => m.timestamp.getTime() > cutoff);
    this.alerts = this.alerts.filter((a) => a.timestamp.getTime() > cutoff);
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(timeRangeMs: number = 24 * 60 * 60 * 1000): {
    stats: ApiStats;
    recentAlerts: PerformanceAlert[];
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
      avgDuration: number;
      errorRate: number;
    }>;
  } {
    const stats = this.getStats(timeRangeMs);
    const recentAlerts = this.getAlerts(timeRangeMs);

    // Calculate top endpoints with their performance metrics
    const endpointMetrics = new Map<string, ApiMetric[]>();
    const now = Date.now();

    this.metrics
      .filter((m) => now - m.timestamp.getTime() <= timeRangeMs)
      .forEach((m) => {
        const key = `${m.method} ${m.endpoint}`;
        if (!endpointMetrics.has(key)) {
          endpointMetrics.set(key, []);
        }
        endpointMetrics.get(key)!.push(m);
      });

    const topEndpoints = Array.from(endpointMetrics.entries())
      .map(([endpoint, metrics]) => ({
        endpoint,
        requests: metrics.length,
        avgDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
        errorRate: metrics.filter((m) => !m.success).length / metrics.length,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      stats,
      recentAlerts,
      topEndpoints,
    };
  }

  /**
   * Update alert thresholds
   */
  updateAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(timeRangeMs?: number): ApiMetric[] {
    if (!timeRangeMs) {
      return [...this.metrics];
    }

    const now = Date.now();
    return this.metrics.filter((m) => now - m.timestamp.getTime() <= timeRangeMs);
  }
}

// Global singleton instance
export const apiMonitor = new ApiMonitor();

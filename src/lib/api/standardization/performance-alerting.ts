/**
 * Performance Alerting System
 *
 * Provides advanced alerting capabilities for API performance monitoring:
 * - Response time threshold monitoring
 * - Alert generation for performance degradation
 * - Diagnostic information collection
 * - Alert notification and escalation
 */

import { apiMonitor, type PerformanceAlert, type ApiMetric } from './api-monitor';

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    metric: 'response_time' | 'error_rate' | 'throughput';
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
    threshold: number;
    timeWindow: number; // milliseconds
    minSamples?: number; // minimum number of samples required
  };
  severity: 'info' | 'warning' | 'critical';
  endpoints?: string[]; // if empty, applies to all endpoints
  methods?: string[]; // if empty, applies to all methods
  cooldown: number; // milliseconds between alerts of same type
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'log' | 'email' | 'webhook' | 'slack';
  config: Record<string, any>;
}

export interface AlertContext {
  rule: AlertRule;
  triggeredBy: ApiMetric;
  diagnostics: {
    recentMetrics: ApiMetric[];
    aggregatedStats: {
      avgResponseTime: number;
      errorRate: number;
      throughput: number;
      p95ResponseTime: number;
      p99ResponseTime: number;
    };
    systemInfo: {
      timestamp: Date;
      memoryUsage?: NodeJS.MemoryUsage;
      uptime?: number;
    };
    relatedAlerts: PerformanceAlert[];
  };
}

export class PerformanceAlertingSystem {
  private rules: Map<string, AlertRule> = new Map();
  private lastAlertTimes: Map<string, number> = new Map();
  private alertHandlers: Map<
    string,
    (alert: PerformanceAlert, context: AlertContext) => Promise<void>
  > = new Map();

  constructor() {
    this.setupDefaultRules();
    this.setupDefaultHandlers();
  }

  /**
   * Setup default alerting rules
   */
  private setupDefaultRules(): void {
    // Critical response time rule
    this.addRule({
      id: 'critical-response-time',
      name: 'Critical Response Time',
      enabled: true,
      conditions: {
        metric: 'response_time',
        operator: 'gt',
        threshold: 5000, // 5 seconds
        timeWindow: 60000, // 1 minute
        minSamples: 1,
      },
      severity: 'critical',
      cooldown: 300000, // 5 minutes
      actions: [{ type: 'log', config: { level: 'error' } }],
    });

    // Warning response time rule
    this.addRule({
      id: 'warning-response-time',
      name: 'Slow Response Time',
      enabled: true,
      conditions: {
        metric: 'response_time',
        operator: 'gt',
        threshold: 2000, // 2 seconds
        timeWindow: 300000, // 5 minutes
        minSamples: 3,
      },
      severity: 'warning',
      cooldown: 600000, // 10 minutes
      actions: [{ type: 'log', config: { level: 'warn' } }],
    });

    // High error rate rule
    this.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      enabled: true,
      conditions: {
        metric: 'error_rate',
        operator: 'gt',
        threshold: 0.1, // 10%
        timeWindow: 300000, // 5 minutes
        minSamples: 10,
      },
      severity: 'critical',
      cooldown: 300000, // 5 minutes
      actions: [{ type: 'log', config: { level: 'error' } }],
    });

    // Low throughput rule
    this.addRule({
      id: 'low-throughput',
      name: 'Low Throughput',
      enabled: true,
      conditions: {
        metric: 'throughput',
        operator: 'lt',
        threshold: 0.1, // 0.1 requests per second
        timeWindow: 600000, // 10 minutes
        minSamples: 5,
      },
      severity: 'warning',
      cooldown: 1800000, // 30 minutes
      actions: [{ type: 'log', config: { level: 'warn' } }],
    });
  }

  /**
   * Setup default alert handlers
   */
  private setupDefaultHandlers(): void {
    // Log handler
    this.alertHandlers.set('log', async (alert: PerformanceAlert, context: AlertContext) => {
      const logLevel = context.rule.actions.find((a) => a.type === 'log')?.config?.level || 'info';
      const logMessage = {
        alert: {
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          endpoint: alert.endpoint,
          threshold: alert.threshold,
          actualValue: alert.actualValue,
        },
        rule: {
          id: context.rule.id,
          name: context.rule.name,
        },
        diagnostics: context.diagnostics,
      };

      console[logLevel as keyof Console](`Performance Alert: ${alert.message}`, logMessage);
    });
  }

  /**
   * Add a new alerting rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove an alerting rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Update an existing rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const existingRule = this.rules.get(ruleId);
    if (existingRule) {
      this.rules.set(ruleId, { ...existingRule, ...updates });
    }
  }

  /**
   * Get all rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Enable or disable a rule
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Check all rules against recent metrics and generate alerts
   */
  async checkAlerts(): Promise<PerformanceAlert[]> {
    const generatedAlerts: PerformanceAlert[] = [];
    const now = Date.now();

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      const lastAlertKey = `${rule.id}`;
      const lastAlertTime = this.lastAlertTimes.get(lastAlertKey) || 0;
      if (now - lastAlertTime < rule.cooldown) continue;

      try {
        const alert = await this.evaluateRule(rule);
        if (alert) {
          generatedAlerts.push(alert);
          this.lastAlertTimes.set(lastAlertKey, now);

          // Execute alert actions
          await this.executeAlertActions(alert, rule);
        }
      } catch (error) {
        console.error(`Error evaluating alert rule ${rule.id}:`, error);
      }
    }

    return generatedAlerts;
  }

  /**
   * Evaluate a single rule against recent metrics
   */
  private async evaluateRule(rule: AlertRule): Promise<PerformanceAlert | null> {
    const now = Date.now();
    const windowStart = now - rule.conditions.timeWindow;

    // Get metrics within the time window
    let recentMetrics = apiMonitor.exportMetrics(rule.conditions.timeWindow);

    // Filter by endpoints if specified
    if (rule.endpoints && rule.endpoints.length > 0) {
      recentMetrics = recentMetrics.filter((m) => rule.endpoints!.includes(m.endpoint));
    }

    // Filter by methods if specified
    if (rule.methods && rule.methods.length > 0) {
      recentMetrics = recentMetrics.filter((m) => rule.methods!.includes(m.method));
    }

    // Check minimum samples requirement
    if (rule.conditions.minSamples && recentMetrics.length < rule.conditions.minSamples) {
      return null;
    }

    // Calculate the metric value based on rule type
    let metricValue: number;
    let triggeringMetric: ApiMetric | undefined;

    switch (rule.conditions.metric) {
      case 'response_time':
        // Use P95 response time for threshold checking
        const durations = recentMetrics.map((m) => m.duration).sort((a, b) => a - b);
        const p95Index = Math.floor(durations.length * 0.95);
        metricValue = durations[p95Index] || 0;
        triggeringMetric = recentMetrics.find((m) => m.duration === metricValue);
        break;

      case 'error_rate':
        const totalRequests = recentMetrics.length;
        const failedRequests = recentMetrics.filter((m) => !m.success).length;
        metricValue = totalRequests > 0 ? failedRequests / totalRequests : 0;
        triggeringMetric = recentMetrics.find((m) => !m.success);
        break;

      case 'throughput':
        // Requests per second
        const timeWindowSeconds = rule.conditions.timeWindow / 1000;
        metricValue = recentMetrics.length / timeWindowSeconds;
        triggeringMetric = recentMetrics[0];
        break;

      default:
        return null;
    }

    // Check if condition is met
    const conditionMet = this.evaluateCondition(
      metricValue,
      rule.conditions.operator,
      rule.conditions.threshold
    );

    if (!conditionMet || !triggeringMetric) {
      return null;
    }

    // Generate alert
    const alert: PerformanceAlert = {
      id: `${rule.id}-${Date.now()}`,
      type:
        rule.conditions.metric === 'response_time'
          ? 'response_time'
          : rule.conditions.metric === 'error_rate'
            ? 'error_rate'
            : 'failure_spike',
      severity: rule.severity === 'critical' ? 'critical' : 'warning',
      message: this.generateAlertMessage(rule, metricValue),
      threshold: rule.conditions.threshold,
      actualValue: metricValue,
      timestamp: new Date(),
      endpoint: triggeringMetric.endpoint,
      diagnostics: await this.collectDiagnostics(rule, recentMetrics, triggeringMetric),
    };

    return alert;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      case 'eq':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, actualValue: number): string {
    const { metric, threshold, operator } = rule.conditions;

    let unit = '';
    let formattedValue = actualValue.toString();
    let formattedThreshold = threshold.toString();

    switch (metric) {
      case 'response_time':
        unit = 'ms';
        break;
      case 'error_rate':
        unit = '%';
        formattedValue = (actualValue * 100).toFixed(1);
        formattedThreshold = (threshold * 100).toFixed(1);
        break;
      case 'throughput':
        unit = 'req/s';
        formattedValue = actualValue.toFixed(2);
        formattedThreshold = threshold.toFixed(2);
        break;
    }

    const operatorText =
      {
        gt: 'exceeded',
        lt: 'below',
        gte: 'at or above',
        lte: 'at or below',
        eq: 'equals',
      }[operator] || 'compared to';

    return `${rule.name}: ${metric.replace('_', ' ')} ${operatorText} threshold (${formattedValue}${unit} vs ${formattedThreshold}${unit})`;
  }

  /**
   * Collect diagnostic information for an alert
   */
  private async collectDiagnostics(
    rule: AlertRule,
    recentMetrics: ApiMetric[],
    triggeringMetric: ApiMetric
  ): Promise<Record<string, any>> {
    // Calculate aggregated stats
    const durations = recentMetrics.map((m) => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    const failedRequests = recentMetrics.filter((m) => !m.success).length;
    const errorRate = recentMetrics.length > 0 ? failedRequests / recentMetrics.length : 0;

    const timeWindowSeconds = rule.conditions.timeWindow / 1000;
    const throughput = recentMetrics.length / timeWindowSeconds;

    // Get related alerts from the last hour
    const relatedAlerts = apiMonitor
      .getAlerts(60 * 60 * 1000)
      .filter((alert) => alert.endpoint === triggeringMetric.endpoint);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      timeWindow: rule.conditions.timeWindow,
      sampleCount: recentMetrics.length,
      triggeringRequest: {
        id: triggeringMetric.requestId,
        endpoint: triggeringMetric.endpoint,
        method: triggeringMetric.method,
        duration: triggeringMetric.duration,
        success: triggeringMetric.success,
        timestamp: triggeringMetric.timestamp,
        error: triggeringMetric.error,
      },
      aggregatedStats: {
        avgResponseTime:
          durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
        errorRate,
        throughput,
        p95ResponseTime: durations[p95Index] || 0,
        p99ResponseTime: durations[p99Index] || 0,
      },
      systemInfo: {
        timestamp: new Date(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
      recentErrors: recentMetrics
        .filter((m) => !m.success)
        .slice(-5) // Last 5 errors
        .map((m) => ({
          requestId: m.requestId,
          endpoint: m.endpoint,
          error: m.error,
          timestamp: m.timestamp,
        })),
      relatedAlertsCount: relatedAlerts.length,
    };
  }

  /**
   * Execute alert actions
   */
  private async executeAlertActions(alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    const context: AlertContext = {
      rule,
      triggeredBy:
        apiMonitor.exportMetrics().find((m) => m.endpoint === alert.endpoint) || ({} as ApiMetric),
      diagnostics: {
        recentMetrics: apiMonitor.exportMetrics(rule.conditions.timeWindow),
        aggregatedStats: alert.diagnostics.aggregatedStats || {
          avgResponseTime: 0,
          errorRate: 0,
          throughput: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
        },
        systemInfo: {
          timestamp: new Date(),
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        },
        relatedAlerts: apiMonitor.getAlerts(60 * 60 * 1000),
      },
    };

    for (const action of rule.actions) {
      try {
        const handler = this.alertHandlers.get(action.type);
        if (handler) {
          await handler(alert, context);
        } else {
          console.warn(`No handler found for alert action type: ${action.type}`);
        }
      } catch (error) {
        console.error(`Error executing alert action ${action.type}:`, error);
      }
    }
  }

  /**
   * Add a custom alert handler
   */
  addAlertHandler(
    type: string,
    handler: (alert: PerformanceAlert, context: AlertContext) => Promise<void>
  ): void {
    this.alertHandlers.set(type, handler);
  }

  /**
   * Start continuous monitoring (checks alerts every minute)
   */
  startMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        await this.checkAlerts();
      } catch (error) {
        console.error('Error during alert monitoring:', error);
      }
    }, intervalMs);
  }

  /**
   * Get alert statistics
   */
  getAlertStats(timeRangeMs: number = 24 * 60 * 60 * 1000): {
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByType: Record<string, number>;
    alertsByEndpoint: Record<string, number>;
    topAlertingEndpoints: Array<{ endpoint: string; count: number }>;
  } {
    const alerts = apiMonitor.getAlerts(timeRangeMs);

    const alertsBySeverity: Record<string, number> = {};
    const alertsByType: Record<string, number> = {};
    const alertsByEndpoint: Record<string, number> = {};

    alerts.forEach((alert) => {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
      if (alert.endpoint) {
        alertsByEndpoint[alert.endpoint] = (alertsByEndpoint[alert.endpoint] || 0) + 1;
      }
    });

    const topAlertingEndpoints = Object.entries(alertsByEndpoint)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalAlerts: alerts.length,
      alertsBySeverity,
      alertsByType,
      alertsByEndpoint,
      topAlertingEndpoints,
    };
  }
}

// Global singleton instance
export const performanceAlerting = new PerformanceAlertingSystem();
